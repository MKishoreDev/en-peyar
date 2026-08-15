import pytest
from playwright.sync_api import Page, expect
from app import app as flask_app
import os

# Needs pytest-flask live_server fixture which runs the app in a background thread
@pytest.fixture(scope="session")
def app():
    # Setup for pytest-flask
    flask_app.config.update({
        "TESTING": True,
    })
    return flask_app

def test_homepage_loads(live_server, page: Page):
    page.goto(live_server.url())
    
    # Check title
    expect(page).to_have_title("En Peyar — Tamil Name Generator for Startups & Brands")
    
    # Check for core elements
    expect(page.locator("text=En Peyar").first).to_be_visible()
    
    # Verify generator section exists
    generator_section = page.locator("#generator")
    expect(generator_section).to_be_visible()

    # Wait for JS to initialize (e.g. i18n loaded)
    page.wait_for_selector("#context-input", state="visible")
