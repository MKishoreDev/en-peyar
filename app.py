import os, io, json, requests, logging
from flask import Flask, render_template, request, jsonify, send_file
from dotenv import load_dotenv
from flask_compress import Compress
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

try:
    from gtts import gTTS; GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False

load_dotenv()
app = Flask(__name__)
app.logger.setLevel(logging.INFO)

import time

BUILD_ID = str(int(time.time()))

# Performance: Compression & Caching
Compress(app)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000 # 1 year caching for static files

@app.context_processor
def inject_version():
    return {'v': BUILD_ID}

# Rate Limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Security: HTTP Headers
csp = {
    'default-src': ['\'self\''],
    'script-src': ['\'self\'', 'https://cdnjs.cloudflare.com'],
    'style-src': ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
    'img-src': ['\'self\'', 'data:', 'https://img.shields.io'],
    'connect-src': ['\'self\'', 'https://kural.codewithram.dev', 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
    'font-src': ['\'self\'', 'data:', 'https://fonts.gstatic.com', 'https://fonts.googleapis.com']
}
Talisman(app, content_security_policy=csp, force_https=False)

# Custom JSON Error Handlers (Prevents HTML response crashes on client-side JS)
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "error": "rate_limited",
        "message": "Rate limit exceeded. Please wait a moment and try again."
    }), 429

@app.errorhandler(500)
def internal_error_handler(e):
    app.logger.error(f"Server 500 Error: {e}")
    return jsonify({
        "error": "internal_error",
        "message": "AI Provider or server temporarily busy. Please try again in a few seconds."
    }), 500

@app.errorhandler(404)
def not_found_handler(e):
    if request.path.startswith('/api/'):
        return jsonify({"error": "not_found", "message": "API endpoint not found."}), 404
    return render_template('index.html'), 404

FALLBACK_GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "qwen/qwen3.6-27b"
]
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def get_active_groq_models(key):
    try:
        r = requests.get("https://api.groq.com/openai/v1/models",
                         headers={"Authorization": f"Bearer {key}"},
                         timeout=5)
        if r.ok:
            data = r.json()
            active = [m["id"] for m in data.get("data", []) if "whisper" not in m["id"] and "safeguard" not in m["id"] and "guard" not in m["id"] and "orpheus" not in m["id"]]
            if active:
                return active
    except Exception as e:
        app.logger.warning(f"Failed to fetch dynamic Groq models: {e}")
    return FALLBACK_GROQ_MODELS

# Common JSON output schema for naming style prompts
COMMON_OUTPUT_SCHEMA = """{
  "thinking": "Your internal reasoning: analyze the business essence, identify the core Tamil concepts that map to it, explain your naming strategy, and self-critique before outputting names",
  "names": [
    {
      "name": "The generated name",
      "meaning": "Deep etymology: explain the Tamil root, its literary/cultural significance, and why it fits this specific business",
      "pronunciation": "Phonetic guide (e.g. Ah-rah-ttai)",
      "tamilRoot": "The core Tamil root word in Tamil script (leave empty for pure English style)",
      "tagline": "A sharp, founder-grade tagline that connects the name's meaning to the business purpose",
      "territory": "The branding territory this name belongs to from the brief"
    }
  ]
}"""

# Quality anchors injected into all naming prompts
NAMING_PHILOSOPHY = """
NAMING PHILOSOPHY — What makes a Tamil brand name GREAT:
1. CAPTURE THE VIBE, NOT THE DICTIONARY — Do NOT output raw, literal dictionary nouns/adjectives like "Pasumai" (Greenness), "Payanam" (Travel), "Valimai" (Strength), "Elimai" (Simplicity), "Oli" (Light). In English, naming a bike brand "Travel" or "Greenness" sounds like a 1980s textbook, not a startup!
2. COINED & DERIVED BRAND NAMES ARE BETTER — Evolve Tamil linguistic roots phonetically into sleek, modern brand names (e.g. "Vazhio", "Payan", "Sakkri", "Katru", "Kathiq", "Verai", "Moolis", "Aethra", "Velos").
3. SINGLE CONCEPT & PUNCHY — 4-7 letters, 1-2 syllables. Easy to say globally, memorable, sleek on a product or app icon.
4. EVOCATIVE METAPHORS — Use words of action, momentum, spirit, craft, and movement rather than flat descriptions.
5. SOUND FOUNDER-GRADE — Ask: "Would a multi-million dollar startup actually launch with this name?" If it sounds like a government handbook title, REJECT IT.

EXAMPLES OF BAD vs GREAT TAMIL BRAND NAMES:
- ❌ BAD (Flat dictionary word): "Pasumai" (Greenness), "Elimai" (Simplicity), "Payanam" (Travel), "Valimai" (Strength) — Generic, boring, sounds like school handbook headings.
- ✅ GREAT (Brandable Tamil Evolutions):
  - "Arattai" (அரட்டை) = Casual banter → Used by Zoho for chat app. Punchy, authentic, modern.
  - "Vazhio" / "Vazh" → Derived from "Vazhi" (path). Sleek, action-oriented, brandable.
  - "Sakkri" / "Sakkra" → Evolved from "Sakkaram" (wheel/cyclical motion). Modern product feel.
  - "Katru" / "Kaatru" → Wind/breeze. Dynamic metaphor for speed and cycling freedom.
  - "Agam" (அகம்) = Inner self/home → Deep Sangam root, 4 letters, global appeal.
  - "Kural" (குறள்) = Verse/Brevity → Crisp, literary, modern tech brand.
  - "Kathiq" / "Kathi" → Momentum/Surge. Sharp, energetic.

ANTI-PATTERNS — Strictly Forbidden:
- NEVER use flat dictionary nouns like Pasumai, Elimai, Payanam, Valimai, Oli as standalone brand names.
- DON'T staple dynasty names onto English words (e.g. "Chola Express" — irrelevant)
- DON'T combine 3+ words into unpronounceable compounds (e.g. "SemmaiVelaiArivu")
- DON'T just transliterate English business keywords into Tamil script
"""

@app.route('/')
def home(): return render_template('index.html')

@app.route('/about')
def about(): return render_template('about.html')

@app.route('/favicon.ico')
def favicon():
    return send_file('static/images/favicon.ico', mimetype='image/x-icon')

@app.route('/manifest.json')
def manifest():
    return send_file('static/manifest.json')

@app.route('/sw.js')
def service_worker():
    response = send_file('static/sw.js')
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.after_request
def add_no_cache_headers(response):
    if response.mimetype == 'text/html' or request.path == '/sw.js':
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    return response

@app.route('/robots.txt')
def robots():
    return send_file('static/robots.txt')

@app.route('/sitemap.xml')
def sitemap():
    return send_file('static/sitemap.xml')

@app.route('/llm.txt')
@app.route('/llms.txt')
def llmtxt():
    return send_file('llms.txt')

@app.route('/llms-full.txt')
def llms_full_txt():
    return send_file('llms-full.txt')

# ────────────────────────────────────────────────────────────
# GROQ CALLS
# ────────────────────────────────────────────────────────────

def groq(system, user, temperature=0.85, timeout=30):
    key = os.getenv('GROQ_API_KEY')
    if not key:
        raise ValueError("no_api_key")
        
    models = get_active_groq_models(key)
    last_err = None
    for model in models:
        try:
            payload = {
                "model": model,
                "temperature": temperature,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user}
                ]
            }
            if "json" in system.lower() or "json" in user.lower():
                payload["response_format"] = {"type": "json_object"}

            resp = requests.post(GROQ_URL,
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
                json=payload,
                timeout=timeout)
            if resp.status_code == 429:
                last_err = "rate_limited"
                continue
            if not resp.ok:
                err_msg = f"Groq model {model} returned {resp.status_code}: {resp.text}"
                app.logger.warning(err_msg)
                last_err = err_msg
                continue
            return json.loads(resp.json()["choices"][0]["message"]["content"])
        except Exception as e:
            last_err = str(e)
            continue
            
    if last_err == "rate_limited" or (last_err and "429" in last_err):
        raise ConnectionError("rate_limited")
    raise Exception(last_err)

def api_error(err):
    e = str(err)
    if "rate_limited" in e:
        return jsonify({"error":"rate_limited",
            "message":"Sorry, the AI is currently experiencing a lot of usage and got rate limited. We've tried our fallback models, but they are also busy. Please try again in a little while!"}), 429
    if "no_api_key" in e:
        return jsonify({"error":"no_api_key",
            "message":"No GROQ_API_KEY found. Add it to .env and restart."}), 503
    return jsonify({"error":"api_error","message":"AI Provider temporarily unavailable"}), 500

# ────────────────────────────────────────────────────────────
# /api/refine
# ────────────────────────────────────────────────────────────
@app.route('/api/refine', methods=['POST'])
def refine_context():
    data = request.get_json() or {}
    keywords = data.get('keywords','').strip()
    context = data.get('context','').strip()
    industry = data.get('industry','Project')

    if not keywords and not context:
        return jsonify({"error":"Nothing to refine"}), 400

    system = """You are a brand strategist. Given rough keywords and context, analyze the business domain and return JSON with:
{
  "refined": "Clear 2-3 sentence description. Concrete, specific. No buzzwords.",
  "keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5"],
  "industry": "A suggested industry matching one of these categories if applicable: 'Mobile App', 'Startup', 'SaaS', 'AI', 'Healthcare', 'Education', 'Food', 'E-commerce', 'Open Source Project', 'Community', 'Creator Brand', 'Event', 'Company', 'Nonprofit', 'General'. If it fits a specific niche not listed here, return a custom industry name."
}
Return ONLY valid JSON."""

    user = f"Keywords: {keywords}\nIndustry: {industry}\nContext: {context or '(empty)'}"

    try:
        result = groq(system, user, temperature=0.5)
        return jsonify(result)
    except Exception as e:
        return api_error(e)

# ────────────────────────────────────────────────────────────
# /api/generate
# ────────────────────────────────────────────────────────────
@app.route('/api/generate', methods=['POST'])
@limiter.limit("15 per minute")
def generate_names():
    data = request.get_json() or {}
    keywords = data.get('keywords','').strip()
    style = data.get('style','Tamil')
    industry = data.get('industry','Project')
    context = data.get('context','').strip()

    if len(keywords) > 500 or len(context) > 1000:
        return jsonify({"error": "Input too long."}), 400

    if not keywords and not context:
        return jsonify({"error":"Description or Keywords required"}), 400

    keywords = keywords or ""
    context = context or ""

    # ────────────────────────────────────────────────────────────
    # Stage 1: Deep Naming Brief
    # ────────────────────────────────────────────────────────────
    brief_sys = """You are a senior brand naming strategist and Tamil cultural expert. Your job is to deeply understand a business idea and produce a naming brief that will guide the creation of a perfect brand name.

Analyze the project and return JSON with these keys:
- purpose: 1-sentence project goal (be specific, not generic)
- coreEmotion: the ONE primary emotion this brand should evoke (e.g. "trust", "delight", "empowerment")
- audience: specific target segments
- whatItActuallyDoes: a plain-language description of what users DO with this product (e.g. "send messages to friends", "track daily expenses", "order food from local restaurants")
- metaphors: list of 3-5 metaphorical concepts that capture the business essence (e.g. for a chat app: "conversation as river", "words as bridges", "banter among friends")
- constraints: words/styles to AVOID
- territories: list of 3-4 branding territories with brief descriptions
- tamilRoots: list of 15-20 deeply relevant Tamil root words. For each root, think: "Does this Tamil word capture something ESSENTIAL about what this business does or how it makes people feel?" Only include roots that pass this test.

Return ONLY valid JSON."""

    brief_user = f"""Industry: {industry}
Description: {context if context else 'A new innovative project'} {keywords}"""

    try:
        naming_brief = groq(brief_sys, brief_user, temperature=0.7, timeout=25)
        app.logger.info("Naming Brief generated successfully.")
    except Exception as e:
        app.logger.error(f"Error generating naming brief: {e}")
        return api_error(e)

    brief_str = json.dumps(naming_brief, indent=2, ensure_ascii=False)
    roots = naming_brief.get("tamilRoots", naming_brief.get("roots", []))
    roots_str = ", ".join(roots) if roots else "Use your own Tamil linguistic knowledge"

    # Load curated Tamil roots for enrichment
    curated_roots = ""
    try:
        roots_path = os.path.join(os.path.dirname(__file__), 'static', 'data', 'tamil_roots.json')
        if os.path.exists(roots_path):
            with open(roots_path, 'r', encoding='utf-8') as f:
                roots_data = json.load(f)
            # Pick 2-3 relevant categories based on brief
            activity = naming_brief.get("whatItActuallyDoes", naming_brief.get("activity", ""))
            emotion = naming_brief.get("coreEmotion", "")
            hint = f"{activity} {emotion} {industry}".lower()
            relevant = []
            for cat, words in roots_data.items():
                if any(kw in hint for kw in cat.lower().split("_")):
                    relevant.extend(words[:5])
            if relevant:
                curated_roots = "\n\nCURATED TAMIL ROOTS FOR INSPIRATION:\n" + "\n".join(
                    f"- {r.get('roman','')} ({r.get('tamil','')}) = {r.get('meaning','')}" for r in relevant[:15]
                )
    except Exception as e:
        app.logger.warning(f"Could not load curated roots: {e}")

    # ────────────────────────────────────────────────────────────
    # Stage 2: Style-Specific Generation
    # ────────────────────────────────────────────────────────────
    def generate_style_candidates(target_style, gen_sys, gen_user):
        temp = 0.85 if target_style != "English" else 0.75
        try:
            gen_res = groq(gen_sys, gen_user, temperature=temp, timeout=30)
            if gen_res and isinstance(gen_res, dict) and "names" in gen_res and gen_res["names"]:
                return gen_res
        except Exception as e:
            app.logger.warning(f"Generation failed for style {target_style}: {e}. Retrying...")
        
        try:
            gen_res = groq(gen_sys, gen_user, temperature=0.7, timeout=30)
            if gen_res and isinstance(gen_res, dict) and "names" in gen_res:
                return gen_res
        except Exception as retry_e:
            app.logger.error(f"Retry generation failed for style {target_style}: {retry_e}")
            
        return {"names": []}

    # ── Tamil Style ──
    tamil_gen_sys = f"""You are a master Tamil naming artist. Your life's work is finding the ONE perfect Tamil word that captures a business's soul.

{NAMING_PHILOSOPHY}

YOUR TASK:
Using the naming brief and Tamil roots provided, create 10 brand names in pure Tamil script.

PROCESS (use the "thinking" field):
1. Read the brief carefully. What does this business ACTUALLY do? How does it make people FEEL?
2. Search your Tamil vocabulary for words that capture that FEELING — not the literal industry term.
3. Consider Sangam literature, Thirukkural, and everyday Tamil for hidden gems.
4. For each candidate, ask: "If I heard just this ONE word, would I understand what this business is about?"
5. Reject any name that doesn't pass the "inevitability test" — does it feel like the ONLY right name?

RULES:
- Each name must be 1-2 Tamil words in Tamil script ONLY.
- NO transliteration, NO English letters, NO generic suffixes.
- Historical names (Chola, Pandya, etc.) ONLY if the business is about history/heritage/tourism.
- Every name MUST have a clear, direct connection to what the business does.
- Assign each name to a territory from the brief.

Format output as JSON:
{COMMON_OUTPUT_SCHEMA}
Return ONLY valid JSON."""

    tamil_gen_user = f"""NAMING BRIEF:
{brief_str}

TAMIL ROOTS TO EXPLORE: {roots_str}
{curated_roots}"""

    # ── Global Tamil Style ──
    global_tamil_gen_sys = f"""You are a world-class brand naming strategist specializing in Global Tamil brand names — modern, founder-grade startup names derived from Tamil etymology, phonetically evolved for global markets.

{NAMING_PHILOSOPHY}

YOUR TASK:
Create 10 globally pronounceable, modern startup brand names rooted in Tamil concepts, written in Latin (English) characters.

PROCESS (use the "thinking" field):
1. Understand the business deeply: What is the core action, feeling, or momentum?
2. Identify Tamil roots and metaphors associated with this core action.
3. Transform the roots into SLEEK BRAND NAMES by shaping endings, blending concepts, or choosing punchy, modern root words.
4. CRITICAL CHECK: Is the candidate name a flat, boring dictionary word (like "Pasumai" or "Payanam")? If YES, REJECT IT and create a coined evolution (like "Vazhio", "Sakkri", "Payan", "Verai", "Katru").

PREFERRED FORMATS:
1. Coined Tamil Evolutions — "Vazhio", "Payan", "Sakkri", "Moolis", "Kathiq", "Verai", "Aethra", "Velos"
2. Evocative Metaphor Words — "Katru" (Wind/Speed), "Kural" (Brevity/Verse), "Agam" (Core/Home), "Mozhi" (Voice)
3. Minimal Blend Combos — "Vazhr", "Sollcraft", "VeraHQ" (only if crisp and natural)

RULES:
- Tamil etymology MUST be authentic and clearly explained in the 'meaning' field.
- STRICTLY NO flat dictionary nouns/adjectives (No Pasumai, No Elimai, No Payanam, No Valimai, No Oli).
- NO generic tech suffixes (Labs, Tech, AI, Platform).
- 4-7 letters preferred. Easy to spell, say, and remember worldwide.
- Assign each name to a territory from the brief.

Format output as JSON:
{COMMON_OUTPUT_SCHEMA}
Return ONLY valid JSON."""

    global_tamil_gen_user = f"""NAMING BRIEF:
{brief_str}

TAMIL ROOTS TO EXPLORE: {roots_str}
{curated_roots}"""

    # ── English Style ──
    english_gen_sys = f"""You are a creative English brand strategist who creates unique, memorable startup names.

YOUR TASK:
Create 10 unique English brand names based on the naming brief. These should feel modern, fresh, and founder-grade.

PROCESS (use the "thinking" field):
1. Understand the business essence and core emotion.
2. Brainstorm coined words, portmanteaus, metaphorical names, and abstract-yet-evocative words.
3. Each name should feel like it BELONGS to this specific business.

RULES:
- Must NOT contain Tamil or regional terms (this is the English style).
- NO generic dictionary words or AI clichés ("ify", "ly", "hub", "nest", "hive").
- Each name should be 1-2 words, easy to spell and remember.
- Assign each name to a territory from the brief.

Format output as JSON:
{COMMON_OUTPUT_SCHEMA}
Return ONLY valid JSON. (tamilRoot field should be null or empty)."""

    english_gen_user = f"""NAMING BRIEF:
{brief_str}"""

    # ── Contextual Heritage Style ──
    heritage_gen_sys = f"""You are a master Tamil cultural historian and naming expert. You find brand names in classical Tamil heritage — Sangam poetry, Thirukkural, ancient trade routes, and historical Tamil civilization.

{NAMING_PHILOSOPHY}

YOUR TASK:
Create 10 Contextual Heritage brand names that draw from Tamil literary and historical tradition.

PROCESS (use the "thinking" field):
1. Read the brief. Find the THEMATIC connection to Tamil heritage (not a forced one).
2. Search Sangam literature, Thirukkural verses, ancient Tamil trade concepts, literary devices.
3. A heritage name must EARN its historical connection — it should feel natural, not forced.
4. If the business has no heritage connection, use beautiful classical Tamil words that are relevant.

RULES:
- Names can be in Tamil script, Latin characters, or both.
- Historical terms (Chola, Sangam, Puhar, etc.) ONLY when they genuinely connect to the business.
- Classical literary words are preferred over dynasty/place names.
- Each name must still be brandable: short, memorable, pronounceable.
- Assign each name to a territory from the brief.

Format output as JSON:
{COMMON_OUTPUT_SCHEMA}
Return ONLY valid JSON."""

    heritage_gen_user = f"""NAMING BRIEF:
{brief_str}

TAMIL ROOTS TO EXPLORE: {roots_str}
{curated_roots}"""

    # ────────────────────────────────────────────────────────────
    # Stage 3: Execution, Quality Filter & Output
    # ────────────────────────────────────────────────────────────
    def quality_filter(names):
        """Post-generation quality filter: dedup, length check, empty field cleanup."""
        if not names:
            return names
        
        seen = set()
        filtered = []
        for n in names:
            if not isinstance(n, dict) or not n.get("name"):
                continue
            
            name = n["name"].strip()
            name_lower = name.lower().replace(" ", "")
            
            # Skip duplicates
            if name_lower in seen:
                continue
            seen.add(name_lower)
            
            # Skip flat generic dictionary words in Global Tamil style
            BANNED_GENERIC_WORDS = {"pasumai", "elimai", "payanam", "valimai", "oli", "thamizh", "tamil", "velai"}
            if style == "Global Tamil" and name_lower in BANNED_GENERIC_WORDS:
                continue
            
            # Skip names that are too long (more than 3 words in Latin, or more than 4 Tamil words)
            word_count = len(name.split())
            if word_count > 4:
                continue
            
            # Ensure all required fields have fallbacks
            n["name"] = name
            n["meaning"] = n.get("meaning") or ""
            n["pronunciation"] = n.get("pronunciation") or ""
            n["tamilRoot"] = n.get("tamilRoot") or ""
            n["tagline"] = n.get("tagline") or ""
            n["territory"] = n.get("territory") or ""
            
            filtered.append(n)
        
        return filtered[:10]

    final_names = []

    try:
        if style == "Tamil":
            result = generate_style_candidates("Tamil", tamil_gen_sys, tamil_gen_user)
        elif style == "Global Tamil":
            result = generate_style_candidates("Global Tamil", global_tamil_gen_sys, global_tamil_gen_user)
        elif style == "English":
            result = generate_style_candidates("English", english_gen_sys, english_gen_user)
        elif style == "Contextual Heritage":
            result = generate_style_candidates("Contextual Heritage", heritage_gen_sys, heritage_gen_user)
        else:
            result = generate_style_candidates("Global Tamil", global_tamil_gen_sys, global_tamil_gen_user)

        # Extract names and strip the thinking field (internal LLM reasoning only)
        raw_names = result.get("names", []) if isinstance(result, dict) else []
        final_names = quality_filter(raw_names)

        response_data = {
            "names": final_names,
            "brief": naming_brief
        }
        # Strip thinking/internal fields from brief sent to frontend
        response_data["brief"].pop("thinking", None)
        response_data["brief"].pop("tamilRoots", None)
        
        return jsonify(response_data)
    except Exception as e:
        app.logger.error(f"Error in generate pipeline: {e}")
        return jsonify({"error": "AI Provider temporarily unavailable or encountered an error."}), 500

# ────────────────────────────────────────────────────────────
# /api/tts
# ────────────────────────────────────────────────────────────
@app.route('/api/tts')
@limiter.limit("20 per minute")
def tts():
    text = request.args.get('text','').strip()
    lang = request.args.get('lang','en').strip()
    if not text: return "No text", 400
    if len(text) > 200: return "Text too long", 400
    if not GTTS_AVAILABLE:
        return jsonify({"error":"TTS unavailable"}), 503
        
    try:
        app.logger.info(f"Generating TTS for '{text}' [{lang}] in memory...")
        tts_audio = gTTS(text=text, lang=lang)
        fp = io.BytesIO()
        tts_audio.write_to_fp(fp)
        fp.seek(0)
        return send_file(fp, mimetype='audio/mpeg', as_attachment=False, download_name='tts.mp3')
    except Exception as e:
        app.logger.error(f"TTS Error: {e}")
        return "Audio generation failed. Please try again later.", 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)