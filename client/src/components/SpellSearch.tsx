import { useEffect, useReducer, useState } from "react";
import { asyncReducer, type AsyncState } from "../state/asyncState";
import {
  getClasses,
  filterSpells,
  saveSpell,
  getSavedSpells,
  searchSpellsByNameLocal,
} from "../api/localApi";
import { fetchJSONunknown, searchSpellsByName } from "../api/api";
import { isSpell, spellFromDTO } from "../models/spell";
import type { Spell } from "../models/spell";
import { SpellCard } from "./SpellCard";
import { LoadingScroll } from "./LoadingScroll";
import { randomMessage, BASE_API } from "../constants/consts";
import { SpellNameSearch } from "./SpellNameSearch";
import "../styles/SpellSearch.css";
import { type SpellResult } from "../models/types";

export function SpellSearch() {
  const [asyncState, dispatch] = useReducer(asyncReducer<SpellResult[]>, {
    status: "idle",
  } as AsyncState<SpellResult[]>);

  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");

  const [nameQuery, setNameQuery] = useState<string>("");

  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);
  const [expandedSpell, setExpandedSpell] = useState<Spell | null>(null);
  const [loadingSpell, setLoadingSpell] = useState(false);

  const [savedIndexes, setSavedIndexes] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const [c, saved] = await Promise.all([getClasses(), getSavedSpells()]);
      setClasses(c);
      setSavedIndexes(
        new Set(saved.map((s: { spell_index: string }) => s.spell_index)),
      );
    })();
  }, []);

  const handleSearch = async () => {
    if (!selectedClass && !nameQuery.trim()) return;
    dispatch({ type: "loadStart" });
    setExpandedIndex(null);
    setExpandedSpell(null);
    try {
      let results: SpellResult[];

      if (selectedClass) {
        const indexes = await filterSpells(selectedClass);
        results = indexes.map((index) => ({
          index,
          name: index
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
        }));

        if (nameQuery.trim()) {
          const q = nameQuery.trim().toLowerCase();
          results = results.filter((s) => s.name.toLowerCase().includes(q));
        }
      } else {
        // Search local DB first
        const localResults = await searchSpellsByNameLocal(nameQuery.trim());

        if (localResults.length > 0) {
          results = localResults.map((s) => ({ index: s.index, name: s.name }));
        } else {
          const apiResults = await searchSpellsByName(nameQuery.trim());
          results = apiResults.map((s) => ({ index: s.index, name: s.name }));
        }
      }

      dispatch({ type: "loadSuccess", data: results });
    } catch (e) {
      dispatch({ type: "loadError", message: "Failed to fetch spells" });
    }
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
      `${BASE_API}api/2014/spells/${spell_index}`,
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

  const activeResults: SpellResult[] =
    asyncState.status === "success" ? asyncState.data : [];

  const showEmpty =
    asyncState.status === "success" && asyncState.data.length === 0;

  const renderResults = () => (
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
                disabled={
                  asyncState.status === "loading" ||
                  (savedIndexes.has(spell.index) && !nameQuery.trim())
                }
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
  );

  return (
    <section className="spell-search">
      <h2>Spell Search</h2>
      <SpellNameSearch
        value={nameQuery}
        onChange={setNameQuery}
        onSearch={handleSearch}
      />
      <div className="spell-search-filters">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="all">All Classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          disabled={asyncState.status === "loading" || !selectedClass}
        >
          {asyncState.status === "loading" ? "Searching..." : "Search"}
        </button>
      </div>

      {asyncState.status === "loading" && (
        <LoadingScroll message={randomMessage()} />
      )}
      {asyncState.status === "error" && (
        <div className="error-message">{asyncState.error}</div>
      )}
      {showEmpty && <p className="spell-search-empty">No spells found.</p>}
      {activeResults.length > 0 && renderResults()}
    </section>
  );
}
