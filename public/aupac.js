// ======================= AUPAC.JS – Versão Backend =======================
document.addEventListener('DOMContentLoaded', () => {

  const petsContainer = document.getElementById('pets-container');
  const paginationContainer = document.getElementById('pagination-aupac');

  const filtroIdade = document.getElementById('filtro-idade');
  const filtroSexo = document.getElementById('filtro-sexo');
  const filtroPorte = document.getElementById('filtro-porte');

  let allPets = [];
  let visiblePets = [];
  let currentPage = 1;
  const itemsPerPage = 6;

  const DEFAULT_WHATSAPP = "5531996005196";

  // Criar card
  function createPetCard(pet) {
    const img = pet.imagem || "img/imagem_padrao.jpg";
    const nome = pet.nome || "Sem nome";
    const porte = pet.porte || "";
    const idade = pet.idade || "";
    const sexo = pet.sexo || "";
    const whatsapp = pet.whatsapp || DEFAULT_WHATSAPP;

    const card = document.createElement('div');
    card.className = "pet-card";

    card.innerHTML = `
      <img class="pet-img" src="${img}" alt="${nome}">
      <div class="pet-body">
        <h3>${nome}</h3>
        <div class="pet-meta">
          <div class="badge">Porte: ${porte}</div>
          <div class="badge">Idade: ${idade}</div>
          <div class="badge">Sexo: ${sexo}</div>
        </div>
        <button class="adotar-btn">Quero Adotar</button>
      </div>
    `;

    card.querySelector(".adotar-btn").onclick = () => {
      const msg = encodeURIComponent(`Olá! Tenho interesse em adotar o(a) ${nome}.`);
      window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
    };

    return card;
  }

  // Filtros
  function applyFilters() {
    const fIdade = filtroIdade.value || "all";
    const fSexo = filtroSexo.value || "all";
    const fPorte = filtroPorte.value || "all";

    visiblePets = allPets.filter(p => {
      if (fIdade !== "all" && p.idade !== fIdade) return false;
      if (fSexo !== "all" && p.sexo !== fSexo) return false;
      if (fPorte !== "all" && p.porte !== fPorte) return false;
      return true;
    });
  }

  // Paginação
  function buildPagination(totalPages) {
    paginationContainer.innerHTML = "";

    const prevBtn = document.createElement("button");
    prevBtn.innerText = "⟨ Anterior";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { currentPage--; renderPage(); };
    paginationContainer.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      if (i === currentPage) btn.classList.add("active");
      btn.onclick = () => { currentPage = i; renderPage(); };
      paginationContainer.appendChild(btn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.innerText = "Próximo ⟩";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { currentPage++; renderPage(); };
    paginationContainer.appendChild(nextBtn);
  }

  // Render page
  function renderPage() {
    applyFilters();

    const total = visiblePets.length;
    const totalPages = Math.ceil(total / itemsPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    petsContainer.innerHTML = "";
    visiblePets.slice(start, end).forEach(pet => {
      petsContainer.appendChild(createPetCard(pet));
    });

    buildPagination(totalPages);
  }

  // Carregar backend
  async function loadData() {
    try {
      const r = await fetch("/api/aupac");
      const lista = await r.json();

      allPets = lista.map(item => ({
        nome: item.nome,
        idade: item.idade,
        porte: item.porte,
        sexo: item.sexo,
        whatsapp: item.whatsapp,
        imagem: item.imagem
      }));

      renderPage();
    } catch (e) {
      console.error("Erro ao carregar cães:", e);
    }
  }

  loadData();

  filtroIdade.addEventListener("change", () => { currentPage = 1; renderPage(); });
  filtroSexo.addEventListener("change", () => { currentPage = 1; renderPage(); });
  filtroPorte.addEventListener("change", () => { currentPage = 1; renderPage(); });

});

