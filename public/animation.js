document.addEventListener("DOMContentLoaded", () => {

  /* ================= CONFIGURAÇÃO ================= */

  // Tudo que pode animar entra aqui
  const ANIMATED_SELECTORS = [
    ".hero h1",
    ".hero p",
    ".slider",
    "section",
    ".bloco",
    ".card",
    ".box"
  ];

  const animatedElements = document.querySelectorAll(
    ANIMATED_SELECTORS.join(",")
  );

  if (!animatedElements.length) return;

  /* ================= PREPARAÇÃO ================= */

  animatedElements.forEach(el => {
    el.classList.add("will-animate");
  });

  /* ================= OBSERVER ================= */

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          entry.target.classList.remove("will-animate");

          // anima uma vez só
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -60px 0px"
    }
  );

  animatedElements.forEach(el => observer.observe(el));

});
