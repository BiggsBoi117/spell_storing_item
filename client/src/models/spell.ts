interface ApiReference {
  index: string;
  name: string;
  url: string;
}

export type Spell = {
  index: string;
  name: string;
  desc: string[];
  higher_level: string[] | undefined;
  range: string;
  components: ("V" | "S" | "M")[];
  material: string | undefined;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  school: ApiReference;
  classes: ApiReference[];
  subclasses: ApiReference[];
  url: string;
  updated_at: string;
};

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((item) => typeof item === "string");
}

function isApiReference(x: unknown): x is ApiReference {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as any).index === "string" &&
    typeof (x as any).name === "string" &&
    typeof (x as any).url === "string"
  );
}

export function isSpell(x: unknown): x is Spell {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as any).index === "string" &&
    typeof (x as any).name === "string" &&
    isStringArray((x as any).desc) &&
    typeof (x as any).range === "string" &&
    isStringArray((x as any).components) &&
    typeof (x as any).ritual === "boolean" &&
    typeof (x as any).duration === "string" &&
    typeof (x as any).concentration === "boolean" &&
    typeof (x as any).casting_time === "string" &&
    typeof (x as any).level === "number" &&
    isApiReference((x as any).school) &&
    Array.isArray((x as any).classes) &&
    (x as any).classes.every(isApiReference) &&
    Array.isArray((x as any).subclasses) &&
    (x as any).subclasses.every(isApiReference) &&
    typeof (x as any).url === "string" &&
    typeof (x as any).updated_at === "string"
  );
}

export function spellFromDTO(dto: Spell): Spell {
  return {
    index: dto.index,
    name: dto.name,
    desc: dto.desc,
    higher_level: dto.higher_level,
    range: dto.range,
    components: dto.components,
    material: dto.material,
    ritual: dto.ritual,
    duration: dto.duration,
    concentration: dto.concentration,
    casting_time: dto.casting_time,
    level: dto.level,
    school: dto.school,
    classes: dto.classes,
    subclasses: dto.subclasses,
    url: dto.url,
    updated_at: dto.updated_at,
  };
}
