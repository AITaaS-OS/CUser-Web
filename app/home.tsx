"use client";

require("./polyfill");

import { useState, useEffect } from "react";
import styles from "./home.module.scss";
import { getCSSVar } from "./utils";
import dynamic from "next/dynamic";
import { Path, SlotID } from "./constant";
import { getISOLang } from "./locales";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { SideBar } from "./sidebar";
import { useAppConfig } from "./store/config";
import { type ClientApi, getClientApi } from "./client/api";
import { useModelProviderConfig } from "./store";
import clsx from "clsx";
import { Loading } from "./components/ui-lib";
import touch from "./utils/touch"
import { ErrorBoundary } from "./components/error";

const Settings = dynamic(async () => await import("./pages/config"), {
  loading: () => <Loading noLogo displayText />,
});

const LongVideo = dynamic(async () => (await import("./pages/aitask/mv")).MV, {
  loading: () => <Loading noLogo displayText />,
});
const ShortVideo = dynamic(async () => ((await import("./pages/aitask/dh"))).DH, {
  loading: () => <Loading noLogo displayText />,
});
const VideoChat = dynamic(async () => ((await import("./pages/video"))), {
  loading: () => <Loading noLogo displayText />,
});
const Chat = dynamic(async () => (await import("./pages/chat/chat")).Chat, {
  loading: () => <Loading noLogo displayText />,
});
const Vision = dynamic(async () => (await import("./pages/vision")), {
  loading: () => <Loading noLogo displayText />,
});

const CBC = dynamic(async () => (await import("./pages/cbc")).CBC, {
  loading: () => <Loading noLogo />,
});

const NewChat = dynamic(
  async () => (await import("./pages/chat/new-chat")).NewChat,
  {
    loading: () => <Loading noLogo />,
  },
);

const MaskPage = dynamic(
  async () => (await import("./pages/config/mask-config")).MaskListPage,
  {
    loading: () => <Loading noLogo />,
  },
);

function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

function useHtmlLang() {
  useEffect(() => {
    const lang = getISOLang();
    const htmlLang = document.documentElement.lang;

    if (lang !== htmlLang) {
      document.documentElement.lang = lang;
    }
  }, []);
}

const useHasHydrated = () => {
  //未水合前设置加载状态
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

function useMergeLLMModels() {
  const config = useAppConfig();
  const api: ClientApi = getClientApi(config.modelConfig.modelProvider);

  useEffect(() => {
    (async () => {
      const models = await api.llm.models();
      config.mergeModels(models);
    })();
  }, []);
}

function useSyncServerConfig() {
  useEffect(() => {
    useModelProviderConfig.getState().syncFromServerConfig();
  }, []);
}

export default function Home() {
  useSwitchTheme();
  useMergeLLMModels();
  useHtmlLang();
  useSyncServerConfig();

  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <Router>
      <ErrorBoundary>
        <div className={clsx(styles.container)}>
          <SideBar />
          <div className={styles["window-content"]}
            id={SlotID.AppContent}
            onTouchEnd={touch.onTouchEnd}
            onTouchMove={touch.onTouchMove}
            onTouchStart={touch.onTouchStart}
          >
            <Routes>
              <Route path={Path.Home} element={<Chat />} />
              <Route path={Path.NewChat} element={<NewChat />} />
              <Route path={Path.Masks} element={<MaskPage />} />
              <Route path={Path.Chat} element={<Chat />} />
              <Route path={Path.Setting} element={<Settings />} />
              <Route path={Path.MV} element={<LongVideo />} />
              <Route path={Path.DH} element={<ShortVideo />} />
              <Route path={Path.Video} element={<VideoChat />} />
              <Route path={Path.Vision} element={<Vision />} />
              <Route path={Path.CBC} element={<CBC />} />
            </Routes>
          </div>
        </div>
      </ErrorBoundary>
    </Router>
  );
}
