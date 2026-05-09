import { useEffect, useState } from "react";
import styles from "./user-account.module.scss";
import { IconButton, Input, List, ListItem, Modal, TextArea } from "./ui-lib";
import Locale from "../locales";
import { DatePicker, DatePickerProps, message, Pagination, Statistic, StatisticTimerProps, Watermark } from "antd";

import locale from 'antd/es/date-picker/locale/zh_CN';
//so stupid dayjs date library needs plugin to support week of year and weekday in antd
import dayjs, { Dayjs } from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import { OpenAPI } from "../openapi";
import { sys } from "../utils/sys";
import { User, UserRegisterInfo } from "../types";
import { useUserState } from "../store/user";
import { CheckOutlined, SearchOutlined, StopOutlined } from "@ant-design/icons";
dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)

// 付款信息
export function PaymentInfo(props: {
  payFor: string | JSX.Element;
  priceCode: number;
}) {
  const [price, setPrice] = useState<any>();

  const getPrice = () => {
    OpenAPI.userGetPrice(props.priceCode)
      .then((result) => {
        if (result.success) {
          setPrice(result.result);
        } else {
          message.error(result.message);
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };

  useEffect(() => {
    getPrice();
  }, []);

  return (
    <div className={styles["payment"]}>
      <List
        enableFold={false}
        defaultFolded={false}
        title={Locale.Payment.Alert}
      >
        <ListItem title={Locale.Payment.PayType}>
          <div className={styles["info"]}>{Locale.Payment.PayTypeBalance}</div>
        </ListItem>
        <ListItem title={Locale.Payment.PayFor}>
          <div className={styles["info"]}>{props.payFor}</div>
        </ListItem>

        {price && price.priceFixed > 0 && (
          <>
            <ListItem title={Locale.Payment.PriceFixed}>
              <div className={styles["info"]}>{price.priceFixed}</div>
            </ListItem>
            <ListItem title={Locale.Payment.PricePresent}>
              <div className={styles["info"]}>
                {price ? price.pricePresent : Locale.Common.Loading}
              </div>
            </ListItem>
          </>
        )}
        <ListItem title={Locale.Payment.Price}>
          <div className={styles["info"]}>
            {price ? price.pricePresent : Locale.Common.NoValue}
          </div>
        </ListItem>
      </List>
    </div>
  );
}

// 账单信息
export function SOAInfo(props: {}) {
  const user = useUserState();
  const defaultSOA = {
    balance: '---',
    modelUsage: {
      tokenCount: 0,
      secondCount: 0,
      picCount: 0,
      timesCount: 0,
    },
    data: {
      records: [],
      total: 0,
      size: 100,
      current: 1
    }
  };
  const [soa, setSoa] = useState<any>(defaultSOA);
  const dateFormat = 'YYYY-MM-DD';
  const getYearMonth = (date: Dayjs | any) => date.year() * 12 + date.month();
  const disabled30DaysDate: DatePickerProps['disabledDate'] = (current, { from, type }) => {
    if (from) {
      const minDate = from.add(-31, 'days');
      const maxDate = from.add(31, 'days');

      switch (type) {
        case 'year':
          return current.year() < minDate.year() || current.year() > maxDate.year();

        case 'month':
          return (
            getYearMonth(current) < getYearMonth(minDate) ||
            getYearMonth(current) > getYearMonth(maxDate)
          );

        default:
          return Math.abs(current.diff(from, 'days')) >= 31;
      }
    }

    return false;
  };

  const [startTime, setStartTime] = useState<string>(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
  const [endTime, setEndTime] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [pageNo, setPageNo] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(100);
  const [total, setTotal] = useState<number>(0);
  const { RangePicker } = DatePicker;

  const searchData = () => {
    OpenAPI.userSearchBalance({ startTime: startTime, endTime: endTime, pageSize: pageSize, pageNo: pageNo })
      .then((result) => {
        if (result.success) {
          setTotal(result.result.data.total || 0);
          setSoa(result.result);
        } else {
          setSoa(defaultSOA);
          message.error(result.message);
        }
      })
      .catch((e) => {
        setSoa(defaultSOA);
        message.error(e.message);
      });
  };

  useEffect(() => {
    searchData();
  }, []);

  return (
    <div className={styles["soa"]}>
      <Watermark content={user.userId}>
        <List enableFold={false} defaultFolded={false}>
          <ListItem title={Locale.User.Account.Balance} desc={Locale.User.Account.BalanceDesc}>
            <div className={styles["info"]}>{soa.balance}</div>
          </ListItem>
          <ListItem title={Locale.User.ModelUsage.Tokens} desc={Locale.User.ModelUsage.TokensDesc}>
            <div className={styles["info"]}>{soa.modelUsage.tokenCount}</div>
          </ListItem>
          <ListItem title={Locale.User.ModelUsage.Pic} desc={Locale.User.ModelUsage.PicDesc}>
            <div className={styles["info"]}>{soa.modelUsage.picCount}</div>
          </ListItem>
          <ListItem title={Locale.User.ModelUsage.Second} desc={Locale.User.ModelUsage.SecondDesc}>
            <div className={styles["info"]}>{soa.modelUsage.secondCount}</div>
          </ListItem>
          <ListItem title={Locale.User.ModelUsage.Times} desc={Locale.User.ModelUsage.TimesDesc}>
            <div className={styles["info"]}>{soa.modelUsage.timesCount}</div>
          </ListItem>
        </List>

        <List enableFold={true} defaultFolded={true} title={Locale.User.SOARecord.Title}>
          <ListItem vertical={true}>
            <div className={styles["soa-record-search-bar"]}>
              <div className={styles["soa-record-range-time"]}>
                {Locale.User.SOARecord.RangeTime}
              </div>
              <div className={styles["soa-record-range-selector"]}>
                <RangePicker
                  disabledDate={disabled30DaysDate}
                  locale={locale}
                  defaultValue={[dayjs().subtract(7, 'day'), dayjs()]}
                  format={dateFormat}
                  onChange={(dates, dateStrings) => {
                    if (dates?.length == 2) {
                      sys.log.info(">>>dates:{},{}", dates, dateStrings);
                      setStartTime(dateStrings[0]);
                      setEndTime(dateStrings[1]);
                    }
                  }}></RangePicker>
              </div>
              <div className={styles["soa-record-search"]}>
                <IconButton
                  className="filter-action"
                  icon={<SearchOutlined />}
                  bordered
                  onClick={() => {
                    setPageNo(1);
                    setPageSize(100);
                    searchData();
                  }}
                />
              </div>
            </div>
          </ListItem>
          <ListItem vertical={true}>
            <div className={styles["soa-record-item"]}>
              <div className={styles["soa-record-time"]}>{Locale.User.SOARecord.Time}</div>
              {/* <div className={styles["soa-record-type"]}>{Locale.User.SOARecord.Type}</div>
            <div className={styles["soa-record-status"]}>{Locale.User.SOARecord.Status}</div> */}
              <div className={styles["soa-record-code"]}>{Locale.User.SOARecord.Code}</div>
              <div className={styles["soa-record-amount"]}>{Locale.User.SOARecord.Amount}</div>
              <div className={styles["soa-record-balance"]}>{Locale.User.SOARecord.Balance}</div>
            </div>
          </ListItem>
          {
            soa.data.records.map((record: {
              id: string;
              createTime: string;
              paymentType: number;
              paymentStatus: number;
              functionCode: number;
              amount: string;
              balance: string;
            }) => (
              <ListItem key={record.id} vertical={true}>
                <div className={styles["soa-record-item"]}>
                  <div className={styles["soa-record-time"]}>{record.createTime}</div>
                  {/* <div className={styles["soa-record-type"]}>{Locale.Payment.PaymentType[record.paymentType]}</div>
                <div className={styles["soa-record-status"]}>{Locale.Payment.PaymentStatus[record.paymentStatus]}</div> */}
                  <div className={styles["soa-record-code"]}>{Locale.FunctionCode(record.functionCode)}</div>
                  <div className={styles["soa-record-amount"]}>{record.functionCode == 90 ? "+" + record.amount : "-" + record.amount}</div>
                  <div className={styles["soa-record-balance"]}>{record.balance}</div>
                </div>
              </ListItem>
            )
            )
          }
          <ListItem>
            <Pagination
              showSizeChanger
              onShowSizeChange={(current, size) => {
                setPageNo(current);
                setPageSize(size);
                searchData();
              }}
              onChange={(page, size) => {
                setPageNo(page);
                setPageSize(size);
                searchData();
              }}
              defaultCurrent={1}
              pageSize={pageSize}
              current={pageNo}
              total={total}
              showTotal={(total) => `总数： ${total}`}
            />
          </ListItem>
        </List>
      </Watermark>
    </div>
  );
}

// 充值操作
export function RechargeInfo(props: {}) {
  return (
    <div className={styles["confirm-info-container"]}>
      {Locale.Common.FunctionOffline + Locale.Common.Contact}
    </div>
  );
}

// 举报反馈
export function Feedback(props: {
  onOK: (feedback: any) => void;
  onClose: () => void
}) {
  const [feedback, setFeedback] = useState({ phone: "", detail: "" });

  return (
    <Modal
      title={Locale.User.Feedback.Title}
      onClose={props.onClose}
      hideMax={false}
      actions={
        [
          <IconButton
            text={Locale.Common.Cancel}
            icon={<StopOutlined />}
            key="cancel"
            onClick={() => {
              props.onClose();
            }}
          />,
          <IconButton
            type="primary"
            text={Locale.Common.Confirm}
            icon={<CheckOutlined />}
            key="ok"
            onClick={() => {
              if (!feedback?.detail || feedback.detail.length >= 10) {
                sys.msg.error(Locale.User.Feedback.Failed);
                return;
              }

              OpenAPI.sysFeedback(feedback).then((result) => {
                if (result.success) {
                  sys.msg.success(Locale.User.Feedback.Success);
                  props.onOK(feedback);
                }
                else {
                  sys.msg.error(Locale.User.Feedback.Failed);
                }
              })

            }}
          />,
        ]
      }
    >
      <div className={styles["feedback"]}>

        <div className={styles["feedback-desc"]}>{Locale.User.Feedback.Phone}</div>
        <Input
          aria-label={Locale.User.Account.Register.Phone}
          type="text"
          value={feedback.phone}
          onChange={(e) => {
            setFeedback({ ...feedback, phone: e.currentTarget.value });
          }}
        ></Input>
        <div className={styles["feedback-desc"]}>{Locale.User.Feedback.Desc}</div>
        <TextArea
          className={styles["feedback-text"]}
          rows={5}
          value={feedback.detail}
          onInput={(e) => {
            setFeedback({ ...feedback, detail: e.currentTarget.value });
          }}
        />

      </div>

    </Modal>
  );
}

// 注册账号
export function Register(props: {
  onOK: (user: User) => void;
  onClose: () => void
}) {
  const [registerInfo, setRegisterInfo] = useState<UserRegisterInfo>({
    userName: "",
    userAvatar: "",
    userPhone: "",
    verifyCode: "",
    password: "",
  });

  const { Timer } = Statistic;
  const [verifyCodeExpiredTime, setVerifyCodeExpiredTime] = useState(Date.now());
  const [verifyCodeDisabled, setVerifyCodeDisabled] = useState(false);
  const [verifyCodeText, setVerifyCodeText] = useState(Locale.User.Account.Register.SendVerifyCode);

  const onFinish: StatisticTimerProps['onFinish'] = () => {
    setVerifyCodeDisabled(false);
    setVerifyCodeText(Locale.User.Account.Register.SendVerifyCode);
  };

  const onChange: StatisticTimerProps['onChange'] = (val) => {
    setVerifyCodeText(val ? Math.ceil(Number(val) / 1000).toString() + "s" : "");
  };

  function validate(isRegister: boolean): boolean {
    if (registerInfo.userName && (
      registerInfo.userName.length < 5 || registerInfo.userName.length > 20)
    ) {
      sys.msg.error(Locale.User.Account.Register.UsernameValidation);
      return false;
    }

    if (!/^(13[0-9]|14[0,1,4-9]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(registerInfo.userPhone)) {
      sys.msg.error(Locale.User.Account.Register.PhoneValidation);
      return false;
    }

    if (isRegister && (!registerInfo.verifyCode || registerInfo.verifyCode.trim() === "")) {
      sys.msg.error(Locale.User.Account.Register.ValidateCodeValidation);
      return false;
    }

    return true;
  }

  return (
    <Modal
      title={Locale.User.Account.Register.Title}
      onClose={props.onClose}
      hideMax={false}
      actions={
        [
          <IconButton
            text={Locale.Common.Cancel}
            icon={<StopOutlined />}
            key="cancel"
            onClick={() => {
              props.onClose();
            }}
          />,
          <IconButton
            type="primary"
            text={Locale.Common.Confirm}
            icon={<CheckOutlined />}
            key="ok"
            onClick={() => {
              if (!validate(true)) {
                return;
              }
              OpenAPI.userRegister(registerInfo).then((result) => {
                if (result.success && result.result) {
                  sys.msg.success(Locale.User.Account.Register.Success);
                  props.onOK(result.result);
                }
                else {
                  sys.msg.error(Locale.User.Account.Register.Failed + ":" + result.message);
                }
              })

            }}
          />,
        ]
      }
    >
      <div className={styles["register"]}>
        <ListItem title={Locale.User.Account.Register.Username}
          desc={Locale.User.Account.Register.UsernameValidation}
        >
          <Input
            showCount
            maxLength={10}
            aria-label={Locale.User.Account.Register.Username}
            type="text"
            value={registerInfo.userName}
            onChange={(e) => {
              setRegisterInfo({ ...registerInfo, userName: e.currentTarget.value });
            }}
          />
        </ListItem>

        <ListItem title={Locale.User.Account.Register.Phone}>

          <Input
            showCount
            maxLength={11}
            aria-label={Locale.User.Account.Register.Phone}
            type="text"
            value={registerInfo.userPhone}
            onChange={(e) => {
              setRegisterInfo({ ...registerInfo, userPhone: e.currentTarget.value });
            }}
          />

        </ListItem>

        <ListItem title={Locale.User.Account.Register.VerifyCode} desc={Locale.User.Account.Register.VerifyCodeDesc}>
          <div className={styles["verifycode"]}>
            <Timer type="countdown" format="" value={verifyCodeExpiredTime} onChange={onChange} onFinish={onFinish} />

            <Input
              showCount
              maxLength={4}
              className={styles["verifycode-input"]}
              aria-label={Locale.User.Account.Register.VerifyCode}
              type="text"
              value={registerInfo.verifyCode}
              onChange={(e) => {
                setRegisterInfo({ ...registerInfo, verifyCode: e.currentTarget.value });
              }}
            />

            <IconButton
              className={styles["verifycode-button"]}
              text={verifyCodeText}
              type={"danger"}
              disabled={verifyCodeDisabled}
              onClick={() => {
                if (!validate(false)) {
                  return;
                }

                setVerifyCodeDisabled(true);
                setVerifyCodeExpiredTime(Date.now() + 60 * 1000);

                OpenAPI.userVerifyCode(registerInfo).then((result) => {
                  if (!result.success) {
                    sys.msg.error(Locale.Common.OperateFailed);
                    setVerifyCodeDisabled(true);
                    setVerifyCodeExpiredTime(Date.now() + 1 * 1000);
                  }
                })
              }}
            />

          </div>
        </ListItem>

      </div>

    </Modal>
  );
}