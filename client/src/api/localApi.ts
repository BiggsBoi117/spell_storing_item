const BASE_URL = import.meta.env.VITE_API_URL;

// Get all saved spells in the spellbook
export const getSavedSpells = async () => {
  const res = await fetch(`${BASE_URL}/api/mySpells`);
  return res.json();
};

// Save a spell to the spellbook
export const saveSpell = async (spell_index: string, name: string) => {
  const res = await fetch(`${BASE_URL}/api/mySpells`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ spell_index, name }),
  });
  return res.json();
};

// Remove a spell from the spellbook
export const deleteSpell = async (spell_index: string) => {
  const res = await fetch(`${BASE_URL}/api/mySpells/${spell_index}`, {
    method: "DELETE",
  });
  return res.json();
};

// Trigger a full sync of all spells from the D&D API
export const syncAllSpells = (
  onProgress: (current: number, total: number, name: string) => void,
  onDone: () => void,
  onError: () => void,
): EventSource => {
  const source = new EventSource(`${BASE_URL}/api/sync/all`);

  source.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.done) {
      onDone();
      source.close();
    } else if (data.error) {
      onError();
      source.close();
    } else {
      onProgress(data.current, data.total, data.name);
    }
  };

  source.onerror = () => {
    onError();
    source.close();
  };

  return source;
};
// Get saved spells filtered by class
export const getSpellsByClass = async (className: string) => {
  const res = await fetch(`${BASE_URL}/api/spells?class=${className}`);
  return res.json();
};

// Get saved spells filtered by subclass
export const getSpellsBySubclass = async (subclass: string) => {
  const res = await fetch(`${BASE_URL}/api/spells?subclass=${subclass}`);
  return res.json();
};

// Get all unique classes
export const getClasses = async (): Promise<string[]> => {
  const res = await fetch(`${BASE_URL}/api/classes`);
  const rows = await res.json();
  return rows.map((r: { class_name: string }) => r.class_name);
};

// Get all unique subclasses
export const getSubclasses = async (): Promise<string[]> => {
  const res = await fetch(`${BASE_URL}/api/subclasses`);
  const rows = await res.json();
  return rows.map((r: { subclass_name: string }) => r.subclass_name);
};

// Get spell indexes filtered by class and/or subclass
export const filterSpells = async (
  className?: string,
  subclass?: string,
): Promise<string[]> => {
  const params = new URLSearchParams();
  if (className) params.append("class", className);
  if (subclass) params.append("subclass", subclass);
  const res = await fetch(`${BASE_URL}/api/filter?${params.toString()}`);
  const rows = await res.json();
  return rows.map((r: { spell_index: string }) => r.spell_index);
};
