import { ModelConfig } from "../store";
import { Mask } from "../types";

export type BuiltinMask = Omit<Mask, "id" | "modelConfig"> & {
  isPublic: Boolean;
  modelConfig: Partial<ModelConfig>;
};
