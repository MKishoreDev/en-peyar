class TranslationManager {
  constructor(app) {
    this.app = app;
  }

  // Load translations from JSON files
  async loadTranslations() {
    try {
      const response = await fetch(`/static/locales/${this.app.lang}.json`);
      if (!response.ok) throw new Error(`Could not load ${this.app.lang}.json`);
      this.app.translations = await response.json();
      document.documentElement.lang = this.app.lang;
      this.updateLanguageUI();
    } catch (err) {
      console.error("Failed to load translations:", err);
    }
  }

  // Toggle language between English and Tamil
  async toggleLanguage() {
    this.app.lang = this.app.lang === "en" ? "ta" : "en";
    localStorage.setItem("ep-lang", this.app.lang);
    await this.loadTranslations();
    
    // Refresh kural
    if (this.app.map) {
      this.app.map.fetchThirukkural();
    }
    
    // Update map details if a district is selected
    if (this.app.selectedDistrict) {
      this.app.map.showDistrictDetails(this.app.selectedDistrict);
    } else if (this.app.map) {
      this.app.map.resetDistrictDetailsUI();
    }
  }

  // Update DOM elements matching data-i18n and data-i18n-placeholder
  updateLanguageUI() {
    const langBtnText = document.getElementById("lang-btn-text");
    if (langBtnText) {
      langBtnText.textContent = this.app.lang === "en" ? "தமிழ்" : "English";
      langBtnText.classList.toggle("tamil", this.app.lang === "ta");
    }
    
    // Switch elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (this.app.translations[key]) {
        el.innerHTML = this.app.translations[key];
        if (this.app.lang === "ta") {
          el.classList.add("tamil");
        } else {
          el.classList.remove("tamil");
        }
      }
    });

    // Switch placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (this.app.translations[key]) {
        if (el.id === "keywords-input-field" && this.app.keywordTags && this.app.keywordTags.length > 0) {
          el.setAttribute("placeholder", "");
        } else {
          el.setAttribute("placeholder", this.app.translations[key]);
        }
      }
    });
    
    this.updateStyleDescription();
  }

  // Update description text for hovered or active naming style
  updateStyleDescription(hoveredStyle = null) {
    const descEl = document.getElementById("style-desc-text");
    if (!descEl) return;
    
    let style = hoveredStyle;
    if (!style) {
      const activeBtn = document.querySelector(".style-btn.active");
      style = activeBtn ? activeBtn.getAttribute("data-style") : "Global Tamil";
    }
    
    const styleKeys = {
      "Tamil": "generator.style.tamil.desc",
      "Global Tamil": "generator.style.globaltamil.desc",
      "English": "generator.style.english.desc",
      "Contextual Heritage": "generator.style.heritage.desc"
    };
    
    const key = styleKeys[style] || "generator.style.globaltamil.desc";
    const fallbackDesc = {
      "Tamil": "Pure Tamil brand names written in native script.",
      "Global Tamil": "Modern startup names derived from Tamil etymology and transliterated into Latin characters.",
      "English": "Founder-grade startup names in pure English without regional roots.",
      "Contextual Heritage": "Evocative names drawing from classical literature, ancient dynasties, and historical places (only when contextually justified)."
    }[style] || "";
    
    descEl.textContent = this.app.translations[key] || fallbackDesc;
    if (this.app.lang === "ta") {
      descEl.classList.add("tamil");
    } else {
      descEl.classList.remove("tamil");
    }
  }
}
