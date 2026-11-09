const body = document.body;
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const menuLabel = document.querySelector("[data-menu-label]");
const navigation = document.querySelector("[data-navigation]");
const navLinks = [...document.querySelectorAll(".primary-navigation a[href^='#']")];
const languageButtons = [...document.querySelectorAll("[data-language]")];
const languageNotice = document.querySelector("[data-language-notice]");
const programTabs = [...document.querySelectorAll("[data-program-tab]")];
const programPanels = [...document.querySelectorAll("[data-program-panel]")];
const dictionaryForm = document.querySelector("[data-dictionary-form]");
const dictionaryQuery = document.querySelector("[data-dictionary-query]");
const dictionaryResults = document.querySelector("[data-dictionary-results]");
const searchDialog = document.querySelector("[data-search-dialog]");
const siteSearch = document.querySelector("[data-site-search]");
const siteSearchResults = document.querySelector("[data-site-search-results]");
const previewDialog = document.querySelector("[data-preview-dialog]");
const coalitionDialog = document.querySelector("[data-coalition-dialog]");
const reviewDialog = document.querySelector("[data-review-dialog]");
const detailDialog = document.querySelector("[data-detail-dialog]");
const cinema = document.querySelector("[data-cinema]");
const motionToggle = document.querySelector("[data-motion-toggle]");
const motionLabel = document.querySelector("[data-motion-label]");
const cinemaScene = document.querySelector("[data-cinema-scene]");
const cinemaFrame = document.querySelector("[data-cinema-frame]");

const dictionaryEntries = [
  {
    karen: "ကညီ",
    english: "Karen / K'nyaw",
    description: "A Karen-language identifier used in the project's approved interface foundation.",
    terms: "karen knyaw k'nyaw ကညီ",
  },
  {
    karen: "ကညီကျိာ်",
    english: "S'gaw Karen language",
    description: "Used for the language review label in this prototype.",
    terms: "sgaw s'gaw karen language ကညီကျိာ် ကညီ",
  },
];

const siteIndex = [
  {
    title: "KOA vision and mission",
    description: "Organization purpose, national unity, education, and solidarity",
    terms: "about vision mission purpose history unity",
    target: "#about",
  },
  {
    title: "Civic education and advocacy",
    description: "Advocacy 101, Washington trips, local action, and youth leadership",
    terms: "civic education advocacy youth washington leadership",
    target: "#programs",
    program: "advocacy",
  },
  {
    title: "Community education and engagement",
    description: "Martyrs' Day, sports, arts, culture, visits, and workshops",
    terms: "community culture arts sports martyrs workshops events",
    target: "#programs",
    program: "community",
  },
  {
    title: "Humanitarian assistance",
    description: "Basic needs, Kawthoolei trips, education, and training",
    terms: "humanitarian food water shelter displaced kawthoolei border",
    target: "#programs",
    program: "humanitarian",
  },
  {
    title: "Karen portfolio",
    description: "Website, identity, and community-reviewed language tools",
    terms: "portfolio projects website identity tools design",
    target: "#portfolio",
  },
  {
    title: "Review: Karen dictionary preview",
    description: "Review-only Karen-language identifiers and local search",
    terms: "review dictionary language sgaw s'gaw Karen ကညီ ကညီကျိာ်",
    target: "#dictionary-preview",
  },
  {
    title: "Coalition partners",
    description: "Eleven organizations named in the KOA brochure",
    terms: "coalition partners organizations directory",
    target: "#resources",
    action: "coalition",
  },
  {
    title: "Community resources",
    description: "Youth, events, humanitarian support, updates, and directory ideas",
    terms: "resources help events youth support facebook directory",
    target: "#resources",
  },
  {
    title: "Contact KOA",
    description: "Brochure-listed leadership and public email paths",
    terms: "contact email president secretary coordinator nay htoo greh moo eh nay thaw",
    target: "#contact",
  },
];

const portfolioDetails = {
  website: {
    title: "Verified website prototype",
    body: `
      <p>This local V4 provides responsive navigation, a mobile-preview frame, program tabs,
      full-site search, dictionary lookup, English and Karen review modes, and reduced-motion support.</p>
      <p class="review-note">It is a review prototype, not an official KOA publication.</p>
    `,
  },
  identity: {
    title: "Identity review gates",
    body: `
      <p>The KOA logo and supplied photography are used in this prototype. KOA should confirm the
      official logo file, image permissions, captions, color system, and partner-logo permissions before launch.</p>
    `,
  },
  language: {
    title: "Community-reviewed language model",
    body: `
      <p>The safe sequence is: approved English source, fluent S'gaw Karen translation, second
      community review, source and reviewer record, then publication. AI may assist a draft later,
      but it should not bypass human approval or expose private text to an unapproved provider.</p>
    `,
  },
};

function normalize(value) {
  return value.trim().toLocaleLowerCase();
}

let menuReturnFocus = null;

function closeMenu({ restoreFocus = true } = {}) {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open global navigation");
  if (menuLabel) menuLabel.textContent = "Menu";
  navigation.dataset.open = "false";
  navigation.setAttribute("aria-hidden", "true");
  navigation.inert = true;
  body.classList.remove("menu-open");
  if (restoreFocus && menuReturnFocus instanceof HTMLElement) menuReturnFocus.focus();
}

function openMenu() {
  if (!menuButton || !navigation) return;
  menuReturnFocus = document.activeElement;
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Close global navigation");
  if (menuLabel) menuLabel.textContent = "Close";
  navigation.dataset.open = "true";
  navigation.setAttribute("aria-hidden", "false");
  navigation.inert = false;
  body.classList.add("menu-open");
  window.requestAnimationFrame(() => navigation.querySelector("summary")?.focus());
}

function openDialog(dialog) {
  if (!dialog || dialog.open) return;
  dialog.showModal();
  body.classList.add("dialog-open");
}

function closeDialog(dialog) {
  if (!dialog?.open) return;
  dialog.close();
}

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("close", () => {
    if (![...document.querySelectorAll("dialog")].some((item) => item.open)) {
      body.classList.remove("dialog-open");
    }
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });
});

document.querySelectorAll("[data-dialog-close]").forEach((button) => {
  button.addEventListener("click", () => closeDialog(button.closest("dialog")));
});

menuButton?.addEventListener("click", () => {
  const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
  if (willOpen) openMenu();
  else closeMenu();
});

navigation.inert = true;
navLinks.forEach((link) => link.addEventListener("click", () => closeMenu({ restoreFocus: false })));

function selectProgram(name, focus = false) {
  const nextTab = programTabs.find((tab) => tab.dataset.programTab === name);
  const nextPanel = programPanels.find((panel) => panel.dataset.programPanel === name);
  if (!nextTab || !nextPanel) return;

  programTabs.forEach((tab) => {
    const selected = tab === nextTab;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  programPanels.forEach((panel) => {
    panel.hidden = panel !== nextPanel;
  });

  if (focus) nextTab.focus();
}

programTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectProgram(tab.dataset.programTab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % programTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + programTabs.length) % programTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = programTabs.length - 1;
    selectProgram(programTabs[nextIndex].dataset.programTab, true);
  });
});

document.querySelectorAll("[data-select-program]").forEach((link) => {
  link.addEventListener("click", () => selectProgram(link.dataset.selectProgram));
});

function renderDictionary(query = "") {
  if (!dictionaryResults) return;
  const term = normalize(query);
  const matches = term
    ? dictionaryEntries.filter((entry) => normalize(entry.terms).includes(term))
    : dictionaryEntries;

  dictionaryResults.replaceChildren();

  if (!matches.length) {
    const empty = document.createElement("div");
    empty.className = "dictionary-empty";
    const title = document.createElement("strong");
    title.textContent = `No reviewed entry for “${query}”`;
    const note = document.createElement("p");
    note.textContent =
      "This prototype will not invent a translation. Add a source and fluent community review before publishing a new entry.";
    empty.append(title, note);
    dictionaryResults.append(empty);
    return;
  }

  matches.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "word-card";

    const word = document.createElement("p");
    word.className = "word";
    word.lang = "ksw";
    word.textContent = entry.karen;

    const copy = document.createElement("div");
    const label = document.createElement("p");
    label.className = "eyebrow";
    label.textContent = "Verified identifier";
    const title = document.createElement("h3");
    title.textContent = entry.english;
    const description = document.createElement("p");
    description.textContent = entry.description;
    copy.append(label, title, description);
    card.append(word, copy);
    dictionaryResults.append(card);
  });
}

dictionaryForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  renderDictionary(dictionaryQuery?.value ?? "");
});

dictionaryQuery?.addEventListener("input", () => {
  if (!dictionaryQuery.value) renderDictionary();
});

function renderSiteSearch(query = "") {
  if (!siteSearchResults) return;
  const term = normalize(query);
  siteSearchResults.replaceChildren();

  if (!term) {
    const hint = document.createElement("p");
    hint.textContent = "Start typing to search this local prototype.";
    siteSearchResults.append(hint);
    return;
  }

  const terms = term.split(/\s+/).filter(Boolean);
  const matches = siteIndex.filter((item) => {
    const haystack = normalize(`${item.title} ${item.description} ${item.terms}`);
    return terms.every((searchTerm) => haystack.includes(searchTerm));
  });

  if (!matches.length) {
    const empty = document.createElement("p");
    empty.textContent = `No local result for “${query}”. Try youth, history, coalition, or ကညီ.`;
    siteSearchResults.append(empty);
    return;
  }

  matches.forEach((item) => {
    const result = document.createElement("button");
    result.type = "button";
    result.className = "site-search-result";
    result.setAttribute("role", "option");

    const title = document.createElement("strong");
    title.textContent = item.title;
    const description = document.createElement("span");
    description.textContent = item.description;
    result.append(title, description);

    result.addEventListener("click", () => {
      if (item.program) selectProgram(item.program);
      closeDialog(searchDialog);
      document.querySelector(item.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (item.action === "coalition") {
        window.setTimeout(() => openDialog(coalitionDialog), 500);
      }
    });

    siteSearchResults.append(result);
  });
}

document.querySelectorAll("[data-search-open]").forEach((button) => {
  button.addEventListener("click", () => {
    openDialog(searchDialog);
    window.requestAnimationFrame(() => siteSearch?.focus());
  });
});

siteSearch?.addEventListener("input", () => renderSiteSearch(siteSearch.value));

document.addEventListener("keydown", (event) => {
  const menuIsOpen = menuButton?.getAttribute("aria-expanded") === "true";
  if (event.key === "Escape" && menuIsOpen) {
    event.preventDefault();
    closeMenu();
    return;
  }

  if (event.key === "Tab" && menuIsOpen && navigation) {
    const focusable = [...navigation.querySelectorAll("summary, a[href], button:not([disabled])")].filter(
      (element) => element instanceof HTMLElement && element.offsetParent !== null,
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  const typing =
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    event.target?.isContentEditable;
  if (event.key === "/" && !typing && !document.querySelector("dialog[open]")) {
    event.preventDefault();
    openDialog(searchDialog);
    window.requestAnimationFrame(() => siteSearch?.focus());
  }
});

document.querySelector("[data-preview-open]")?.addEventListener("click", () => openDialog(previewDialog));
document.querySelector("[data-coalition-open]")?.addEventListener("click", () => openDialog(coalitionDialog));
document.querySelector("[data-review-open]")?.addEventListener("click", () => openDialog(reviewDialog));

document.querySelectorAll("[data-detail]").forEach((button) => {
  button.addEventListener("click", () => {
    const detail = portfolioDetails[button.dataset.detail];
    if (!detail || !detailDialog) return;
    detailDialog.querySelector("[data-detail-title]").textContent = detail.title;
    detailDialog.querySelector("[data-detail-body]").innerHTML = detail.body;
    openDialog(detailDialog);
  });
});

function setLanguage(language) {
  const isKaren = language === "ksw";
  document.documentElement.lang = language;
  body.dataset.language = language;
  languageButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });
  if (languageNotice) languageNotice.hidden = !isKaren;
  localStorage.setItem("koa-v4-language", language);
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});

const storedLanguage = localStorage.getItem("koa-v4-language");
if (storedLanguage === "ksw" || storedLanguage === "en") {
  setLanguage(storedLanguage);
}

const previewMode = new URLSearchParams(window.location.search).get("preview");
if (previewMode === "mobile") body.dataset.preview = "mobile";

function setMotion(mode, persist = true) {
  const reveals = mode === "reveals";
  document.documentElement.dataset.motion = reveals ? "reveals" : "reduced";
  motionToggle?.setAttribute("aria-pressed", String(reveals));
  if (motionLabel) motionLabel.textContent = reveals ? "Reveal motion" : "Reduced";
  if (persist) localStorage.setItem("koa-v4-motion", reveals ? "reveals" : "reduced");
}

setMotion(document.documentElement.dataset.motion === "reduced" ? "reduced" : "reveals", false);

motionToggle?.addEventListener("click", () => {
  const next = document.documentElement.dataset.motion === "reveals" ? "reduced" : "reveals";
  setMotion(next);
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const headerSentinelObserver = new IntersectionObserver(
  ([entry]) => {
    if (header) header.dataset.scrolled = String(!entry.isIntersecting);
  },
  { threshold: 0.01 },
);

if (cinema) headerSentinelObserver.observe(cinema);
