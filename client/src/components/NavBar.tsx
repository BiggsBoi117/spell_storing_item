import { useState } from "react";
import { type View } from "../models/types";

interface NavBarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function NavBar({ currentView, onNavigate }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (view: View) => {
    onNavigate(view);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <button
        className="navbar-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>
      <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <li>
          <button
            className={currentView === "mySpellbook" ? "active" : ""}
            onClick={() => handleNavigate("mySpellbook")}
          >
            My Spellbook
          </button>
        </li>
        <li>
          <button
            className={currentView === "spellSearch" ? "active" : ""}
            onClick={() => handleNavigate("spellSearch")}
          >
            Search
          </button>
        </li>
        <li>
          <button
            className={currentView === "adminPanel" ? "active" : ""}
            onClick={() => handleNavigate("adminPanel")}
          >
            Admin
          </button>
        </li>
      </ul>
    </nav>
  );
}
