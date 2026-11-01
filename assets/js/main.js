(() => {
  const languageSelect = document.getElementById("language");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const newsList = document.getElementById("news-list");
  const repository = "falcone011/avaloria-portal";
  let newsRequest = 0;

  function parseFrontMatter(markdown) {
    const match = markdown.match(/^---\\s*\\r?\\n([\\s\\S]*?)\\r?\\n---(?:\\r?\\n|$)/);
    if (!match) return null;
    const yaml = match[1];
    const readScalar = (key) => {
      const found = yaml.match(new RegExp("^" + key + ":\\s*(.*)$", "m"));
      return found ? found[1].trim().replace(/^["']|["']$/g, "") : "";
    };
    const summaryBlock = yaml.match(/^summary:\\s*[|>]?-?\\s*\\r?\\n((?:[ \\t]+.*(?:\\r?\\n|$))*)/m);
    let summary = readScalar("summary");
    if (summaryBlock) {
      summary = summaryBlock[1].split(/\\r?\\n/).map(line => line.replace(/^\\s{1,}/, "")).join(" ").trim();
    }
    return {
      title: readScalar("title"),
      summary,
      date: readScalar("date"),
      image: readScalar("image")
    };
  }

  function makeNewsCard(post, lang) {
    const card = document.createElement("article");
    card.className = "post-card";

    if (post.image && (/^\\//.test(post.image) || /^https:\\/\\//i.test(post.image))) {
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
      : (lang === "en" ? "NEWS" : "NOTÍCIA");
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

  async function loadNews(lang) {
    if (!newsList) return;
    const requestId = ++newsRequest;
    const folderLanguage = lang === "en" ? "en" : "pt";
    const dictionary = window.AVALORIA_TRANSLATIONS[lang] || window.AVALORIA_TRANSLATIONS.pt;

    try {
      const listingUrl = "https://api.github.com/repos/" + repository +
        "/contents/content/news/" + folderLanguage + "?ref=main";
      const response = await fetch(listingUrl, {
        headers: { Accept: "application/vnd.github+json" }
      });
      if (!response.ok) throw new Error("GitHub API: " + response.status);
      const files = await response.json();
      const markdownFiles = files.filter(file => file.type === "file" && file.name.endsWith(".md"));
      const posts = await Promise.all(markdownFiles.map(async file => {
        const fileResponse = await fetch(file.download_url);
        if (!fileResponse.ok) throw new Error("Não foi possível ler " + file.name);
        return parseFrontMatter(await fileResponse.text());
      }));

      if (requestId !== newsRequest) return;
      const publishedPosts = posts.filter(post => post && post.title)
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

      newsList.replaceChildren();
      if (publishedPosts.length) {
        publishedPosts.forEach(post => newsList.appendChild(makeNewsCard(post, lang)));
      } else {
        showNewsPlaceholder(dictionary);
      }
    } catch (error) {
      if (requestId !== newsRequest) return;
      showNewsPlaceholder(dictionary);
      console.error("Não foi possível carregar as notícias de Avalória:", error);
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