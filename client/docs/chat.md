Dưới đây là bản **docs.md** viết lại theo đúng ý bạn:

* Giao diện **chia 2 side**
* **Left side mặc định** là market/stock table giống screenshot
* Mỗi tác vụ (mua, xem news, …) là **feature riêng**
* Khi chatbot hoặc user yêu cầu → parent **switch feature** và render UI tương ứng
* Chatbot **chỉ “gọi” feature lên**, không ôm logic xử lý UI.

---

````md
# Trading Dashboard – Two-Side + Feature-based UI

## 1. Tổng quan kiến trúc

UI được chia làm **2 side cố định**:

- **Left side – Feature Area (Main Trading View)**  
  - Mặc định hiển thị **Market Overview + Stock Table** giống layout trong screenshot  
  - Khi người dùng yêu cầu thông qua chatbot (mua cổ phiếu, xem news, xem phân tích, …) → left side sẽ **chuyển sang feature tương ứng** hoặc mở overlay bên trên.

- **Right side – Chatbot Panel**  
  - Hiển thị hội thoại AI  
  - Gợi ý (suggestions) nhanh  
  - Khi bot trả lời có kèm theo instruction (feature + props) → Right side **bắn event** để parent hiển thị feature tương ứng ở Left side.  
  - Chatbot **không render UI trực tiếp**, chỉ gửi “tôi muốn mở feature X với props Y”.

Toàn bộ state điều khiển left side nằm ở **parent**.

---

## 2. Layout tổng thể

```tsx
// app/trading/page.tsx (Next.js App Router)

export default function TradingDashboardPage() {
  const [featureState, setFeatureState] = useState<FeatureState>(defaultFeatureState);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSendMessage = async (text: string) => {
    // 1. Add user message
    // 2. Call chatbot engine (mock / real)
    // 3. Nhận về: assistant message + uiEffects (FeatureInstruction[])
    // 4. Update messages + applyFeatureInstructions(uiEffects)
  };

  const handleUiEffects = (effects: FeatureInstruction[]) => {
    setFeatureState((prev) => reduceFeatureState(prev, effects));
  };

  return (
    <main className="grid h-screen grid-cols-12 bg-background text-foreground">
      {/* LEFT: Feature Area */}
      <section className="col-span-8 border-r">
        <FeatureArea state={featureState} />
      </section>

      {/* RIGHT: Chatbot */}
      <section className="col-span-4">
        <TradingChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          onUiEffects={handleUiEffects}
        />
      </section>
    </main>
  );
}
````

---

## 3. Khái niệm “Feature”

Mỗi tác vụ UI lớn ở left side là **một feature module**:

* `MARKET_OVERVIEW` – default, giống screenshot (indices + chart + stock cards/table)
* `BUY_STOCK` – flow đặt lệnh mua
* `VIEW_NEWS` – xem news chi tiết hoặc danh sách
* `VIEW_STOCK_DETAIL` – chi tiết 1 mã (thông tin cơ bản, chart riêng)
* Có thể mở rộng: `PORTFOLIO`, `WATCHLIST`, `ALERTS`, …

Mỗi feature:

* Có **ID riêng**
* Có **type props** riêng
* Có component React riêng (dưới `components/features/`)

---

## 4. FeatureState – mô tả left side đang hiển thị gì

```ts
// types/features.ts

export type FeatureId =
  | "MARKET_OVERVIEW"
  | "BUY_STOCK"
  | "VIEW_NEWS"
  | "VIEW_STOCK_DETAIL";

export type MarketOverviewData = {
  // dữ liệu để vẽ màn giống screenshot:
  indices: {
    id: string;
    name: string;
    value: number;
    changePercent: number;
  }[];
  mainChart: {
    label: string;              // VNINDEX
    points: { time: string; value: number }[];
  };
  trendingStocks: {
    symbol: string;
    name: string;
    price: number;
    changePercent: number;
  }[];
};

export type BuyStockData = {
  symbol: string;
  currentPrice: number;
  // các bước/step của flow mua
  steps: BuyFlowStep[];
  currentStepIndex: number;
};

export type NewsData = {
  symbol?: string;
  items: {
    id: string;
    title: string;
    source: string;
    timeAgo: string;
    sentiment: "positive" | "negative" | "neutral";
  }[];
};

export type StockDetailData = {
  symbol: string;
  name: string;
  description?: string;
  price: number;
  changePercent: number;
  intradayChart: { time: string; value: number }[];
};

export type FeatureState = {
  activeFeature: FeatureId;

  marketOverview: MarketOverviewData;   // luôn giữ để quay lại nhanh
  buyStock?: BuyStockData;
  news?: NewsData;
  stockDetail?: StockDetailData;
};
```

**Default:**
`activeFeature: "MARKET_OVERVIEW"` với data giống layout trong ảnh.

---

## 5. FeatureInstruction – “lệnh UI” mà chatbot gửi lên

Chatbot engine **không thao tác DOM**, mà trả về 1 mảng `FeatureInstruction[]`.
Right side nhận, rồi gọi `onUiEffects(instructions)` lên parent.

```ts
// types/feature-instruction.ts

export type FeatureInstruction =
  | {
      type: "SHOW_MARKET_OVERVIEW";
    }
  | {
      type: "OPEN_BUY_STOCK";
      payload: {
        symbol: string;
        currentPrice: number;
        // có thể kèm luôn steps hoặc server side load thêm
        steps: BuyFlowStep[];
      };
    }
  | {
      type: "OPEN_NEWS";
      payload: NewsData;
    }
  | {
      type: "OPEN_STOCK_DETAIL";
      payload: StockDetailData;
    };
```

Ví dụ: user gõ “Mua MWG 10 cổ” → engine trả:

```json
{
  "reply": "Mình sẽ mở giao diện mua MWG cho bạn.",
  "uiEffects": [
    {
      "type": "OPEN_BUY_STOCK",
      "payload": {
        "symbol": "MWG",
        "currentPrice": 81400,
        "steps": [ ... ]
      }
    }
  ]
}
```

---

## 6. Reducer cho FeatureState

```ts
export function reduceFeatureState(
  state: FeatureState,
  effects: FeatureInstruction[]
): FeatureState {
  return effects.reduce((s, eff) => {
    switch (eff.type) {
      case "SHOW_MARKET_OVERVIEW":
        return {
          ...s,
          activeFeature: "MARKET_OVERVIEW",
        };

      case "OPEN_BUY_STOCK":
        return {
          ...s,
          activeFeature: "BUY_STOCK",
          buyStock: {
            symbol: eff.payload.symbol,
            currentPrice: eff.payload.currentPrice,
            steps: eff.payload.steps,
            currentStepIndex: 0,
          },
        };

      case "OPEN_NEWS":
        return {
          ...s,
          activeFeature: "VIEW_NEWS",
          news: eff.payload,
        };

      case "OPEN_STOCK_DETAIL":
        return {
          ...s,
          activeFeature: "VIEW_STOCK_DETAIL",
          stockDetail: eff.payload,
        };

      default:
        return s;
    }
  }, state);
}
```

---

## 7. FeatureArea – Left side renderer

```tsx
// components/features/FeatureArea.tsx

type FeatureAreaProps = {
  state: FeatureState;
};

export function FeatureArea({ state }: FeatureAreaProps) {
  switch (state.activeFeature) {
    case "MARKET_OVERVIEW":
      return <MarketOverviewFeature data={state.marketOverview} />;

    case "BUY_STOCK":
      return state.buyStock ? (
        <BuyStockFeature data={state.buyStock} />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      );

    case "VIEW_NEWS":
      return state.news ? (
        <NewsFeature data={state.news} />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      );

    case "VIEW_STOCK_DETAIL":
      return state.stockDetail ? (
        <StockDetailFeature data={state.stockDetail} />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      );

    default:
      return <MarketOverviewFeature data={state.marketOverview} />;
  }
}
```

### 7.1 `MarketOverviewFeature` – default (giống screenshot)

* Header: chọn quốc gia (“Việt Nam”), avatar cờ, dropdown.
* Dải “Các chỉ số chính”: VNINDEX, VN30, VN100, … dạng pill/card ngang.
* Biểu đồ lớn intraday (line chart) + label trục thời gian 09:00–15:00.
* Row chọn timeframe: `1 Ngày | 1 Tháng | 3 Tháng | 1 Năm | 5 Năm | Tất cả`.
* Tabs phía dưới: “Các chỉ số chính | Cổ phiếu Việt Nam | …”.
* “Cổ phiếu Việt Nam / Xu hướng của cộng đồng”: list card từng mã (HPG, MWG, …).

Feature này **luôn là background mặc định** khi không có feature khác active.

### 7.2 `BuyStockFeature`

* Bố cục step-by-step như flow mua thật:

  1. Chọn số lượng
  2. Chọn loại lệnh (Market / Limit)
  3. Kiểm tra thông tin và confirm
* Mỗi step có:

  * Tiêu đề
  * Mô tả
  * Form input (Radix + controlled form)
  * Panel “Tips / Hướng dẫn” ở cạnh hoặc ngay dưới (components hướng dẫn riêng).

### 7.3 `NewsFeature`

* List / grid news theo symbol hoặc market chung.
* Có thể click vào 1 news để mở modal chi tiết.

### 7.4 `StockDetailFeature`

* Header: symbol + name + price + %change.
* Chart riêng cho mã đó.
* Info blocks: volume, market cap, P/E,...
* Buttons: “Mua ngay” (→ có thể trigger `OPEN_BUY_STOCK` nếu user click).

---

## 8. Chatbot Panel – chỉ gửi FeatureInstruction, không render logic left

Props:

```ts
type TradingChatPanelProps = {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onUiEffects?: (effects: FeatureInstruction[]) => void;
};
```

Khi gọi API chatbot:

```ts
const response = await callChatbot(text);

// response: { reply: string; uiEffects?: FeatureInstruction[] }

setMessages((prev) => [...prev, userMessage, assistantMessageFrom(response)]);

if (response.uiEffects && onUiEffects) {
  onUiEffects(response.uiEffects);
}
```

**Tóm gọn:**

* Right side chỉ “bảo” rằng: *“mở BUY_STOCK với symbol MWG”*
* Parent cập nhật `FeatureState`
* Left side render `BuyStockFeature` với UI và logic đầy đủ.

---

## 9. Use Case Flow ví dụ

### 9.1 Default

* `FeatureState.activeFeature = "MARKET_OVERVIEW"`
* Left side giống hình: chart + indices + stock cards.
* Right side: chat trống + vài suggestion (`"Top cổ phiếu hôm nay"`, `"Mua MWG"`, …).

### 9.2 Người dùng bấm suggestion “Mua MWG”

1. Right side gửi text `"Mua MWG"` tới chatbot.
2. Engine trả:

```json
{
  "reply": "Mình mở flow mua MWG cho bạn.",
  "uiEffects": [
    {
      "type": "OPEN_BUY_STOCK",
      "payload": { "symbol": "MWG", "currentPrice": 81400, "steps": [ ... ] }
    }
  ]
}
```

3. Parent áp dụng `reduceFeatureState` → `activeFeature = "BUY_STOCK"`.
4. Left side chuyển sang UI mua MWG, nhưng **MarketOverviewData vẫn được giữ** để có thể quay lại.

---

## 10. Ghi chú cho dev

* Mỗi feature nên là **component độc lập**, có thể tự test riêng.
* Chatbot engine chỉ cần tuân thủ **contract JSON** của `FeatureInstruction`.
* UX nên có **nút “Quay lại thị trường”** trong mỗi feature để dispatch `SHOW_MARKET_OVERVIEW`.
* Có thể log lại mọi `FeatureInstruction` cho analytics: biết chatbot thường gọi feature nào.

---

> TL;DR:
>
> * **Default**: left side = MarketOverviewFeature như screenshot.
> * Mỗi tác vụ (mua, news, chi tiết) là **feature riêng**.
> * Chatbot chỉ gửi `FeatureInstruction` để **switch feature**, không embed UI.
> * Parent quản lý FeatureState, left side render theo state.

```
