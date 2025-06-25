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
document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('lista-noticias');
  if (!contenedor) return;

  fetch('noticias.json')
    .then(res => res.json())
    .then(noticias => {
      if (!noticias.length) {
        contenedor.innerHTML = '<li>No se encontraron noticias recientes.</li>';
        return;
      }

      contenedor.innerHTML = '';

      noticias.slice(0, 5).forEach(noticia => {
        const item = document.createElement('li');

        // Formatear la fecha
        const fechaFormateada = noticia.fecha
          ? new Date(noticia.fecha).toLocaleDateString('es-DO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'Fecha desconocida';

        item.innerHTML = `
          <a href="${noticia.link}" target="_blank" rel="noopener" style="font-weight: bold; color: #2a5dab;">
            ${noticia.titulo}
          </a><br>
          <small style="color: #555;"><strong>${noticia.fuente || ''}</strong> • ${fechaFormateada}</small>
          ${noticia.resumen ? `<p>${noticia.resumen}</p>` : ''}
        `;
        contenedor.appendChild(item);
      });

      const verMas = document.createElement('div');
      verMas.style.textAlign = 'center';
      verMas.innerHTML = `
        <a href="noticias.html" class="hero-btn" style="margin-top: 1rem; display: inline-block;">
          Ver todas las noticias
        </a>
      `;
      contenedor.parentElement.appendChild(verMas);
    })
    .catch(() => {
      contenedor.innerHTML = '<li>No se pudieron cargar las noticias.</li>';
    });
});