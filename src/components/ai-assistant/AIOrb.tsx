import ParticleField from "./ParticleField";

interface AIOrbProps {
  isProcessing: boolean;
  onClick: () => void;
}

const AIOrb = ({ isProcessing, onClick }: AIOrbProps) => {
  return (
    <div 
      className="relative w-48 h-48 cursor-pointer group"
      onClick={onClick}
    >
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 animate-ping" 
           style={{ animationDuration: '3s' }} />
      <div className="absolute inset-2 rounded-full bg-gradient-to-r from-violet-500/30 to-cyan-500/30 animate-pulse" />
      <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 animate-spin-slow" />
      
      {/* Core orb */}
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-500 orb-glow transition-all duration-300 group-hover:scale-110">
        {/* Inner light */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-t from-transparent to-white/30" />
        
        {/* Central glow */}
        <div className="absolute inset-8 rounded-full bg-white/20 blur-sm" />
        
        {/* AI Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-2xl drop-shadow-lg">AI</span>
        </div>
      </div>

      {/* Processing particles */}
      {isProcessing && <ParticleField />}

      {/* Hover instruction */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Click to chat
      </div>
    </div>
  );
};

export default AIOrb;
