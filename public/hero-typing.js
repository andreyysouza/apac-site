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

  const typingSpeed = 55;
  const deletingSpeed = 35;
  const holdAfterType = 2000;
  const holdAfterDelete = 600;

  function typeLoop() {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      textEl.textContent = currentPhrase.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentPhrase.length) {
        setTimeout(() => isDeleting = true, holdAfterType);
      }
    } else {
      textEl.textContent = currentPhrase.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(() => {}, holdAfterDelete);
      }
    }

    setTimeout(typeLoop, isDeleting ? deletingSpeed : typingSpeed);
  }

  typeLoop();
});

