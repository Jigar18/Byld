interface PortfolioLoaderProps {
  username: string;
}

export default function PortfolioLoader({ username }: PortfolioLoaderProps) {
  const initial = username.trim().charAt(0).toLocaleUpperCase() || "P";

  return (
    <main
      className="portfolio-loading-screen grid place-items-center overflow-hidden bg-[#07080a] text-white"
      role="status"
      aria-label={`Loading ${username || "user"} portfolio`}
    >
      <div className="relative h-32 w-32" aria-hidden="true">
        <svg
          className="h-full w-full overflow-visible"
          viewBox="0 0 128 128"
          style={{ fontFamily: "var(--font-loader-mark)" }}
        >
          <defs>
            <linearGradient id="loader-trace" x1="26" y1="28" x2="102" y2="100">
              <stop stopColor="#F4FBFF" />
              <stop offset="0.55" stopColor="#BAE6FD" />
              <stop offset="1" stopColor="#38BDF8" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          <text
            x="64"
            y="66"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="86"
            fontWeight="400"
            fill="rgba(255,255,255,0.035)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.25"
          >
            {initial}
          </text>
          <text
            x="64"
            y="66"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="86"
            fontWeight="400"
            fill="none"
            stroke="url(#loader-trace)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="34 50"
            className="animate-[portfolio-loader-trace_2.4s_linear_infinite] [filter:drop-shadow(0_0_5px_rgba(186,230,253,0.35))]"
          >
            {initial}
          </text>
        </svg>
      </div>
      <span className="sr-only">Loading portfolio</span>
    </main>
  );
}
