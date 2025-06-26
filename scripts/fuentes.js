const puppeteer = require('puppeteer');
const fs = require('fs');

module.exports = [
  {
    nombre: "Notisur Baní",
    url: "https://www.notisurbani.com",
    selector: ".td-module-title a",
    base: "",
    filtrar: t => t.toLowerCase().includes('baní'),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        const { data } = await fetch(link);
        const $ = cheerio.load(data);
        return $('time.entry-date').first().attr('datetime') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "El Poder Banilejo",
    url: "https://www.elpoderbanilejo.com/v6/",
    selector: "h3.post-title a",
    base: "",
    filtrar: t => t.toLowerCase().includes('baní'),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        const { data } = await fetch(link);
        const $ = cheerio.load(data);
        return $('abbr.published').attr('title') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "CDN",
    url: "https://cdn.com.do/temas/bani/",
    selector: "article .entry-title a",
    base: "",
    filtrar: () => true,
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        const { data } = await fetch(link);
        const $ = cheerio.load(data);
        return $('meta[property="article:published_time"]').attr('content') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "Listín Diario",
    url: "https://listindiario.com/la-republica",
    selector: "a",
    base: "https://listindiario.com",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) && l.startsWith('https://listindiario.com'),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        const { data } = await fetch(link);
        const $ = cheerio.load(data);
        return $('meta[property="article:published_time"]').attr('content') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "Peravia Vision",
    url: "https://peraviavision.tv",
    selector: "a",
    base: "",
    filtrar: t => t.toLowerCase().includes('baní'),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        // Usar puppeteer para renderizar la página
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 30000 });
        // Esperar 2 segundos usando setTimeout envuelto en una promesa
        await new Promise(resolve => setTimeout(resolve, 2000));
        const content = await page.content();
        await browser.close();

        const $ = cheerio.load(content);
        // Intentar selector específico para Peravia Vision
        let fecha = $('.elementor-post-date').text().trim();

        // Parsear fecha en formato "DD MMMM, YYYY" (ej. "26 junio, 2025")
        if (fecha.match(/^\d{1,2}\s\w+,\s\d{4}$/)) {
          const meses = {
            'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
            'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
            'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
          };
          const [day, mes, year] = fecha.split(/[\s,]+/);
          fecha = `${year}-${meses[mes.toLowerCase()]}-${day.padStart(2, '0')}`;
        }

        // Extraer fecha de la URL como respaldo (formato /YYYY/MM/DD/)
        if (!fecha || isNaN(new Date(fecha))) {
          const match = link.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
          if (match) {
            fecha = `${match[1]}-${match[2]}-${match[3]}`; // YYYY-MM-DD
          }
        }

        // Validar y parsear la fecha
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        await browser.close().catch(() => {}); // Asegurar cierre del navegador
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: "Diario Libre",
    url: "https://www.diariolibre.com/actualidad/sucesos/",
    selector: "a",
    base: "https://www.diariolibre.com",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) && l && l.startsWith('/'),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        const { data } = await fetch(link);
        const $ = cheerio.load(data);
        return $('time').attr('datetime') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "Dominican Today",
    url: "https://dominicantoday.com",
    selector: "a",
    base: "https://dominicantoday.com",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) && l.startsWith('https://dominicantoday.com'),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        const { data } = await fetch(link);
        const $ = cheerio.load(data);
        return $('meta[property="article:published_time"]').attr('content') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "Acento",
    url: "https://acento.com.do/",
    selector: "article a",
    base: "https://acento.com.do",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        // Usar puppeteer para renderizar la página
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 30000 });
        // Esperar a que el elemento time[datetime] esté presente
        await page.waitForSelector('time[datetime]', { timeout: 10000 }).catch(() => {
          console.warn(`⚠️ Selector time[datetime] no encontrado en ${link}`);
        });
        // Esperar 10 segundos adicionales para asegurar renderizado completo
        await new Promise(resolve => setTimeout(resolve, 10000));
        // Guardar HTML para depuración
        const content = await page.content();
        fs.writeFileSync(`debug-acento-${link.replace(/[:/]/g, '_')}.html`, content);
        // Extraer fecha directamente con page.evaluate
        let fecha = await page.evaluate(() => {
          const time = document.querySelector('time[datetime]');
          return time ? time.getAttribute('datetime') : null;
        });
        console.log(`🧠 Fecha extraída para ${link}: ${fecha}`); // Log de depuración
        await browser.close();

        // Parsear fecha en formato ISO (ej. "2025-06-25T21:55:14-04:00")
        if (fecha && fecha.includes('T')) {
          fecha = fecha.split('T')[0]; // Tomar solo YYYY-MM-DD
        }

        // Validar y parsear la fecha
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        await browser.close().catch(() => {}); // Asegurar cierre del navegador
        return new Date().toISOString().split('T')[0];
      }
    },
  },
  {
    nombre: "Hoy",
    url: "https://hoy.com.do/",
    selector: "a",
    base: "https://hoy.com.do",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) && l && l.startsWith('https://hoy.com.do'),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        const { data } = await fetch(link);
        const $ = cheerio.load(data);
        return $('meta[property="article:published_time"]').attr('content') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "El Nacional",
    url: "https://elnacional.com.do/",
    selector: "h2.title a",
    base: "https://elnacional.com.do",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        const { data } = await fetch(link);
        const $ = cheerio.load(data);
        return $('meta[property="article:published_time"]').attr('content') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "El Nuevo Diario",
    url: "https://elnuevodiario.com.do/",
    selector: "h2.title a",
    base: "https://elnuevodiario.com.do",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        const { data } = await fetch(link);
        const $ = cheerio.load(data);
        return $('meta[property="article:published_time"]').attr('content') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "Noticias SIN",
    url: "https://noticiassin.com/",
    selector: "article a",
    base: "https://noticiassin.com",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        const { data } = await fetch(link);
        const $ = cheerio.load(data);
        return $('time').attr('datetime') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "Al Momento",
    url: "https://almomento.net/categoria/mas-portada/",
    selector: ".td-module-title a",
    base: "https://almomento.net",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        const { data } = await fetch(link);
        const $ = cheerio.load(data);
        return $('time.entry-date').attr('datetime') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "El Caribe",
    url: "https://www.elcaribe.com.do/panorama/pais/",
    selector: "h2.title a",
    base: "https://www.elcaribe.com.do",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        const { data } = await fetch(link);
        const $ = cheerio.load(data);
        return $('meta[property="article:published_time"]').attr('content') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "De Último Minuto",
    url: "https://deultimominuto.net/",
    selector: "h2.title a",
    base: "https://deultimominuto.net",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')),
    obtenerFecha: async (link, cheerio, fetch) => {
      try {
        const { data } = await fetch(link);
        const $ = cheerio.load(data);
        return $('time').attr('datetime') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: 'Manaclar Televisión',
    url: 'https://manaclartelevision.com/categorias/locales/',
    obtenerEnlaces: async () => {
      try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://manaclartelevision.com/categorias/locales/', {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar carga dinámica
        const enlaces = await page.evaluate(() => {
          const articles = document.querySelectorAll('article, .post, .entry');
          return Array.from(articles).map(article => {
            const enlaceElement = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a');
            return enlaceElement ? enlaceElement.href : null;
          }).filter(href => href);
        });
        await browser.close();
        console.log(`✅ Manaclar Televisión: ${enlaces.length} noticias encontradas`);
        return enlaces;
      } catch (e) {
        console.error(`❌ Error al obtener enlaces de Manaclar Televisión: ${e.message}`);
        await browser.close().catch(() => {});
        return [];
      }
    },
    obtenerDatosNoticia: async (link) => {
      try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 30000 });
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
        await browser.close();
        return datos;
      } catch (e) {
        console.error(`❌ Error al obtener datos de ${link}: ${e.message}`);
        await browser.close().catch(() => {});
        return { titulo: 'Error', resumen: 'No se pudo obtener la noticia', fecha: new Date().toISOString().split('T')[0] };
      }
    },
    obtenerFecha: async (link) => {
      try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const fecha = await page.evaluate(() => {
          const fechaElement = document.querySelector('time.entry-date, .post-date, .published');
          return fechaElement ? fechaElement.getAttribute('datetime') || fechaElement.innerText.trim() : 'Sin fecha';
        });
        await browser.close();
        if (fecha && fecha.includes('T')) {
          return fecha.split('T')[0];
        }
        const fechaParseada = new Date(fecha);
        if (isNaN(fechaParseada)) {
          console.warn(`⚠️ Fecha inválida en ${link}: ${fecha}, usando fecha actual como respaldo`);
          return new Date().toISOString().split('T')[0];
        }
        return fechaParseada.toISOString().split('T')[0];
      } catch (e) {
        console.warn(`⚠️ Error al obtener fecha de ${link}: ${e.message}, usando fecha actual como respaldo`);
        await browser.close().catch(() => {});
        return new Date().toISOString().split('T')[0];
      }
    }
  }
];