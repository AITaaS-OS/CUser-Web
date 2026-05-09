import styles from "./auth-page.module.scss";
import { IconButton } from "./ui-lib";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Locale from "../locales";
import { getClientConfig } from "../config/client";
import LeftIcon from "@/app/icons/left.svg";
import { AuthControl } from "./auth-control";
import { Path } from "../constant";

export function AuthPage() {
  const navigate = useNavigate();
  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Setting);
    }
  }, []);

  return (
    <div className={styles["auth-page"]}>

      <div className={styles["auth-header"]}>
        <IconButton
          icon={<LeftIcon />}
          text={Locale.Auth.Return}
          onClick={() => navigate(Path.Home)}
        ></IconButton>
      </div>

      <div className={styles["auth-content"]}>
        <AuthControl navigateTo={Path.Home} />
      </div>
    </div>
  );
}
