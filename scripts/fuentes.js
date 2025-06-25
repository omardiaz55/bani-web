// fuentes.js
module.exports = [
  {
    nombre: 'Notisur Baní',
    url: 'https://www.notisurbani.com',
    selector: '.td-module-title a',
    base: '',
    filtrar: t => t.toLowerCase().includes('baní'),
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = cheerio.load(data);
        const textoFecha = $detalle('time.entry-date').first().text().trim();
        return textoFecha || null;
      } catch {
        return null;
      }
    }
  },
  {
    nombre: 'El Poder Banilejo',
    url: 'https://elpoderbanilejo.com',
    selector: 'h3.post-title a',
    base: '',
    filtrar: t => t.toLowerCase().includes('baní'),
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = cheerio.load(data);
        const textoFecha = $detalle('abbr.published').attr('title');
        return textoFecha || null;
      } catch {
        return null;
      }
    }
  },
  {
    nombre: 'CDN',
    url: 'https://cdn.com.do/temas/bani/',
    selector: 'article .entry-title a',
    base: '',
    filtrar: () => true,
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = cheerio.load(data);
        const fechaTexto = $detalle('meta[property="article:published_time"]').attr('content');
        return fechaTexto || null;
      } catch {
        return null;
      }
    }
  },
  {
    nombre: 'Peravia Vision',
    url: 'https://peraviavision.tv',
    selector: 'a',
    base: '',
    filtrar: t => t.toLowerCase().includes('baní'),
    obtenerFecha: async () => null
  },
  {
    nombre: 'Listín Diario',
    url: 'https://listindiario.com',
    selector: 'a',
    base: 'https://listindiario.com',
    filtrar: (t, l) =>
      (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) &&
      l.startsWith('https://listindiario.com'),
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = cheerio.load(data);
        const fechaTexto = $detalle('meta[property="article:published_time"]').attr('content');
        return fechaTexto || null;
      } catch {
        return null;
      }
    }
  },
  {
    nombre: 'Dominican Today',
    url: 'https://dominicantoday.com',
    selector: 'a',
    base: 'https://dominicantoday.com',
    filtrar: (t, l) =>
      (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) &&
      l.startsWith('https://dominicantoday.com'),
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = cheerio.load(data);
        const textoFecha = $detalle('div.date-published').text().trim();
        return textoFecha || null;
      } catch {
        return null;
      }
    }
  },
  {
    nombre: 'Diario Libre',
    url: 'https://www.diariolibre.com',
    selector: 'a',
    base: 'https://www.diariolibre.com',
    filtrar: (t, l) =>
      (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) &&
      l && l.startsWith('/'),
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = cheerio.load(data);
        const textoFecha = $detalle('time').attr('datetime');
        return textoFecha || null;
      } catch {
        return null;
      }
    }
  },
  {
    nombre: 'Prensa Latina',
    url: 'https://www.prensa-latina.cu/etiqueta/bani/',
    selector: 'a',
    base: '',
    filtrar: (t, l) =>
      (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) &&
      l && l.startsWith('http'),
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = cheerio.load(data);
        const textoFecha = $detalle('time.entry-date').first().text().trim();
        return textoFecha || null;
      } catch {
        return null;
      }
    }
  }
];