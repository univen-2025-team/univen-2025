type WelcomeHeaderProps = {
  userName: string;
};

export default function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  return (
    <div className="bg-primary rounded-2xl shadow-xl p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Xin chào, {userName}! 👋
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Chào mừng trở lại với SampleUniven2025
          </p>
        </div>
        <div className="hidden md:block">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

