(() => {
  const languageSelect = document.getElementById("language");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const newsList = document.getElementById("news-list");
  const devlogList = document.getElementById("devlog-list");
  const galleryList = document.getElementById("gallery-list");
  const repository = "falcone011/avaloria-portal";
  let newsRequest = 0;
  let devlogRequest = 0;
  let galleryRequest = 0;

  function parseFrontMatter(markdown) {
    const match = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) return null;
    const yaml = match[1];
    const readScalar = (key) => {
      const found = yaml.match(new RegExp("^" + key + ":\\s*(.*)$", "m"));
      return found ? found[1].trim().replace(/^["']|["']$/g, "") : "";
    };
    const readText = (key) => {
      const block = yaml.match(new RegExp("^" + key + ":\\s*[|>]-?\\s*\\r?\\n((?:[ \\t]+.*(?:\\r?\\n|$))*)", "m"));
      if (block) return block[1].split(/\r?\n/).map(line => line.replace(/^\s{1,}/, "")).join(" ").trim();
      return readScalar(key);
    };
    return {
      title: readScalar("title"),
      summary: readText("summary"),
      date: readScalar("date"),
      image: readScalar("image"),
      description: readText("description"),
      video_url: readScalar("video_url")
    };
  }

  function makePostCard(post, lang, label) {
    const card = document.createElement("article");
    card.className = "post-card";
        if (post.image && (post.image.startsWith("/") || post.image.startsWith("https://"))) {
      const image = document.createElement("img");
      image.src = post.image;
      image.alt = post.title;
      image.loading = "lazy";
      image.style.cssText = "width:100%;max-height:190px;object-fit:cover;margin-bottom:12px;";
      card.appendChild(image);
    }
    const date = document.createElement("span");
    date.className = "post-date";
    const parsedDate = post.date ? new Date(post.date) : null;
    date.textContent = parsedDate && !Number.isNaN(parsedDate.getTime())
      ? new Intl.DateTimeFormat(lang === "en" ? "en-US" : "pt-BR", { dateStyle: "medium" }).format(parsedDate)
      : label;
    card.appendChild(date);
    const heading = document.createElement("h3");
    heading.textContent = post.title || (lang === "en" ? "Untitled post" : "Publicação sem título");
    card.appendChild(heading);
    if (post.summary) {
      const summary = document.createElement("p");
      summary.textContent = post.summary;
      card.appendChild(summary);
    }
    return card;
  }

  async function fetchPosts(section, lang) {
    const folderLanguage = lang === "en" ? "en" : "pt";
    const listingUrl = "https://api.github.com/repos/" + repository +
      "/contents/content/" + section + "/" + folderLanguage + "?ref=main";
    const response = await fetch(listingUrl, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error("GitHub API: " + response.status);
    const files = await response.json();
    const markdownFiles = files.filter(file => file.type === "file" && file.name.endsWith(".md"));
    const posts = await Promise.all(markdownFiles.map(async file => {
      const fileResponse = await fetch(file.download_url);
      if (!fileResponse.ok) throw new Error("Não foi possível ler " + file.name);
      return parseFrontMatter(await fileResponse.text());
    }));
    return posts.filter(post => post && post.title)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }

  async function loadNews(lang) {
    if (!newsList) return;
    const requestId = ++newsRequest;
    const dictionary = window.AVALORIA_TRANSLATIONS[lang] || window.AVALORIA_TRANSLATIONS.pt;
    try {
      const posts = await fetchPosts("news", lang);
      if (requestId !== newsRequest) return;
      newsList.replaceChildren();
      if (posts.length) posts.forEach(post => newsList.appendChild(makePostCard(post, lang, lang === "en" ? "NEWS" : "NOTÍCIA")));
      else showNewsPlaceholder(dictionary);
    } catch (error) {
      if (requestId !== newsRequest) return;
      showNewsPlaceholder(dictionary);
      console.error("Não foi possível carregar as notícias de Avalória:", error);
    }
  }

  async function loadDevlog(lang) {
    if (!devlogList) return;
    const requestId = ++devlogRequest;
    const dictionary = window.AVALORIA_TRANSLATIONS[lang] || window.AVALORIA_TRANSLATIONS.pt;
    try {
      const posts = await fetchPosts("devlog", lang);
      if (requestId !== devlogRequest) return;
      devlogList.replaceChildren();
      if (posts.length) {
        posts.forEach(post => devlogList.appendChild(makePostCard(post, lang, lang === "en" ? "DEVLOG" : "DIÁRIO")));
      } else {
        showDevlogPlaceholder(dictionary);
      }
    } catch (error) {
      if (requestId !== devlogRequest) return;
      showDevlogPlaceholder(dictionary);
      console.error("Não foi possível carregar o diário de Avalória:", error);
    }
  }

  function showNewsPlaceholder(dictionary) {
    newsList.replaceChildren();
    const card = document.createElement("article");
    card.className = "post-card";
    const label = document.createElement("span");
    label.className = "post-date";
    label.textContent = "DEVLOG";
    const heading = document.createElement("h3");
    heading.textContent = dictionary["news.placeholderTitle"];
    const paragraph = document.createElement("p");
    paragraph.textContent = dictionary["news.placeholderText"];
    card.append(label, heading, paragraph);
    newsList.appendChild(card);
  }

  function showDevlogPlaceholder(dictionary) {
    devlogList.replaceChildren();
    const card = document.createElement("article");
    card.className = "post-card devlog-placeholder";
    const rune = document.createElement("span");
    rune.className = "large-rune";
    rune.textContent = "✧";
    const paragraph = document.createElement("p");
    paragraph.textContent = dictionary["devlog.placeholder"];
    card.append(rune, paragraph);
    devlogList.appendChild(card);
  }

  async function loadGallery(lang) {
    if (!galleryList) return;
    const requestId = ++galleryRequest;
    const dictionary = window.AVALORIA_TRANSLATIONS[lang] || window.AVALORIA_TRANSLATIONS.pt;
    try {
      const posts = await fetchPosts("gallery", lang);
      if (requestId !== galleryRequest) return;
      galleryList.replaceChildren();
      if (!posts.length) {
        showGalleryPlaceholder(dictionary);
        return;
      }
      posts.forEach(post => {
        const card = document.createElement("article");
        card.className = "gallery-card";
        if (post.image && (post.image.startsWith("/") || post.image.startsWith("https://"))) {
          const image = document.createElement("img");
          image.src = post.image;
          image.alt = post.title || "";
          image.loading = "lazy";
          card.appendChild(image);
        }
        const details = document.createElement("div");
        details.className = "gallery-card-content";
        const heading = document.createElement("h3");
        heading.textContent = post.title || (lang === "en" ? "Untitled image" : "Imagem sem título");
        details.appendChild(heading);
        if (post.description) {
          const description = document.createElement("p");
          description.textContent = post.description;
          details.appendChild(description);
        }
        if (post.video_url && post.video_url.startsWith("https://")) {
          const videoLink = document.createElement("a");
          videoLink.href = post.video_url;
          videoLink.target = "_blank";
          videoLink.rel = "noopener noreferrer";
          videoLink.textContent = lang === "en" ? "Watch video ↗" : "Assistir vídeo ↗";
          details.appendChild(videoLink);
        }
        card.appendChild(details);
        galleryList.appendChild(card);
      });
    } catch (error) {
      if (requestId !== galleryRequest) return;
      showGalleryPlaceholder(dictionary);
      console.error("Não foi possível carregar a galeria de Avalória:", error);
    }
  }

  function showGalleryPlaceholder(dictionary) {
    galleryList.replaceChildren();
    const placeholder = document.createElement("div");
    placeholder.className = "gallery-placeholder";
    const rune = document.createElement("span");
    rune.textContent = "✥";
    const paragraph = document.createElement("p");
    paragraph.textContent = dictionary["gallery.placeholder"];
    placeholder.append(rune, paragraph);
    galleryList.appendChild(placeholder);
  }

  function applyLanguage(lang) {
    const dictionary = window.AVALORIA_TRANSLATIONS[lang] || window.AVALORIA_TRANSLATIONS.pt;
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = dictionary[element.dataset.i18n];
      if (value !== undefined) element.innerHTML = value;
    });
    document.title = lang === "en" ? "Avalória — A new kingdom is being forged" : "Avalória — Um novo reino está sendo forjado";
    try { localStorage.setItem("avaloria-language", lang); } catch (_) {}
    loadNews(lang);
    loadDevlog(lang);
    loadGallery(lang);
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