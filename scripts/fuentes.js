const cheerio = require('cheerio');
module.exports = [
  {
    nombre: "CDN",
    url: "https://cdn.com.do/temas/bani/",
    selector: "article .entry-title a",
    base: "",
    filtrar: () => true,
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        const fecha = $('meta[property="article:published_time"]').attr('content') || null;
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error fecha ${link}: ${e.message}, usando actual`);
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: "El Poder Banilejo",
    url: "https://www.elpoderbanilejo.com/v6/index.php/bani",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0');
        await page.goto('https://www.elpoderbanilejo.com/v6/', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 4000));
        const enlaces = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('h2 a, h3 a, .post-title a, .entry-title a'));
          return links
            .map(el => el.href)
            .filter(href => href && (href.toLowerCase().includes('bani') || href.toLowerCase().includes('peravia')));
        });
        console.log(`✅ El Poder Banilejo: ${enlaces.length} noticias encontradas`);
        return enlaces;
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
        await page.setUserAgent('Mozilla/5.0');
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 3000));
        const content = await page.content();
        const $ = cheerio.load(content);
        let fecha = $('time[itemprop="dateCreated"]').attr('datetime')
          || $('time[itemprop="datePublished"]').attr('datetime')
          || $('meta[property="article:published_time"]').attr('content')
          || $('meta[name="pubdate"]').attr('content')
          || $('time').attr('datetime')
          || $('span.date').text()
          || null;
        if (!fecha) {
          const textoFecha = $('time').text().trim();
          if (textoFecha.match(/\d{1,2}\s+\w+\s+\d{4}/)) {
            fecha = textoFecha;
          }
        }
        if (!fecha) {
          console.warn(`⚠️ Fecha no encontrada en ${link}, usando fecha actual`);
          return new Date().toISOString().split('T')[0];
        }
        if (fecha.includes('T')) {
          fecha = fecha.split('T')[0];
        }
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual`);
        return new Date().toISOString().split('T')[0];
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
        await page.setUserAgent('Mozilla/5.0');
        await page.goto('https://www.notisurbani.com/index.php/locales', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 3000));
        const links = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('h2 a, h3 a, .post-title a, .entry-title a'))
            .map(el => el.href)
            .filter(link => link && (link.toLowerCase().includes('bani') || link.toLowerCase().includes('peravia')));
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
    await page.setUserAgent('Mozilla/5.0');
    await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('span.published', { timeout: 5000 }).catch(() => {});
    const content = await page.content();
    const $ = cheerio.load(content);

    // TITULO
    const titulo = $('h1').text().trim() ||
                   $('h2').first().text().trim() ||
                   link;

    // FECHA
    let fecha = null;
    const fechaTexto = $('span.published').text().trim();
    const matchFecha = fechaTexto.match(/Publicado:\s*(.+)/i);
    if (matchFecha) {
      const fechaLimpia = matchFecha[1].replace(/(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo),/i, '').trim();
      // Ej: "28 Junio 2015"
      const partes = fechaLimpia.split(' ');
      if (partes.length === 3) {
        const dia = partes[0];
        const mesEs = partes[1].toLowerCase();
        const anio = partes[2];
        const meses = {
          enero: 'January', febrero: 'February', marzo: 'March',
          abril: 'April', mayo: 'May', junio: 'June', julio: 'July',
          agosto: 'August', septiembre: 'September', octubre: 'October',
          noviembre: 'November', diciembre: 'December'
        };
        const mesEn = meses[mesEs] || mesEs;
        const fechaISO = new Date(`${dia} ${mesEn} ${anio}`);
        if (!isNaN(fechaISO)) {
          fecha = fechaISO.toISOString().split('T')[0];
        }
      }
    }
    if (!fecha) {
      fecha = new Date().toISOString().split('T')[0];
    }

    // IMAGEN
    const imagen = $('span img').attr('src') ||
                   $('meta[property="og:image"]').attr('content') ||
                   $('article img').first().attr('src') ||
                   null;

    // RESUMEN
    const resumen = $('span[style*="font-size"]').text().trim() ||
                    $('p').map((i, el) => $(el).text().trim()).get()
                      .find(p => p.length > 60 && !/compartir|síguenos/i.test(p)) || '';

    return { titulo, resumen, imagen, fecha };
  } catch (e) {
    console.warn(`⚠️ obtenerDatosNoticia Notisur error en ${link}: ${e.message}`);
    return { titulo: link, resumen: '', imagen: null, fecha: new Date().toISOString().split('T')[0] };
  } finally {
    if (page) await page.close().catch(() => {});
  }
},
  },
  {
    nombre: "Dominican Today",
    url: "https://dominicantoday.com",
    selector: "article .td-module-title a",
    base: "",
    filtrar: (titulo) => titulo.toLowerCase().includes('bani') || titulo.toLowerCase().includes('peravia'),
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        const fecha = $('meta[property="article:published_time"]').attr('content') || null;
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando actual`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error fecha ${link}: ${e.message}, usando actual`);
        return new Date().toISOString().split('T')[0];
      }
    },
  },
];