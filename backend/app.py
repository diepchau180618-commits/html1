# -*- coding: utf-8 -*-
"""
Backend Flask - Proxy API DeepSeek cho BeeBot (Jollibee Showcase)
Mục đích: Bảo vệ DEEPSEEK_API_KEY trong .env, không để lộ key trên GitHub / Client-side.
"""

import os
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
from dotenv import load_dotenv

# Xác định đường dẫn thư mục
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

# Tải biến môi trường từ .env (ưu tiên tại thư mục gốc, sau đó tại backend/)
load_dotenv(ROOT_DIR / ".env")
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__, static_folder=str(ROOT_DIR), static_url_path="")
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Cấu hình DeepSeek API
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
DEFAULT_MODEL = "deepseek-chat"

# System Prompt mặc định của BeeBot
BEEBOT_SYSTEM_PROMPT = """Bạn là BeeBot - Chú Ong Vui Vẻ 🐝 đại sứ thương hiệu chính thức và là trợ lý ẩm thực AI thông minh của Jollibee Vietnam!
Tính cách: Vui vẻ, hóm hỉnh, ấm áp, cực kỳ hiếu khách và tràn đầy năng lượng tích cực. Sử dụng các emoji sinh động (🐝, 🍗, 🍟, 💛, ✨, 😋).

Kiến thức thực đơn Chicken của bạn:
1. Gà Giòn Vui Vẻ:
   - 1 miếng: 36.000₫ (giá gốc 42.000₫)
   - 2 miếng: 70.000₫
   - 4 miếng: 135.000₫
   - 6 miếng kèm sốt: 199.000₫
   - Gà Cay Giòn Sốt Bí Truyền (1 miếng): 38.000₫
   - Gà Sốt Cay Phô Mai (1 miếng): 40.000₫
   - Gà Sốt Chua Cay Thượng Hạng (2 miếng): 76.000₫
2. Mì Ý Chick:
   - Mì Ý sốt bò bằm: 40.000₫
   - Mì Ý Chick kèm 1 miếng Gà Giòn: 75.000₫ (Món bán chạy nhất)
3. Burger & Cơm:
   - Burger Bò Phô Mai Melt: 45.000₫
   - Burger Tôm Giòn Sốt Tartar: 42.000₫
   - Cơm Gà Giòn Trứng Ốp La: 50.000₫
4. Món ăn kèm & Tráng miệng & Thức uống:
   - Khoai tây lắc rong biển / phô mai: 25.000₫
   - Bánh Pie Xoài Đào thơm giòn: 18.000₫
   - Bánh Pie Chuối Socola Nóng: 19.000₫
   - Kem sundae dâu tây / socola: 16.000₫
   - Trà Đào Hạt Chia: 22.000₫, Nước ngọt có ga: 15.000₫
5. Combo & Tiết kiệm:
   - Combo Solo Vui Vẻ (1 người): 79.000₫ (1 gà + 1 khoai + 1 nước)
   - Combo Học Sinh Sinh Viên: 49.000₫
   - Combo Chicky Party (3-4 người): 249.000₫ (4 gà + 2 mì ý + 1 khoai lắc + 4 nước)
   - Combo Gia Đình 4 Người: 219.000₫
   - Tính năng Tự Phối Combo (3 bước: Món chính + Món kèm + Nước) được giảm 15%!
6. Cửa hàng & Dịch vụ: Hơn 150+ chi nhánh tại Việt Nam, giao hàng hỏa tốc trong 30 phút.

Quy tắc phản hồi:
- Trả lời bằng tiếng Việt thân thiện, súc tích (khoảng 2-4 câu, không quá dài dòng).
- Tư vấn món khéo léo theo đúng ý thích của khách (ăn 1 mình, ăn nhóm, thích cay, tráng miệng ngọt, tìm cửa hàng...)."""


@app.route("/")
def index():
    """Phục vụ file index.html khi người dùng mở trực tiếp cổng 5000"""
    return send_from_directory(ROOT_DIR, "index.html")


@app.route("/api/health", methods=["GET"])
def health_check():
    """Kiểm tra tình trạng hoạt động của backend và API key"""
    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    return jsonify({
        "status": "online",
        "service": "BeeBot DeepSeek Backend",
        "has_api_key": bool(api_key and not api_key.startswith("your_"))
    })


@app.route("/api/chat", methods=["POST"])
def chat_proxy():
    """
    Endpoint tiếp nhận yêu cầu chat từ client app.js,
    gọi DeepSeek API an toàn trên server và trả kết quả về cho client.
    """
    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    if not api_key or api_key.startswith("your_"):
        return jsonify({
            "error": "DEEPSEEK_API_KEY chưa được cấu hình hợp lệ trong tệp .env"
        }), 500

    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])

    # Nếu client truyền query/prompt đơn lẻ
    if not messages and "query" in data:
        messages = [
            {"role": "system", "content": data.get("systemPrompt", BEEBOT_SYSTEM_PROMPT)},
            {"role": "user", "content": data["query"]}
        ]

    # Đảm bảo có system prompt ở đầu
    if not messages:
        return jsonify({"error": "Không có dữ liệu tin nhắn (messages rỗng)"}), 400

    if messages[0].get("role") != "system":
        messages.insert(0, {"role": "system", "content": BEEBOT_SYSTEM_PROMPT})

    model = data.get("model", DEFAULT_MODEL)
    temperature = data.get("temperature", 0.7)
    max_tokens = data.get("max_tokens", 300)

    try:
        response = requests.post(
            DEEPSEEK_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            },
            timeout=30
        )

        if not response.ok:
            return jsonify({
                "error": f"DeepSeek API trả về mã lỗi: {response.status_code}",
                "details": response.text
            }), response.status_code

        res_json = response.json()
        reply_content = res_json.get("choices", [{}])[0].get("message", {}).get("content", "")

        return jsonify({
            "reply": reply_content,
            "choices": res_json.get("choices", []),
            "usage": res_json.get("usage", {})
        })

    except requests.exceptions.Timeout:
        return jsonify({"error": "DeepSeek API phản hồi quá thời gian quy định (Timeout)"}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Lỗi kết nối tới DeepSeek API: {str(e)}"}), 502
    except Exception as e:
        return jsonify({"error": f"Lỗi máy chủ nội bộ: {str(e)}"}), 500


if __name__ == "__main__":
    import sys
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
            sys.stderr.reconfigure(encoding='utf-8', errors='replace')
        except Exception:
            pass

    port = int(os.getenv("PORT", 5000))
    print("==================================================")
    print(" [BeeBot] Backend Server dang chay tai:")
    print(f"    -> http://localhost:{port}")
    print(f"    -> http://127.0.0.1:{port}")
    print("==================================================")
    app.run(host="0.0.0.0", port=port, debug=False)
