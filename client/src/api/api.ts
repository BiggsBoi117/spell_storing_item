import type { Result } from "../models/types";
import { BASE_API } from "../constants/consts";

export async function fetchJSONunknown(
  url: string,
  signal?: AbortSignal,
): Promise<Result<unknown>> {
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      return {
        ok: false,
        error: {
          kind: "HTTP",
          status: response.status,
          message: response.statusText,
        },
      };
    }
    try {
      const data: unknown = await response.json();
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: { kind: "parse", message: String(error) } };
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, error: { kind: "aborted" } };
    }
    return { ok: false, error: { kind: "network", message: String(error) } };
  }
}

export const searchSpellsByName = async (name: string) => {
  const res = await fetch(`${BASE_API}api/2014/spells/${name}`);
  const data = await res.json();
  return data.results as { index: string; name: string }[];
};
