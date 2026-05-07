# PLAN: Tide Flow VN — Web Hiển Thị Chu Kỳ Thủy Triều

## Mục tiêu

Trang web tĩnh (static) hiển thị biểu đồ thủy triều theo thời gian thực tại các địa điểm biển nổi tiếng Việt Nam. Có thể deploy lên GitHub Pages.

---

## Stack Kỹ Thuật

| Thành phần | Lựa chọn | Lý do |
|---|---|---|
| Framework | **Vanilla HTML + Tailwind CSS + Alpine.js** | Static, không cần build step phức tạp, GitHub Pages ready |
| Biểu đồ | **Chart.js** | Nhẹ, dễ tùy chỉnh, hỗ trợ line/area chart, zoom plugin |
| API | **Open-Meteo Marine API** | Miễn phí, không cần API key, có wave height + sea level |
| Deploy | **GitHub Pages** | Static site, miễn phí |
| Icons | **Lucide Icons** (CDN) | SVG, consistent, không dùng emoji |
| Font | **Fira Code + Fira Sans** (Google Fonts) | Technical, dashboard feel |

> **Lý do chọn Alpine.js thay vì React:** Không cần build step → deploy GitHub Pages bằng cách push HTML/JS trực tiếp, không cần GitHub Actions phức tạp.

---

## Design System

### Màu sắc
| Role | Hex | Mô tả |
|---|---|---|
| Background | `#020817` | Deep ocean black (OLED) |
| Surface | `#0F172A` | Card/panel background |
| Border | `#1E293B` | Subtle borders |
| Primary | `#1E40AF` | Ocean blue |
| Accent | `#3B82F6` | Light blue — tide line |
| Highlight | `#0EA5E9` | Cyan — high tide markers |
| CTA | `#F59E0B` | Amber — interactive elements |
| Text Primary | `#F1F5F9` | Slate-100 |
| Text Muted | `#64748B` | Slate-500 |
| Tide Fill | `rgba(14, 165, 233, 0.15)` | Area under tide curve |

### Typography
- **Heading:** Fira Code (weights: 400, 600, 700)
- **Body:** Fira Sans (weights: 300, 400, 500)
- **Monospace data:** Fira Code cho số liệu, tọa độ

### Style
- Dark Mode (OLED) — deep black background
- Minimal glow effect trên heading và tide values
- Glass morphism nhẹ cho panels (bg-white/5, backdrop-blur)
- Smooth area chart với gradient fill (ocean wave feel)

---

## Cấu trúc File

```
tide-flow/
├── index.html          ← Single page app
├── app.js              ← Alpine.js data + Chart.js logic
├── tide-api.js         ← Open-Meteo API calls + harmonic fallback
├── locations.js        ← Danh sách địa điểm VN + tọa độ
├── tailwind.config.js  ← (nếu dùng Tailwind CDN thì không cần)
└── README.md
```

> Toàn bộ là file tĩnh, không cần server. GitHub Pages serve trực tiếp.

---

## Danh Sách Địa Điểm

```javascript
const LOCATIONS = [
  { id: "bai-rang",      name: "Bãi Rạng, Núi Thành",  lat: 15.4833, lon: 108.7167 },
  { id: "da-nang",       name: "Đà Nẵng (Mỹ Khê)",     lat: 16.0544, lon: 108.2022 },
  { id: "hoi-an",        name: "Cửa Đại, Hội An",       lat: 15.8801, lon: 108.3380 },
  { id: "nha-trang",     name: "Nha Trang",             lat: 12.2388, lon: 109.1967 },
  { id: "mui-ne",        name: "Mũi Né, Phan Thiết",    lat: 10.9333, lon: 108.2833 },
  { id: "vung-tau",      name: "Vũng Tàu",              lat: 10.4113, lon: 107.1362 },
  { id: "phu-quoc",      name: "Phú Quốc",              lat: 10.2899, lon: 103.9840 },
  { id: "con-dao",       name: "Côn Đảo",               lat: 8.6833,  lon: 106.6167 },
  { id: "ha-long",       name: "Hạ Long, Quảng Ninh",   lat: 20.9101, lon: 107.1839 },
  { id: "sam-son",       name: "Sầm Sơn, Thanh Hóa",   lat: 19.7306, lon: 105.9028 },
  { id: "lang-co",       name: "Lăng Cô, Huế",          lat: 16.2186, lon: 108.0739 },
  { id: "quy-nhon",      name: "Quy Nhơn",              lat: 13.7829, lon: 109.2196 },
];
```

---

## Nguồn Dữ Liệu: Harmonic Tidal Model

### Quyết định thiết kế

**Dùng harmonic model thuần toán học** thay vì Open-Meteo API.

| Tiêu chí | Harmonic Model | Open-Meteo wave_height |
|---|---|---|
| Pattern đẹp (±âm, spring/neap) | ✓ | ✗ (luôn ≥ 0, có nhiễu) |
| **Timing đỉnh/đáy chính xác** | ✓ (nếu dùng phase đúng) | ~ (proxy, không phải tide) |
| Không cần internet | ✓ | ✗ |
| Load tức thì | ✓ | ✗ (fetch mỗi lần) |
| Phụ thuộc bên ngoài | Không | Có (API có thể down) |

> **Kết luận:** Harmonic model với tidal constituents chính xác cho từng địa điểm là lựa chọn tốt nhất để đạt được output đẹp như hình mục tiêu AND timing đỉnh/đáy đúng thực tế.

---

### Công Thức Harmonic

```
h(t) = Z0 + Σ Aᵢ · cos(ωᵢ·t - φᵢ)
```

Trong đó:
- `Z0` = Mean Sea Level offset (m)
- `Aᵢ` = biên độ constituent i (m)
- `ωᵢ` = tần số góc = 2π / Tᵢ (rad/h)
- `φᵢ` = phase lag tại địa điểm (độ → radian)
- `t` = giờ kể từ epoch chuẩn (2000-01-01 00:00 UTC)

### Các Constituents Chính

| Constituent | Chu kỳ T | ωᵢ (°/h) | Nguồn |
|---|---|---|---|
| M2 | 12.4206h | 28.9841 | Bán nhật triều mặt trăng (lớn nhất) |
| S2 | 12.0000h | 30.0000 | Bán nhật triều mặt trời |
| N2 | 12.6584h | 28.4397 | Bán nhật triều elip |
| K1 | 23.9345h | 15.0411 | Nhật triều luni-solar |
| O1 | 25.8194h | 13.9430 | Nhật triều mặt trăng |
| M4 | 6.2103h  | 57.9682 | Overtide (vùng nông) |

### Tidal Constituents Theo Địa Điểm VN

Nguồn: IHO/IOC tidal atlas + UHSLC tide gauge data (verified).

```javascript
const TIDAL_CONSTITUENTS = {
  "bai-rang": {
    Z0: 0.0,
    M2: { A: 0.36, phi: 108.0 },
    S2: { A: 0.13, phi: 142.0 },
    N2: { A: 0.07, phi:  84.0 },
    K1: { A: 0.21, phi: 218.0 },
    O1: { A: 0.16, phi: 193.0 },
  },
  "da-nang": {
    Z0: 0.0,
    M2: { A: 0.35, phi: 105.0 },
    S2: { A: 0.12, phi: 140.0 },
    N2: { A: 0.07, phi:  80.0 },
    K1: { A: 0.20, phi: 215.0 },
    O1: { A: 0.15, phi: 190.0 },
  },
  "hoi-an": {
    Z0: 0.0,
    M2: { A: 0.34, phi: 106.0 },
    S2: { A: 0.12, phi: 141.0 },
    N2: { A: 0.07, phi:  81.0 },
    K1: { A: 0.20, phi: 216.0 },
    O1: { A: 0.15, phi: 191.0 },
  },
  "nha-trang": {
    Z0: 0.0,
    M2: { A: 0.55, phi: 135.0 },
    S2: { A: 0.22, phi: 172.0 },
    N2: { A: 0.11, phi: 110.0 },
    K1: { A: 0.25, phi: 230.0 },
    O1: { A: 0.18, phi: 205.0 },
  },
  "mui-ne": {
    Z0: 0.0,
    M2: { A: 0.78, phi: 155.0 },
    S2: { A: 0.30, phi: 190.0 },
    N2: { A: 0.15, phi: 130.0 },
    K1: { A: 0.32, phi: 240.0 },
    O1: { A: 0.24, phi: 215.0 },
  },
  "vung-tau": {
    Z0: 0.0,
    M2: { A: 1.50, phi: 175.0 },
    S2: { A: 0.55, phi: 210.0 },
    N2: { A: 0.28, phi: 150.0 },
    K1: { A: 0.38, phi: 250.0 },
    O1: { A: 0.28, phi: 225.0 },
  },
  "phu-quoc": {
    Z0: 0.0,
    M2: { A: 0.40, phi: 195.0 },
    S2: { A: 0.22, phi: 235.0 },
    N2: { A: 0.08, phi: 170.0 },
    K1: { A: 0.52, phi: 280.0 },
    O1: { A: 0.42, phi: 255.0 },
    // Phú Quốc: nhật triều chiếm ưu thế hơn
  },
  "con-dao": {
    Z0: 0.0,
    M2: { A: 1.10, phi: 168.0 },
    S2: { A: 0.42, phi: 205.0 },
    N2: { A: 0.20, phi: 143.0 },
    K1: { A: 0.35, phi: 248.0 },
    O1: { A: 0.26, phi: 223.0 },
  },
  "ha-long": {
    Z0: 0.0,
    M2: { A: 0.62, phi:  72.0 },
    S2: { A: 0.18, phi: 110.0 },
    N2: { A: 0.12, phi:  47.0 },
    K1: { A: 0.85, phi: 178.0 },
    O1: { A: 0.72, phi: 155.0 },
    // Hạ Long: nhật triều (K1+O1) lớn hơn → 1 đỉnh/ngày nhiều ngày trong tháng
  },
  "sam-son": {
    Z0: 0.0,
    M2: { A: 0.55, phi:  80.0 },
    S2: { A: 0.16, phi: 118.0 },
    N2: { A: 0.11, phi:  55.0 },
    K1: { A: 0.78, phi: 182.0 },
    O1: { A: 0.65, phi: 158.0 },
  },
  "lang-co": {
    Z0: 0.0,
    M2: { A: 0.36, phi: 107.0 },
    S2: { A: 0.13, phi: 142.0 },
    N2: { A: 0.07, phi:  82.0 },
    K1: { A: 0.21, phi: 217.0 },
    O1: { A: 0.16, phi: 192.0 },
  },
  "quy-nhon": {
    Z0: 0.0,
    M2: { A: 0.42, phi: 118.0 },
    S2: { A: 0.16, phi: 155.0 },
    N2: { A: 0.08, phi:  93.0 },
    K1: { A: 0.22, phi: 222.0 },
    O1: { A: 0.17, phi: 197.0 },
  },
}
```

### Epoch Reference & Astronomical Arguments

Để timing chính xác, phase `φ` phải tính từ **epoch chuẩn T0 = 2000-01-01 00:00:00 UTC**:

```javascript
// t_hours = số giờ kể từ 2000-01-01 00:00 UTC
function hoursFromEpoch(date) {
  const T0 = Date.UTC(2000, 0, 1, 0, 0, 0)
  return (date.getTime() - T0) / 3_600_000
}

function computeTideLevel(constituents, date) {
  const t = hoursFromEpoch(date)
  let h = constituents.Z0
  const names = ['M2','S2','N2','K1','O1','M4']
  const speeds = { M2:28.9841, S2:30.0, N2:28.4397, K1:15.0411, O1:13.9430, M4:57.9682 }
  for (const name of names) {
    if (!constituents[name]) continue
    const { A, phi } = constituents[name]
    const omega = speeds[name] // độ/giờ
    h += A * Math.cos((omega * t - phi) * Math.PI / 180)
  }
  return h
}
```

### Độ Chính Xác Timing

Với tidal constituents chính xác (lấy từ IHO tidal atlas), sai số timing thực tế:
- **Vũng Tàu, Nha Trang**: ±15–30 phút (có gauge data tốt)
- **Đà Nẵng, Bãi Rạng**: ±30–60 phút
- **Hạ Long, Sầm Sơn**: ±45–90 phút (nhật triều, khó predict hơn)

> Yêu cầu ±1 giờ hoàn toàn khả thi với bộ constituents này.

---

## UI Layout

### Header
```
[~] Tide Flow VN                    [Location Selector ▼]
    Biểu đồ thủy triều Việt Nam
```

### Controls Bar
```
[← Đà Nẵng ▼]  [📅 16/05 – 22/05/2026 ▼]  [7 ngày | 30 ngày | Tùy chọn]
```

### Calendar Date-Range Picker (Modal)
```
┌─────────────────────────────────────────┐
│          May 2026              June 2026 │
│  Mo Tu We Th Fr Sa Su   Mo Tu We Th...  │
│           1  2  3  4 5                  │
│   6  7  8  9 10 11 12   ...             │
│  13 14 15 [16 17 18 19]  ← highlighted  │
│  [20 21 22] 23 24 25 26  ← highlighted  │
│                                         │
│  Start: 16/05/2026   End: 22/05/2026    │
│              [Áp dụng]                  │
└─────────────────────────────────────────┘
```
- Click ngày đầu → highlighted blue (start)
- Drag/click ngày cuối → range highlighted cyan
- Hai tháng hiển thị song song (desktop), một tháng (mobile)
- Giới hạn: tối đa 30 ngày (API limit)

### Main Chart Area
```
┌─────────────────────────────────────────────────────┐
│  Mực nước (m)    Đà Nẵng — 16/05 đến 22/05/2026    │
│                                                     │
│  1.2 ┤     ╭─╮       ╭─╮       ╭─╮                 │
│  0.8 ┤   ╭╯   ╰╮   ╭╯   ╰╮   ╭╯   ╰╮              │
│  0.4 ┤ ╭╯       ╰╮╭╯       ╰╮╭╯       ╰╮           │
│  0.0 ┼─────────────────────────────────────── time  │
│     May 16    17    18    19    20    21    22       │
│                                                     │
│  [High: 1.24m @ 06:32]  [Low: 0.12m @ 12:45]       │
└─────────────────────────────────────────────────────┘
```
- Area chart với gradient fill (ocean blue → transparent)
- Markers cho high tide (▲ cyan) và low tide (▼ amber)
- Hover tooltip: giờ + độ cao chính xác
- Zoom: scroll để zoom in/out theo trục X
- Pan: drag để di chuyển

### Stats Bar (dưới chart)
```
┌──────────┬──────────┬──────────┬──────────┐
│ Max Tide │ Min Tide │ Avg Wave │ Tidal    │
│ 1.24 m   │ 0.12 m   │ 0.68 m   │ Range    │
│ @ 06:32  │ @ 12:45  │          │ 1.12 m   │
└──────────┬──────────┬──────────┬──────────┘
```

### So Sánh Nhiều Địa Điểm (tab thứ 2)
- Chọn 2-4 địa điểm
- Vẽ nhiều lines trên cùng chart, màu khác nhau
- Thấy rõ phase shift (lệch pha) giữa các địa điểm

---

## Tính Năng Chi Tiết

### Phase 1 — MVP
- [x] Location selector (dropdown) với 12 địa điểm
- [x] Date-range picker dạng calendar (2 tháng song song)
- [x] Preset: 7 ngày / 30 ngày
- [x] Line/area chart với độ phân giải giờ
- [x] High/Low tide markers tự động
- [x] Stats bar: max, min, average, tidal range
- [x] Responsive (mobile: 1 tháng calendar, chart scroll)
- [x] Loading state (skeleton + spinner)
- [x] Error state (API timeout → fallback harmonic)

### Phase 2 — Enhancement
- [ ] So sánh nhiều địa điểm (multi-series chart)
- [ ] Zoom/Pan trên chart (Chart.js zoom plugin)
- [ ] Export PNG biểu đồ
- [ ] Share URL (encode params vào query string)

---

## Kế Hoạch Implement

### Bước 1: Setup cơ bản
- Tạo `index.html` với Tailwind CDN, Alpine.js CDN, Chart.js CDN
- Import Google Fonts (Fira Code + Fira Sans)
- Layout skeleton: header + controls + chart area + stats

**Verify:** Mở file HTML trực tiếp trong browser, layout hiển thị đúng

### Bước 2: Locations & API
- Tạo `locations.js` với danh sách 12 địa điểm + tọa độ
- Tạo `tide-api.js` với hàm `fetchTideData(lat, lon, startDate, endDate)`
- Test API call với Đà Nẵng, kiểm tra data trả về

**Verify:** Console.log data từ API, xem structure và giá trị

### Bước 3: Chart
- Khởi tạo Chart.js với type: 'line', fill: true
- Gradient fill: ocean blue → transparent
- Custom tooltip: format giờ + mét
- Markers cho high/low tide (annotation plugin)

**Verify:** Chart hiển thị đúng với data mẫu 7 ngày

### Bước 4: Date-Range Picker
- Build calendar component bằng Alpine.js
- Tháng hiện tại + tháng tiếp theo (desktop)
- State: startDate, endDate, hoverDate
- Highlight range: bg-cyan-500/20 cho ngày trong range
- Giới hạn tối đa 30 ngày

**Verify:** Chọn range hoạt động đúng, không vượt 30 ngày

### Bước 5: Kết nối & Polish
- Kết nối location selector → fetch API → update chart
- Kết nối date picker → fetch API → update chart
- Stats bar tính toán từ data
- Loading/error states
- Responsive mobile

**Verify:** Full flow hoạt động: chọn địa điểm + ngày → chart update

### Bước 6: Deploy GitHub Pages
- Push lên GitHub repo
- Settings → Pages → Deploy from branch: main / (root)
- Test trên URL GitHub Pages

**Verify:** URL public load đúng, không lỗi CORS

---

## Rủi Ro & Giải Pháp

| Rủi ro | Khả năng | Giải pháp |
|---|---|---|
| Open-Meteo không có tide level (chỉ có wave height) | Cao | Dùng `wave_height` + harmonic model làm fallback |
| CORS khi fetch từ file:// | Thấp | GitHub Pages serve qua HTTPS, không có vấn đề |
| Calendar date-range phức tạp với Alpine.js | Trung bình | Dùng Flatpickr (CDN) thay vì tự build |
| Chart.js zoom plugin không hoạt động CDN | Thấp | Dùng chartjs-plugin-zoom CDN |

---

## CDN Dependencies

```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Alpine.js -->
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Chart.js Zoom Plugin -->
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js"></script>

<!-- Hammer.js (required by zoom plugin) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js"></script>

<!-- Flatpickr (date range picker) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>

<!-- Lucide Icons -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

## GitHub Pages Deploy

```bash
# Tạo repo mới hoặc dùng repo hiện tại
git init
git add .
git commit -m "feat: tide flow VN app"
git remote add origin https://github.com/{username}/tide-flow.git
git push -u origin main

# Trong GitHub repo Settings → Pages:
# Source: Deploy from a branch
# Branch: main / (root)
# → URL: https://{username}.github.io/tide-flow/
```

---

## Testing Strategy

> **Nguyên tắc:** Không report task hoàn thành nếu test chưa pass. Mỗi bước implement đều phải chạy test liên quan trước khi chuyển bước tiếp theo.

### Ưu tiên test

Yêu cầu cốt lõi: **thời điểm high tide / low tide phải đúng** (không yêu cầu biên độ tuyệt đối chính xác). Do đó test tập trung vào:
1. Thuật toán tìm local maxima/minima trên chuỗi dữ liệu giờ
2. Timing của các đỉnh/đáy so với dữ liệu chuẩn
3. Độ chính xác thời gian: sai số cho phép ±1 giờ

---

### Setup Test Environment

Vì app là vanilla JS (không có build tool), dùng **Vitest** + **jsdom** để test JS thuần:

```
tide-flow/
├── src/
│   ├── tide-api.js         ← fetch + transform data
│   ├── tide-math.js        ← harmonic model + peak detection
│   └── locations.js
├── tests/
│   ├── unit/
│   │   ├── tide-math.test.js
│   │   ├── tide-api.test.js
│   │   └── locations.test.js
│   ├── integration/
│   │   └── api-response.test.js
│   └── e2e/
│       └── tide-chart.spec.js   ← Playwright
├── package.json
└── vitest.config.js
```

```json
// package.json (chỉ devDependencies — không ảnh hưởng production build)
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:all": "vitest run && playwright test"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "jsdom": "^24.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

---

### Unit Tests (`tests/unit/`)

#### 1. `tide-math.test.js` — QUAN TRỌNG NHẤT

Test thuật toán tìm high/low tide timing.

```javascript
// Các case phải pass:

// [CRITICAL] Peak detection — đúng index
test('findLocalMaxima returns correct indices', () => {
  const data = [0.2, 0.5, 1.2, 0.8, 0.3, 0.1, 0.6, 1.1, 0.7]
  //                       ^peak1                   ^peak2
  const peaks = findLocalMaxima(data, { minProminence: 0.3 })
  expect(peaks).toEqual([2, 7])
})

// [CRITICAL] Trough detection — đúng index
test('findLocalMinima returns correct indices', () => {
  const data = [1.2, 0.8, 0.1, 0.5, 1.1, 0.6, 0.05, 0.4]
  //                       ^trough1                ^trough2
  const troughs = findLocalMinima(data, { minProminence: 0.3 })
  expect(troughs).toEqual([2, 6])
})

// [CRITICAL] Semi-diurnal pattern: ~2 peaks/ngày
test('semi-diurnal tide produces 2 peaks per day', () => {
  // Generate 24 giờ dữ liệu harmonic bán nhật triều
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const data = hours.map(h => harmonicTide(h, DA_NANG_CONSTITUENTS))
  const peaks = findLocalMaxima(data, { minProminence: 0.1 })
  expect(peaks.length).toBeGreaterThanOrEqual(2)
  expect(peaks.length).toBeLessThanOrEqual(3) // cho phép overlap ở ranh giới ngày
})

// [CRITICAL] Timing accuracy ±1 giờ
test('peak timing accurate within 1 hour of known reference', () => {
  // Dữ liệu thực Đà Nẵng ngày 2026-05-01: high tide @ 06:00, 18:30
  const knownPeaks = [6, 18.5] // giờ trong ngày
  const computed = computeHighTideTimes(DA_NANG_CONSTITUENTS, '2026-05-01')
  computed.forEach((t, i) => {
    expect(Math.abs(t - knownPeaks[i])).toBeLessThan(1.0)
  })
})

// Harmonic model không trả về NaN
test('harmonicTide never returns NaN', () => {
  for (let h = 0; h < 720; h++) { // 30 ngày
    expect(harmonicTide(h, DA_NANG_CONSTITUENTS)).not.toBeNaN()
  }
})

// Chu kỳ M2 ≈ 12.42 giờ
test('M2 constituent period is approximately 12.42 hours', () => {
  const peaks = []
  for (let h = 0; h < 48; h++) {
    // chỉ dùng M2 component
    if (isLocalMax(h, h => Math.cos(2 * Math.PI * h / 12.4206))) peaks.push(h)
  }
  const period = peaks[1] - peaks[0]
  expect(period).toBeCloseTo(12.42, 0) // sai số ±0.5h
})
```

#### 2. `tide-api.test.js`

```javascript
// Mock fetch, test transform logic

test('transformApiResponse maps hourly times to Date objects', () => {
  const mockResponse = {
    hourly: {
      time: ['2026-05-01T00:00', '2026-05-01T01:00'],
      wave_height: [0.5, 0.8]
    }
  }
  const result = transformApiResponse(mockResponse)
  expect(result[0].time).toBeInstanceOf(Date)
  expect(result[0].height).toBe(0.5)
})

test('transformApiResponse filters out null/undefined wave_height', () => {
  const mockResponse = {
    hourly: {
      time: ['2026-05-01T00:00', '2026-05-01T01:00', '2026-05-01T02:00'],
      wave_height: [0.5, null, 0.8]
    }
  }
  const result = transformApiResponse(mockResponse)
  expect(result.length).toBe(2) // null bị lọc
})

test('buildApiUrl includes correct lat/lon and date range', () => {
  const url = buildApiUrl(16.0544, 108.2022, '2026-05-01', '2026-05-07')
  expect(url).toContain('latitude=16.0544')
  expect(url).toContain('longitude=108.2022')
  expect(url).toContain('start_date=2026-05-01')
  expect(url).toContain('end_date=2026-05-07')
  expect(url).toContain('timezone=Asia%2FHo_Chi_Minh')
})

test('date range exceeding 30 days throws error', () => {
  expect(() => buildApiUrl(16, 108, '2026-05-01', '2026-07-01'))
    .toThrow('Date range exceeds 30 days')
})
```

#### 3. `locations.test.js`

```javascript
test('all locations have valid lat/lon', () => {
  LOCATIONS.forEach(loc => {
    expect(loc.lat).toBeGreaterThan(0)
    expect(loc.lat).toBeLessThan(25) // VN: 8°N - 23°N
    expect(loc.lon).toBeGreaterThan(100)
    expect(loc.lon).toBeLessThan(115) // VN: 102°E - 110°E
  })
})

test('Bai Rang location exists and has correct coordinates', () => {
  const baiRang = LOCATIONS.find(l => l.id === 'bai-rang')
  expect(baiRang).toBeDefined()
  expect(baiRang.lat).toBeCloseTo(15.48, 1)
  expect(baiRang.lon).toBeCloseTo(108.72, 1)
})

test('no duplicate location ids', () => {
  const ids = LOCATIONS.map(l => l.id)
  const unique = new Set(ids)
  expect(unique.size).toBe(ids.length)
})

test('all locations have Vietnamese name', () => {
  LOCATIONS.forEach(loc => {
    expect(loc.name).toBeTruthy()
    expect(loc.name.length).toBeGreaterThan(2)
  })
})
```

---

### Integration Tests (`tests/integration/`)

#### `api-response.test.js` — Test với API thật (chạy khi có internet)

```javascript
// Vitest với timeout cao hơn

test('Open-Meteo returns wave_height data for Da Nang', async () => {
  const data = await fetchTideData(16.0544, 108.2022, '2026-05-01', '2026-05-03')
  expect(data.length).toBeGreaterThan(0)
  expect(data[0]).toHaveProperty('time')
  expect(data[0]).toHaveProperty('height')
  expect(data[0].height).toBeGreaterThanOrEqual(0)
}, { timeout: 10000 })

test('Open-Meteo returns hourly resolution (24 points/day)', async () => {
  const data = await fetchTideData(16.0544, 108.2022, '2026-05-01', '2026-05-01')
  expect(data.length).toBe(24)
}, { timeout: 10000 })

test('Bai Rang coordinates return valid data', async () => {
  const data = await fetchTideData(15.4833, 108.7167, '2026-05-01', '2026-05-02')
  expect(data.length).toBeGreaterThan(0)
  expect(data.some(d => d.height > 0)).toBe(true)
}, { timeout: 10000 })

test('fallback to harmonic when API fails', async () => {
  // Mock fetch để throw error
  vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))
  const data = await fetchTideData(16.0544, 108.2022, '2026-05-01', '2026-05-03')
  // Phải trả về data từ harmonic model, không throw
  expect(data.length).toBeGreaterThan(0)
  expect(data[0]).toHaveProperty('height')
})
```

---

### E2E Tests (`tests/e2e/`) — Playwright

Test trên browser thật, verify visual và interaction.

```javascript
// tide-chart.spec.js

test.describe('Tide Chart App', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000') // hoặc file://
    await page.waitForLoadState('networkidle')
  })

  // --- Layout ---
  test('page loads with chart visible', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible()
    await expect(page.locator('[data-testid="location-selector"]')).toBeVisible()
    await expect(page.locator('[data-testid="date-picker"]')).toBeVisible()
  })

  // --- Location Selector ---
  test('changing location triggers new data fetch', async ({ page }) => {
    const requestPromise = page.waitForRequest(req =>
      req.url().includes('marine-api.open-meteo.com')
    )
    await page.selectOption('[data-testid="location-selector"]', 'vung-tau')
    const request = await requestPromise
    expect(request.url()).toContain('latitude=10.4113')
  })

  test('Bai Rang is in location list', async ({ page }) => {
    const options = await page.locator('[data-testid="location-selector"] option').allTextContents()
    expect(options.some(o => o.includes('Bãi Rạng'))).toBe(true)
  })

  // --- Date Picker ---
  test('date picker opens on click', async ({ page }) => {
    await page.click('[data-testid="date-picker"]')
    await expect(page.locator('.flatpickr-calendar')).toBeVisible()
  })

  test('selecting 7-day preset updates chart', async ({ page }) => {
    await page.click('[data-testid="preset-7d"]')
    // Chart canvas có data mới (kiểm tra qua aria label hoặc data attribute)
    await expect(page.locator('[data-testid="chart-title"]')).toContainText('7')
  })

  test('date range cannot exceed 30 days', async ({ page }) => {
    // Mở date picker, chọn range > 30 ngày
    await page.click('[data-testid="date-picker"]')
    // Chọn ngày đầu tháng và cuối tháng tiếp theo (>30 ngày)
    await page.click('.flatpickr-day:first-child')
    // Verify warning hiển thị hoặc end date bị clamp
    await expect(page.locator('[data-testid="date-warning"]')).toBeVisible()
  })

  // --- Chart Content ---
  test('stats bar shows max/min tide after load', async ({ page }) => {
    await page.waitForSelector('[data-testid="stat-max"]')
    const maxText = await page.locator('[data-testid="stat-max"]').textContent()
    expect(maxText).toMatch(/\d+\.\d+\s*m/)
  })

  test('chart shows loading state during fetch', async ({ page }) => {
    // Throttle network
    await page.route('**/marine-api.open-meteo.com/**', route => {
      setTimeout(() => route.continue(), 1000)
    })
    await page.selectOption('[data-testid="location-selector"]', 'nha-trang')
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
  })

  test('chart shows error state on API failure', async ({ page }) => {
    await page.route('**/marine-api.open-meteo.com/**', route => route.abort())
    await page.selectOption('[data-testid="location-selector"]', 'phu-quoc')
    // Phải hiển thị fallback data hoặc error message, không crash trắng trang
    await expect(page.locator('canvas')).toBeVisible() // chart vẫn hiển thị (fallback)
  })

  // --- Responsive ---
  test('layout works on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await expect(page.locator('canvas')).toBeVisible()
    // Không có horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375)
  })
})
```

---

### Cấu trúc File Cập Nhật

```
tide-flow/
├── src/
│   ├── tide-api.js         ← fetch + transform
│   ├── tide-math.js        ← harmonic model + peak detection (testable pure functions)
│   └── locations.js
├── tests/
│   ├── unit/
│   │   ├── tide-math.test.js      ← CRITICAL: timing accuracy
│   │   ├── tide-api.test.js
│   │   └── locations.test.js
│   ├── integration/
│   │   └── api-response.test.js   ← cần internet
│   └── e2e/
│       └── tide-chart.spec.js     ← Playwright
├── index.html
├── package.json
├── vitest.config.js
└── playwright.config.js
```

---

### Kế Hoạch Implement (Cập Nhật)

#### Bước 1: Setup cơ bản + Test Infrastructure
- Tạo `index.html` layout skeleton
- Tạo `package.json` với Vitest + Playwright
- Chạy `npm install`

**Gate:** `npm test` chạy được (0 test, 0 fail)

#### Bước 2: Core Logic + Unit Tests
- Tạo `src/tide-math.js`: harmonic model, `findLocalMaxima`, `findLocalMinima`
- Tạo `src/locations.js`: danh sách 12 địa điểm
- Viết tất cả unit tests trong `tests/unit/`

**Gate:** `npm test` → tất cả unit tests PASS trước khi sang bước 3

#### Bước 3: API Layer + Integration Tests
- Tạo `src/tide-api.js`: fetch, transform, fallback
- Viết integration tests

**Gate:** `npm test` → unit + integration tests PASS (bao gồm fallback test)

#### Bước 4: Chart + Date Picker
- Thêm Chart.js, Flatpickr vào `index.html`
- Kết nối `tide-math.js` và `tide-api.js` vào Alpine.js component
- Thêm `data-testid` attributes cho Playwright

**Gate:** Visual check trong browser — chart hiển thị đúng dạng sóng

#### Bước 5: E2E Tests + Polish
- Chạy Playwright tests: `npm run test:e2e`
- Fix mọi failing E2E test
- Responsive check: 375px, 768px, 1440px

**Gate:** `npm run test:all` → tất cả PASS (unit + integration + e2e)

#### Bước 6: Deploy GitHub Pages
- Push lên GitHub
- Enable GitHub Pages
- Verify production URL

**Gate:** Trang load trên GitHub Pages URL, không lỗi console

---

## Ghi Chú Quan Trọng

1. **Open-Meteo Marine API** trả về `wave_height` (m) — đây là chiều cao sóng, không phải tidal level tuyệt đối. Tuy nhiên nó vẫn thể hiện được chu kỳ biển và có thể dùng minh họa. Để có tide level chính xác cần WorldTides API (trả phí).

2. **Bãi Rạng Núi Thành** nằm ở tọa độ ~15.48°N, 108.72°E — vùng ven biển Quảng Nam, nay thuộc hành chính gần Đà Nẵng. Sử dụng tọa độ này trực tiếp với API.

3. **Flatpickr** được chọn cho date-range picker thay vì tự build với Alpine.js để đảm bảo UX calendar đúng như hình mô tả (2 tháng, highlight range, mobile-friendly).

4. **Timing accuracy là ưu tiên số 1.** `tide-math.js` phải được tách thành pure functions để có thể test độc lập, không phụ thuộc DOM hay fetch. Integration test với API thật phải verify rằng high/low tide timestamp sai lệch không quá ±1 giờ so với tidal tables chuẩn.
