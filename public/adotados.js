// ======================= ADOTADOS.JS =======================
document.addEventListener('DOMContentLoaded', () => {

    /* ================= MENU HAMBURGUER ================= */
  const toggle = document.getElementById("menu-toggle");
  const links = document.getElementById("menu-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("active");
    });
  }

  /* ================= SCROLL HEADER (NOVO) ================= */
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const current = window.scrollY;

    // adiciona classe ao passar do header
    if (current > 80) {
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrolled");
    }

    // fecha menu mobile ao rolar
    if (current > lastScroll && links?.classList.contains("active")) {
      links.classList.remove("active");
    }

    lastScroll = current;
  });
