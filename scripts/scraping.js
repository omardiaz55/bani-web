const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const fuentes = require('./fuentes');

const normalizar = texto =>
  texto.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();

const axiosInstancia = axios.create({
  timeout: 10000,
  headers: { 'User-Agent': 'MiBaniBot/1.0 (+https://mibani.net)' },
});

async function fetchConReintentos(url, intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    try {
      return await axiosInstancia.get(url);
    } catch (err) {
      if (i === intentos - 1) throw err;
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
    console.warn(`⚠️ No se pudo extraer resumen de: ${link}`);
    return '';
  }
}

async function obtenerFechaReal(fuente, link) {
  try {
    if (!fuente.obtenerFecha) return null;
    const fecha = await fuente.obtenerFecha(link, fetchConReintentos);
    return fecha || null;
  } catch {
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
          fecha: null, // Se actualizará luego
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
    noticia.fecha = await obtenerFechaReal(fuentes.find(f => f.nombre === noticia.fuente), noticia.link) || new Date().toISOString().split('T')[0];
  }
}

function ordenarPorFecha(noticias) {
  return noticias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
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
