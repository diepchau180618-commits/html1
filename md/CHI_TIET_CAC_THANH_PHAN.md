# 📚 CHI TIẾT CÁC THÀNH PHẦN TRONG WEBSITE JOLLIBEE / CHICKEN SHOWCASE

Tài liệu này phân tích và trình bày **toàn bộ mã nguồn chi tiết của từng thành phần (component)** trong dự án website. Mỗi thành phần được bóc tách gồm: **Mục đích**, **Giao diện HTML**, **Định kiểu CSS**, **Logic JavaScript / Backend** và **Cách thức hoạt động**.

---

## 📑 MỤC LỤC CÁC THÀNH PHẦN

1. [Thanh Thông Báo & Đồng Hồ Đếm Ngược Flash Sale](#1-thanh-thông-báo--đồng-hồ-đếm-ngược-flash-sale)
2. [Thanh Điều Hướng PC (Desktop Navbar Header)](#2-thanh-điều-hướng-pc-desktop-navbar-header)
3. [Thanh Điều Hướng Di Động Dưới Đáy (Mobile Bottom Nav)](#3-thanh-điều-hướng-di-động-dưới-đáy-mobile-bottom-nav)
4. [Khu Vực Giới Thiệu Đầu Trang (Hero Section)](#4-khu-vực-giới-thiệu-đầu-trang-hero-section)
5. [Banner Siêu Khuyến Mãi (Mega Promo Banner)](#5-banner-siêu-khuyến-mãi-mega-promo-banner)
6. [Thực Đơn Tương Tác, Phân Loại & Tìm Kiếm Trực Tiếp (Menu Section)](#6-thực-đơn-tương-tác-phân-loại--tìm-kiếm-trực-tiếp-menu-section)
7. [Popup Tùy Biến Món Ăn (Item Customizer Modal)](#7-popup-tùy-biến-món-ăn-item-customizer-modal)
8. [Trình Tự Phối Combo Cá Nhân Giảm 15% (Combo Builder)](#8-trình-tự-phối-combo-cá-nhân-giảm-15-combo-builder)
9. [Bí Quyết Vị Ngon & Giá Trị Thương Hiệu (Brand Story & Pillars)](#9-bí-quyết-vị-ngon--giá-trị-thương-hiệu-brand-story--pillars)
10. [Linh Vật Đồng Hành & Trợ Lý Ảo AI BeeBot (Mascot & Chatbot)](#10-linh-vật-đồng-hành--trợ-lý-ảo-ai-beebot-mascot--chatbot)
11. [Ngăn Kéo Giỏ Hàng Trượt Ngang (Slide-Over Cart Drawer)](#11-ngăn-kéo-giỏ-hàng-trượt-ngang-slide-over-cart-drawer)
12. [Cửa Sổ Tra Cứu Chi Nhánh Cửa Hàng (Store Locator Modal)](#12-cửa-sổ-tra-cứu-chi-nhánh-cửa-hàng-store-locator-modal)
13. [Cửa Sổ Đặt Hàng Thành Công & Pháo Hoa Ăn Mừng (Checkout Modal)](#13-cửa-sổ-đặt-hàng-thành-công--pháo-hoa-ăn-mừng-checkout-modal)
14. [Hệ Thống Âm Thanh Hiệu Ứng Thuần (Web Audio API Synthesizer)](#14-hệ-thống-âm-thanh-hiệu-ứng-thuần-web-audio-api-synthesizer)
15. [Hệ Thống Thông Báo Nổi (Toast Notification System)](#15-hệ-thống-thông-báo-nổi-toast-notification-system)
16. [Máy Chủ Backend Flask & Proxy API DeepSeek Bảo Mật (`backend/app.py`)](#16-máy-chủ-backend-flask--proxy-api-deepseek-bảo-mật-backendapppy)

---

## 1. THANH THÔNG BÁO & ĐỒNG HỒ ĐẾM NGƯỢC FLASH SALE

### 🎯 Mục đích:
Tạo sự chú ý ngay đầu trang với ưu đãi hot và đồng hồ đếm ngược thúc đẩy hành động (FOMO - Fear Of Missing Out).

### 🖥️ Mã nguồn HTML (`index.html` dòng 62-82):
```html
<aside aria-label="Khuyến mãi hot"
  class="bg-gradient-to-r from-brand-redDark via-brand-red to-brand-redDark text-white py-2 px-4 border-b border-white/10 text-xs sm:text-sm font-medium z-50 sticky top-0 md:relative">
  <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
    <div class="flex items-center gap-2">
      <span
        class="bg-brand-gold text-black font-extrabold px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
        <i class="fa-solid fa-bolt"></i> Flash Sale
      </span>
      <span class="truncate">
        Đại tiệc gà giòn Chicken - Giảm ngay 15% khi tự phối combo hôm nay!
      </span>
    </div>
    <div class="hidden sm:flex items-center gap-1.5 text-xs text-white/90">
      <span>Kết thúc sau:</span>
      <span class="bg-black/50 text-brand-gold font-mono font-bold px-1.5 py-0.5 rounded" id="flash-hours">02</span>:
      <span class="bg-black/50 text-brand-gold font-mono font-bold px-1.5 py-0.5 rounded" id="flash-minutes">45</span>:
      <span class="bg-black/50 text-brand-gold font-mono font-bold px-1.5 py-0.5 rounded" id="flash-seconds">18</span>
    </div>
  </div>
</aside>
```

### ⚙️ Mã nguồn JavaScript (`app.js` dòng 1308-1326):
```javascript
function startFlashSaleTimer() {
  let totalSeconds = 2 * 3600 + 45 * 60 + 18; // Khởi tạo: 02 giờ 45 phút 18 giây
  const hEl = document.getElementById('flash-hours');
  const mEl = document.getElementById('flash-minutes');
  const sEl = document.getElementById('flash-seconds');

  setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Định dạng 2 chữ số (vd: 09, 08...)
      if (hEl) hEl.innerText = String(hours).padStart(2, '0');
      if (mEl) mEl.innerText = String(minutes).padStart(2, '0');
      if (sEl) sEl.innerText = String(seconds).padStart(2, '0');
    }
  }, 1000);
}
```

---

## 2. THANH ĐIỀU HƯỚNG PC (DESKTOP NAVBAR HEADER)

### 🎯 Mục đích:
Thanh điều hướng cố định trên cùng màn hình máy tính với hiệu ứng kính mờ (Glassmorphism), theo dõi vị trí cuộn trang (Scroll Spy), nút bật tắt âm thanh, nút tra cứu cửa hàng và nút mở giỏ hàng kèm số lượng.

### 🖥️ Mã nguồn HTML (`index.html` dòng 85-161):
```html
<header class="header sticky top-0 z-40 bg-[#0E0C12]/90 backdrop-blur-xl border-b border-white/10 transition-all duration-300" id="navbar">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">

    <!-- Brand Logo -->
    <a href="#hero" class="flex items-center gap-3 group" id="main-logo">
      <div class="w-11 h-11 rounded-full overflow-hidden border-2 border-brand-gold shadow-[0_0_15px_rgba(255,192,0,0.4)] bg-white flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6">
        <img src="assets/mascot.jpg" alt="Chicken Mascot Logo" class="w-full h-full object-cover">
      </div>
      <div class="flex flex-col">
        <span class="font-heading font-black text-2xl text-brand-redLight tracking-tight leading-none group-hover:text-white transition">Chicken</span>
        <span class="text-[11px] text-brand-gold font-bold uppercase tracking-widest leading-none mt-1">Lan Tỏa Niềm Vui</span>
      </div>
    </a>

    <!-- Menu Links -->
    <nav class="hidden lg:flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-full border border-white/10" id="nav-menu">
      <a href="#hero" class="nav-link active px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition" data-section="hero">
        <i class="fa-solid fa-house"></i> Trang Chủ
      </a>
      <a href="#menu-section" class="nav-link px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition text-[#C9C7D4] hover:text-white" data-section="menu-section">
        <i class="fa-solid fa-drumstick-bite"></i> Thực Đơn
      </a>
      <a href="#combo-builder" class="nav-link px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition text-[#C9C7D4] hover:text-white" data-section="combo-builder">
        <i class="fa-solid fa-wand-magic-sparkles"></i> Tự Phối Combo
      </a>
      <a href="#story-section" class="nav-link px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition text-[#C9C7D4] hover:text-white" data-section="story-section">
        <i class="fa-solid fa-heart"></i> Bí Quyết
      </a>
    </nav>

    <!-- Nút Hành Động -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Nút âm thanh -->
      <button type="button" class="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-white flex items-center justify-center transition" id="sound-toggle" title="Bật/Tắt âm thanh hiệu ứng">
        <i class="fa-solid fa-volume-high text-sm" id="sound-icon"></i>
      </button>

      <!-- Nút cửa hàng -->
      <button type="button" class="hidden md:flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-white px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition" id="store-locator-btn">
        <i class="fa-solid fa-location-dot text-brand-red"></i>
        <span>Cửa Hàng</span>
      </button>

      <!-- Nút Giỏ Hàng -->
      <button type="button" class="flex items-center gap-2.5 bg-gradient-to-r from-brand-red to-brand-redDark text-white px-3.5 py-2 rounded-full hover:brightness-110 shadow-[0_4px_15px_rgba(227,24,55,0.4)] transition" id="cart-toggle-btn">
        <div class="relative flex items-center justify-center">
          <i class="fa-solid fa-bag-shopping text-base"></i>
          <span class="absolute -top-2 -right-2 bg-brand-gold text-black font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow" id="cart-count">0</span>
        </div>
        <span class="hidden xl:inline font-bold text-xs" id="cart-total-nav">0₫</span>
      </button>
    </div>

  </div>
</header>
```

### 🎨 Mã nguồn CSS (`style.css` dòng 18-22, 74-78):
```css
/* Trạng thái tab đang chọn trên Desktop Navbar */
.nav-link.active {
  color: #E31837 !important;
  background-color: #FEE2E2 !important;
  font-weight: 700 !important;
}

@media (min-width: 1024px) {
  .header.scrolled {
    background-color: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }
}
```

### ⚙️ Mã nguồn JavaScript Scroll Spy (`app.js` dòng 471-534):
```javascript
function setupNavLinksAndScrollSpy() {
  const desktopNavLinks = document.querySelectorAll('#nav-menu .nav-link');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item[data-section]');

  // Kỹ thuật Scroll Spy: theo dõi vị trí cuộn trang để kích hoạt link tương ứng
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPos = window.scrollY + 160;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    if (currentSectionId) {
      desktopNavLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === currentSectionId);
      });
      mobileNavItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-section') === currentSectionId);
      });
    }

    // Hiệu ứng bóng đổ khi cuộn xuống
    const nav = document.getElementById('navbar');
    if (window.scrollY > 40) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  });
}
```

---

## 3. THANH ĐIỀU HƯỚNG DI ĐỘNG DƯỚI ĐÁY (MOBILE BOTTOM NAV)

### 🎯 Mục đích:
Tối ưu trải nghiệm ngón tay cái (Thumb-zone) trên điện thoại thông minh, truy cập nhanh 5 tính năng chính: Trang chủ, Thực đơn, Phối combo, Chatbot AI và Giỏ hàng.

### 🖥️ Mã nguồn HTML (`index.html` dòng 565-603):
```html
<nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#14111A]/95 backdrop-blur-lg border-t border-white/10 px-2 py-2 flex items-center justify-around text-center shadow-2xl" aria-label="Menu di động">
  <!-- Trang chủ -->
  <a href="#hero" class="mobile-nav-item active flex flex-col items-center gap-1 text-[10px] font-semibold text-brand-gold transition" data-section="hero">
    <i class="fa-solid fa-house text-base"></i>
    <span>Trang Chủ</span>
  </a>

  <!-- Thực đơn -->
  <a href="#menu-section" class="mobile-nav-item flex flex-col items-center gap-1 text-[10px] font-semibold text-[#C9C7D4] transition" data-section="menu-section">
    <i class="fa-solid fa-drumstick-bite text-base"></i>
    <span>Thực Đơn</span>
  </a>

  <!-- Phối Combo -->
  <a href="#combo-builder" class="mobile-nav-item flex flex-col items-center gap-1 text-[10px] font-semibold text-[#C9C7D4] transition" data-section="combo-builder">
    <i class="fa-solid fa-wand-magic-sparkles text-base"></i>
    <span>Phối Combo</span>
  </a>

  <!-- Chatbot AI -->
  <button type="button" class="mobile-nav-item flex flex-col items-center gap-1 text-[10px] font-semibold text-brand-gold transition" onclick="toggleCompanionModal()">
    <i class="fa-solid fa-robot text-base text-brand-gold"></i>
    <span>ChickenBot AI</span>
  </button>

  <!-- Giỏ Hàng -->
  <button type="button" class="mobile-nav-item relative flex flex-col items-center gap-1 text-[10px] font-semibold text-brand-redLight transition" onclick="toggleCartDrawer(true)">
    <div class="relative">
      <i class="fa-solid fa-bag-shopping text-base"></i>
      <span class="absolute -top-1 -right-2 bg-brand-gold text-black text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center" id="cart-count-mobile">0</span>
    </div>
    <span>Giỏ Hàng</span>
  </button>
</nav>
```

---

## 4. KHU VỰC GIỚI THIỆU ĐẦU TRANG (HERO SECTION)

### 🎯 Mục đích:
Tạo ấn tượng thị giác mạnh mẽ (WOW effect) với hiệu ứng đĩa gà nổi 3D, ambient glow ánh sáng, các huy hiệu cam kết và 2 nút kêu gọi hành động (Call To Action).

### 🖥️ Mã nguồn HTML (`index.html` dòng 164-286):
```html
<section class="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden" id="hero">
  <!-- Quầng sáng hiệu ứng mờ nền -->
  <div class="absolute top-0 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-brand-red/20 rounded-full blur-[120px] pointer-events-none"></div>
  <div class="absolute bottom-0 right-10 w-72 md:w-96 h-72 md:h-96 bg-brand-gold/15 rounded-full blur-[120px] pointer-events-none"></div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
    <!-- Cột trái: Văn bản & Nút bấm -->
    <div class="lg:col-span-7 text-center lg:text-left">
      <div class="inline-flex items-center gap-2 bg-white/[0.07] border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-gold mb-4 sm:mb-6 shadow-sm">
        <span class="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
        <span>🔥 Siêu Phẩm Gà Giòn Số 1 Thế Giới</span>
      </div>

      <h1 class="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-tight uppercase leading-[1.1] mb-4 sm:mb-6">
        GIÒN RỤM <span class="text-brand-gold">VUI VẺ</span>,<br>
        VỊ NGON <span class="text-brand-redLight">LAN TỎA</span>!
      </h1>

      <p class="text-sm sm:text-base md:text-lg text-[#C9C7D4] mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
        Thưởng thức từng miếng gà giòn đậm vị, sốt ướp bí truyền Philippines, lớp da giòn rụm bên ngoài cùng từng thớ thịt mọng nước ngọt ngào bên trong.
      </p>

      <!-- 3 Huy hiệu cam kết chất lượng -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 sm:mb-8 text-xs sm:text-sm font-semibold text-white">
        <div class="flex items-center justify-center lg:justify-start gap-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
          <i class="fa-solid fa-certificate text-brand-gold"></i>
          <span>100% Gà Tươi Chuẩn</span>
        </div>
        <div class="flex items-center justify-center lg:justify-start gap-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
          <i class="fa-solid fa-fire text-brand-red"></i>
          <span>Chiên Mới Nóng Hổi</span>
        </div>
        <div class="flex items-center justify-center lg:justify-start gap-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
          <i class="fa-solid fa-truck-fast text-brand-gold"></i>
          <span>Giao Nhanh 20 Phút</span>
        </div>
      </div>

      <!-- 2 Nút CTA chính -->
      <div class="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-8">
        <a href="#menu-section" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-redDark text-white font-bold px-7 py-3.5 rounded-full shadow-[0_8px_25px_rgba(227,24,55,0.5)] transition-transform duration-200 active:scale-95" id="hero-order-btn">
          <i class="fa-solid fa-utensils"></i> Đặt Món Ngay
        </a>
        <a href="#combo-builder" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/[0.08] hover:bg-white/[0.16] border border-brand-gold/30 text-brand-gold hover:text-white font-bold px-6 py-3.5 rounded-full transition">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Tự Phối Combo 15%
        </a>
      </div>
    </div>

    <!-- Cột phải: Hình ảnh món gà và các huy hiệu nổi -->
    <div class="lg:col-span-5 flex justify-center relative">
      <div class="relative w-full max-w-md">
        <div class="absolute inset-0 bg-gradient-to-tr from-brand-gold/30 to-brand-red/30 rounded-3xl blur-2xl -z-10"></div>
        <img src="assets/chicken.jpg" alt="Xô Gà Giòn Vui Vẻ Chicken" class="w-full h-auto rounded-3xl border border-white/15 shadow-2xl object-cover animate-float" id="hero-chicken-img">

        <!-- Badge nổi: Best-seller -->
        <div class="hidden sm:flex absolute -top-4 -right-4 bg-[#17141E]/90 backdrop-blur-md border border-white/15 p-3 rounded-2xl shadow-xl items-center gap-3 animate-bobbing">
          <div class="w-9 h-9 rounded-full bg-brand-gold text-black flex items-center justify-center text-sm font-bold">
            <i class="fa-solid fa-crown"></i>
          </div>
          <div class="text-left">
            <div class="font-bold text-xs text-white">Best-Seller</div>
            <div class="text-[10px] text-[#8E8B9D]">Gà Giòn Vui Vẻ</div>
          </div>
        </div>

        <!-- Badge nổi: Cay giòn đậm vị -->
        <div class="hidden sm:flex absolute -bottom-4 -left-4 bg-[#17141E]/90 backdrop-blur-md border border-white/15 p-3 rounded-2xl shadow-xl items-center gap-3 animate-bobbing-delay">
          <div class="w-9 h-9 rounded-full bg-brand-red text-white flex items-center justify-center text-sm font-bold">
            <i class="fa-solid fa-pepper-hot"></i>
          </div>
          <div class="text-left">
            <div class="font-bold text-xs text-white">Cay Giòn Đậm Vị</div>
            <div class="text-[10px] text-[#8E8B9D]">Sốt Ớt Philippines</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 5. BANNER SIÊU KHUYẾN MÃI (MEGA PROMO BANNER)

### 🎯 Mục đích:
Quảng bá gói Combo Jolli Party lớn tiết kiệm 100.000₫ và cung cấp nút bấm thêm nhanh vào giỏ hàng chỉ với 1 thao tác.

### 🖥️ Mã nguồn HTML (`index.html` dòng 289-322):
```html
<section class="py-6 sm:py-10">
  <div class="max-w-7xl mx-auto px-4 sm:px-6">
    <div class="bg-gradient-to-r from-[#2A1017] via-[#1E121E] to-[#15111B] border border-brand-red/30 rounded-3xl p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative overflow-hidden">
      <div class="lg:col-span-7">
        <span class="inline-flex items-center gap-1.5 bg-brand-gold/15 text-brand-gold border border-brand-gold/30 px-3 py-1 rounded-full text-xs font-bold mb-3">
          <i class="fa-solid fa-star"></i> ĐẠI TIỆC GIA ĐÌNH & NHÓM BẠN
        </span>
        <h2 class="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-white mb-2">COMBO JOLLI PARTY - NO SAY THỎA THÍCH</h2>
        <p class="text-sm sm:text-base text-[#C9C7D4] mb-4">Trọn bộ 6 miếng Gà Giòn + 2 Mì Ý Sốt Bò Bằm + 4 Bánh Pie Xoài Đào + 4 Nước Ngọt mát lạnh!</p>

        <div class="flex items-baseline gap-3 mb-6">
          <span class="text-base text-[#8E8B9D] line-through">349.000₫</span>
          <span class="font-heading font-black text-3xl sm:text-4xl text-brand-gold">249.000₫</span>
          <span class="bg-brand-red text-white text-xs font-bold px-2.5 py-1 rounded-full">Tiết kiệm 100k</span>
        </div>

        <button type="button" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-gold to-brand-goldDark text-black font-extrabold px-6 py-3.5 rounded-full hover:brightness-110 shadow-lg transition" onclick="quickAddComboParty()">
          <i class="fa-solid fa-cart-plus"></i> Thêm Combo Vào Giỏ Ngay
        </button>
      </div>

      <div class="lg:col-span-5">
        <img src="assets/feast.jpg" alt="Đại tiệc Chicken Party Combo" class="rounded-2xl border border-white/10 shadow-xl object-cover w-full max-h-64 sm:max-h-72">
      </div>
    </div>
  </div>
</section>
```

### ⚙️ Mã nguồn JavaScript (`app.js` dòng 730-741):
```javascript
function quickAddComboParty() {
  addToCart({
    id: 'cb-party-' + Date.now(),
    name: 'Combo Jolli Party No Say Thỏa Thích',
    image: 'assets/feast.jpg',
    price: 249000,
    qty: 1,
    options: '6 Gà Giòn + 2 Mì Ý + 4 Pie Xoài Đào + 4 Nước'
  });
  showToast('Đại tiệc Combo Jolli Party đã thêm vào giỏ hàng! 🎉');
  toggleCartDrawer(true);
}
```

---

## 6. THỰC ĐƠN TƯƠNG TÁC, PHÂN LOẠI & TÌM KIẾM TRỰC TIẾP (MENU SECTION)

### 🎯 Mục đích:
Hiển thị danh sách hơn 22 món ăn qua lưới Responsive Card. Hỗ trợ lọc theo 6 danh mục tab và tìm kiếm trực tiếp theo thời gian thực (Live Search) mà không cần tải lại trang.

### 🖥️ Mã nguồn HTML (`index.html` dòng 325-392):
```html
<section class="py-12 sm:py-16" id="menu-section">
  <div class="max-w-7xl mx-auto px-4 sm:px-6">

    <!-- Header Tiêu đề -->
    <div class="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
      <span class="text-brand-gold text-xs font-extrabold tracking-widest uppercase block mb-1">THỰC ĐƠN ĐẬM ĐÀ</span>
      <h2 class="font-heading font-black text-2xl sm:text-4xl text-white mb-3">Khám Phá Món Ngon <span class="text-brand-redLight">Chicken</span></h2>
      <p class="text-xs sm:text-sm text-[#8E8B9D]">Hơn 22+ món ngon đặc sắc chiên mới giòn rụm mỗi ngày luôn sẵn sàng phục vụ bạn!</p>
    </div>

    <!-- Thanh Lọc Tab & Ô Tìm Kiếm -->
    <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
      <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none category-tabs-scroll" role="tablist">
        <button type="button" class="tab-btn active shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-brand-red text-white transition flex items-center gap-1.5 shadow" data-category="all">
          <i class="fa-solid fa-border-all"></i> Tất Cả
        </button>
        <button type="button" class="tab-btn shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#17141E] text-[#C9C7D4] hover:text-white border border-white/10 transition flex items-center gap-1.5" data-category="chicken">
          <i class="fa-solid fa-drumstick-bite"></i> Gà Giòn
        </button>
        <button type="button" class="tab-btn shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#17141E] text-[#C9C7D4] hover:text-white border border-white/10 transition flex items-center gap-1.5" data-category="spaghetti">
          <i class="fa-solid fa-bowl-food"></i> Mì Ý
        </button>
        <button type="button" class="tab-btn shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#17141E] text-[#C9C7D4] hover:text-white border border-white/10 transition flex items-center gap-1.5" data-category="burger-rice">
          <i class="fa-solid fa-burger"></i> Burger & Cơm
        </button>
        <button type="button" class="tab-btn shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#17141E] text-[#C9C7D4] hover:text-white border border-white/10 transition flex items-center gap-1.5" data-category="sides">
          <i class="fa-solid fa-cookie-bite"></i> Ăn Vặt
        </button>
        <button type="button" class="tab-btn shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#17141E] text-[#C9C7D4] hover:text-white border border-white/10 transition flex items-center gap-1.5" data-category="dessert">
          <i class="fa-solid fa-ice-cream"></i> Tráng Miệng & Nước
        </button>
        <button type="button" class="tab-btn shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#17141E] text-[#C9C7D4] hover:text-white border border-white/10 transition flex items-center gap-1.5" data-category="combo">
          <i class="fa-solid fa-box-open"></i> Combo
        </button>
      </div>

      <!-- Ô tìm kiếm trực tiếp -->
      <div class="relative w-full md:w-72 shrink-0">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8B9D] text-xs"></i>
        <input type="text" id="menu-search-input" placeholder="Tìm kiếm món ăn..."
          class="w-full bg-[#17141E] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-[#8E8B9D] focus:border-brand-gold focus:outline-none transition">
      </div>
    </div>

    <!-- Lưới hiển thị các món ăn dạng Card -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" id="menu-grid">
      <!-- Được render động bởi JavaScript -->
    </div>
  </div>
</section>
```

### ⚙️ Mã nguồn JavaScript (`app.js` dòng 540-617):
```javascript
function renderMenu(filterCat = 'all', searchQuery = '') {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  // Lọc kết hợp 2 điều kiện: Danh mục VÀ Từ khóa tìm kiếm
  const filtered = MENU_ITEMS.filter(item => {
    const matchCategory = (filterCat === 'all') || (item.category === filterCat);
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 px-4">
        <i class="fa-solid fa-magnifying-glass text-4xl text-gray-400 mb-3"></i>
        <h3 class="text-gray-800 font-bold text-base mb-1">Không tìm thấy món ăn phù hợp!</h3>
        <p class="text-xs text-gray-500">Hãy thử tìm từ khóa khác hoặc chọn danh mục khác nhé.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="food-card flex flex-col overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
      <div class="food-card-img-wrap relative w-full overflow-hidden bg-gray-100">
        <img src="${item.image}" alt="${item.name}" class="food-img w-full h-full object-cover transition-transform duration-300" loading="lazy">
        ${item.badge ? `<span class="absolute top-2.5 left-2.5 bg-brand-gold text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1"><i class="fa-solid fa-sparkles"></i> ${item.badge}</span>` : ''}
        ${item.spicy ? `<span class="absolute top-2.5 right-2.5 bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">${item.spicy}</span>` : ''}
      </div>

      <div class="p-4 flex flex-col flex-1">
        <h3 class="font-heading font-bold text-sm sm:text-base text-gray-900 mb-1 hover:text-brand-red transition">${item.name}</h3>
        <p class="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2 flex-1">${item.desc}</p>
        
        <div class="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div class="font-heading font-black text-base sm:text-lg text-brand-red">${formatVND(item.price)}</div>
          <div class="flex items-center gap-1.5">
            <button type="button" class="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition" onclick="openItemModal('${item.id}')">
              <i class="fa-solid fa-sliders text-[10px]"></i> Tùy chọn
            </button>
            <button type="button" class="w-8 h-8 rounded-lg bg-brand-red hover:bg-brand-redDark text-white flex items-center justify-center text-xs shadow-sm transition active:scale-95" title="Thêm ngay vào giỏ" onclick="quickAddToCart('${item.id}')">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Bắt sự kiện gõ tìm kiếm
document.getElementById('menu-search-input')?.addEventListener('input', (e) => {
  const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-category') || 'all';
  renderMenu(activeTab, e.target.value);
});
```

---

## 7. POPUP TÙY BIẾN MÓN ĂN (ITEM CUSTOMIZER MODAL)

### 🎯 Mục đích:
Cho phép khách hàng cá nhân hóa món ăn: Chọn độ cay (Nguyên vị / Cay giòn), thêm topping phô mai (+10k), upsize nước (+8k), nhập ghi chú cho nhà bếp và chọn số lượng trước khi thêm vào giỏ.

### 🖥️ Mã nguồn HTML (`index.html` dòng 747-825):
```html
<div class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 pointer-events-none" id="item-modal-overlay">
  <div class="bg-[#191522] border border-white/15 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative animate-zoom">
    <button type="button" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-[#8E8B9D] hover:text-white flex items-center justify-center z-10" onclick="closeItemModal()">
      <i class="fa-solid fa-xmark"></i>
    </button>

    <div class="grid grid-cols-1 sm:grid-cols-2">
      <!-- Ảnh món -->
      <div class="bg-[#110e17] h-48 sm:h-auto flex items-center justify-center">
        <img src="assets/chicken.jpg" alt="Food Item" class="w-full h-full object-cover" id="modal-item-img">
      </div>

      <!-- Thông tin & Tùy chọn -->
      <div class="p-5 sm:p-6 flex flex-col">
        <span class="text-[11px] font-extrabold text-brand-gold uppercase tracking-wider" id="modal-item-cat">Gà Giòn Vui Vẻ</span>
        <h3 class="font-heading font-bold text-lg text-white mt-1 mb-1" id="modal-item-name">Tên Món</h3>
        <p class="text-xs text-[#8E8B9D] mb-3 leading-relaxed" id="modal-item-desc">Mô tả món ăn...</p>
        <div class="font-heading font-extrabold text-xl text-brand-gold mb-4" id="modal-item-price">45.000₫</div>

        <!-- Các lựa chọn -->
        <div class="space-y-3 text-xs mb-4">
          <!-- Chọn vị cay -->
          <div>
            <label class="font-bold text-white block mb-1.5">Chọn Vị:</label>
            <div class="space-y-1.5">
              <label class="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5 cursor-pointer">
                <input type="radio" name="spice" value="original" checked class="accent-brand-red">
                <span>🍗 Nguyên Vị Giòn Ngọt</span>
              </label>
              <label class="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5 cursor-pointer">
                <input type="radio" name="spice" value="spicy" class="accent-brand-red">
                <span>🌶️ Cay Giòn Đậm Đà</span>
              </label>
            </div>
          </div>

          <!-- Topping thêm -->
          <div>
            <label class="font-bold text-white block mb-1.5">Thêm Topping:</label>
            <div class="space-y-1.5">
              <label class="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5 cursor-pointer">
                <input type="checkbox" id="add-cheese" value="10000" class="accent-brand-red">
                <span>🧀 Sốt Phô Mai (+10k)</span>
              </label>
              <label class="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5 cursor-pointer">
                <input type="checkbox" id="add-upsize" value="8000" class="accent-brand-red">
                <span>🥤 Upsize Nước Lớn (+8k)</span>
              </label>
            </div>
          </div>

          <!-- Ghi chú cho bếp -->
          <div>
            <label class="font-bold text-white block mb-1">Ghi chú cho bếp:</label>
            <input type="text" id="modal-item-note" placeholder="Ví dụ: Lấy đùi gà, ít đá..."
              class="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-brand-gold focus:outline-none">
          </div>
        </div>

        <!-- Bộ tăng giảm số lượng & Nút Thêm -->
        <div class="flex items-center gap-3 pt-3 border-t border-white/10 mt-auto">
          <div class="flex items-center bg-white/5 border border-white/10 rounded-full p-1">
            <button type="button" class="w-7 h-7 rounded-full text-white hover:bg-brand-red flex items-center justify-center font-bold" onclick="changeModalQty(-1)">-</button>
            <span class="w-7 text-center font-bold text-white text-xs" id="modal-item-qty">1</span>
            <button type="button" class="w-7 h-7 rounded-full text-white hover:bg-brand-red flex items-center justify-center font-bold" onclick="changeModalQty(1)">+</button>
          </div>
          <button type="button" class="flex-1 bg-brand-red hover:bg-brand-redLight text-white font-bold py-2.5 px-4 rounded-full text-xs transition" onclick="confirmAddItemFromModal()">
            Thêm Vào Giỏ (<span id="modal-calculated-total">45.000₫</span>)
          </button>
        </div>

      </div>
    </div>
  </div>
</div>
```

### ⚙️ Mã nguồn JavaScript (`app.js` dòng 623-710):
```javascript
function openItemModal(itemId) {
  const item = MENU_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  playSound('pop');
  state.currentItemInModal = item;
  state.modalQty = 1;

  document.getElementById('modal-item-img').src = item.image;
  document.getElementById('modal-item-name').innerText = item.name;
  document.getElementById('modal-item-desc').innerText = item.desc;
  document.getElementById('modal-item-price').innerText = formatVND(item.price);
  document.getElementById('modal-item-qty').innerText = '1';
  document.getElementById('modal-item-note').value = '';
  document.getElementById('add-cheese').checked = false;
  document.getElementById('add-upsize').checked = false;

  updateModalTotal();

  const overlay = document.getElementById('item-modal-overlay');
  overlay.classList.remove('opacity-0', 'pointer-events-none');
  overlay.classList.add('opacity-100', 'pointer-events-auto');
}

function updateModalTotal() {
  if (!state.currentItemInModal) return;
  let base = state.currentItemInModal.price;
  if (document.getElementById('add-cheese').checked) base += 10000;
  if (document.getElementById('add-upsize').checked) base += 8000;
  
  const total = base * state.modalQty;
  document.getElementById('modal-calculated-total').innerText = formatVND(total);
}

function confirmAddItemFromModal() {
  if (!state.currentItemInModal) return;
  const item = state.currentItemInModal;
  const spiceVal = document.querySelector('input[name="spice"]:checked')?.value;
  const spiceText = spiceVal === 'spicy' ? '🌶️ Cay Giòn' : '🍗 Nguyên Vị';
  const cheese = document.getElementById('add-cheese').checked;
  const upsize = document.getElementById('add-upsize').checked;
  const note = document.getElementById('modal-item-note').value.trim();

  let unitPrice = item.price;
  let extras = [spiceText];
  if (cheese) { unitPrice += 10000; extras.push('🧀 Sốt Phô Mai'); }
  if (upsize) { unitPrice += 8000; extras.push('🥤 Upsize Lớn'); }
  if (note) extras.push(`Ghi chú: ${note}`);

  addToCart({
    id: item.id + '-' + Date.now(),
    name: item.name,
    image: item.image,
    price: unitPrice,
    qty: state.modalQty,
    options: extras.join(' • ')
  });

  closeItemModal();
  showToast(`Đã thêm ${state.modalQty}x <strong>${item.name}</strong> vào giỏ!`);
}
```

---

## 8. TRÌNH TỰ PHỐI COMBO CÁ NHÂN GIẢM 15% (COMBO BUILDER)

### 🎯 Mục đích:
Tính năng tương tác độc đáo cho phép người dùng tự lắp ráp bữa ăn qua 3 bước: (1) Món chính, (2) Món kèm, (3) Thức uống. Khi hoàn thành đủ 3 bước, hệ thống tự tính giảm giá 15% và mở khóa nút đặt.

### 🖥️ Mã nguồn HTML (`index.html` dòng 395-468):
```html
<section class="py-12 sm:py-16 bg-gradient-to-b from-[#14111A] to-[#0E0C12]" id="combo-builder">
  <div class="max-w-7xl mx-auto px-4 sm:px-6">
    <div class="bg-[#17141E] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
      <div class="text-center max-w-2xl mx-auto mb-8">
        <span class="text-brand-gold text-xs font-extrabold tracking-widest uppercase block mb-1">SÁNG TẠO BỮA ĂN</span>
        <h2 class="font-heading font-black text-2xl sm:text-3xl text-white mb-2">Trình Tự Phối <span class="text-brand-gold">Combo Cá Nhân</span></h2>
        <p class="text-xs sm:text-sm text-[#8E8B9D]">Chọn đủ 3 món: Món chính + Món kèm + Nước/Tráng miệng để nhận ngay ưu đãi giảm <strong class="text-brand-gold">15%</strong>!</p>
      </div>

      <!-- 3 Cột Lựa Chọn Bước 1, 2, 3 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <!-- Bước 1 -->
        <div class="bg-black/40 border border-white/10 rounded-2xl p-4">
          <div class="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 font-heading font-bold text-sm text-white">
            <span class="bg-brand-red text-white text-[11px] px-2 py-0.5 rounded-full">Bước 1</span>
            <span>Chọn Món Chính</span>
          </div>
          <div class="space-y-2.5" id="builder-main-options"></div>
        </div>

        <!-- Bước 2 -->
        <div class="bg-black/40 border border-white/10 rounded-2xl p-4">
          <div class="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 font-heading font-bold text-sm text-white">
            <span class="bg-brand-red text-white text-[11px] px-2 py-0.5 rounded-full">Bước 2</span>
            <span>Chọn Món Kèm</span>
          </div>
          <div class="space-y-2.5" id="builder-side-options"></div>
        </div>

        <!-- Bước 3 -->
        <div class="bg-black/40 border border-white/10 rounded-2xl p-4">
          <div class="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 font-heading font-bold text-sm text-white">
            <span class="bg-brand-red text-white text-[11px] px-2 py-0.5 rounded-full">Bước 3</span>
            <span>Chọn Thức Uống</span>
          </div>
          <div class="space-y-2.5" id="builder-drink-options"></div>
        </div>
      </div>

      <!-- Thanh Tóm Tắt & Tính Tiền Combo Trực Tiếp -->
      <div class="bg-gradient-to-r from-[#20131B] to-[#1B1522] border border-brand-gold/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h4 class="font-heading font-bold text-base text-white mb-1" id="summary-name">Chưa hoàn thiện</h4>
          <p class="text-xs text-[#8E8B9D]" id="summary-items-list">Vui lòng chọn đủ 3 món để nhận chiết khấu 15%</p>
        </div>
        <div class="flex items-center justify-between sm:justify-end gap-4">
          <div class="text-right">
            <div class="text-xs text-[#8E8B9D] line-through" id="summary-original-price">0₫</div>
            <div class="font-heading font-black text-2xl text-brand-gold" id="summary-final-price">0₫</div>
          </div>
          <button type="button" class="inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-redLight text-white font-bold px-5 py-3 rounded-full text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition" id="btn-add-custom-combo" disabled onclick="addCustomComboToCart()">
            <i class="fa-solid fa-plus"></i> Thêm Combo
          </button>
        </div>
      </div>

    </div>
  </div>
</section>
```

### ⚙️ Mã nguồn JavaScript (`app.js` dòng 923-1021):
```javascript
const BUILDER_OPTIONS = {
  main: [
    { id: 'b-m1', name: '1 Miếng Gà Giòn Vui Vẻ', price: 36000, img: 'assets/chicken_1pc.jpg' },
    { id: 'b-m2', name: '1 Đĩa Mì Ý Sốt Bò Bằm', price: 45000, img: 'assets/spaghetti.jpg' },
    { id: 'b-m3', name: '1 Bánh Burger Bò Yumburger', price: 42000, img: 'assets/burger.jpg' },
    { id: 'b-m4', name: '1 Phần Cơm Gà Giòn Sốt Gravy', price: 49000, img: 'assets/rice.jpg' }
  ],
  side: [
    { id: 'b-s1', name: 'Khoai Tây Chiên Vàng Giòn', price: 20000, img: 'assets/feast.jpg' },
    { id: 'b-s2', name: 'Khoai Tây Lắc Phô Mai Béo', price: 25000, img: 'assets/fries_cheese.jpg' },
    { id: 'b-s3', name: 'Gà Không Xương Giòn Tan (3 Miếng)', price: 32000, img: 'assets/chicken_tenders.jpg' }
  ],
  drink: [
    { id: 'b-d1', name: 'Bánh Pie Xoài Đào Ấm Nóng', price: 22000, img: 'assets/dessert.jpg' },
    { id: 'b-d2', name: 'Pepsi Tươi Mát Lạnh Cỡ Vừa', price: 18000, img: 'assets/drink_pepsi.jpg' },
    { id: 'b-d3', name: 'Trà Đào Hạt Chia Giải Nhiệt', price: 25000, img: 'assets/dessert.jpg' }
  ]
};

function selectComboOption(type, optionId) {
  playSound('pop');
  state.comboBuilder[type] = BUILDER_OPTIONS[type].find(o => o.id === optionId);
  renderComboBuilder();
}

function updateComboSummary() {
  const { main, side, drink } = state.comboBuilder;
  const isComplete = main && side && drink;
  const summaryName = document.getElementById('summary-name');
  const summaryList = document.getElementById('summary-items-list');
  const origPriceEl = document.getElementById('summary-original-price');
  const finalPriceEl = document.getElementById('summary-final-price');
  const addBtn = document.getElementById('btn-add-custom-combo');

  if (isComplete) {
    const rawTotal = main.price + side.price + drink.price;
    const discountedTotal = Math.round(rawTotal * 0.85); // Giảm 15%

    summaryName.innerText = 'Combo Tự Phối Đặc Biệt (-15%)';
    summaryList.innerHTML = `<strong>1.</strong> ${main.name} + <strong>2.</strong> ${side.name} + <strong>3.</strong> ${drink.name}`;
    origPriceEl.innerText = formatVND(rawTotal);
    finalPriceEl.innerText = formatVND(discountedTotal);
    addBtn.disabled = false;
    addBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Thêm Combo (${formatVND(discountedTotal)})`;
  } else {
    summaryName.innerText = 'Chưa hoàn thiện';
    origPriceEl.innerText = '0₫';
    finalPriceEl.innerText = '0₫';
    addBtn.disabled = true;
    addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Vui lòng chọn đủ 3 bước';
  }
}
```

---

## 9. BÍ QUYẾT VỊ NGON & GIÁ TRỊ THƯƠNG HIỆU (BRAND STORY & PILLARS)

### 🎯 Mục đích:
Khắc sâu bản sắc thương hiệu thông qua 3 giá trị cốt lõi: Vỏ giòn độc quyền, Thịt gà mọng nước và Phục vụ tận tâm.

### 🖥️ Mã nguồn HTML (`index.html` dòng 473-514):
```html
<section class="py-12 sm:py-16 bg-[#17141E]/50" id="story-section">
  <div class="max-w-7xl mx-auto px-4 sm:px-6">
    <div class="text-center max-w-2xl mx-auto mb-10">
      <span class="text-brand-gold text-xs font-extrabold tracking-widest uppercase block mb-1">TÂM HUYẾT TỪ TRÁI TIM</span>
      <h2 class="font-heading font-black text-2xl sm:text-3xl text-white mb-2">Bí Quyết Vị Ngon <span class="text-brand-gold">Huyền Thoại</span></h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-[#17141E] border border-white/10 rounded-2xl p-6 text-center hover:-translate-y-1.5 transition">
        <div class="w-14 h-14 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center text-xl mx-auto mb-4 border border-brand-gold/30">
          <i class="fa-solid fa-wheat-awn"></i>
        </div>
        <h3 class="font-heading font-bold text-lg text-white mb-2">Lớp Vỏ Giòn Độc Quyền</h3>
        <p class="text-xs sm:text-sm text-[#8E8B9D]">Công thức bột gia vị đặc biệt chiên ở nhiệt độ chuẩn xác, tạo nên lớp vỏ giòn rụm không ngấy dầu.</p>
      </div>

      <div class="bg-[#17141E] border border-white/10 rounded-2xl p-6 text-center hover:-translate-y-1.5 transition">
        <div class="w-14 h-14 rounded-full bg-brand-red/15 text-brand-redLight flex items-center justify-center text-xl mx-auto mb-4 border border-brand-red/30">
          <i class="fa-solid fa-drumstick-bite"></i>
        </div>
        <h3 class="font-heading font-bold text-lg text-white mb-2">Thịt Gà Mọng Nước</h3>
        <p class="text-xs sm:text-sm text-[#8E8B9D]">Từng miếng thịt gà tươi thấm đẫm sốt ướp bí truyền, ngọt mềm mọng nước trong từng thớ thịt.</p>
      </div>

      <div class="bg-[#17141E] border border-white/10 rounded-2xl p-6 text-center hover:-translate-y-1.5 transition">
        <div class="w-14 h-14 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center text-xl mx-auto mb-4 border border-brand-gold/30">
          <i class="fa-solid fa-face-smile-beam"></i>
        </div>
        <h3 class="font-heading font-bold text-lg text-white mb-2">Phục Vụ Tận Tâm</h3>
        <p class="text-xs sm:text-sm text-[#8E8B9D]">Mỗi nụ cười và sự nhiệt thành luôn là món gia vị tuyệt vời nhất gửi gắm đến quý khách hàng.</p>
      </div>
    </div>
  </div>
</section>
```

---

## 10. LINH VẬT ĐỒNG HÀNH & TRỢ LÝ ẢO AI BEEBOT (MASCOT & CHATBOT)

### 🎯 Mục đích:
Tạo điểm nhấn tương tác cao cấp. Chú Ong Vui Vẻ vừa là linh vật phản hồi khi người dùng thao tác (chào mừng, reo mừng khi thêm món), vừa là Trợ lý AI DeepSeek tư vấn món ăn thông minh với lịch sử hội thoại nhiều lượt và phản hồi dự phòng offline.

### 🖥️ Mã nguồn HTML Widget & Modal Chat (`index.html` dòng 606-692):
```html
<!-- Widget Nổi Góc Phải Dưới Cùng -->
<div class="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2" id="companion-widget">
  <!-- Bong bóng tin nhắn động -->
  <div class="bg-[#17141E]/95 backdrop-blur-md border border-brand-gold/40 rounded-2xl rounded-br-sm p-3 max-w-[240px] text-xs text-white shadow-2xl relative animate-pop hidden" id="companion-bubble">
    <span id="bubble-text">Chào bạn! Đang đói bụng hả? Bấm vào mình để nhận gợi ý món ngon nhé! 🍗🐝</span>
    <button type="button" class="absolute top-1 right-2 text-[#8E8B9D] hover:text-white" onclick="closeCompanionBubble(event)">×</button>
  </div>

  <!-- Nút Tròn Avatar Mascot -->
  <button type="button" class="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-brand-gold shadow-[0_0_20px_rgba(255,192,0,0.4)] bg-white overflow-hidden animate-mascot-float cursor-pointer" onclick="toggleCompanionModal()" title="Trò chuyện với BeeBot">
    <img src="assets/mascot.jpg" alt="BeeBot" class="w-full h-full object-cover">
    <span class="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></span>
  </button>
</div>

<!-- Cửa Sổ Khung Chat AI (Popup Modal) -->
<div class="fixed bottom-28 md:bottom-24 right-4 sm:right-6 w-[340px] max-w-[calc(100vw-32px)] h-[460px] bg-[#14111A]/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl z-50 flex-col overflow-hidden hidden" id="companion-modal">
  <!-- Chat Header -->
  <div class="bg-gradient-to-r from-brand-redDark to-brand-red p-3.5 flex items-center justify-between">
    <div class="flex items-center gap-2.5">
      <img src="assets/mascot.jpg" alt="BeeBot" class="w-8 h-8 rounded-full border border-white object-cover">
      <div>
        <h4 class="font-heading font-bold text-xs text-white">BeeBot - Ong Vui Vẻ 🐝</h4>
        <span class="text-[10px] text-white/80 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-400"></span> Trợ lý ẩm thực AI</span>
      </div>
    </div>
    <button type="button" class="text-white/80 hover:text-white text-base" onclick="toggleCompanionModal()"><i class="fa-solid fa-xmark"></i></button>
  </div>

  <!-- Lịch Sử Tin Nhắn -->
  <div class="flex-1 overflow-y-auto p-4 space-y-3 text-xs" id="chat-messages">
    <div class="flex justify-start">
      <div class="bg-white/10 border border-white/10 text-white rounded-2xl rounded-bl-xs p-3 max-w-[85%] leading-relaxed">
        Xin chào! Mình là <strong>BeeBot</strong> - Chú Ong Vui Vẻ đại sứ Chicken 🐝✨ Được tích hợp AI DeepSeek, mình sẵn sàng tư vấn món ngon, hướng dẫn phối combo và đồng hành cùng bạn hôm nay! 🍗💛
      </div>
    </div>
  </div>

  <!-- Hiệu Ứng Đang Suy Nghĩ (Typing Indicator) -->
  <div class="px-4 py-1.5 bg-black/30 border-t border-white/5 text-[11px] text-brand-gold items-center gap-2 hidden" id="chat-typing-indicator">
    <span class="inline-flex gap-1 items-center">
      <span class="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce"></span>
      <span class="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span class="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
    <span class="italic">BeeBot đang suy nghĩ... 🐝🤐</span>
  </div>

  <!-- Gợi Ý Nhanh (Quick Chips) -->
  <div class="p-2 bg-black/30 border-t border-white/5 flex gap-1.5 overflow-x-auto scrollbar-none">
    <button type="button" class="shrink-0 bg-white/10 hover:bg-brand-gold hover:text-black text-[#C9C7D4] text-[11px] font-medium px-2.5 py-1 rounded-full transition" onclick="sendQuickPrompt('Gợi ý món ăn ngon cho 1 người ăn no nê')">🍗 Ăn 1 mình</button>
    <button type="button" class="shrink-0 bg-white/10 hover:bg-brand-gold hover:text-black text-[#C9C7D4] text-[11px] font-medium px-2.5 py-1 rounded-full transition" onclick="sendQuickPrompt('Gợi ý combo gà giòn và mì ý cho nhóm 3-4 bạn')">🎉 Ăn nhóm</button>
    <button type="button" class="shrink-0 bg-white/10 hover:bg-brand-gold hover:text-black text-[#C9C7D4] text-[11px] font-medium px-2.5 py-1 rounded-full transition" onclick="sendQuickPrompt('Hướng dẫn cách tự phối combo tiết kiệm 15%')">✨ Tự phối combo</button>
  </div>

  <!-- Form Gửi Tin Nhắn -->
  <form class="p-2.5 bg-[#0E0C12] border-t border-white/10 flex gap-2" onsubmit="handleChatSubmit(event)">
    <input type="text" id="chat-user-input" placeholder="Hỏi BeeBot bất cứ điều gì..." class="flex-1 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white focus:border-brand-gold focus:outline-none">
    <button type="submit" class="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center text-xs hover:bg-brand-redLight transition"><i class="fa-solid fa-paper-plane"></i></button>
  </form>
</div>
```

### ⚙️ Mã nguồn JavaScript (`app.js` dòng 1149-1257):
```javascript
async function handleChatSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('chat-user-input');
  const query = input?.value.trim();
  if (!query) return;

  playSound('pop');
  addChatMessage(query, 'user');
  if (input) input.value = '';

  // Lưu tin nhắn vào lịch sử trò chuyện
  chatConversationHistory.push({ role: 'user', content: query });
  showChatTyping(true);

  try {
    const response = await fetch(DEEPSEEK_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: chatConversationHistory,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const data = await response.json();
    const reply = data.reply || data.choices?.[0]?.message?.content;

    if (reply) {
      chatConversationHistory.push({ role: 'assistant', content: reply });
      showChatTyping(false);
      addChatMessage(formatAiResponse(reply), 'bot');
      playSound('mascot');
    }
  } catch (error) {
    // Dự phòng phản hồi offline thông minh khi không có kết nối internet
    showChatTyping(false);
    const fallback = generateLocalFallbackReply(query);
    chatConversationHistory.push({ role: 'assistant', content: fallback });
    addChatMessage(fallback, 'bot');
    playSound('mascot');
  }
}
```

---

## 11. NGĂN KÉO GIỎ HÀNG TRƯỢT NGANG (SLIDE-OVER CART DRAWER)

### 🎯 Mục đích:
Quản lý toàn bộ món ăn trong giỏ hàng: Hiển thị ảnh, phân loại tùy chỉnh, nút tăng/giảm số lượng, nút xóa, tự động tính tổng tiền + phí giao hàng 15k và nút Đặt hàng thử nghiệm.

### 🖥️ Mã nguồn HTML (`index.html` dòng 695-744):
```html
<!-- Lớp Phủ Mờ Nền -->
<div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 opacity-0 pointer-events-none" id="cart-overlay" onclick="toggleCartDrawer(false)"></div>

<!-- Thanh Ngăn Kéo Trượt Từ Phải Sang -->
<aside class="fixed top-0 right-0 w-full max-w-md h-full bg-[#14111A] border-l border-white/10 z-50 flex flex-col shadow-2xl transition-transform duration-300 translate-x-full" id="cart-drawer">
  <div class="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
    <div class="flex items-center gap-2 text-white font-heading font-bold text-base sm:text-lg">
      <i class="fa-solid fa-bag-shopping text-brand-red"></i>
      <h3>Giỏ Hàng Của Bạn (<span id="cart-drawer-count">0</span>)</h3>
    </div>
    <button type="button" class="w-8 h-8 rounded-full bg-white/5 text-[#8E8B9D] hover:text-white flex items-center justify-center" onclick="toggleCartDrawer(false)"><i class="fa-solid fa-xmark"></i></button>
  </div>

  <!-- Danh sách món ăn trong giỏ -->
  <div class="flex-1 overflow-y-auto p-4 space-y-3" id="cart-items-list"></div>

  <!-- Hóa đơn tính tiền & Nút Đặt Hàng -->
  <div class="p-4 sm:p-5 border-t border-white/10 bg-[#0E0C12]/95 space-y-4" id="cart-footer" style="display: none;">
    <div class="space-y-2 text-xs text-[#8E8B9D]">
      <div class="flex justify-between">
        <span>Tạm tính:</span>
        <span class="text-white font-medium" id="bill-subtotal">0₫</span>
      </div>
      <div class="flex justify-between">
        <span>Phí giao hàng:</span>
        <span class="text-white font-medium" id="bill-shipping">15.000₫</span>
      </div>
      <div class="flex justify-between items-baseline font-heading font-black text-sm text-white pt-2.5 border-t border-white/10">
        <span>Tổng cộng:</span>
        <span class="text-xl text-brand-gold" id="bill-total">0₫</span>
      </div>
    </div>

    <button type="button" class="w-full bg-gradient-to-r from-brand-red to-brand-redDark hover:from-brand-redLight hover:to-brand-red text-white font-bold py-3 rounded-full text-sm shadow-lg transition" onclick="openCheckoutModal()">
      <i class="fa-solid fa-shield-check mr-1.5"></i> Đặt Hàng Thử Nghiệm
    </button>
  </div>
</aside>
```

### ⚙️ Mã nguồn JavaScript Cập Nhật Giỏ Hàng (`app.js` dòng 756-835):
```javascript
function updateCartUI() {
  const countBadgeDesktop = document.getElementById('cart-count');
  const countBadgeMobile = document.getElementById('cart-count-mobile');
  const itemsList = document.getElementById('cart-items-list');
  const footer = document.getElementById('cart-footer');

  const totalItemsCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  if (countBadgeDesktop) countBadgeDesktop.innerText = totalItemsCount;
  if (countBadgeMobile) countBadgeMobile.innerText = totalItemsCount;

  if (state.cart.length === 0) {
    if (itemsList) {
      itemsList.innerHTML = `
        <div class="text-center py-12 px-4 flex flex-col items-center">
          <img src="assets/mascot.jpg" alt="Giỏ trống" class="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 mb-3 object-cover">
          <h4 class="font-heading font-bold text-gray-800 text-base mb-1">Giỏ hàng của bạn đang trống!</h4>
          <p class="text-xs text-gray-500 mb-4">Hãy chọn những món Gà Giòn thơm ngon nhé!</p>
        </div>
      `;
    }
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';

  // Render danh sách món
  itemsList.innerHTML = state.cart.map((item, index) => `
    <div class="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
      <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-lg object-cover">
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-xs text-gray-800 truncate">${item.name}</h4>
        ${item.options ? `<div class="text-[10px] text-gray-500 truncate">${item.options}</div>` : ''}
        <div class="font-black text-xs text-brand-red mt-0.5">${formatVND(item.price)}</div>
      </div>
      <div class="flex items-center gap-1.5 bg-white rounded-lg p-1 border border-gray-200">
        <button type="button" class="w-5 h-5 rounded bg-gray-100 text-gray-700 flex items-center justify-center text-[10px]" onclick="updateCartItemQty(${index}, -1)">-</button>
        <span class="font-bold text-xs text-gray-800 min-w-4 text-center">${item.qty}</span>
        <button type="button" class="w-5 h-5 rounded bg-gray-100 text-gray-700 flex items-center justify-center text-[10px]" onclick="updateCartItemQty(${index}, 1)">+</button>
      </div>
    </div>
  `).join('');

  // Tính tiền
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shipping = subtotal > 0 ? 15000 : 0;
  const finalTotal = subtotal + shipping;

  document.getElementById('bill-subtotal').innerText = formatVND(subtotal);
  document.getElementById('bill-shipping').innerText = formatVND(shipping);
  document.getElementById('bill-total').innerText = formatVND(finalTotal);
}
```

---

## 12. CỬA SỔ TRA CỨU CHI NHÁNH CỬA HÀNG (STORE LOCATOR MODAL)

### 🎯 Mục đích:
Cửa sổ tìm kiếm nhanh chi nhánh cửa hàng theo quận huyện hoặc tỉnh thành.

### 🖥️ Mã nguồn HTML (`index.html` dòng 830-850):
```html
<div class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 pointer-events-none" id="store-modal-overlay">
  <div class="bg-[#181422] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-zoom">
    <button type="button" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 text-[#8E8B9D] hover:text-white flex items-center justify-center" onclick="closeStoreModal()"><i class="fa-solid fa-xmark"></i></button>

    <h3 class="font-heading font-bold text-lg text-white mb-3 flex items-center gap-2">
      <i class="fa-solid fa-location-dot text-brand-red"></i> Hệ Thống Cửa Hàng Chicken
    </h3>

    <input type="text" placeholder="Tìm theo Quận / Tỉnh thành..."
      class="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs sm:text-sm text-white focus:border-brand-gold focus:outline-none mb-4"
      oninput="filterStores(this.value)">

    <div class="max-h-64 overflow-y-auto space-y-2.5 text-xs" id="store-list"></div>
  </div>
</div>
```

---

## 13. CỬA SỔ ĐẶT HÀNG THÀNH CÔNG & PHÁO HOA ĂN MỪNG (CHECKOUT MODAL)

### 🎯 Mục đích:
Tạo trải nghiệm thỏa mãn cho người dùng khi hoàn tất đơn hàng: Bắn pháo hoa Confetti, phát âm thanh hợp âm chiến thắng (Win Fanfare) và sinh biên lai mã đơn hàng ngẫu nhiên.

### 🖥️ Mã nguồn HTML (`index.html` dòng 853-875):
```html
<div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 pointer-events-none" id="checkout-modal-overlay">
  <div class="bg-[#181422] border border-green-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl relative animate-zoom">
    <div class="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-3xl mx-auto mb-4">
      <i class="fa-solid fa-circle-check"></i>
    </div>
    <h2 class="font-heading font-black text-2xl text-white mb-1">ĐẶT HÀNG THÀNH CÔNG! 🎉</h2>
    <p class="text-xs text-[#8E8B9D] mb-5">Cảm ơn bạn đã lựa chọn Chicken! Chú Ong Vui Vẻ đang chuẩn bị món ăn để giao ngay cho bạn.</p>

    <!-- Biên lai đơn hàng -->
    <div class="bg-black/40 border border-dashed border-white/15 rounded-xl p-4 text-xs text-left mb-6 space-y-2" id="receipt-details"></div>

    <button type="button" class="w-full bg-brand-red hover:bg-brand-redLight text-white font-bold py-3 rounded-full text-xs sm:text-sm transition" onclick="closeCheckoutModal()">Tiếp Tục Khám Phá</button>
  </div>
</div>
```

### ⚙️ Mã nguồn JavaScript (`app.js` dòng 862-910):
```javascript
function openCheckoutModal() {
  if (state.cart.length === 0) return;
  playSound('win');

  // Bắn pháo hoa Confetti
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 }
  });

  const total = document.getElementById('bill-total').innerText;
  const orderId = 'JLB-' + Math.floor(100000 + Math.random() * 900000);

  // Tạo biên lai hóa đơn
  const receipt = document.getElementById('receipt-details');
  receipt.innerHTML = `
    <div class="flex justify-between"><span class="text-gray-500">Mã đơn:</span><strong class="text-brand-red font-mono">${orderId}</strong></div>
    <div class="flex justify-between"><span class="text-gray-500">Thời gian:</span><span class="text-gray-800">${new Date().toLocaleTimeString('vi-VN')}</span></div>
    <div class="flex justify-between"><span class="text-gray-500">Số lượng:</span><span class="text-gray-800">${state.cart.length} món ăn</span></div>
    <div class="flex justify-between items-baseline pt-2 border-t border-gray-200 font-bold"><span>Tổng thanh toán:</span><strong class="text-brand-red font-heading text-base">${total}</strong></div>
  `;

  toggleCartDrawer(false);
  const overlay = document.getElementById('checkout-modal-overlay');
  overlay.classList.remove('opacity-0', 'pointer-events-none');
  overlay.classList.add('opacity-100', 'pointer-events-auto');

  // Làm rỗng giỏ hàng sau khi đặt thành công
  state.cart = [];
  updateCartUI();
}
```

---

## 14. HỆ THỐNG ÂM THANH HIỆU ỨNG THUẦN (WEB AUDIO API SYNTHESIZER)

### 🎯 Mục đích:
Tạo âm thanh tương tác trực tiếp bằng thuật toán dao động sóng âm (Oscillator) của trình duyệt. **Ưu điểm vượt trội:** Hoạt động 100% không cần file `.mp3`, không bao giờ bị lỗi thiếu file 404, dung lượng 0KB.

### ⚙️ Mã nguồn JavaScript (`app.js` dòng 39-118):
```javascript
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (!state.soundEnabled) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  switch (type) {
    case 'pop': // Bấm nút nhẹ
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now); osc.stop(now + 0.08);
      break;

    case 'add': // Thêm vào giỏ: hợp âm Đô-Mi-Sol
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);        // Nốt Đô
      osc.frequency.setValueAtTime(659.25, now + 0.08); // Nốt Mi
      osc.frequency.setValueAtTime(783.99, now + 0.16); // Nốt Sol
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
      break;

    case 'win': // Chiến thắng: Fanfare 4 nốt liên tiếp
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + idx * 0.06);
        g.gain.setValueAtTime(0.2, now + idx * 0.06);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(now + idx * 0.06); o.stop(now + 0.6);
      });
      break;

    case 'mascot': // Tiếng kêu chào mừng của linh vật
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now); osc.stop(now + 0.2);
      break;
  }
}
```

---

## 15. HỆ THỐNG THÔNG BÁO NỔI (TOAST NOTIFICATION SYSTEM)

### 🎯 Mục đích:
Cung cấp phản hồi thị giác tức thì (Instant visual feedback) khi người dùng thực hiện thao tác (thêm món, bật tắt âm thanh, v.v.).

### 🖥️ Mã nguồn HTML (`index.html` dòng 878):
```html
<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none" id="toast-container"></div>
```

### 🎨 Mã nguồn CSS (`style.css` dòng 81-95):
```css
.toast-msg {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #E31837;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: #1f2937;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  pointer-events: auto;
}
```

### ⚙️ Mã nguồn JavaScript (`app.js` dòng 450-464):
```javascript
function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `<i class="fa-solid fa-bell text-brand-gold"></i> <span>${message}</span>`;
  container.appendChild(toast);

  // Tự động mờ dần và tự hủy sau 3.5 giây
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
```

---

## 16. MÁY CHỦ BACKEND FLASK & PROXY API DEEPSEEK BẢO MẬT (`backend/app.py`)

### 🎯 Mục đích:
Bảo vệ tuyệt đối `DEEPSEEK_API_KEY` trong file `.env`, không để lộ key trên mã nguồn trình duyệt (DevTools) hay GitHub. Server Flask đóng vai trò proxy an toàn, nhận yêu cầu từ client, tiêm System Prompt kiến thức thực đơn và gọi DeepSeek API.

### 🐍 Mã nguồn Python (`backend/app.py`):
```python
# -*- coding: utf-8 -*-
import os
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

# Đọc key từ file .env bí mật
load_dotenv(ROOT_DIR / ".env")
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__, static_folder=str(ROOT_DIR), static_url_path="")
CORS(app, resources={r"/api/*": {"origins": "*"}})

DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
DEFAULT_MODEL = "deepseek-chat"

BEEBOT_SYSTEM_PROMPT = """Bạn là BeeBot - Chú Ong Vui Vẻ 🐝 đại sứ thương hiệu và trợ lý ẩm thực AI của Chicken Vietnam!
Tính cách: Vui vẻ, hóm hỉnh, ấm áp, sử dụng emoji (🐝, 🍗, 🍟, 💛, ✨).
Hiểu rõ thực đơn: Gà Giòn (36k/miếng), Mì Ý (40k-75k), Burger (42k-45k), Bánh Pie Xoài Đào (18k), Tự phối combo giảm 15%.
Trả lời ngắn gọn 2-4 câu bằng tiếng Việt."""

@app.route("/")
def index():
    return send_from_directory(ROOT_DIR, "index.html")

@app.route("/api/health", methods=["GET"])
def health_check():
    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    return jsonify({
        "status": "online",
        "service": "BeeBot DeepSeek Backend",
        "has_api_key": bool(api_key and not api_key.startswith("your_"))
    })

@app.route("/api/chat", methods=["POST"])
def chat_proxy():
    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    if not api_key or api_key.startswith("your_"):
        return jsonify({"error": "DEEPSEEK_API_KEY chưa được cấu hình hợp lệ trong tệp .env"}), 500

    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])

    # Đảm bảo có System Prompt ở đầu ngữ cảnh
    if not messages or messages[0].get("role") != "system":
        messages.insert(0, {"role": "system", "content": BEEBOT_SYSTEM_PROMPT})

    try:
        response = requests.post(
            DEEPSEEK_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": data.get("model", DEFAULT_MODEL),
                "messages": messages,
                "temperature": data.get("temperature", 0.7),
                "max_tokens": data.get("max_tokens", 300)
            },
            timeout=30
        )

        res_json = response.json()
        reply_content = res_json.get("choices", [{}])[0].get("message", {}).get("content", "")
        return jsonify({"reply": reply_content})

    except Exception as e:
        return jsonify({"error": f"Lỗi máy chủ nội bộ: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
```

---

## 🏁 BẢNG TỔNG HỢP KIẾN TRÚC THÀNH PHẦN

| STT | Thành phần | File chính | Công nghệ sử dụng | Điểm nổi bật |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Flash Sale Ticker | `index.html`, `app.js` | HTML5, Tailwind, JS Interval | Đếm ngược realtime từng giây |
| **2** | Desktop Navbar | `index.html`, `style.css`, `app.js` | Glassmorphism, Scroll Spy | Tự động phát hiện vị trí cuộn trang |
| **3** | Mobile Bottom Nav | `index.html`, `style.css` | Fixed Bottom, Flexbox | Tối ưu ngón tay cái trên điện thoại |
| **4** | Hero Section | `index.html` | CSS Ambient Glows, Keyframes | Đĩa gà bay lơ lửng 3D và huy hiệu nổi |
| **5** | Mega Promo Banner | `index.html`, `app.js` | Gradient Card, JS Add to Cart | Thêm nhanh combo tiệc 1 click |
| **6** | Menu Thực Đơn | `index.html`, `app.js`, `style.css` | Array Filter, Live Search | Lọc tab + tìm kiếm tức thì 0 delay |
| **7** | Modal Tùy Biến Món | `index.html`, `app.js` | Backdrop Blur, Dynamic Price | Chọn độ cay, topping, tính giá động |
| **8** | Trình Phối Combo 15% | `index.html`, `app.js` | State Machine, Discount Math | 3 bước phối món nhận chiết khấu 15% |
| **9** | Bí Quyết Thương Hiệu | `index.html` | CSS Grid, Hover Micro-animation | Trình bày 3 giá trị cốt lõi |
| **10** | Mascot & BeeBot AI | `index.html`, `app.js` | DeepSeek LLM, Web Audio, Animation | Chatbot AI thông minh + Phản xạ linh vật |
| **11** | Slide-Over Cart Drawer | `index.html`, `app.js` | CSS Translate, Array Reduce | Ngăn kéo trượt, tính phí ship, hóa đơn |
| **12** | Store Locator | `index.html`, `app.js` | Modal Popup, Text Filter | Tra cứu danh sách cửa hàng |
| **13** | Checkout Modal | `index.html`, `app.js` | Canvas Confetti, Fanfare Audio | Pháo hoa ăn mừng và sinh mã đơn hàng |
| **14** | Web Audio System | `app.js` | Web Audio API (Oscillator/Gain) | 100% tổng hợp âm thanh không cần mp3 |
| **15** | Toast System | `index.html`, `style.css`, `app.js` | DOM Dynamic, CSS Animation | Thông báo tự động biến mất sau 3.5s |
| **16** | Backend Proxy | `backend/app.py` | Python Flask, CORS, Dotenv | Giữ bí mật API Key trên máy chủ |
