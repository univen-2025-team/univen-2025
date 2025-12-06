type WelcomeHeaderProps = {
    userName: string;
};

export default function WelcomeHeader({ userName }: WelcomeHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                    Xin chào, {userName}! 👋
                </h1>
                <p className="text-gray-500 text-sm mt-1">Chào mừng trở lại với SampleUniven2025</p>
            </div>
        </div>
    );
}
