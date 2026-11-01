(() => {
  const languageSelect = document.getElementById("language");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  function applyLanguage(lang) {
    const dictionary = window.AVALORIA_TRANSLATIONS[lang] || window.AVALORIA_TRANSLATIONS.pt;
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = dictionary[element.dataset.i18n];
      if (value !== undefined) element.innerHTML = value;
    });
    document.title = lang === "en" ? "Avalória — A new kingdom is being forged" : "Avalória — Um novo reino está sendo forjado";
    try { localStorage.setItem("avaloria-language", lang); } catch (_) {}
  }

  let savedLanguage = "pt";
  try { savedLanguage = localStorage.getItem("avaloria-language") || "pt"; } catch (_) {}
  languageSelect.value = savedLanguage;
  applyLanguage(savedLanguage);
  languageSelect.addEventListener("change", (event) => applyLanguage(event.target.value));

  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }));
})();