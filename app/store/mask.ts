import { Lang } from "../locales";
import { StoreKey } from "../constant";
import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";
import { Mask } from "../types";
import Fuse from "fuse.js";
import { OpenAPI } from "../openapi";

const SearchService = {
  ready: false,
  nameSearchEngine: new Fuse<Mask>([], { keys: ["name"] }),
  data: [] as Mask[],

  init(data: Mask[]) {
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

  add(item: Mask) {
    this.nameSearchEngine.add(item);
  },

  search(text: string) {
    const userResults = this.nameSearchEngine.search(text);
    return userResults.map((v) => v.item);
  },
};

export const useMaskStore = createPersistStore(
  {
    masks: {} as Record<string, Mask>,
    language: undefined as Lang | undefined,
    count: 0
  },

  (set, get) => ({
    get(id?: string) {
      return get().masks[id ?? 1145141919810];
    },

    all() {

      //   let serverMasks:Mask[]=[];

      //  await http.get<Page<Mask>>(AITaaS_API_Path.AIMaskList, { "lang": "zh", "pageSize": 1000 }).then((result) => {
      //   if (result.success) {
      //     sys.log.info(">>>加载角色数据:", result);
      //     return result.result?.records || [];
      //   }
      //   else {
      //     sys.log.error(">>>加载角色数据失败:", result);
      //     return [];      
      //   }
      // });

      const userMasks = Object.values(get().masks).sort(
        (a, b) => b.createTime - a.createTime,
      );
      // const config = useAppConfig.getState();
      // if (config.hideBuiltinMasks) return userMasks;
      // const buildinMasks = BUILTIN_MASKS.map(
      //   (m) =>
      //     ({
      //       ...m,
      //       modelConfig: {
      //         ...config.modelConfig,
      //         ...m.modelConfig,
      //       },
      //     }) as Mask,
      // );
      return userMasks;
    },

    setMasks(masks: Mask[]) {
      const maskRecords: Record<string, Mask> = {};
      for (const m of masks || []) {
        maskRecords[m.id] = m;
      }

      set(() => ({
        masks: maskRecords,
        count: masks.length
      }));

      SearchService.init(masks || []);
    },

    async search(text: string) {
      if (SearchService.data.length == 0) {
        const result = await OpenAPI.aiMaskSearchData();

        if (result.success) {
          this.setMasks(result.result?.records || []);
        }
      }

      if (text.length > 0)
        return SearchService.search(text);

      return SearchService.data;
    },
  }),

  {
    name: StoreKey.Mask,
    version: 3.1,

    migrate(state, version) {
      const newState = JSON.parse(JSON.stringify(state)) as {
        masks: Record<string, Mask>;
      };

      // migrate mask id to nanoid
      if (version < 3) {
        Object.values(newState.masks).forEach((m) => (m.id = nanoid()));
      }

      if (version < 3.1) {
        const updatedMasks: Record<string, Mask> = {};
        Object.values(newState.masks).forEach((m) => {
          updatedMasks[m.id] = m;
        });
        newState.masks = updatedMasks;
      }

      return newState as any;
    },
  }
);
