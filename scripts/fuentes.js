// archivos: fuentes.js

module.exports = [
  {
    nombre: "CDN",
    url: "https://cdn.com.do/temas/bani/",
    selector: "article .entry-title a",
    base: "",
    filtrar: () => true,

    // Usa solo Axios + Cheerio (sin Puppeteer)
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        // Primero intenta meta estándar
        let fecha = $('meta[property="article:published_time"]').attr('content')
                 || $('meta[name="pubdate"]').attr('content')
                 || $('time[datetime]').attr('datetime')
                 || null;

        if (!fecha) {
          // fallback: texto visible (puede estar en español)
          const texto = $('time, .entry-date, .posted-on').first().text().trim();
          if (texto) fecha = texto;
        }

        // Normaliza a ISO (maneja meses en español si es texto)
        const iso = normalizarFecha(fecha);
        if (!iso) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual`);
          return hoyISO();
        }
        return iso;
      } catch (e) {
        console.warn(`⚠️ Error fecha ${link}: ${e.message}, usando actual`);
        return hoyISO();
      }
    },
  },

  {
    nombre: "El Poder Banilejo",
    url: "https://www.elpoderbanilejo.com/v6/index.php/bani",

    // Usa Puppeteer (reutiliza el browser externo)
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await endurecerPagina(page);
        await page.goto('https://www.elpoderbanilejo.com/v6/', {
          waitUntil: 'networkidle2',
          timeout: 60000
        });
        // pequeña espera para layouts dinámicos
        await page.waitForTimeout(3500);

        const enlaces = await page.evaluate(() => {
          const as = Array.from(document.querySelectorAll('h1 a, h2 a, h3 a, .post-title a, .entry-title a'));
          const wanted = as
            .map(el => el.href?.trim())
            .filter(href => href && /(bani|baní|peravia)/i.test(href));
          // quitar duplicados simples
          return Array.from(new Set(wanted));
        });

        console.log(`✅ El Poder Banilejo: ${enlaces.length} noticias encontradas`);
        return enlaces.slice(0, 10);
      } catch (e) {
        console.error(`❌ Error El Poder Banilejo: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },

    obtenerFecha: async (link, cheerio, fetchConReintentos, browser) => {
      let page;
      try {
        page = await browser.newPage();
        await endurecerPagina(page);
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(2000);

        const html = await page.content();
        const $ = cheerio.load(html);

        let fecha = $('time[itemprop="dateCreated"]').attr('datetime')
                 || $('time[itemprop="datePublished"]').attr('datetime')
                 || $('meta[property="article:published_time"]').attr('content')
                 || $('meta[name="pubdate"]').attr('content')
                 || $('time[datetime]').attr('datetime')
                 || $('span.date, .post-date, .published, time').first().text().trim()
                 || null;

        const iso = normalizarFecha(fecha);
        if (!iso) {
          console.warn(`⚠️ Fecha no encontrada/parseable en ${link}, usando fecha actual`);
          return hoyISO();
        }
        return iso;
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual`);
        return hoyISO();
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
  },

  {
    nombre: "Notisur Baní",
    url: "https://www.notisurbani.com/index.php/locales",

    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await endurecerPagina(page);
        await page.goto('https://www.notisurbani.com/index.php/locales', {
          waitUntil: 'networkidle2',
          timeout: 60000
        });
        await page.waitForTimeout(3000);

        const links = await page.evaluate(() => {
          const as = Array.from(document.querySelectorAll('h1 a, h2 a, h3 a, .post-title a, .entry-title a'));
          const wanted = as
            .map(el => el.href?.trim())
            .filter(href => href && /(bani|baní|peravia)/i.test(href));
          return Array.from(new Set(wanted));
        });

        console.log(`✅ Notisur Baní: ${links.length} noticias encontradas`);
        return links.slice(0, 10);
      } catch (e) {
        console.error(`❌ Error Notisur Baní: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },

    obtenerDatosNoticia: async (link, browser) => {
      let page;
      try {
        page = await browser.newPage();
        await endurecerPagina(page);
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Selector flexible; si no aparece, seguimos igual
        await page.waitForSelector('span.published, time, .post-date', { timeout: 5000 }).catch(() => {});
        const html = await page.content();
        const $ = cheerio.load(html);

        // TITULO
        const titulo = $('h1').text().trim()
                     || $('h2').first().text().trim()
                     || $('meta[property="og:title"]').attr('content')?.trim()
                     || link;

        // FECHA
        let fechaCruda =
          $('span.published').text().trim()
          || $('time[datetime]').attr('datetime')
          || $('meta[property="article:published_time"]').attr('content')
          || $('time, .post-date, .entry-date').first().text().trim()
          || '';

        // Ejemplos: “Publicado: 28 Junio 2015” o ISO
        fechaCruda = fechaCruda.replace(/^Publicado:\s*/i, '').trim();
        const fecha = normalizarFecha(fechaCruda) || hoyISO();

        // IMAGEN
        const imagen = $('span img').attr('src')
                   || $('meta[property="og:image"]').attr('content')
                   || $('article img').first().attr('src')
                   || null;

        // RESUMEN
        const resumen =
          $('span[style*="font-size"]').text().trim()
          || $('p').map((i, el) => $(el).text().trim()).get()
               .find(p => p.length > 60 && !/compartir|síguenos/i.test(p))
          || '';

        return { titulo, resumen, imagen, fecha };
      } catch (e) {
        console.warn(`⚠️ obtenerDatosNoticia Notisur error en ${link}: ${e.message}`);
        return { titulo: link, resumen: '', imagen: null, fecha: hoyISO() };
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
  },

  {
    nombre: "Manaclar Televisión",
    url: "https://manaclartelevision.com/categorias/locales/",
    selector: "article.post h3.entry-title a",
    base: "",
    filtrar: (titulo, link) => {
      return /ban[ií]|peravia/i.test(titulo) || /ban[ií]|peravia/i.test(link);
    },

    // Axios + Cheerio (sin Puppeteer) con parseo de fecha robusto
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);

        let fecha = $('meta[property="article:published_time"]').attr('content')
                 || $('time[datetime]').attr('datetime')
                 || $('time').first().text().trim()
                 || $('.post-date, .entry-date').first().text().trim()
                 || null;

        const iso = normalizarFecha(fecha);
        return iso || hoyISO();
      } catch (e) {
        console.warn(`⚠️ Error fecha Manaclar ${link}: ${e.message}`);
        return hoyISO();
      }
    },
  }
];

/* ================= Utilidades compartidas ================= */

// UA y endurecimiento de página para menos bloqueos y más estabilidad
async function endurecerPagina(page) {
  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  );
  await page.setBypassCSP(true);
  await page.setRequestInterception(false);
  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(30000);
  // Opcional: reducir huella
  try {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
  } catch {}
}

// Convierte diferentes formatos (ISO, “28 Junio 2015”, etc.) a YYYY-MM-DD
function normalizarFecha(fecha) {
  if (!fecha || typeof fecha !== 'string') return null;

  let f = fecha.trim();

  // Si viene ISO con tiempo
  if (/^\d{4}-\d{2}-\d{2}T/.test(f)) {
    const d = new Date(f);
    return isNaN(d) ? null : d.toISOString().split('T')[0];
  }

  // Si viene ISO solo fecha
  if (/^\d{4}-\d{2}-\d{2}$/.test(f)) {
    return f;
  }

  // Reemplazar meses en español por inglés para que Date() los entienda
  const meses = {
    enero: 'January', febrero: 'February', marzo: 'March',
    abril: 'April', mayo: 'May', junio: 'June', julio: 'July',
    agosto: 'August', septiembre: 'September', setiembre: 'September',
    octubre: 'October', noviembre: 'November', diciembre: 'December'
  };

  // “28 Junio 2015”, “28 de Junio de 2015”, etc.
  const mEsp = f.toLowerCase()
    .replace(/de\s+/g, ' ')
    .replace(/,\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const partes = mEsp.split(' ');
  // patrones comunes: [28, junio, 2015] | [junio, 28, 2015]
  if (partes.length >= 3) {
    // Detecta si el mes está en posición 1 (día mes año) o 0 (mes día año)
    const idxMes = Object.keys(meses).indexOf(partes[1]);
    const idxMesAlt = Object.keys(meses).indexOf(partes[0]);

    let cand = null;
    if (idxMes !== -1) {
      const dia = partes[0].replace(/\D/g, '');
      const mesEn = meses[partes[1]];
      const anio = partes[2].replace(/\D/g, '');
      cand = `${dia} ${mesEn} ${anio}`;
    } else if (idxMesAlt !== -1) {
      const mesEn = meses[partes[0]];
      const dia = partes[1].replace(/\D/g, '');
      const anio = partes[2].replace(/\D/g, '');
      cand = `${dia} ${mesEn} ${anio}`;
    }

    if (cand) {
      const d = new Date(cand);
      if (!isNaN(d)) return d.toISOString().split('T')[0];
    }
  }

  // Último intento: dejar que Date() parsee (si ya viene en inglés)
  const d = new Date(f);
  return isNaN(d) ? null : d.toISOString().split('T')[0];
}

function hoyISO() {
  return new Date().toISOString().split('T')[0];
}