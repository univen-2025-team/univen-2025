import type { Lesson, CandleData } from "./types"
import { generatedLessons } from "./generated-lessons"

export const mockLessons: Lesson[] = [
  {
    id: "1",
    symbol: "HPG",
    event_date: "2024-05-20",
    volatility_type: "strong_up",
    news_summary: "Hòa Phát báo lãi quý 1 tăng gấp 7 lần, sản lượng thép xây dựng phục hồi mạnh",
    lesson_title: "Bứt phá lợi nhuận: Tại sao HPG tăng 5.2%?",
    lesson_content: `# Bứt phá lợi nhuận: Tại sao HPG tăng 5.2%?

## Chuyện gì đã xảy ra?

Ngày 20/05, Tập đoàn Hòa Phát công bố báo cáo tài chính quý 1 với kết quả vượt mong đợi. Cổ phiếu HPG tăng từ 28,400 VND lên 29,900 VND - tăng 5.2% chỉ trong phiên sáng.

## Tin tức chính
- **Lợi nhuận sau thuế**: 2,869 tỷ đồng (gấp 7 lần cùng kỳ)
- **Sản lượng thép**: Tăng 15% so với quý trước
- **Dự án Dung Quất 2**: Đúng tiến độ, dự kiến chạy thử vào cuối năm
- **Triển vọng**: Ngành bất động sản có dấu hiệu ấm dần lên

## Tại sao giá lại tăng mạnh?

### 1. **Vượt kỳ vọng thị trường**
Các công ty chứng khoán dự phóng lợi nhuận khoảng 2,500 tỷ, nhưng con số thực tế là 2,869 tỷ. Sự chênh lệch này kích hoạt dòng tiền từ các quỹ đầu tư.

### 2. **Sự hồi phục của ngành thép**
Giá thép thế giới tăng nhẹ và nhu cầu trong nước phục hồi là tín hiệu cho thấy chu kỳ đáy đã qua.

### 3. **Khối ngoại quay trở lại mua ròng**
Sau chuỗi bán ròng, khối ngoại đã mua vào hơn 5 triệu cổ phiếu HPG trong phiên này.

## Bài học giao dịch

- **Kết quả kinh doanh là vua**: Trong dài hạn, giá cổ phiếu đi theo lợi nhuận doanh nghiệp.
- **Quan sát dòng tiền lớn**: Khi khối ngoại và tự doanh cùng mua, xu hướng tăng thường bền vững.
- **Chu kỳ ngành**: Mua cổ phiếu chu kỳ (thép, dầu khí) khi lợi nhuận bắt đầu phục hồi từ đáy.

## Những sai lầm thường gặp

❌ **Mua đuổi khi giá đã tăng trần** - Dễ bị kẹp hàng T+
❌ **Chỉ đọc tiêu đề tin tức** - Cần xem chi tiết biên lợi nhuận có cải thiện không
❌ **Bỏ qua yếu tố nước ngoài** - HPG chịu ảnh hưởng lớn từ giao dịch khối ngoại`,
    key_takeaways: [
      "Lợi nhuận phục hồi từ đáy là động lực tăng giá mạnh nhất",
      "Theo dõi dòng tiền khối ngoại với các cổ phiếu bluechip",
      "Ngành thép có tính chu kỳ cao, điểm mua tốt là khi bắt đầu hồi phục",
      "Luôn so sánh kết quả thực tế với kỳ vọng của thị trường",
    ],
    difficulty_level: "beginner",
    confidence_score: 0.95,
  },
  {
    id: "2",
    symbol: "VNM",
    event_date: "2024-05-15",
    volatility_type: "strong_down",
    news_summary: "Giá nguyên liệu sữ bột nhập khẩu tăng cao, lo ngại biên lợi nhuận gộp giảm",
    lesson_title: "Áp lực chi phí: Tin xấu khiến VNM giảm 3.8%",
    lesson_content: `# Áp lực chi phí: Tin xấu khiến VNM giảm 3.8%

## Chuyện gì đã xảy ra?

Ngày 15/05, giá sữa bột nguyên kem thế giới tăng mạnh, cùng với báo cáo phân tích cảnh báo về biên lợi nhuận của Vinamilk. Cổ phiếu giảm 3.8% từ 68,000 về 65,400 VND.

## Tin tức chính
- Giá sữa bột thế giới tăng 12% trong tháng qua
- Tỷ giá USD/VND tăng gây áp lực lên chi phí nhập khẩu
- Cạnh tranh gay gắt từ các thương hiệu sữa ngoại và sữa hạt
- Dự báo biên lợi nhuận gộp quý tới có thể giảm 2%

## Tại sao giá lại giảm?

### 1. **Lo ngại về chi phí đầu vào**
VNM nhập khẩu phần lớn nguyên liệu. Khi giá nguyên liệu và tỷ giá cùng tăng, "cơn gió ngược" kép này bào mòn lợi nhuận.

### 2. **Tăng trưởng chậm lại**
Là doanh nghiệp bão hòa, VNM khó có đột biến tăng trưởng. Nhà đầu tư thất vọng khi thấy thêm khó khăn ngắn hạn.

### 3. **Bán tháo kỹ thuật**
Giá thủng vùng hỗ trợ 66,000 kích hoạt lệnh cắt lỗ tự động của nhiều nhà đầu tư lướt sóng.

## Bài học giao dịch

1. **Hiểu mô hình kinh doanh** - Doanh nghiệp sản xuất phụ thuộc lớn vào giá nguyên liệu đầu vào.
2. **Tác động của tỷ giá** - Với doanh nghiệp nhập khẩu, tỷ giá tăng là tin xấu.
3. **Hỗ trợ kỹ thuật** - Khi thủng hỗ trợ cứng, giá thường giảm thêm 3-5% trước khi cân bằng.

## Hành động tiếp theo là gì?

Thường sau các phiên giảm mạnh do yếu tố bên ngoài (không phải nội tại doanh nghiệp xấu đi vĩnh viễn), cổ phiếu bluechip như VNM sẽ có nhịp hồi phục kỹ thuật (dead cat bounce) hoặc tích lũy lại vùng giá thấp hấp dẫn để đầu tư dài hạn nhận cổ tức.`,
    key_takeaways: [
      "Giá nguyên liệu đầu vào tăng là kẻ thù của doanh nghiệp sản xuất",
      "Quan sát tỷ giá khi đầu tư các công ty nhập khẩu nhiều",
      "Thủng hỗ trợ cứng thường dẫn đến đà bán tháo kỹ thuật",
      "Phân biệt giữa khó khăn ngắn hạn và suy yếu dài hạn",
    ],
    difficulty_level: "intermediate",
    confidence_score: 0.92,
  },
  {
    id: "3",
    symbol: "FPT",
    event_date: "2024-05-18",
    volatility_type: "strong_up",
    news_summary: "FPT ký kết hợp tác chiến lược 1 tỷ USD phát triển AI với đối tác Mỹ",
    lesson_title: "Cú hích AI: Cổ phiếu công nghệ tăng 6.2%",
    lesson_content: `# Cú hích AI: Cổ phiếu công nghệ tăng 6.2%

## Chuyện gì đã xảy ra?

FPT công bố ký biên bản ghi nhớ hợp tác phát triển AI trị giá 1 tỷ USD với một tập đoàn công nghệ lớn của Mỹ. Cổ phiếu FPT bứt phá 6.2% lên đỉnh lịch sử mới.

## Tin tức chính
- Hợp tác xây dựng nhà máy AI Factory tại Việt Nam
- Đào tạo 50,000 kỹ sư bán dẫn và AI
- Mục tiêu doanh thu từ thị trường Mỹ đạt 2 tỷ USD vào 2030
- Khẳng định vị thế công ty công nghệ số 1 Việt Nam

## Tại sao nhà đầu tư hưng phấn?

### 1. **Câu chuyện tăng trưởng mới**
Mảng xuất khẩu phần mềm vẫn tăng trưởng đều, nhưng AI và bán dẫn là "câu chuyện" (story) mới hấp dẫn hơn nhiều, giúp định giá P/E của FPT được nâng lên.

### 2. **Dòng tiền thông minh (Smart Money)**
Các quỹ ETF và quỹ chủ động liên tục giải ngân vào FPT vì đây là đại diện tốt nhất của Việt Nam trong xu hướng công nghệ toàn cầu.

### 3. **Vượt đỉnh mọi thời đại**
Về phân tích kỹ thuật, khi cổ phiếu vượt đỉnh (All Time High), không còn kháng cự (người kẹp hàng) bên trên, giá rất dễ bay cao.

## Bài học giao dịch

- **Xu hướng là bạn (Trend is your friend)**: Đừng cố đoán đỉnh các cổ phiếu công nghệ đang tăng trưởng mạnh.
- **Câu chuyện vĩ mô**: Cổ phiếu hưởng lợi từ xu hướng lớn (AI, Bán dẫn) thường tăng giá mạnh nhất.
- **Mua khi điều chỉnh**: Với các siêu cổ phiếu, những phiên điều chỉnh đỏ nhẹ là cơ hội mua, không phải để bán.

## Rủi ro cần chú ý

⚠️ **Định giá cao** - P/E của FPT đã cao hơn trung bình lịch sử, rủi ro điều chỉnh ngắn hạn.
⚠️ **Áp lực chốt lời** - Khi ai cũng có lãi, áp lực bán có thể xuất hiện bất ngờ.`,
    key_takeaways: [
      "Cổ phiếu công nghệ tăng giá nhờ kỳ vọng tăng trưởng tương lai",
      "Khi vượt đỉnh lịch sử, xu hướng tăng thường rất mạnh",
      "Đầu tư theo xu hướng vĩ mô (AI, Chip bán dẫn) mang lại hiệu suất cao",
      "Không đoán đỉnh, hãy để lãi chạy (Let profits run)",
    ],
    difficulty_level: "beginner",
    confidence_score: 0.88,
  },
  {
    id: "4",
    symbol: "VIC",
    event_date: "2024-05-16",
    volatility_type: "strong_down",
    news_summary: "VinFats điều chỉnh kế hoạch giao xe tại thị trường Mỹ, hoãn xây nhà máy",
    lesson_title: "Tin tức tiêu cực: Giảm 7.2% do lo ngại dòng tiền",
    lesson_content: `# Tin tức tiêu cực: Giảm 7.2% do lo ngại dòng tiền

## Chuyện gì đã xảy ra?

Thông tin về việc điều chỉnh lộ trình xây dựng nhà máy tại Mỹ và lùi kế hoạch giao xe khiến nhà đầu tư lo ngại về áp lực tài chính. Cổ phiếu VIC giảm sàn (gần 7%).

## Chi tiết sự kiện
- Hoãn kế hoạch vận hành nhà máy tại Mỹ sang năm sau
- Hạ mục tiêu số lượng xe giao trong quý 2
- Lo ngại về nhu cầu xe điện toàn cầu sụt giảm
- Áp lực nợ vay và chi phí lãi vay cao

## Tâm lý thị trường

### 1. **Lo ngại dòng tiền**
Dự án xe điện cần vốn đầu tư khổng lồ. Việc chậm trễ đồng nghĩa với việc "đốt tiền" lâu hơn mà chưa thu được dòng tiền về.

### 2. **Hiệu ứng domino**
VIC là cổ phiếu vốn hóa lớn, việc giảm sàn gây áp lực lên chỉ số VN-Index và tâm lý chung của thị trường, kéo theo các cổ phiếu bất động sản khác giảm theo.

### 3. **Rủi ro pháp lý tại Mỹ**
Các vụ kiện tụng (nếu có) tại thị trường Mỹ luôn là một ẩn số rủi ro lớn.

## Bài học xương máu

1. **Tránh bắt dao rơi**: Không mua khi cổ phiếu đang giảm mạnh với tin tức xấu chưa rõ ràng.
2. **Quản trị rủi ro**: Luôn có ngưỡng cắt lỗ (stop loss), đặc biệt với các cổ phiếu đang trong xu hướng giảm dài hạn (downtrend).
3. **Cẩn trọng với đòn bẩy**: Việc dùng margin với các cổ phiếu biến động mạnh như VIC rất rủi ro.

## Diễn biến tiếp theo
- Thường cổ phiếu sẽ cần thời gian tích lũy đáy (đi ngang) rất lâu sau một cú giảm sốc.
- Cần theo dõi các động thái huy động vốn mới hoặc bán tài sản để giải quyết bài toán thanh khoản.`,
    key_takeaways: [
      "Tin tức chậm tiến độ dự án ảnh hưởng trực tiếp đến dòng tiền kỳ vọng",
      "Tránh bắt đáy cổ phiếu đang trong xu hướng giảm mạnh (Downtrend)",
      "Cổ phiếu trụ giảm sàn gây ảnh hưởng tiêu cực lên toàn thị trường",
      "Luôn tuân thủ kỷ luật cắt lỗ để bảo vệ tài khoản",
    ],
    difficulty_level: "intermediate",
    confidence_score: 0.89,
  },
  ...generatedLessons,
]

export const mockChartData: {
  [key: string]: CandleData[]
} = {
  HPG: [
    { date: "2024-05-06", open: 28000, high: 28500, low: 27900, close: 28300, volume: 15600000 },
    { date: "2024-05-07", open: 28300, high: 28800, low: 28200, close: 28500, volume: 18900000 },
    { date: "2024-05-08", open: 28500, high: 28900, low: 28400, close: 28700, volume: 16500000 },
    { date: "2024-05-09", open: 28700, high: 29000, low: 28600, close: 28800, volume: 14200000 },
    { date: "2024-05-10", open: 28800, high: 28900, low: 28500, close: 28600, volume: 13800000 },
    { date: "2024-05-13", open: 28600, high: 28800, low: 28400, close: 28500, volume: 12500000 },
    { date: "2024-05-14", open: 28500, high: 28700, low: 28300, close: 28400, volume: 11900000 },
    { date: "2024-05-15", open: 28400, high: 28600, low: 28200, close: 28300, volume: 13200000 },
    { date: "2024-05-16", open: 28300, high: 28500, low: 28100, close: 28200, volume: 14500000 },
    { date: "2024-05-17", open: 28200, high: 28600, low: 28200, close: 28400, volume: 16800000 },
    { date: "2024-05-20", open: 28400, high: 29900, low: 28400, close: 29900, volume: 45600000, events: ["HPG Lợi Nhuận Tăng"] },
    { date: "2024-05-21", open: 29900, high: 30500, low: 29800, close: 30200, volume: 32100000 },
  ],
  VNM: [
    { date: "2024-05-06", open: 67000, high: 67500, low: 66800, close: 67200, volume: 2100000 },
    { date: "2024-05-07", open: 67200, high: 67400, low: 66900, close: 67000, volume: 1800000 },
    { date: "2024-05-08", open: 67000, high: 67300, low: 66800, close: 67100, volume: 1950000 },
    { date: "2024-05-09", open: 67100, high: 67500, low: 67000, close: 67300, volume: 2050000 },
    { date: "2024-05-10", open: 67300, high: 67800, low: 67200, close: 67600, volume: 2400000 },
    { date: "2024-05-13", open: 67600, high: 67900, low: 67400, close: 67800, volume: 1650000 },
    { date: "2024-05-14", open: 67800, high: 68100, low: 67500, close: 68000, volume: 1750000 },
    { date: "2024-05-15", open: 68000, high: 68200, low: 65300, close: 65400, volume: 6800000, events: ["Giá Sữa Tăng"] },
    { date: "2024-05-16", open: 65400, high: 66000, low: 65100, close: 65800, volume: 4500000 },
    { date: "2024-05-17", open: 65800, high: 66200, low: 65500, close: 65900, volume: 3200000 },
    { date: "2024-05-20", open: 65900, high: 66500, low: 65800, close: 66200, volume: 2800000 },
    { date: "2024-05-21", open: 66200, high: 66800, low: 66100, close: 66500, volume: 2500000 },
  ],
  FPT: [
    { date: "2024-05-06", open: 125000, high: 126500, low: 124800, close: 126000, volume: 3500000 },
    { date: "2024-05-07", open: 126000, high: 127200, low: 125500, close: 126800, volume: 3800000 },
    { date: "2024-05-08", open: 126800, high: 128000, low: 126500, close: 127500, volume: 4200000 },
    { date: "2024-05-09", open: 127500, high: 128500, low: 127000, close: 128200, volume: 3900000 },
    { date: "2024-05-10", open: 128200, high: 129000, low: 127800, close: 128800, volume: 3600000 },
    { date: "2024-05-13", open: 128800, high: 129500, low: 128200, close: 129200, volume: 3400000 },
    { date: "2024-05-14", open: 129200, high: 130000, low: 128800, close: 129800, volume: 4100000 },
    { date: "2024-05-15", open: 129800, high: 131000, low: 129500, close: 130500, volume: 4500000 },
    { date: "2024-05-16", open: 130500, high: 131500, low: 130000, close: 131200, volume: 3800000 },
    { date: "2024-05-17", open: 131200, high: 132000, low: 130800, close: 131800, volume: 4000000 },
    { date: "2024-05-18", open: 131800, high: 140000, low: 131800, close: 140000, volume: 8500000, events: ["FPT Hợp Tác AI"] },
    { date: "2024-05-20", open: 140000, high: 142500, low: 139000, close: 141200, volume: 6200000 },
  ],
  VIC: [
    { date: "2024-05-06", open: 45000, high: 45500, low: 44800, close: 45200, volume: 5500000 },
    { date: "2024-05-07", open: 45200, high: 45600, low: 45000, close: 45300, volume: 4800000 },
    { date: "2024-05-08", open: 45300, high: 45800, low: 45100, close: 45500, volume: 5200000 },
    { date: "2024-05-09", open: 45500, high: 46000, low: 45300, close: 45700, volume: 6100000 },
    { date: "2024-05-10", open: 45700, high: 46200, low: 45500, close: 45800, volume: 5800000 },
    { date: "2024-05-13", open: 45800, high: 46300, low: 45600, close: 45900, volume: 4200000 },
    { date: "2024-05-14", open: 45900, high: 46500, low: 45700, close: 46100, volume: 5900000 },
    { date: "2024-05-15", open: 46100, high: 46600, low: 45900, close: 46200, volume: 5100000 },
    { date: "2024-05-16", open: 46200, high: 46400, low: 42950, close: 43000, volume: 15600000, events: ["Tin Hoãn Nhà Máy"] },
    { date: "2024-05-17", open: 43000, high: 43500, low: 42500, close: 42800, volume: 9800000 },
    { date: "2024-05-20", open: 42800, high: 43200, low: 42300, close: 42500, volume: 7500000 },
    { date: "2024-05-21", open: 42500, high: 42900, low: 42100, close: 42300, volume: 6800000 },
  ],
}
