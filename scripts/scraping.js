const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const fuentes = require('./fuentes');

const normalizar = texto =>
  texto.toLowerCase().replace(/[^À-ſa-z0-9\s]/gi, '').replace(/\s+/g, ' ').trim();

const axiosInstancia = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  },
});

async function fetchConReintentos(url, intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    try {
      return await axiosInstancia.get(url);
    } catch (err) {
      if (i === intentos - 1) throw err;
      console.warn(`⚠️ Reintentando ${url} (intento ${i + 1}/${intentos})`);
      await new Promise(res => setTimeout(res, 1000));
    }
  }
}

async function extraerResumen(link) {
  try {
    const { data } = await fetchConReintentos(link, 2);
    const $ = cheerio.load(data);

    const parrafos = $('p').map((i, el) => $(el).text().trim()).get();
    const resumen = parrafos.find(p => p.length > 60);

    return resumen || '';
  } catch (e) {
    console.warn(`⚠️ No se pudo extraer resumen de: ${link} - Error: ${e.message}`);
    return '';
  }
}

async function obtenerFechaReal(fuente, link) {
  try {
    if (!fuente.obtenerFecha) {
      console.warn(`⚠️ Fuente ${fuente.nombre} no tiene función obtenerFecha`);
      return null;
    }
    const fecha = await fuente.obtenerFecha(link, cheerio, fetchConReintentos);
    if (!fecha) {
      console.warn(`⚠️ No se pudo extraer fecha de ${link} en ${fuente.nombre}`);
      return null;
    }
    // Estandarizar formato de fecha a YYYY-MM-DD
    const fechaParseada = new Date(fecha);
    if (isNaN(fechaParseada)) {
      console.warn(`⚠️ Fecha inválida en ${link} de ${fuente.nombre}: ${fecha}`);
      return null;
    }
    return fechaParseada.toISOString().split('T')[0];
  } catch (e) {
    console.error(`❌ Error al obtener fecha de ${link} en ${fuente.nombre}: ${e.message}`);
    return null;
  }
}

async function scrapearFuente(fuente) {
  const noticias = [];
  try {
    const { data } = await fetchConReintentos(fuente.url);
    const $ = cheerio.load(data);

    $(fuente.selector).each((i, el) => {
      const titulo = $(el).text().trim();
      let link = $(el).attr('href');

      if (!titulo || !link) return;

      if (fuente.base && link.startsWith('/')) {
        link = fuente.base + link;
      }

      if (fuente.filtrar(titulo, link)) {
        noticias.push({
          fuente: fuente.nombre,
          titulo,
          link,
          resumen: null,
          fecha: null,
        });
      }
    });

    console.log(`✅ ${fuente.nombre}: ${noticias.length} noticias encontradas`);
  } catch (e) {
    console.error(`❌ ${fuente.nombre}: ${e.message}`);
  }

  return noticias;
}

function filtrarYFormatear(noticias) {
  const unicas = new Map();

  noticias.forEach(n => {
    const clave = normalizar(n.titulo);
    if (!unicas.has(clave)) {
      unicas.set(clave, n);
    }
  });

  return Array.from(unicas.values());
}

async function agregarDatos(noticias) {
  for (const noticia of noticias) {
    console.log(`🧠 Generando resumen: ${noticia.titulo}`);
    noticia.resumen = await extraerResumen(noticia.link);
    noticia.fecha = await obtenerFechaReal(fuentes.find(f => f.nombre === noticia.fuente), noticia.link);
  }
}

function ordenarPorFecha(noticias) {
  return noticias.sort((a, b) => {
    const fechaA = a.fecha ? new Date(a.fecha) : new Date(0);
    const fechaB = b.fecha ? new Date(b.fecha) : new Date(0);
    return fechaB - fechaA;
  });
}

(async () => {
  console.log('🔍 Buscando noticias sobre Baní...\n');

  const resultados = await Promise.all(fuentes.map(fuente => scrapearFuente(fuente)));
  const todas = resultados.flat();
  const seleccionadas = filtrarYFormatear(todas);
  await agregarDatos(seleccionadas);
  const ordenadas = ordenarPorFecha(seleccionadas);

  fs.writeFileSync('noticias.json', JSON.stringify(ordenadas, null, 2));
  console.log(`\n📝 ${ordenadas.length} noticias guardadas en noticias.json`);
})();