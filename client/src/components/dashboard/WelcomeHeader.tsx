type WelcomeHeaderProps = {
    userName: string;
};

export default function WelcomeHeader({ userName }: WelcomeHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#2D3748]">
                    Xin chào, {userName}! 👋
                </h1>
                <p className="text-[#718096] text-sm mt-2">Chào mừng trở lại với STOCKIE</p>
            </div>
        </div>
    );
}
