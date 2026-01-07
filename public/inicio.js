(async function(){
  const slider = document.getElementById("slider");
  const interval = 4500;

  async function loadNews(){
    try{
      const r = await fetch("news.json");
      const j = await r.json();
      return j.noticias || [];
    }catch(e){
      console.error("Erro carregando news.json", e);
      return [];
    }
  }

  function createSlides(list){
    slider.innerHTML = "";
    if(!list.length){
      slider.innerHTML = "<p style='padding:20px;text-align:center;'>Nenhuma notícia encontrada.</p>";
      return [];
    }

    list.forEach((n)=>{
      const d = document.createElement("div");
      d.className = "slide";
      d.style.backgroundImage = `url('${n.imagem}')`;
      d.innerHTML = `
        <div class="overlay">
          <h2>${n.titulo || ""}</h2>
          <p>${n.descricao || ""}</p>
        </div>
      `;
      slider.appendChild(d);
    });

    // controles
    const ctr = document.createElement("div");
    ctr.className = "slider-controls";
    list.forEach((_,i)=>{
      const dot = document.createElement("div");
      dot.className = "ctrl-dot";
      dot.dataset.i = i;
      dot.onclick = ()=> goTo(i);
      ctr.appendChild(dot);
    });
    slider.appendChild(ctr);

    return Array.from(slider.querySelectorAll(".slide"));
  }

  let slides = [];
  let current = 0;
  let dots = [];

  function goTo(i){
    slides.forEach(s => s.classList.remove("ativo"));
    dots.forEach(d => d.classList.remove("active"));
    slides[i].classList.add("ativo");
    dots[i].classList.add("active");
    current = i;
  }

  function next(){
    goTo((current+1) % slides.length);
  }

  const data = await loadNews();
  slides = createSlides(data);
  dots = Array.from(document.querySelectorAll(".ctrl-dot"));

  if(slides.length){
    goTo(0);
    setInterval(next, interval);
  }
})();

// MENU HAMBURGUER MOBILE
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menu-toggle");
  const links = document.getElementById("menu-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("active");
    });
  }
});




