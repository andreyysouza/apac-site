document.addEventListener("DOMContentLoaded", () => {

  console.log("animation.js ativo");

  const selectors = [
    ".hero h1",
    ".hero p",
    ".slider",
    "section",
    ".bloco",
    ".card",
    ".box"
  ];

  const elements = [];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      elements.push(el);
    });
  });

  if (!elements.length) return;

  // 1️⃣ aplica estado inicial
  elements.forEach(el => {
    el.classList.add("will-animate");
  });

  // 2️⃣ espera um frame real de renderização
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              entry.target.classList.remove("will-animate");
              obs.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -80px 0px"
        }
      );

      elements.forEach(el => observer.observe(el));

    });
  });

});


