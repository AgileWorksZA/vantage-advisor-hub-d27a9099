import { useEffect, useState } from "react";
import vantageLogo from "@/assets/vantage-logo.png";

const ClientSplashScreen = () => {
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
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[hsl(220,70%,30%)] via-[hsl(240,60%,25%)] to-[hsl(260,84%,10%)]">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700 mt-24">
        <div className="w-48">
          <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(220,80%,55%)] to-[hsl(280,70%,55%)] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-baseline gap-0 mt-4">
          <span className="text-5xl font-extrabold tracking-tight text-white">
            Client
          </span>
          <span
            className="text-5xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, hsl(220, 80%, 60%) 0%, hsl(280, 70%, 55%) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            First
          </span>
        </div>

        <p className="text-lg tracking-widest text-white/70 font-light mt-2">
          Your Wealth Companion <span className="text-xs align-super">™</span>
        </p>
      </div>

      <div className="mt-auto pb-12 flex flex-col items-center gap-2 animate-in fade-in duration-1000 delay-500">
        <span className="text-xs text-white/40 tracking-wider uppercase">powered by</span>
        <img src={vantageLogo} alt="Vantage" className="h-6 brightness-0 invert opacity-50" />
      </div>
    </div>
  );
};

export default ClientSplashScreen;
