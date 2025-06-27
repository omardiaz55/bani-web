const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const puppeteer = require('puppeteer');
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

async function obtenerFechaReal(fuente, link, browser) {
  try {
    if (!fuente.obtenerFecha) {
      console.warn(`⚠️ Fuente ${fuente.nombre} no tiene función obtenerFecha`);
      return null;
    }
    const fecha = await fuente.obtenerFecha(link, cheerio, fetchConReintentos, browser);
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
  let browser;
  try {
    // Inicializar navegador para fuentes que usan Puppeteer
    if (fuente.nombre === 'Peravia Vision' || fuente.nombre === 'Acento' || fuente.nombre === 'Manaclar Televisión') {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    // Obtener enlaces
    let enlaces = [];
    if (fuente.obtenerEnlaces) {
      // Usar función personalizada para fuentes como Manaclar Televisión
      enlaces = await fuente.obtenerEnlaces(browser);
    } else {
      // Usar fetch y Cheerio para fuentes estándar
      const { data } = await fetchConReintentos(fuente.url);
      const $ = cheerio.load(data);
      enlaces = $(fuente.selector)
        .map((i, el) => {
          const titulo = $(el).text().trim();
          let link = $(el).attr('href');
          if (!titulo || !link) return null;
          if (fuente.base && link.startsWith('/')) {
            link = fuente.base + link;
          }
          return fuente.filtrar(titulo, link) ? link : null;
        })
        .get()
        .filter(link => link);
    }
    console.log(`✅ ${fuente.nombre}: ${enlaces.length} noticias encontradas`);

    // Procesar cada enlace
    for (const link of enlaces) {
      const noticia = {
        fuente: fuente.nombre,
        titulo: link, // Título provisional, se actualizará si es posible
        link,
        resumen: null,
        fecha: null,
      };

      // Obtener título y resumen si no hay función personalizada
      if (!fuente.obtenerDatosNoticia) {
        try {
          const { data } = await fetchConReintentos(link);
          const $ = cheerio.load(data);
          noticia.titulo = $('h1, .post-title, .entry-title').first().text().trim() || link;
          noticia.resumen = await extraerResumen(link);
        } catch (e) {
          console.warn(`⚠️ Error al obtener título de ${link}: ${e.message}`);
          noticia.titulo = link;
        }
      } else {
        // Usar función personalizada para obtener datos (ej. Manaclar Televisión)
        const datos = await fuente.obtenerDatosNoticia(link, browser);
        noticia.titulo = datos.titulo;
        noticia.resumen = datos.resumen;
        noticia.fecha = datos.fecha; // Fecha provisional, se actualizará
      }

      // Obtener fecha
      noticia.fecha = await obtenerFechaReal(fuente, link, browser);
      noticias.push(noticia);
      console.log(`🧠 Generando datos para: ${noticia.titulo}`);
    }
  } catch (e) {
    console.error(`❌ Error en ${fuente.nombre}: ${e.message}`);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
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

async function main() {
  console.log('🔍 Buscando noticias sobre Baní...\n');
  const resultados = [];
  // Procesar fuentes secuencialmente para evitar sobrecarga
  for (const fuente of fuentes) {
    const noticias = await scrapearFuente(fuente);
    resultados.push(...noticias);
  }
  const seleccionadas = filtrarYFormatear(resultados);
  const ordenadas = seleccionadas.sort((a, b) => {
    const fechaA = a.fecha ? new Date(a.fecha) : new Date(0);
    const fechaB = b.fecha ? new Date(b.fecha) : new Date(0);
    return fechaB - fechaA;
  });
  fs.writeFileSync('noticias.json', JSON.stringify(ordenadas, null, 2));
  console.log(`\n📝 ${ordenadas.length} noticias guardadas en noticias.json`);
}

main().catch(err => {
  console.error(`❌ Error en el proceso principal: ${err.message}`);
  process.exit(1);
});