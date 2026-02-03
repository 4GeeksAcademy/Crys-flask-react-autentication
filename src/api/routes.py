from flask import Blueprint, request, jsonify
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError

from api.models import db, User, TokenBlocklist
from api.utils import APIException 

# JWT helpers
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)

import re
from datetime import timedelta

api = Blueprint('api', __name__)
CORS(api)  # permitir llamadas desde el front en desarrollo


# ----------------------------
# Helpers y validaciones
# ----------------------------
EMAIL_RE = re.compile(r"[^@]+@[^@]+\.[^@]+")


def _validate_email(email: str) -> bool:
    """Validación básica de formato de email (suficiente para bootcamp)."""
    if not isinstance(email, str):
        return False
    return bool(EMAIL_RE.fullmatch(email.strip()))


def _validate_password(password: str) -> bool:
    """Validaciones básicas de password (mínimo recomendado)."""
    if not isinstance(password, str):
        return False
    pw = password.strip()
    return 6 <= len(pw) <= 128  # mínimo 6, máximo 128 para que el hash encaje


def _is_token_revoked(jti: str) -> bool:
    """Consulta la blocklist para ver si un token fue revocado."""
    if not jti:
        return True
    return TokenBlocklist.query.filter_by(jti=jti).first() is not None


# ----------------------------
# Endpoints
# ----------------------------

@api.route('/signup', methods=['POST'])
def signup():
    """
    Registro de usuario.
    Body esperado: { "email": "...", "password": "..." }
    Respuestas:
      - 201 creado con { id, email }
      - 400 si falta/invalid input
      - 409 si email ya existe
    """
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    # Validaciones básicas en el borde
    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400
    if not _validate_email(email):
        return jsonify({"msg": "Invalid email format"}), 400
    if not _validate_password(password):
        return jsonify({"msg": "Password must be 6-128 chars"}), 400

    # Evitar race condition: chequeo + intento de insert en transacción
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 409

    user = User(email=email)
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        # Caso muy raro por race condition: ya existe
        db.session.rollback()
        return jsonify({"msg": "User already exists"}), 409

    return jsonify({"id": user.id, "email": user.email}), 201


@api.route('/token', methods=['POST'])
def token():
    """
    Login: genera un access token JWT.
    Body esperado: { "email": "...", "password": "..." }
    Respuestas:
      - 200 { token, user_id }
      - 400 input inválido
      - 401 credenciales inválidas
    """
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400
    if not _validate_email(email):
        return jsonify({"msg": "Invalid email format"}), 400

    user = User.query.filter_by(email=email).first()
    # 401 si no existe o contraseña incorrecta
    if user is None or not user.check_password(password):
        return jsonify({"msg": "Bad credentials"}), 401

    if not user.is_active:
        # Opcional: distinto código si usuario desactivado
        return jsonify({"msg": "User not active"}), 403

    # Crea token. Identity = user.id (nunca incluir password ni datos sensibles)
    access_token = create_access_token(identity=user.id)
    return jsonify({"token": access_token, "user_id": user.id}), 200


@api.route('/private', methods=['GET'])
@jwt_required()
def private():
    """
    Ruta protegida de ejemplo.
    - Valida token JWT (firma + expiración)
    - Chequea blocklist (token no revocado)
    - Devuelve la info del usuario autenticado
    """
    # Recupera datos del token
    jwt_data = get_jwt()
    jti = jwt_data.get("jti")
    if _is_token_revoked(jti):
        return jsonify({"msg": "Token revoked"}), 401

    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user is None:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({"id": user.id, "email": user.email}), 200


@api.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout server-side:
    - Inserta el `jti` del token actual en TokenBlocklist para invalidarlo.
    - Nota: el frontend también debe borrar sessionStorage.
    """
    jwt_data = get_jwt()
    jti = jwt_data.get("jti")
    if not jti:
        return jsonify({"msg": "Invalid token"}), 400

    # Evitar duplicados
    if TokenBlocklist.query.filter_by(jti=jti).first():
        return jsonify({"msg": "Token already revoked"}), 200

    revoked = TokenBlocklist(jti=jti)
    db.session.add(revoked)
    db.session.commit()
    return jsonify({"msg": "Token revoked"}), 200


# ----------------------------
# Ejemplo simple: endpoint público de prueba
# ----------------------------
@api.route('/hello', methods=['GET', 'POST'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend. Check /api/private for a protected example."
    }
    return jsonify(response_body), 200
