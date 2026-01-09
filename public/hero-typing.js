document.addEventListener("DOMContentLoaded", () => {

  const phrases = [
    "Trabalho, disciplina e transformação",
    "Amando o próximo, amarás a Cristo",
    "Associação de Proteção e Assistência aos Condenados"
  ];

  const textEl = document.getElementById("typing-text");
  if (!textEl) return;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typingSpeed = 55;      // velocidade de digitação
  const deletingSpeed = 35;    // velocidade de apagar
  const holdAfterType = 2000;  // pausa após digitar
  const holdAfterDelete = 500; // pausa após apagar

  function typeLoop() {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      // digitando
      textEl.textContent = currentPhrase.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentPhrase.length) {
        setTimeout(() => isDeleting = true, holdAfterType);
      }
    } else {
      // apagando
      textEl.textContent = currentPhrase.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(() => {}, holdAfterDelete);
      }
    }

    const delay = isDeleting ? deletingSpeed : typingSpeed;
    setTimeout(typeLoop, delay);
  }

  typeLoop();

});
