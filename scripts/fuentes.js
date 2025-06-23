module.exports = [
  {
    nombre: 'Notisur Baní',
    url: 'https://www.notisurbani.com',
    selector: '.td-module-title a',
    base: '',
    filtrar: t => t.toLowerCase().includes('baní'),
  },
  {
    nombre: 'El Poder Banilejo',
    url: 'https://elpoderbanilejo.com',
    selector: 'h3.post-title a',
    base: '',
    filtrar: t => t.toLowerCase().includes('baní'),
  },
  {
    nombre: 'CDN',
    url: 'https://cdn.com.do/temas/bani/',
    selector: 'article .entry-title a',
    base: '',
    filtrar: () => true,
  },
  {
    nombre: 'Peravia Vision',
    url: 'https://peraviavision.tv',
    selector: 'a',
    base: '',
    filtrar: t => t.toLowerCase().includes('baní'),
  },
  {
    nombre: 'Listín Diario',
    url: 'https://listindiario.com',
    selector: 'a',
    base: 'https://listindiario.com',
    filtrar: (t, l) =>
      (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) &&
      l.startsWith('https://listindiario.com'),
  },
  {
    nombre: 'Dominican Today',
    url: 'https://dominicantoday.com',
    selector: 'a',
    base: 'https://dominicantoday.com',
    filtrar: (t, l) =>
      (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) &&
      l.startsWith('https://dominicantoday.com'),
  },
  {
    nombre: 'Diario Libre',
    url: 'https://www.diariolibre.com',
    selector: 'a',
    base: 'https://www.diariolibre.com',
    filtrar: (t, l) =>
      (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) &&
      l && l.startsWith('/'),
  },
  {
    nombre: 'Prensa Latina',
    url: 'https://www.prensa-latina.cu/etiqueta/bani/',
    selector: 'a',
    base: '',
    filtrar: (t, l) =>
      (t.toLowerCase().includes('baní') || t.toLowerCase().includes('peravia')) &&
      l && l.startsWith('http'),
  }
];