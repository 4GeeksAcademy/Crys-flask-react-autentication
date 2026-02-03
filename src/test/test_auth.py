# --- path fix para poder importar app y modelos ---
import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, BASE_DIR)

import json
import uuid
import pytest

from app import app as flask_app
from api.models import db, User, TokenBlocklist


# ---------- cliente de pruebas ----------
@pytest.fixture(scope="module")
def client():
    """
    Creamos cliente de pruebas de Flask.
    Usa la app real pero en modo TESTING.
    No reinicializamos db porque ya está ligada en app.py
    """
    flask_app.config["TESTING"] = True

    with flask_app.app_context():
        db.drop_all()
        db.create_all()

        with flask_app.test_client() as client:
            yield client

        db.session.remove()
        db.drop_all()


# ---------- helpers ----------
def signup(client, email=None, password="123456"):
    """Crea usuario nuevo para pruebas"""
    if email is None:
        email = f"user_{uuid.uuid4().hex}@test.com"

    return client.post(
        "/api/signup",
        data=json.dumps({
            "email": email,
            "password": password
        }),
        content_type="application/json"
    )


def login(client, email, password="123456"):
    """Login y obtención de token"""
    return client.post(
        "/api/token",
        data=json.dumps({
            "email": email,
            "password": password
        }),
        content_type="application/json"
    )


# ---------- tests ----------

def test_signup_ok(client):
    """Usuario se crea correctamente"""
    resp = signup(client)
    assert resp.status_code == 201


def test_signup_duplicate(client):
    """No permite duplicados"""
    email = "dup@test.com"
    assert signup(client, email).status_code == 201
    assert signup(client, email).status_code == 409


def test_login_ok(client):
    """Login correcto devuelve token"""
    r = signup(client)
    email = r.get_json()["email"]

    resp = login(client, email)
    assert resp.status_code == 200
    assert "token" in resp.get_json()


def test_login_bad_password(client):
    """Password incorrecta da 401"""
    r = signup(client)
    email = r.get_json()["email"]

    resp = login(client, email, "wrong")
    assert resp.status_code == 401


def test_private_and_logout_flow(client):
    """
    Flujo completo:
    login → private ok → logout → private bloqueado
    """
    r = signup(client)
    email = r.get_json()["email"]

    token = login(client, email).get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    assert client.get("/api/private", headers=headers).status_code == 200
    assert client.post("/api/logout", headers=headers).status_code == 200
    assert client.get("/api/private", headers=headers).status_code == 401


def test_blocklist_written(client):
    """Logout guarda jti en blocklist"""
    r = signup(client)
    email = r.get_json()["email"]

    token = login(client, email).get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/api/logout", headers=headers)

    assert TokenBlocklist.query.count() >= 1


            #recordar que en la terminal para probarlo es pipenv run pytest -q , con esto deberian pasar los test si todo esta ok 
