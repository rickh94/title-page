from pathlib import Path

import pytest
import requests
from _pytest.monkeypatch import MonkeyPatch
from starlette.testclient import TestClient
import random

import title_page
from title_page import app


@pytest.fixture
def test_client(monkeypatch: MonkeyPatch):
    monkeypatch.setattr(title_page, "PDF_PATH", Path("/tmp/media/"))
    return TestClient(app)


def test_frontend_loads(test_client: TestClient):
    response = test_client.get("/")
    assert response.status_code == 200
    assert 'script src="/static/src.' in response.text


def test_create(test_client: TestClient, monkeypatch: MonkeyPatch):
    def fake_choice(*args):
        return "1"

    monkeypatch.setattr(random, "choice", fake_choice)
    monkeypatch.setattr(title_page, "PDF_PATH", Path("/tmp/media/"))
    response = test_client.post(
        "/generate",
        json={
            "title": "Symphony No. 5",
            "composers": ["Ludwig van Beethoven"],
            "part": "Horn I",
            "extra_info": ["Urtext"],
            "part_additional": "in F",
        },
    )
    assert response.ok
    assert response.json()["filename"] == "1111_symphony_no_5_title_page.pdf"
    assert response.json()["url"] == "/media/1111_symphony_no_5_title_page.pdf"
    assert 0


def test_combine(test_client: TestClient, monkeypatch: MonkeyPatch):
    monkeypatch.setattr(title_page, "PDF_PATH", Path("/tmp/media/"))
    response = test_client.post(
        "/generate",
        json={
            "title": "Symphony No. 5",
            "composers": ["Ludwig van Beethoven"],
            "part": "Horn I",
            "extra_info": ["Urtext"],
            "part_additional": "in F",
        },
    )
    filename = response.json()["filename"]
    get_pdf = requests.get(
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    )
    pdf_data = get_pdf.content
    response = test_client.post(
        "/combine",
        data={"title_page_filename": filename},
        files={"file": ("test_file.pdf", pdf_data)},
    )
    assert response.ok
    assert response.json()["filename"] == "test_file.pdf"
