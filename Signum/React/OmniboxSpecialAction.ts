import { Dic } from "./Globals";

export const specialActions: { [resultTypeName: string]: SpecialOmniboxAction } = {};

export function clearSpecialActions() {
  Dic.clear(specialActions);
}

export function registerSpecialAction(action: SpecialOmniboxAction) {
  if (specialActions[action.key])
    throw new Error(`Action '${action.key}' already registered`);

  specialActions[action.key] = action;
}

export interface SpecialOmniboxAction {
  key: string;
  allowed: () => boolean;
  onClick: () => Promise<string | undefined>;
}
