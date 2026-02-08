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

 
# Esto evita conflictos de "Access-Control-Allow-Origin" duplicados.
CORS(api)


# Helpers y validaciones

EMAIL_RE = re.compile(r"[^@]+@[^@]+\.[^@]+")

def _validate_email(email: str) -> bool:
    
    if not isinstance(email, str):
        return False
    return bool(EMAIL_RE.fullmatch(email.strip()))

def _validate_password(password: str) -> bool:
    
    if not isinstance(password, str):
        return False
    pw = password.strip()
    return 6 <= len(pw) <= 128

def _is_token_revoked(jti: str) -> bool:
    
    if not jti:
        return True
    return TokenBlocklist.query.filter_by(jti=jti).first() is not None



# Endpoints


@api.route('/signup', methods=['POST'])
def signup():
    """Registro de usuario con hashing de password."""
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400
    if not _validate_email(email):
        return jsonify({"msg": "Invalid email format"}), 400
    if not _validate_password(password):
        return jsonify({"msg": "Password must be 6-128 chars"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 409

    user = User(email=email)
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "User already exists"}), 409

    return jsonify({"id": user.id, "email": user.email}), 201


@api.route('/token', methods=['POST'])
def token():
    
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return jsonify({"msg": "Bad credentials"}), 401

    if not user.is_active:
        return jsonify({"msg": "User not active"}), 403

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"token": access_token, "user_id": user.id}), 200


@api.route('/private', methods=['GET'])
@jwt_required()
def private():
    """Ruta protegida: valida token y existencia del usuario."""
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
    jwt_data = get_jwt()
    jti = jwt_data.get("jti")
    
    if TokenBlocklist.query.filter_by(jti=jti).first():
        return jsonify({"msg": "Token already revoked"}), 200

    revoked = TokenBlocklist(jti=jti)
    db.session.add(revoked)
    db.session.commit()
    return jsonify({"msg": "Token revoked"}), 200


@api.route('/hello', methods=['GET'])
def handle_hello():
    return jsonify({"message": "Backend online y conectado."}), 200