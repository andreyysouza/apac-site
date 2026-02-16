// ======================= AUPAC.JS – Versão Backend (CORRIGIDA) =======================
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

  /* ================= MODAL DE IMAGEM ================= */
  const imgModal = document.createElement("div");
  imgModal.className = "img-modal";
  imgModal.innerHTML = `<img src="" alt="Foto ampliada">`;
  document.body.appendChild(imgModal);

  imgModal.addEventListener("click", () => {
    imgModal.classList.remove("active");
  });
    
  /* ================= ELEMENTOS ================= */
  const petsContainer = document.getElementById('pets-container');
  const paginationContainer = document.getElementById('pagination-aupac');

  const filtroIdade = document.getElementById('filtro-idade');
  const filtroSexo = document.getElementById('filtro-sexo');
  const filtroPorte = document.getElementById('filtro-porte');

  let allPets = [];
  let visiblePets = [];
  let currentPage = 1;
  const itemsPerPage = 10;

  const DEFAULT_WHATSAPP = "5531996005196";

  /* ================= CRIAR CARD ================= */
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

    /* 🔍 Clique para ampliar imagem */
    const imgEl = card.querySelector(".pet-img");
    imgEl.addEventListener("click", () => {
      imgModal.querySelector("img").src = img;
      imgModal.classList.add("active");
    });

    /* WhatsApp */
    card.querySelector(".adotar-btn").onclick = () => {
      const msg = encodeURIComponent(`Olá! Tenho interesse em adotar o(a) ${nome}.`);
      window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
    };

    return card;
  }

  /* ================= FILTROS ================= */
  function applyFilters() {
      const fIdade = (filtroIdade.value || "all").toLowerCase();
      const fSexo = (filtroSexo.value || "all").toLowerCase();
      const fPorte = (filtroPorte.value || "all").toLowerCase();

      visiblePets = allPets.filter(p => {
        const idade = (p.idade || "").toLowerCase();
        const sexo = (p.sexo || "").toLowerCase();
        const porte = (p.porte || "").toLowerCase();

        if (fIdade !== "all" && idade !== fIdade) return false;
        if (fSexo !== "all" && sexo !== fSexo) return false;
        if (fPorte !== "all" && porte !== fPorte) return false;

        return true;
        const btnFiltrar = document.getElementById("btn-filtrar");
        const btnLimpar = document.getElementById("btn-limpar");
      });
    }

  /* ================= PAGINAÇÃO ================= */
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

  /* ================= RENDER ================= */
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

  /* ================= BACKEND ================= */
  async function loadData() {
    try {
      const r = await fetch("/api/aupac");
      const dados = await r.json();

      const lista = Array.isArray(dados) ? dados : dados.cachorros || [];

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

  /* ================= EVENTOS ================= */
  filtroIdade.addEventListener("change", () => { currentPage = 1; renderPage(); });
  filtroSexo.addEventListener("change", () => { currentPage = 1; renderPage(); });
  filtroPorte.addEventListener("change", () => { currentPage = 1; renderPage(); });
    btnFiltrar.addEventListener("click", () => {
      currentPage = 1;
      renderPage();
    });

    btnLimpar.addEventListener("click", () => {
      filtroIdade.value = "all";
      filtroSexo.value = "all";
      filtroPorte.value = "all";
    
      currentPage = 1;
      renderPage();
    });
    
    });



















