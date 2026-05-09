import Locale from "../../locales";
import { FileUpload, TextArea, ListItem, showConfirm } from "../../components/ui-lib";
import { EMOVideo } from "../../constant";
import { UploadFile } from "antd";
import { useUserState } from "../../store/user";
import { sys } from "../../utils/sys";
import { useAppConfig } from "../../store";
import { FILEVIEW_URL, OpenAPI } from "@/app/openapi";
import { VideoConfig, DefaultVideoConfig } from "@/app/types";
import { useMobileScreen } from "@/app/utils";
import { UploadFormat } from "@/app/utils/file";

export function PicConfigEditor(props: {
  videoConfig: VideoConfig;
  updateConfig: (updater: (config: VideoConfig) => void) => void;
}) {
  const user = useUserState();
  const isMobileScreen = useMobileScreen();
  //初始化图片
  let defaultFiles: UploadFile[] = [];
  if (props.videoConfig.picture) {
    let url = props.videoConfig.picture;
    if (!props.videoConfig.picture.startsWith("http")) {
      url = FILEVIEW_URL +
        "/" +
        props.videoConfig.picture +
        "?token=" +
        user.accessToken;
    }

    defaultFiles.push({
      uid: props.videoConfig.picture,
      name: props.videoConfig.picture,
      status: "done",
      thumbUrl: url,
      url: url,
    } as UploadFile);
  }

  const uploadCompleted = async (files: UploadFile[]) => {

    if (files.length == 0) {
      props.updateConfig(
        (config) => {
          config.picture = "";
          config.focusBox = [];
          config.mainBox = [];
        },
      );

      return;
    };

    if (!await showConfirm(null, Locale.Settings.Video.Msg.Confirm))
      return;

    sys.log.info("检测照片>>>:", files);

    const data: VideoConfig = { ...DefaultVideoConfig, picture: files[0].url ?? "", };

    const result = await OpenAPI.aiEMODetect(data);

    if (!result.success || !result.result) {
      sys.log.error("照片不符合要求>>>:", result.message);
      sys.msg.error(Locale.Settings.Video.Msg.InvalidPic);
      props.updateConfig(
        (config) => {
          config.picture = "";
          config.focusBox = [];
          config.mainBox = [];
        },
      );
    }
    else {
      sys.log.info("照片满足要求>>>:", result.result?.picture);

      props.updateConfig(
        (config) => {
          config.picture = result.result?.picture ?? "";
          config.focusBox = result.result?.focusBox ?? [];
          config.mainBox = result.result?.mainBox ?? [];
        },
      );

      //提交后台生成打招呼的视频，提升视频时的体验
      const picConfig = result.result;
      const audioConfig = useAppConfig.getState().voiceConfig;
      const textList = [
        { name: EMOVideo.HelloVideoName, text: props.videoConfig.helloText }
      ];

      const data = {
        face: picConfig,
        audio: audioConfig,
        texts: textList
      };

      OpenAPI.userSaveEMO(data).then(() => {
        sys.msg.success(Locale.Settings.Video.Msg.SetSuccess);
      }).catch(() => {
        sys.msg.error(Locale.Settings.Video.Msg.SetFailed);
      })
    }
  };

  return (
    <>
      {/* <ListItem
        title={Locale.Settings.VideoSetting.EnableDownloadVideo}
      >
        <Checkbox
          type="checkbox"
          checked={props.videoConfig.enableDownload}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.enableDownload = e.target.checked),
            )
          }
        ></Checkbox>
      </ListItem> */}

      <ListItem
        title={Locale.Settings.Video.Hello}
        desc={Locale.Settings.Video.HelloDesc}
        vertical={isMobileScreen}
      >
        <TextArea
          aria-label={Locale.Settings.Video.Hello}
          rows={2}
          style={{ width: "100%", maxWidth: "unset", textAlign: "left", resize: "vertical" }}
          value={props.videoConfig.helloText}
          onInput={(e) => {
            props.updateConfig(
              (config) => (config.helloText = e.currentTarget.value),
            )
          }}
        />
      </ListItem>

      <ListItem title={Locale.Settings.Video.Pic}
        desc={Locale.Settings.Video.PicDesc}
        descUnderTitle={true}>
        <FileUpload
          useOSS={true}
          defaultFiles={defaultFiles}
          onComplete={uploadCompleted}
          format={UploadFormat.Image}
          display="picture-card"
          maxSize={5 * 1024}
          maxCount={1}
          aspect={3 / 4}
        />
      </ListItem>
    </>
  );
}
