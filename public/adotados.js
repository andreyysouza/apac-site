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

  /* ================= ADOTADOS ================= */

const container =
document.getElementById("cardsAdotados");

async function carregarAdotados() {

  try {

    const response =
    await fetch("/api/aupac");

    const dados =
    await response.json();

    const adotados = dados.filter(
      animal => animal.status === "adotado"
    );

    container.innerHTML = "";

    if(adotados.length === 0){

      container.innerHTML = `
        <p class="sem-adotados">
          Nenhum animal adotado ainda.
        </p>
      `;

      return;
    }

    adotados.forEach(animal => {

      container.innerHTML += `

        <div class="card-adotado">

          <div class="card-imagem">
            <img src="${animal.imagem}">
          </div>

            <div class="selo">
              ❤️ ADOTADO
            </div>

          <div class="card-info">

            <h3>${animal.nome}</h3>
        
            <p>${animal.descricao}</p>
        
            <span class="data">
              ${animal.dataAdocao}
            </span>
        
          </div>
        
        </div>

      `;

    });

  } catch(err){

    console.error(err);

    container.innerHTML = `
      <p class="sem-adotados">
        Erro ao carregar animais adotados.
      </p>
    `;
  }

}

carregarAdotados();  

}); // fecha DOMContentLoaded    
    
