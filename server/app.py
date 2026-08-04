import os
import sys
import json
import hashlib
import uuid
import random
import time

from flask import Flask, request, jsonify, session, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit, join_room as sio_join_room, leave_room as sio_leave_room
from datetime import timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__, static_folder='static', template_folder='templates',
            instance_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance'))
_raw_secret = os.environ.get('SECRET_KEY', '')
# Render의 generateValue는 재시작마다 값이 바뀌어 세션이 무효화됨.
# SECRET_KEY가 설정돼 있지 않거나 너무 짧으면 고정 기본값을 사용한다.
app.secret_key = _raw_secret if len(_raw_secret) >= 16 else 'dungeon-fighter-fixed-secret-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'sqlite:///' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dungeon_fighter.db')
).replace('postgres://', 'postgresql://', 1)

# Monkey-patch: Flask 3.x+ on Python >= 3.14 removes RequestContext.session setter,
# which breaks flask-socketio's _handle_event → ctx.session = session_obj.
# Re-add the setter so flask-socketio can assign session inside connect/shoot handlers.
from flask import ctx as _flask_ctx
from flask.sessions import SessionMixin as _SessionMixin
_prop = _flask_ctx.RequestContext.__dict__.get('session')
if _prop is not None and _prop.fset is None:
    def _session_setter(self, value):
        if value is None:
            self._session = None
        elif isinstance(value, _SessionMixin):
            self._session = value
        else:
            self._session = value
    _flask_ctx.RequestContext.session = property(_prop.fget, _session_setter, _prop, _prop.__doc__)

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='threading',
    ping_interval=10,
    ping_timeout=60,
    max_http_buffer_size=1_000_000,
    logger=True,
    engineio_logger=True,
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
db = SQLAlchemy(app)

DEFAULT_CHARACTER = {
    "hat": None, "clothes": None,
    "hat_color": None, "clothes_color": None
}
DEFAULT_ITEMS = {
    "gun": {"unlocked": True, "permLv": 0},
    "armor": {"unlocked": False, "permLv": 0},
    "drink": {"unlocked": False, "permLv": 0},
    "bomb": {"unlocked": False, "permLv": 0},
    "shotgun": {"unlocked": False, "permLv": 0},
    "sniper": {"unlocked": False, "permLv": 0},
    "katana": {"unlocked": False, "permLv": 0},
    "shield": {"unlocked": False, "permLv": 0},
    "boots": {"unlocked": False, "permLv": 0},
    "vampire": {"unlocked": False, "permLv": 0},
    "regen": {"unlocked": False, "permLv": 0},
    "fireball": {"unlocked": False, "permLv": 0},
    "iceblast": {"unlocked": False, "permLv": 0},
    "excalibur": {"unlocked": False, "permLv": 0},
}
DEFAULT_UNLOCKED_HATS = [None, "baseball_cap", "beanie"]
DEFAULT_UNLOCKED_CLOTHES = [None, "tshirt", "hoodie"]
DEFAULT_UNLOCKED_PETS = []
ITEM_PERM_UPGRADE_COST_BASE = 30
MAX_PERM_LEVEL = 50

COMBAT_PRICES = {
    "gun": 5000, "armor": 5000, "bomb": 5000, "drink": 20000,
    "shotgun": 20000, "sniper": 50000, "katana": 50000,
    "shield": 20000, "boots": 20000, "vampire": 100000,
    "regen": 50000, "fireball": 100000, "iceblast": 100000,
    "excalibur": 300000,
}
COSTUME_PRICES = {
    "baseball_cap": 5000, "beanie": 5000, "fedora": 5000, "headband": 5000,
    "beret": 5000, "cap_visor": 5000, "chef": 5000, "sailor": 5000,
    "propeller": 5000, "bandana": 5000,
    "top_hat": 20000, "cowboy": 20000, "santa": 20000, "helmet": 20000,
    "party_hat": 20000, "pirate_hat": 20000, "sombrero": 20000, "v_helmet": 20000,
    "crown": 50000, "wizard": 50000, "viking": 50000, "cat_ears": 50000, "halo": 50000,
    "crown_gold": 100000, "samurai": 100000, "knight_helm": 100000,
    "witch": 100000, "crown_thorns": 100000, "mohawk": 100000,
    "tshirt": 5000, "hoodie": 5000, "jacket": 5000, "vest": 5000,
    "sweater": 5000, "track": 5000, "hawaiian": 5000,
    "suit": 20000, "armor": 20000, "robe": 20000, "punk_vest": 20000,
    "labcoat": 20000, "trench": 20000, "butler": 20000, "sailor_suit": 20000, "scout": 20000,
    "captain": 50000, "battle_armor": 50000, "pirate": 50000,
    "winter": 50000, "sheriff": 50000, "jungle": 50000,
    "ninja": 100000, "tuxedo": 100000, "royal": 100000, "knight": 100000, "mage": 100000,
    "cyber": 300000, "dragon": 300000,
}
PET_PRICES = {
    "dog": 20000,
    "cat": 50000,
    "rabbit": 5000,
    "fox": 50000,
}

def migrate_items(raw):
    if isinstance(raw, dict):
        result = {}
        for k in ['gun','armor','drink','bomb','shotgun','sniper','katana','shield','boots','vampire','regen','fireball','iceblast','excalibur']:
            v = raw.get(k)
            if isinstance(v, dict):
                result[k] = {"unlocked": v.get("unlocked", False), "permLv": v.get("permLv", 0)}
            else:
                result[k] = {"unlocked": bool(v), "permLv": 0}
        return result
    return dict(DEFAULT_ITEMS)

rooms = {}

VERIFICATION_CODES = {}

SMTP_CONFIG = {
    "host": os.environ.get("SMTP_HOST", "smtp.gmail.com"),
    "port": int(os.environ.get("SMTP_PORT", "587")),
    "user": os.environ.get("SMTP_USER", ""),
    "pass": os.environ.get("SMTP_PASS", ""),
    "from": os.environ.get("SMTP_FROM", "dungeon-fighter@game.com"),
}

def send_verification_email(to_email, code, purpose="email verification"):
    try:
        if not SMTP_CONFIG["user"] or not SMTP_CONFIG["pass"]:
            print(f"[EMAIL] No SMTP config. Code for {to_email}: {code} (purpose: {purpose})")
            return True
        msg = MIMEMultipart()
        msg["From"] = SMTP_CONFIG["from"]
        msg["To"] = to_email
        msg["Subject"] = "Dungeon Fighter - Verification Code"
        body = f"""Your verification code for {purpose} is: {code}

This code will expire in 10 minutes.

-- Dungeon Fighter Team"""
        msg.attach(MIMEText(body, "plain"))
        server = smtplib.SMTP(SMTP_CONFIG["host"], SMTP_CONFIG["port"], timeout=5)
        server.starttls()
        server.login(SMTP_CONFIG["user"], SMTP_CONFIG["pass"])
        server.sendmail(SMTP_CONFIG["from"], to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"[EMAIL] Send failed for {to_email}: {e}")
        return False

def generate_verification_code():
    return str(random.randint(100000, 999999))

def store_code(email, code, purpose):
    VERIFICATION_CODES[email] = {
        "code": code,
        "purpose": purpose,
        "expires": time.time() + 600,
    }

def verify_code(email, code):
    entry = VERIFICATION_CODES.get(email)
    if not entry:
        return False, "No verification code found"
    if time.time() > entry["expires"]:
        del VERIFICATION_CODES[email]
        return False, "Verification code expired"
    if entry["code"] != code:
        return False, "Invalid verification code"
    purpose = entry["purpose"]
    del VERIFICATION_CODES[email]
    return True, purpose


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(200), default=None)
    level = db.Column(db.Integer, default=1)
    exp = db.Column(db.Integer, default=0)
    coins = db.Column(db.Integer, default=0)
    tokens = db.Column(db.Integer, default=0)
    character = db.Column(db.Text, default=json.dumps(DEFAULT_CHARACTER))
    items = db.Column(db.Text, default=json.dumps(DEFAULT_ITEMS))
    unlocked_stages = db.Column(db.Integer, default=1)
    highest_wave = db.Column(db.Integer, default=0)
    unlocked_hats = db.Column(db.Text, default=json.dumps(DEFAULT_UNLOCKED_HATS))
    unlocked_clothes = db.Column(db.Text, default=json.dumps(DEFAULT_UNLOCKED_CLOTHES))
    unlocked_pets = db.Column(db.Text, default=json.dumps(DEFAULT_UNLOCKED_PETS))
    equipped_items = db.Column(db.Text, default=json.dumps([]))
    equipped_pet = db.Column(db.String(50), default=None)
    pet_slots = db.Column(db.Integer, default=1)
    language = db.Column(db.String(10), default=None)
    country = db.Column(db.String(60), default=None)

    def exp_to_next(self):
        return int(150 * 1.20 ** (self.level - 1))

    def to_dict(self):
        def _ml(raw, default):
            if raw and isinstance(raw, str):
                try: return json.loads(raw)
                except: return list(default)
            return list(default)
        uh = _ml(self.unlocked_hats, DEFAULT_UNLOCKED_HATS)
        uc = _ml(self.unlocked_clothes, DEFAULT_UNLOCKED_CLOTHES)
        char = json.loads(self.character or "{}")
        changed = False
        if char.get("hat") and char["hat"] not in uh:
            uh.append(char["hat"]); changed = True
        if char.get("clothes") and char["clothes"] not in uc:
            uc.append(char["clothes"]); changed = True
        if changed:
            self.unlocked_hats = json.dumps(uh)
            self.unlocked_clothes = json.dumps(uc)
            db.session.commit()
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "level": self.level,
            "exp": self.exp,
            "exp_to_next": self.exp_to_next(),
            "coins": self.coins,
            "tokens": self.tokens,
            "character": char,
            "items": migrate_items(json.loads(self.items)),
            "unlocked_stages": self.unlocked_stages,
            "highest_wave": self.highest_wave,
            "unlocked_hats": uh,
            "unlocked_clothes": uc,
            "unlocked_pets": json.loads(self.unlocked_pets) if self.unlocked_pets and isinstance(self.unlocked_pets, str) else [],
            "equipped_items": json.loads(self.equipped_items) if self.equipped_items and isinstance(self.equipped_items, str) else [],
            "equipped_pet": self.equipped_pet,
            "pet_slots": self.pet_slots,
            "language": self.language,
            "country": self.country,
        }


def migrate_schema():
    """Add missing columns to existing database without data loss."""
    import sqlalchemy as sa
    inspector = sa.inspect(db.engine)
    try:
        columns = [c['name'] for c in inspector.get_columns('user')]
        for col_name in ('unlocked_pets', 'email', 'equipped_items', 'equipped_pet', 'pet_slots', 'language', 'country'):
            if col_name not in columns:
                db.session.execute(sa.text(f'ALTER TABLE "user" ADD COLUMN {col_name} TEXT'))
                db.session.commit()
                print(f'Migration: added column {col_name}')
    except Exception as e:
        print(f'Migration check failed (non-fatal): {e}')

with app.app_context():
    db.create_all()
    migrate_schema()


@app.route('/')
def index():
    return render_template('index.html')


def login_required():
    user_id = session.get('user_id')
    if not user_id:
        return None
    user = db.session.get(User, user_id)
    return user


def add_exp(user, amount):
    user.exp += amount
    while user.exp >= user.exp_to_next():
        user.exp -= user.exp_to_next()
        user.level += 1
    db.session.commit()


@app.route('/api/find-account', methods=['POST'])
def find_account():
    data = request.get_json()
    email = data.get('email', '').strip()
    if not email:
        return jsonify({"error": "Email required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "No account found with that email"}), 404
    code = generate_verification_code()
    store_code(email, code, "find_account")
    send_verification_email(email, code, "account recovery")
    return jsonify({"message": "Verification code sent to your email", "email": email}), 200


@app.route('/api/verify-find-account', methods=['POST'])
def verify_find_account():
    data = request.get_json()
    email = data.get('email', '').strip()
    code = data.get('code', '').strip()
    if not email or not code:
        return jsonify({"error": "Email and code required"}), 400
    valid, msg = verify_code(email, code)
    if not valid:
        return jsonify({"error": msg}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Account not found"}), 404
    new_password = str(uuid.uuid4())[:12]
    user.password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    db.session.commit()
    return jsonify({"username": user.username, "new_password": new_password}), 200


@app.route('/api/send-verification', methods=['POST'])
def send_verification():
    data = request.get_json()
    email = data.get('email', '').strip()
    if not email:
        return jsonify({"error": "Email required"}), 400
    existing = User.query.filter_by(email=email).first()
    if existing and data.get('exclude_self') and login_required() and existing.id == login_required().id:
        pass
    elif existing:
        return jsonify({"error": "Email already in use"}), 409
    code = generate_verification_code()
    store_code(email, code, "email_link")
    send_verification_email(email, code, "email verification")
    return jsonify({"message": "Verification code sent", "status": "code_sent"}), 200


@app.route('/api/verify-email-link', methods=['POST'])
def verify_email_link():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    data = request.get_json()
    email = data.get('email', '').strip()
    code = data.get('code', '').strip()
    if not email or not code:
        return jsonify({"error": "Email and code required"}), 400
    valid, msg = verify_code(email, code)
    if not valid:
        return jsonify({"error": msg}), 400
    if User.query.filter_by(email=email).first() and User.query.filter_by(email=email).first().id != user.id:
        return jsonify({"error": "Email already in use"}), 409
    user.email = email
    db.session.commit()
    return jsonify(user.to_dict()), 200


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    email = data.get('email', '').strip() or None
    country = data.get('country', '').strip() or None
    language = data.get('language') or None
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    if len(username) < 2 or len(username) > 20:
        return jsonify({"error": "Username must be 2-20 characters"}), 400
    if len(password) < 4:
        return jsonify({"error": "Password must be at least 4 characters"}), 400
    if email and User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already in use"}), 409
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409
    user = User(username=username, password_hash=hashlib.sha256(password.encode()).hexdigest(), email=email, country=country, language=language)
    db.session.add(user)
    db.session.commit()
    session['user_id'] = user.id
    session.permanent = True
    return jsonify(user.to_dict()), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    user = User.query.filter_by(username=username).first()
    if not user or user.password_hash != hashlib.sha256(password.encode()).hexdigest():
        return jsonify({"error": "Invalid username or password"}), 401
    session['user_id'] = user.id
    session.permanent = True
    return jsonify(user.to_dict()), 200


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200


@app.route('/api/user', methods=['GET'])
def get_user():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    return jsonify(user.to_dict()), 200


@app.route('/api/user/update', methods=['PUT'])
def update_user():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    data = request.get_json()
    # 'email' 변경은 /api/verify-email-link 를 통해서만 허용
    for key in ('character', 'items', 'unlocked_hats', 'unlocked_clothes', 'unlocked_pets', 'language', 'country'):
        if key in data:
            if key in ('language', 'country'):
                setattr(user, key, data[key])
            else:
                setattr(user, key, json.dumps(data[key]))
    # 숫자 필드는 절대 낮아지지 않도록 MAX 적용 (클라이언트 조작 방지 + Render 재시작 후 캐시된 낮은 값 덮어쓰기 방지)
    if 'level' in data and isinstance(data['level'], int):
        if data['level'] > user.level:
            user.level = data['level']
    if 'exp' in data and isinstance(data['exp'], int):
        user.exp = data['exp']  # exp는 레벨업 후 0으로 돌아오므로 그대로 저장
    if 'coins' in data and isinstance(data['coins'], int):
        if data['coins'] > user.coins:
            user.coins = data['coins']
    if 'tokens' in data and isinstance(data['tokens'], int):
        if data['tokens'] > user.tokens:
            user.tokens = data['tokens']
    if 'unlocked_stages' in data and isinstance(data['unlocked_stages'], int):
        if data['unlocked_stages'] > user.unlocked_stages:
            user.unlocked_stages = min(data['unlocked_stages'], 16)
    if 'highest_wave' in data and isinstance(data['highest_wave'], int):
        if data['highest_wave'] > user.highest_wave:
            user.highest_wave = data['highest_wave']
    db.session.commit()
    return jsonify(user.to_dict()), 200


@app.route('/api/user/delete', methods=['DELETE'])
def delete_user():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    db.session.delete(user)
    db.session.commit()
    session.clear()
    return jsonify({"message": "Account deleted"}), 200


@app.route('/api/store/buy', methods=['POST'])
def store_buy():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    data = request.get_json()
    category = data.get('category')
    item_id = data.get('item_id')
    if not category or item_id is None:
        return jsonify({"error": "Missing category or item_id"}), 400

    if category == 'combat':
        if item_id not in COMBAT_PRICES:
            return jsonify({"error": "Invalid combat item"}), 400
        cost = COMBAT_PRICES[item_id]
        items = migrate_items(json.loads(user.items))
        cur = items.get(item_id, {})
        if isinstance(cur, dict) and cur.get("unlocked"):
            return jsonify({"error": "Already owned"}), 400
        if user.coins < cost:
            return jsonify({"error": f"Need {cost} coins"}), 400
        items[item_id] = {"unlocked": True, "permLv": 0}
        user.items = json.dumps(items)
        user.coins -= cost
        db.session.commit()
        return jsonify(user.to_dict()), 200

    elif category == 'costume':
        if item_id not in COSTUME_PRICES:
            return jsonify({"error": "Invalid costume item"}), 400
        cost = COSTUME_PRICES[item_id]
        uh = json.loads(user.unlocked_hats) if user.unlocked_hats else list(DEFAULT_UNLOCKED_HATS)
        uh_list = uh
        # determine if hat or clothes
        hat_ids = [h["id"] for h in [
            {"id": None}, {"id": "baseball_cap"}, {"id": "beanie"}, {"id": "crown"},
            {"id": "top_hat"}, {"id": "cowboy"}, {"id": "wizard"}, {"id": "santa"},
            {"id": "fedora"}, {"id": "headband"}, {"id": "helmet"}, {"id": "beret"},
            {"id": "cap_visor"}, {"id": "party_hat"}, {"id": "crown_gold"},
            {"id": "samurai"}, {"id": "pirate_hat"}, {"id": "viking"}, {"id": "cat_ears"},
            {"id": "halo"}, {"id": "chef"}, {"id": "knight_helm"}, {"id": "witch"},
            {"id": "sailor"}, {"id": "propeller"}, {"id": "bandana"}, {"id": "sombrero"},
            {"id": "crown_thorns"}, {"id": "v_helmet"}, {"id": "mohawk"},
        ]]
        if item_id in hat_ids:
            if item_id in uh_list:
                return jsonify({"error": "Already owned"}), 400
            if user.coins < cost:
                return jsonify({"error": f"Need {cost} coins"}), 400
            uh_list.append(item_id)
            user.unlocked_hats = json.dumps(uh_list)
        else:
            uc = json.loads(user.unlocked_clothes) if user.unlocked_clothes else list(DEFAULT_UNLOCKED_CLOTHES)
            uc_list = uc
            if item_id in uc_list:
                return jsonify({"error": "Already owned"}), 400
            if user.coins < cost:
                return jsonify({"error": f"Need {cost} coins"}), 400
            uc_list.append(item_id)
            user.unlocked_clothes = json.dumps(uc_list)
        user.coins -= cost
        db.session.commit()
        return jsonify(user.to_dict()), 200

    elif category == 'pet':
        if item_id not in PET_PRICES:
            return jsonify({"error": "Invalid pet item"}), 400
        cost = PET_PRICES[item_id]
        up = json.loads(user.unlocked_pets) if user.unlocked_pets and isinstance(user.unlocked_pets, str) else []
        if item_id in up:
            return jsonify({"error": "Already owned"}), 400
        if user.coins < cost:
            return jsonify({"error": f"Need {cost} coins"}), 400
        up.append(item_id)
        user.unlocked_pets = json.dumps(up)
        user.coins -= cost
        db.session.commit()
        return jsonify(user.to_dict()), 200

    return jsonify({"error": "Invalid category"}), 400


@app.route('/api/item/perm-upgrade', methods=['POST'])
def perm_upgrade_item():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    data = request.get_json()
    item_id = data.get('item_id')
    if item_id not in ['gun','armor','drink','bomb','shotgun','sniper','katana','shield','boots','vampire','regen','fireball','iceblast','excalibur']:
        return jsonify({"error": "Invalid item"}), 400
    items = migrate_items(json.loads(user.items))
    item = items.get(item_id, {"unlocked": False, "permLv": 0})
    if isinstance(item, bool):
        item = {"unlocked": item, "permLv": 0}
    if not item.get("unlocked"):
        return jsonify({"error": "Item not unlocked"}), 400
    cur = item.get("permLv", 0)
    if cur >= MAX_PERM_LEVEL:
        return jsonify({"error": "Max level reached"}), 400
    cost = 30 + cur * 15
    if user.coins < cost:
        return jsonify({"error": f"Need {cost} coins"}), 400
    item["permLv"] = cur + 1
    items[item_id] = item
    user.items = json.dumps(items)
    user.coins -= cost
    db.session.commit()
    return jsonify(user.to_dict()), 200


@app.route('/api/item/perm-downgrade', methods=['POST'])
def perm_downgrade_item():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    data = request.get_json()
    item_id = data.get('item_id')
    if item_id not in ['gun','armor','drink','bomb','shotgun','sniper','katana','shield','boots','vampire','regen','fireball','iceblast','excalibur']:
        return jsonify({"error": "Invalid item"}), 400
    items = migrate_items(json.loads(user.items))
    item = items.get(item_id, {"unlocked": False, "permLv": 0})
    if isinstance(item, bool):
        item = {"unlocked": item, "permLv": 0}
    cur = item.get("permLv", 0)
    if cur <= 0:
        return jsonify({"error": "Already at minimum level"}), 400
    refund = cur * 15 // 2
    item["permLv"] = cur - 1
    items[item_id] = item
    user.items = json.dumps(items)
    user.coins += refund
    db.session.commit()
    return jsonify(user.to_dict()), 200


@app.route('/api/equip', methods=['POST'])
def toggle_equip():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    data = request.get_json()
    item_id = data.get('item_id')
    action = data.get('action')
    if item_id not in ['gun','armor','drink','bomb','shotgun','sniper','katana','shield','boots','vampire','regen','fireball','iceblast','excalibur']:
        return jsonify({"error": "Invalid item"}), 400
    items = migrate_items(json.loads(user.items))
    if not items.get(item_id, {}).get("unlocked"):
        return jsonify({"error": "Item not unlocked"}), 400
    equipped = json.loads(user.equipped_items) if user.equipped_items else []
    if action == 'add':
        if len(equipped) >= 6:
            return jsonify({"error": "Max 6 items equipped"}), 400
        if item_id not in equipped:
            equipped.append(item_id)
    elif action == 'remove':
        if item_id in equipped:
            equipped.remove(item_id)
    user.equipped_items = json.dumps(equipped)
    db.session.commit()
    return jsonify(user.to_dict()), 200


@app.route('/api/equip-pet', methods=['POST'])
def api_equip_pet():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    data = request.get_json()
    pet_id = data.get('pet_id')
    action = data.get('action')
    if pet_id not in PET_PRICES:
        return jsonify({"error": "Invalid pet"}), 400
    up = json.loads(user.unlocked_pets) if user.unlocked_pets and isinstance(user.unlocked_pets, str) else []
    if pet_id not in up:
        return jsonify({"error": "Pet not owned"}), 400
    if action == 'add':
        user.equipped_pet = pet_id
    elif action == 'remove':
        user.equipped_pet = None
    db.session.commit()
    return jsonify(user.to_dict()), 200


@app.route('/api/buy-pet-slot', methods=['POST'])
def api_buy_pet_slot():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    if user.pet_slots >= 2:
        return jsonify({"error": "Already have max pet slots"}), 400
    if user.coins < 50000:
        return jsonify({"error": "Need 50000 coins"}), 400
    user.coins -= 50000
    user.pet_slots = 2
    db.session.commit()
    return jsonify(user.to_dict()), 200


@app.route('/api/stage/complete', methods=['POST'])
def stage_complete():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    data = request.get_json()
    stage = data.get('stage', 1)
    wave = data.get('wave', 1)
    exp_gained = data.get('exp', 0)
    tokens_gained = data.get('tokens', 0)
    coins_gained = data.get('coins', 0)
    cleared = data.get('cleared', False)

    # 값 검증: 음수나 비정상적으로 큰 값 차단
    exp_gained   = max(0, min(int(exp_gained),   500_000))
    tokens_gained = max(0, min(int(tokens_gained), 100_000))
    coins_gained  = max(0, min(int(coins_gained),  100_000))

    # 항상 DB에서 최신 상태를 다시 읽어온다 (Render 재시작 대비)
    db.session.expunge(user)
    user = db.session.get(User, user.id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    add_exp(user, exp_gained)
    user.tokens += tokens_gained
    user.coins  += coins_gained

    if wave > user.highest_wave:
        user.highest_wave = wave
    if cleared and stage >= user.unlocked_stages:
        user.unlocked_stages = min(stage + 1, 16)
    db.session.commit()
    return jsonify(user.to_dict()), 200


@app.route('/api/multiplayer/rooms', methods=['GET'])
def list_rooms():
    room_list = []
    for code, room in rooms.items():
        room_list.append({
            "code": code,
            "host": room["host"],
            "stage": room["stage"],
            "players": len(room["players"]),
            "max_players": room["max_players"],
            "level_limit": room.get("level_limit", 0),
            "is_secret": room.get("secret_code") is not None,
            "status": room["status"],
        })
    return jsonify(room_list), 200


@app.route('/api/multiplayer/create', methods=['POST'])
def create_room():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    data = request.get_json()
    stage = data.get('stage', 1)
    max_players = data.get('max_players', 4)
    level_limit = data.get('level_limit', 0)
    secret_code = data.get('secret_code') or None
    if max_players < 2 or max_players > 8:
        return jsonify({"error": "Invalid max players"}), 400
    code = ''.join(random.choices('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', k=6))
    rooms[code] = {
        "host": user.username,
        "players": [{"username": user.username, "ready": False}],
        "max_players": max_players,
        "level_limit": level_limit,
        "secret_code": secret_code,
        "status": "waiting",
        "game_state": None,
        "stage": stage,
    }
    return jsonify({"code": code}), 201


@app.route('/api/multiplayer/start', methods=['POST'])
def start_room():
    user = login_required()
    if not user:
        return jsonify({'error': 'Not logged in'}), 401
    data = request.get_json()
    code = data.get('code', '').upper()
    room = rooms.get(code)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    if room['host'] != user.username:
        return jsonify({'error': 'Only host can start'}), 403
    if len(room['players']) < 2:
        return jsonify({'error': 'Need at least 2 players'}), 400
    room['status'] = 'playing'
    return jsonify(room), 200


@app.route('/api/multiplayer/join', methods=['POST'])
def join_room():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    data = request.get_json()
    code = data.get('code', '').upper()
    secret = data.get('secret', '')
    room = rooms.get(code)
    if not room:
        return jsonify({"error": "Room not found"}), 404
    if room["status"] != "waiting":
        return jsonify({"error": "Game already started"}), 400
    if len(room["players"]) >= room["max_players"]:
        return jsonify({"error": "Room is full"}), 400
    if any(p["username"] == user.username for p in room["players"]):
        return jsonify({"error": "Already in room"}), 400
    level_limit = room.get("level_limit", 0)
    if level_limit > 0 and user.level < level_limit:
        return jsonify({"error": f"Your level ({user.level}) is below this room's minimum ({level_limit})"}), 400
    secret_code = room.get("secret_code")
    if secret_code and secret != secret_code:
        return jsonify({"error": "Wrong room password"}), 400
    room["players"].append({"username": user.username, "ready": False})
    return jsonify({"code": code, "stage": room["stage"], "players": room["players"]}), 200


@app.route('/api/multiplayer/leave', methods=['POST'])
def leave_room():
    user = login_required()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    data = request.get_json()
    code = data.get('code', '').upper()
    room = rooms.get(code)
    if not room:
        return jsonify({"error": "Room not found"}), 404
    _remove_user_from_rooms(user.username)
    return jsonify({"message": "Left room"}), 200


@app.route('/api/multiplayer/room/<code>', methods=['GET'])
def get_room(code):
    room = rooms.get(code.upper())
    if not room:
        return jsonify({"error": "Room not found"}), 404
    return jsonify(room), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Server starting on http://127.0.0.1:{port}")
    socketio.run(app, host='0.0.0.0', port=port, debug=False)

# ============== SOCKET.IO MULTIPLAYER EVENTS ==============
sid_users = {}   # sid  -> user_id
sid_rooms = {}   # sid  -> room code (게임 참가 중인 방)
_user_cache = {} # uid  -> username (간단한 캐시)

def _get_user():
    uid = sid_users.get(request.sid)
    if not uid:
        return None
    try:
        user = db.session.get(User, uid)
        if user:
            _user_cache[uid] = user.username
        return user
    except Exception:
        db.session.rollback()
        return None

def _get_username(uid):
    """DB 조회 없이 username만 빠르게 가져오기 (캐시 우선)"""
    if uid in _user_cache:
        return _user_cache[uid]
    try:
        user = db.session.get(User, uid)
        if user:
            _user_cache[uid] = user.username
            return user.username
    except Exception:
        db.session.rollback()
    return None

def _remove_user_from_rooms(username):
    """유저가 참가 중인 모든 방에서 제거하고 다른 플레이어에게 알린다."""
    for code in list(rooms.keys()):
        room = rooms.get(code)
        if not room:
            continue
        before = len(room['players'])
        room['players'] = [p for p in room['players'] if p['username'] != username]
        if len(room['players']) != before:
            if len(room['players']) == 0:
                rooms.pop(code, None)
            else:
                if room['host'] == username and room['players']:
                    room['host'] = room['players'][0]['username']
                    socketio.emit('host_changed', {'host': room['host']}, room=code)
                socketio.emit('player_left', {'username': username}, room=code)

@socketio.on('connect')
def on_connect():
    sid_users[request.sid] = None
    print(f'[SOCKET] connect: {request.sid}')

@socketio.on('auth')
def on_auth(data=None):
    user_id = None
    username = None
    user = None

    # 1. HTTP 세션 (일반 브라우저) — 가장 확실
    user_id = session.get('user_id')
    if user_id:
        user = db.session.get(User, user_id)
        if user:
            username = user.username
            _user_cache[user_id] = username

    # 2. 클라이언트가 직접 보낸 username (세션 없는 경우 대비)
    if not user and isinstance(data, dict) and data.get('username'):
        username = data.get('username')
        user = User.query.filter_by(username=username).first()
        if user:
            user_id = user.id
            _user_cache[user_id] = username

    if not user_id or not user:
        print(f'[SOCKET] auth failed for sid={request.sid}')
        return

    sid_users[request.sid] = user_id
    _user_cache[user_id] = user.username
    print(f'[SOCKET] auth ok: {user.username} (sid={request.sid})')
    emit('auth_ok', {'username': user.username})

@socketio.on('disconnect')
def on_disconnect():
    sid = request.sid
    uid = sid_users.pop(sid, None)
    code = sid_rooms.pop(sid, None)
    if uid:
        username = _get_username(uid)
        print(f'[SOCKET] disconnect: {username} (sid={sid})')
        if username:
            _remove_user_from_rooms(username)

@socketio.on('join_game')
def on_join_game(data):
    user = _get_user()
    if not user:
        emit('error', {'msg': 'Not logged in'})
        return
    code = data.get('code', '').upper()
    room = rooms.get(code)
    if not room:
        return
    sio_join_room(code)
    sid_rooms[request.sid] = code
    if not any(p['username'] == user.username for p in room['players']):
        room['players'].append({'username': user.username, 'ready': False})
    print(f'[SOCKET] join_game: {user.username} -> room {code} (players: {len(room["players"])}, status: {room.get("status")})')
    emit('player_joined', {
        'username': user.username,
        'character': json.loads(user.character or '{}'),
    }, room=code)

@socketio.on('leave_game')
def on_leave_game(data):
    user = _get_user()
    if not user:
        return
    code = data.get('code', '').upper()
    sio_leave_room(code)
    sid_rooms.pop(request.sid, None)
    _remove_user_from_rooms(user.username)

@socketio.on('game_start')
def on_game_start(data):
    user = _get_user()
    if not user:
        return
    code = data.get('code', '').upper()
    room = rooms.get(code)
    if not room or room['host'] != user.username:
        return
    room['status'] = 'playing'

    # 모든 플레이어의 캐릭터 정보를 수집
    all_players = []
    for p in room['players']:
        p_uid = next((uid for uid, uname in _user_cache.items() if uname == p['username']), None)
        char_data = None
        if p_uid:
            try:
                p_user = db.session.get(User, p_uid)
                if p_user:
                    char_data = json.loads(p_user.character or '{}')
                    all_players.append({
                        'username': p_user.username,
                        'character': char_data,
                    })
            except Exception:
                db.session.rollback()

    # game_started에 모든 플레이어 정보를 포함해서 한 번에 전달
    emit('game_started', {
        'stage': room['stage'],
        'players': len(room['players']),
        'all_players': all_players,
    }, room=code)

# ── 플레이어 위치 relay (호스트 포함 같은 방 전체에 브로드캐스트, 본인 제외) ──
_server_log_count = {'player_update': 0, 'monster_sync': 0}

@socketio.on('player_update')
def on_player_update(data):
    user = _get_user()
    if not user:
        return
    code = data.get('code', '').upper()
    room = rooms.get(code)
    if not room or room.get('status') != 'playing':
        return
    _server_log_count['player_update'] += 1
    if _server_log_count['player_update'] % 60 == 1:
        print(f'[SOCKET] player_update from {user.username} (total: {_server_log_count["player_update"]})')
    emit('player_state', {
        'username':    user.username,
        'x':           data.get('x', 0),
        'y':           data.get('y', 0),
        'hp':          data.get('hp', 0),
        'maxHp':       data.get('maxHp', 100),
        'dir':         data.get('dir', 'down'),
        'frame':       data.get('frame', 0),
        'hatId':       data.get('hatId'),
        'clothesId':   data.get('clothesId'),
        'hatColor':    data.get('hatColor'),
        'clothesColor':data.get('clothesColor'),
    }, room=code, include_self=False)

# ── 총알 relay (본인 제외, 방 내 전체) ──
@socketio.on('player_shoot')
def on_player_shoot(data):
    user = _get_user()
    if not user:
        return
    code = data.get('code', '').upper()
    room = rooms.get(code)
    if not room or room.get('status') != 'playing':
        return
    emit('bullet_fired', {
        'username': user.username,
        'x':    data.get('x', 0),
        'y':    data.get('y', 0),
        'toX':  data.get('toX', 0),
        'toY':  data.get('toY', 0),
    }, room=code, include_self=False)

# ── 몬스터 sync: 호스트만 전송 가능, 원본 data 그대로 relay (가장 낮은 지연) ──
@socketio.on('monster_sync')
def on_monster_sync(data):
    user = _get_user()
    if not user:
        return
    code = data.get('code', '').upper()
    room = rooms.get(code)
    # 호스트만 monster_sync를 전송할 수 있다
    if not room or room.get('host') != user.username:
        return
    if room.get('status') != 'playing':
        return
    _server_log_count['monster_sync'] += 1
    if _server_log_count['monster_sync'] % 30 == 1:
        mcount = len(data.get('monsters', []))
        print(f'[SOCKET] monster_sync from host {user.username}: {mcount} monsters, wave={data.get("wave")} (total: {_server_log_count["monster_sync"]})')
    emit('monster_sync', data, room=code, include_self=False)

# ── 게스트 → 호스트: 몬스터 처치 보고 ──
# 호스트에게만 relay하므로 username 필드만 추가
@socketio.on('monster_killed')
def on_monster_killed(data):
    user = _get_user()
    if not user:
        return
    code = data.get('code', '').upper()
    room = rooms.get(code)
    if not room:
        return
    # 호스트 sid를 찾아 직접 전송 (방 전체 브로드캐스트 대신 → 대역폭 절약)
    host_username = room.get('host')
    host_sid = next(
        (sid for sid, uid in sid_users.items()
         if uid and _get_username(uid) == host_username),
        None
    )
    payload = {'username': user.username, 'id': data.get('id')}
    if host_sid:
        emit('monster_killed', payload, to=host_sid)
    else:
        # fallback: 방 전체 브로드캐스트
        emit('monster_killed', payload, room=code, include_self=False)
