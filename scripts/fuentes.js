const puppeteer = require('puppeteer');

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
    url: "https://www.elpoderbanilejo.com/v6/",
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
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
    
        const content = await page.content();
        const $ = cheerio.load(content);
    
        let fecha = $('dd.create > time').attr('datetime');
    
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
    url: "https://www.notisurbani.com",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0');
        await page.goto('https://www.notisurbani.com', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 4000));
        const enlaces = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('h2 a, h3 a, .post-title a, .entry-title a'));
          return links
            .map(el => el.href)
            .filter(href => href && (href.includes('baní') || href.includes('peravia')));
        });
        console.log(`✅ Notisur Baní: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error Notisur Baní: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        const fecha = $('time.entry-date').attr('datetime') ||
                      $('meta[property="article:published_time"]').attr('content') ||
                      null;
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
  {
    nombre: "Dominican Today",
    url: "https://dominicantoday.com",
    selector: "article .td-module-title a",
    base: "",
    filtrar: (titulo) => titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia'),
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