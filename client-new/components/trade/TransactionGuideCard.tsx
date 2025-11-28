import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GUIDELINES = [
    "Tổng giá trị = Số lượng × Giá/CP. BUY trừ thẳng vào số dư, SELL cộng lại đúng tổng giá trị.",
    "Hệ thống kiểm tra số dư trước khi chấp nhận lệnh mua. Nếu thiếu tiền, API trả về lỗi 400 cùng số tiền cần thiết.",
    "Có thể hủy lệnh qua API /transactions/:id/cancel khi trạng thái chưa FAILED hoặc CANCELLED. Số dư sẽ trở lại giá trị ban đầu.",
    "Sử dụng endpoint /transactions/:userId/history và /stats để đối chiếu lịch sử, thống kê sau khi đặt lệnh.",
];

export function TransactionGuideCard() {
    return (
        <Card className="border border-gray-100 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Hướng dẫn nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
                {GUIDELINES.map((tip) => (
                    <div key={tip} className="flex gap-3">
                        <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                            •
                        </span>
                        <p>{tip}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

