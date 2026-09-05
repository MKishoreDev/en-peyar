<p align="center">
  <img src="static/images/banner.png" alt="En Peyar Banner" width="100%" />
</p>

<h1 align="center">என் பெயர் • En Peyar</h1>

<p align="center">
  AI-powered Tamil naming platform for founders, startups, creators, communities, and ambitious builders.
</p>

<p align="center">
  <strong>From Sangam to Startup.</strong>
</p>

<p align="center">
  Transform Tamil roots, literature, culture, and history into meaningful modern brands.
</p>

<p align="center">
  <a href="https://en-peyar.indevs.in/">
    <img src="https://img.shields.io/badge/Visit-Website-B22222?style=for-the-badge" />
  </a>
  <a href="https://github.com/MKishoreDev/en-peyar">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/MKishoreDev/en-peyar?style=for-the-badge" />
  <img src="https://img.shields.io/github/stars/MKishoreDev/en-peyar?style=for-the-badge" />
  <img src="https://img.shields.io/github/actions/workflow/status/MKishoreDev/en-peyar/ci.yml?branch=main&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tamil-தமிழ்-C1272D?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Open%20Source-MIT-B8860B?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Hosted%20on-indevs.in-B22222?style=for-the-badge" />
</p>

---

## Why En Peyar?

Naming is the first act of creation.

Before code is written.

Before customers arrive.

Before investments are raised.

A name becomes identity.

Tamil is one of the world's oldest living languages with more than 2000 years of literary heritage. Every word carries meaning, memory, philosophy, and culture.

En Peyar helps founders discover names inspired by Tamil language, literature, history, and regional heritage while remaining modern, memorable, and globally usable.

Instead of choosing between heritage and reach, En Peyar helps you have both.

---

## Screenshots

<p align="center">
  <img src="static/images/home.png" width="90%" />
</p>

<p align="center">
  <img src="static/images/generator.png" width="90%" />
</p>

<p align="center">
  <img src="static/images/map.png" width="90%" />
</p>

---

## Features

### 🤖 AI-Powered Naming

Generate startup-ready names using your idea, keywords, industry, and vision. Powered by high-speed Groq inference models with custom brand strategy prompting and dynamic model failovers.

### 🌍 Global Tamil Naming

Create modern brand names inspired by Tamil roots while remaining globally pronounceable.

Examples of naming concepts:

- Aram (Virtue)
- Aazhi (Ocean)
- Munai (Frontier)
- Semmai (Excellence)
- Ver (Root)

### 📖 Tamil Root Discovery & Etymology Dataset

Every generated name is connected to its linguistic roots and meaning.

Includes a curated dataset of over 200 Tamil root words organized across 20 business-relevant categories (`static/data/tamil_roots.json`), automatically injected into generation workflows.

Discover the story behind every word.

### ⚡ PWA (Progressive Web App) Ready

Install En Peyar directly to your home screen or desktop. Works seamlessly as a native-feeling application with offline Service Worker caching (`v6`) and improved performance.

### 🗺️ Tamil Nadu District Explorer

Explore Tamil Nadu through an interactive district map.

Discover:

- Name origins
- Historical significance
- Cultural identity
- Regional branding inspiration
- Notable businesses

Powered by:

https://www.npmjs.com/package/svgmap-tamilnadu

### 📜 Thirukkural Inspiration

Receive timeless wisdom from Thiruvalluvar while exploring names and ideas.

Integrated directly into the platform as a source of inspiration for builders and creators.

Powered by:

https://github.com/nramc/thirukkural-api

### 🎨 Brand Toolkit

Every generated name includes:

- Etymological Meaning & Phonetic Pronunciation
- Startup-ready Tagline
- Algorithmic Brand Score & Breakdown (Memorability, Simplicity, Vowel Ratio)
- Interactive Brand Preview (Mockups, HSL Color Palettes, Banner)
- Ready-to-use Logo Prompt (Midjourney / DALL-E)
- Real-time Domain Availability Estimate (RDAP protocol lookups)

### 🎯 Multiple Naming Styles

Generate names using:

- Tamil (Pure Tamil script)
- Global Tamil (Tamil roots in Latin script)
- English (Pure English brand names)
- Contextual Heritage (Sangam literature & historical Tamil tradition)

### 🔓 Open Source

Built openly for the community.

Contributions, improvements, and ideas are always welcome.

---

## Philosophy

Not every Tamil word is a brand.

A great brand name is not chosen because it is ancient.

It is chosen because it is meaningful.

A strong name should:

- Communicate something
- Be easy to remember
- Be easy to pronounce
- Scale globally
- Remain authentic

En Peyar combines:

**Meaning. Sound. Roots. Future.**

to create names that feel timeless rather than trendy.

---

## Inspiration

Projects like **Arattai** demonstrate how native Tamil words can become memorable modern products.

En Peyar explores the same belief:

Local language can power global products.

Tamil words are not relics.

They are building blocks for the future.

---

## Technology Stack

- **Backend Framework**: Python 3.10+ & Flask 3.1
- **AI Generation Engine**: Groq Cloud API (OpenAI-compatible protocol with dynamic model discovery & automatic failover)
- **Frontend Architecture**: ES6+ Modular JavaScript (`events.js`, `generator.js`, `generator_ui.js`, `generator_api.js`, `i18n.js`, `main.js`, `map.js`)
- **Styling**: Tailwind CSS v4 & Custom CSS Design System (Dual Theme HSL tokens, Kolam animations, Noto Sans Tamil typography)
- **Security & Performance**: DOMPurify (XSS protection), Flask-Talisman (Content Security Policy), Flask-Limiter (Rate Limiting), Flask-Compress (Gzip/Brotli)
- **Audio & TTS**: Web Speech API (`SpeechSynthesis`) with server-side in-memory `gTTS` audio stream fallback
- **Data & Maps**: 38-District Tamil Nadu SVG vector map (`districts.json`), 200+ Tamil Root Etymology database (`tamil_roots.json`), Live Thirukkural API

---

## Installation

```bash
# Clone the repository
git clone https://github.com/MKishoreDev/en-peyar.git

cd en-peyar

# Install Python dependencies
pip install -r requirements.txt

# Configure Environment Variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY (Get one for free at https://console.groq.com/)

# Run the application locally
python app.py
```

---

## Data Sources & Credits

### Thirukkural API

Used for Thirukkural discovery and inspiration. Special thanks to [@nramc](https://github.com/nramc) for creating and maintaining this wonderful open-source project ([nramc/thirukkural-api](https://github.com/nramc/thirukkural-api)) and notifying us about the API domain migration!

- **Live API Endpoint**: [https://kural.codewithram.dev](https://kural.codewithram.dev)
- **GitHub Repository**: [https://github.com/nramc/thirukkural-api](https://github.com/nramc/thirukkural-api)

### Tamil Nadu SVG Map

Interactive district explorer powered by:

https://www.npmjs.com/package/svgmap-tamilnadu

### Literary Inspiration

Inspired by:

* Sangam Literature
* Thirukkural
* Classical Tamil Vocabulary
* Tamil Etymology
* Historical Tamil Place Names
* Tamil Cultural Heritage

---

## Acknowledgements

### Stackryze Domains

Special thanks to **Stackryze Domains** for providing the official project subdomain:

**https://en-peyar.indevs.in**

Managed under the **indevs.in** namespace.

Stackryze Domains provides secure, free subdomains for developers, students, startups, and open-source projects.

Their support helps independent builders launch projects without infrastructure barriers.

Project by:

**Stackryze (Registered MSME India)**

Website:
https://stackryze.com

Contact:

* [support@stackryze.com](mailto:support@stackryze.com)
* [contact@stackryze.com](mailto:contact@stackryze.com)
* [legal@stackryze.com](mailto:legal@stackryze.com)
* [security@stackryze.com](mailto:security@stackryze.com)

### Open Source Community

Thanks to every contributor, translator, researcher, maintainer, and builder helping preserve and modernize Tamil knowledge on the internet.

Projects like En Peyar exist because of the open-source community.

---

## Contributing

Contributions are welcome.

You can help by:

* Adding Tamil roots
* Improving translations
* Enhancing prompts
* Expanding district information
* Reporting bugs
* Suggesting new features
* Improving documentation

---

## Built in Tamil Nadu

Tamil Nadu has always been a place where language, trade, creativity, and innovation meet.

From ancient literary academies and maritime trade routes to modern startups and open-source communities, innovation has always had roots here.

En Peyar is proudly built in Tamil Nadu and designed for the world.

---

## License

MIT License.

Fork it.

Build on it.

Improve it.

Share it.

---

<p align="center">
  <strong>Hosted on indevs.in • Powered by Stackryze Domains</strong>
</p>

<p align="center">
  <strong>Every company begins with a name.</strong>
</p>

<p align="center">
  <strong>Every name begins with a story.</strong>
</p>

<p align="center">
  தமிழ் வாழ்க ❤️
</p>
