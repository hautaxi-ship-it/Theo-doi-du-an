# HỆ THỐNG QUẢN TRỊ ĐƠN HÀNG & SẢN XUẤT KHỐI CƠ KHÍ & THIẾT BỊ CHUYÊN DỤNG (THCK - TBCD - NMK)

Hệ thống quản trị điều hành sản xuất tập trung hiện đại, hỗ trợ toàn bộ vòng đời đơn hàng lớn từ tiếp nhận PO, thẩm định hồ sơ kỹ thuật, cân đối vật tư (BOM/PR) đến phân bổ **Lệnh sản xuất (MO)** và điều phối **Đơn hàng nội bộ (IO)** liên kết chặt chẽ giữa 3 nhà máy:
* **THCK**: Nhà máy Tổ hợp Cơ khí
* **TBCD**: Nhà máy Thiết bị Chuyên dụng
* **NMK**: Nhà máy Khuôn & Đồ gá

---

## 🚀 CÔNG NGHỆ CỐT LÕI

* **Framework**: Next.js 14 (App Router, Server & Client Components)
* **Ngôn ngữ**: TypeScript
* **Giao diện & Styling**: Tailwind CSS, Lucide React Icons, shadcn/ui design patterns
* **Cơ sở dữ liệu & Xác thực**: Firebase SDK (Firebase Auth: Email/Google & Cloud Firestore)
* **Cơ chế Fallback thông minh**: Tự động kích hoạt bộ **Mock Data & Local Storage** đa dạng, chân thực khi chưa điền Firebase API Key, giúp hệ thống luôn sẵn sàng chạy và kiểm thử ngay lập tức mà không cần cấu hình trước.

---

## 🏗️ CẤU TRÚC PHÂN CẤP ĐƠN HÀNG

```
├── Loại hình: XUẤT KHẨU
│   └── Thị trường: Mỹ, Úc, Châu Âu, Châu Á & thị trường khác
│       └── Khách hàng (vd: Great Dane, MaxiTRANS, Schmitz Cargobull...)
│           └── Đơn hàng (PO)
│               ├── Lệnh sản xuất 1 (Gán THCK / TBCD / NMK)
│               ├── Lệnh sản xuất 2
│               └── Đơn hàng nội bộ (BẮT BUỘC gắn Đơn khách hoặc LSX)
│
└── Loại hình: TRONG NƯỚC
    └── Miền: Miền Nam, Miền Bắc, Miền Trung
        └── Khách hàng (vd: Cảng Sài Gòn, URENCO Hà Nội, VinFast...)
            └── Đơn hàng (PO)
                └── Chuỗi Lệnh sản xuất & Đơn nội bộ
```

### 🔒 Quy tắc Nghiêm ngặt về Đơn Hàng Nội Bộ (Internal Orders - IO):
* Không cho phép tạo đơn nội bộ "mồ côi" không có nguồn gốc.
* Mọi đơn nội bộ bắt buộc phải chọn liên kết với **Đơn hàng khách gốc** hoặc **Lệnh sản xuất**, giúp Ban Lãnh đạo và Kế hoạch khối nhìn thấy toàn bộ chuỗi phụ thuộc và điểm nghẽn.
* Khi đơn nội bộ bị chậm tiến độ (ví dụ NMK chậm giao khuôn dập), hệ thống tự động cảnh báo nguy cơ trễ hạn trên Đơn hàng khách liên quan.

---

## 📋 CÁC MODULE VÀ MÀN HÌNH CHÍNH

1. **Dashboard Tổng quan**:
   * Thẻ KPI: Đơn đang chạy, Đơn trễ hạn, PR chờ duyệt, Bất cập chưa xử lý, Đơn nội bộ đang mở.
   * Biểu đồ trực quan tỷ lệ phân bố trạng thái đơn hàng.
   * Tóm tắt tải công việc và công suất thực tế theo từng nhà máy: THCK (82%), TBCD (74%), NMK (65%).
   * Danh sách đơn hàng & đơn nội bộ cần chú ý đặc biệt.

2. **Danh sách Đơn hàng & Bộ lọc Đa cấp**:
   * Bộ lọc 4 cấp: Loại hình → Thị trường/Miền → Khách hàng → Nhà máy chính.
   * Bảng dữ liệu mạnh hiển thị tiến độ %, người phụ trách, thời hạn bàn giao, phân loại badge màu sắc chuẩn.
   * Tìm kiếm nhanh và xuất file báo cáo Excel / CSV.

3. **Trang Chi Tiết Đơn Hàng (Màn hình Trung tâm)**:
   * Header thông tin hợp đồng, giá trị, phân bổ nhà máy và thanh tiến độ Pipeline 6 giai đoạn lớn.
   * **10 Tab chuyên sâu**:
     1. *Tổng quan*: Sơ đồ liên kết chuỗi phụ thuộc (PO ➔ MO ➔ IO), mốc thời gian, chỉ đạo.
     2. *Hồ sơ kỹ thuật*: Bản vẽ, BOM, Quy trình CN có **quản lý phiên bản (v1.0, v1.1, v2.0...)**, trạng thái phê duyệt.
     3. *Lệnh sản xuất*: Quản lý danh sách MO phân bổ cho THCK, TBCD hoặc NMK.
     4. *Vật tư & Tồn kho*: Theo dõi số lượng Cần / Sẵn kho / Đã về / Còn thiếu, tự động kích hoạt **Cảnh báo thiếu vật tư**.
     5. *Đề nghị mua (PR)*: Lập PR, duyệt PO mua, theo dõi nhà cung ứng và ngày hàng về.
     6. *Đơn hàng nội bộ liên quan*: Quản lý luồng gia công giữa các nhà máy, hạn cam kết và ảnh hưởng chuỗi.
     7. *Kế hoạch giao hàng*: Chia theo các đợt giao (Batch 1, 2...), điểm đến và mã vận đơn.
     8. *Bất cập & Rủi ro*: Ghi nhận sự cố dừng chuyền, thiếu vật tư, hỏng thiết bị, phân loại mức độ và người xử lý.
     9. *Trao đổi khách hàng*: Timeline tương tác (email, họp online, gặp trực tiếp) và Action Items.
     10. *Nhật ký thay đổi (Audit Log)*: Ghi nhận minh bạch lịch sử thay đổi thông tin (ai làm gì, lúc nào).

4. **Module Lệnh sản xuất (MO)**: Quản lý độc lập từng lệnh gắn với nhà máy xưởng, theo dõi tiến độ tổng hợp lên đơn cha.
5. **Module Đơn hàng nội bộ (IO)**: Theo dõi luồng cấp hàng chéo giữa các nhà máy, ngăn chặn rủi ro dừng chuyền.
6. **Module Vật tư & Đề nghị mua**: Quản lý BOM, tự động phát hiện danh mục vật tư thiếu hụt.
7. **Module Bất cập & Sự cố**: Báo động đỏ các rủi ro có nguy cơ dừng chuyền sản xuất.
8. **Phân quyền góc nhìn (Role Switcher)**:
   * Ban Kế hoạch Khối
   * Kỹ thuật & R&D
   * Phòng Cung ứng / Mua hàng
   * Nhà máy THCK / TBCD / NMK
   * Ban Lãnh đạo Khối

---

## 🛠️ HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### 1. Khởi động môi trường phát triển (Development):
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ: `http://localhost:3000`

### 2. Biên dịch & Chạy bản sản xuất (Production Build):
```bash
npm run build
npm start
```

### 3. Cấu hình Firebase SDK:
* Mặc định hệ thống tự động kích hoạt **Mock Data Store & Local Storage** để bạn có thể kiểm thử đầy đủ các tính năng ngay lập tức.
* Để kết nối với Firebase Project thật:
  1. Nhấp vào biểu tượng bánh răng **Cấu hình Firebase** ở góc dưới Sidebar hoặc trên thanh Header.
  2. Điền các tham số: `API Key`, `Project ID`, `Auth Domain`, `Storage Bucket`, `App ID`.
  3. Nhấn **Lưu & Kích hoạt Firebase**. Hệ thống sẽ tự động chuyển sang chế độ Cloud Firestore & Auth.
