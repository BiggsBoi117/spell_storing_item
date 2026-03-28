import { useEffect, useReducer, useState } from "react";
import { asyncReducer, type AsyncState } from "../state/asyncState";
import { getSavedSpells, deleteSpell } from "../api/localApi";
import { fetchJSONunknown } from "../api/api";
import { SpellCard } from "./SpellCard";
import { LoadingScroll } from "./LoadingScroll";
import { isSpell, spellFromDTO } from "../models/spell";
import type { Spell } from "../models/spell";
import { BASE_API } from "../constants/consts";

import "../styles/SpellBook.css";

type SavedSpell = {
  spell_index: string;
  name: string;
};

export function SpellBook() {
  const [asyncState, dispatch] = useReducer(asyncReducer<SavedSpell[]>, {
    status: "idle",
  } as AsyncState<SavedSpell[]>);

  const [expandedSpell, setExpandedSpell] = useState<Spell | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      dispatch({ type: "loadStart" });
      try {
        const data = await getSavedSpells();
        dispatch({ type: "loadSuccess", data });
      } catch (e) {
        dispatch({ type: "loadError", message: "Failed to load spellbook" });
      }
    })();
  }, []);

  const handleExpand = async (spell_index: string) => {
    // Collapse if already expanded
    if (expandedIndex === spell_index) {
      setExpandedIndex(null);
      setExpandedSpell(null);
      return;
    }

    // Fetch full spell detail from D&D API
    const controller = new AbortController();
    const res = await fetchJSONunknown(
      `${BASE_API}api/2014/spells/${spell_index}`,
      controller.signal,
    );

    if (!res.ok || !isSpell(res.data)) return;

    const spell = spellFromDTO(res.data);
    setExpandedIndex(spell_index);
    setExpandedSpell(spell);
  };

  const handleDelete = async (spell_index: string) => {
    await deleteSpell(spell_index);
    const data = await getSavedSpells();
    dispatch({ type: "loadSuccess", data });
    // Collapse if the deleted spell was expanded
    if (expandedIndex === spell_index) {
      setExpandedIndex(null);
      setExpandedSpell(null);
    }
  };

  switch (asyncState.status) {
    case "idle":
      return null;
    case "loading":
      return <LoadingScroll message="Consulting the tomes..." />;
    case "error":
      return <div className="error-message">Error: {asyncState.error}</div>;
    case "success":
      return (
        <section>
          <h2>My Spellbook</h2>
          {asyncState.data.length === 0 ? (
            <p>No spells saved yet.</p>
          ) : (
            asyncState.data.map((spell) => (
              <div key={spell.spell_index} className="spellbook-entry">
                <div
                  className="spellbook-row"
                  onClick={() => handleExpand(spell.spell_index)}
                >
                  <span className="spellbook-row-name">{spell.name}</span>
                  <button
                    className="spellbook-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(spell.spell_index);
                    }}
                  >
                    Remove Spell
                  </button>
                </div>
                {expandedIndex === spell.spell_index && expandedSpell && (
                  <div className="spellbook-expanded">
                    <SpellCard state={{ data: expandedSpell }} />
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      );
  }
}
