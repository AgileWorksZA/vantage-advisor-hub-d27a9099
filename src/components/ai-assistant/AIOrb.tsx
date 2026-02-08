import { cn } from "@/lib/utils";
import ParticleField from "./ParticleField";

interface AIOrbProps {
  isProcessing: boolean;
  isChatOpen: boolean;
  onClick: () => void;
}

const AIOrb = ({ isProcessing, isChatOpen, onClick }: AIOrbProps) => {
  return (
    <div className="relative w-24 h-24 group">
      {/* Core orb - THIS is the click target */}
      <div 
        className={cn(
          "absolute inset-4 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-500 transition-all duration-300 cursor-pointer",
          !isChatOpen && "group-hover:scale-110"
        )}
        onClick={onClick}
>
        {/* Inner light - 3D lit-from-above effect */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-t from-transparent to-white/30" />
        {/* Central glow - depth */}
        <div className="absolute inset-4 rounded-full bg-white/20 blur-sm" />
        {/* AI Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg drop-shadow-lg">AI</span>
        </div>
      </div>

      {/* Processing particles */}
      {isProcessing && <ParticleField />}

      {/* Hover instruction */}
      {!isChatOpen && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Click to chat
        </div>
      )}
    </div>
  );
};

export default AIOrb;
