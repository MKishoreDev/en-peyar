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
          <div class="flex items-center justify-between mb-4">
            <div class="flex flex-col">
              <h3 class="font-display text-3xl font-bold tracking-tight text-gradient-tamil leading-none">${info.name}</h3>
              <span class="text-[9px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">${t("map.details.districtCode", "District Code")}: ${code}</span>
            </div>
            <div class="flex flex-col items-end gap-1.5">
              <span class="tamil text-xl text-accent font-semibold leading-none">${info.tamilName}</span>
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
              <span class="text-xs bg-muted border border-border px-2.5 py-1 rounded-full text-foreground/80 cursor-pointer hover:border-accent hover:text-accent transition-colors" onclick="window.app.generator.loadKeyword('${kw.replace(/'/g, "\\'")}'); document.getElementById('keywords-input-field').focus();">
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
      const response = await fetch("https://tamil-kural-api.vercel.app/api/random");
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      this.renderKural(data);
    } catch (err) {
      console.error("Thirukkural API failed:", err);
      kuralContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[160px] py-4 text-center">
          <p class="text-xs text-muted-foreground">${t("kural.error", "Could not fetch Thirukkural. Try again.")}</p>
        </div>
      `;
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

    kuralContainer.innerHTML = `
      <div class="animate-fade-up relative">
        <button class="absolute top-0 right-0 p-1 text-muted-foreground hover:text-accent transition-colors" onclick="window.app.map.copyKuralText('${line1.replace(/'/g, "\\'")} ${line2.replace(/'/g, "\\'")}', '${translation.replace(/'/g, "\\'")}')" title="Copy couplet">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
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
