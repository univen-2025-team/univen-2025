## Prompt 1 — Dev spec trang “Learn Stock” (Next.js + Tailwind + React)

### Mục tiêu trang

Tạo 1 trang hiển thị tính năng “học trading từ dữ liệu thật”:

1. User chọn `symbol` (mã cổ phiếu)
2. Bấm “Generate lessons”
3. UI gọi API `GET /api/learn/stock?symbol=...`
4. Hiển thị:

* **Candlestick chart** theo OHLCV
* **Markers** trên chart tại các `event_date` (ngày biến động mạnh) + màu theo `volatility_type`
* Danh sách bài học **group by event_date**
* Click bài học → sang `/learn/stock/[symbol]/[lessonId]` (hoặc slug)

### Routing

* Trang chính: `/learn/stock`
* Trang chi tiết: `/learn/stock/[symbol]/[id]`

### Trạng thái UI cần có

* `idle`: chưa chọn symbol hoặc chưa generate
* `loading`: gọi API (query-or-generate)
* `success`: có lessons + chart
* `error`: lỗi API
* `empty`: API trả về nhưng không có bài học

### Layout tổng thể (desktop-first nhưng responsive)

* **Header**: tiêu đề + mô tả ngắn
* **Control bar (sticky on scroll)**: symbol input + button + trạng thái cache/generate
* **Main content** chia 2 cột (>=lg):

  * **Left (Chart panel)** ~ 60%
  * **Right (Lessons panel)** ~ 40%
* Mobile (<lg): chart trên, lessons dưới

### Control bar (UI chi tiết)

* **Symbol Select / Search**

  * ComboBox searchable (có list gợi ý như AAPL, TSLA…)
  * Cho phép gõ tự do uppercase + validate regex `^[A-Z.\-]{1,10}$`
* Button chính: **“Generate lessons”**

  * Disabled khi symbol trống/invalid
  * Khi loading: spinner + label “Generating…”
* Badge trạng thái:

  * Nếu response có `meta.cacheHit=true`: badge “Cached”
  * Nếu generate mới: badge “Generated”
  * Timestamp “Updated at …”

### Chart panel (candlestick + markers)

**Yêu cầu UX/UI**

* Card container, padding thoáng, header nhỏ: “Price action & events”
* Candlestick chart hiển thị:

  * Trục X: ngày
  * Trục Y: giá
  * Zoom/Pan (nice-to-have)
  * Tooltip khi hover candle: date, open, high, low, close, volume
* Marker cho event:

  * Marker nằm tại `event_date` (x-axis)
  * Hình dạng: chấm tròn hoặc pin nhỏ
  * Color mapping:

    * `strong_up`: xanh (hoặc tone positive)
    * `strong_down`: đỏ
    * `gap`: vàng/cam
    * `spike_volume`: tím
  * Hover marker: popover mini:

    * Event type label
    * Price change percent
    * 1 dòng news_summary
    * CTA: “View lessons (N)”
* **Brush/mini timeline** dưới chart (optional) để chọn range

**Gợi ý thư viện**

* TradingView Lightweight Charts (React wrapper) hoặc `react-financial-charts`
* Marker: overlay series hoặc custom primitives

### Lessons panel (group by ngày)

**UI**

* Card “Lessons”
* Mỗi group là 1 accordion theo `event_date`

  * Header group: date + volatility badge + confidence_score trung bình + số bài học
  * Mô tả ngắn: news_summary (1-2 lines clamp)
* Mỗi item lesson trong group:

  * Title
  * Difficulty badge (beginner / intermediate)
  * Confidence score (progress bar nhỏ)
  * Key takeaways preview: hiển thị 2 tags đầu (từ JSON)
  * CTA button: “Read”
* Khi click “Read” → route detail page

**Interaction sync chart**

* Click group header:

  * Chart tự scroll/center tới event_date
  * Marker được highlight (glow ring)
* Click marker trên chart:

  * Lessons panel auto scroll đến group tương ứng + mở accordion

### Skeleton & Loading

* Khi loading:

  * Chart: skeleton rectangle + shimmer
  * Lessons: skeleton list 6 items
* Error state:

  * Alert: “Can’t load lessons. Try again.” + nút Retry

### Data contract (frontend expects)

Backend trả về normalized list + optional series:

```ts
type VolatilityType = "strong_up" | "strong_down" | "gap" | "spike_volume";

type LearnStockLesson = {
  id: string;
  symbol: string;
  event_date: string; // YYYY-MM-DD
  volatility_type: VolatilityType;
  news_summary: string;
  lesson_title: string;
  lesson_content: string; // markdown
  key_takeaways: string[]; // derived from JSON
  difficulty_level: "beginner" | "intermediate";
  confidence_score: number; // 0..1
  created_at: string;
  updated_at: string;
  // optional analytics:
  price_change_percent?: number;
};

type Ohlcv = {
  date: string; open: number; high: number; low: number; close: number; volume: number;
};

type LearnStockResponse = {
  meta: { cacheHit: boolean; generatedAt: string; };
  symbol: string;
  ohlcv: Ohlcv[];
  lessons: LearnStockLesson[];
};
```

### Grouping logic

* Group key: `event_date`
* Sort groups: `event_date desc`
* Sort lessons inside group: `confidence_score desc`

---

## Prompt 2 — Dev spec trang “Lesson Detail” (Next.js + Tailwind + Markdown)

### Route

`/learn/stock/[symbol]/[id]`

### Layout

* Breadcrumb: Learn Stock / {SYMBOL} / {lesson_title}
* Title + meta row:

  * date, volatility badge, difficulty badge, confidence
* **Content**: render markdown `lesson_content`
* Right side (>=lg): “On this day” sidebar:

  * News summary
  * Key takeaways (tags)
  * Link back to group list (anchor query `?event_date=...`)
* Bottom:

  * “Next/Prev lesson” within same symbol (optional)

### Markdown rendering

* Use `react-markdown` + `remark-gfm`
* Style prose with Tailwind `prose prose-neutral dark:prose-invert` (nếu có darkmode)

---

## Mockup data (dùng ngay cho dev)

### Mock symbols

`AAPL, TSLA, NVDA, MSFT, AMZN`

### Mock response example (rút gọn)

> Bạn có thể lưu thành `mock/learnStockResponse.ts`

```ts
export const mockLearnStockResponse = {
  meta: { cacheHit: false, generatedAt: "2026-01-16T10:05:00Z" },
  symbol: "AAPL",
  ohlcv: [
    { date: "2024-05-06", open: 181.2, high: 184.0, low: 180.1, close: 183.6, volume: 72300000 },
    { date: "2024-05-07", open: 183.6, high: 184.5, low: 181.0, close: 181.9, volume: 68900000 },
    { date: "2024-05-08", open: 182.0, high: 186.7, low: 181.8, close: 185.9, volume: 91200000 },
    { date: "2024-05-09", open: 186.0, high: 188.2, low: 184.9, close: 185.2, volume: 80100000 },
    { date: "2024-05-10", open: 185.2, high: 193.4, low: 184.7, close: 192.6, volume: 132400000 }
  ],
  lessons: [
    {
      id: "lsn_001",
      symbol: "AAPL",
      event_date: "2024-05-10",
      volatility_type: "strong_up",
      news_summary: "Kỳ vọng doanh thu dịch vụ tăng mạnh và tín hiệu tích cực về kế hoạch mua lại cổ phiếu.",
      lesson_title: "Strong Up Day: Đọc tín hiệu bứt phá sau tin tích cực",
      lesson_content: `# Strong Up Day: Đọc tín hiệu bứt phá sau tin tích cực

## Chuyện gì xảy ra?
Giá tăng mạnh trong ngày với khối lượng cao hơn trung bình, đóng cửa gần đỉnh ngày.

## Vì sao giá biến động?
Tin tức tạo **kỳ vọng dòng tiền**: nhà đầu tư phản ứng nhanh, đẩy giá vượt vùng cản.

## Người mới nên học gì?
- Phân biệt **tăng do tin** vs **tăng do kỹ thuật**
- Quan sát **close near high** và **volume spike**

## Sai lầm thường gặp
- FOMO khi đã tăng quá xa so với vùng hỗ trợ gần nhất
- Không đặt điểm cắt lỗ theo cấu trúc giá
`,
      key_takeaways: ["Close near high", "Volume confirms breakout", "Avoid FOMO entries"],
      difficulty_level: "beginner",
      confidence_score: 0.82,
      created_at: "2026-01-16T10:05:00Z",
      updated_at: "2026-01-16T10:05:00Z",
      price_change_percent: 15.2
    },
    {
      id: "lsn_002",
      symbol: "AAPL",
      event_date: "2024-05-10",
      volatility_type: "spike_volume",
      news_summary: "Dòng tiền vào mạnh trong phiên, volume đột biến so với trung bình 20 ngày.",
      lesson_title: "Volume Spike: Khi nào volume thật sự 'xác nhận' xu hướng?",
      lesson_content: `# Volume Spike: Khi nào volume xác nhận xu hướng?

## Chuyện gì xảy ra?
Khối lượng tăng đột biến, nhưng điều quan trọng là **giá đóng cửa ở đâu**.

## Người mới nên học gì?
- Volume lớn + giá đóng cửa mạnh => xác nhận
- Volume lớn + rút chân/đóng thấp => cảnh báo phân phối

## Checklist nhanh
- So với MA20 volume
- Vị trí close
- Vùng giá (hỗ trợ/kháng cự)
`,
      key_takeaways: ["Compare to vol MA20", "Close position matters", "Distribution warning"],
      difficulty_level: "intermediate",
      confidence_score: 0.74,
      created_at: "2026-01-16T10:05:00Z",
      updated_at: "2026-01-16T10:05:00Z",
      price_change_percent: 0
    },
    {
      id: "lsn_003",
      symbol: "AAPL",
      event_date: "2024-05-08",
      volatility_type: "gap",
      news_summary: "Mở cửa tạo gap lên sau kỳ vọng thị trường chung tích cực.",
      lesson_title: "Gap Up: 3 kịch bản xử lý gap cho người mới",
      lesson_content: `# Gap Up: 3 kịch bản xử lý gap

## 3 kịch bản phổ biến
1) Gap và giữ được vùng gap (bullish)
2) Gap rồi lấp gap (trung tính)
3) Gap thất bại, phá đáy gap (bearish)

## Người mới nên học gì?
Đừng chỉ thấy gap là mua — hãy chờ **hành vi giá sau gap**.
`,
      key_takeaways: ["Gap hold vs gap fill", "Wait post-gap behavior", "Define risk level"],
      difficulty_level: "beginner",
      confidence_score: 0.63,
      created_at: "2026-01-16T10:05:00Z",
      updated_at: "2026-01-16T10:05:00Z",
      price_change_percent: 4.1
    }
  ]
} as const;
```

---

## UI chi tiết hơn cho biểu đồ (phần bạn yêu cầu “BIỂU ĐỒ CHI TIẾT HƠN”)

Dev spec cho chart component `StockCandlesWithEvents`:

### Inputs

* `ohlcv[]`
* `events[]` (derive từ lessons group):

  * `date`
  * `type`
  * `countLessons`
  * `avgConfidence`
  * `headline` (news_summary)
  * `priceChangePercent`

### Visual layers

1. **Candles layer**
2. **Volume bars layer** (dưới, 20–25% chiều cao chart)
3. **Event markers layer**
4. **Hover crosshair** + tooltip
5. **Selected event highlight** (ring + label)

### Tooltip structure (hover candle)

* Date (YYYY-MM-DD)
* O/H/L/C
* Volume
* Nếu date trùng event_date → thêm:

  * Volatility type
  * Lessons count
  * CTA “Scroll to lessons”

### Legend

* Hiển thị 4 loại volatility với màu tương ứng + checkbox toggle (filter marker types)

### Filter controls (trên chart)

* Range: 1M / 3M / 6M / YTD / 1Y (fake bằng slice mock cũng được)
* Toggle: “Show volume”
* Toggle: “Show events”

---

## Component tree gợi ý (để dev rõ ngay)

* `app/learn/stock/page.tsx`

  * `LearnStockPage`

    * `SymbolPicker`
    * `GenerateButton`
    * `StatusBadge`
    * `StockCandlesWithEvents`
    * `LessonsByEventDate`
* `app/learn/stock/[symbol]/[id]/page.tsx`

  * `LessonDetailPage`

    * `LessonHeader`
    * `MarkdownRenderer`
    * `LessonSidebar`

---

## UX copy (microcopy)

* Empty state: “Chọn mã cổ phiếu để tạo bài học từ biến động thực tế.”
* Loading: “Đang phân tích dữ liệu & tổng hợp tin tức…”
* Cached: “Đã có bài học sẵn — tải nhanh từ hệ thống.”
* Generated: “Bài học mới đã được tạo và lưu để dùng lại.”

Dưới đây là **dev spec cực rõ cho biểu đồ nến** (candlestick chart) theo hướng **trực quan + có marker ngày biến động mạnh + interactive click để filter bài học theo ngày**. Bạn có thể copy nguyên đoạn này gửi dev frontend.

---