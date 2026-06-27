import os, io, json, requests, logging
from flask import Flask, render_template, request, jsonify, send_file
from dotenv import load_dotenv

try:
    from gtts import gTTS; GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False

load_dotenv()
app = Flask(__name__)
app.logger.setLevel(logging.INFO)
# Caching disabled to avoid storage limits

GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
    "gemma2-9b-it"
]
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# Common JSON output schema for naming style prompts
COMMON_OUTPUT_SCHEMA = """{
  "names": [
    {
      "name": "The generated name in the requested style",
      "meaning": "Detailed branding etymology and meaning explanation",
      "pronunciation": "Phonetic guide (e.g. Ah-rah-ttai)",
      "tamilRoot": "The core Tamil root in Tamil script (leave empty or null for pure English style)",
      "tagline": "Catchy, startup-ready tagline",
      "territory": "The selected branding territory name from the brief this name belongs to"
    }
  ]
}"""

@app.route('/')
def home(): return render_template('index.html')

@app.route('/about')
def about(): return render_template('about.html')

@app.route('/manifest.json')
def manifest():
    return send_file('static/manifest.json')

@app.route('/sw.js')
def service_worker():
    response = send_file('static/sw.js')
    response.headers['Cache-Control'] = 'no-cache'
    return response

# ────────────────────────────────────────────────────────────
# GROQ CALLS
# ────────────────────────────────────────────────────────────

def groq(system, user, temperature=0.85, timeout=30):
    key = os.getenv('GROQ_API_KEY')
    if not key:
        raise ValueError("no_api_key")
        
    last_err = None
    for model in GROQ_MODELS:
        try:
            resp = requests.post(GROQ_URL,
                headers={"Content-Type":"application/json","Authorization":f"Bearer {key}"},
                json={"model":model,"temperature":temperature,
                      "messages":[{"role":"system","content":system},{"role":"user","content":user}],
                      "response_format":{"type":"json_object"}},
                timeout=timeout)
            if resp.status_code == 429:
                last_err = "rate_limited"
                continue
            resp.raise_for_status()
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
    return jsonify({"error":"api_error","message":f"Sorry, something went wrong on our end: {e}. Please try again later."}), 500

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
def generate_names():
    data = request.get_json() or {}
    keywords = data.get('keywords','').strip()
    style = data.get('style','Tamil')
    industry = data.get('industry','Project')
    context = data.get('context','').strip()

    if not keywords and not context:
        return jsonify({"error":"Description or Keywords required"}), 400

    keywords = keywords or ""
    context = context or ""

    # ────────────────────────────────────────────────────────────
    # Stage 1: Refinement (Naming Brief)
    # ────────────────────────────────────────────────────────────
    brief_sys = """You are a senior naming strategist. Given the project description, produce a concise naming brief as JSON with keys: purpose, coreEmotion, audience, constraints, domain, geography, activity, emotionalGoal, territories.
- purpose: 1-sentence project goal
- coreEmotion: primary brand feeling (e.g. belonging, empowerment)
- audience: list of target segments (in a few words)
- constraints: list of words or styles to avoid (e.g. tech clichés, generic terms)
- domain: estimated core business domain or industry context
- geography: intended geographical reach or target regions
- activity: core business activity (what the startup actually does)
- emotionalGoal: emotional feeling the brand seeks to inspire
- territories: list of at least 3 distinct branding or positioning territories (e.g. functional/utility, metaphorical/organic, modern/invented, classical/literary)
Return ONLY valid JSON."""

    brief_user = f"""Industry: {industry}
Description: {context if context else 'A new innovative project'} {keywords}"""

    try:
        naming_brief = groq(brief_sys, brief_user, temperature=0.7, timeout=30)
        app.logger.info("Naming Brief generated successfully.")
    except Exception as e:
        app.logger.error(f"Error generating naming brief: {e}")
        return api_error(e)

    brief_str = json.dumps(naming_brief, indent=2, ensure_ascii=False)

    # ────────────────────────────────────────────────────────────
    # Stage 2: Tamil Root Extraction (for Tamil, Global Tamil, Contextual Heritage)
    # ────────────────────────────────────────────────────────────
    roots = []
    if style in ["Tamil", "Global Tamil", "Contextual Heritage"]:
        roots_sys = """You are a Tamil lexicographer and cultural expert. Extract at least 15-20 single-word Tamil roots/concepts directly related to the project purpose. 
- Each root must be a meaningful Tamil word or root (noun/verb/adjective).
- These should capture core ideas or emotions from the brief (purpose, emotion, audience).
- Avoid generic Tamil words that add no meaning, and avoid irrelevant historical/place names unless clearly relevant.
- Output JSON: {"roots":[ "root1", "root2", ... ]}."""
        roots_user = brief_str
        try:
            roots_result = groq(roots_sys, roots_user, temperature=0.7, timeout=30)
            roots = roots_result.get("roots", [])
            app.logger.info(f"Extracted roots: {roots}")
        except Exception as e:
            app.logger.warning(f"Root extraction failed, fallback to empty list: {e}")
            roots = []

    roots_str = ", ".join(roots)

    # ────────────────────────────────────────────────────────────
    # Stage 3-5 Helpers: Generation, Scoring, and Critique
    # ────────────────────────────────────────────────────────────
    
    score_sys = """You are an experienced naming judge. For each candidate name in the list, score it 0–10 on: 
 1) Memorability 
 2) Pronunciation ease 
 3) Distinctiveness 
 4) Brand friendliness 
 5) Cultural fit (for Tamil/Global Tamil).
Return JSON of only those names scoring >= 8 in each category (total >= 40), in array form inside a "names" key.
Format output strictly as: {"names": [ {name, meaning, pronunciation, tamilRoot, tagline, territory} ]}"""

    critique_sys = """You are a meticulous branding panel. For each candidate name in the list:
Ask: "Would this name feel strong in 10 years? Can someone hear it once and spell it? Pronounce after seeing once? Look good in an icon? Could a founder love it?"
Eliminate any name failing any check. 
Return JSON array of the remaining top names with all fields under a "names" key.
Format output strictly as: {"names": [ {name, meaning, pronunciation, tamilRoot, tagline, territory} ]}"""

    def generate_style_candidates(target_style, gen_sys, gen_user):
        # First attempt
        temp = 1.0 if target_style != "English" else 0.9
        gen_res = None
        try:
            gen_res = groq(gen_sys, gen_user, temperature=temp, timeout=40)
        except Exception as e:
            app.logger.warning(f"Initial groq generation failed for style {target_style}: {e}. Retrying with temp 0.72...")
        
        # Check if we need to retry
        if not gen_res or not isinstance(gen_res, dict) or "names" not in gen_res or not gen_res["names"]:
            app.logger.info(f"Retrying generation for style {target_style} with temperature 0.72...")
            try:
                gen_res = groq(gen_sys, gen_user, temperature=0.72, timeout=40)
            except Exception as retry_e:
                app.logger.error(f"Retry groq generation also failed for style {target_style}: {retry_e}")
                return []

        if not gen_res or not isinstance(gen_res, dict) or "names" not in gen_res:
            app.logger.warning(f"No valid JSON output for style {target_style} after retry.")
            return []

        candidates = gen_res.get("names", [])
        if not candidates:
            app.logger.warning(f"No names generated for style {target_style} after retry.")
            return []
        
        # Now perform scoring
        scored = []
        try:
            score_user = json.dumps({"names": candidates}, ensure_ascii=False)
            score_res = groq(score_sys, score_user, temperature=0.3, timeout=30)
            scored = score_res.get("names", [])
        except Exception as score_e:
            app.logger.warning(f"Scoring step failed or returned invalid JSON: {score_e}. Proceeding with candidates.")
            scored = []

        # Perform critique
        final_names = []
        if scored:
            try:
                critique_user = json.dumps({"candidates": scored}, ensure_ascii=False)
                critique_res = groq(critique_sys, critique_user, temperature=0.0, timeout=30)
                final_names = critique_res.get("names", [])
            except Exception as critique_e:
                app.logger.warning(f"Critique step failed or returned invalid JSON: {critique_e}. Proceeding with scored/candidates.")
                final_names = []
        
        result_list = list(final_names)
        for item in scored:
            if len(result_list) >= 10:
                break
            if not any(x.get("name") == item.get("name") for x in result_list):
                result_list.append(item)
        for item in candidates:
            if len(result_list) >= 10:
                break
            if not any(x.get("name") == item.get("name") for x in result_list):
                result_list.append(item)
        
        return result_list

    tamil_gen_sys = f"""You are a master Tamil naming expert. Using the provided naming brief and Tamil roots, create brand names in pure Tamil (only Tamil script).
- You must generate 40 candidate names internally, score them on context relevance (weighted highest), memorability, pronunciation, distinctiveness, and brandability, and output only the best 10.
- Ensure the names represent a mix across the branding/positioning territories defined in the naming brief. Each name must be assigned to its correct territory name under the "territory" key in the output JSON.
- Each name must be 1–2 Tamil words directly reflecting the brief’s ideas (purpose, emotion, territory).
- Do NOT use transliteration, English letters, or extraneous suffixes.
- STRICT HISTORICAL CONSTRAINT: Historical place names, dynasties, rulers, ports, kingdoms, and literary locations (such as Chola, Chera, Pandya, Korkai, Madurai, Vanchi, Kumari, Sangam) MUST NOT be used unless the business context directly relates to geography, heritage, culture, history, tourism, or Tamil identity.
- Leverage Tamil literature and meaningful roots (e.g., மொழி, மரம், அகம், விழுது, செம்மை, மரபு).
- Format output as JSON strictly conforming to this schema:
{COMMON_OUTPUT_SCHEMA}
Return ONLY valid JSON."""

    tamil_gen_user = f"""Brief: {brief_str}
Roots: {roots_str}"""

    global_tamil_gen_sys = f"""You are a master brand naming expert. Using the brief and Tamil roots, generate Global Tamil brand names rendered in Latin (English) characters.
- You must generate 40 candidate names internally, score them on context relevance (weighted highest), memorability, pronunciation, distinctiveness, and brandability, and output only the best 10.
- Ensure the names represent a mix across the branding/positioning territories defined in the naming brief. Each name must be assigned to its correct territory name under the "territory" key in the output JSON.
- Global Tamil names are modern, founder-grade startup names based on Tamil linguistic roots.
- Allowed Global Tamil (Tanglish) formats are:
  1. Pure Tamil words written in Latin script (e.g. Arattai, EnPeyar, Kural, Agam, Ver, Semmai, Marabu, Nayam).
  2. Tamil-derived invented brand names (e.g. Mozhio, Vera, Ahamo, Sollio).
  3. Tamil concept + clean English word combos: [TamilConcept][EnglishWord] or vice versa (e.g. Sollcraft, Mozhi Works, Vera Collective, Kural Studio).
  4. Tamil phonetic evolutions (e.g. Nathan style naming).
- Preserve Tamil meaning/emotion clearly (use root concepts: {roots_str}).
- Avoid simply appending generic tech suffixes (e.g., no "Labs", "Tech", "AI", "Platform" unless it is highly integrated).
- STRICT HISTORICAL CONSTRAINT: Historical place names, dynasties, rulers, ports, kingdoms, and literary locations (such as Chola, Chera, Pandya, Korkai, Madurai, Vanchi, Kumari, Sangam) MUST NOT be used unless the business context directly relates to geography, heritage, culture, history, tourism, or Tamil identity.
- Format output as JSON strictly conforming to this schema:
{COMMON_OUTPUT_SCHEMA}
Return ONLY valid JSON."""

    global_tamil_gen_user = f"""Brief: {brief_str}
Roots: {roots_str}"""

    english_gen_sys = f"""You are a creative English brand strategist. Based on the naming brief, generate unique English startup names.
- You must generate 40 candidate names internally, score them on context relevance (weighted highest), memorability, pronunciation, distinctiveness, and brandability, and output only the best 10.
- Ensure the names represent a mix across the branding/positioning territories defined in the naming brief. Each name must be assigned to its correct territory name under the "territory" key in the output JSON.
- Must not contain Tamil or regional terms.
- Ideas: coined or compound names with emotional/abstract meaning.
- No generic dictionary words or obvious AI clichés (no "ify", "tech", etc).
- Format output as JSON strictly conforming to this schema:
{COMMON_OUTPUT_SCHEMA}
Return ONLY valid JSON. (Note: tamilRoot field can be null or empty)."""

    english_gen_user = f"""Brief: {brief_str}"""

    heritage_gen_sys = f"""You are a master Tamil cultural and naming expert. Using the brief and Tamil roots, generate Contextual Heritage brand names.
- You must generate 40 candidate names internally, score them on context relevance (weighted highest), memorability, pronunciation, distinctiveness, and brandability, and output only the best 10.
- Ensure the names represent a mix across the branding/positioning territories defined in the naming brief. Each name must be assigned to its correct territory name under the "territory" key in the output JSON.
- Contextual Heritage names draw from classical Tamil literary tradition (Sangam poetry, Thirukkural), ancient Tamil history (Chola, Chera, Pandya dynasties, Sangam assembly era), and ancient historical places, ports, rivers, or kings (e.g. Madurai, Puhar, Korkai, Muziris, Kanchi, Vanci, Kumari, Sangam).
- CRITICAL CONSTRAINT: A name must earn its historical connection. You must ONLY generate historical or classical heritage names when the context directly justifies them. If the project has no direct relation to history, geography, tradition, or heritage, you should fall back to generating beautiful, meaningful pure Tamil names or roots that are relevant, rather than force-fitting ancient terms.
- Names can be in Tamil script, Latin characters, or a blend.
- Format output as JSON strictly conforming to this schema:
{COMMON_OUTPUT_SCHEMA}
Return ONLY valid JSON."""

    heritage_gen_user = f"""Brief: {brief_str}
Roots: {roots_str}"""

    # ────────────────────────────────────────────────────────────
    # Stage 6: Execution & Output Assembly
    # ────────────────────────────────────────────────────────────
    final_names = []

    try:
        if style == "Tamil":
            final_names = generate_style_candidates("Tamil", tamil_gen_sys, tamil_gen_user)
        elif style == "Global Tamil":
            final_names = generate_style_candidates("Global Tamil", global_tamil_gen_sys, global_tamil_gen_user)
        elif style == "English":
            final_names = generate_style_candidates("English", english_gen_sys, english_gen_user)
        elif style == "Contextual Heritage":
            final_names = generate_style_candidates("Contextual Heritage", heritage_gen_sys, heritage_gen_user)
        else:
            final_names = generate_style_candidates("Global Tamil", global_tamil_gen_sys, global_tamil_gen_user)

        response_data = {
            "names": final_names[:10],
            "brief": naming_brief
        }
        return jsonify(response_data)
    except Exception as e:
        app.logger.error(f"Error in multi-stage generate pipeline: {e}")
        return api_error(e)

# ────────────────────────────────────────────────────────────
# /api/tts
# ────────────────────────────────────────────────────────────
@app.route('/api/tts')
def tts():
    text = request.args.get('text','').strip()
    lang = request.args.get('lang','en').strip()
    if not text: return "No text", 400
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
        return str(e), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)