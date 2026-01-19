type WelcomeHeaderProps = {
    userName: string;
};

export default function WelcomeHeader({ userName }: WelcomeHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
                    Xin chào, {userName}! 👋
                </h1>
                <p className="text-gray-400 text-sm mt-1">Chào mừng trở lại với SampleUniven2025</p>
            </div>
        </div>
    );
}
