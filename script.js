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

// Cierra menú y submenú en móviles al hacer clic en cualquier enlace
function closeMenu() {
  const nav = document.getElementById('navbarLinks');
  nav.classList.remove('active');

  // Cierra submenú si está abierto
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
});

backToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  if (scrollY > 300) {
    backToTopButton.style.display = 'block';
  } else {
    backToTopButton.style.display = 'none';
  }
});

document.addEventListener('click', function (event) {
  const nav = document.getElementById('navbarLinks');
  const menuToggle = document.querySelector('.menu-toggle');
  const clickedInsideMenu = nav.contains(event.target) || menuToggle.contains(event.target);

  if (!clickedInsideMenu) {
    nav.classList.remove('active');

    // También cierra cualquier submenú abierto
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show-submenu'));
  }
});

// 🔄 Carga dinámica de noticias con título, fuente y fecha
fetch(`noticias.json?t=${new Date().getTime()}`)
  .then(res => res.json())
  .then(data => {
    const contenedor = document.getElementById('lista-noticias');
    contenedor.innerHTML = '';

    data.forEach(noticia => {
      const item = document.createElement('li');
      item.style.marginBottom = '1rem';
      item.innerHTML = `
        <div>
          <a href="${noticia.link}" target="_blank" style="font-weight: bold; color: #2a5dab;">
            ${noticia.titulo}
          </a><br>
          <small style="color: gray;">${noticia.fuente} &nbsp;|&nbsp; ${noticia.fecha}</small>
        </div>
      `;
      contenedor.appendChild(item);
    });
  })
  .catch(() => {
    document.getElementById('lista-noticias').innerHTML = '<li>No se pudieron cargar las noticias.</li>';
  });

// Cargar y mostrar noticias con resumen
document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('lista-noticias');

  fetch('noticias.json')
    .then(res => res.json())
    .then(noticias => {
      if (!noticias.length) {
        contenedor.innerHTML = '<li>No se encontraron noticias recientes.</li>';
        return;
      }

      contenedor.innerHTML = ''; // Limpia contenido anterior

      noticias.forEach(noticia => {
        const item = document.createElement('li');

        item.innerHTML = `
          <a href="${noticia.link}" target="_blank" rel="noopener">
            ${noticia.titulo}
          </a><br>
          <small><strong>${noticia.fuente}</strong> &bull; ${noticia.fecha}</small>
          <p>${noticia.resumen || ''}</p>
        `;

        contenedor.appendChild(item);
      });
    })
    .catch(() => {
      contenedor.innerHTML = '<li>No se pudieron cargar las noticias.</li>';
    });
});
