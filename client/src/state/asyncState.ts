export type AsyncState<TSuccess> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: TSuccess }
  | { status: "error"; error: string };

export type AsyncAction<TSuccess> =
  | { type: "loadStart" }
  | { type: "loadSuccess"; data: TSuccess }
  | { type: "loadError"; message: string }
  | { type: "reset" };

export function assertNever(_x: never): never {
  throw new Error("Did not expect to get here");
}

export function asyncReducer<TSuccess>(
  _state: AsyncState<TSuccess>,
  action: AsyncAction<TSuccess>,
): AsyncState<TSuccess> {
  switch (action.type) {
    case "loadStart":
      return { status: "loading" };
    case "loadSuccess":
      return { status: "success", data: action.data };
    case "loadError":
      return { status: "error", error: action.message };
    case "reset":
      return { status: "idle" };
    default:
      return assertNever(action);
  }
}
