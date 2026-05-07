# Kiến thức thủy triều (Tidal Knowledge)

## 1. Chu kỳ thủy triều

### Nguyên nhân
Thủy triều gây ra bởi lực hấp dẫn của **mặt trăng** (chủ yếu) và **mặt trời** (phụ).

### Các loại chu kỳ
| Loại | Chu kỳ | Số lần lên/xuống/ngày | Ví dụ |
|---|---|---|---|
| Bán nhật triều (Semi-diurnal) | ~12h 25min | 2 lên + 2 xuống | Đà Nẵng, Vũng Tàu |
| Nhật triều (Diurnal) | ~24h 50min | 1 lên + 1 xuống | Vịnh Bắc Bộ (Hòn Gai) |
| Hỗn hợp (Mixed) | Không đều | 1-2 lần/ngày | Nhiều vùng Đông Nam Á |

> **Lưu ý:** Chu kỳ không phải đúng 12h mà là **12h 25min** vì mặt trăng di chuyển ~12.2°/ngày quanh Trái Đất, nên Trái Đất phải tự quay thêm ~50 phút để "bắt kịp" mặt trăng.

### Chu kỳ lớn hơn
- **Chu kỳ sóc vọng (Spring/Neap):** ~14.75 ngày — triều cường (spring tide) khi trăng tròn/trăng non, triều kém (neap tide) khi trăng thượng/hạ huyền
- **Chu kỳ cận/viễn điểm mặt trăng:** ~27.55 ngày — ảnh hưởng đến biên độ
- **Chu kỳ 18.6 năm (nodal cycle):** ảnh hưởng dài hạn rất nhỏ

---

## 2. Chế độ thủy triều tại Việt Nam

| Địa điểm | Loại triều | Biên độ trung bình | Lệch pha so với Đà Nẵng |
|---|---|---|---|
| Móng Cái | Nhật triều thuần | 3.5 - 4.5m | ~+6h |
| Hòn Gai (Hạ Long) | Nhật triều thuần | 3.0 - 4.0m | ~+5h |
| Đà Nẵng | Bán nhật triều không đều | 0.8 - 1.2m | 0 (tham chiếu) |
| Quy Nhơn | Bán nhật triều không đều | 1.0 - 1.5m | ~+1h |
| Nha Trang | Bán nhật triều không đều | 1.2 - 1.8m | ~+1.5h |
| Vũng Tàu | Bán nhật triều không đều | 3.0 - 4.0m | ~+3h |
| Cần Giờ (TP.HCM) | Bán nhật triều | 3.0 - 3.5m | ~+3.5h |

> Lệch pha là giá trị ước tính tương đối, không phải chính xác tuyệt đối.

---

## 3. Mô hình toán học thủy triều đơn giản

Để vẽ biểu đồ minh họa (không dùng dữ liệu thực), dùng công thức harmonic:

```
h(t) = M2·cos(2π·t/T_M2 + φ_M2) + S2·cos(2π·t/T_S2 + φ_S2) + K1·cos(2π·t/T_K1 + φ_K1) + ...
```

Trong đó:
- **M2**: thành phần bán nhật triều mặt trăng chính — T = 12.4206h (quan trọng nhất)
- **S2**: thành phần bán nhật triều mặt trời — T = 12.0000h
- **K1**: thành phần nhật triều luni-solar — T = 23.9345h
- **O1**: thành phần nhật triều mặt trăng — T = 25.8194h
- **N2**: thành phần bán nhật triều elip mặt trăng — T = 12.6584h

### Hằng số điều hòa tại Đà Nẵng (ước tính)
| Thành phần | Biên độ (m) | Pha (độ) |
|---|---|---|
| M2 | 0.35 | 105 |
| S2 | 0.12 | 140 |
| K1 | 0.20 | 215 |
| O1 | 0.15 | 190 |
| N2 | 0.07 | 80 |

---

## 4. Tại sao biểu đồ 30 ngày không thấy 2 lần/ngày?

**Vấn đề:** Nếu vẽ 1 điểm/ngày → mất hoàn toàn thông tin nội ngày.

**Giải pháp:** Vẽ với độ phân giải **1 giờ/điểm** = 720 điểm/30 ngày → rõ ràng 2 đỉnh/ngày.

**Gợi ý hiển thị:**
- Trục X: thời gian (giờ hoặc ngày)
- Trục Y: độ cao mực nước (m) so với mức chuẩn (datum)
- Màu sắc: phân biệt vùng nước cao / thấp
- Có thể zoom vào 3-7 ngày để thấy chi tiết

---

## 5. Lệch pha (Phase Shift) theo địa điểm

### Nguyên nhân lệch pha
1. **Bathymetry (địa hình đáy biển):** Sóng triều di chuyển chậm hơn ở vùng nước nông → trễ pha
2. **Hình dạng đường bờ:** Vịnh, eo biển tạo hiệu ứng cộng hưởng → khuếch đại biên độ và thay đổi pha
3. **Khoảng cách từ nguồn triều:** Triều hình thành ở đại dương và lan truyền vào bờ
4. **Vĩ độ:** Ảnh hưởng đến tỷ lệ các thành phần triều

### Cách biểu diễn lệch pha trên biểu đồ
- Vẽ nhiều địa điểm trên cùng 1 đồ thị
- Dùng màu/nét khác nhau cho từng địa điểm
- Hiển thị rõ đỉnh triều (high tide) của từng nơi để thấy độ lệch giờ

---

## 6. Nguồn dữ liệu thực (cho production)

- **NOAA Tides & Currents:** https://tidesandcurrents.noaa.gov (toàn cầu)
- **WorldTides API:** https://www.worldtides.info (API trả dữ liệu thực)
- **Open-Meteo Marine API:** https://marine-api.open-meteo.com (miễn phí)
- **Cục Đo đạc Bản đồ Việt Nam:** Cung cấp lịch thủy triều VN (offline)
- **GEBCO:** Dữ liệu địa hình đáy biển toàn cầu

---

## 7. Yêu cầu kỹ thuật trang web

### Stack gợi ý
- **Frontend:** React + TypeScript
- **Biểu đồ:** Chart.js hoặc D3.js hoặc Recharts
- **Styling:** Tailwind CSS

### Tính năng cần có
1. Chọn địa điểm (Đà Nẵng, Vũng Tàu, Hạ Long, Nha Trang, TP.HCM...)
2. Chọn khoảng thời gian (7 ngày / 30 ngày / tùy chọn)
3. Biểu đồ đường (line chart) với độ phân giải theo giờ
4. Zoom/pan trên biểu đồ
5. So sánh nhiều địa điểm trên cùng biểu đồ (hiển thị lệch pha)
6. Đánh dấu high tide / low tide trên biểu đồ
7. Responsive (mobile-friendly)

### Dữ liệu
- **Phase 1 (demo):** Dùng mô hình harmonic để tính toán (không cần API)
- **Phase 2 (production):** Kết nối WorldTides API hoặc NOAA
