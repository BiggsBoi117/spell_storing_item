import "../styles/SpellCard.css";
import type { Spell } from "../models/spell";

interface State {
  data: Spell;
}

const levelLabels: Record<number, string> = {
  0: "Cantrip",
  1: "1st-level",
  2: "2nd-level",
  3: "3rd-level",
  4: "4th-level",
  5: "5th-level",
  6: "6th-level",
  7: "7th-level",
  8: "8th-level",
  9: "9th-level",
};

const schoolGlyphs: Record<string, string> = {
  abjuration: "A",
  conjuration: "C",
  divination: "D",
  enchantment: "En",
  evocation: "Ev",
  illusion: "I",
  necromancy: "N",
  transmutation: "T",
};

export function SpellCard({ state }: { state: State }) {
  const spell = state.data;
  const levelLabel =
    spell.level === 0
      ? "Cantrip"
      : `${levelLabels[spell.level]} ${spell.school.name}`;
  const glyph = schoolGlyphs[spell.school.index] ?? "✦";

  return (
    <div className={`spell-card school-${spell.school.index}`}>
      <span className="corner corner-tl" />
      <span className="corner corner-tr" />
      <span className="corner corner-bl" />
      <span className="corner corner-br" />

      {/* Header */}
      <header className="spell-header">
        <div className="spell-glyph">{glyph}</div>
        <div className="spell-title-block">
          <h1 className="spell-name">{spell.name}</h1>
          <p className="spell-subtitle">
            {levelLabel}
            {spell.ritual && <span className="badge badge-ritual">Ritual</span>}
            {spell.concentration && (
              <span className="badge badge-concentration">Concentration</span>
            )}
          </p>
        </div>
      </header>

      <div className="spell-divider" />

      {/* Stats */}
      <div className="spell-stats">
        <div className="stat">
          <span className="stat-label">Casting Time</span>
          <span className="stat-value">{spell.casting_time}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Range</span>
          <span className="stat-value">{spell.range}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Duration</span>
          <span className="stat-value">{spell.duration}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Components</span>
          <span className="stat-value">{spell.components.join(", ")}</span>
        </div>
      </div>

      {spell.material && (
        <p className="spell-material">
          <em>Materials:</em> {spell.material}
        </p>
      )}

      <div className="spell-divider" />

      {/* Description */}
      <div className="spell-desc">
        {spell.desc.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {/* Higher Level */}
      {spell.higher_level && spell.higher_level.length > 0 && (
        <div className="spell-higher-level">
          <span className="higher-level-label">At Higher Levels.</span>{" "}
          {spell.higher_level.join(" ")}
        </div>
      )}

      <div className="spell-divider" />

      {/* Footer — Classes & Subclasses */}
      <footer className="spell-footer">
        <div className="spell-tags-block">
          <span className="tags-label">Classes</span>
          <div className="spell-tags">
            {spell.classes.map((c) => (
              <span key={c.index} className="tag">
                {c.name}
              </span>
            ))}
          </div>
        </div>
        {spell.subclasses.length > 0 && (
          <div className="spell-tags-block">
            <span className="tags-label">Subclasses</span>
            <div className="spell-tags">
              {spell.subclasses.map((s) => (
                <span key={s.index} className="tag tag-sub">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
