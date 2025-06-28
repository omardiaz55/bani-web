const backToTopButton = document.getElementById('backToTop');

// Mostrar u ocultar el botón al cargar la página
window.addEventListener('load', () => {
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  backToTopButton.style.display = scrollY > 300 ? 'block' : 'none';
});

function toggleMenu() {
  const nav = document.getElementById('navbarLinks');
  nav.classList.toggle('active');
}

function toggleDropdown(event) {
  event.preventDefault();
  const dropdown = event.target.closest('.dropdown');
  dropdown.classList.toggle('show-submenu');
}

function closeMenu() {
  const nav = document.getElementById('navbarLinks');
  nav.classList.remove('active');
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(d => d.classList.remove('show-submenu'));
}

document.addEventListener('click', function (event) {
  const isDropdown = event.target.closest('.dropdown');
  if (!isDropdown) {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      dropdown.classList.remove('show-submenu');
    });
  }

  const nav = document.getElementById('navbarLinks');
  const menuToggle = document.querySelector('.menu-toggle');
  const clickedInsideMenu = nav.contains(event.target) || menuToggle.contains(event.target);
  if (!clickedInsideMenu) {
    nav.classList.remove('active');
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show-submenu'));
  }
});

backToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  backToTopButton.style.display = scrollY > 300 ? 'block' : 'none';
});

// 🔄 Mostrar solo 5 noticias en index.html con fecha formateada
async function cargarNoticiasPortada() {
  try {
    const res = await fetch('noticias.json');
    const noticias = await res.json();

    if (noticias.length === 0) return;

    // Hero destacado
    const hero = noticias[0];
    document.getElementById('noticiaHeroPortada').innerHTML = `
      <img src="${hero.imagen || 'https://via.placeholder.com/1200x400'}" alt="${hero.titulo}">
      <div class="overlay">
        <h3>${hero.titulo}</h3>
        <a href="${hero.link}" target="_blank">Leer más</a>
      </div>
    `;

    // 4 noticias secundarias
    const contenedorSecundarias = document.getElementById('noticiasSecundariasPortada');
    const secundarias = noticias.slice(1, 5);
    secundarias.forEach(noticia => {
      const card = document.createElement('div');
      card.className = 'noticia-card-portada';
      card.innerHTML = `
        <img src="${noticia.imagen || 'https://via.placeholder.com/300x200'}" alt="${noticia.titulo}">
        <div class="contenido">
          <h4><a href="${noticia.link}" target="_blank">${noticia.titulo}</a></h4>
          <small>${noticia.fuente} • ${noticia.fecha}</small>
        </div>
      `;
      contenedorSecundarias.appendChild(card);
    });

  } catch (e) {
    console.error('Error cargando noticias en portada:', e);
  }
}

document.addEventListener('DOMContentLoaded', cargarNoticiasPortada);