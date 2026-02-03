import { useState, useEffect, useMemo } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
}

const NightSky = () => {
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 60,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 2,
      })),
    []
  );

  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  useEffect(() => {
    const createShootingStar = () => {
      const star: ShootingStar = {
        id: Date.now(),
        startX: Math.random() * 70 + 10,
        startY: Math.random() * 25 + 5,
      };
      setShootingStars([star]);
      setTimeout(() => setShootingStars([]), 1200);
    };

    // Initial delay before first shooting star
    const initialDelay = setTimeout(() => {
      createShootingStar();
    }, 3000);

    // Recurring shooting stars
    const interval = setInterval(() => {
      createShootingStar();
    }, 5000 + Math.random() * 3000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Static Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      {/* Shooting Stars */}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-shooting-star"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
          }}
        >
          <div
            className="w-1 h-1 bg-white rounded-full"
            style={{
              boxShadow: `
                0 0 4px 1px rgba(255, 255, 255, 0.8),
                -20px 10px 2px 0 rgba(255, 255, 255, 0.4),
                -40px 20px 1px 0 rgba(255, 255, 255, 0.2),
                -60px 30px 1px 0 rgba(255, 255, 255, 0.1)
              `,
            }}
          />
        </div>
      ))}

      {/* Planets / Moons */}
      <div
        className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-purple-200/30 to-purple-400/20 animate-planet-glow"
        style={{ left: "15%", top: "12%" }}
      />
      <div
        className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-blue-200/20 to-cyan-300/10 animate-planet-glow"
        style={{ left: "82%", top: "18%", animationDelay: "1.5s" }}
      />
    </div>
  );
};

export default NightSky;
