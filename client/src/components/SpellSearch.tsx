import { useEffect, useState } from "react";
import {
  getClasses,
  filterSpells,
  saveSpell,
  getSavedSpells,
} from "../api/localApi";
import { fetchJSONunknown } from "../api/api";
import { isSpell, spellFromDTO } from "../models/spell";
import type { Spell } from "../models/spell";
import { SpellCard } from "./SpellCard";
import { LoadingScroll } from "./LoadingScroll";
import "../styles/SpellSearch.css";
import { randomMessage } from "../constants/consts";
import { SpellNameSearch } from "./SpellNameSearch";

const BASE_API = import.meta.env.VITE_DND_API_URL;

export function SpellSearch() {
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");

  const [results, setResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);
  const [expandedSpell, setExpandedSpell] = useState<Spell | null>(null);
  const [loadingSpell, setLoadingSpell] = useState(false);

  const [savedIndexes, setSavedIndexes] = useState<Set<string>>(new Set());

  const [nameResults, setNameResults] = useState<
    { index: string; name: string }[] | null
  >(null);

  // Load dropdowns on mount
  useEffect(() => {
    (async () => {
      const [c, saved] = await Promise.all([getClasses(), getSavedSpells()]);
      setClasses(c);
      setSavedIndexes(
        new Set(saved.map((s: { spell_index: any }) => s.spell_index)),
      );
    })();
  }, []);

  const handleSearch = async () => {
    if (!selectedClass) return;
    setSearching(true);
    setSearched(true);
    setExpandedIndex(null);
    setExpandedSpell(null);
    const indexes = await filterSpells(selectedClass || undefined);
    setResults(indexes);
    setSearching(false);
  };

  const handleExpand = async (spell_index: string) => {
    if (expandedIndex === spell_index) {
      setExpandedIndex(null);
      setExpandedSpell(null);
      return;
    }

    setLoadingSpell(true);
    setExpandedIndex(spell_index);
    setExpandedSpell(null);

    const controller = new AbortController();
    const res = await fetchJSONunknown(
      `${BASE_API}/api/2014/spells/${spell_index}`,
      controller.signal,
    );

    if (!res.ok || !isSpell(res.data)) {
      setLoadingSpell(false);
      return;
    }

    const spell = spellFromDTO(res.data);
    setExpandedSpell(spell);
    setLoadingSpell(false);
  };

  const handleSave = async (spell_index: string, name: string) => {
    await saveSpell(spell_index, name);
    setSavedIndexes((prev) => new Set(prev).add(spell_index));
  };

  // Derived: name search takes priority over dropdown filter results
  const activeResults: { index: string; name: string }[] =
    nameResults ??
    results.map((index) => ({
      index,
      name: index
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    }));

  return (
    <section className="spell-search">
      <h2>Spell Search</h2>
      <SpellNameSearch
        onResults={(results) => setNameResults(results)}
        onClear={() => setNameResults(null)}
      />
      <div className="spell-search-filters">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <button onClick={handleSearch} disabled={searching || !selectedClass}>
          Search
        </button>
      </div>

      {searching && <LoadingScroll message={randomMessage()} />}

      {!searching && searched && results.length === 0 && !nameResults && (
        <p className="spell-search-empty">No spells found.</p>
      )}

      {!searching && activeResults.length > 0 && (
        <div className="spell-search-results">
          {activeResults.map((spell) => (
            <div key={spell.index} className="spellbook-entry">
              <div
                className="spellbook-row"
                onClick={() => handleExpand(spell.index)}
              >
                <span className="spellbook-row-name">{spell.name}</span>
                <div className="spell-search-row-actions">
                  <button
                    className={`spellbook-save ${savedIndexes.has(spell.index) ? "saved" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(spell.index, spell.name);
                    }}
                    disabled={savedIndexes.has(spell.index)}
                  >
                    {savedIndexes.has(spell.index) ? "✓ Saved" : "+ Save"}
                  </button>
                </div>
              </div>
              {expandedIndex === spell.index && (
                <div className="spellbook-expanded">
                  {loadingSpell && !expandedSpell ? (
                    <LoadingScroll message={randomMessage()} />
                  ) : expandedSpell ? (
                    <SpellCard state={{ data: expandedSpell }} />
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
