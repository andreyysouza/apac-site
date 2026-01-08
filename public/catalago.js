// ======================= CATALAGO.JS – Backend (FINAL) =======================
document.addEventListener("DOMContentLoaded", () => {

  /* ================= MENU HAMBURGUER ================= */
  const toggle = document.getElementById("menu-toggle");
  const links = document.getElementById("menu-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("active");
    });
  }

  /* ================= MODAL DE IMAGEM ================= */
  const imgModal = document.createElement("div");
  imgModal.className = "img-modal";
  imgModal.innerHTML = `<img src="" alt="Imagem ampliada">`;
  document.body.appendChild(imgModal);

  imgModal.addEventListener("click", () => {
    imgModal.classList.remove("active");
  });

  /* ================= ELEMENTOS ================= */
  const filterButtons = document.querySelectorAll(".filtro-btn");
  const paginationContainer = document.querySelector(".pagination");
  const produtosContainer = document.getElementById("produtos-container");

  let produtos = [];
  let currentPage = 1;
  const itemsPerPage = 12;

  const DEFAULT_WHATSAPP = "5531996005196";

  /* ================= CREATE CARD ================= */
  function createCard(item) {

    const nome = item.nome || "Sem nome";
    const categoria = (item.categoria || "outro").toLowerCase();
    const preco = item.preco ? Number(item.preco) : null;
    const descricao = item.descricao || "";
    const img = item.imagem || "img/imagem_padrao.jpg";
    const whatsapp = item.whatsapp || DEFAULT_WHATSAPP;

    const card = document.createElement("div");
    card.className = `card produto ${categoria}`;

    const precoHTML = preco
      ? `<p class="price">R$ ${preco.toFixed(2).replace(".", ",")}</p>`
      : "";

    card.innerHTML = `
      <img class="produto-img" src="${img}" alt="${nome}">
      <div class="card-content">
        <h3>${nome}</h3>
        <div class="desc">${descricao}</div>
        ${precoHTML}
        <a class="whatsapp-btn"
           href="https://wa.me/${whatsapp}?text=${encodeURIComponent(
             `Olá! Tenho interesse no produto: ${nome}`
           )}"
           target="_blank">
           Fazer Pedido
        </a>
      </div>
    `;

    /* 🔍 ZOOM NA IMAGEM */
    const imgEl = card.querySelector(".produto-img");
    imgEl.addEventListener("click", (e) => {
      e.stopPropagation();
      imgModal.querySelector("img").src = img;
      imgModal.classList.add("active");
    });

    return card;
  }

  /* ================= RENDER PAGE ================= */
  function renderPage() {

    const btn = document.querySelector(".filtro-btn.active");
    const categoriaFiltro = btn ? btn.dataset.filter : "all";

    const filtrados = produtos.filter(p =>
      categoriaFiltro === "all" || p.categoria === categoriaFiltro
    );

    const totalPages = Math.ceil(filtrados.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = 1;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    produtosContainer.innerHTML = "";

    filtrados.slice(start, end).forEach(item => {
      produtosContainer.appendChild(createCard(item));
    });

    buildPagination(totalPages);
  }

  /* ================= PAGINATION ================= */
  function buildPagination(totalPages) {

    paginationContainer.innerHTML = "";

    const prev = document.createElement("button");
    prev.innerText = "⟨ Anterior";
    prev.disabled = currentPage === 1;
    prev.onclick = () => {
      currentPage--;
      renderPage();
    };
    paginationContainer.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      if (i === currentPage) btn.classList.add("active");
      btn.onclick = () => {
        currentPage = i;
        renderPage();
      };
      paginationContainer.appendChild(btn);
    }

    const next = document.createElement("button");
    next.innerText = "Próximo ⟩";
    next.disabled = currentPage === totalPages;
    next.onclick = () => {
      currentPage++;
      renderPage();
    };
    paginationContainer.appendChild(next);
  }

  /* ================= FILTER EVENTS ================= */
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentPage = 1;
      renderPage();
    });
  });

  /* ================= LOAD DATA ================= */
  async function loadData() {
    try {
      const r = await fetch("/api/artesanato");
      const dados = await r.json();

      const lista = Array.isArray(dados) ? dados : dados.produtos || [];

      produtos = lista.map(item => ({
        nome: item.nome,
        categoria: (item.categoria || "outro").toLowerCase(),
        preco: item.preco,
        descricao: item.descricao,
        whatsapp: item.whatsapp,
        imagem: item.imagem
      }));

      renderPage();

    } catch (e) {
      console.error("Erro ao carregar produtos:", e);
    }
  }

  loadData();
});

