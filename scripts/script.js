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

// cargar navbar
    fetch('navbar.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('navbar').innerHTML = html;
      })
      .catch(error => console.error('Error cargando navbar:', error));

    // cargar footer
    fetch('footer.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('footer').innerHTML = html;
      })
      .catch(error => console.error('Error cargando footer:', error));

      // paginación de noticias
let noticias = [];
let paginaActual = 1;
const noticiasPorPagina = 4;

async function cargarNoticias() {
  try {
    const res = await fetch('noticias.json');
    noticias = await res.json();

    noticias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    mostrarPagina(paginaActual);
    actualizarBotones();
  } catch (err) {
    console.error(err);
  }
}

function mostrarPagina(pagina) {
  const grid = document.getElementById('gridNoticias');
  if (!grid) return;  // seguridad
  grid.innerHTML = '';
  const inicio = (pagina - 1) * noticiasPorPagina;
  const fin = inicio + noticiasPorPagina;
  const noticiasPagina = noticias.slice(inicio, fin);

  noticiasPagina.forEach(noticia => {
    const card = document.createElement('div');
    card.className = 'noticia-card noticia-listado';
    card.innerHTML = `
      <div class="noticia-miniatura">
        <img src="${noticia.imagen || 'https://via.placeholder.com/300x200'}" alt="${noticia.titulo}">
      </div>
      <div class="noticia-contenido">
        <h4><a href="${noticia.link}" target="_blank">${noticia.titulo}</a></h4>
        <small><strong>${noticia.fuente}</strong> • ${noticia.fecha}</small>
        <p>${noticia.resumen || ''}</p>
        <div class="iconos-sociales">
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(noticia.link)}" target="_blank"><i class="fab fa-facebook-f"></i></a>
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(noticia.link)}" target="_blank"><i class="fab fa-twitter"></i></a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  const totalPaginas = Math.ceil(noticias.length / noticiasPorPagina);
  document.getElementById('pagina-actual').textContent = `Página ${pagina} de ${totalPaginas}`;
}

function actualizarBotones() {
  const anterior = document.getElementById('anterior');
  const siguiente = document.getElementById('siguiente');
  if (!anterior || !siguiente) return;  // seguridad
  const totalPaginas = Math.ceil(noticias.length / noticiasPorPagina);
  anterior.disabled = paginaActual === 1;
  siguiente.disabled = paginaActual === totalPaginas;
}

document.addEventListener('DOMContentLoaded', () => {
  cargarNoticias();

  const anterior = document.getElementById('anterior');
  const siguiente = document.getElementById('siguiente');
  const inicioBtn = document.getElementById('inicio');

  if (anterior && siguiente && inicioBtn) {
    anterior.addEventListener('click', () => {
      if (paginaActual > 1) {
        paginaActual--;
        mostrarPagina(paginaActual);
        actualizarBotones();
        window.scrollTo(0, document.querySelector('.seccion-noticias').offsetTop - 20);
      }
    });

    siguiente.addEventListener('click', () => {
      const totalPaginas = Math.ceil(noticias.length / noticiasPorPagina);
      if (paginaActual < totalPaginas) {
        paginaActual++;
        mostrarPagina(paginaActual);
        actualizarBotones();
        window.scrollTo(0, document.querySelector('.seccion-noticias').offsetTop - 20);
      }
    });

    inicioBtn.addEventListener('click', () => {
      paginaActual = 1;
      mostrarPagina(paginaActual);
      actualizarBotones();
      window.scrollTo(0, document.querySelector('.seccion-noticias').offsetTop - 20);
    });
  }
});