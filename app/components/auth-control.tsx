import styles from "./auth-control.module.scss";
import { IconButton, showInfo } from "./ui-lib";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AITaaSLogo, Path } from "../constant";
import Locale from "../locales";
import { getClientConfig } from "../config/client";

//用户设置和状态
import { ListItem, PasswordInput, Input, Popover, showConfirm } from "./ui-lib";
import { Avatar, AvatarPicker } from "./emoji";
import { useUserState } from "../store/user";
import { SOAInfo, PaymentInfo, Register, Feedback } from "./user-account";
import { Image, message } from "antd";
import { sys } from "../utils/sys";
import { OpenAPI } from "../openapi";
import { useMobileScreen } from "../utils";

export function AuthControl(props: { navigateTo?: Path }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const user = useUserState();
  const navigate = useNavigate();
  const isMobileScreen = useMobileScreen();

  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Setting);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function checkToken() {
    OpenAPI.userCheckTokenAndUpdateUserInfo()
      .then((result) => {
        if (result.success && result.result) {
          user.updateUser(result.result);
          sys.msg.success(Locale.Auth.Passed);
          if (props.navigateTo) {
            navigate(props.navigateTo);
          }
        } else {
          sys.msg.error(result.message);
        }
      })
      .catch((e) => {
        sys.msg.error(e.message);
      });
  };

  function payForVIP() {
    showConfirm(
      Locale.Payment.Title,
      <PaymentInfo
        payFor={Locale.Payment.PayForVIP}
        priceCode={91} />,
      false
    ).then((ok) => {
      if (ok) {
        OpenAPI.userUpgrade2VIP()
          .then((result) => {
            if (result.success && result.result) {
              user.updateUser(result.result);
              message.success(Locale.User.Account.Up2VIPSuccess);
              props.navigateTo && navigate(props.navigateTo);
            } else {
              message.error(result.message);
            }
          })
          .catch((e) => {
            message.error(e.message);
          });
      }
    })
  };

  return (
    <>
      <div className={styles["auth-control"]}>
        <div className={styles["auth-logo"]}>
          <Image
            alt="AITaaS"
            preview={false}
            src={AITaaSLogo.Card}
            className={styles["aitaas-logo"]}
          />
        </div>

        <div className={styles["auth-body"]}>

          <ListItem title={Locale.User.Avatar}>
            <Popover
              onClose={() => setShowEmojiPicker(false)}
              content={
                <AvatarPicker
                  onEmojiClick={(avatar: string) => {
                    sys.log.info("avatar>>>", avatar);
                    user.updateUser({ ...user, userAvatar: avatar });
                    setShowEmojiPicker(false);
                  }}
                />
              }
              open={showEmojiPicker}
            >
              <div
                aria-label={Locale.User.Avatar}
                tabIndex={0}
                className={styles.avatar}
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                }}
              >
                <Avatar avatar={user.userAvatar} />
              </div>
            </Popover>
          </ListItem>

          <ListItem title={Locale.User.Username}>
            <Input
              count={{
                show: true,
                max: 10,
              }}

              aria-label={Locale.User.Username}
              type="text"

              value={user.userName}
              onChange={(e) => {
                user.updateUser({ ...user, userName: e.currentTarget.value });
              }}
            />
          </ListItem>

          <ListItem title={Locale.User.AccessToken.Title}
            desc={Locale.User.AccessToken.Desc}
            vertical={isMobileScreen}
          >

            <PasswordInput
              value={user.accessToken}
              type="text"
              placeholder={Locale.User.AccessToken.Placeholder}
              onChange={(e) => {
                user.updateUser({
                  ...user,
                  accessToken: e.currentTarget.value,
                });
              }}
            />

          </ListItem>

          <div className={styles["auth-buttons"]}>
            {
              <IconButton
                text={Locale.Auth.CheckToken}
                type="primary"
                className={styles["auth-button"]}
                onClick={checkToken}
              />
            }

            {(user && user.accessToken && user.userId && user.userType == 0) && (
              <IconButton
                text={Locale.User.Account.Up2VIP}
                type="danger"
                onClick={payForVIP}
              />
            )}

            {
              (user && user.accessToken && user.userId) &&
              <IconButton
                text={Locale.User.Account.LoadBalance}
                type="danger"
                onClick={() => showConfirm(Locale.User.SOARecord.Title, <SOAInfo />)}
              />
            }

            {
              !(user && user.accessToken && user.userId) &&
              <IconButton
                text={Locale.User.Account.Register.Title}
                type="primary"
                onClick={() => setShowRegister(true)}
              />
            }

            {
              (user && user.accessToken && user.userId) &&
              <IconButton
                text={Locale.User.Feedback.Title}
                type="danger"
                onClick={() => setShowFeedback(true)}
              />
            }

            {
              (user && user.accessToken && user.userId) &&
              <IconButton
                text={Locale.User.Account.Logout}
                type="danger"
                onClick={() => {
                  showConfirm(Locale.User.Account.Logout, Locale.User.Account.LogoutConfirm, false).then((ok) => {
                    if (ok) {
                      const blankUser = {
                        ...user,
                        accessToken: "",
                        userId: "",
                      };
                      user.updateUser(blankUser);
                    }
                  })
                }}
              />
            }

          </div>

        </div>
      </div >


      {
        showRegister &&
        <Register onOK={(result) => {
          user.updateUser(result);
          setShowRegister(false);
        }}
          onClose={() => {
            setShowRegister(false);
          }}
        />
      }

      {
        showFeedback &&
        <Feedback onOK={(feedback) => {
          setShowFeedback(false);
        }}
          onClose={() => {
            setShowFeedback(false);
          }}
        />
      }
    </>
  );
}
