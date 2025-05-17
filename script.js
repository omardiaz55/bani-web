function toggleMenu() {
  const navLinks = document.getElementById("navbarLinks");
  navLinks.classList.toggle("active");
}

const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > window.innerHeight * 2) {
    backToTopButton.style.display = 'block';
  } else {
    backToTopButton.style.display = 'none';
  }
});

backToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

!function(d,s,id){
  var js,fjs=d.getElementsByTagName(s)[0];
  if(!d.getElementById(id)){
    js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';
    fjs.parentNode.insertBefore(js,fjs);
  }
}(document,'script','weatherwidget-io-js');