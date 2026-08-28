// Generator API functions
window.generatorAPI = {
  generate: async function(payload) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {}

    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || `Server error (${res.status})`;
      throw new Error(msg);
    }
    if (!data) throw new Error("Invalid JSON response from server");
    return data;
  }
};
