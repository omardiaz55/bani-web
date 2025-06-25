module.exports = [
  {
    nombre: "Notisur Baní",
    url: "https://www.notisurbani.com",
    selector: ".td-module-title a",
    base: "",
    filtrar: t => t.toLowerCase().includes('baní'),
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('time.entry-date').first().text().trim() || null;
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
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('abbr.published').attr('title') || null;
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
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('meta[property="article:published_time"]').attr('content') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "Listín Diario",
    url: "https://listindiario.com/la-republica/",
    selector: "a",
    base: "https://listindiario.com",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) && l.startsWith('https://listindiario.com'),
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('meta[property="article:published_time"]').attr('content') || null;
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
    obtenerFecha: async () => null,
  },
  {
    nombre: "Diario Libre",
    url: "https://www.diariolibre.com/actualidad/sucesos/",
    selector: "a",
    base: "https://www.diariolibre.com",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) && l && l.startsWith('/'),
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('time').attr('datetime') || null;
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
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('div.date-published').text().trim() || null;
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
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('meta[property="article:published_time"]').attr('content') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "Hoy",
    url: "https://hoy.com.do/",
    selector: "a",
    base: "https://hoy.com.do",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) && l && l.startsWith('https://hoy.com.do'),
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('meta[property="article:published_time"]').attr('content') || null;
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
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('meta[property="article:published_time"]').attr('content') || null;
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
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('meta[property="article:published_time"]').attr('content') || null;
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
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('time').attr('datetime') || null;
      } catch {
        return null;
      }
    },
  },
  {
    nombre: "Al Momento",
    url: "https://almomento.net/",
    selector: ".td-module-title a",
    base: "https://almomento.net",
    filtrar: (t, l) => (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')),
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('time.entry-date').attr('datetime') || null;
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
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('meta[property="article:published_time"]').attr('content') || null;
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
    obtenerFecha: async (link, $, fetch) => {
      try {
        const { data } = await fetch(link);
        const $detalle = $.load(data);
        return $detalle('time').attr('datetime') || null;
      } catch {
        return null;
      }
    },
  }
];