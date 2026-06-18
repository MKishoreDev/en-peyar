// En Peyar - Main Application Orchestrator

// Thesaurus Database grouped into Premium and Popular categories
const THESAURUS_DB = {
  "Premium Brand Roots (முதன்மையானவை)": [
    { word: "நயம்", latin: "Nayam", meaning: "Premium Quality", desc: "Value, goodness, refinement" },
    { word: "ஆழி", latin: "Aazhi", meaning: "Ocean", desc: "Vastness, scale, infinite deep" },
    { word: "விழுது", latin: "Vizhuthu", meaning: "Banyan Root", desc: "Foundation, support, security" },
    { word: "செம்மை", latin: "Semmai", meaning: "Excellence", desc: "Premium quality, purity, perfect form" },
    { word: "மரபு", latin: "Marabu", meaning: "Heritage", desc: "Tradition, trust, lineage" },
    { word: "முனை", latin: "Munai", meaning: "Pioneer / Vanguard", desc: "Sharp edge, focus, innovation" },
    { word: "ஏற்றம்", latin: "Aetram", meaning: "Elevation", desc: "Growth, progress, ambition" },
    { word: "அகம்", latin: "Agam", meaning: "Inner Core / Home", desc: "Privacy, essential self, core tech" },
    { word: "மொழி", latin: "Mozhi", meaning: "Language / Voice", desc: "Expression, communication, clarity" },
    { word: "வேர்", latin: "Ver", meaning: "Root / Origin", desc: "Authenticity, base foundation" }
  ],
  "Popular Roots (பிரபலமானவை)": [
    { word: "அறம்", latin: "Aram", meaning: "Virtue", desc: "Ethics, governance, trust" },
    { word: "ஒளி", latin: "Oli", meaning: "Light", desc: "Clarity, insights, intelligence" },
    { word: "அருவி", latin: "Aruvi", meaning: "Waterfall", desc: "Continuous flow, energy" },
    { word: "மலர்", latin: "Malar", meaning: "Blossom", desc: "Growth, organic wellness" },
    { word: "துளி", latin: "Thuli", meaning: "A drop", desc: "Micro-precision, focus" },
    { word: "மேகம்", latin: "Megam", meaning: "Cloud", desc: "Scalability, soft network power" },
    { word: "விண்", latin: "Vinn", meaning: "Sky / Space", concept: "High compute, aerospace, launch" },
    { word: "கரு", latin: "Karu", meaning: "Core Idea", desc: "Incubator, creation, blueprint" },
    { word: "கனவு", latin: "Kanavu", meaning: "Dream", desc: "Vision-first, aspirational design" }
  ]
};

// Inspire Me — curated Tamil root words for creative naming inspiration
const INSPIRE_ROOTS = [
  { word: "நயம்", roman: "Nayam", meaning: "Premium Quality / Value", concept: "A premium product built on quality, trust, or value-first services.", names: ["Nayam", "Nayamly", "Nayamco"] },
  { word: "ஆழி", roman: "Aazhi", meaning: "Ocean / Infinite Deep", concept: "A vast data lake, cloud infrastructure, or storage platform with infinite scale.", names: ["Aazhi", "Aazhio", "Aazhiscale"] },
  { word: "விழுது", roman: "Vizhuthu", meaning: "Banyan Root / Foundation", concept: "A strong infrastructure foundation, support network, or funding source.", names: ["Vizhuthu", "Vizhuthulabs", "Vizhuthi"] },
  { word: "செம்மை", roman: "Semmai", meaning: "Excellence / Perfection", concept: "A high-performance quality control, compliance, or premium design studio.", names: ["Semmai", "Semmaio", "Semmly"] },
  { word: "மரபு", roman: "Marabu", meaning: "Heritage / Tradition", concept: "A traditional craftsmanship brand, legal trust, or digital archiving system.", names: ["Marabu", "Marabuco", "Marabufy"] },
  { word: "முனை", roman: "Munai", meaning: "Pioneer / Vanguard Edge", concept: "A cutting-edge research laboratory, developer tool, or AI compiler platform.", names: ["Munai", "Munaitech", "Munaio"] },
  { word: "ஏற்றம்", roman: "Aetram", meaning: "Elevation / Progress", concept: "A career acceleration platform, performance booster, or investment advisor.", names: ["Aetram", "Aetramly", "Aetramflow"] },
  { word: "அகம்", roman: "Agam", meaning: "Home / Inner Core", concept: "Proptech, smart home, privacy-first cybersecurity, or intranet.", names: ["Agam", "Agamly", "Agamio"] },
  { word: "மொழி", roman: "Mozhi", meaning: "Language / Voice", concept: "A voice assistant, translation API, customer service chatbot, or speech tool.", names: ["Mozhi", "Mozhiworks", "Mozhify"] },
  { word: "வேர்", roman: "Ver", meaning: "Root / Origin", concept: "An identity, heritage, or founding platform — where it all began.", names: ["Vera", "Verbase", "Verix"] },
  { word: "அருவி", roman: "Aruvi", meaning: "Waterfall", concept: "A platform that flows continuously — payments, data, delivery.", names: ["Aruvi", "Aruvio", "Aruvify"] },
  { word: "அறம்", roman: "Aram", meaning: "Virtue / Righteousness", concept: "An ethical-first company — legal, HR, governance, or social impact.", names: ["Aram", "Aramlabs", "Aramly"] },
  { word: "ஒளி", roman: "Oli", meaning: "Light", concept: "A visibility or analytics product — dashboards, insights, clarity.", names: ["Oli", "Olivo", "Olibase"] },
  { word: "வான்", roman: "Vaan", meaning: "Sky / Heavens", concept: "An infrastructure or cloud company — limitless, expansive, above.", names: ["Vaan", "Vaanscale", "Vaanix"] },
  { word: "மலர்", roman: "Malar", meaning: "Blossom / Flower", concept: "A wellness, beauty, or community platform — growth from seed.", names: ["Malar", "Malarco", "Malara"] },
  { word: "சுடர்", roman: "Sudar", meaning: "Flame / Radiance", concept: "An energy, creative, or performance platform — burns bright.", names: ["Sudar", "Sudaro", "Sudarlabs"] },
  { word: "தெளிவு", roman: "Thelivu", meaning: "Clarity / Insight", concept: "A decision-making or AI tool — clears the fog.", names: ["Thelivu", "Theliv", "Thelivio"] },
  { word: "நலம்", roman: "Nalam", meaning: "Wellness / Good health", concept: "A health, mental wellness, or insurance platform.", names: ["Nalam", "Nalamio", "Nalamly"] },
  { word: "பயணம்", roman: "Payanam", meaning: "Journey / Travel", concept: "A logistics, travel, or career growth product.", names: ["Payanam", "Payana", "Payanar"] },
  { word: "கனவு", roman: "Kanavu", meaning: "Dream", concept: "A futures, creative, or vision-first brand — bold and aspirational.", names: ["Kanavu", "Kanavix", "Kanavora"] },
  { word: "ஆற்றல்", roman: "Aatral", meaning: "Capability / Energy", concept: "A productivity, energy, or performance platform.", names: ["Aatral", "Aatraly", "Aatralx"] },
  { word: "விண்", roman: "Vinn", meaning: "Space / Sky", concept: "An aerospace, drone tech, satellite, or cloud compute startup.", names: ["Vinn", "Vinnlabs", "Vinora"] },
  { word: "ஊற்று", roman: "Ootru", meaning: "Spring / Source", concept: "Content creation, generative AI, or open-source data streams.", names: ["Ootru", "Ootruflow", "Ootrufy"] },
  { word: "திசை", roman: "Thisai", meaning: "Direction", concept: "Navigation, routing, global expansion, or mapping strategies.", names: ["Thisai", "Thisaio", "Thisaimap"] }
];

// District database loaded asynchronously
let DISTRICTS_DB = {};
(async () => {
  try {
    const res = await fetch('/static/data/districts.json');
    DISTRICTS_DB = await res.json();
  } catch (e) {
    console.warn('Could not load districts.json', e);
  }
})();

// Helper to calculate brand score locally
function calculateBrandScore(name) {
  const n = name.trim();
  if (!n) return 0;
  const len = n.length;
  const lenScore = len >= 4 && len <= 10 ? 100 : Math.max(0, 100 - Math.abs(7 - len) * 12);
  
  const words = n.split(/\s+/).length;
  const simplicityScore = words === 1 ? 100 : Math.max(40, 100 - (words - 1) * 25);
  
  const vowels = (n.match(/[aeiouAEIOU]/g) || []).length;
  const ratio = vowels / Math.max(1, n.replace(/\s/g, "").length);
  const pronounce = ratio >= 0.3 && ratio <= 0.6 ? 100 : Math.max(40, 100 - Math.abs(0.45 - ratio) * 200);
  
  const unique = new Set(n.toLowerCase().replace(/\s/g, "")).size;
  const clusters = (n.match(/[bcdfghjklmnpqrstvwxz]{4,}/gi) || []).length;
  const memScore = Math.min(100, unique * 14) - clusters * 15;
  
  const score = Math.round(lenScore * 0.25 + simplicityScore * 0.2 + pronounce * 0.3 + memScore * 0.25);
  return Math.max(20, Math.min(100, score));
}

// Deterministic brand palette generator
function generateBrandPalette(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  const baseHue = Math.abs(hash) % 360;
  const accentHue = (baseHue + 35) % 360;
  return {
    primary: `hsl(${baseHue}, 65%, 48%)`,
    accent: `hsl(${accentHue}, 70%, 55%)`,
    neutral: `hsl(${baseHue}, 14%, 28%)`,
    bg: `hsl(${baseHue}, 30%, 96%)`,
    fg: '#ffffff',
    fgOnBg: `hsl(${baseHue}, 25%, 18%)`
  };
}

class AppController {
  constructor() {
    this.lang = localStorage.getItem("ep-lang") || "en";
    this.theme = localStorage.getItem("ep-theme") || "light";
    this.selectedDistrict = null;
    this.translations = {};
    this.favorites = JSON.parse(localStorage.getItem("ep-favorites")) || [];
    this.keywordTags = [];
    
    // Delegation Managers
    this.i18n = new TranslationManager(this);
    this.map = new MapManager(this);
    this.generator = new NamingGeneratorManager(this);
    
    this.init();
  }

  async init() {
    this.setupTheme();
    await this.i18n.loadTranslations();
    this.generator.initKeywordTags();
    this.bindEvents();
    this.map.fetchThirukkural();
    this.map.initMapInteraction();
    this.generator.updateFavoritesUI();
    this.generator.initThesaurus();
  }

  // Theme controls
  setupTheme() {
    document.documentElement.classList.toggle("dark", this.theme === "dark");
    this.updateThemeTogglerUI();
    setTimeout(() => this.updateSvgMapTheme(), 100);
  }

  toggleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark";
    localStorage.setItem("ep-theme", this.theme);
    document.documentElement.classList.toggle("dark", this.theme === "dark");
    this.updateThemeTogglerUI();
    this.updateSvgMapTheme();
  }

  updateSvgMapTheme() {
    const svgObj = document.getElementById("tn-map-svg-object");
    if (svgObj && svgObj.contentDocument) {
      const svgDoc = svgObj.contentDocument;
      if (svgDoc.documentElement) {
        svgDoc.documentElement.classList.toggle("dark", this.theme === "dark");
      }
    }
  }

  updateThemeTogglerUI() {
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");
    if (sunIcon && moonIcon) {
      if (this.theme === "dark") {
        sunIcon.classList.remove("hidden");
        moonIcon.classList.add("hidden");
      } else {
        sunIcon.classList.add("hidden");
        moonIcon.classList.remove("hidden");
      }
    }
  }

  // Audio Pronunciation logic
  playPronunciation(text, lang) {
    let cleanText = text.split("(")[0].replace(/[““”"]/g, "").trim();
    
    if (lang === "ta") {
       const tamilMatch = text.match(/[\u0B80-\u0BFF]+/g);
       if (tamilMatch) {
          cleanText = tamilMatch.join(" ");
       }
    }
    
    if (!cleanText) {
       this.toast("No text to speak", "error");
       return;
     }
    
    const speakLabel = this.translations["generator.label.speaking"] || "Speaking";
    this.toast(`${speakLabel}: "${cleanText}"`, "success");
    
    const ttsLang = lang === "ta" ? "ta" : "en";
    try {
      if (this._currentAudio) {
        this._currentAudio.pause();
        this._currentAudio = null;
      }
      const url = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=${ttsLang}`;
      const audio = new Audio(url);
      this._currentAudio = audio;
      audio.onerror = () => this._fallbackSpeak(cleanText, lang);
      audio.play().catch(() => this._fallbackSpeak(cleanText, lang));
    } catch (e) {
      this._fallbackSpeak(cleanText, lang);
    }
  }

  _fallbackSpeak(cleanText, lang) {
    if (!('speechSynthesis' in window)) {
      this.toast("Speech not supported in your browser.", "error");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === "ta" ? "ta-IN" : "en-IN";
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const langPrefix = lang === "ta" ? "ta" : "en-IN";
      let bestVoice = voices.find(v => v.lang.startsWith(langPrefix) && (v.name.includes("Natural") || v.name.includes("Premium") || v.name.includes("Google")));
      if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith(langPrefix));
      if (bestVoice) utterance.voice = bestVoice;
    }
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  }

  // Toast helper
  toast(message, type = "success") {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `p-3 rounded-lg text-xs font-semibold shadow-md border animate-fade-up max-w-sm flex items-center gap-2 ${
      type === "error" 
        ? "bg-red-500/10 border-red-500/20 text-red-500" 
        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
    }`;
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Inspire Me random trigger
  triggerInspire() {
    const panel = document.getElementById("inspiration-panel");
    const content = document.getElementById("inspiration-content");
    if (!panel || !content) return;

    const root = INSPIRE_ROOTS[Math.floor(Math.random() * INSPIRE_ROOTS.length)];
    const t = (key, fallback) => this.translations[key] || fallback;

    content.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 px-3 py-2 min-w-[3.5rem] rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <span class="tamil text-xl font-bold text-accent">${root.word}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-display text-lg font-bold text-foreground">${root.roman}</span>
            <span class="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">${root.meaning}</span>
          </div>
          <p class="mt-1.5 text-sm text-muted-foreground">${root.concept}</p>
        </div>
      </div>
      <div class="mt-4 pt-4 border-t border-border/60">
        <p class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">${t("inspire.names", "Could become")}</p>
        <div class="flex flex-wrap gap-2">
          ${root.names.map(nm => `
            <button class="px-3 py-1.5 rounded-full border border-border bg-muted/40 hover:border-primary/60 hover:bg-muted/80 text-sm font-semibold transition-all"
              onclick="window.app.generator.addKeywordTag('${root.roman.replace(/'/g, "\\'")}'); document.getElementById('inspiration-panel').classList.add('hidden'); window.app && window.app.toast('Keyword loaded — now generate!', 'success');">
              ${nm}
            </button>
          `).join("")}
        </div>
      </div>
      <div class="mt-4 pt-2">
        <button class="text-xs text-accent hover:underline font-semibold" onclick="window.app && window.app.triggerInspire()">Try another →</button>
      </div>
    `;

    panel.classList.remove("hidden");
  }

  // Bind core UI events
  bindEvents() {
    // Theme switch
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    // Language switch
    const langBtn = document.getElementById("lang-toggle-btn");
    if (langBtn) {
      langBtn.addEventListener("click", () => this.i18n.toggleLanguage());
    }

    // Mobile menu toggle
    const menuBtn = document.getElementById("menu-toggle-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
      });
    }

    // Clear shortlist button
    const clearShortlistBtn = document.getElementById("clear-shortlist-btn");
    if (clearShortlistBtn) {
      clearShortlistBtn.addEventListener("click", () => this.generator.clearShortlist());
    }

    // Clear keywords button
    const clearKeywordsBtn = document.getElementById("clear-keywords-btn");
    if (clearKeywordsBtn) {
      clearKeywordsBtn.addEventListener("click", () => this.generator.clearAllKeywords());
    }

    // Industry select change (for custom industry)
    const industrySelect = document.getElementById("industry-select");
    const customIndustryInput = document.getElementById("custom-industry-input");
    if (industrySelect && customIndustryInput) {
      industrySelect.addEventListener("change", (e) => {
        if (e.target.value === "Custom") {
          customIndustryInput.classList.remove("hidden");
          customIndustryInput.focus();
        } else {
          customIndustryInput.classList.add("hidden");
          customIndustryInput.value = "";
        }
      });
    }

    // Word corpus card clicks in thesaurus
    document.querySelectorAll(".group.relative.overflow-hidden.rounded-xl.border.border-border.bg-card.p-5").forEach(card => {
      const tamilWordEl = card.querySelector(".tamil");
      if (tamilWordEl) {
        const tamilWord = tamilWordEl.textContent.trim();
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
          this.generator.loadKeyword(tamilWord);
        });
      }
    });

    // District Explorer Search autocomplete
    const searchInput = document.getElementById("district-search");
    const suggestionsBox = document.getElementById("search-suggestions");
    if (searchInput && suggestionsBox) {
      searchInput.addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase().trim();
        if (!val) {
          suggestionsBox.classList.add("hidden");
          return;
        }

        const matches = Object.keys(DISTRICTS_DB).filter(code => {
          const info = DISTRICTS_DB[code];
          return info.name.toLowerCase().includes(val) || info.tamilName.includes(val);
        });

        if (matches.length > 0) {
          suggestionsBox.classList.remove("hidden");
          suggestionsBox.innerHTML = matches.map(code => {
            const info = DISTRICTS_DB[code];
            return `<div class="p-2.5 hover:bg-muted cursor-pointer border-b border-border/40 last:border-b-0" data-code="${code}">${info.name} (${info.tamilName})</div>`;
          }).join("");

          suggestionsBox.querySelectorAll("[data-code]").forEach(item => {
            item.addEventListener("click", () => {
              const code = item.getAttribute("data-code");
              this.map.selectDistrict(code);
              searchInput.value = DISTRICTS_DB[code].name;
              suggestionsBox.classList.add("hidden");
            });
          });
        } else {
          suggestionsBox.innerHTML = `<div class="p-2.5 text-muted-foreground text-xs">${this.translations["map.noMatch"] || "No district matched. Try another spelling."}</div>`;
          suggestionsBox.classList.remove("hidden");
        }
      });

      document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
          suggestionsBox.classList.add("hidden");
        }
      });
    }

    // Next Kural click
    const nextKuralBtn = document.getElementById("next-kural-btn");
    if (nextKuralBtn) {
      nextKuralBtn.addEventListener("click", () => this.map.fetchThirukkural());
    }

    // Inspire Me click
    const inspireBtn = document.getElementById("inspire-btn");
    const inspireCloseBtn = document.getElementById("inspire-close-btn");
    if (inspireBtn) {
      inspireBtn.addEventListener("click", () => this.triggerInspire());
    }
    if (inspireCloseBtn) {
      inspireCloseBtn.addEventListener("click", () => {
        const panel = document.getElementById("inspiration-panel");
        if (panel) panel.classList.add("hidden");
      });
    }

    // AI Refine context button
    const refineBtn = document.getElementById("refine-context-btn");
    if (refineBtn) {
      refineBtn.addEventListener("click", async () => {
        const kwInput = document.getElementById("keywords-input");
        const ctxInput = document.getElementById("context-input");
        const industrySelect = document.getElementById("industry-select");
        const loading = document.getElementById("refine-loading");
        const kwSugg = document.getElementById("keyword-suggestions");
        const kwChips = document.getElementById("keyword-chips");

        const keywords = kwInput ? kwInput.value.trim() : "";
        const context  = ctxInput ? ctxInput.value.trim() : "";

        if (!keywords && !context) {
          this.toast("Add keywords or a description first", "error");
          return;
        }

        refineBtn.disabled = true;
        if (loading) loading.classList.remove("hidden");
        if (kwSugg) kwSugg.classList.add("hidden");

        try {
          const resp = await fetch("/api/refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              keywords, context,
              industry: industrySelect ? industrySelect.value : "Startup"
            })
          });

          if (!resp.ok) {
            const err = await resp.json().catch(()=>({}));
            this.toast(err.message || "Refine failed", "error");
            return;
          }

          const data = await resp.json();

          if (data.refined && ctxInput) {
            ctxInput.value = data.refined;
            ctxInput.classList.add("ring-1","ring-accent/60");
            setTimeout(() => ctxInput.classList.remove("ring-1","ring-accent/60"), 2000);
          }

          if (data.industry) {
            const indSelect = document.getElementById("industry-select");
            const customIndInput = document.getElementById("custom-industry-input");
            if (indSelect) {
              const suggested = data.industry.trim();
              let matched = false;
              for (let option of indSelect.options) {
                if (option.value.toLowerCase() === suggested.toLowerCase()) {
                  indSelect.value = option.value;
                  matched = true;
                  break;
                }
              }
              if (matched) {
                if (customIndInput) {
                  customIndInput.classList.add("hidden");
                  customIndInput.value = "";
                }
              } else {
                indSelect.value = "Custom";
                if (customIndInput) {
                  customIndInput.classList.remove("hidden");
                  customIndInput.value = suggested;
                }
              }
              const highlightEl = matched ? indSelect : customIndInput;
              if (highlightEl) {
                highlightEl.classList.add("ring-1", "ring-accent/60");
                setTimeout(() => highlightEl.classList.remove("ring-1", "ring-accent/60"), 2000);
              }
            }
          }

          if (data.keywords && kwChips && kwSugg) {
            kwChips.innerHTML = "";
            data.keywords.forEach(kw => {
              const chip = document.createElement("button");
              chip.type = "button";
              chip.className = "px-3 py-1 rounded-full text-xs font-semibold border border-accent/30 bg-accent/5 text-accent hover:bg-accent/15 transition-colors";
              chip.textContent = kw;
              chip.addEventListener("click", () => {
                this.generator.addKeywordTag(kw);
                chip.classList.add("opacity-40","pointer-events-none");
              });
              kwChips.appendChild(chip);
            });
            kwSugg.classList.remove("hidden");
          }

          this.toast("Context refined ✦", "success");
        } catch (err) {
          this.toast("Could not reach the AI right now", "error");
        } finally {
          refineBtn.disabled = false;
          if (loading) loading.classList.add("hidden");
        }
      });
    }

    // Generator submit
    const generatorForm = document.getElementById("generator-form");
    if (generatorForm) {
      generatorForm.addEventListener("submit", (e) => this.generator.handleGeneratorSubmit(e));
    }
  }
}

// Global functions for event handlers
window.copyName = (name, tagline) => {
  const text = `${name} — ${tagline}`;
  navigator.clipboard.writeText(text).then(() => {
    if (window.app) {
      const msg = window.app.translations["generator.label.copied"] || "Name and tagline copied to clipboard!";
      window.app.toast(msg, "success");
    }
  }).catch(() => {
    if (window.app) {
      window.app.toast("Failed to copy", "error");
    }
  });
};

// Initialization entry point
document.addEventListener("DOMContentLoaded", () => {
  window.app = new AppController();
  
  const styleBtns = document.querySelectorAll(".style-btn");
  const setActive = (activeBtn) => {
    styleBtns.forEach(btn => {
      const isActive = btn === activeBtn;
      btn.classList.toggle("active", isActive);
      btn.classList.toggle("bg-primary", isActive);
      btn.classList.toggle("text-primary-foreground", isActive);
      btn.classList.toggle("border-primary", isActive);
      btn.classList.toggle("bg-background", !isActive);
      btn.classList.toggle("text-muted-foreground", !isActive);
      btn.classList.toggle("border-border", !isActive);
    });
    if (window.app) {
      window.app.currentStyle = activeBtn.getAttribute("data-style") || "Tamil";
      window.app.i18n.updateStyleDescription();
    }
  };

  const globalTamilBtn = Array.from(styleBtns).find(b => b.getAttribute("data-style") === "Global Tamil");
  if (globalTamilBtn) setActive(globalTamilBtn);

  styleBtns.forEach(btn => {
    btn.addEventListener("click", () => setActive(btn));
    
    btn.addEventListener("mouseenter", () => {
      if (window.app) {
        const styleName = btn.getAttribute("data-style");
        window.app.i18n.updateStyleDescription(styleName);
      }
    });
    
    btn.addEventListener("mouseleave", () => {
      if (window.app) {
        window.app.i18n.updateStyleDescription();
      }
    });
  });
});
