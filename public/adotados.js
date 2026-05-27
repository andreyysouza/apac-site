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

 const adotados = [

  {
    nome: "Agatha",
    imagem: "img/adotados/agatha.jpg",
    descricao: "Agora vivendo com muito amor.",
    data: "Maio de 2026"
  },

  {
    nome: "Thor",
    imagem: "img/adotados/thor.jpg",
    descricao: "Ganhou uma família incrível.",
    data: "Abril de 2026"
  },

  {
    nome: "Mel",
    imagem: "img/adotados/mel.jpg",
    descricao: "Hoje vive cercada de carinho.",
    data: "Abril de 2026"
  }

];

const container =
document.getElementById("cardsAdotados");

adotados.forEach(animal => {

  container.innerHTML += `

    <div class="card-adotado">

      <div class="card-imagem">

        <img src="${animal.imagem}">

        <div class="selo">
          ❤️ ADOTADO
        </div>

      </div>

      <div class="card-info">

        <h3>${animal.nome}</h3>

        <p>${animal.descricao}</p>

        <span class="data">
          Adotado em ${animal.data}
        </span>

      </div>

    </div>

  `;

});   
}); // fecha DOMContentLoaded    
    
