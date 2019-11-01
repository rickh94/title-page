import tempfile
import uuid
from pathlib import Path

import pytest
import requests
from _pytest.monkeypatch import MonkeyPatch
from starlette.testclient import TestClient

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


def test_create(test_client: TestClient, monkeypatch: MonkeyPatch, tmp_path):
    def fake_uuid(*args):
        return "111-111-111-111"

    monkeypatch.setattr(uuid, "uuid4", fake_uuid)
    monkeypatch.setattr(title_page, "PDF_PATH", tmp_path)
    monkeypatch.setattr(title_page, "COMPLETIONS_PATH", tmp_path)
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
    assert response.json()["filename"] == "111-111-111-111.pdf"
    assert response.json()["url"] == "/media/111-111-111-111.pdf"


def test_create_with_font(test_client: TestClient, monkeypatch: MonkeyPatch, tmp_path):
    def fake_uuid(*args):
        return "111-111-111-111"

    monkeypatch.setattr(uuid, "uuid4", fake_uuid)
    monkeypatch.setattr(title_page, "PDF_PATH", tmp_path)
    monkeypatch.setattr(title_page, "COMPLETIONS_PATH", tmp_path)
    monkeypatch.setattr(tempfile, "mkdtemp", lambda: tmp_path)
    response = test_client.post(
        "/generate",
        json={
            "title": "Symphony No. 5",
            "composers": ["Ludwig van Beethoven"],
            "part": "Horn I",
            "extra_info": ["Urtext"],
            "part_additional": "in F",
            "font": "Open Sans",
        },
    )
    assert response.ok
    assert response.json()["filename"] == "111-111-111-111.pdf"
    assert response.json()["url"] == "/media/111-111-111-111.pdf"

    html_path = tmp_path / "111-111-111-111.html"
    with html_path.open("r") as html_file:
        assert "font-family: 'Open Sans'" in html_file.read()


def test_create_non_ascii(
    test_client: TestClient, monkeypatch: MonkeyPatch, tmp_path: Path
):
    def fake_uuid(*args):
        return "222-222-222-222"

    monkeypatch.setattr(uuid, "uuid4", fake_uuid)
    monkeypatch.setattr(title_page, "PDF_PATH", tmp_path)
    monkeypatch.setattr(title_page, "COMPLETIONS_PATH", tmp_path)
    response = test_client.post(
        "/generate",
        json={"title": "abcñ", "composers": ["Test Composer"], "part": "Violin I"},
    )

    assert response.ok
    assert response.json()["filename"] == "222-222-222-222.pdf"
    assert response.json()["url"] == "/media/222-222-222-222.pdf"


def test_create_adds_to_autocomplete_composers_list(
    test_client: TestClient, monkeypatch: MonkeyPatch, tmp_path: Path
):
    monkeypatch.setattr(title_page, "COMPLETIONS_PATH", tmp_path)
    monkeypatch.setattr(title_page, "PDF_PATH", tmp_path)

    response1 = test_client.post(
        "/generate",
        json={
            "title": "Orchestral Suite No. 1",
            "composers": ["Johann Sebastian Bach"],
            "part": "Violin 1",
        },
    )

    assert response1.ok

    response2 = test_client.get("/completions/composers")

    assert response2.ok
    assert "Johann Sebastian Bach" in response2.json()


def test_combine(test_client: TestClient, monkeypatch: MonkeyPatch, tmp_path: Path):
    monkeypatch.setattr(title_page, "PDF_PATH", tmp_path)
    monkeypatch.setattr(title_page, "COMPLETIONS_PATH", tmp_path)
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


def test_get_autocomplete_composers(
    test_client: TestClient, monkeypatch: MonkeyPatch, tmp_path: Path
):
    monkeypatch.setattr(title_page, "COMPLETIONS_PATH", tmp_path)
    composer_completions = tmp_path / "composers.txt"
    with composer_completions.open("w") as composer_file:
        composer_file.write("Johann Sebastian Bach\n")
        composer_file.write("Ludwig van Beethoven")

    response = test_client.get("/completions/composers")

    assert "Johann Sebastian Bach" in response.json()
    assert "Ludwig van Beethoven" in response.json()
