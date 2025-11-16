'use client'

export function OverviewView() {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-border/50 bg-muted/20 p-12">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-muted-foreground">
          Chưa có dữ liệu hiển thị
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Hãy hỏi AI để xem biểu đồ, tin tức, hoặc bắt đầu mua cổ phiếu
        </p>
      </div>
    </div>
  )
}

