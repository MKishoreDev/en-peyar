// Global functions for modal overlay controls
window.openDetailsModal = (index) => {
  const names = window.lastGeneratedNames;
  const app = window.lastGeneratedApp;
  if (!names || !names[index] || !app) return;
  
  const n = names[index];
  const t = (key, fallback) => app.translations[key] || fallback;
  const isTamil = app.lang === "ta";
  const style = app.currentStyle || "Tamil";
  const showTamilRootDetails = style !== "Global Tamil" && n.tamilRoot && n.tamilRoot !== "N/A";
  
  const modal = document.getElementById('details-modal');
  const content = document.getElementById('details-modal-content');
  if (!modal || !content) return;
  
  const tlds = ['com', 'in', 'ai', 'io', 'co'];
  
  content.innerHTML = `
    <div class="mb-4">
      <h2 class="font-display text-3xl font-bold">${n.name}</h2>
      <p class="text-sm text-muted-foreground italic">"${n.tagline}"</p>
    </div>
    
    <!-- Tab Headers -->
    <div class="flex border-b border-border/40 gap-1.5 pb-1.5 mb-4 overflow-x-auto">
      <button type="button" class="px-3 py-1.5 rounded-md bg-muted font-bold text-primary${isTamil ? ' tamil' : ''}" id="tab-det-btn-${index}" data-action="switch-tab" data-idx="${index}" data-tab="det">${t("generator.tab.details", "Name Details")}</button>
      <button type="button" class="px-3 py-1.5 rounded-md text-muted-foreground font-semibold hover:text-foreground${isTamil ? ' tamil' : ''}" id="tab-mock-btn-${index}" data-action="switch-tab" data-idx="${index}" data-tab="mock">${t("generator.tab.brandPreview", "Brand Preview")}</button>
      <button type="button" class="px-3 py-1.5 rounded-md text-muted-foreground font-semibold hover:text-foreground${isTamil ? ' tamil' : ''}" id="tab-dom-btn-${index}" onclick="switchDetailTab(${index}, 'dom'); checkDomainAvailability('${n.name.replace(/'/g, "\\'")}', ${index});">${t("generator.label.estimatedAvailability", "Estimated Availability")}</button>
      <button type="button" class="px-3 py-1.5 rounded-md text-muted-foreground font-semibold hover:text-foreground${isTamil ? ' tamil' : ''}" id="tab-logo-btn-${index}" data-action="switch-tab" data-idx="${index}" data-tab="logo">${t("generator.tab.logo", "Logo Prompt")}</button>
    </div>

    <!-- Tab 1: Details -->
    <div id="tab-det-content-${index}" class="space-y-4 text-sm">
      ${showTamilRootDetails ? `
        <div class="grid grid-cols-[100px_1fr] gap-3 items-center">
          <span class="uppercase tracking-wider text-muted-foreground font-semibold${isTamil ? ' tamil' : ''}">${t("generator.label.tamilRoot", "Tamil Root")}</span>
          <span class="text-foreground/90 font-semibold flex items-center gap-1.5">
            <span class="tamil text-base">${n.tamilRoot}</span>
            <button type="button" class="p-1 text-muted-foreground hover:text-primary transition-colors flex items-center" onclick="window.app.playPronunciation('${n.tamilRoot.replace(/'/g, "\\'")}', 'ta')" title="Listen (Tamil)">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </button>
          </span>
        </div>
      ` : ""}
      <div class="grid grid-cols-[100px_1fr] gap-3 items-center">
        <span class="uppercase tracking-wider text-muted-foreground font-semibold${isTamil ? ' tamil' : ''}">${t("generator.label.pronounce", "Pronounce")}</span>
        <span class="text-foreground/90 flex items-center gap-1.5">
          <span>${n.pronunciation}</span>
          <button type="button" class="p-1 text-muted-foreground hover:text-primary transition-colors flex items-center" onclick="window.app.playPronunciation('${n.name.replace(/'/g, "\\'")}', 'en')" title="Listen (English)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          </button>
        </span>
      </div>
      <div class="grid grid-cols-[100px_1fr] gap-3">
        <span class="uppercase tracking-wider text-muted-foreground font-semibold${isTamil ? ' tamil' : ''}">Meaning</span>
        <span class="text-foreground/90">${n.meaning}</span>
      </div>
      ${n.territory ? `
      <div class="grid grid-cols-[100px_1fr] gap-3">
        <span class="uppercase tracking-wider text-muted-foreground font-semibold${isTamil ? ' tamil' : ''}">Territory</span>
        <span class="text-foreground/90 font-semibold text-accent">${n.territory}</span>
      </div>` : ""}
      <div class="flex gap-2 pt-4">
        <button type="button" class="inline-flex items-center gap-1 rounded border border-border px-3 py-2 hover:bg-muted text-xs font-semibold transition-colors" onclick="copyName('${n.name.replace(/'/g, "\\'")}', '${n.tagline.replace(/'/g, "\\'")}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span${isTamil ? ' class="tamil"' : ''}>${t("generator.label.copyInfo", "Copy Info")}</span>
        </button>
      </div>
    </div>
    
    <!-- Tab 2: Brand Preview -->
    <div id="tab-mock-content-${index}" class="hidden space-y-4">
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="p-5 rounded-2xl bg-card border border-border relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[160px] w-full text-left col-span-1 sm:col-span-2">
          <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span class="font-display text-lg font-bold text-primary">${n.name[0]}</span>
          </div>
          <div>
            <h4 class="font-display text-xl font-bold text-foreground leading-none flex items-center gap-2">
              ${n.name}
              <button class="p-1 text-muted-foreground hover:text-primary transition-colors" onclick="window.app.playPronunciation('${n.name.replace(/'/g, "\'")}', 'en')" title="Listen (English)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              </button>
            </h4>
            <p class="text-[10px] text-muted-foreground mt-1.5 tracking-wider uppercase">${n.tagline}</p>
          </div>
          <div class="mt-6 border-t border-border/60 pt-3 flex justify-between items-end text-[9px] text-muted-foreground font-mono">
            <div>
              <p>hello@${n.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com</p>
              <p>www.${n.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com</p>
            </div>
            <p class="font-bold text-primary${isTamil ? ' tamil' : ''}">${t("generator.label.tamilNaduIndia", "Tamil Nadu, India")}</p>
          </div>
        </div>
        
        ${(() => {
          const palette = generateBrandPalette(n.name);
          const initials = n.name.split(/\s+/).map(w => w[0]).join('').slice(0,2).toUpperCase();
          return `
        <div class="p-4 rounded-xl bg-background border border-border flex flex-col justify-center items-center min-h-[120px]">
          <div class="h-16 w-16 rounded-2xl flex items-center justify-center mb-2 shadow-sm" style="background: linear-gradient(135deg, ${palette.primary}, ${palette.accent}); color: ${palette.fg};">
            <span class="font-display text-2xl font-bold">${initials}</span>
          </div>
          <span class="text-[9px] text-muted-foreground font-semibold${isTamil ? ' tamil' : ''}">${t("generator.label.brandMark", "Brand Mark")}</span>
        </div>
        <div class="p-4 rounded-xl bg-background border border-border flex flex-col justify-center items-center min-h-[120px]">
          <div class="flex gap-1.5 mb-2">
            <span class="h-9 w-7 rounded-md border border-border/50" style="background:${palette.primary}" title="${palette.primary}"></span>
            <span class="h-9 w-7 rounded-md border border-border/50" style="background:${palette.accent}" title="${palette.accent}"></span>
            <span class="h-9 w-7 rounded-md border border-border/50" style="background:${palette.neutral}" title="${palette.neutral}"></span>
            <span class="h-9 w-7 rounded-md border border-border/50" style="background:${palette.bg}" title="${palette.bg}"></span>
          </div>
          <span class="text-[9px] text-muted-foreground font-semibold${isTamil ? ' tamil' : ''}">${t("generator.label.brandPalette", "Brand Palette")}</span>
        </div>
        <div class="col-span-1 sm:col-span-2 p-0 rounded-xl bg-background border border-border overflow-hidden">
          <div class="flex items-center gap-1.5 px-3 py-2 border-b border-border/60 bg-muted/40">
            <span class="h-2.5 w-2.5 rounded-full bg-red-400/70"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-yellow-400/70"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-green-400/70"></span>
            <span class="ml-3 text-[10px] text-muted-foreground font-mono truncate">${n.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com</span>
          </div>
          <div class="p-5 flex flex-col items-center text-center" style="background:${palette.bg};color:${palette.fgOnBg};">
            <div class="h-9 w-9 rounded-lg flex items-center justify-center mb-2" style="background: linear-gradient(135deg, ${palette.primary}, ${palette.accent}); color: ${palette.fg};">
              <span class="font-display text-sm font-bold">${initials}</span>
            </div>
            <h5 class="font-display text-lg font-bold leading-tight">${n.name}</h5>
            <p class="text-[10px] opacity-70 mt-0.5">${n.tagline}</p>
            <span class="mt-3 inline-block px-3 py-1 rounded-full text-[10px] font-semibold" style="background:${palette.primary};color:${palette.fg};">Get started →</span>
          </div>
        </div>`;
        })()}
      </div>
    </div>
    
    <!-- Tab 3: Estimated Availability -->
    <div id="tab-dom-content-${index}" class="hidden space-y-3">
      <div class="p-3 bg-accent/5 border border-accent/20 rounded-xl text-xs text-muted-foreground leading-relaxed">
        <span class="font-bold text-foreground block mb-0.5">${t("generator.label.estimatedAvailability", "Estimated Availability")}</span>
        Disclaimer: Availability results are estimated heuristics based on network registrar queries and may not be 100% accurate. Click to confirm on registrar site.
      </div>
      <div class="space-y-2">
        ${tlds.map(tld => `
          <a href="https://www.namecheap.com/domains/registration/results/?domain=${n.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.${tld}" target="_blank" class="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/60 border border-border/40 rounded-lg transition-colors group" id="domain-${tld}-${index}">
            <span class="font-semibold text-sm group-hover:text-primary transition-colors">${n.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.${tld}</span>
            <span class="text-muted-foreground text-xs${isTamil ? ' tamil' : ''}">${t("generator.label.checking", "Checking...")}</span>
          </a>
        `).join('')}
      </div>
    </div>

    <!-- Tab 4: Logo Design Prompt -->
    <div id="tab-logo-content-${index}" class="hidden space-y-4">
      ${(() => {
        const palette = generateBrandPalette(n.name);
        const rootDisplay = n.tamilRoot && n.tamilRoot !== 'N/A' ? n.tamilRoot : n.name;
        const logoPrompt = `Create a logo for '${n.name}' — a brand meaning ${n.meaning.split('.')[0]}.

DESIGN BRIEF:
Brand Name: ${n.name}
Tagline: ${n.tagline}
Meaning: ${n.meaning}
Tamil Root: ${rootDisplay}

---

DESIGN SPECIFICATIONS

Brand Essence:
${n.name} is a Tamil-rooted brand name. The name carries the meaning: ${n.meaning.split('.')[0]}. The logo should visually encode this essence — not just decorate it.

Visual Direction:
- Primary mark: a minimal geometric symbol inspired by Tamil manuscript geometry, Kolam symmetry, or Sangam-era stone inscription patterns. Not literal — abstract and modern.
- The mark should work as a standalone icon (app icon, favicon, stamp) and with the wordmark.
- Avoid: generic tech gradients, rocket ships, lightbulbs, leaves, globes, speech bubbles.
- Prefer: geometric forms, angular precision, negative space, subtle cultural encoding.

Typography:
- Wordmark font: a clean geometric sans-serif (Inter, Matter, Neue Haas Grotesk, or equivalent). Modern, confident, no decorative serifs.
- If a Tamil script version is needed: use a high-readability Tamil typeface (Noto Sans Tamil, Catamaran). Same weight class as English.
- Letterforms should feel engineered, not ornamented.

Color System:
- Primary: ${palette.primary} (use as icon fill or accent stroke)
- Accent: ${palette.accent} (used sparingly — hover states, highlights)
- Neutral: ${palette.neutral} (wordmark in dark mode)
- Background: ${palette.bg} (light mode canvas)
- Dark mode: deep charcoal #1A1917 background, icon in ${palette.accent}

Usage Examples in the prompt:
- ${n.name} AI
- ${n.name} Labs  
- ${n.name} Health

Midjourney / DALL-E prompt:
"Minimal startup logo for '${n.name}', a Tamil-rooted brand meaning '${n.meaning.split('.')[0]}'. Geometric abstract mark inspired by South Indian Kolam symmetry and Sangam manuscript geometry. Clean geometric sans wordmark. Primary color ${palette.primary}. White background. Professional, modern, no gradients, no clipart, no literal imagery. Behance portfolio quality."`;

        return `
        <p class="text-xs text-muted-foreground mb-3${isTamil ? ' tamil' : ''}">${t("generator.label.logoSubtitle", "Paste this into Midjourney, DALL-E, or share with your designer.")}</p>
        <div class="relative">
          <pre id="logo-prompt-text-${index}" class="text-[11px] leading-relaxed text-foreground/80 bg-muted/40 border border-border rounded-xl p-4 whitespace-pre-wrap font-mono overflow-auto max-h-72">${logoPrompt}</pre>
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button"
            data-action="copy-prompt" data-idx="${index}"
            class="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 hover:bg-muted text-xs font-semibold transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span${isTamil ? ' class="tamil"' : ''}>${t("generator.label.copyPrompt", "Copy Prompt")}</span>
          </button>
          <a href="https://www.midjourney.com" target="_blank" class="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 hover:bg-muted text-xs font-semibold transition-colors text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Open Midjourney
          </a>
        </div>`;
      })()}
    </div>
  `;
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

window.closeModal = () => {
  const modal = document.getElementById('details-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
};

window.switchDetailTab = (index, tab) => {
  const tabs = ['det', 'mock', 'dom', 'logo'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-${t}-btn-${index}`);
    const content = document.getElementById(`tab-${t}-content-${index}`);
    if (btn && content) {
      if (t === tab) {
        btn.classList.add("bg-muted", "text-primary", "font-bold");
        btn.classList.remove("text-muted-foreground", "font-semibold");
        content.classList.remove("hidden");
      } else {
        btn.classList.remove("bg-muted", "text-primary", "font-bold");
        btn.classList.add("text-muted-foreground", "font-semibold");
        content.classList.add("hidden");
      }
    }
  });
};

window.checkDomainAvailability = async (name, index) => {
  const tlds = ['com', 'in', 'ai', 'io', 'co'];
  tlds.forEach(async (tld) => {
    const el = document.getElementById(`domain-${tld}-${index}`);
    if (!el) return;
    const statusText = el.querySelector("span:last-child");
    if (!statusText) return;
    
    if (statusText.classList.contains("text-emerald-500") || statusText.classList.contains("text-red-400") || statusText.classList.contains("text-amber-500")) return;

    try {
      const cleanEnglishName = name.replace(/[^a-zA-Z0-9-]/g, "");
      const domain = `${cleanEnglishName.toLowerCase()}.${tld}`;
      let rdapUrl = "";
      if (tld === 'com') {
        rdapUrl = `https://rdap.verisign.com/com/v1/domain/${domain}`;
      } else if (tld === 'in') {
        rdapUrl = `https://registry.in/rdap/domain/${domain}`;
      } else {
        rdapUrl = `https://rdap.org/domain/${domain}`;
      }

      const response = await fetch(rdapUrl, { method: 'GET', mode: 'cors' });
      if (response.status === 404) {
        const availTxt = (window.app && window.app.translations["generator.label.available"]) || "Available";
        statusText.textContent = availTxt;
        statusText.className = "text-emerald-500 font-bold text-[10px]";
      } else if (response.status === 200) {
        const takenTxt = (window.app && window.app.translations["generator.label.taken"]) || "Registered (Taken)";
        statusText.textContent = takenTxt;
        statusText.className = "text-red-400 font-bold text-[10px]";
      } else {
        const availTxt2 = (window.app && window.app.translations["generator.label.available"]) || "Available";
        statusText.textContent = availTxt2;
        statusText.className = "text-emerald-500 font-bold text-[10px]";
      }
    } catch (err) {
      const checkTxt = (window.app && window.app.translations["generator.label.checkAvailability"]) || "Check Availability";
      statusText.textContent = checkTxt;
      statusText.className = "text-amber-500 font-bold text-[10px]";
    }
  });
};
