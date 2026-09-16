/**
 * ==========================================================================
 * DỰ ÁN: JOLLIBEE SHOWCASE - WEBSITE QUẢNG CÁO TƯƠNG TÁC CAO CẤP
 * TỆP TIN: app.js
 * MÔ TẢ: Toàn bộ logic tương tác, giỏ hàng, âm thanh Web Audio, Mascot JolliBot,
 *        Trình tự phối Combo và Tối ưu Responsive Mobile/PC.
 * ==========================================================================
 */

// ==========================================================================
// 1. QUẢN LÝ TRẠNG THÁI TOÀN CỤC (GLOBAL STATE MANAGEMENT)
// Lưu trữ dữ liệu giỏ hàng, bộ phối combo và trạng thái modal
// ==========================================================================
const state = {
  // Trạng thái bật/tắt âm thanh hiệu ứng (Mặc định: true)
  soundEnabled: true,

  // Danh sách các món ăn có trong giỏ hàng
  cart: [],

  // Dữ liệu lựa chọn của Trình Tự Phối Combo (3 bước: Món chính, Món kèm, Thức uống)
  comboBuilder: {
    main: null,
    side: null,
    drink: null
  },

  // Món ăn hiện tại đang được mở trong cửa sổ Customizer Modal
  currentItemInModal: null,

  // Số lượng món được chọn trong modal (1 đến 20)
  modalQty: 1
};

// ==========================================================================
// 2. HỆ THỐNG ÂM THANH HIỆU ỨNG TỔNG HỢP (WEB AUDIO API)
// Tự động tạo sóng âm thanh qua tần số dao động (Oscillator) - Không lo lỗi thiếu file mp3
// ==========================================================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/**
 * Phát âm thanh hiệu ứng dựa vào loại hành động
 * @param {string} type - 'pop' (nhấp chuột), 'add' (thêm giỏ), 'win' (trúng thưởng), 'tick' (quay số), 'mascot' (tiếng kêu chú ong)
 */
function playSound(type) {
  // Nếu người dùng tắt âm thanh thì bỏ qua
  if (!state.soundEnabled) return;

  // Kích hoạt lại AudioContext nếu trình duyệt đang tạm hoãn để tiết kiệm tài nguyên
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  // Kết nối mạch: Nguồn phát sóng (Oscillator) -> Bộ điều chỉnh âm lượng (Gain) -> Loa đầu ra
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  switch (type) {
    case 'pop': // Âm thanh bấm nút nảy nhẹ
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
      break;

    case 'add': // Âm thanh hợp âm vui tươi khi thêm món vào giỏ hàng
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);        // Nốt Đô (C5)
      osc.frequency.setValueAtTime(659.25, now + 0.08); // Nốt Mi (E5)
      osc.frequency.setValueAtTime(783.99, now + 0.16); // Nốt Sol (G5)
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;

    case 'win': // Âm thanh chúc mừng chiến thắng (Fanfare Chord)
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + idx * 0.06);
        g.gain.setValueAtTime(0.2, now + idx * 0.06);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(now + idx * 0.06);
        o.stop(now + 0.6);
      });
      break;

    case 'tick': // Âm thanh quay bánh xe
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.start(now);
      osc.stop(now + 0.02);
      break;

    case 'mascot': // Tiếng kêu chào mừng của chú Ong JolliBot
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
  }
}

// Xử lý sự kiện bật/tắt âm thanh trên thanh điều hướng
document.getElementById('sound-toggle')?.addEventListener('click', () => {
  state.soundEnabled = !state.soundEnabled;
  const icon = document.getElementById('sound-icon');
  if (state.soundEnabled) {
    icon.className = 'fa-solid fa-volume-high text-sm';
    showToast('🔊 Đã bật âm thanh hiệu ứng!');
    playSound('pop');
  } else {
    icon.className = 'fa-solid fa-volume-xmark text-sm';
    showToast('🔇 Đã tắt âm thanh hiệu ứng.');
  }
});

// ==========================================================================
// 3. KHO DỮ LIỆU THỰC ĐƠN ĐẶC SẮC JOLLIBEE (MENU DATA - ẢNH RIÊNG BIỆT 100%)
// Hơn 22 món ăn phân loại theo 6 nhóm, mỗi món sở hữu hình ảnh đặc trưng riêng
// ==========================================================================
const MENU_ITEMS = [
  // --- NHÓM 1: GÀ GIÒN VUI VẺ ---
  {
    id: 'ck-1',
    name: 'Gà Giòn Vui Vẻ (1 Miếng)',
    category: 'chicken',
    price: 36000,
    oldPrice: 42000,
    desc: '1 miếng gà giòn rụm nóng hổi, thịt mọng nước kèm 1 phần sốt gravy béo thơm đậm đà.',
    image: 'assets/chicken_1pc.jpg',
    badge: 'Best-Seller',
    spicy: 'Tùy chọn cay'
  },
  {
    id: 'ck-2',
    name: 'Gà Giòn Vui Vẻ (2 Miếng)',
    category: 'chicken',
    price: 69000,
    oldPrice: 80000,
    desc: '2 miếng gà giòn rụm thơm nức mũi, lớp da vàng ươm giòn tan rôm rốp.',
    image: 'assets/chicken.jpg',
    badge: 'Phổ Biến',
    spicy: 'Tùy chọn cay'
  },
  {
    id: 'ck-3',
    name: 'Gà Cay Giòn Sốt Bí Truyền',
    category: 'chicken',
    price: 40000,
    oldPrice: 46000,
    desc: 'Miếng gà giòn phủ bột ớt cay nồng đậm vị Philippines, kích thích vị giác.',
    image: 'assets/chicken_spicy.jpg',
    badge: 'Hot Trend',
    spicy: 'Cay đậm đà'
  },
  {
    id: 'ck-4',
    name: 'Gà Sốt Cay Phô Mai Tan Chảy',
    category: 'chicken',
    price: 45000,
    oldPrice: 52000,
    desc: 'Gà giòn cay đẫm xốt ớt cay ngọt phủ ngập sốt kem phô mai Cheddar béo bùi.',
    image: 'assets/chicken_cheese.jpg',
    badge: 'Mới Ra Mắt',
    spicy: 'Cay phô mai'
  },
  {
    id: 'ck-5',
    name: 'Xô Gà Giòn Vui Vẻ (4 Miếng)',
    category: 'chicken',
    price: 139000,
    oldPrice: 160000,
    desc: 'Xô 4 miếng gà giòn rụm tuyệt hảo cho cặp đôi hoặc nhóm bạn nhỏ.',
    image: 'assets/chicken_bucket_4pc.jpg',
    badge: 'Tiết Kiệm',
    spicy: 'Tùy chọn cay'
  },
  {
    id: 'ck-6',
    name: 'Xô Gà Giòn Đại Tiệc (6 Miếng)',
    category: 'chicken',
    price: 199000,
    oldPrice: 240000,
    desc: 'Xô đại tiệc 6 miếng giòn rụm thơm lừng, da giòn rôm rốp cho cả gia đình no nê.',
    image: 'assets/chicken.jpg',
    badge: 'Siêu Ưu Đãi',
    spicy: 'Tùy chọn cay'
  },
  {
    id: 'ck-7',
    name: 'Gà Không Xương Giòn Tan (Tenders)',
    category: 'chicken',
    price: 42000,
    oldPrice: 48000,
    desc: '3 miếng thịt ức gà mềm không xương chiên giòn tan chấm sốt mật ong mù tạt.',
    image: 'assets/chicken_tenders.jpg',
    badge: 'Món Hot',
    spicy: 'Không cay'
  },

  // --- NHÓM 2: MÌ Ý JOLLY ---
  {
    id: 'sp-1',
    name: 'Mì Ý Chick Sốt Bò Bằm',
    category: 'spaghetti',
    price: 45000,
    oldPrice: 52000,
    desc: 'Mì Ý chuẩn vị ngon với sốt thịt bò bằm ngọt thơm, xúc xích và phô mai phủ ngập tràn.',
    image: 'assets/spaghetti.jpg',
    badge: 'Yêu Thích Nhất',
    spicy: 'Không cay'
  },
  {
    id: 'sp-2',
    name: 'Mì Ý Chick Kèm 1 Miếng Gà Giòn',
    category: 'spaghetti',
    price: 75000,
    oldPrice: 85000,
    desc: 'Sự kết hợp hoàn hảo giữa đĩa Mì Ý thơm béo và 1 miếng Gà Giòn Vui Vẻ rụm rã.',
    image: 'assets/spaghetti_chicken.jpg',
    badge: 'Combo Đỉnh',
    spicy: 'Tùy chọn cay'
  },
  {
    id: 'sp-3',
    name: 'Mì Ý Chick Xúc Xích Double Phô Mai',
    category: 'spaghetti',
    price: 55000,
    oldPrice: 65000,
    desc: 'Gấp đôi xúc xích lát và ngập tràn phô mai béo ngậy tan chảy cho tín đồ mê cheese.',
    image: 'assets/spaghetti.jpg',
    badge: 'Extra Cheese',
    spicy: 'Không cay'
  },
  {
    id: 'sp-4',
    name: 'Khay Mì Ý Gia Đình (Pan Spaghetti)',
    category: 'spaghetti',
    price: 159000,
    oldPrice: 190000,
    desc: 'Khay mì Ý khổng lồ khẩu phần 4-5 người ăn thỏa thích trong các buổi tiệc.',
    image: 'assets/spaghetti_pan.jpg',
    badge: 'Tiệc Gia Đình',
    spicy: 'Không cay'
  },

  // --- NHÓM 3: BURGER & CƠM JOLLIBEE ---
  {
    id: 'bg-1',
    name: 'Hamburger Bò Nướng Phô Mai',
    category: 'burger-rice',
    price: 42000,
    oldPrice: 49000,
    desc: 'Bò nướng thơm lừng, sốt kem béo ngậy đặc trưng, phô mai Cheddar kẹp bánh mè nướng.',
    image: 'assets/burger.jpg',
    badge: 'Đặc Biệt',
    spicy: 'Không cay'
  },
  {
    id: 'bg-2',
    name: 'Double Hamburger Siêu Thịt Bò',
    category: 'burger-rice',
    price: 65000,
    oldPrice: 75000,
    desc: 'Gấp đôi 2 lớp thịt bò nướng thơm phức, 2 lớp phô mai cheddar tan chảy thỏa mãn cơn đói.',
    image: 'assets/burger_double.jpg',
    badge: 'Siêu No',
    spicy: 'Không cay'
  },
  {
    id: 'rc-1',
    name: 'Cơm Gà Giòn Vui Vẻ Sốt Cay',
    category: 'burger-rice',
    price: 49000,
    oldPrice: 58000,
    desc: '1 miếng Gà Giòn thơm lừng ăn kèm cơm trắng hạt dẻo thơm và nước sốt Cay độc quyền.',
    image: 'assets/rice.jpg',
    badge: 'Bữa Trưa Chuẩn',
    spicy: 'Tùy chọn cay'
  },
  {
    id: 'rc-2',
    name: 'Cơm Bò Nướng Phô Mai Sốt Tiêu',
    category: 'burger-rice',
    price: 52000,
    oldPrice: 60000,
    desc: 'Miếng thịt bò bằm nướng thơm mềm phủ sốt tiêu đen đậm đà và phô mai thơm ngậy.',
    image: 'assets/rice_beef.jpg',
    badge: 'Đậm Đà',
    spicy: 'Cay nhẹ'
  },

  // --- NHÓM 4: MÓN KÈM & ĂN VẶT ---
  {
    id: 'sd-1',
    name: 'Khoai Tây Chiên Vàng Giòn (Lớn)',
    category: 'sides',
    price: 28000,
    oldPrice: 34000,
    desc: 'Khoai tây cắt lát nhập khẩu chiên vàng rụm, rắc chút muối giòn xốp bên ngoài, mềm bên trong.',
    image: 'assets/feast.jpg',
    badge: 'Ăn Vặt',
    spicy: 'Không cay'
  },
  {
    id: 'sd-2',
    name: 'Khoai Tây Lắc Phô Mai Béo Ngậy',
    category: 'sides',
    price: 32000,
    oldPrice: 38000,
    desc: 'Khoai tây chiên nóng hổi lắc đều bột phô mai mằn mặn béo ngậy thơm lừng.',
    image: 'assets/fries_cheese.jpg',
    badge: 'Gây Nghiện',
    spicy: 'Phô mai'
  },
  {
    id: 'sd-3',
    name: 'Gà Popcorn Lắc Cay Giòn Rụm',
    category: 'sides',
    price: 35000,
    oldPrice: 42000,
    desc: 'Những viên gà viên chiên giòn tan cắn ngập miệng kèm bột lắc cay.',
    image: 'assets/popcorn_chicken.jpg',
    badge: 'Snack Vui',
    spicy: 'Cay nhẹ'
  },

  // --- NHÓM 5: TRÁNG MIỆNG & NƯỚC ---
  {
    id: 'ds-1',
    name: 'Bánh Pie Xoài Đào Giòn Rụm',
    category: 'dessert',
    price: 22000,
    oldPrice: 28000,
    desc: 'Vỏ bánh chiên phồng xốp giòn tan, nhân xoài đào chua ngọt ấm nóng thơm nức mũi.',
    image: 'assets/dessert.jpg',
    badge: 'Signature',
    spicy: 'Tráng miệng'
  },
  {
    id: 'ds-2',
    name: 'Bánh Pie Chuối Socola Nóng',
    category: 'dessert',
    price: 24000,
    oldPrice: 30000,
    desc: 'Lớp nhân chuối ngọt tự nhiên kết hợp cùng sốt socola béo ngậy ấm áp.',
    image: 'assets/pie_chocolate.jpg',
    badge: 'Món Mới',
    spicy: 'Tráng miệng'
  },
  {
    id: 'ds-3',
    name: 'Trà Đào Hạt Chia Mát Lạnh',
    category: 'dessert',
    price: 25000,
    oldPrice: 30000,
    desc: 'Trà đào sảng khoái với miếng đào giòn ngọt và hạt chia bổ dưỡng giải nhiệt tức thì.',
    image: 'assets/dessert.jpg',
    badge: 'Giải Nhiệt',
    spicy: 'Nước uống'
  },
  {
    id: 'ds-4',
    name: 'Cola Tươi Mát Lạnh Cỡ Lớn',
    category: 'dessert',
    price: 18000,
    oldPrice: 22000,
    desc: 'Ly nước ngọt có ga mát lạnh sảng khoái giúp kích thích trọn vẹn vị giác.',
    image: 'assets/drink_pepsi.jpg',
    badge: 'Nước ngọt',
    spicy: 'Nước uống'
  },

  // --- NHÓM 6: COMBO TIẾT KIỆM ---
  {
    id: 'cb-0',
    name: 'Combo Học Sinh - Sinh Viên 49k',
    category: 'combo',
    price: 49000,
    oldPrice: 65000,
    desc: '1 Mì Ý Sốt Bò Bằm + 1 Pepsi mát lạnh. Siêu rẻ siêu no cho bạn trẻ.',
    image: 'assets/combo_student.jpg',
    badge: 'Giá Siêu Tốt',
    spicy: 'Không cay'
  },
  {
    id: 'cb-1',
    name: 'Combo 1 người Vui Vẻ',
    category: 'combo',
    price: 79000,
    oldPrice: 95000,
    desc: '1 Gà Giòn + 1 Khoai tây chiên vừa + 1 Pepsi mát lạnh cho bữa trưa nhanh gọn.',
    image: 'assets/chicken_1pc.jpg',
    badge: 'Bán Chạy',
    spicy: 'Tùy chọn cay'
  },
  {
    id: 'cb-2',
    name: 'Combo 2 Người Vui Vẻ',
    category: 'combo',
    price: 139000,
    oldPrice: 165000,
    desc: '2 Gà Giòn + 1 Mì Ý Jolly + 1 Bánh Pie Xoài Đào + 2 Pepsi tươi mát.',
    image: 'assets/combo_couple.jpg',
    badge: 'Ưu Đãi Đôi',
    spicy: 'Tùy chọn cay'
  },
  {
    id: 'cb-3',
    name: 'Combo Gia Đình (4 Người)',
    category: 'combo',
    price: 219000,
    oldPrice: 270000,
    desc: '4 Gà Giòn + 2 Mì Ý Jolly + 1 Khoai Lắc Phô Mai + 4 Bánh Pie + 4 Pepsi.',
    image: 'assets/feast.jpg',
    badge: 'Tiệc Gia Đình',
    spicy: 'Tùy chọn cay'
  }
];

// Danh sách các chi nhánh cửa hàng Jollibee tiêu biểu
const STORES = [
  { name: 'Chưa có cửa hàng nào cả😓😓'},

];

// Định dạng tiền tệ Việt Nam Đồng (vd: 35000 -> 35.000₫)
function formatVND(amount) {
  return amount.toLocaleString('vi-VN') + '₫';
}

// Hiển thị thông báo Toast góc màn hình
function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `<i class="fa-solid fa-bell text-brand-gold"></i> <span>${message}</span>`;
  container.appendChild(toast);

  // Tự động mờ dần và xóa sau 3.5 giây
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}


// ==========================================================================
// 4. ĐIỀU HƯỚNG TỰ ĐỘNG SÁNG VÀNG & SCROLL SPY (RESPONSIVE PC & MOBILE)
// Khi bấm hoặc cuộn trang đến đâu, mục menu tương ứng sẽ tự động phát sáng vàng
// ==========================================================================
function setupNavLinksAndScrollSpy() {
  const desktopNavLinks = document.querySelectorAll('#nav-menu .nav-link');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item[data-section]');

  // Xử lý khi bấm nút trên Navbar PC
  desktopNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      playSound('pop');
      desktopNavLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Xử lý khi bấm nút trên Thanh điều hướng Mobile
  mobileNavItems.forEach(item => {
    item.addEventListener('click', () => {
      playSound('pop');
      mobileNavItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Kỹ thuật Scroll Spy: Theo dõi vị trí cuộn để tự động kích hoạt nav-link tương ứng
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
      // Đồng bộ trạng thái active trên cả PC và Mobile
      desktopNavLinks.forEach(link => {
        if (link.getAttribute('data-section') === currentSectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      mobileNavItems.forEach(item => {
        if (item.getAttribute('data-section') === currentSectionId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    // Hiệu ứng làm mờ nền navbar khi cuộn xuống
    const nav = document.getElementById('navbar');
    if (window.scrollY > 40) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  });
}

// ==========================================================================
// 5. RENDER DANH SÁCH THỰC ĐƠN (MENU RENDERING & FILTERING)
// Hiển thị lưới món ăn dạng Card với đầy đủ hình ảnh, giá tiền, tùy chỉnh
// ==========================================================================
function renderMenu(filterCat = 'all', searchQuery = '') {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  // Lọc theo danh mục hoặc từ khóa tìm kiếm
  const filtered = MENU_ITEMS.filter(item => {
    const matchCategory = (filterCat === 'all') || (item.category === filterCat);
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Nếu không tìm thấy món ăn
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 px-4">
        <i class="fa-solid fa-magnifying-glass text-4xl text-[#8E8B9D] mb-3"></i>
        <h3 class="text-white font-bold text-base mb-1">Không tìm thấy món ăn phù hợp!</h3>
        <p class="text-xs text-[#8E8B9D]">Hãy thử tìm từ khóa khác hoặc chọn danh mục khác nhé.</p>
      </div>
    `;
    return;
  }

  // Render các Card món ăn
  grid.innerHTML = filtered.map(item => `
    <div class="food-card flex flex-col overflow-hidden group">
      <!-- Ảnh món ăn & Huy hiệu -->
      <div class="food-card-img-wrap relative w-full overflow-hidden bg-[#110e17]">
        <img src="${item.image}" alt="${item.name}" class="food-img w-full h-full object-cover transition-transform duration-500" loading="lazy">
        ${item.badge ? `<span class="absolute top-2.5 left-2.5 bg-[#0E0C12]/85 backdrop-blur-sm border border-white/10 text-brand-gold text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow flex items-center gap-1"><i class="fa-solid fa-sparkles"></i> ${item.badge}</span>` : ''}
        ${item.spicy ? `<span class="absolute top-2.5 right-2.5 bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">${item.spicy}</span>` : ''}
      </div>

      <!-- Thông tin chi tiết món ăn -->
      <div class="p-4 flex flex-col flex-1">
        <h3 class="font-heading font-bold text-sm sm:text-base text-white mb-1 group-hover:text-brand-gold transition">${item.name}</h3>
        <p class="text-xs text-[#8E8B9D] leading-relaxed mb-3 line-clamp-2 flex-1">${item.desc}</p>
        
        <!-- Giá tiền & Nút Thao tác -->
        <div class="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
          <div class="font-heading font-black text-base sm:text-lg text-brand-gold">${formatVND(item.price)}</div>
          <div class="flex items-center gap-1.5">
            <button type="button" class="bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1 transition" onclick="openItemModal('${item.id}')">
              <i class="fa-solid fa-sliders text-[10px]"></i> Tùy chọn
            </button>
            <button type="button" class="w-8 h-8 rounded-full bg-brand-red hover:bg-brand-redLight text-white flex items-center justify-center text-xs shadow-md transition-transform active:scale-95" title="Thêm ngay vào giỏ" onclick="quickAddToCart('${item.id}')">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Bắt sự kiện chuyển Tab danh mục
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playSound('pop');
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active', 'bg-brand-red', 'text-white');
      b.classList.add('bg-[#17141E]', 'text-[#C9C7D4]');
    });
    btn.classList.add('active', 'bg-brand-red', 'text-white');
    btn.classList.remove('bg-[#17141E]', 'text-[#C9C7D4]');
    
    const category = btn.getAttribute('data-category');
    const searchVal = document.getElementById('menu-search-input')?.value || '';
    renderMenu(category, searchVal);
  });
});

// Bắt sự kiện gõ tìm kiếm thời gian thực
document.getElementById('menu-search-input')?.addEventListener('input', (e) => {
  const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-category') || 'all';
  renderMenu(activeTab, e.target.value);
});

// ==========================================================================
// 6. MODAL TÙY BIẾN MÓN ĂN (ITEM CUSTOMIZER MODAL)
// Cho phép chọn độ cay, thêm sốt phô mai, upsize nước ngọt và ghi chú cho bếp
// ==========================================================================
function openItemModal(itemId) {
  const item = MENU_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  playSound('pop');
  state.currentItemInModal = item;
  state.modalQty = 1;

  // Cập nhật giao diện modal
  document.getElementById('modal-item-img').src = item.image;
  document.getElementById('modal-item-name').innerText = item.name;
  document.getElementById('modal-item-desc').innerText = item.desc;
  document.getElementById('modal-item-price').innerText = formatVND(item.price);
  document.getElementById('modal-item-cat').innerText = item.badge || 'Jollibee Đặc Sản';
  document.getElementById('modal-item-qty').innerText = '1';
  document.getElementById('modal-item-note').value = '';
  document.getElementById('add-cheese').checked = false;
  document.getElementById('add-upsize').checked = false;

  updateModalTotal();

  // Hiển thị modal
  const overlay = document.getElementById('item-modal-overlay');
  overlay.classList.remove('opacity-0', 'pointer-events-none');
  overlay.classList.add('opacity-100', 'pointer-events-auto');
}

function closeItemModal() {
  playSound('pop');
  const overlay = document.getElementById('item-modal-overlay');
  overlay.classList.add('opacity-0', 'pointer-events-none');
  overlay.classList.remove('opacity-100', 'pointer-events-auto');
  state.currentItemInModal = null;
}

// Thay đổi số lượng món trong modal (+ / -)
function changeModalQty(delta) {
  const newQty = state.modalQty + delta;
  if (newQty >= 1 && newQty <= 20) {
    playSound('tick');
    state.modalQty = newQty;
    document.getElementById('modal-item-qty').innerText = newQty;
    updateModalTotal();
  }
}

// Tính toán lại tổng tiền trong modal khi chọn thêm topping
function updateModalTotal() {
  if (!state.currentItemInModal) return;
  let base = state.currentItemInModal.price;
  if (document.getElementById('add-cheese').checked) base += 10000;
  if (document.getElementById('add-upsize').checked) base += 8000;
  
  const total = base * state.modalQty;
  document.getElementById('modal-calculated-total').innerText = formatVND(total);
}

document.getElementById('add-cheese')?.addEventListener('change', updateModalTotal);
document.getElementById('add-upsize')?.addEventListener('change', updateModalTotal);

// Xác nhận thêm món đã tùy biến vào giỏ hàng
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

// Thêm nhanh món ăn mặc định vào giỏ hàng (1-Click Add)
function quickAddToCart(itemId) {
  const item = MENU_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  addToCart({
    id: item.id + '-' + Date.now(),
    name: item.name,
    image: item.image,
    price: item.price,
    qty: 1,
    options: 'Mặc định'
  });

  showToast(`Đã thêm <strong>${item.name}</strong> vào giỏ hàng!`);
}

// Thêm nhanh gói Combo Party đại tiệc
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

// ==========================================================================
// 7. QUẢN LÝ GIỎ HÀNG & TÍNH TIỀN (CART SYSTEM & BILLING)
// Thêm bớt số lượng, tính phí ship và mô phỏng đặt hàng
// ==========================================================================
function addToCart(cartItem) {
  playSound('add');
  state.cart.push(cartItem);
  updateCartUI();

  // Kích hoạt phản hồi vui vẻ từ Linh vật JolliBot
  triggerMascotReaction(`😋 Oa! Bạn vừa thêm món <strong>${cartItem.name}</strong> ngon tuyệt! Tiếp tục chọn thêm món nhé!`);
}

function updateCartUI() {
  const countBadgeDesktop = document.getElementById('cart-count');
  const countBadgeMobile = document.getElementById('cart-count-mobile');
  const countDrawer = document.getElementById('cart-drawer-count');
  const navTotal = document.getElementById('cart-total-nav');
  const itemsList = document.getElementById('cart-items-list');
  const footer = document.getElementById('cart-footer');

  const totalItemsCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  if (countBadgeDesktop) countBadgeDesktop.innerText = totalItemsCount;
  if (countBadgeMobile) countBadgeMobile.innerText = totalItemsCount;
  if (countDrawer) countDrawer.innerText = totalItemsCount;

  // Nếu giỏ hàng trống
  if (state.cart.length === 0) {
    if (itemsList) {
      itemsList.innerHTML = `
        <div class="text-center py-12 px-4 flex flex-col items-center">
          <img src="assets/mascot.jpg" alt="Giỏ trống" class="w-20 h-20 rounded-full border-2 border-dashed border-brand-gold mb-3 object-cover">
          <h4 class="font-heading font-bold text-white text-base mb-1">Giỏ hàng của bạn đang trống!</h4>
          <p class="text-xs text-[#8E8B9D] mb-4">Hãy chọn những món Gà Giòn và Mì Ý thơm ngon để lấp đầy chiếc bụng đói nhé!</p>
          <button type="button" class="bg-brand-red text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-brand-redLight transition" onclick="toggleCartDrawer(false); scrollToMenu();">Xem Thực Đơn Ngay</button>
        </div>
      `;
    }
    if (footer) footer.style.display = 'none';
    if (navTotal) navTotal.innerText = '0₫';
    return;
  }

  if (footer) footer.style.display = 'block';

  // Render danh sách các món trong giỏ hàng
  if (itemsList) {
    itemsList.innerHTML = state.cart.map((item, index) => `
      <div class="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl p-3">
        <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-xl object-cover">
        <div class="flex-1 min-w-0">
          <h4 class="font-heading font-bold text-xs sm:text-sm text-white truncate">${item.name}</h4>
          ${item.options ? `<div class="text-[10px] text-brand-gold truncate">${item.options}</div>` : ''}
          <div class="font-heading font-black text-xs text-brand-gold mt-0.5">${formatVND(item.price)}</div>
        </div>
        <div class="flex items-center gap-1.5 bg-white/5 rounded-full p-1 border border-white/5">
          <button type="button" class="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] hover:bg-brand-red" onclick="updateCartItemQty(${index}, -1)">-</button>
          <span class="font-bold text-xs text-white min-w-4 text-center">${item.qty}</span>
          <button type="button" class="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] hover:bg-brand-red" onclick="updateCartItemQty(${index}, 1)">+</button>
        </div>
      </div>
    `).join('');
  }

  // Tính toán tổng tiền và phí vận chuyển
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shipping = subtotal > 0 ? 15000 : 0;
  const finalTotal = subtotal + shipping;

  const subtotalEl = document.getElementById('bill-subtotal');
  if (subtotalEl) subtotalEl.innerText = formatVND(subtotal);

  const shippingEl = document.getElementById('bill-shipping');
  if (shippingEl) shippingEl.innerText = shipping === 0 ? '0₫' : formatVND(shipping);

  const totalEl = document.getElementById('bill-total');
  if (totalEl) totalEl.innerText = formatVND(finalTotal);

  if (navTotal) navTotal.innerText = formatVND(finalTotal);
}

function updateCartItemQty(index, delta) {
  playSound('tick');
  const item = state.cart[index];
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    state.cart.splice(index, 1);
    showToast('Đã xóa món khỏi giỏ hàng.');
  }
  updateCartUI();
}

// Đóng mở ngăn kéo giỏ hàng (Slide-over Cart Drawer)
function toggleCartDrawer(forceOpen = null) {
  playSound('pop');
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  const isCurrentlyOpen = !drawer.classList.contains('translate-x-full');
  const shouldOpen = forceOpen !== null ? forceOpen : !isCurrentlyOpen;

  if (shouldOpen) {
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100', 'pointer-events-auto');
    drawer.classList.remove('translate-x-full');
  } else {
    overlay.classList.add('opacity-0', 'pointer-events-none');
    overlay.classList.remove('opacity-100', 'pointer-events-auto');
    drawer.classList.add('translate-x-full');
  }
}

document.getElementById('cart-toggle-btn')?.addEventListener('click', () => toggleCartDrawer(true));

// ==========================================================================
// 8. MÔ PHỎNG ĐẶT HÀNG & PHÁO HOA ĂN MỪNG (CHECKOUT CELEBRATION)
// Tạo biên lai hóa đơn và bắn pháo hoa Confetti chúc mừng
// ==========================================================================
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

  // Điền thông tin hóa đơn
  const receipt = document.getElementById('receipt-details');
  receipt.innerHTML = `
    <div class="flex justify-between">
      <span class="text-[#8E8B9D]">Mã đơn hàng:</span>
      <strong class="text-brand-gold font-mono">${orderId}</strong>
    </div>
    <div class="flex justify-between">
      <span class="text-[#8E8B9D]">Thời gian đặt:</span>
      <span class="text-white">${new Date().toLocaleTimeString('vi-VN')} - Hôm nay</span>
    </div>
    <div class="flex justify-between">
      <span class="text-[#8E8B9D]">Số lượng món:</span>
      <span class="text-white">${state.cart.length} món ăn nóng hổi</span>
    </div>
    <div class="flex justify-between">
      <span class="text-[#8E8B9D]">Thời gian giao dự kiến:</span>
      <strong class="text-green-400">~20-25 phút</strong>
    </div>
    <div class="flex justify-between items-baseline pt-2 border-t border-white/10 font-bold">
      <span class="text-white">Tổng thanh toán:</span>
      <strong class="text-brand-gold font-heading text-base">${total}</strong>
    </div>
  `;

  toggleCartDrawer(false);
  
  const overlay = document.getElementById('checkout-modal-overlay');
  overlay.classList.remove('opacity-0', 'pointer-events-none');
  overlay.classList.add('opacity-100', 'pointer-events-auto');

  // Xóa giỏ hàng sau khi đặt thành công
  state.cart = [];
  updateCartUI();
}

function closeCheckoutModal() {
  playSound('pop');
  const overlay = document.getElementById('checkout-modal-overlay');
  overlay.classList.add('opacity-0', 'pointer-events-none');
  overlay.classList.remove('opacity-100', 'pointer-events-auto');
}

// ==========================================================================
// 10. TRÌNH TỰ PHỐI COMBO CÁ NHÂN (CUSTOM COMBO BUILDER - 15% OFF)
// 3 bước chọn Món chính + Món kèm + Nước giải khát
// ==========================================================================
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

function renderComboBuilder() {
  ['main', 'side', 'drink'].forEach(type => {
    const container = document.getElementById(`builder-${type}-options`);
    if (!container) return;

    container.innerHTML = BUILDER_OPTIONS[type].map(opt => `
      <div class="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border ${state.comboBuilder[type]?.id === opt.id ? 'border-brand-gold bg-brand-gold/10' : 'border-white/5 hover:bg-white/5'} cursor-pointer transition" onclick="selectComboOption('${type}', '${opt.id}')">
        <img src="${opt.img}" alt="${opt.name}" class="w-10 h-10 rounded-lg object-cover">
        <div class="flex-1 min-w-0">
          <div class="font-bold text-xs text-white truncate">${opt.name}</div>
          <div class="text-[11px] text-brand-gold font-semibold">${formatVND(opt.price)}</div>
        </div>
        <i class="fa-solid fa-circle-check text-xs ${state.comboBuilder[type]?.id === opt.id ? 'text-brand-gold' : 'text-white/10'}"></i>
      </div>
    `).join('');
  });

  updateComboSummary();
}

function selectComboOption(type, optionId) {
  playSound('pop');
  const option = BUILDER_OPTIONS[type].find(o => o.id === optionId);
  state.comboBuilder[type] = option;
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
    const missing = [];
    if (!main) missing.push('Món chính');
    if (!side) missing.push('Món kèm');
    if (!drink) missing.push('Thức uống');

    summaryList.innerText = `Còn thiếu: ${missing.join(', ')}. Hãy chọn đủ để nhận giảm 15%!`;
    origPriceEl.innerText = '0₫';
    finalPriceEl.innerText = '0₫';
    addBtn.disabled = true;
    addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Vui lòng chọn đủ 3 bước';
  }
}

function addCustomComboToCart() {
  const { main, side, drink } = state.comboBuilder;
  if (!main || !side || !drink) return;

  const rawTotal = main.price + side.price + drink.price;
  const discountedTotal = Math.round(rawTotal * 0.85);

  addToCart({
    id: 'custom-combo-' + Date.now(),
    name: 'Combo Tự Phối Siêu Tiết Kiệm',
    image: main.img,
    price: discountedTotal,
    qty: 1,
    options: `${main.name} + ${side.name} + ${drink.name} (Đã giảm 15%)`
  });

  showToast('Đã thêm Combo Tự Phối của bạn vào giỏ hàng! 🎉');
  toggleCartDrawer(true);
}

// ==========================================================================
// 10. TRỢ LÝ ẢO MASCOT COMPANION (JOLLIBOT AI - TÍCH HỢP DEEPSEEK CHAT)
// Sử dụng DeepSeek API để tư vấn món ăn, combo và phong cách thân thiện
// ==========================================================================

// Cấu hình BeeBot Assistant (Kết nối an toàn qua Backend Python)
const BEEBOT_BACKEND_ENDPOINT = (window.location.protocol === 'http:' || window.location.protocol === 'https:') && window.location.port === '5000'
  ? '/api/chat'
  : 'http://localhost:5000/api/chat';

const DEEPSEEK_CONFIG = {
  endpoint: BEEBOT_BACKEND_ENDPOINT,
  model: 'deepseek-chat',
  systemPrompt: `Bạn là BeeBot - Chú Ong Vui Vẻ 🐝 đại sứ thương hiệu chính thức và là trợ lý ẩm thực AI thông minh của Jollibee Vietnam!
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
- Tư vấn món khéo léo theo đúng ý thích của khách (ăn 1 mình, ăn nhóm, thích cay, tráng miệng ngọt, tìm cửa hàng...).`
};

// Quản lý lịch sử hội thoại nhiều lượt cho AI
let chatConversationHistory = [
  { role: 'system', content: DEEPSEEK_CONFIG.systemPrompt }
];

function toggleCompanionModal() {
  playSound('mascot');
  const modal = document.getElementById('companion-modal');
  modal.classList.toggle('hidden');
  modal.classList.toggle('flex');
  closeCompanionBubble();

  // Tự động cuộn xuống tin nhắn mới nhất khi mở
  const chatMessages = document.getElementById('chat-messages');
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function closeCompanionBubble(e) {
  if (e) e.stopPropagation();
  const bubble = document.getElementById('companion-bubble');
  if (bubble) bubble.style.display = 'none';
}

function triggerMascotReaction(htmlText) {
  const bubble = document.getElementById('companion-bubble');
  const text = document.getElementById('bubble-text');
  if (bubble && text) {
    text.innerHTML = htmlText;
    bubble.style.display = 'block';
    playSound('mascot');
  }
}

function sendQuickPrompt(promptText) {
  const input = document.getElementById('chat-user-input');
  if (input) {
    input.value = promptText;
    handleChatSubmit(new Event('submit'));
  }
}

function showChatTyping(show) {
  const indicator = document.getElementById('chat-typing-indicator');
  const container = document.getElementById('chat-messages');
  if (indicator) {
    if (show) {
      indicator.classList.remove('hidden');
      indicator.classList.add('flex');
    } else {
      indicator.classList.add('hidden');
      indicator.classList.remove('flex');
    }
  }
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function formatAiResponse(rawText) {
  if (!rawText) return '';

  // 1. Chuyển Markdown in đậm **text** sang <strong>
  let formatted = rawText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 2. Chuyển Markdown in nghiêng *text* sang <em>
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 3. Chuyển đổi xuống dòng
  formatted = formatted.replace(/\n/g, '<br>');

  return formatted;
}

async function handleChatSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('chat-user-input');
  const query = input?.value.trim();
  if (!query) return;

  playSound('pop');
  addChatMessage(query, 'user');
  if (input) input.value = '';

  // Thêm tin nhắn của user vào lịch sử AI
  chatConversationHistory.push({ role: 'user', content: query });

  // Giới hạn lịch sử hội thoại tối đa 10 tin gần nhất để tối ưu token
  if (chatConversationHistory.length > 11) {
    chatConversationHistory = [
      chatConversationHistory[0],
      ...chatConversationHistory.slice(-10)
    ];
  }

  // Hiển thị trạng thái đang suy nghĩ
  showChatTyping(true);

  try {
    const response = await fetch(DEEPSEEK_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: chatConversationHistory,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Backend phản hồi lỗi mã: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.reply || data.choices?.[0]?.message?.content;

    if (reply) {
      chatConversationHistory.push({ role: 'assistant', content: reply });
      showChatTyping(false);
      addChatMessage(formatAiResponse(reply), 'bot');
      playSound('mascot');
    } else {
      throw new Error('Không nhận được nội dung phản hồi từ máy chủ');
    }
  } catch (error) {
    console.warn('Lỗi kết nối Backend/DeepSeek API, chuyển sang chế độ phản hồi nội bộ:', error);
    showChatTyping(false);
    
    // Dự phòng phản hồi offline thông minh
    const fallback = generateLocalFallbackReply(query);
    chatConversationHistory.push({ role: 'assistant', content: fallback });
    addChatMessage(fallback, 'bot');
    playSound('mascot');
  }
}

function addChatMessage(content, sender) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const isUser = sender === 'user';
  const msgDiv = document.createElement('div');
  msgDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
  msgDiv.innerHTML = `
    <div class="${isUser ? 'bg-brand-red text-white' : 'bg-white/10 border border-white/10 text-white'} rounded-2xl ${isUser ? 'rounded-br-xs' : 'rounded-bl-xs'} p-3 max-w-[85%] leading-relaxed text-xs shadow-sm">
      ${content}
    </div>
  `;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function generateLocalFallbackReply(text) {
  const lower = text.toLowerCase();

  if (lower.includes('1 người') || lower.includes('một mình') || lower.includes('độc thân')) {
    return `🍗 Cho 1 người ăn thì đỉnh nhất là <strong>Combo Solo Vui Vẻ</strong> (79.000₫) hoặc <strong>Combo Học Sinh Sinh Viên</strong> (49.000₫), hoặc 1 phần <strong>Mì Ý Jolly Kèm Gà Giòn</strong> 75.000₫ nha!`;
  }
  if (lower.includes('nhóm') || lower.includes('bạn bè') || lower.includes('gia đình') || lower.includes('party')) {
    return `🎉 Đi ăn nhóm đông người thì không thể bỏ qua <strong>Combo Jolli Party</strong> (249k) hoặc <strong>Combo Gia Đình 4 Người</strong> (219k) nhé!`;
  }
  if (lower.includes('mã') || lower.includes('voucher') || lower.includes('khuyến mãi') || lower.includes('giảm giá') || lower.includes('code') || lower.includes('tiết kiệm')) {
    return `🎁 Hiện tại Jollibee đang có ưu đãi <strong>giảm ngay 15%</strong> khi bạn dùng tính năng <strong>Tự Phối Combo</strong> và nhiều combo tiết kiệm trong thực đơn nhé!`;
  }
  if (lower.includes('cay') || lower.includes('gà cay')) {
    return `🌶️ Món cay ngon nhất chính là <strong>Gà Cay Giòn Sốt Bí Truyền</strong> và <strong>Gà Sốt Cay Phô Mai</strong>! Đậm vị và siêu giòn rụm luôn!`;
  }
  if (lower.includes('tráng miệng') || lower.includes('ngọt') || lower.includes('pie') || lower.includes('đào')) {
    return `🥭 Hãy thử ngay <strong>Bánh Pie Xoài Đào</strong> hoặc <strong>Bánh Pie Chuối Socola Nóng</strong> ăn kèm <strong>Trà Đào Hạt Chia</strong> mát lạnh nhé!`;
  }
  if (lower.includes('cửa hàng') || lower.includes('ở đâu') || lower.includes('địa chỉ')) {
    return `📍 Jollibee có hơn 150+ cửa hàng trên khắp Việt Nam. Bạn hãy bấm vào nút <strong>"Cửa Hàng"</strong> ở thanh menu trên cùng để xem chi tiết!`;
  }
  if (lower.includes('chào') || lower.includes('hi') || lower.includes('hello')) {
    return `🐝 Xin chào bạn yêu quý! Mình là JolliBot luôn sẵn sàng phục vụ bạn những món Gà Giòn nóng hổi và thơm ngon nhất hôm nay! 💛`;
  }

  return `😋 Mọi món ăn tại Jollibee từ Gà Giòn, Mì Ý, Cơm Gà đến Burger đều chuẩn vị thơm ngon. Bạn hãy thử kéo xuống mục <strong>"Tự Phối Combo"</strong> để tự tạo bữa ăn và giảm 15% nhé!`;
}

// ==========================================================================
// 13. TRA CỨU CỬA HÀNG (STORE LOCATOR MODAL)
// ==========================================================================
function openStoreModal() {
  playSound('pop');
  renderStores(STORES);
  const overlay = document.getElementById('store-modal-overlay');
  overlay.classList.remove('opacity-0', 'pointer-events-none');
  overlay.classList.add('opacity-100', 'pointer-events-auto');
}

function closeStoreModal() {
  playSound('pop');
  const overlay = document.getElementById('store-modal-overlay');
  overlay.classList.add('opacity-0', 'pointer-events-none');
  overlay.classList.remove('opacity-100', 'pointer-events-auto');
}

function renderStores(list) {
  const container = document.getElementById('store-list');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `<p class="text-[#8E8B9D] text-center py-4">Không tìm thấy cửa hàng phù hợp.</p>`;
    return;
  }

  container.innerHTML = list.map(store => `
    <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-3 space-y-1">
      <h4 class="font-heading font-bold text-brand-gold text-xs sm:text-sm"><i class="fa-solid fa-store mr-1"></i> ${store.name}</h4>
      <p class="text-[#8E8B9D] text-[11px]"><i class="fa-solid fa-location-dot mr-1"></i> ${store.address}</p>
      <p class="text-white text-[11px]"><i class="fa-solid fa-phone mr-1 text-brand-gold"></i> Hotline: <strong class="text-brand-gold">${store.phone}</strong></p>
    </div>
  `).join('');
}

function filterStores(query) {
  const filtered = STORES.filter(s => 
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.address.toLowerCase().includes(query.toLowerCase())
  );
  renderStores(filtered);
}

document.getElementById('store-locator-btn')?.addEventListener('click', openStoreModal);

// ==========================================================================
// 14. ĐỒNG HỒ ĐẾM NGƯỢC FLASH SALE (REALTIME COUNTDOWN TIMER)
// ==========================================================================
function startFlashSaleTimer() {
  let totalSeconds = 2 * 3600 + 45 * 60 + 18;
  const hEl = document.getElementById('flash-hours');
  const mEl = document.getElementById('flash-minutes');
  const sEl = document.getElementById('flash-seconds');

  setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hEl) hEl.innerText = String(hours).padStart(2, '0');
      if (mEl) mEl.innerText = String(minutes).padStart(2, '0');
      if (sEl) sEl.innerText = String(seconds).padStart(2, '0');
    }
  }, 1000);
}

function scrollToMenu() {
  document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================================================
// 15. KHỞI TẠO ỨNG DỤNG KHI TRANG TẢI XONG (APP INITIALIZATION)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  renderComboBuilder();
  startFlashSaleTimer();
  setupNavLinksAndScrollSpy();

  // Hiển thị gợi ý của Linh vật sau 3 giây
  setTimeout(() => {
    const bubble = document.getElementById('companion-bubble');
    if (bubble) bubble.style.display = 'block';
  }, 3000);
});
