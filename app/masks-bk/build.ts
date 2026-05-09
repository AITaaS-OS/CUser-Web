import fs from "fs";
import path from "path";
import { CN_MASKS } from "./cn";
import { EN_MASKS } from "./en";

import { type BuiltinMask } from "./typing";
import { sys } from "../utils/sys";

const BUILTIN_MASKS: Record<string, BuiltinMask[]> = {
  cn: CN_MASKS,
  en: EN_MASKS,
};

const dirname = path.dirname(__filename);

fs.writeFile(
  dirname + "/../../public/masks.json",
  JSON.stringify(BUILTIN_MASKS, null, 4),
  function (error) {
    if (error) {
      sys.log.error("[Build] failed to build masks", error);
    }
  },
);
