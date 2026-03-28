interface SpellList {
  index: string;
  name: string;
  level: number;
  url: string;
}

export function isSpellList(x: unknown): x is SpellList {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as any).index === "string" &&
    typeof (x as any).name === "string" &&
    typeof (x as any).level === "number" &&
    typeof (x as any).url === "string"
  );
}

export function spellListFromDTO(dto: SpellList): SpellList {
  return {
    index: dto.index,
    name: dto.name,
    level: dto.level,
    url: dto.url,
  };
}
