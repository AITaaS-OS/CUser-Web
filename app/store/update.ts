import { ModelProvider, StoreKey } from "../constant";
import { getClientConfig } from "../config/client";
import { createPersistStore } from "../utils/store";
import { clientUpdate, semverCompare } from "../utils";
import BotIcon from "../icons/bot.svg";
import Locale from "../locales";
import { ClientApi } from "../client/api";
import { sys } from "../utils/sys";
import { OpenAPI } from "../openapi";

const ONE_MINUTE = 60 * 1000;
const isApp = !!getClientConfig()?.isApp;

export const useUpdateStore = createPersistStore(
  {
    lastUpdate: 0,
    version: "unknown",
    remoteVersion: "",
    hasNewVersion: false,
    used: 0,
    subscription: 0,
    lastUpdateUsage: 0,
  },
  (set, get) => ({
    async getLatestVersion(force = false) {
      let version = getClientConfig()?.version ?? "";
      set(() => ({ version }));

      const shouldCheck = Date.now() - get().lastUpdate > 2 * 60 * ONE_MINUTE;
      if (!force && !shouldCheck) return;

      set(() => ({
        lastUpdate: Date.now(),
      }));

      try {
        //let remoteId = await getRemoteVersion();
        OpenAPI.sysCheckLatest()
          .then((response) => {
            if (response && response.success) {
              set(() => ({
                remoteVersion: response.result,
                hasNewVersion: semverCompare(version, response.result) === -1,
              }));
            }

            if (window.__TAURI__?.notification && isApp) {
              // Check if notification permission is granted
              window.__TAURI__?.notification
                .isPermissionGranted()
                .then((granted: any) => {
                  if (!granted) {
                    return;
                  } else {
                    // Request permission to show notifications
                    window.__TAURI__?.notification
                      .requestPermission()
                      .then((permission: any) => {
                        if (permission === "granted") {
                          if (get().hasNewVersion) {
                            const updateMessage =
                              Locale.Settings.Update.FoundUpdate(
                                `${get().remoteVersion}`,
                              );
                            // Show a notification for the new version using Tauri
                            window.__TAURI__?.notification.sendNotification({
                              title: "AITaaS",
                              body: updateMessage,
                              icon: `${BotIcon.src}`,
                              sound: "Default",
                            });
                            clientUpdate();
                          }
                        }
                      });
                  }
                });
            }
          })
          .catch((error) => {
            sys.log.error("update error>>>", error);
          });
      } catch (error) {
        sys.log.error("update error>>>", error);
      }
    },

    async updateUsage(force = false) {
      // only support openai for now
      const overOneMinute = Date.now() - get().lastUpdateUsage >= ONE_MINUTE;
      if (!overOneMinute && !force) return;

      set(() => ({
        lastUpdateUsage: Date.now(),
      }));

      try {
        const api = new ClientApi(ModelProvider.OpenAI);
        const usage = await api.llm.usage();

        if (usage) {
          set(() => ({
            used: usage.used,
            subscription: usage.total,
          }));
        }
      } catch (e) {
        sys.log.error((e as Error).message);
      }
    },
  }),
  {
    name: StoreKey.Update,
    version: 1,
  },
);
