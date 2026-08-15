import json
import os
import pytest

def get_keys(d, prefix=''):
    keys = set()
    for k, v in d.items():
        full_key = f"{prefix}.{k}" if prefix else k
        keys.add(full_key)
        if isinstance(v, dict):
            keys.update(get_keys(v, full_key))
    return keys

def test_translation_parity():
    locales_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'locales')
    
    en_path = os.path.join(locales_dir, 'en.json')
    ta_path = os.path.join(locales_dir, 'ta.json')
    
    assert os.path.exists(en_path), "en.json missing"
    assert os.path.exists(ta_path), "ta.json missing"
    
    with open(en_path, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
        
    with open(ta_path, 'r', encoding='utf-8') as f:
        ta_data = json.load(f)
        
    en_keys = get_keys(en_data)
    ta_keys = get_keys(ta_data)
    
    missing_in_ta = en_keys - ta_keys
    missing_in_en = ta_keys - en_keys
    
    assert not missing_in_ta, f"Keys missing in ta.json: {missing_in_ta}"
    assert not missing_in_en, f"Keys missing in en.json: {missing_in_en}"
