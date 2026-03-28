import { useEffect, useState } from "react";
import "../styles/LoadingScroll.css";

interface LoadingSpinnerProps {
  message?: string;
}

const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ"];

export function LoadingScroll({
  message = "Check back later",
}: LoadingSpinnerProps) {
  const [runeIndex, setRuneIndex] = useState(0);

  // Cycle through runes for the outer ring
  useEffect(() => {
    const runeTimer = setInterval(() => {
      setRuneIndex((i) => (i + 1) % RUNES.length);
    }, 200);
    return () => clearInterval(runeTimer);
  }, []);

  return (
    <div className="loading-overlay">
      <div className="loading-card">
        {/* Corner flourishes */}
        <span className="corner corner-tl" />
        <span className="corner corner-tr" />
        <span className="corner corner-bl" />
        <span className="corner corner-br" />

        {/* Animated scroll icon */}
        <div className="scroll-spinner-wrapper">
          <div className="scroll-halo" />
          <div className="rune-ring" data-rune={RUNES[runeIndex]} />
          <img
            className="scroll-icon"
            src="/scroll_icon.png"
            alt="Loading…"
            draggable={false}
          />
        </div>

        <div className="loading-divider" />

        {/* Label + message */}
        <div className="loading-text-block">
          <p className="loading-title">Fetching Spells</p>
          <p className="loading-message">{message}</p>
        </div>
      </div>
    </div>
  );
}
