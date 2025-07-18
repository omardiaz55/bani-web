const pLimit = require('p-limit');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const puppeteer = require('puppeteer');
const fuentes = require('./fuentes');
const path = require('path');

const normalizar = texto =>
  texto.toLowerCase().replace(/[^À-ſa-z0-9\s]/gi, '').replace(/\s+/g, ' ').trim();

const axiosInstancia = axios.create({
  timeout: 15000,
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
    const parrafos = $('p, .entry-content p, .post-content p')
      .map((i, el) => $(el).text().trim())
      .get();
    const resumen = parrafos.find(p =>
      p.length > 60 && !/compartir|síguenos|related/i.test(p)
    );
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

async function scrapearFuente(fuente, browser) {
  const noticias = [];
  try {
    // Obtener enlaces
    let enlaces = [];
    if (fuente.obtenerEnlaces) {
      enlaces = await fuente.obtenerEnlaces(browser);
    } else {
      const { data } = await fetchConReintentos(fuente.url);
      const $ = cheerio.load(data);
      enlaces = $(fuente.selector)
        .map((i, el) => {
          const titulo = $(el).text().trim();
          let link = $(el).attr('href');
          if (!titulo || !link) {
            console.warn(`⚠️ Enlace inválido en ${fuente.nombre}: título=${titulo}, link=${link}`);
            return null;
          }
          if (fuente.base && link.startsWith('/')) {
            link = fuente.base + link;
          }
          return fuente.filtrar(titulo, link) ? link : null;
        })
        .get()
        .filter(link =>
          link &&
          !link.includes('facebook.com') &&
          !link.includes('twitter.com') &&
          !link.includes('instagram.com') &&
          !link.includes('youtube.com')
        );
    }

    enlaces = enlaces.slice(0, 10);
    console.log(`✅ ${fuente.nombre}: ${enlaces.length} noticias encontradas`);

    for (const link of enlaces) {
  const noticia = {
    fuente: fuente.nombre,
    titulo: null,
    link: typeof link === 'string' ? link : link.link,
    resumen: null,
    fecha: null,
    imagen: null
  };

  if (typeof link !== 'string') {
    noticia.titulo = link.titulo;
  }

      // Obtener título, resumen e imagen
      if (!fuente.obtenerDatosNoticia) {
        try {
          const { data } = await fetchConReintentos(link);
          const $ = cheerio.load(data);

            noticia.titulo =
              $('h1, .post-title, .entry-title, article header h1').first().text().trim() ||
              $('meta[property="og:title"]').attr('content')?.trim() ||
              link;
          // Validación reforzada
          if (!noticia.titulo || noticia.titulo === link) {
            console.warn(`⚠️ No se encontró título válido en ${link}, se usará el propio enlace como título.`);
            noticia.titulo = link;
          }

          noticia.resumen = await extraerResumen(link);

          noticia.imagen =
            $('figure.post-thumbnail img').attr('src') ||  // imagen destacada real
            $('meta[property="og:image"]').attr('content') ||
            $('article img').first().attr('src') ||
            null;

        } catch (e) {
          console.warn(`⚠️ Error al obtener título/imagen de ${link}: ${e.message}`);
          noticia.titulo = link;
        }
      } else {
        const datos = await fuente.obtenerDatosNoticia(link, browser);
        noticia.titulo = datos.titulo;
        noticia.resumen = datos.resumen;
        noticia.fecha = datos.fecha;
        noticia.imagen = datos.imagen || null;
      }

      if (!noticia.fecha) {
        noticia.fecha = await obtenerFechaReal(fuente, link, browser);
      }

      // recortar resumen a 300 caracteres
if (noticia.resumen) {
  noticia.resumen = noticia.resumen.length > 300
    ? noticia.resumen.slice(0, 300) + "..."
    : noticia.resumen;
}

noticias.push(noticia);

      console.log(`🧠 Generando datos para: ${noticia.titulo} [imagen: ${noticia.imagen || 'sin imagen'}]`);

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (e) {
    console.error(`❌ Error en ${fuente.nombre}: ${e.message}`);
  }
  return noticias;
}

function filtrarYFormatear(noticias) {
  const unicas = new Map();
  noticias.forEach(n => {
    if (n.titulo === n.link) {
      console.warn(`⚠️ Noticia descartada porque el título es igual al link: ${n.link}`);
    }
    const clave = normalizar(n.titulo);
    if (!unicas.has(clave) && n.titulo !== 'Sin título' && n.titulo !== n.link) {
      unicas.set(clave, n);
    }
  });
  return Array.from(unicas.values());
}

async function main() {
  console.log('🔍 Buscando noticias sobre Baní...\n');
  const resultados = [];
  const isLinux = process.platform === 'linux';

  const fuentesConPuppeteer = fuentes.filter(f => typeof f.obtenerEnlaces === 'function');
  const fuentesConAxios = fuentes.filter(f => !f.obtenerEnlaces);

  let browser = null;
  if (fuentesConPuppeteer.length > 0) {
    browser = await puppeteer.launch({
      executablePath: isLinux ? '/usr/bin/chromium-browser' : undefined,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  const limit = pLimit(3);

  const tareasAxios = fuentesConAxios.map(fuente =>
    limit(() => scrapearFuente(fuente, null))
  );

  const tareasPuppeteer = fuentesConPuppeteer.map(fuente =>
    limit(() => scrapearFuente(fuente, browser))
  );

  const resultadosFuente = await Promise.allSettled([
    ...tareasAxios,
    ...tareasPuppeteer,
  ]);

  for (const resultado of resultadosFuente) {
    if (resultado.status === 'fulfilled') {
      resultados.push(...resultado.value);
    } else {
      console.error(`❌ Error en fuente: ${resultado.reason}`);
    }
  }

  if (browser) await browser.close();

  const seleccionadas = filtrarYFormatear(resultados);

  const ordenadas = seleccionadas.sort((a, b) => {
    const fechaA = a.fecha ? new Date(a.fecha) : new Date(0);
    const fechaB = b.fecha ? new Date(b.fecha) : new Date(0);
    return fechaB - fechaA;
  });

  try {
    fs.writeFileSync(
      path.join(__dirname, '../noticias.json'),
      JSON.stringify(ordenadas, null, 2)
    );
    console.log(`\n📝 ${ordenadas.length} noticias guardadas en noticias.json`);
  } catch (e) {
    console.error(`❌ Error escribiendo noticias.json: ${e.message}`);
  }
}

main().catch(err => {
  console.error(`❌ Error en el proceso principal: ${err.message}`);
  process.exit(1);
});