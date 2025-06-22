// scripts/scraping.js
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const hoy = new Date().toISOString().split('T')[0];

const filtrarYFormatear = (noticias) => {
  const unicas = new Map();
  noticias.forEach(noticia => {
    if (!unicas.has(noticia.titulo)) {
      unicas.set(noticia.titulo, noticia);
    }
  });
  return Array.from(unicas.values()).slice(0, 5);
};

// 1. Notisur Baní
async function scrapeNotisurBani() {
  const url = 'https://www.notisurbani.com';
  const noticias = [];
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $('.td-module-title a').each((i, el) => {
      const titulo = $(el).text().trim();
      const link = $(el).attr('href');
      if (titulo.toLowerCase().includes('baní')) {
        noticias.push({ fuente: 'Notisur Baní', titulo, link, resumen: '' });
      }
    });
  } catch (e) {
    console.error('❌ Notisur Baní:', e.message);
  }
  return noticias;
}

// 2. El Poder Banilejo
async function scrapeElPoderBanilejo() {
  const url = 'https://elpoderbanilejo.com';
  const noticias = [];
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $('h3.post-title a').each((i, el) => {
      const titulo = $(el).text().trim();
      const link = $(el).attr('href');
      if (titulo.toLowerCase().includes('baní')) {
        noticias.push({ fuente: 'El Poder Banilejo', titulo, link, resumen: '' });
      }
    });
  } catch (e) {
    console.error('❌ El Poder Banilejo:', e.message);
  }
  return noticias;
}

// 3. CDN Baní
async function scrapeCDN() {
  const url = 'https://cdn.com.do/temas/bani/';
  const noticias = [];
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $('article .entry-title a').each((i, el) => {
      const titulo = $(el).text().trim();
      const link = $(el).attr('href');
      noticias.push({ fuente: 'CDN', titulo, link, resumen: '' });
    });
  } catch (e) {
    console.error('❌ CDN:', e.message);
  }
  return noticias;
}

// 4. Peravia Vision
async function scrapePeraviaVision() {
  const url = 'https://peraviavision.tv';
  const noticias = [];
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $('a').each((i, el) => {
      const titulo = $(el).text().trim();
      const link = $(el).attr('href');
      if (titulo.toLowerCase().includes('baní')) {
        noticias.push({ fuente: 'Peravia Vision', titulo, link, resumen: '' });
      }
    });
  } catch (e) {
    console.error('❌ Peravia Vision:', e.message);
  }
  return noticias;
}

// 5. Listín Diario
async function scrapeListinDiario() {
  const url = 'https://listindiario.com';
  const noticias = [];
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $('a').each((i, el) => {
      const titulo = $(el).text().trim();
      const link = $(el).attr('href');
      if ((titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && link.startsWith('https://listindiario.com')) {
        noticias.push({ fuente: 'Listín Diario', titulo, link, resumen: '' });
      }
    });
  } catch (e) {
    console.error('❌ Listín Diario:', e.message);
  }
  return noticias;
}

// 6. Dominican Today
async function scrapeDominicanToday() {
  const url = 'https://dominicantoday.com';
  const noticias = [];
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $('a').each((i, el) => {
      const titulo = $(el).text().trim();
      const link = $(el).attr('href');
      if ((titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && link.startsWith('https://dominicantoday.com')) {
        noticias.push({ fuente: 'Dominican Today', titulo, link, resumen: '' });
      }
    });
  } catch (e) {
    console.error('❌ Dominican Today:', e.message);
  }
  return noticias;
}

// 7. Diario Libre
async function scrapeDiarioLibre() {
  const url = 'https://www.diariolibre.com/tags/bani-peravia/';
  const noticias = [];
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $('h2.titulo a, h3.titulo a').each((i, el) => {
      const titulo = $(el).text().trim();
      const link = $(el).attr('href');
      if (titulo && link) noticias.push({ fuente: 'Diario Libre', titulo, link, resumen: 'Noticia de Diario Libre.' });
    });
  } catch (e) {
    console.error('❌ Diario Libre:', e.message);
  }
  return noticias;
}

// 8. Prensa Latina
async function scrapePrensaLatina() {
  const url = 'https://www.prensa-latina.cu/etiqueta/bani/';
  const noticias = [];
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $('a').each((i, el) => {
      const titulo = $(el).text().trim();
      const link = $(el).attr('href');
      if ((titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && link.startsWith('http')) {
        noticias.push({ fuente: 'Prensa Latina', titulo, link, resumen: '' });
      }
    });
  } catch (e) {
    console.error('❌ Prensa Latina:', e.message);
  }
  return noticias;
}

// Ejecutar todas
(async () => {
  console.log('🔍 Buscando noticias sobre Baní...');
  const resultados = await Promise.all([
    scrapeNotisurBani(),
    scrapeElPoderBanilejo(),
    scrapeCDN(),
    scrapePeraviaVision(),
    scrapeListinDiario(),
    scrapeDominicanToday(),
    scrapeDiarioLibre(),
    scrapePrensaLatina()
  ]);

  const todas = resultados.flat();
  const seleccionadas = filtrarYFormatear(todas);
  fs.writeFileSync('noticias.json', JSON.stringify(seleccionadas, null, 2));
  console.log(`✅ ${seleccionadas.length} noticias guardadas en noticias.json`);
})();

const https = require('https');

function enviarDiscordMensaje() {
  const data = JSON.stringify({ content: "✅ mibani.net: Noticias actualizadas automáticamente." });
  const webhookUrl = "https://discord.com/api/webhooks/1386140245870907403/mc5-h1hdEZVHKvzyCQnxh6lLNpWbQjRHfCWZYDqIxSjZMuhwOHGm9ByLxXd690fJh8yo";
  const url = new URL(webhookUrl);

  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    }
  };

  const req = https.request(options, res => {
    if (res.statusCode === 204) {
      console.log("✅ Notificación enviada a Discord.");
    } else {
      console.error("❌ Error enviando a Discord:", res.statusCode);
    }
  });

  req.on('error', error => {
    console.error("❌ Error de conexión con Discord:", error);
  });

  req.write(data);
  req.end();
}

// Llamar después de completar scraping y guardar noticias.json
enviarDiscordMensaje();