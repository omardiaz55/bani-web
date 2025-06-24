const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const fuentes = require('./fuentes');

const hoy = new Date().toISOString().split('T')[0];

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
    const resumen = parrafos.find(p => p.length > 60); // Omitir textos muy cortos

    return resumen || '';
  } catch (e) {
    console.warn(`⚠️ No se pudo extraer resumen de: ${link}`);
    return '';
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
          resumen: null, // Se agregará más tarde
          fecha: hoy
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

async function agregarResumenes(noticias) {
  for (const noticia of noticias) {
    console.log(`🧠 Generando resumen: ${noticia.titulo}`);
    noticia.resumen = await extraerResumen(noticia.link);
  }
}

(async () => {
  console.log('🔍 Buscando noticias sobre Baní...\n');

  const resultados = await Promise.all(fuentes.map(fuente => scrapearFuente(fuente)));
  const todas = resultados.flat();
  const seleccionadas = filtrarYFormatear(todas);
  await agregarResumenes(seleccionadas);

  fs.writeFileSync('noticias.json', JSON.stringify(seleccionadas, null, 2));
  console.log(`\n📝 ${seleccionadas.length} noticias guardadas en noticias.json`);
})();
