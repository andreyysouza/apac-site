document.addEventListener("DOMContentLoaded", () => {

  const phrases = [
    "Trabalho, disciplina e transformação",
    "Amando o próximo, amarás a Cristo",
    "Associação de Proteção e Assistência aos Condenados"
  ];

  // pega os dois possíveis destinos do texto (desktop e mobile)
  const typingTargets = [
    document.getElementById("typing-text")
  ]

  if (typingTargets.length === 0) return;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typingSpeed = 55;
  const deletingSpeed = 35;
  const holdAfterType = 2000;
  const holdAfterDelete = 600;

  function updateText(text) {
    typingTargets.forEach(el => {
      el.textContent = text;
    });
  }

  function typeLoop() {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      charIndex++;
      updateText(currentPhrase.slice(0, charIndex));

      if (charIndex === currentPhrase.length) {
        setTimeout(() => {
          isDeleting = true;
        }, holdAfterType);
      }

    } else {
      charIndex--;
      updateText(currentPhrase.slice(0, charIndex));

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


