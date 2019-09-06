import pytest
from _pytest.monkeypatch import MonkeyPatch
from starlette.testclient import TestClient
import random

from title_page import app


@pytest.fixture
def test_client():
    return TestClient(app)


def test_frontend_loads(test_client: TestClient):
    response = test_client.get("/")
    assert response.status_code == 200
    assert 'script src="/static/src.' in response.text


def test_create(test_client: TestClient, monkeypatch: MonkeyPatch):
    def fake_choice(*args):
        return "1"

    monkeypatch.setattr(random, "choice", fake_choice)
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
    assert response.status_code == 200
    assert response.json()["filename"] == "1111_symphony_no_5_title_page.pdf"
    assert response.json()["url"] == "/media/1111_symphony_no_5_title_page.pdf"
