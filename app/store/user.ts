import { StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";
import { User } from "../types";
import { ensure } from "../utils";
import { sys } from "../utils/sys";

//存储用户信息

const DEFAULT_USER_STATE = {
  //访问令牌
  accessToken: "",
  //用户Id和名称
  userId: "",
  userName: "",
  userAvatar: "1f603",
  userType: 0,
  isInputting: false
};

export const useUserState = createPersistStore(
  { ...DEFAULT_USER_STATE },

  (set, get) => ({
    hasValidToken() {
      return ensure(get(), ["accessToken", "userId"]);
    },

    updateUser(user: User) {
      set(() => user);
    },

    setInputting(flag: boolean) {
      sys.log.info("setInputting:",flag);
      get().isInputting = flag;
      sys.log.info("getInputting:",get().isInputting);
    }
  }),
  {
    name: StoreKey.User,
    version: 2,
    migrate(persistedState, version) {
      return persistedState as any;
    },
  },
);
