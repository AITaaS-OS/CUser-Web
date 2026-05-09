import Fuse from "fuse.js";
import { nanoid } from "nanoid";
import { StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";
import { OpenAPI } from "../openapi";
import { Prompt } from "../types";
import { Lang } from "../locales";

const SearchService = {
  ready: false,
  nameSearchEngine: new Fuse<Prompt>([], { keys: ["name"] }),
  data: [] as Prompt[],

  init(data: Prompt[]) {
    if (this.ready) {
      return;
    }
    this.data = data;
    this.nameSearchEngine.setCollection(data);
    this.ready = true;
  },

  remove(id: string) {
    this.nameSearchEngine.remove((doc) => doc.id === id);
  },

  add(item: Prompt) {
    this.nameSearchEngine.add(item);
  },

  search(text: string) {
    const userResults = this.nameSearchEngine.search(text);
    return userResults.map((v) => v.item);
  },
};

export const usePromptStore = createPersistStore(
  {
    prompts: {} as Record<string, Prompt>,
    language: undefined as Lang | undefined,
    count: 0
  },

  (set, get) => ({

    all() {
      const userPrompts = Object.values(get().prompts ?? {});
      userPrompts.sort((a, b) =>
        b.id && a.id ? b.createTime - a.createTime : 0,
      );
      return userPrompts;
    },

    get(id?: string) {
      return get().prompts[id ?? 1145141919810];
    },

    setPrompts(prompts: Prompt[]) {
      const records: Record<string, Prompt> = {};
      for (const m of prompts || []) {
        records[m.id] = m;
      }

      set(() => ({
        prompts: records,
        count: prompts.length
      }));

      SearchService.init(prompts || []);
    },

    async search(text: string) {

      if (SearchService.data.length == 0) {
        const result = await OpenAPI.aiPromptSearchData();

        if (result.success) {
          this.setPrompts(result.result?.records || []);
        }
      }

      if (text.length > 0)
        return SearchService.search(text);

      return SearchService.data;
    },
  }),
  {
    name: StoreKey.Prompt,
    version: 3,

    migrate(state, version) {
      const newState = JSON.parse(JSON.stringify(state)) as {
        prompts: Record<string, Prompt>;
      };

      if (version < 3) {
        Object.values(newState.prompts).forEach((p) => (p.id = nanoid()));
      }

      return newState as any;
    },
  },
);
