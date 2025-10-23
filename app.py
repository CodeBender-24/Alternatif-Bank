from __future__ import annotations

import copy
import io
import json
import random
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional, Set, Tuple

from flask import (
    Flask,
    Response,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
)

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "demo_data.json"

app = Flask(__name__)
app.config["SECRET_KEY"] = "alternatif-bank-experience"

TRANSLATIONS = {
    "tr": {
        "welcome": "Hoş geldiniz",
        "kyc_pending": "Profil doğrulaması bekleniyor",
        "kyc_approved": "Profil doğrulaması tamamlandı",
        "enable_biometric": "Biyometrik kilidi etkinleştir",
        "disable_biometric": "Biyometrik kilidi kapat",
        "accounts": "Hesaplar",
        "recent_activity": "Son İşlemler",
        "export_statement": "Ekstreyi dışa aktar",
        "money_movement": "Para transferi",
        "payments": "Ödemeler",
        "cards": "Kart Yönetimi",
        "notifications": "Bildirimler",
        "support": "Destek",
        "settings": "Ayarlar",
        "fast_label": "FAST (anlık)",
        "qr_label": "TR Karekod yapıştır",
        "autopay": "Otomatik ödeme",
        "freeze": "Anında dondur",
        "unfreeze": "Anında aç",
    },
    "en": {
        "welcome": "Welcome",
        "kyc_pending": "Profile verification pending",
        "kyc_approved": "Profile verification complete",
        "enable_biometric": "Enable biometric lock",
        "disable_biometric": "Disable biometric lock",
        "accounts": "Accounts",
        "recent_activity": "Recent activity",
        "export_statement": "Export statement",
        "money_movement": "Money movement",
        "payments": "Payments",
        "cards": "Card management",
        "notifications": "Notifications",
        "support": "Support",
        "settings": "Settings",
        "fast_label": "FAST (instant)",
        "qr_label": "Paste TR Karekod",
        "autopay": "Autopay",
        "freeze": "Freeze instantly",
        "unfreeze": "Unfreeze",
    },
}


def load_data() -> Dict[str, Any]:
    if DATA_PATH.exists():
        return json.loads(DATA_PATH.read_text(encoding="utf-8"))
    DATA_PATH.write_text(json.dumps(DEFAULT_DATA, indent=2, ensure_ascii=False), encoding="utf-8")
    return copy.deepcopy(DEFAULT_DATA)


def save_data(data: Dict[str, Any]) -> None:
    DATA_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


DEFAULT_DATA: Dict[str, Any] = {
    "next_user_id": 1,
    "users": [],
    "billers": [
        {"id": "electricity", "name": "Elektrik"},
        {"id": "water", "name": "Su"},
        {"id": "gsm", "name": "GSM"},
    ],
}


MOCK_TRANSACTIONS = [
    {
        "date": "2024-04-22",
        "description": "Elektrik Faturası",
        "amount": -352.40,
        "channel": "FAST",
        "counterparty": "CK Boğaziçi",
    },
    {
        "date": "2024-04-19",
        "description": "Market harcaması",
        "amount": -189.90,
        "channel": "Kart",
        "counterparty": "Migros",
    },
    {
        "date": "2024-04-18",
        "description": "Maaş ödemesi",
        "amount": 24500.00,
        "channel": "Havale",
        "counterparty": "Alternatif Teknoloji",
    },
]


def _escape_pdf_text(text: str) -> str:
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return (
        ascii_text.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
    )


def _build_pdf_from_lines(lines: list[str]) -> bytes:
    text_ops = ["BT", "/F1 14 Tf", "50 800 Td"]
    for index, line in enumerate(lines):
        if index > 0:
            text_ops.append("0 -18 Td")
        text_ops.append(f"({_escape_pdf_text(line)}) Tj")
    text_ops.append("ET")
    stream = "\n".join(text_ops).encode("latin1", errors="replace")

    objects: list[bytes] = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        b"<< /Length "
        + str(len(stream)).encode("latin1")
        + b" >>\nstream\n"
        + stream
        + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]

    buffer = io.BytesIO()
    buffer.write(b"%PDF-1.4\n")
    offsets = [0]
    for obj_id, content in enumerate(objects, start=1):
        offsets.append(buffer.tell())
        buffer.write(f"{obj_id} 0 obj\n".encode("latin1"))
        buffer.write(content)
        buffer.write(b"\nendobj\n")

    xref_pos = buffer.tell()
    buffer.write(f"xref\n0 {len(objects) + 1}\n".encode("latin1"))
    buffer.write(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        buffer.write(f"{offset:010} 00000 n \n".encode("latin1"))
    buffer.write(b"trailer\n")
    buffer.write(f"<< /Size {len(objects) + 1} /Root 1 0 R >>\n".encode("latin1"))
    buffer.write(b"startxref\n")
    buffer.write(f"{xref_pos}\n".encode("latin1"))
    buffer.write(b"%%EOF")
    return buffer.getvalue()


def build_statement_pdf(transactions: list[Dict[str, Any]]) -> bytes:
    lines = ["Alternatif Bank - Hesap Özeti", ""]
    for trx in transactions[:20]:
        lines.append(
            f"{trx['date']} | {trx['description']} | {trx['amount']} TRY"
        )
    return _build_pdf_from_lines(lines)


def generate_mock_iban(existing_ibans: Set[str]) -> str:
    while True:
        digits = "".join(random.choice("0123456789") for _ in range(24))
        iban = f"TR{digits}"
        if iban not in existing_ibans:
            existing_ibans.add(iban)
            return iban


def build_default_user(
    full_name: str, contact: str, contact_type: str, existing_ibans: Optional[Set[str]] = None
) -> Dict[str, Any]:
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    existing_ibans = set(existing_ibans or set())
    accounts = [
        {
            "name": "Vadesiz TRY",
            "iban": generate_mock_iban(existing_ibans),
            "balance": 12850.75,
            "transactions": copy.deepcopy(MOCK_TRANSACTIONS),
        },
        {
            "name": "Birikim TRY",
            "iban": generate_mock_iban(existing_ibans),
            "balance": 3250.00,
            "transactions": [],
        },
    ]
    transactions = copy.deepcopy(MOCK_TRANSACTIONS)
    notifications = [
        {"title": "FAST transferiniz onaylandı", "timestamp": "2 saat önce"},
        {"title": "Yeni kampanya: Dijital kart %10 iade", "timestamp": "Dün"},
    ]
    cards = [
        {
            "id": "debit",
            "name": "Alternatif Vadesiz Kart",
            "last4": "1234",
            "type": "debit",
            "spend": 1250.50,
            "limit": 10000,
            "frozen": False,
            "settings": {
                "contactless": True,
                "ecommerce": True,
                "international": False,
            },
        },
        {
            "id": "credit",
            "name": "Alternatif Platinum",
            "last4": "9876",
            "type": "credit",
            "spend": 3250.80,
            "limit": 15000,
            "frozen": False,
            "settings": {
                "contactless": True,
                "ecommerce": True,
                "international": True,
            },
        },
    ]
    payments = [
        {
            "biller": "Elektrik",
            "subscriber": "CK Boğaziçi",
            "customer_no": "21900345",
            "autopay": True,
        },
        {
            "biller": "GSM",
            "subscriber": "Alternatif GSM",
            "customer_no": "5301234567",
            "autopay": False,
        },
    ]
    support_messages = [
        {"sender": "agent", "message": "Merhaba, nasıl yardımcı olabiliriz?", "timestamp": now},
    ]
    return {
        "full_name": full_name,
        "contact": contact,
        "contact_type": contact_type,
        "biometric_enabled": False,
        "kyc_status": "pending",
        "language": "tr",
        "theme": "light",
        "notifications_enabled": True,
        "accounts": accounts,
        "transactions": transactions,
        "cards": cards,
        "payments": payments,
        "notifications": notifications,
        "support_messages": support_messages,
    }


def get_current_user() -> Optional[Dict[str, Any]]:
    user_id = session.get("user_id")
    if not user_id:
        return None
    data = load_data()
    for user in data["users"]:
        if user["id"] == user_id:
            return user
    return None


@app.context_processor
def inject_texts() -> Dict[str, Any]:
    user = get_current_user()
    language = user.get("language") if user else "tr"
    return {"texts": TRANSLATIONS.get(language, TRANSLATIONS["tr"])}


def login_required(view):
    from functools import wraps

    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("user_id"):
            flash("Devam etmek için giriş yapın.", "warning")
            return redirect(url_for("login"))
        return view(*args, **kwargs)

    return wrapped


@app.route("/")
def index():
    if session.get("user_id"):
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        full_name = request.form.get("full_name", "").strip()
        contact = request.form.get("contact", "").strip()
        contact_type = request.form.get("contact_type", "email")
        if not full_name or not contact:
            flash("Ad soyad ve iletişim bilgisi zorunludur.", "danger")
        else:
            data = load_data()
            exists = next((u for u in data["users"] if u["contact"].lower() == contact.lower()), None)
            if exists:
                flash("Bu iletişim bilgisiyle bir hesap zaten mevcut, lütfen giriş yapın.", "warning")
                return redirect(url_for("login"))
            session["otp_context"] = {
                "mode": "register",
                "full_name": full_name,
                "contact": contact,
                "contact_type": contact_type,
            }
            flash("Doğrulama kodu gönderildi. Demo OTP: 123456", "info")
            return redirect(url_for("verify_otp"))
    return render_template("register.html", user=None)


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        contact = request.form.get("contact", "").strip()
        if not contact:
            flash("Lütfen e-posta ya da telefon girin.", "danger")
        else:
            data = load_data()
            user = next((u for u in data["users"] if u["contact"].lower() == contact.lower()), None)
            if not user:
                flash("Kayıtlı kullanıcı bulunamadı. Hemen kayıt olun.", "warning")
                return redirect(url_for("register"))
            session["otp_context"] = {"mode": "login", "user_id": user["id"]}
            flash("Doğrulama kodu gönderildi. Demo OTP: 123456", "info")
            return redirect(url_for("verify_otp"))
    return render_template("login.html", user=None)


@app.route("/verify", methods=["GET", "POST"])
def verify_otp():
    context = session.get("otp_context")
    if not context:
        flash("OTP süresi doldu, lütfen tekrar deneyin.", "warning")
        return redirect(url_for("login"))
    if request.method == "POST":
        otp = request.form.get("otp", "").strip()
        if otp != "123456":
            flash("Geçersiz OTP, lütfen yeniden deneyin.", "danger")
        else:
            data = load_data()
            if context.get("mode") == "register":
                existing_ibans = {
                    account["iban"]
                    for user_item in data["users"]
                    for account in user_item.get("accounts", [])
                    if account.get("iban")
                }
                new_user = build_default_user(
                    context["full_name"],
                    context["contact"],
                    context["contact_type"],
                    existing_ibans,
                )
                new_user["id"] = data["next_user_id"]
                data["next_user_id"] += 1
                data["users"].append(new_user)
                save_data(data)
                session["user_id"] = new_user["id"]
                flash("Kayıt tamamlandı, hoş geldiniz!", "success")
            else:
                session["user_id"] = context["user_id"]
                flash("Giriş başarılı.", "success")
            session.pop("otp_context", None)
            return redirect(url_for("dashboard"))
    return render_template("verify.html", user=None)


@app.route("/logout")
def logout():
    session.clear()
    flash("Çıkış yapıldı.", "info")
    return redirect(url_for("login"))


def persist_user(updated_user: Dict[str, Any]) -> None:
    data = load_data()
    for idx, user in enumerate(data["users"]):
        if user["id"] == updated_user["id"]:
            data["users"][idx] = updated_user
            save_data(data)
            return


def find_user_and_account_by_iban(
    iban: str, exclude_user_id: Optional[int] = None
) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    if not iban:
        return None, None
    data = load_data()
    for user in data["users"]:
        if exclude_user_id and user["id"] == exclude_user_id:
            continue
        for account in user.get("accounts", []):
            if account.get("iban") == iban:
                return user, account
    return None, None


@app.route("/dashboard")
@login_required
def dashboard():
    user = get_current_user()
    billers = load_data()["billers"]
    return render_template("dashboard.html", user=user, billers=billers)


@app.route("/biometric", methods=["POST"])
@login_required
def toggle_biometric():
    user = get_current_user()
    user["biometric_enabled"] = not user.get("biometric_enabled", False)
    persist_user(user)
    state = "etkin" if user["biometric_enabled"] else "kapalı"
    flash(f"Biyometrik kilit {state}.", "success")
    return redirect(url_for("dashboard"))


@app.route("/kyc", methods=["POST"])
@login_required
def complete_kyc():
    user = get_current_user()
    user["kyc_status"] = "approved"
    persist_user(user)
    flash("Profil doğrulaması onaylandı.", "success")
    return redirect(url_for("dashboard"))


@app.route("/transfer", methods=["POST"])
@login_required
def transfer():
    user = get_current_user()
    iban = request.form.get("iban", "").strip().upper()
    amount_raw = request.form.get("amount", "0").replace(",", ".")
    description = request.form.get("description", "").strip() or "IBAN transferi"
    fast = bool(request.form.get("fast"))
    if not iban.startswith("TR") or len(iban) < 12:
        flash("Geçerli bir TR IBAN girin.", "danger")
        return redirect(url_for("dashboard"))
    try:
        amount = round(float(amount_raw), 2)
    except ValueError:
        flash("Tutar hatalı.", "danger")
        return redirect(url_for("dashboard"))
    if amount <= 0:
        flash("Pozitif bir tutar girin.", "danger")
        return redirect(url_for("dashboard"))

    account = user["accounts"][0]

    recipient_user: Optional[Dict[str, Any]] = None
    recipient_account: Optional[Dict[str, Any]] = None
    for acc in user.get("accounts", []):
        if acc.get("iban") == iban:
            recipient_user = user
            recipient_account = acc
            break

    if recipient_account is None:
        recipient_user, recipient_account = find_user_and_account_by_iban(iban, exclude_user_id=user["id"])

    if recipient_account and recipient_account.get("iban") == account.get("iban"):
        flash("Aynı hesaba transfer yapılamaz.", "warning")
        return redirect(url_for("dashboard"))

    if account["balance"] < amount:
        flash("Yetersiz bakiye.", "danger")
        return redirect(url_for("dashboard"))

    account["balance"] = round(account["balance"] - amount, 2)
    trx = {
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "description": description,
        "amount": -amount,
        "channel": "FAST" if fast else "Havale",
        "counterparty": iban,
    }
    user["transactions"].insert(0, trx)
    account["transactions"].insert(0, trx)
    user["notifications"].insert(0, {"title": f"{amount:.2f} TRY transfer tamamlandı", "timestamp": "Şimdi"})
    if recipient_account:
        incoming_trx = {
            "date": trx["date"],
            "description": f"{user['full_name']} transferi",
            "amount": amount,
            "channel": trx["channel"],
            "counterparty": account["iban"],
        }
        if recipient_user and recipient_user["id"] == user["id"]:
            recipient_account["balance"] = round(recipient_account.get("balance", 0) + amount, 2)
            user["transactions"].insert(0, incoming_trx)
            recipient_account.setdefault("transactions", []).insert(0, incoming_trx)
            user["notifications"].insert(0, {"title": "Hesaplar arası transfer tamamlandı", "timestamp": "Şimdi"})
        elif recipient_user:
            recipient_account["balance"] = round(recipient_account.get("balance", 0) + amount, 2)
            recipient_user.setdefault("transactions", []).insert(0, incoming_trx)
            recipient_account.setdefault("transactions", []).insert(0, incoming_trx)
            recipient_user.setdefault("notifications", []).insert(
                0,
                {
                    "title": f"{amount:.2f} TRY transfer alındı",
                    "timestamp": "Şimdi",
                },
            )
            persist_user(recipient_user)
    persist_user(user)
    flash("Transfer talimatı kaydedildi.", "success")
    return redirect(url_for("dashboard"))


@app.route("/qr-prefill", methods=["POST"])
@login_required
def qr_prefill():
    qr_data = request.json.get("qr", "") if request.is_json else request.form.get("qr", "")
    result = {"payee": "", "amount": "", "iban": ""}
    if qr_data:
        parts = {segment.split("=", 1)[0]: segment.split("=", 1)[1] for segment in qr_data.split("|") if "=" in segment}
        result["payee"] = parts.get("PAYEE", "")
        result["amount"] = parts.get("AMT", "")
        result["iban"] = parts.get("IBAN", parts.get("ACC", ""))
    return result


@app.route("/pay", methods=["POST"])
@login_required
def pay_biller():
    user = get_current_user()
    biller = request.form.get("biller")
    customer_no = request.form.get("customer_no", "").strip()
    amount_raw = request.form.get("bill_amount", "0").replace(",", ".")
    autopay = bool(request.form.get("autopay"))
    try:
        amount = round(float(amount_raw), 2)
    except ValueError:
        flash("Tutar hatalı.", "danger")
        return redirect(url_for("dashboard"))
    account = user["accounts"][0]
    if account["balance"] < amount:
        flash("Yetersiz bakiye.", "danger")
        return redirect(url_for("dashboard"))
    account["balance"] = round(account["balance"] - amount, 2)
    trx = {
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "description": f"{biller} ödemesi",
        "amount": -amount,
        "channel": "Ödeme",
        "counterparty": customer_no or biller,
    }
    user["transactions"].insert(0, trx)
    account["transactions"].insert(0, trx)
    existing = next((p for p in user["payments"] if p["biller"] == biller and p["customer_no"] == customer_no), None)
    if existing:
        existing["autopay"] = autopay
    else:
        user["payments"].append(
            {"biller": biller, "subscriber": biller, "customer_no": customer_no, "autopay": autopay}
        )
    user["notifications"].insert(0, {"title": f"{biller} ödemesi yapıldı", "timestamp": "Şimdi"})
    persist_user(user)
    flash("Ödeme işlendi.", "success")
    return redirect(url_for("dashboard"))


@app.route("/card/<card_id>/freeze", methods=["POST"])
@login_required
def toggle_card(card_id: str):
    user = get_current_user()
    card = next((c for c in user["cards"] if c["id"] == card_id), None)
    if not card:
        flash("Kart bulunamadı.", "danger")
        return redirect(url_for("dashboard"))
    card["frozen"] = not card["frozen"]
    persist_user(user)
    flash("Kart durumu güncellendi.", "success")
    return redirect(url_for("dashboard"))


@app.route("/card/<card_id>/settings", methods=["POST"])
@login_required
def card_settings(card_id: str):
    user = get_current_user()
    card = next((c for c in user["cards"] if c["id"] == card_id), None)
    if not card:
        flash("Kart bulunamadı.", "danger")
        return redirect(url_for("dashboard"))
    card["settings"]["contactless"] = bool(request.form.get("contactless"))
    card["settings"]["ecommerce"] = bool(request.form.get("ecommerce"))
    card["settings"]["international"] = bool(request.form.get("international"))
    persist_user(user)
    flash("Kart ayarları kaydedildi.", "success")
    return redirect(url_for("dashboard"))


@app.route("/support", methods=["POST"])
@login_required
def support():
    user = get_current_user()
    message = request.form.get("message", "").strip()
    if not message:
        flash("Mesaj boş olamaz.", "danger")
        return redirect(url_for("dashboard"))
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    user["support_messages"].append({"sender": "user", "message": message, "timestamp": timestamp})
    user["support_messages"].append(
        {
            "sender": "agent",
            "message": "Talebinizi aldık, en kısa sürede dönüş yapacağız.",
            "timestamp": timestamp,
        }
    )
    persist_user(user)
    flash("Destek talebiniz iletildi.", "success")
    return redirect(url_for("dashboard"))


@app.route("/settings", methods=["POST"])
@login_required
def settings():
    user = get_current_user()
    user["language"] = request.form.get("language", user.get("language", "tr"))
    user["theme"] = request.form.get("theme", user.get("theme", "light"))
    user["notifications_enabled"] = bool(request.form.get("notifications_enabled"))
    persist_user(user)
    flash("Ayarlar güncellendi.", "success")
    return redirect(url_for("dashboard"))


@app.route("/reset", methods=["POST"])
@login_required
def reset_demo():
    user = get_current_user()
    data = load_data()
    existing_ibans = {
        account["iban"]
        for usr in data["users"]
        if usr["id"] != user["id"]
        for account in usr.get("accounts", [])
        if account.get("iban")
    }
    rebuilt = build_default_user(
        user["full_name"], user["contact"], user["contact_type"], existing_ibans
    )
    rebuilt["id"] = user["id"]
    for idx, existing in enumerate(data["users"]):
        if existing["id"] == user["id"]:
            data["users"][idx] = rebuilt
            save_data(data)
            flash("Demo verileri sıfırlandı.", "success")
            break
    return redirect(url_for("dashboard"))


@app.route("/export/<fmt>")
@login_required
def export(fmt: str):
    user = get_current_user()
    if fmt == "csv":
        buffer = io.StringIO()
        buffer.write("date,description,amount,channel,counterparty\n")
        for trx in user["transactions"][:20]:
            buffer.write(
                f"{trx['date']},{trx['description']},{trx['amount']},{trx['channel']},{trx['counterparty']}\n"
            )
        csv_data = buffer.getvalue()
        return Response(
            csv_data,
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=statement.csv"},
        )
    if fmt == "pdf":
        pdf_bytes = build_statement_pdf(user["transactions"])
        return Response(
            pdf_bytes,
            mimetype="application/pdf",
            headers={"Content-Disposition": "attachment; filename=statement.pdf"},
        )
    flash("Desteklenmeyen format.", "danger")
    return redirect(url_for("dashboard"))


if __name__ == "__main__":
    app.run(debug=True)
