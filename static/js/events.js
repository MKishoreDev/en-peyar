// Event delegation to avoid 'unsafe-inline' in CSP
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  
  const action = btn.getAttribute('data-action');
  if (!window.app) return; // App not initialized yet
  
  if (action === 'remove-keyword') {
     window.app.generator.removeKeywordTag(parseInt(btn.getAttribute('data-idx')));
  } else if (action === 'load-keyword') {
     window.app.generator.loadKeyword(btn.getAttribute('data-word'));
  } else if (action === 'load-keyword-focus') {
     window.app.generator.loadKeyword(btn.getAttribute('data-word'));
     const input = document.getElementById('keywords-input-field');
     if (input) input.focus();
  } else if (action === 'play-pronunciation') {
     window.app.playPronunciation(btn.getAttribute('data-name'), btn.getAttribute('data-lang'));
  } else if (action === 'toggle-favorite') {
     window.app.generator.toggleFavorite(btn.getAttribute('data-name'));
  } else if (action === 'open-modal') {
     if (typeof window.openDetailsModal !== 'undefined') window.openDetailsModal(btn.getAttribute('data-idx'));
  } else if (action === 'copy-name') {
     if (typeof window.copyName !== 'undefined') window.copyName(btn.getAttribute('data-name'), btn.getAttribute('data-tagline'));
  } else if (action === 'switch-tab') {
     if (typeof window.switchDetailTab !== 'undefined') window.switchDetailTab(btn.getAttribute('data-idx'), btn.getAttribute('data-tab'));
  } else if (action === 'check-domain') {
     const idx = btn.getAttribute('data-idx');
     if (typeof window.switchDetailTab !== 'undefined') window.switchDetailTab(idx, 'dom');
     if (typeof window.checkDomainAvailability !== 'undefined') window.checkDomainAvailability(btn.getAttribute('data-name'), idx);
  } else if (action === 'copy-prompt') {
     const idx = btn.getAttribute('data-idx');
     const el = document.getElementById(`logo-prompt-text-${idx}`);
     if (el) {
       navigator.clipboard.writeText(el.textContent).then(() => {
         window.app.toast(window.app.translations['generator.label.promptCopied'] || 'Prompt copied!', 'success');
       });
     }
  } else if (action === 'add-keyword-and-close') {
     window.app.generator.addKeywordTag(btn.getAttribute('data-word'));
     const p = document.getElementById('inspiration-panel');
     if (p) p.classList.add('hidden');
     window.app.toast('Keyword loaded — now generate!', 'success');
  } else if (action === 'trigger-inspire') {
     window.app.triggerInspire();
  } else if (action === 'copy-kural') {
     window.app.map.copyKuralText(btn.getAttribute('data-lines'), btn.getAttribute('data-trans'));
  } else if (action === 'close-modal') {
     if (typeof window.closeModal !== 'undefined') window.closeModal();
  }
});
