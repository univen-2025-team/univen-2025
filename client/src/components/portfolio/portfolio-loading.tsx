'use client';

const BORDER = '#E5E7EB';
const MUTED = '#E2E8F0';

export function PortfolioLoading() {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead style={{ backgroundColor: MUTED }}>
                    <tr>
                        {[
                            'Mã CK',
                            'Tên',
                            'Số lượng',
                            'Giá TB',
                            'Giá hiện tại',
                            'Đã đầu tư',
                            'Giá trị HT',
                            'Lãi/Lỗ',
                            'Thao tác'
                        ].map((label) => (
                            <th
                                key={label}
                                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]"
                            >
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <tr
                            key={i}
                            className="animate-pulse border-b"
                            style={{ borderColor: BORDER }}
                        >
                            <td className="px-6 py-4">
                                <div
                                    className="h-5 w-16 rounded"
                                    style={{ backgroundColor: MUTED }}
                                />
                            </td>
                            <td className="px-6 py-4">
                                <div
                                    className="h-5 w-24 rounded"
                                    style={{ backgroundColor: MUTED }}
                                />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div
                                    className="ml-auto h-5 w-12 rounded"
                                    style={{ backgroundColor: MUTED }}
                                />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div
                                    className="ml-auto h-5 w-20 rounded"
                                    style={{ backgroundColor: MUTED }}
                                />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div
                                    className="ml-auto h-5 w-20 rounded"
                                    style={{ backgroundColor: MUTED }}
                                />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div
                                    className="ml-auto h-5 w-24 rounded"
                                    style={{ backgroundColor: MUTED }}
                                />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div
                                    className="ml-auto h-5 w-24 rounded"
                                    style={{ backgroundColor: MUTED }}
                                />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div
                                    className="ml-auto h-5 w-16 rounded"
                                    style={{ backgroundColor: MUTED }}
                                />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div
                                    className="mx-auto h-8 w-12 rounded"
                                    style={{ backgroundColor: MUTED }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
