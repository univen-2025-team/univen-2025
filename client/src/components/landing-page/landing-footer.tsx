export function LandingFooter() {
    return (
        <footer className="py-16 px-6 border-t border-white/10 bg-[#020203]">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-2xl font-bold text-white tracking-tighter">
                                Stockie
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Nền tảng đầu tư chứng khoán thông minh cho mọi người
                        </p>
                    </div>
                    {['Sản phẩm', 'Công ty', 'Hỗ trợ'].map((col, idx) => (
                        <div key={idx}>
                            <h4 className="font-bold text-white mb-6">{col}</h4>
                            <ul className="space-y-4 text-slate-400 text-sm">
                                {[1, 2, 3].map((i) => (
                                    <li key={i}>
                                        <a
                                            href="#"
                                            className="hover:text-violet-400 transition-colors"
                                        >
                                            {col === 'Sản phẩm'
                                                ? ['Tính năng', 'Bảng giá', 'API'][i - 1]
                                                : col === 'Công ty'
                                                  ? ['Về chúng tôi', 'Blog', 'Tuyển dụng'][i - 1]
                                                  : [
                                                        'Trung tâm trợ giúp',
                                                        'Liên hệ',
                                                        'Điều khoản'
                                                    ][i - 1]}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="pt-8 border-t border-white/10 text-center text-slate-500">
                    <p>© 2025 Stockie. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
