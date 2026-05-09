import React, { useEffect, useMemo, useState, Fragment } from "react";

import styles from "./home.module.scss";

import { IconButton } from "./components/ui-lib";

import SettingsIcon from "./assets/icons/settings.svg";
import ChatIcon from "./assets/icons/chat.svg";
import MVIcon from "./assets/icons/p2v.svg";
import DHIcon from "./assets/icons/dh.svg";
import VideoIcon from "./assets/icons/video.svg";
import CBCIcon from "./assets/icons/cbc.svg";
import CameraIcon from "./assets/icons/camera.svg";
import Locale from "./locales";

import { useAppConfig, useChatStore } from "./store";

import {
  AITaaSLogo,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  Path, SlotID
} from "./constant";

import { AITaaS_BaseUrl } from "@/app/config/env";

import { useLocation, useNavigate } from "react-router-dom";
import { isIOS, useMobileScreen } from "./utils";
import clsx from "clsx";
import { Image } from "antd";
import { MenuOutlined } from "@ant-design/icons";

export function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey) {
        if (e.key === "ArrowUp") {
          chatStore.nextSession(-1);
        } else if (e.key === "ArrowDown") {
          chatStore.nextSession(1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}

export function useToggleSideBar() {
  const config = useAppConfig();

  const onToggleSideBar = () => {
    config.update((config) => {
      config.shouldNarrow = !config.shouldNarrow;
    });
  };

  const isMobileScreen = useMobileScreen();
  const shouldNarrow = config.shouldNarrow || isMobileScreen;

  useEffect(() => {
    const barWidth = shouldNarrow ? MIN_SIDEBAR_WIDTH : MAX_SIDEBAR_WIDTH;
    const sideBarWidth = isMobileScreen ? "80vw" : `${barWidth}px`;

    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [isMobileScreen, shouldNarrow]);

  return {
    onToggleSideBar,
    shouldNarrow,
  };
}

export function SideBarContainer(props: {
  children: React.ReactNode;
  onToggle: () => void;
  shouldNarrow: boolean;
  className?: string;
}) {
  const isMobileScreen = useMobileScreen();
  const isIOSMobile = useMemo(
    () => isIOS() && isMobileScreen,
    [isMobileScreen],
  );
  const { children, className, onToggle, shouldNarrow } = props;
  return (
    <div
      id={SlotID.AppSidebar}
      className={clsx(styles.sidebar, className, {
        [styles["narrow-sidebar"]]: shouldNarrow,
      })}
      style={{
        // #3016 disable transition on ios mobile screen
        transition: isMobileScreen && isIOSMobile ? "none" : undefined,
      }}
    >
      {children}
      <div className={styles["sidebar-drag"]} onClick={() => onToggle()}>
        <MenuOutlined />
      </div>
    </div>
  );
}

export function SideBarHeader(props: {
  title?: string | React.ReactNode;
  logo?: React.ReactNode;
  children?: React.ReactNode;
  shouldNarrow?: boolean;
}) {
  const { title, logo, children, shouldNarrow } = props;

  return (
    <Fragment>
      <div
        className={clsx(styles["sidebar-header"], {
          [styles["sidebar-header-narrow"]]: shouldNarrow,
        })}
        data-tauri-drag-region
      >
        <div className={clsx(styles["sidebar-logo"], "no-dark")}>
          <a href={AITaaS_BaseUrl} target="_blank">{logo}</a>
        </div>
        <div className={styles["sidebar-title"]} data-tauri-drag-region>
          {title}
        </div>
      </div>
      {children}
    </Fragment>
  );
}

export function SideBarBody(props: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}) {
  const { onClick, children } = props;
  return <div className={styles["sidebar-body"]}>{children}</div>;
}

export function SideBarTail(props: { children: React.ReactNode }) {
  const { children } = props;

  return <div className={styles["sidebar-tail"]}>{children}</div>;
}

export function SideBar(props: { className?: string }) {
  useHotKey();
  const { shouldNarrow, onToggleSideBar } = useToggleSideBar();

  const navigate = useNavigate();
  const config = useAppConfig();
  const [logo, setLogo] = useState(AITaaSLogo.Logo);
  const location = useLocation();
  const currentPath = location.pathname;

  const refreshLogo = () => {
    setLogo(AITaaSLogo.Logo);
  };

  const logoImg = <Image
    alt="AITaaS"
    preview={false}
    title="AITaaS"
    src={logo}
    className={styles["aitaas-logo"]}
    onClick={refreshLogo}
  />

  return (
    <SideBarContainer
      onToggle={onToggleSideBar}
      shouldNarrow={shouldNarrow}
      {...props}
    >
      <SideBarHeader logo={logoImg} title="西柚" shouldNarrow={shouldNarrow}></SideBarHeader>

      <SideBarBody>

        <IconButton
          icon={<ChatIcon />}
          text={shouldNarrow ? undefined : Locale.Menu.Chat}
          className={(
            currentPath == Path.Chat ||
            currentPath == Path.Home ||
            currentPath == ""
          ) ?
            styles["sidebar-menu-select"] :
            styles["sidebar-menu"]}
          iconClassName={styles["sidebar-menu-icon"]}
          onClick={() => {
            if (config.dontShowMaskSplashScreen === true) {
              navigate(Path.Chat, { state: { fromHome: true } });
            } else {
              navigate(Path.NewChat, { state: { fromHome: true } });
            }
          }}
        />

        <IconButton
          icon={<VideoIcon />}
          text={shouldNarrow ? undefined : Locale.Menu.Video}
          className={currentPath == Path.Video ? styles["sidebar-menu-select"] : styles["sidebar-menu"]}
          iconClassName={styles["sidebar-menu-icon"]}
          onClick={() => {
            navigate(Path.Video, { state: { fromHome: true } })
          }}
        />

        <IconButton
          icon={<DHIcon />}
          text={shouldNarrow ? undefined : Locale.Menu.DH}
          className={currentPath == Path.DH ? styles["sidebar-menu-select"] : styles["sidebar-menu"]}
          iconClassName={styles["sidebar-menu-icon"]}
          onClick={() => {
            navigate(Path.DH, { state: { fromHome: true } })
          }}
        />

        <IconButton
          icon={<MVIcon />}
          text={shouldNarrow ? undefined : Locale.Menu.MV}
          className={currentPath == Path.MV ? styles["sidebar-menu-select"] : styles["sidebar-menu"]}
          iconClassName={styles["sidebar-menu-icon"]}
          onClick={() => {
            navigate(Path.MV, { state: { fromHome: true } })
          }}
        />

        <IconButton
          icon={<CBCIcon />}
          text={shouldNarrow ? undefined : Locale.Menu.CBC}
          className={currentPath == Path.CBC ? styles["sidebar-menu-select"] : styles["sidebar-menu"]}
          iconClassName={styles["sidebar-menu-icon"]}
          onClick={() => {
            useChatStore.getState().newSession();
            navigate(Path.CBC, { state: { fromHome: true } })
          }}
        />

        <IconButton
          icon={<CameraIcon />}
          text={shouldNarrow ? undefined : Locale.Menu.Vision}
          className={currentPath == Path.Vision ? styles["sidebar-menu-select"] : styles["sidebar-menu"]}
          iconClassName={styles["sidebar-menu-icon"]}
          onClick={() => {
            navigate(Path.Vision, { state: { fromHome: true } })
          }}
        />


        {/* add for AITaaS,只保留一个对话，不需要展示对话列表 */}
        {/* <ChatList narrow={shouldNarrow} /> */}
      </SideBarBody>

      <SideBarTail>
        <IconButton
          text={shouldNarrow ? undefined : Locale.Menu.Setting}
          icon={<SettingsIcon />}
          className={currentPath == Path.Setting ? styles["sidebar-menu-select"] : styles["sidebar-menu"]}
          iconClassName={styles["sidebar-menu-icon"]}
          onClick={() => {
            navigate(Path.Setting, { state: { fromHome: true } });
          }}
        />
        {/* <IconButton
                  text={shouldNarrow ? undefined : Locale.About.Title}
                  icon={<AboutIcon />}
                  className={styles["sidebar-menu"]}
                  iconClassName={styles["sidebar-menu-icon"]}
                  onClick={() => {
                      navigate(Path.About, { state: { fromHome: true } });
                  }}
                /> */}
      </SideBarTail>
    </SideBarContainer>
  );
}
