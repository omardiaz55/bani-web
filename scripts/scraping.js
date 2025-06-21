const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const MAX_NOTICIAS = 5;

// 🔹 Utilidad para normalizar y evitar duplicados
function limpiarTitulos(noticias) {
  const vistas = new Set();
  return noticias.filter(n => {
    const clave = n.titulo.trim().toLowerCase();
    if (vistas.has(clave)) return false;
    vistas.add(clave);
    return true;
  });
}

// 🔸 1. Notisur Baní
async function scrapeNotisurBani() {
  const url = 'https://www.notisurbani.com';
  const noticias = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('h3.entry-title a').each((i, el) => {
      const titulo = $(el).text().trim();
      const link = $(el).attr('href');
      if ((titulo.includes('Baní') || titulo.includes('Peravia')) && link) {
        noticias.push({ fuente: 'Notisur Baní', titulo, link, resumen: 'Noticia de Notisur Baní.' });
      }
    });
  } catch (err) {
    console.error('❌ Notisur Baní:', err.message);
  }

  return noticias;
}

// 🔸 2. El Poder Banilejo
async function scrapeElPoderBanilejo() {
  const url = 'https://elpoderbanilejo.com';
  const noticias = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('h3.entry-title a').each((i, el) => {
      const titulo = $(el).text().trim();
      const link = $(el).attr('href');
      if ((titulo.includes('Baní') || titulo.includes('Peravia')) && link) {
        noticias.push({ fuente: 'El Poder Banilejo', titulo, link, resumen: 'Noticia de El Poder Banilejo.' });
      }
    });
  } catch (err) {
    console.error('❌ El Poder Banilejo:', err.message);
  }

  return noticias;
}

// 🔸 3. CDN – sección Baní
async function scrapeCDN() {
  const url = 'https://cdn.com.do/temas/bani/';
  const noticias = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('.jeg_post_title a').each((i, el) => {
      const titulo = $(el).text().trim();
      const link = $(el).attr('href');
      if (titulo && link) {
        noticias.push({ fuente: 'CDN', titulo, link, resumen: 'Noticia de CDN.' });
      }
    });
  } catch (err) {
    console.error('❌ CDN:', err.message);
  }

  return noticias;
}

// 🔸 4. Peravia Visión
async function scrapePeraviaVision() {
  const url = 'https://peraviavision.tv';
  const noticias = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('h3.post-title a').each((i, el) => {
      const titulo = $(el).text().trim();
      const link = $(el).attr('href');
      if ((titulo.includes('Baní') || titulo.includes('Peravia')) && link) {
        noticias.push({ fuente: 'Peravia Visión', titulo, link, resumen: 'Noticia de Peravia Visión.' });
      }
    });
  } catch (err) {
    console.error('❌ Peravia Visión:', err.message);
  }

  return noticias;
}

// 🔸 6. Listín Diario
async function scrapeListinDiario() {
  const url = 'https://listindiario.com';
  const noticias = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('a:contains("Baní"), a:contains("Peravia")').each((i, el) => {
      const titulo = $(el).text().trim();
      const href = $(el).attr('href');
      if (titulo && href) {
        const link = href.startsWith('http') ? href : url + href;
        noticias.push({ fuente: 'Listín Diario', titulo, link, resumen: 'Noticia de Listín Diario.' });
      }
    });
  } catch (err) {
    console.error('❌ Listín Diario:', err.message);
  }

  return noticias;
}

// 🔸 7. Dominican Today
async function scrapeDominicanToday() {
  const url = 'https://dominicantoday.com';
  const noticias = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('a:contains("Baní"), a:contains("Peravia")').each((i, el) => {
      const titulo = $(el).text().trim();
      const href = $(el).attr('href');
      if (titulo && href) {
        const link = href.startsWith('http') ? href : url + href;
        noticias.push({ fuente: 'Dominican Today', titulo, link, resumen: 'English news from Dominican Today.' });
      }
    });
  } catch (err) {
    console.error('❌ Dominican Today:', err.message);
  }

  return noticias;
}

// 🔚 Ejecutar scraping conjunto
async function scrapeNoticiasBani() {
  console.log('🔍 Buscando noticias sobre Baní...');

  const resultados = await Promise.all([
    scrapeNotisurBani(),
    scrapeElPoderBanilejo(),
    scrapeCDN(),
    scrapePeraviaVision(),
    scrapeListinDiario(),
    scrapeDominicanToday()
  ]);

  const todas = limpiarTitulos(resultados.flat());
  const seleccionadas = todas.slice(0, MAX_NOTICIAS);

  fs.writeFileSync('noticias.json', JSON.stringify(seleccionadas, null, 2));
  console.log(`✅ ${seleccionadas.length} noticias guardadas en noticias.json`);
}

scrapeNoticiasBani();
