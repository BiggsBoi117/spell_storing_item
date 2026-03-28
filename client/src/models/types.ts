export type FetchError =
  | { kind: "network"; message: string }
  | { kind: "HTTP"; status: number; message: string }
  | { kind: "parse"; message: string }
  | { kind: "aborted" };

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: FetchError };

export type View = "spellSearch" | "mySpellbook" | "adminPanel";
