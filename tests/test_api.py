import pytest
from app import app
from unittest.mock import patch

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_generate_missing_data(client):
    response = client.post('/api/generate', json={})
    assert response.status_code == 400
    assert b"Description or Keywords required" in response.data

def test_generate_input_too_long(client):
    response = client.post('/api/generate', json={
        "keywords": "a" * 1000,
        "context": "b" * 1000
    })
    assert response.status_code == 400
    assert b"Input too long" in response.data

@patch('app.groq')
def test_generate_provider_error(mock_groq, client):
    mock_groq.side_effect = Exception("Internal Groq Error - quota exceeded")
    response = client.post('/api/generate', json={
        "keywords": "tech startup",
        "context": "A modern AI company",
        "style": "Global Tamil"
    })
    assert response.status_code == 500
    # Make sure we don't leak the internal error string
    assert b"AI Provider temporarily unavailable" in response.data
    assert b"quota exceeded" not in response.data

def test_tts_missing_text(client):
    response = client.get('/api/tts')
    assert response.status_code == 400
    assert b"No text" in response.data

def test_tts_input_too_long(client):
    response = client.get('/api/tts?text=' + ('a' * 201))
    assert response.status_code == 400
    assert b"Text too long" in response.data

@patch('app.gTTS')
def test_tts_generation_error(mock_gtts, client):
    # If the provider fails, we should hide the error
    mock_gtts.side_effect = Exception("gTTS internal crash")
    response = client.get('/api/tts?text=test')
    assert response.status_code == 500
    assert b"Audio generation failed" in response.data
    assert b"gTTS internal crash" not in response.data
