class MapManager {
  constructor(app) {
    this.app = app;
  }

  // Setup SVG interactive map bindings
  initMapInteraction() {
    const selectEl = document.getElementById("district-select");

    // Populate dropdown
    if (selectEl) {
      selectEl.innerHTML = `<option value="">-- Select District --</option>`;
      Object.keys(DISTRICTS_DB).sort().forEach(code => {
        const info = DISTRICTS_DB[code];
        selectEl.innerHTML += `<option value="${code}">${info.name} (${info.tamilName})</option>`;
      });
      
      selectEl.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val) {
          this.selectDistrict(val);
        }
      });
    }

    // Access inline SVG elements inside the <object> container
    const svgObj = document.getElementById("tn-map-svg-object");
    if (svgObj) {
      const setupSvgDoc = () => {
        const svgDoc = svgObj.contentDocument;
        if (svgDoc) {
          svgDoc.documentElement.classList.toggle("dark", this.app.theme === "dark");
          const mapWrapper = document.querySelector(".map-wrapper");
          const tooltip = document.getElementById("map-tooltip");
          
          const groups = svgDoc.querySelectorAll(".district-group");
          groups.forEach(g => {
            g.addEventListener("click", () => {
              const code = g.getAttribute("data-code");
              this.selectDistrict(code);
            });

            // Map Hover Tooltip
            g.addEventListener("mouseenter", () => {
              const code = g.getAttribute("data-code");
              const info = DISTRICTS_DB[code];
              if (info && tooltip) {
                tooltip.textContent = `${info.name} (${info.tamilName})`;
                tooltip.classList.remove("hidden");
              }
            });

            g.addEventListener("mousemove", (e) => {
              if (tooltip && mapWrapper) {
                const rect = mapWrapper.getBoundingClientRect();
                const x = e.clientX - rect.left + 15;
                const y = e.clientY - rect.top + 15;
                tooltip.style.left = `${x}px`;
                tooltip.style.top = `${y}px`;
              }
            });

            g.addEventListener("mouseleave", () => {
              if (tooltip) tooltip.classList.add("hidden");
            });
          });
        }
      };

      // Set up click binding when fully loaded
      svgObj.addEventListener("load", setupSvgDoc);
      // Fallback check if it was already loaded
      if (svgObj.contentDocument) {
        setupSvgDoc();
      }
    }
  }

  selectDistrict(code) {
    this.app.selectedDistrict = code;
    
    // Highlight in external SVG object
    const svgObj = document.getElementById("tn-map-svg-object");
    if (svgObj && svgObj.contentDocument) {
      svgObj.contentDocument.querySelectorAll(".district-group").forEach(g => {
        g.classList.toggle("active", g.getAttribute("data-code") === code);
      });
    }

    // Update details card
    this.showDistrictDetails(code);

    // Auto-scroll to details card on mobile devices
    if (window.innerWidth < 900) {
      const detailsEl = document.getElementById("district-details");
      if (detailsEl) {
        detailsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  showDistrictDetails(code) {
    const detailsContainer = document.getElementById("district-details");
    if (!detailsContainer) return;

    const info = DISTRICTS_DB[code];
    if (!info) return;

    // Build the IT Hub badge if active
    const itBadge = info.itHub 
      ? `<span class="inline-flex items-center gap-1 rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">IT Hub</span>`
      : '';

    const t = (key, fallback) => this.app.translations[key] || fallback;

    detailsContainer.innerHTML = `
      <div class="animate-card-slide flex flex-col justify-between h-full">
        <div>
          <div class="flex flex-wrap sm:flex-nowrap items-start justify-between mb-4 gap-3">
            <div class="flex flex-col min-w-0">
              <h3 class="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gradient-tamil leading-none break-words">${info.name}</h3>
              <span class="text-[9px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">${t("map.details.districtCode", "District Code")}: ${code}</span>
            </div>
            <div class="flex flex-col items-start sm:items-end gap-1.5 min-w-0">
              <span class="tamil text-xl text-accent font-semibold leading-none break-words">${info.tamilName}</span>
              ${itBadge}
            </div>
          </div>
          
          <div class="space-y-4 text-sm leading-relaxed">
            <div>
              <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">${t("map.details.nameOrigin", "Name Origin")}</span>
              <p class="text-foreground/90 mt-1">${info.meaning}</p>
            </div>
            
            <div>
              <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">${t("map.details.history", "History & Legacy")}</span>
              <p class="text-foreground/90 mt-1">${info.history}</p>
            </div>

            <div>
              <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">${t("map.details.culture", "Cultural Signposts")}</span>
              <p class="text-foreground/90 mt-1">${info.culture}</p>
            </div>

            <div>
              <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">${t("map.details.companies", "Prominent Startups & Companies")}</span>
              <p class="text-foreground/90 font-semibold mt-1 text-accent">${info.companies}</p>
            </div>
            
            <div>
              <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">${t("map.details.personality", "Branding Personality")}</span>
              <p class="font-display text-base text-accent italic mt-1">${info.vibe}</p>
            </div>
          </div>
        </div>

        <div class="mt-6 border-t border-border/60 pt-6">
          <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-2">${t("map.details.inspirations", "Tamil Naming Inspirations")}</span>
          <div class="flex flex-wrap gap-1.5">
            ${info.keywords.map(kw => `
              <span class="text-xs bg-muted border border-border px-2.5 py-1 rounded-full text-foreground/80 cursor-pointer hover:border-accent hover:text-accent transition-colors" data-action="load-keyword-focus" data-word="${kw.replace(/'/g, "\\'")}">
                ${kw}
              </span>
            `).join("")}
          </div>
          <span class="text-[9px] text-muted-foreground mt-2 block italic">${t("map.details.clickToLoad", "Click any word to load it into the name generator.")}</span>
        </div>
      </div>
    `;
  }

  resetDistrictDetailsUI() {
    const detailsContainer = document.getElementById("district-details");
    if (!detailsContainer) return;
    
    const t = (key, fallback) => this.app.translations[key] || fallback;

    detailsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-20 text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-accent mb-4 opacity-75">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <circle cx="12" cy="11" r="3"/>
        </svg>
        <p class="${this.app.lang === 'ta' ? 'tamil' : ''}" data-i18n="map.prompt">
          ${t("map.prompt", "Click a district to begin exploring")}
        </p>
      </div>
    `;
  }

  // Fetch Kural from API
  async fetchThirukkural() {
    const kuralContainer = document.getElementById("kural-display");
    const nextKuralBtn = document.getElementById("next-kural-btn");
    if (!kuralContainer) return;

    const t = (key, fallback) => this.app.translations[key] || fallback;
    const hasExistingKural = kuralContainer.querySelector(".kural-couplet") !== null;

    if (hasExistingKural) {
      kuralContainer.classList.add("opacity-40", "pointer-events-none", "transition-opacity", "duration-200");
      if (nextKuralBtn) {
        nextKuralBtn.setAttribute("disabled", "true");
        nextKuralBtn.innerHTML = `
          <svg class="animate-spin h-3.5 w-3.5 text-muted-foreground mr-1.5 inline-block" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span>Loading...</span>
        `;
      }
    } else {
      kuralContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[160px] py-4">
          <div class="h-6 w-32 shimmer rounded mb-4"></div>
          <div class="h-4 w-64 shimmer rounded mb-2"></div>
          <div class="h-4 w-48 shimmer rounded"></div>
        </div>
      `;
    }

    try {
      const response = await fetch("https://kural.codewithram.dev/api/random");
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      this.renderKural(data);
    } catch (err) {
      console.error("Thirukkural API failed, using local fallback:", err);
      const fallbacks = [
        {
          number: 1,
          line1: "அகர முதல எழுத்தெல்லாம் ஆதி",
          line2: "பகவன் முதற்றே உலகு.",
          tam_exp: "எழுத்துக்கள் எல்லாம் அகரத்தை முதலாகக் கொண்டிருக்கின்றன; அதுபோல உலகம் ஆதி பகவனை முதலாகக் கொண்டிருக்கிறது.",
          translation: "As the letter A is the first of all letters, so the eternal God is first in the world.",
          section: { names: { ta: "அறத்துப்பால்", en: "Virtue" } },
          chapter: { names: { ta: "கடவுள் வாழ்த்து", en: "Praise of God" } }
        },
        {
          number: 2,
          line1: "கற்றதனால் ஆய பயனென்கொல் வாலறிவன்",
          line2: "நற்றாள் தொழாஅர் எனின்.",
          tam_exp: "தூய அறிவு வடிவாக விளங்கும் இறைவனுடைய நல்ல திருவடிகளைத் தொழாமல் இருப்பாரானால், அவர் கற்ற கல்வியினால் ஆகிய பயன் என்ன?",
          translation: "What fruit have they of their learning who worship not the good feet of Him who is possessed of pure knowledge?",
          section: { names: { ta: "அறத்துப்பால்", en: "Virtue" } },
          chapter: { names: { ta: "கடவுள் வாழ்த்து", en: "Praise of God" } }
        },
        {
          number: 7,
          line1: "தனக்குவமை இல்லாதான் தாள்சேர்ந்தார்க்கு அல்லால்",
          line2: "மனக்கவலை மாற்றல் அரிது.",
          tam_exp: "தனக்கு ஒப்புமை இல்லாத தலைவனுடைய திருவடிகளைப் பொருந்தி நினைக்கின்றவர்கற்கல்லாமல், மற்றவர்களுக்கு மனக்கவலையை மாற்றுவது அரிது.",
          translation: "Anxiety of mind cannot be removed, except for those who are united to the feet of Him who has no equal.",
          section: { names: { ta: "அறத்துப்பால்", en: "Virtue" } },
          chapter: { names: { ta: "கடவுள் வாழ்த்து", en: "Praise of God" } }
        },
        {
          number: 391,
          line1: "கற்க கசடறக் கற்பவை கற்றபின்",
          line2: "நிற்க அதற்குத் தக.",
          tam_exp: "கற்கத் தகுந்த நூல்களைக் குற்றமறக் கற்க வேண்டும்; அவ்வாறு கற்ற பிறகு, கற்ற கல்விக்குத் தக்கவாறு நெறியில் நிற்க வேண்டும்.",
          translation: "Let a man learn thoroughly whatever he may learn, and let his conduct be worthy of his learning.",
          section: { names: { ta: "பொருட்பால்", en: "Wealth" } },
          chapter: { names: { ta: "கல்வி", en: "Learning" } }
        },
        {
          number: 392,
          line1: "எண்ணென்ப ஏனை எழுத்தென்ப இவ்விரண்டும்",
          line2: "கண்ணென்ப வாழும் உயிர்க்கு.",
          tam_exp: "எண்கள் என்று சொல்லப்படுபவை, எழுத்துக்கள் என்று சொல்லப்படுபவை ஆகிய இவ்விரண்டையும் வாழும் மக்களுக்கு இரு கண்கள் என்று கூறுவர்.",
          translation: "Numbers and letters, they say, are the two eyes of living beings.",
          section: { names: { ta: "பொருட்பால்", en: "Wealth" } },
          chapter: { names: { ta: "கல்வி", en: "Learning" } }
        },
        {
          number: 394,
          line1: "உவப்பத் தலைக்கூடி உள்ளப் பிரிதல்",
          line2: "அனைத்தே புலவர் தொழில்.",
          tam_exp: "மகிழுமாறு கூடிப் பழகி, இனி இவரை எப்போது காண்போம் என்று வருந்துமாறு பிரிவது அறிஞர்களின் தொழிலாகும்.",
          translation: "The office of the learned is to meet with joy, and depart with regretful longing.",
          section: { names: { ta: "பொருட்பால்", en: "Wealth" } },
          chapter: { names: { ta: "கல்வி", en: "Learning" } }
        },
        {
          number: 396,
          line1: "தொட்டனைத் தூறும் மணற்கேணி மாந்தர்க்குக்",
          line2: "கற்றனைத் தூறும் அறிவு.",
          tam_exp: "மணற்பாங்கான இடத்தில் தோண்டத் தோண்ட நீர் ஊறும்; அதுபோல மக்களுக்குக் கற்கக் கற்க அறிவு வளரும்.",
          translation: "Water will flow from a sandy well in proportion to the depth to which it is dug, and knowledge will flow in proportion to learning.",
          section: { names: { ta: "பொருட்பால்", en: "Wealth" } },
          chapter: { names: { ta: "கல்வி", en: "Learning" } }
        },
        {
          number: 397,
          line1: "யாதானும் நாடாமல் ஊராமால் என்னொருவன்",
          line2: "சாந்துணையும் கல்லாத வாறு.",
          tam_exp: "கற்றவனுக்கு எந்த நாடும் சொந்த நாடாகும், எந்த ஊரும் சொந்த ஊராகும்; அப்படியிருக்க ஒருவன் சாகும் வரையில் கற்காமல் காலம் கழிப்பது ஏன்?",
          translation: "Why should any man remain unlearned till his death, when every land and city is his own?",
          section: { names: { ta: "பொருட்பால்", en: "Wealth" } },
          chapter: { names: { ta: "கல்வி", en: "Learning" } }
        },
        {
          number: 411,
          line1: "செல்வத்துள் செல்வம் செவிச்செல்வம் அச்செல்வம்",
          line2: "செல்வத்துள் எல்லாம் தலை.",
          tam_exp: "செல்வங்கள் பலவற்றுள்ளும் சிறந்த செல்வம் செவியால் கேட்டுப் பெறும் செல்வமாகும்; அந்தச் செல்வம் பிற செல்வங்கள் எல்லாவற்றிலும் முதன்மையானதாகும்.",
          section: { names: { ta: "பொருட்பால்", en: "Wealth" } },
          chapter: { names: { ta: "கேள்வி", en: "Listening" } }
        },
        {
          number: 781,
          line1: "செயற்கரிய யாவுள நட்பின் அதுபோல்",
          line2: "வினைக்கரிய யாவுள காப்பு.",
          tam_exp: "நட்பைப்போலச் செய்து கொள்வதற்கரிய அரிய செயல்கள் எவை உள்ளன? அதுபோலத் தொழிலுக்குச் சிறந்த பாதுகாப்பாக இருப்பவை எவை உள்ளன?",
          translation: "What is so difficult to acquire as friendship? What guard is so secure against the efforts of enemies?",
          section: { names: { ta: "பொருட்பால்", en: "Wealth" } },
          chapter: { names: { ta: "நட்பு", en: "Friendship" } }
        }
      ];
      const randomKural = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      this.renderKural(randomKural);
    } finally {
      kuralContainer.classList.remove("opacity-40", "pointer-events-none");
      if (nextKuralBtn) {
        nextKuralBtn.removeAttribute("disabled");
        nextKuralBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 inline-block mr-1">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          <span data-i18n="kural.next">${t("kural.next", "Get Another Kural")}</span>
        `;
      }
    }
  }

  parseSectionOrChapter(field) {
    if (!field) return { ta: "", en: "" };
    if (typeof field === "string") {
      return { ta: field.trim(), en: "" };
    }
    if (typeof field === "object") {
      const target = (field.names && typeof field.names === "object") ? field.names : field;
      const ta = target.ta || target.tam || target.tamil || target.ta_IN || (typeof field.name === "string" ? field.name : "") || "";
      const en = target.en || target.eng || target.english || target.en_US || "";
      return { ta: String(ta).trim(), en: String(en).trim() };
    }
    return { ta: "", en: "" };
  }

  renderKural(kural) {
    const kuralContainer = document.getElementById("kural-display");
    if (!kuralContainer) return;

    const t = (key, fallback) => this.app.translations[key] || fallback;
    let number = kural.number || kural.kural_no || "Kural";
    
    let line1 = "";
    let line2 = "";
    if (kural.kural && Array.isArray(kural.kural)) {
      line1 = kural.kural[0] || "";
      line2 = kural.kural[1] || "";
    } else {
      line1 = kural.line1 || kural.line_1 || "";
      line2 = kural.line2 || kural.line_2 || "";
    }
    
    let translation = "";
    if (kural.meaning && typeof kural.meaning === "object") {
      translation = kural.meaning.en || "";
    } else {
      translation = kural.translation || kural.eng || "";
    }
    
    let tamExp = "";
    if (kural.meaning && typeof kural.meaning === "object") {
      tamExp = kural.meaning.ta_mu_va || kural.meaning.ta_salamon || kural.meaning.ta_kalaignar || "";
    } else {
      tamExp = kural.tam_exp || kural.explanation || kural.tam_explanation || "";
    }
    
    let engExp = kural.eng_exp || kural.eng_explanation || "";

    const sectInfo = this.parseSectionOrChapter(kural.section || kural.sect || kural.paal);
    const chapInfo = this.parseSectionOrChapter(kural.chapter || kural.chap || kural.adhigaram);

    if (typeof DOMPurify !== "undefined") {
      line1 = DOMPurify.sanitize(line1);
      line2 = DOMPurify.sanitize(line2);
      translation = DOMPurify.sanitize(translation);
      tamExp = DOMPurify.sanitize(tamExp);
      engExp = DOMPurify.sanitize(engExp);
      sectInfo.ta = DOMPurify.sanitize(sectInfo.ta);
      sectInfo.en = DOMPurify.sanitize(sectInfo.en);
      chapInfo.ta = DOMPurify.sanitize(chapInfo.ta);
      chapInfo.en = DOMPurify.sanitize(chapInfo.en);
    }

    const metaBadges = (sectInfo.ta || chapInfo.ta) ? `
      <div class="flex flex-wrap items-center gap-2 mb-3.5 pr-8 text-xs font-medium">
        ${sectInfo.ta ? `<span class="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20" ${sectInfo.en ? `title="${sectInfo.en}"` : ''}>${sectInfo.ta}${sectInfo.en ? ` <span class="opacity-75 font-normal">(${sectInfo.en})</span>` : ''}</span>` : ''}
        ${chapInfo.ta ? `<span class="px-2.5 py-0.5 rounded-full bg-surface-hover text-muted-foreground border border-border/40" ${chapInfo.en ? `title="${chapInfo.en}"` : ''}>${chapInfo.ta}${chapInfo.en ? ` <span class="opacity-75 font-normal">(${chapInfo.en})</span>` : ''}</span>` : ''}
      </div>
    ` : '';

    kuralContainer.innerHTML = `
      <div class="animate-fade-up relative">
        <button class="absolute top-0 right-0 p-1 text-muted-foreground hover:text-accent transition-colors z-10" data-action="copy-kural" data-lines="${line1.replace(/'/g, "\\'")} ${line2.replace(/'/g, "\\'")}" data-trans="${translation.replace(/'/g, "\\'")}" title="Copy couplet">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        ${metaBadges}
        <p class="tamil kural-couplet text-accent font-semibold pr-6">${line1}<br>${line2}</p>
        
        <div class="mt-6 border-t border-border/60 pt-6 grid gap-4 sm:grid-cols-2 text-left text-sm text-muted-foreground">
          <div>
            <h4 class="font-display text-xs uppercase tracking-wider text-accent mb-2">${t("kural.tamilMeaning", "Tamil meaning (பொருள்)")}</h4>
            <p class="tamil text-foreground/80 leading-relaxed">${tamExp}</p>
          </div>
          <div>
            <h4 class="font-display text-xs uppercase tracking-wider text-accent mb-2">${t("kural.englishTranslation", "English Translation")}</h4>
            <p class="italic text-foreground/80 leading-relaxed">"${translation}"</p>
            ${engExp ? `<p class="mt-2 text-xs text-muted-foreground">${engExp}</p>` : ''}
          </div>
        </div>
        
        <span class="inline-block mt-4 text-[10px] uppercase tracking-wider text-muted-foreground">${t("kural.couplet", "Couplet")} ${number}</span>
      </div>
    `;
  }

  copyKuralText(lines, translation) {
    const text = `Thirukkural:
${lines}

Translation: ${translation}`;
    navigator.clipboard.writeText(text).then(() => {
      this.app.toast("Thirukkural copied!", "success");
    });
  }
}
