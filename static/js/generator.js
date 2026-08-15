class NamingGeneratorManager {
  constructor(app) {
    this.app = app;
  }

  initKeywordTags() {
    const wrapper = document.getElementById("keyword-tags-wrapper");
    const inputField = document.getElementById("keywords-input-field");

    if (!wrapper || !inputField) return;

    wrapper.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      inputField.focus();
    });

    inputField.addEventListener("focus", () => {
      wrapper.classList.add("ring-2", "ring-primary/50", "border-primary");
    });
    inputField.addEventListener("blur", () => {
      wrapper.classList.remove("ring-2", "ring-primary/50", "border-primary");
      const value = inputField.value.trim();
      if (value) {
        this.addKeywordTag(value);
      }
    });

    inputField.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const value = inputField.value.trim();
        if (value) {
          this.addKeywordTag(value);
        }
      } else if (e.key === "Backspace" && !inputField.value) {
        e.preventDefault();
        if (this.app.keywordTags.length > 0) {
          this.removeKeywordTag(this.app.keywordTags.length - 1);
        }
      }
    });
  }

  addKeywordTag(tag) {
    if (!tag) return;
    
    const parts = tag.split(",");
    parts.forEach(part => {
      let clean = part.trim().replace(/\s+/g, " ");
      if (typeof DOMPurify !== "undefined") {
        clean = DOMPurify.sanitize(clean);
      }
      if (clean.startsWith("#")) {
        clean = clean.substring(1).trim();
      }
      if (!clean) return;

      const displayTag = `#${clean}`;
      if (!this.app.keywordTags.includes(displayTag)) {
        this.app.keywordTags.push(displayTag);
      }
    });

    this.renderKeywordTags();

    const inputField = document.getElementById("keywords-input-field");
    if (inputField) {
      inputField.value = "";
    }
  }

  removeKeywordTag(index) {
    if (index >= 0 && index < this.app.keywordTags.length) {
      this.app.keywordTags.splice(index, 1);
      this.renderKeywordTags();
    }
  }

  clearAllKeywords() {
    this.app.keywordTags = [];
    this.renderKeywordTags();
  }

  renderKeywordTags() {
    const tagList = document.getElementById("keyword-tags-list");
    const hiddenInput = document.getElementById("keywords-input");
    const inputField = document.getElementById("keywords-input-field");
    const clearBtn = document.getElementById("clear-keywords-btn");
    
    if (!tagList || !hiddenInput) return;

    tagList.innerHTML = this.app.keywordTags.map((tag, idx) => `
      <span class="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent text-xs font-semibold pl-3 pr-2 py-1 rounded-full animate-fade-up">
        <span>${tag}</span>
        <button type="button" class="text-accent hover:text-primary transition-colors focus:outline-none flex items-center justify-center rounded-full p-0.5 hover:bg-accent/10" data-action="remove-keyword" data-idx="${idx}" aria-label="Remove tag">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </span>
    `).join("");

    hiddenInput.value = this.app.keywordTags.join(", ");

    if (clearBtn) {
      if (this.app.keywordTags.length > 0) {
        clearBtn.classList.remove("hidden");
      } else {
        clearBtn.classList.add("hidden");
      }
    }

    if (inputField) {
      if (this.app.keywordTags.length > 0) {
        inputField.setAttribute("placeholder", "");
      } else {
        const placeholderText = this.app.translations["generator.keywordsPlaceholder"] || "e.g. food delivery in Tirunelveli";
        inputField.setAttribute("placeholder", placeholderText);
      }
    }
  }

  initThesaurus() {
    const grid = document.getElementById("thesaurus-grid");
    if (!grid) return;
    grid.innerHTML = Object.keys(THESAURUS_DB).map(category => `
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-accent font-semibold">${category}</h4>
        <div class="space-y-2">
          ${THESAURUS_DB[category].map(item => `
            <div class="p-3 bg-card border border-border/60 rounded-xl hover:border-primary/40 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm" data-action="load-keyword" data-word="${item.word}">
              <div class="flex items-baseline justify-between">
                <span class="tamil font-bold text-foreground text-sm">${item.word}</span>
                <span class="text-[10px] text-muted-foreground">${item.latin}</span>
              </div>
              <p class="text-[11px] text-foreground/80 mt-1">${item.meaning} — <span class="italic text-muted-foreground text-[10px]">${item.desc}</span></p>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  loadKeyword(word) {
    this.addKeywordTag(word);
    const generatorEl = document.getElementById("generator");
    if (generatorEl) {
      generatorEl.scrollIntoView({ behavior: 'smooth' });
    }
    const inputField = document.getElementById("keywords-input-field");
    if (inputField) {
      inputField.focus();
    }
    this.app.toast(`Loaded keyword: "${word}"`, "success");
  }

  async handleGeneratorSubmit(e) {
    e.preventDefault();
    const keywordsInput = document.getElementById("keywords-input");
    const styleBtns = document.querySelectorAll(".style-btn");
    const industrySelect = document.getElementById("industry-select");
    const submitBtn = document.getElementById("generator-submit-btn");
    
    if (!keywordsInput || !submitBtn) return;
    
    const keywords = keywordsInput.value.trim();
    const contextInput = document.getElementById("context-input");
    const context = contextInput ? contextInput.value.trim() : "";
    if (!keywords && !context) {
      this.app.toast("Please add some keywords or a detailed description first", "error");
      return;
    }

    let style = "Tamil";
    styleBtns.forEach(btn => {
      if (btn.classList.contains("active")) {
        style = btn.getAttribute("data-style");
      }
    });
    this.app.currentStyle = style;

    let industry = industrySelect ? industrySelect.value : "Startup";
    if (industry === "Custom") {
      const customInput = document.getElementById("custom-industry-input");
      if (customInput && customInput.value.trim()) {
        industry = customInput.value.trim();
      } else {
        industry = "Custom";
      }
    }
    
    submitBtn.setAttribute("disabled", "true");
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg class="animate-spin h-4 w-4 text-background mr-2" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <span data-i18n="generator.submitting">${this.app.translations["generator.submitting"] || "Generating…"}</span>
    `;

    const resultsContainer = document.getElementById("generator-results");
    if (resultsContainer) {
      resultsContainer.classList.remove("hidden");

      const loadingTexts = [
        { ta: "சொல்லை தேடுகிறோம்", en: "Searching for the word" },
        { ta: "வேரை கண்டோம்", en: "Finding the root" },
        { ta: "பொருளை நேர்த்தி செய்கிறோம்", en: "Refining the meaning" },
        { ta: "பெயர் உருவாகிறது", en: "The name is forming" },
      ];
      let lIdx = 0;

      const renderLoading = () => {
        const lt = loadingTexts[Math.min(lIdx, loadingTexts.length - 1)];
        const pct = Math.round(((lIdx + 1) / loadingTexts.length) * 90);
        resultsContainer.innerHTML = `
          <div class="py-20 flex flex-col items-center gap-8 text-center select-none">
            <!-- Tamil Kolam Spinner -->
            <div class="relative w-24 h-24 mx-auto">
              <svg viewBox="0 0 96 96" class="w-24 h-24" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="kg1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="hsl(var(--primary))"/>
                    <stop offset="100%" stop-color="hsl(var(--gold))"/>
                  </linearGradient>
                  <linearGradient id="kg2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="hsl(var(--gold))"/>
                    <stop offset="100%" stop-color="hsl(var(--bronze))"/>
                  </linearGradient>
                </defs>
                <circle cx="48" cy="48" r="42" fill="none" stroke="hsl(var(--border))" stroke-width="1.5"/>
                <circle cx="48" cy="48" r="42" fill="none" stroke="url(#kg1)" stroke-width="3" stroke-linecap="round" class="kolam-ring-outer"/>
                <circle cx="48" cy="48" r="28" fill="none" stroke="hsl(var(--border))" stroke-width="1"/>
                <circle cx="48" cy="48" r="28" fill="none" stroke="url(#kg2)" stroke-width="2" stroke-linecap="round" class="kolam-ring-inner"/>
                <circle cx="48" cy="5"  r="2.5" fill="hsl(var(--gold))" class="kolam-dot"/>
                <circle cx="91" cy="48" r="2.5" fill="hsl(var(--primary))" class="kolam-dot"/>
                <circle cx="48" cy="91" r="2.5" fill="hsl(var(--gold))" class="kolam-dot"/>
                <circle cx="5"  cy="48" r="2.5" fill="hsl(var(--primary))" class="kolam-dot"/>
                <circle cx="19" cy="19" r="1.5" fill="hsl(var(--bronze)/0.6)" class="kolam-dot"/>
                <circle cx="77" cy="19" r="1.5" fill="hsl(var(--bronze)/0.6)" class="kolam-dot"/>
                <circle cx="77" cy="77" r="1.5" fill="hsl(var(--bronze)/0.6)" class="kolam-dot"/>
                <circle cx="19" cy="77" r="1.5" fill="hsl(var(--bronze)/0.6)" class="kolam-dot"/>
                <circle cx="48" cy="48" r="7" fill="hsl(var(--primary)/0.15)"/>
                <circle cx="48" cy="48" r="4" fill="hsl(var(--primary))" class="kolam-centre"/>
                <circle cx="48" cy="48" r="2" fill="hsl(var(--gold))"/>
              </svg>
            </div>
            <!-- Text -->
            <div class="space-y-2">
              <p class="tamil text-xl font-bold text-gradient-tamil loading-fade" style="animation:fadeUp 0.5s ease both">${lt.ta}</p>
              <p class="text-sm text-muted-foreground loading-fade" style="animation:fadeUp 0.5s 0.1s ease both">${lt.en}</p>
            </div>
            <!-- Progress bar -->
            <div class="w-56 h-0.5 rounded-full bg-muted overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700 ease-out" style="width:${pct}%;background:linear-gradient(to right,hsl(var(--primary)),hsl(var(--gold)))"></div>
            </div>
            <!-- Skeleton cards -->
            <div class="grid gap-3 sm:grid-cols-2 w-full max-w-lg mt-2">
              ${[1,2,3,4].map((_, i) => `
                <div class="rounded-xl border border-border bg-card p-4 space-y-2.5" style="animation:fadeUp 0.5s ${i*80}ms ease both">
                  <div class="flex items-center gap-2">
                    <div class="h-6 w-24 shimmer rounded-full"></div>
                    <div class="h-5 w-5 shimmer rounded-md ml-auto"></div>
                  </div>
                  <div class="h-2.5 w-full shimmer rounded-full"></div>
                  <div class="h-2.5 w-4/5 shimmer rounded-full"></div>
                  <div class="h-2 w-16 shimmer rounded-full opacity-50"></div>
                </div>`).join("")}
            </div>
          </div>`;
      };

      renderLoading();
      const stageTimer = setInterval(() => {
        lIdx++;
        if (lIdx < loadingTexts.length) renderLoading();
        else clearInterval(stageTimer);
      }, 2000);

      resultsContainer.scrollIntoView({ behavior: "smooth" });
      resultsContainer._stageTimer = stageTimer;
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, style, industry, context })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Name generation failed");
      }

      if (resultsContainer && resultsContainer._stageTimer) clearInterval(resultsContainer._stageTimer);

      const result = await response.json();
      if (result.names && Array.isArray(result.names) && typeof DOMPurify !== "undefined") {
        result.names = result.names.map(n => ({
          name: DOMPurify.sanitize(n.name || ""),
          meaning: DOMPurify.sanitize(n.meaning || ""),
          pronunciation: DOMPurify.sanitize(n.pronunciation || ""),
          tagline: DOMPurify.sanitize(n.tagline || ""),
          tamilRoot: DOMPurify.sanitize(n.tamilRoot || ""),
          territory: DOMPurify.sanitize(n.territory || "")
        }));
      }
      this.renderGeneratedNames(result.names);
    } catch (err) {
      if (resultsContainer && resultsContainer._stageTimer) clearInterval(resultsContainer._stageTimer);
      this.app.toast(err.message || "Something went wrong", "error");
      
      const msg = err.message || "Generation failed";
      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
            <div class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl mx-auto">⚠️</div>
            <p class="font-display text-lg font-bold text-foreground">Something went wrong</p>
            <p class="text-sm text-muted-foreground max-w-sm mx-auto">${msg}</p>
          </div>`;
      }
    } finally {
      submitBtn.removeAttribute("disabled");
      submitBtn.innerHTML = originalBtnHTML;
    }
  }

  renderGeneratedNames(names) {
    window.lastGeneratedNames = names;
    window.lastGeneratedApp = this.app;

    const resultsContainer = document.getElementById("generator-results");
    if (!resultsContainer) return;

    const t = (key, fallback) => this.app.translations[key] || fallback;
    const isTamil = this.app.lang === "ta";
    const style = this.app.currentStyle || "Global Tamil";
    const isTamilStyle = style === "Tamil";

    if (!names || !names.length) {
      resultsContainer.innerHTML = `
        <div class="text-center py-16 text-muted-foreground space-y-3">
          <div class="text-5xl">—</div>
          <p class="font-display text-lg font-semibold text-foreground">Every name begins with an idea.</p>
          <p class="text-sm${isTamil ? ' tamil' : ''}">${t("generator.noNames", "Try different keywords or expand your description.")}</p>
        </div>`;
      return;
    }

    const scored = names.map((n, i) => ({ ...n, _idx: i, _score: calculateBrandScore(n.name) }));
    const bestIdx = scored.reduce((best, n) => n._score > best._score ? n : best, scored[0])._idx;

    function getPersonalityTags(name, tamilRoot) {
      const tags = [];
      const n = name.toLowerCase();
      const len = name.length;
      const hasRoot = tamilRoot && tamilRoot !== "N/A";
      if (len <= 5) tags.push("Minimal");
      if (len >= 8) tags.push("Expressive");
      const vowels = (n.match(/[aeiou]/g)||[]).length;
      const ratio = vowels / Math.max(1, n.replace(/\s/g,"").length);
      if (ratio > 0.5) tags.push("Melodic");
      if (ratio < 0.3) tags.push("Sharp");
      if (/[auo]$/.test(n)) tags.push("Smooth ending");
      if (hasRoot) tags.push("Tamil-rooted");
      if (/[kptvb]/.test(n.slice(0,1).toLowerCase())) tags.push("Bold open");
      return tags.slice(0, 3);
    }

    function scoreBar(value, label) {
      const pct = Math.max(0, Math.min(100, value));
      const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#94a3b8";
      return `<div class="space-y-0.5">
        <div class="flex justify-between text-[9px]">
          <span class="text-muted-foreground">${label}</span>
          <span class="font-bold" style="color:${color}">${pct}</span>
        </div>
        <div class="h-1 rounded-full bg-muted overflow-hidden">
          <div class="h-full rounded-full transition-all duration-700" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>`;
    }

    function getScoreBreakdown(name) {
      const n = name.trim();
      const len = n.replace(/\s/g,"").length;
      const words = n.split(/\s+/).length;
      const vowels = (n.match(/[aeiouAEIOU]/g)||[]).length;
      const ratio = vowels / Math.max(1, len);
      const unique = new Set(n.toLowerCase().replace(/\s/g,"")).size;
      const clusters = (n.match(/[bcdfghjklmnpqrstvwxz]{3,}/gi)||[]).length;

      const mem   = Math.min(100, Math.round((len >= 4 && len <= 8 ? 95 : Math.max(40, 100 - Math.abs(6-len)*10)) * 0.5 + unique * 8 * 0.5 - clusters * 10));
      const pron  = Math.round(ratio >= 0.3 && ratio <= 0.6 ? 92 : Math.max(45, 100 - Math.abs(0.45-ratio)*180));
      const brand = Math.min(100, Math.round(words === 1 ? 95 : Math.max(45, 100-(words-1)*20)));
      const orig  = Math.min(100, Math.round(unique * 13 + (len >= 5 && len <= 9 ? 12 : 0)));

      return { mem: Math.max(30, mem), pron: Math.max(30, pron), brand: Math.max(30, brand), orig: Math.max(30, orig) };
    }

    resultsContainer.innerHTML = "";
    resultsContainer.classList.remove("hidden");

    // BEST PICK CARD
    const best = names[bestIdx];
    const bestScore = calculateBrandScore(best.name);
    const bestBreak = getScoreBreakdown(best.name);
    const bestTags = getPersonalityTags(best.name, best.tamilRoot);
    const bestPalette = generateBrandPalette(best.name);
    const bestTamilDisplay = (isTamilStyle && best.tamilRoot && best.tamilRoot !== "N/A")
      ? best.tamilRoot.split("(")[0].trim() : "";
    const bestInitials = best.name.split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();

    const bestCard = document.createElement("div");
    bestCard.className = "animate-fade-up mb-6";
    bestCard.innerHTML = `
      <div class="relative overflow-hidden rounded-2xl border-2 border-accent/40 bg-card shadow-lg" style="box-shadow: 0 0 0 1px hsla(var(--gold),0.2), 0 20px 50px -20px hsla(var(--primary),0.35)">
        <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse 80% 60% at 50% -20%, hsla(var(--gold),0.08), transparent 70%)"></div>
        <div class="flex items-center gap-2 px-5 py-2.5 border-b border-border/60 bg-muted/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="hsl(var(--gold))" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span class="text-[11px] font-bold tracking-wide text-accent uppercase${isTamil ? " tamil" : ""}">${t("generator.bestPick", "Best Pick")}</span>
        </div>
        <div class="p-6 sm:p-8">
          <div class="grid gap-8 sm:grid-cols-[1fr_auto]">
            <div class="space-y-4">
              <div>
                <div class="flex flex-wrap items-center gap-3">
                  <h2 class="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">${best.name}</h2>
                  ${bestTamilDisplay ? `<span class="tamil text-2xl text-gradient-tamil font-bold">${bestTamilDisplay}</span>` : ""}
                  <button class="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors" onclick="window.app.playPronunciation('${best.name.replace(/'/g,"\\'")}','en')" title="Listen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  </button>
                  <button class="p-1.5 rounded-full text-muted-foreground hover:text-accent hover:bg-muted transition-colors" onclick="window.app.generator.toggleFavorite('${best.name.replace(/'/g,"\\'")}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="favorite-icon-${best.name}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </button>
                </div>
                <p class="text-xs text-muted-foreground mt-1">${best.pronunciation}</p>
              </div>
              <p class="text-sm text-foreground/80 leading-relaxed max-w-prose">${best.meaning}</p>
              <p class="text-sm italic text-accent/80 font-medium">"${best.tagline}"</p>
              <div class="flex flex-wrap gap-2">
                ${bestTags.map(tag => `<span class="px-2.5 py-1 rounded-full text-[10px] font-semibold border border-accent/20 bg-accent/5 text-accent">${tag}</span>`).join("")}
                ${best.territory ? `<span class="px-2.5 py-1 rounded-full text-[10px] font-semibold border border-border bg-muted/40 text-muted-foreground">${best.territory}</span>` : ""}
              </div>
              <div class="grid grid-cols-2 gap-x-6 gap-y-2 pt-2 max-w-sm">
                ${scoreBar(bestBreak.mem, "Memorability")}
                ${scoreBar(bestBreak.pron, "Pronunciation")}
                ${scoreBar(bestBreak.brand, "Brandability")}
                ${scoreBar(bestBreak.orig, "Originality")}
              </div>
              <div class="flex flex-wrap gap-2 pt-2">
                <button class="btn btn-primary text-xs px-5 py-2 rounded-full" data-action="open-modal" data-idx="${bestIdx}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  ${t("generator.showDetails","Full Details + Logo Prompt")}
                </button>
                <button class="btn btn-secondary text-xs px-5 py-2 rounded-full border border-border" onclick="copyName('${best.name.replace(/'/g,"\\'")}','${best.tagline.replace(/'/g,"\\'")}')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  ${t("generator.copy","Copy")}
                </button>
              </div>
            </div>
            <div class="hidden sm:flex flex-col items-center gap-3">
              <div class="h-24 w-24 rounded-2xl flex items-center justify-center shadow-lg" style="background:linear-gradient(135deg,${bestPalette.primary},${bestPalette.accent});color:${bestPalette.fg}">
                <span class="font-display text-3xl font-bold">${bestInitials}</span>
              </div>
              <div class="flex gap-1">
                ${["primary","accent","neutral","bg"].map(k => `<span class="h-4 w-4 rounded-full border border-border/50" style="background:${bestPalette[k]}"></span>`).join("")}
              </div>
              <div class="text-center">
                <div class="font-display text-3xl font-bold text-gradient-tamil">${bestScore}</div>
                <div class="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">${t("generator.score","score")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    resultsContainer.appendChild(bestCard);

    // OTHER NAMES GRID
    const gridTitle = document.createElement("div");
    gridTitle.className = "mb-4 flex items-center gap-2";
    gridTitle.innerHTML = `
      <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">${t("generator.allNames","All Names")}</span>
      <span class="text-xs text-muted-foreground">(${names.length} generated)</span>`;
    resultsContainer.appendChild(gridTitle);

    const grid = document.createElement("div");
    grid.className = "grid gap-4 sm:grid-cols-2";

    names.forEach((n, i) => {
      if (i === bestIdx) return;

      const score = calculateBrandScore(n.name);
      const breakdown = getScoreBreakdown(n.name);
      const tags = getPersonalityTags(n.name, n.tamilRoot);
      const palette = generateBrandPalette(n.name);
      const initials = n.name.split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
      const scoreColor = score >= 80 ? "text-emerald-500" : score >= 65 ? "text-amber-500" : "text-muted-foreground";
      const tamilDisplay = (isTamilStyle && n.tamilRoot && n.tamilRoot !== "N/A")
        ? n.tamilRoot.split("(")[0].trim() : "";
      const showRoot = style !== "Global Tamil" && n.tamilRoot && n.tamilRoot !== "N/A";
      const rootDisplay = showRoot ? n.tamilRoot.split("(")[0].trim() : "";

      const card = document.createElement("article");
      card.className = "animate-fade-up hover-lift rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3";
      card.style.animationDelay = `${i * 40}ms`;
      card.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-display text-2xl font-bold tracking-tight">${n.name}${tamilDisplay ? ` <span class="tamil text-base text-gradient-tamil ml-1">${tamilDisplay}</span>` : ""}</h3>
              <button class="p-1 text-muted-foreground hover:text-primary transition-colors" onclick="window.app.playPronunciation('${n.name.replace(/'/g,"\\'")}','en')" title="Listen">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              </button>
              <button class="p-1 text-muted-foreground hover:text-accent transition-colors" onclick="window.app.generator.toggleFavorite('${n.name.replace(/'/g,"\\'")}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="favorite-icon-${n.name}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </button>
            </div>
            <p class="text-[10px] text-muted-foreground">${n.pronunciation}</p>
          </div>
          <div class="flex flex-col items-center gap-1 shrink-0">
            <div class="h-9 w-9 rounded-lg flex items-center justify-center text-[11px] font-bold" style="background:linear-gradient(135deg,${palette.primary},${palette.accent});color:${palette.fg}">${initials}</div>
            <span class="font-display text-base font-bold ${scoreColor}">${score}</span>
          </div>
        </div>
        <p class="text-xs text-foreground/75 leading-relaxed">${n.meaning}</p>
        <p class="text-[11px] italic text-accent/70">"${n.tagline}"</p>
        <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
          ${scoreBar(breakdown.mem, "Memory")}
          ${scoreBar(breakdown.pron, "Pronounce")}
        </div>
        <div class="flex flex-wrap gap-1.5 pt-1">
          ${tags.map(tag => `<span class="px-2 py-0.5 rounded-full text-[9px] font-semibold border border-border bg-muted/40 text-muted-foreground">${tag}</span>`).join("")}
          ${rootDisplay ? `<span class="px-2 py-0.5 rounded-full text-[9px] font-semibold border border-accent/20 bg-accent/5 text-accent tamil">${rootDisplay}</span>` : ""}
          ${n.territory ? `<span class="px-2 py-0.5 rounded-full text-[9px] font-semibold border border-border bg-muted/40 text-muted-foreground">${n.territory}</span>` : ""}
        </div>
        <div class="flex gap-2 pt-1 border-t border-border/40 mt-1">
          <button class="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg py-2 transition-colors" data-action="open-modal" data-idx="${i}">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
            ${t("generator.showDetails","Details")}
          </button>
          <button class="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg py-2 transition-colors" onclick="copyName('${n.name.replace(/'/g,"\\'")}','${n.tagline.replace(/'/g,"\\'")}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            ${t("generator.copy","Copy")}
          </button>
        </div>`;
      grid.appendChild(card);
    });

    resultsContainer.appendChild(grid);

    // Tips Banner
    const tipsContainer = document.createElement("div");
    tipsContainer.className = "mt-8 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur text-xs text-muted-foreground space-y-4 animate-fade-up";
    tipsContainer.style.animationDelay = `${names.length * 40}ms`;

    let tipsHTML = "";
    if (style === "Tamil") {
      tipsHTML += `
        <div class="flex items-start gap-2.5">
          <svg class="w-4 h-4 text-accent shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span class="font-bold text-foreground block mb-0.5" data-i18n="generator.recommendation.tamilTitle">Recommended Option</span>
            <span data-i18n="generator.recommendation.tamil">${t("generator.recommendation.tamil", "Recommended: If you are not satisfied with pure Tamil names, try generating in Global Tamil mode.")}</span>
          </div>
        </div>
      `;
    }

    tipsHTML += `
      <div class="flex items-start gap-2.5">
        <svg class="w-4 h-4 text-accent shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <div>
          <span class="font-bold text-foreground block mb-0.5" data-i18n="generator.recommendation.generalTitle">Tips for Better Results</span>
          <span data-i18n="generator.recommendation.general">${t("generator.recommendation.general", "Tip: If you didn't get the expected names or outputs, try modifying your keywords and adding more detailed context/vision to get better results.")}</span>
        </div>
      </div>
    `;
    tipsContainer.innerHTML = tipsHTML;
    resultsContainer.appendChild(tipsContainer);

    resultsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    this.updateFavoritesUI();
  }

  toggleFavorite(name) {
    const idx = this.app.favorites.indexOf(name);
    if (idx > -1) {
      this.app.favorites.splice(idx, 1);
      this.app.toast(`Removed "${name}" from shortlist`, "success");
    } else {
      this.app.favorites.push(name);
      this.app.toast(`Added "${name}" to shortlist`, "success");
    }
    localStorage.setItem("ep-favorites", JSON.stringify(this.app.favorites));
    this.updateFavoritesUI();
  }

  updateFavoritesUI() {
    document.querySelectorAll("[class^='favorite-icon-']").forEach(svg => {
      const cls = Array.from(svg.classList).find(c => c.startsWith("favorite-icon-"));
      if (cls) {
        const name = cls.replace("favorite-icon-", "");
        const isFav = this.app.favorites.includes(name);
        svg.setAttribute("fill", isFav ? "currentColor" : "none");
        svg.classList.toggle("text-accent", isFav);
      }
    });

    const container = document.getElementById("shortlist-container");
    const listEl = document.getElementById("shortlist-list");
    if (container && listEl) {
      if (this.app.favorites.length > 0) {
        container.classList.remove("hidden");
        listEl.innerHTML = this.app.favorites.map(name => `
          <div class="inline-flex items-center gap-1.5 bg-card border border-border pl-3.5 pr-1.5 py-1 rounded-full text-xs font-semibold text-foreground shadow-sm animate-fade-up">
            <span>${name}</span>
            <button class="p-0.5 text-muted-foreground hover:text-red-500 rounded-full transition-colors" onclick="window.app.generator.toggleFavorite('${name.replace(/'/g, "\\'")}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
              </svg>
            </button>
          </div>
        `).join("");
      } else {
        container.classList.add("hidden");
      }
    }
  }

  clearShortlist() {
    this.app.favorites = [];
    localStorage.setItem("ep-favorites", JSON.stringify(this.app.favorites));
    this.updateFavoritesUI();
    this.app.toast("Cleared shortlist", "success");
  }
}

