from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Callable, Optional

from flask import (
    Flask,
    flash,
    g,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.security import check_password_hash, generate_password_hash


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "bank.db"
_DB_INITIALIZED = False

app = Flask(__name__)
app.config["SECRET_KEY"] = "alternatif-bank-demo-secret"


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        g.db = conn
    return g.db


@app.teardown_appcontext
def close_db(exception: Optional[BaseException]) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db() -> None:
    db = get_db()
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            balance REAL NOT NULL DEFAULT 0
        )
        """
    )
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER,
            receiver_id INTEGER,
            amount REAL NOT NULL,
            type TEXT NOT NULL,
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sender_id) REFERENCES users(id),
            FOREIGN KEY(receiver_id) REFERENCES users(id)
        )
        """
    )
    db.commit()


@app.before_request
def ensure_database() -> None:
    global _DB_INITIALIZED
    if not _DB_INITIALIZED or not DB_PATH.exists():
        init_db()
        _DB_INITIALIZED = True


def login_required(view: Callable) -> Callable:
    from functools import wraps

    @wraps(view)
    def wrapped_view(**kwargs):
        if "user_id" not in session:
            flash("Oturum açmanız gerekiyor.", "warning")
            return redirect(url_for("login"))
        return view(**kwargs)

    return wrapped_view


def get_current_user() -> Optional[sqlite3.Row]:
    user_id = session.get("user_id")
    if not user_id:
        return None
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return user


def _parse_amount(raw_value: str) -> Optional[float]:
    try:
        value = float(raw_value.replace(",", "."))
    except (TypeError, ValueError):
        return None
    return value


@app.route("/")
def index():
    if "user_id" in session:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        full_name = request.form.get("full_name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")

        if not full_name or not email or not password:
            flash("Lütfen tüm alanları doldurun.", "danger")
        elif password != confirm_password:
            flash("Şifreler eşleşmiyor.", "danger")
        else:
            db = get_db()
            existing = db.execute(
                "SELECT id FROM users WHERE email = ?", (email,)
            ).fetchone()
            if existing:
                flash("Bu e-posta ile kayıtlı bir kullanıcı zaten var.", "danger")
            else:
                password_hash = generate_password_hash(password)
                db.execute(
                    "INSERT INTO users (full_name, email, password_hash, balance) VALUES (?, ?, ?, ?)",
                    (full_name, email, password_hash, 1000.0),
                )
                db.commit()
                flash("Başarıyla kayıt oldunuz. Şimdi giriş yapın.", "success")
                return redirect(url_for("login"))

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        db = get_db()
        user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if user and check_password_hash(user["password_hash"], password):
            session.clear()
            session["user_id"] = user["id"]
            flash(f"Hoş geldiniz {user['full_name']}!", "success")
            return redirect(url_for("dashboard"))

        flash("Geçersiz e-posta veya şifre.", "danger")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("Başarıyla çıkış yaptınız.", "info")
    return redirect(url_for("login"))


@app.route("/dashboard")
@login_required
def dashboard():
    user = get_current_user()
    db = get_db()

    transactions = db.execute(
        """
        SELECT t.*, su.full_name AS sender_name, ru.full_name AS receiver_name
        FROM transactions t
        LEFT JOIN users su ON t.sender_id = su.id
        LEFT JOIN users ru ON t.receiver_id = ru.id
        WHERE t.sender_id = ? OR t.receiver_id = ?
        ORDER BY t.created_at DESC
        LIMIT 10
        """,
        (user["id"], user["id"]),
    ).fetchall()

    users = db.execute(
        "SELECT id, full_name, email FROM users WHERE id != ? ORDER BY full_name",
        (user["id"],),
    ).fetchall()

    return render_template(
        "dashboard.html",
        user=user,
        transactions=transactions,
        users=users,
    )


@app.route("/deposit", methods=["POST"])
@login_required
def deposit():
    user = get_current_user()
    amount = _parse_amount(request.form.get("amount", "0"))
    note = request.form.get("note", "").strip()

    if amount is None:
        flash("Lütfen sayısal bir tutar girin.", "danger")
        return redirect(url_for("dashboard"))

    if amount <= 0:
        flash("Geçerli bir tutar girin.", "danger")
        return redirect(url_for("dashboard"))

    db = get_db()
    db.execute("UPDATE users SET balance = balance + ? WHERE id = ?", (amount, user["id"]))
    db.execute(
        "INSERT INTO transactions (receiver_id, amount, type, note) VALUES (?, ?, ?, ?)",
        (user["id"], amount, "deposit", note or "Bakiye yükleme"),
    )
    db.commit()
    flash("Bakiye eklendi.", "success")
    return redirect(url_for("dashboard"))


@app.route("/transfer", methods=["POST"])
@login_required
def transfer():
    user = get_current_user()
    receiver_email = request.form.get("receiver_email", "").strip().lower()
    amount = _parse_amount(request.form.get("amount", "0"))
    note = request.form.get("note", "").strip()

    if amount is None:
        flash("Lütfen sayısal bir tutar girin.", "danger")
        return redirect(url_for("dashboard"))

    if amount <= 0:
        flash("Geçerli bir tutar girin.", "danger")
        return redirect(url_for("dashboard"))

    db = get_db()
    receiver = db.execute(
        "SELECT * FROM users WHERE email = ?", (receiver_email,)
    ).fetchone()

    if receiver is None:
        flash("Alıcı bulunamadı.", "danger")
        return redirect(url_for("dashboard"))

    if receiver["id"] == user["id"]:
        flash("Kendinize para transfer edemezsiniz.", "danger")
        return redirect(url_for("dashboard"))

    if user["balance"] < amount:
        flash("Yetersiz bakiye.", "danger")
        return redirect(url_for("dashboard"))

    db.execute("UPDATE users SET balance = balance - ? WHERE id = ?", (amount, user["id"]))
    db.execute(
        "UPDATE users SET balance = balance + ? WHERE id = ?",
        (amount, receiver["id"]),
    )
    db.execute(
        "INSERT INTO transactions (sender_id, receiver_id, amount, type, note) VALUES (?, ?, ?, ?, ?)",
        (
            user["id"],
            receiver["id"],
            amount,
            "transfer",
            note or f"{receiver['full_name']} kişisine transfer",
        ),
    )
    db.commit()
    flash("Transfer tamamlandı.", "success")
    return redirect(url_for("dashboard"))


if __name__ == "__main__":
    with app.app_context():
        init_db()
    app.run(debug=True)
