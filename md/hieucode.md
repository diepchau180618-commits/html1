# 📖 GIẢI THÍCH CODE CHÍNH - JOLLIBEE CHICKEN SHOWCASE

Tài liệu này trình bày và giải thích các **khối code cốt lõi** quan trọng nhất trong dự án.

---

## 📁 1. CẤU TRÚC FILE CODE

| File | Vai trò |
| :--- | :--- |
| `index.html` | Giao diện HTML toàn bộ trang web |
| `app.js` | Logic frontend: giỏ hàng, menu, AI chat, âm thanh |
| `style.css` | CSS tùy chỉnh: animation, card món ăn, toast |
| `backend/app.py` | Server Flask: proxy API bảo mật DeepSeek AI |

---

## 🧠 2. QUẢN LÝ TRẠNG THÁI TOÀN CỤC (`app.js` dòng 14)

```js
// Một object "state" duy nhất lưu mọi trạng thái của ứng dụng
const state = {
  soundEnabled: true,        // Bật/tắt âm thanh hiệu ứng
  cart: [],                  // Mảng chứa các món ăn trong giỏ hàng
  comboBuilder: {            // Dữ liệu 3 bước chọn combo
    main: null,
    side: null,
    drink: null
  },
  currentItemInModal: null,  // Món đang mở trong popup tùy biến
  modalQty: 1                // Số lượng chọn trong modal
};
```

> **Tại sao dùng cách này?** Chỉ có 1 nguồn dữ liệu duy nhất (Single Source of Truth). Mỗi khi cần cập nhật UI (giỏ hàng, badge số lượng...) chỉ cần đọc từ `state` thay vì lấy từ nhiều biến rải rác.

---

## 🔊 3. HỆ THỐNG ÂM THANH WEB AUDIO API (`app.js` dòng 39)

```js
// Tạo "bộ não âm thanh" của trình duyệt - không cần file mp3 nào bên ngoài
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (!state.soundEnabled) return;

  // Kích hoạt lại nếu trình duyệt tạm dừng để tiết kiệm pin
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator(); // Nguồn phát sóng
  const gain = audioCtx.createGain();      // Bộ điều chỉnh âm lượng

  // Kết nối: Sóng âm -> Âm lượng -> Loa
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  switch (type) {
    case 'pop': // Bấm nút: tiếng nảy nhẹ
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now); osc.stop(now + 0.08);
      break;

    case 'add': // Thêm giỏ hàng: hợp âm Đô-Mi-Sol vui tươi
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);        // Nốt Đô (C5)
      osc.frequency.setValueAtTime(659.25, now + 0.08); // Nốt Mi (E5)
      osc.frequency.setValueAtTime(783.99, now + 0.16); // Nốt Sol (G5)
      // ...
      break;

    case 'win': // Đặt hàng thành công: fanfare 4 nốt tăng dần
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        // Mỗi nốt phát cách nhau 60ms tạo hiệu ứng arpeggio đi lên
        o.start(now + idx * 0.06);
        // ...
      });
      break;
  }
}
```

> **Tại sao dùng Web Audio API?** Không cần upload file mp3, không lo lỗi 404 thiếu file âm thanh. Toàn bộ âm thanh được tổng hợp từ tần số dao động điện tử (Oscillator) ngay trong trình duyệt.

---

## 📋 4. KHO DỮ LIỆU THỰC ĐƠN (`app.js` dòng 138)

```js
const MENU_ITEMS = [
  {
    id: 'ck-1',                    // ID duy nhất để tra cứu nhanh
    name: 'Gà Giòn Vui Vẻ (1 Miếng)',
    category: 'chicken',           // Dùng để lọc theo tab danh mục
    price: 36000,
    oldPrice: 42000,               // Hiển thị gạch ngang giá cũ
    desc: 'Mô tả ngắn bắt mắt...',
    image: 'assets/chicken_1pc.jpg',
    badge: 'Best-Seller',          // Nhãn nổi bật trên card
    spicy: 'Tùy chọn cay'         // Thông tin độ cay
  },
  // ... 21 món ăn khác
];
```

---

## 🔍 5. RENDER THỰC ĐƠN & TÌM KIẾM THỜI GIAN THỰC (`app.js` dòng 540)

```js
function renderMenu(filterCat = 'all', searchQuery = '') {
  const grid = document.getElementById('menu-grid');

  // Lọc theo tab danh mục VÀ từ khóa tìm kiếm cùng lúc
  const filtered = MENU_ITEMS.filter(item => {
    const matchCat = filterCat === 'all' || item.category === filterCat;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // Tạo HTML card món ăn từ dữ liệu - không reload trang
  grid.innerHTML = filtered.map(item => `
    <div class="food-card ...">
      <div class="food-card-img-wrap ...">
        <img src="${item.image}" ...>
        ${item.badge ? `<span class="...">⭐ ${item.badge}</span>` : ''}
      </div>
      <div class="p-4 ...">
        <h3>${item.name}</h3>
        <div class="text-brand-red">${formatVND(item.price)}</div>
        <button onclick="openItemModal('${item.id}')">Tùy chọn</button>
        <button onclick="quickAddToCart('${item.id}')">+</button>
      </div>
    </div>
  `).join('');
}

// Gắn sự kiện: mỗi lần gõ phím là tự động lọc lại
document.getElementById('menu-search-input')?.addEventListener('input', (e) => {
  const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-category');
  renderMenu(activeTab, e.target.value); // Live search
});
```

> **Điểm hay:** Hàm `renderMenu` dùng chung cho cả 2 chức năng: lọc tab danh mục và tìm kiếm từ khóa. Chỉ cần gọi 1 hàm với 2 tham số.

---

## 🛒 6. THÊM MÓN VÀO GIỎ HÀNG (`app.js` dòng 747)

```js
function addToCart(cartItem) {
  playSound('add');              // Phát âm thanh hợp âm Đô-Mi-Sol
  state.cart.push(cartItem);    // Đẩy món mới vào mảng giỏ hàng
  updateCartUI();                // Cập nhật toàn bộ giao diện giỏ hàng
  // Kích hoạt bong bóng chào mừng từ mascot
  triggerMascotReaction(`😋 Bạn vừa thêm <strong>${cartItem.name}</strong> ngon tuyệt!`);
}

function updateCartUI() {
  // Cập nhật badge số lượng trên navbar và mobile bar
  const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cart-count').innerText = totalCount;
  document.getElementById('cart-count-mobile').innerText = totalCount;

  // Tính tiền
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shipping = subtotal > 0 ? 15000 : 0;
  const total = subtotal + shipping;

  // Cập nhật hóa đơn trong ngăn kéo giỏ hàng
  document.getElementById('bill-subtotal').innerText = formatVND(subtotal);
  document.getElementById('bill-total').innerText = formatVND(total);
  document.getElementById('cart-total-nav').innerText = formatVND(total);
}
```

---

## 🛠️ 7. POPUP TÙY BIẾN MÓN ĂN (`app.js` dòng 623)

```js
function openItemModal(itemId) {
  const item = MENU_ITEMS.find(i => i.id === itemId); // Tra cứu từ mảng MENU_ITEMS
  state.currentItemInModal = item;
  state.modalQty = 1;

  // Điền thông tin món vào modal
  document.getElementById('modal-item-img').src = item.image;
  document.getElementById('modal-item-name').innerText = item.name;
  document.getElementById('modal-item-price').innerText = formatVND(item.price);

  // Hiển thị modal
  document.getElementById('item-modal-overlay').classList.remove('opacity-0', 'pointer-events-none');
}

function updateModalTotal() {
  let base = state.currentItemInModal.price;
  if (document.getElementById('add-cheese').checked) base += 10000; // Thêm phô mai
  if (document.getElementById('add-upsize').checked) base += 8000;  // Upsize nước
  const total = base * state.modalQty;
  document.getElementById('modal-calculated-total').innerText = formatVND(total);
}

function confirmAddItemFromModal() {
  const spiceText = document.querySelector('input[name="spice"]:checked').value === 'spicy'
    ? '🌶️ Cay Giòn' : '🍗 Nguyên Vị';
  
  let unitPrice = item.price;
  let extras = [spiceText];
  if (cheese) { unitPrice += 10000; extras.push('🧀 Sốt Phô Mai'); }
  if (upsize) { unitPrice += 8000;  extras.push('🥤 Upsize Lớn'); }

  addToCart({ id, name, image, price: unitPrice, qty, options: extras.join(' • ') });
}
```

---

## 🎨 8. TRÌNH TỰ PHỐI COMBO 15% (`app.js` dòng 942)

```js
// Dữ liệu 3 nhóm lựa chọn cho combo builder
const BUILDER_OPTIONS = {
  main:  [{ id: 'b-m1', name: '1 Miếng Gà Giòn', price: 36000, img: '...' }, ...],
  side:  [{ id: 'b-s1', name: 'Khoai Tây Chiên', price: 20000, img: '...' }, ...],
  drink: [{ id: 'b-d1', name: 'Bánh Pie Xoài Đào', price: 22000, img: '...' }, ...]
};

function selectComboOption(type, optionId) {
  playSound('pop');
  state.comboBuilder[type] = BUILDER_OPTIONS[type].find(o => o.id === optionId);
  renderComboBuilder();   // Re-render để cập nhật trạng thái "đã chọn"
}

function updateComboSummary() {
  const { main, side, drink } = state.comboBuilder;
  const isComplete = main && side && drink;  // Phải chọn đủ 3 bước

  if (isComplete) {
    const rawTotal = main.price + side.price + drink.price;
    const discounted = Math.round(rawTotal * 0.85); // Giảm 15%
    
    document.getElementById('summary-final-price').innerText = formatVND(discounted);
    document.getElementById('btn-add-custom-combo').disabled = false; // Mở khóa nút thêm
  } else {
    document.getElementById('btn-add-custom-combo').disabled = true; // Khóa nút nếu chưa đủ
  }
}
```

---

## 🤖 9. CHATBOT BEEBOT AI (`app.js` dòng 1149)

```js
// Điểm kết nối thông minh: nếu đang chạy qua Flask port 5000, dùng proxy nội bộ
const BEEBOT_BACKEND_ENDPOINT = window.location.port === '5000'
  ? '/api/chat'                         // Qua Flask backend (bảo mật)
  : 'http://localhost:5000/api/chat';   // Fallback gọi trực tiếp

// Lịch sử hội thoại nhiều lượt để AI nhớ ngữ cảnh
let chatConversationHistory = [
  { role: 'system', content: DEEPSEEK_CONFIG.systemPrompt }
];

async function handleChatSubmit(e) {
  const query = document.getElementById('chat-user-input').value.trim();
  
  addChatMessage(query, 'user');          // Hiển thị tin nhắn người dùng
  chatConversationHistory.push({ role: 'user', content: query });
  showChatTyping(true);                   // Hiện "đang gõ..."

  try {
    const response = await fetch(DEEPSEEK_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: chatConversationHistory,  // Truyền toàn bộ lịch sử
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const data = await response.json();
    const reply = data.reply || data.choices?.[0]?.message?.content;
    addChatMessage(formatAiResponse(reply), 'bot');

  } catch (error) {
    // Tự động fallback sang phản hồi nội bộ nếu mất mạng
    const fallback = generateLocalFallbackReply(query);
    addChatMessage(fallback, 'bot');
  }
}
```

---

## 🐍 10. BACKEND FLASK - PROXY API BẢO MẬT (`backend/app.py`)

```python
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
from dotenv import load_dotenv

# Đọc API Key từ file .env (không bị lộ trên GitHub hay trình duyệt)
load_dotenv(ROOT_DIR / ".env")

app = Flask(__name__, static_folder=str(ROOT_DIR))
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route("/api/chat", methods=["POST"])
def chat_proxy():
    # Lấy API key từ môi trường SERVER (không bao giờ gửi về client)
    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    
    data = request.get_json()
    messages = data.get("messages", [])
    
    # Đảm bảo luôn có system prompt
    if messages[0].get("role") != "system":
        messages.insert(0, {"role": "system", "content": BEEBOT_SYSTEM_PROMPT})

    # Gọi DeepSeek API từ phía server - client không biết API key
    response = requests.post(
        "https://api.deepseek.com/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"model": "deepseek-chat", "messages": messages, "max_tokens": 300},
        timeout=30
    )

    reply = response.json()["choices"][0]["message"]["content"]
    return jsonify({"reply": reply})  # Chỉ trả nội dung phản hồi, KHÔNG trả key

@app.route("/")
def index():
    return send_from_directory(ROOT_DIR, "index.html")  # Phục vụ trang chủ
```

> **Tại sao cần Backend?** Nếu gọi DeepSeek API trực tiếp từ JavaScript, API Key sẽ lộ trong mã nguồn frontend và bất kỳ ai cũng có thể xem qua DevTools. Backend Flask đóng vai trò "người trung gian", giữ key an toàn trên server.

---

## ⏰ 11. ĐỒNG HỒ ĐẾM NGƯỢC FLASH SALE (`app.js` dòng 1308)

```js
function startFlashSaleTimer() {
  let totalSeconds = 2 * 3600 + 45 * 60 + 18; // Bắt đầu từ 02:45:18

  setInterval(() => {
    if (totalSeconds > 0) totalSeconds--;

    const hours   = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Hiển thị dạng 2 chữ số: 02:45:18
    document.getElementById('flash-hours').innerText   = String(hours).padStart(2, '0');
    document.getElementById('flash-minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('flash-seconds').innerText = String(seconds).padStart(2, '0');
  }, 1000); // Chạy mỗi 1 giây
}
```

---

## 🚀 12. KHỞI TẠO ỨNG DỤNG (`app.js` dòng 1335)

```js
// Chạy sau khi toàn bộ HTML đã tải xong
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();           // Hiển thị lưới 22+ món ăn
  renderComboBuilder();   // Tạo 3-step combo builder
  startFlashSaleTimer();  // Bắt đầu đếm ngược
  setupNavLinksAndScrollSpy(); // Gắn Scroll Spy vào navbar

  // Hiện bong bóng chào của Mascot sau 3 giây
  setTimeout(() => {
    document.getElementById('companion-bubble').style.display = 'block';
  }, 3000);
});
```

---

## 📊 13. SƠ ĐỒ LUỒNG DỮ LIỆU CHÍNH

```
Người dùng bấm nút
        │
        ▼
   playSound()          ← Phát âm thanh Web Audio API
        │
        ▼
  Cập nhật state        ← state.cart.push() / state.comboBuilder
        │
        ▼
   updateCartUI()        ← Re-render HTML giỏ hàng, badge, tiền tệ
        │
        ▼
  triggerMascotReaction() ← Linh vật hiện bong bóng phản hồi
```

```
Người dùng hỏi chatbot
        │
        ▼
   handleChatSubmit()
        │
        ▼
   fetch('/api/chat')    ← Gửi lịch sử hội thoại đến Backend Flask
        │
        ▼ (server-side)
   backend/app.py
        │
        ▼
   DeepSeek API          ← Gọi AI với API Key bảo mật
        │
        ▼
   Trả reply về client   ← addChatMessage(reply, 'bot')
```

---

> 📌 **Lưu ý:** Mọi thay đổi giao diện (màu sắc, animation, responsive) nằm trong [`style.css`](style.css). Mọi logic và dữ liệu nằm trong [`app.js`](app.js). Bảo mật API nằm trong [`backend/app.py`](backend/app.py).
