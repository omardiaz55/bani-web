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

    const contenedor = document.getElementById('noticiasPortada');
    const primerasCinco = noticias.slice(0, 5);
    primerasCinco.forEach(noticia => {
      const card = document.createElement('div');
      card.className = 'noticia-card-portada';
      card.innerHTML = `
        <img src="${noticia.imagen || 'https://via.placeholder.com/300x200'}" alt="${noticia.titulo}">
        <div class="contenido">
          <h4><a href="${noticia.link}" target="_blank">${noticia.titulo}</a></h4>
          <small>${noticia.fuente} • ${noticia.fecha}</small>
        </div>
      `;
      contenedor.appendChild(card);
    });

  } catch (e) {
    console.error('Error cargando noticias en portada:', e);
  }
}

document.addEventListener('DOMContentLoaded', cargarNoticiasPortada);

