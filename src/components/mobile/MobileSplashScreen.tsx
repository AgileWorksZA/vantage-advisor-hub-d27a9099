import { useEffect, useState } from "react";
import vantageLogo from "@/assets/vantage-logo.png";

const MobileSplashScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[hsl(180,70%,30%)] via-[hsl(200,80%,25%)] to-[hsl(222,84%,10%)]">
      {/* Logo area */}
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
        {/* AdvisorFirst logo */}
        <div className="flex items-baseline gap-0">
          <span className="text-5xl font-extrabold tracking-tight text-white">
            Advisor
          </span>
          <span
            className="text-5xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, hsl(180, 80%, 60%) 0%, hsl(18, 86%, 56%) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            First
          </span>
        </div>

        {/* Tagline */}
        <p className="text-lg tracking-widest text-white/70 font-light">
          Your Advice Companion <span className="text-xs align-super">™</span>
        </p>

        {/* Loading bar */}
        <div className="w-48 mt-8">
          <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(180,80%,55%)] to-[hsl(18,86%,56%)] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Powered by Vantage */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2 animate-in fade-in duration-1000 delay-500">
        <span className="text-xs text-white/40 tracking-wider uppercase">powered by</span>
        <img src={vantageLogo} alt="Vantage" className="h-6 brightness-0 invert opacity-50" />
      </div>
    </div>
  );
};

export default MobileSplashScreen;
