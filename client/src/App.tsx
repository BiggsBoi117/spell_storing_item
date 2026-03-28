import "./styles/App.css";
import { useState } from "react";
import { NavBar } from "./components/NavBar";
import { SpellBook } from "./components/SpellBook";
import { SpellSearch } from "./components/SpellSearch";
import { AdminPanel } from "./components/AdminPanel";

type View = "spellSearch" | "mySpellbook" | "adminPanel";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("mySpellbook");

  const renderView = () => {
    switch (currentView) {
      case "mySpellbook":
        return <SpellBook />;
      case "spellSearch":
        return <SpellSearch />;
      case "adminPanel":
        return <AdminPanel />;
    }
  };

  return (
    <>
      <header className="page-header">
        <div className="page-title-wrapper">
          <h1 className="page-title">Spell Storing Item</h1>
          <div className="page-title-rule"></div>
          <p className="page-subtitle">D&D 5e Spell API Viewer</p>
        </div>
        <NavBar currentView={currentView} onNavigate={setCurrentView} />
      </header>
      <section className="main">{renderView()}</section>
    </>
  );
}
