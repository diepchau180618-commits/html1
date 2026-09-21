# 🍔 HƯỚNG DẪN CHẠY & GIẢI THÍCH MÃ NGUỒN JOLLIBEE SHOWCASE 🐝

## 🚀 Cách Chạy Dự Án (Bảo Mật API Key với Backend Python)

### 1. Cài đặt thư viện Python (Chỉ cần chạy 1 lần đầu tiên)
```powershell
pip install -r requirements.txt
```

### 2. Cấu hình biến môi trường `.env`
Đảm bảo file `.env` tại thư mục gốc có chứa API key của bạn:
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
PORT=5000
```
> [!TIP]
> Tệp `.env` đã được cấu hình trong `.gitignore`, do đó bạn có thể yên tâm commit mã nguồn lên GitHub mà không sợ bị lộ API key.

### 3. Khởi chạy hệ thống

**Cách 1: Nhấp đúp chuột vào file `start_server.bat` (Khuyên dùng)**
- File batch sẽ tự động khởi động Backend Flask và mở trình duyệt tại: **`http://localhost:5000`**

**Cách 2: Chạy bằng dòng lệnh Terminal**
```powershell
python backend/app.py
```
Sau đó truy cập trình duyệt: **`http://localhost:5000`** (hoặc `http://127.0.0.1:5000`).

---

## 📱 Kỹ Thuật Tối Ưu Responsive Riêng Cho Mobile & Desktop

### 1. Giao Diện Dành Riêng Cho Mobile (Màn hình điện thoại):
- **Thanh Điều Hướng Đáy Màn Hình (Mobile Bottom Navigation Bar)**: Cố định ở đáy (`fixed bottom-0 left-0 right-0`), chuẩn thao tác ngón tay cái gồm các nút: *Trang Chủ, Thực Đơn, Phối Combo, JolliBot AI, Giỏ Hàng (kèm Badge số lượng)*.
- **Thanh Cuộn Danh Mục Ngang (Horizontal Scroll Tabs)**: Vuốt ngang mượt mà, ẩn thanh cuộn thô cứng (`scrollbar-none`).
- **Lưới Món Ăn 1 Cột Tinh Gọn**: Dễ dàng xem chi tiết hình ảnh món ăn trên màn hình hẹp.
- **Mascot Linh Vật Nổi Thu Gọn**: Nằm cách đáy 80px để không đè lên thanh điều hướng di động.

### 2. Giao Diện Dành Cho Desktop / PC (Màn hình lớn):
- **Header Kính Mờ Sticky Glassmorphism**: Thanh menu nổi trên cùng với hiệu ứng phát sáng vàng tự động khi cuộn chuột (**Scroll Spy**), thiết kế tinh gọn và tập trung vào trải nghiệm đặt món.
- **Lưới Món Ăn 3 - 4 Cột Hiện Đại**: Hiệu ứng phóng to và đổ bóng ánh kim (`hover:-translate-y-1.5`, `shadow-[0_0_20px_rgba(255,192,0,0.15)]`).
- **Ngăn Kéo Giỏ Hàng Trượt (Slide-over Drawer)**: Trượt êm ái từ cạnh phải màn hình sang với hiệu ứng mờ nền, hiển thị hóa đơn rõ ràng, trực quan.

---

## 🧠 Giải Thích Ý Nghĩa Từng Khối Lập Trình Trong Mã Nguồn

| Khối Mã Nguồn | Chức Năng & Ý Nghĩa Chi Tiết |
| :--- | :--- |
| **`backend/app.py`** | **Proxy API DeepSeek bảo mật**: Nhận yêu cầu từ frontend, đọc `DEEPSEEK_API_KEY` từ `.env` trên máy chủ và gọi DeepSeek Chat an toàn. Hỗ trợ CORS cho frontend. |
| **`const state = { ... }`** | **Quản lý trạng thái toàn cục**: Lưu trữ mảng giỏ hàng, 3 bước lựa chọn phối combo và trạng thái modal tùy biến. |
| **`function playSound(type)`** | **Hệ thống âm thanh Web Audio API**: Tự động tổng hợp tần số nốt nhạc (Đô, Mi, Sol) để tạo âm thanh nhấp chuột, thêm giỏ, pháo hoa mà không phụ thuộc vào file MP3 ngoài. |
| **`function setupNavLinksAndScrollSpy()`** | **Tự động sáng vàng menu**: Theo dõi vị trí cuộn trang bằng `scrollY` và cập nhật class `.active` (phát sáng vàng gold) đồng thời trên cả PC Header và Mobile Bottom Bar. |
| **`function renderMenu()`** | **Hiển thị thực đơn**: Lọc và hiển thị hơn 22 món ăn theo danh mục hoặc từ khóa tìm kiếm theo thời gian thực (Live Search). |
| **`function openItemModal()`** | **Tùy biến món ăn**: Mở popup cho khách chọn độ cay (*Nguyên vị / Cay giòn*), thêm sốt phô mai, upsize nước và ghi chú cho đầu bếp. |
| **`function updateCartUI()`** | **Tính toán hóa đơn trực quan**: Tính tổng tiền món ăn (tạm tính), phí vận chuyển và cập nhật toàn bộ số lượng trên giao diện một cách minh bạch, chính xác. |
| **`function renderComboBuilder()`** | **Tự phối combo 15%**: Giao diện trực quan cho phép khách hàng tự chọn 3 bước (Món chính + Món kèm + Nước) và tự động tính toán chiết khấu 15%. |
| **`handleChatSubmit()` & `DEEPSEEK_CONFIG`** | **Trợ lý Ảo JolliBot / BeeBot AI**: Gọi an toàn qua backend `/api/chat`, giữ nguyên vẹn `systemPrompt` về thực đơn Jollibee, ghi nhớ ngữ cảnh hội thoại, tự động fallback phản hồi thông minh nếu mất mạng. |
