import React, { useMemo } from "react";
import "../styles/confetti.css";

interface ConfettiProps {
  active: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ active }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, index) => ({
        id: index,
        delay: (index % 10) * 0.1,
        duration: 2 + (index % 5) * 0.3,
        left: (index / 40) * 100,
        colorIndex: index % COLORS.length,
      })),
    []
  );

  if (!active) {
    return null;
  }

  return (
    <div className="confetti">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti__piece"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            backgroundColor: COLORS[piece.colorIndex],
          }}
        />
      ))}
    </div>
  );
};

const COLORS = ["#ff7b7b", "#ffd43b", "#51cf66", "#339af0", "#845ef7"];

export default Confetti;
