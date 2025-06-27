const puppeteer = require('puppeteer');
const fs = require('fs');

module.exports = [
  {
    nombre: "Notisur Baní",
    url: "https://www.notisurbani.com",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://www.notisurbani.com', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com'));
        });
        console.log(`✅ Notisur Baní: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de Notisur Baní: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos, browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        const content = await page.content();
        const $ = cheerio.load(content);
        let fecha = $('time.entry-date, .post-date, .published').attr('datetime') || $('meta[property="article:published_time"]').attr('content') || null;
        if (!fecha) {
          const match = link.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
          if (match) fecha = `${match[1]}-${match[2]}-${match[3]}`;
        }
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      } finally {
        if (page) await page.close().catch(() => {});
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
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://www.elpoderbanilejo.com/v6/', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com'));
        });
        console.log(`✅ El Poder Banilejo: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de El Poder Banilejo: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos, browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        const content = await page.content();
        const $ = cheerio.load(content);
        let fecha = $('abbr.published, time.entry-date, .post-date').attr('title') || $('meta[property="article:published_time"]').attr('content') || null;
        if (!fecha) {
          const match = link.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
          if (match) fecha = `${match[1]}-${match[2]}-${match[3]}`;
        }
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
  },
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
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: "Listín Diario",
    url: "https://listindiario.com/la-republica",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://listindiario.com/la-republica', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href && href.startsWith('https://listindiario.com') ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com'));
        });
        console.log(`✅ Listín Diario: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de Listín Diario: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        const fecha = $('meta[property="article:published_time"]').attr('content') || null;
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: "Peravia Vision",
    url: "https://peraviavision.tv",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://peraviavision.tv', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com'));
        });
        console.log(`✅ Peravia Vision: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de Peravia Vision: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos, browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        const content = await page.content();
        const $ = cheerio.load(content);
        let fecha = $('.elementor-post-date').text().trim();
        if (fecha.match(/^\d{1,2}\s\w+,\s\d{4}$/)) {
          const meses = {
            'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
            'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
            'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
          };
          const [day, mes, year] = fecha.split(/[\s,]+/);
          fecha = `${year}-${meses[mes.toLowerCase()]}-${day.padStart(2, '0')}`;
        }
        if (!fecha || isNaN(new Date(fecha))) {
          const match = link.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
          if (match) fecha = `${match[1]}-${match[2]}-${match[3]}`;
        }
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
  },
  {
    nombre: "Diario Libre",
    url: "https://www.diariolibre.com/actualidad/sucesos/",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://www.diariolibre.com/actualidad/sucesos/', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href && href.startsWith('https://www.diariolibre.com') ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com'));
        });
        console.log(`✅ Diario Libre: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de Diario Libre: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        const fecha = $('time').attr('datetime') || $('meta[property="article:published_time"]').attr('content') || null;
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: "Dominican Today",
    url: "https://dominicantoday.com",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://dominicantoday.com', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href && href.startsWith('https://dominicantoday.com') ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com'));
        });
        console.log(`✅ Dominican Today: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de Dominican Today: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        const fecha = $('meta[property="article:published_time"]').attr('content') || null;
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: "Acento",
    url: "https://acento.com.do/",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://acento.com.do/', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href && href.startsWith('https://acento.com.do') ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com') && !href.includes('acentotv') && !href.includes('gikplus') && !href.includes('plenamar') && !href.includes('revestida'));
        });
        console.log(`✅ Acento: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de Acento: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos, browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForSelector('time[datetime]', { timeout: 10000 }).catch(() => {
          console.warn(`⚠️ Selector time[datetime] no encontrado en ${link}`);
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        const content = await page.content();
        fs.writeFileSync(`debug-acento-${link.replace(/[:/]/g, '_')}.html`, content);
        let fecha = await page.evaluate(() => {
          const time = document.querySelector('time[datetime]');
          return time ? time.getAttribute('datetime') : null;
        });
        console.log(`🧠 Fecha extraída para ${link}: ${fecha}`);
        if (fecha && fecha.includes('T')) {
          fecha = fecha.split('T')[0];
        }
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
  },
  {
    nombre: "Hoy",
    url: "https://hoy.com.do/",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://hoy.com.do/', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href && href.startsWith('https://hoy.com.do') ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com') && !href.includes('spotify.com'));
        });
        console.log(`✅ Hoy: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de Hoy: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        const fecha = $('meta[property="article:published_time"]').attr('content') || $('time').attr('datetime') || null;
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: "El Nacional",
    url: "https://elnacional.com.do/",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://elnacional.com.do/', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href && href.startsWith('https://elnacional.com.do') ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com'));
        });
        console.log(`✅ El Nacional: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de El Nacional: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        const fecha = $('meta[property="article:published_time"]').attr('content') || $('time').attr('datetime') || null;
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: "El Nuevo Diario",
    url: "https://elnuevodiario.com.do/",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://elnuevodiario.com.do/', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href && href.startsWith('https://elnuevodiario.com.do') ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com'));
        });
        console.log(`✅ El Nuevo Diario: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de El Nuevo Diario: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        const fecha = $('meta[property="article:published_time"]').attr('content') || $('time').attr('datetime') || null;
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: "Noticias SIN",
    url: "https://noticiassin.com/",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://noticiassin.com/', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href && href.startsWith('https://noticiassin.com') ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com'));
        });
        console.log(`✅ Noticias SIN: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de Noticias SIN: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        const fecha = $('time').attr('datetime') || $('meta[property="article:published_time"]').attr('content') || null;
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: "Al Momento",
    url: "https://almomento.net/categoria/mas-portada/",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://almomento.net/categoria/mas-portada/', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href && href.startsWith('https://almomento.net') ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com'));
        });
        console.log(`✅ Al Momento: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de Al Momento: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        const fecha = $('time.entry-date').attr('datetime') || $('meta[property="article:published_time"]').attr('content') || null;
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: "El Caribe",
    url: "https://www.elcaribe.com.do/panorama/pais/",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://www.elcaribe.com.do/panorama/pais/', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href && href.startsWith('https://www.elcaribe.com.do') ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com'));
        });
        console.log(`✅ El Caribe: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de El Caribe: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        const fecha = $('meta[property="article:published_time"]').attr('content') || $('time').attr('datetime') || null;
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: "De Último Minuto",
    url: "https://deultimominuto.net/",
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://deultimominuto.net/', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return (titulo.toLowerCase().includes('baní') || titulo.toLowerCase().includes('peravia')) && href && href.startsWith('https://deultimominuto.net') ? href : null;
            })
            .filter(href => href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com'));
        });
        console.log(`✅ De Último Minuto: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de De Último Minuto: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, cheerio, fetchConReintentos) => {
      try {
        const { data } = await fetchConReintentos(link);
        const $ = cheerio.load(data);
        const fecha = $('time').attr('datetime') || $('meta[property="article:published_time"]').attr('content') || null;
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: 'Manaclar Televisión',
    url: 'https://manaclartelevision.com/categorias/locales/',
    obtenerEnlaces: async (browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://manaclartelevision.com/categorias/locales/', {
          waitUntil: 'networkidle2',
          timeout: 60000,
        });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles)
            .map(article => {
              const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
              const titulo = enlaceElement?.innerText.trim() || '';
              const href = enlaceElement?.href || '';
              return href && !href.includes('facebook.com') && !href.includes('twitter.com') && !href.includes('instagram.com') && !href.includes('youtube.com') ? href : null;
            })
            .filter(href => href);
        });
        console.log(`✅ Manaclar Televisión: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de Manaclar Televisión: ${e.message}`);
        return [];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerDatosNoticia: async (link, browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const datos = await page.evaluate(() => {
          const titulo = document.querySelector('h1, .post-title, .entry-title')?.innerText.trim() || 'Sin título';
          const resumenElement = document.querySelector('.post-excerpt, .entry-summary, .entry-content p, article p')?.innerText.trim();
          const resumen = resumenElement ? resumenElement.split('.').slice(0, 2).join('.') + '.' : 'Sin resumen';
          const fecha = document.querySelector('time.entry-date, .post-date, .published')?.getAttribute('datetime') ||
                        document.querySelector('.post-date, .entry-date')?.innerText.trim() ||
                        'Sin fecha';
          return { titulo, resumen, fecha };
        });
        const fechaParseada = new Date(datos.fecha);
        datos.fecha = isNaN(fechaParseada) ? new Date().toISOString().split('T')[0] : fechaParseada.toISOString().split('T')[0];
        return datos;
      } catch (e) {
        console.error(`❌ Error al obtener datos de ${link}: ${e.message}`);
        return { titulo: 'Error', resumen: 'No se pudo obtener la noticia', fecha: new Date().toISOString().split('T')[0] };
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
    obtenerFecha: async (link, browser) => {
      let page;
      try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        let fecha = await page.evaluate(() => {
          const fechaElement = document.querySelector('time.entry-date, .post-date, .published, .entry-meta time');
          return fechaElement ? fechaElement.getAttribute('datetime') || fechaElement.innerText.trim() : 'Sin fecha';
        });
        if (!fecha || fecha === 'Sin fecha') {
          const match = link.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
          if (match) fecha = `${match[1]}-${match[2]}-${match[3]}`;
        }
        if (fecha && fecha.includes('T')) {
          fecha = fecha.split('T')[0];
        }
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        return new Date().toISOString().split('T')[0];
      } finally {
        if (page) await page.close().catch(() => {});
      }
    },
  },
];