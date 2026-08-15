// Generator API functions
window.generatorAPI = {
  generate: async function(payload) {
    return fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json());
  }
};
