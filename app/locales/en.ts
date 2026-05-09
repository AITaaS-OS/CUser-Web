import { getClientConfig } from "../config/client";
import { BasePath } from "@/app/config/env";
import { Path } from "../constant";
import { SubmitKey } from "../store/config";
import { LocaleType } from "./index";
// if you are adding a new translation, please use PartialLocaleType instead of LocaleType

const isApp = !!getClientConfig()?.isApp;
const en: LocaleType = {
  AboutMe: "你好，我是AITaaS，一款支持文本、图片、语音、视频等多媒体内容识别、生成和融合的AI智能创作平台。",
  Error: {
    TicketInvalid:
      `❌ 令牌无效, 请关注公众号AITaaS获取有效令牌或通过手机验证码登录`,
    Unauthorized:
      `❌ 缺少有效的令牌，点击[设置](` +
      BasePath +
      "#" +
      Path.Setting +
      `)获取并设置访问令牌 ❌ `,
    InputError: `❌ 格式错误，请修正数据格式后重试 ❌ `,
    NetError:
      `❌ 无法连接到服务器，请检查令牌是否有效，点击[设置](` +
      BasePath +
      "#" +
      Path.Setting +
      `)获取访问令牌 ❌ `,
    ModelError:
      `❌ 无法调用模型，请检查是否正确配置了模型地址和APIKey，点击[设置](` +
      BasePath +
      "#" +
      Path.Setting +
      `) ❌ `,
    CommonError: `❌ 暂无法处理，请稍后再试 ❌ `,
    NoPermission:
      `❌ 没有权限使用该功能，点击[设置](` +
      BasePath +
      "#" +
      Path.Setting +
      `)升级 ❌ `,
  },
  About: {
    Title: "关于",
    Version: "版本",
    Author: "作者",
    Source: "源码",
    License: "开源协议",
    Contact: "联系",
    Donate: "捐赠",
    Feedback: "反馈",
    Privacy: "隐私",
    Terms: "条款",
    Copyright: "版权",
    SummaryTitle: "简介",
    Summary:
      "AITaaS系列软件包含Web端、移动端、桌面端。其前身是为企业数字化转型打造的行业普适的业务应用系统，近年随着AI大模型的广泛应用，AITaas结合传统的业务应用，集成AI各种应用场景，提供多种功能，如：AI对话、知识库、知识图谱、知识库管理、知识库同步、知识库导出、知识库导入、知识库分享、知识库搜索、知识库搜索历史、知识库搜索结果、知识库搜索结果详情、知识库搜索结果详情、知识库搜索结果详情、知识库搜索结果详情、知识库搜索结果详情、知识库搜索结果详情、",
    WebTitle: "Web端",
    WebDesc: "",
    APPTitle: "移动端",
    APPDesc: "",
    DesktopTitle: "桌面端(React 轻客户端)",
    DesktopDesc: "",
    WinFormTitle: "桌面端(WinForm 富客户端)",
    WinFormDesc: "",
  },
  Auth: {
    CheckToken: "校验令牌",
    Passed: "验证通过",
    Return: "返回",
    Title: "请输入访问令牌",
    Tips: "关注微信公众号AITaaS即可获得访问令牌",
    SubTips: "",
    Input: "在此处填写访问码",
    Confirm: "确认",
  },
  User: {
    Avatar: "头像",
    Username: "用户名",
    Phone: "手机号",
    AccessToken: {
      Title: "*访问令牌",
      Desc: "关注微信公众号AITaaS即可获得令牌",
      Placeholder: "请输入令牌",
    },
    Account: {
      Title: "账户",
      Up2VIP: "升级到VIP",
      Up2VIPSuccess: "升级成功",
      LoadBalance: "查询账单",
      Balance: "账户余额（元）",
      BalanceDesc: "账户当前剩余可用额度",
      Recharge: "账户充值",
      Register: {
        Title: "注册账号",
        Avatar: "头像",
        Username: "*用户名",
        UsernameValidation: "用户名需为6-20位字母或数字组合",
        Phone: "*手机号",
        PhoneValidation: "请输入正确的手机号",
        PhonePlaceholder: "请输入手机号",
        VerifyCode: "*验证码",
        VerifyCodeDesc: "请输入发送到您手机的速通互联验证码",
        SendVerifyCode: "发送验证码",
        ValidateCodeValidation: "验证码不正确",
        Success: "欢迎使用AITaaS为您提供的AI服务！",
        Failed: "操作失败，请确保账号信息正确无误",
      },
      Login: "登录账号",
      Logout: "退出账号",
      LogoutConfirm: "确定退出账号吗？",
    },
    Feedback: {
      Title: "举报反馈",
      Phone: "联系方式",
      Desc: "请详细描述举报或反馈的内容",
      Success: "提交成功，我们会尽快处理，感谢反馈！",
      Failed: "请填写联系方式和反馈内容，内容不少于10个字",
    },
    ModelUsage: {
      Title: "大模型使用情况",
      Tokens: "已用的Token（数量）",
      TokensDesc: "大模型累计使用的文本Token总和",
      Times: "已用的音频（次数）",
      TimesDesc: "累计音频识别和合成的总次数",
      Pic: "已用的图片（张）",
      PicDesc: "大模型累计使用的图片总数量",
      Second: "已用的视频（秒）",
      SecondDesc: "大模型累计使用的视频总长度",
    },
    SOARecord: {
      Title: "账单明细",
      Id: "订单号",
      Time: "时间",
      Code: "功能点",
      Type: "类型",
      Status: "状态",
      Amount: "金额(元)",
      Balance: "余额(元)",
      RangeTime: "时间范围",
    },
  },
  Common: {
    View: "查看",
    Add: "新增",
    Edit: "编辑",
    Delete: "删除",
    DeleteConfirm: "确认删除？",
    DeleteSuccess: "删除成功！",
    DeleteFailed: "删除失败！",
    NoData: "没有数据",
    Reload: "重新加载",
    Cancel: "取消",
    Confirm: "确认",
    Info: "信息",
    Export: "导出",
    Import: "导入",
    Save: "保存",
    SaveSuccess: "保存成功！",
    SaveFailed: "保存失败",
    Sync: "同步",
    Select: "选择",
    Close: "关闭",
    Config: "配置",
    Copy: "复制",
    CopySuccess: "已写入剪贴板",
    CopyFailed: "复制失败，请赋予剪贴板权限",
    Loading: "加载中...",
    Upload: "上传",
    UploadSuccess: "上传成功。",
    UploadFailedOnSize: "上传失败，文件大小超过限制。",
    UploadFailedOnFormat: "上传失败，暂不支持该格式。",
    UploadFailed: "上传失败。",
    Download: "下载",
    DownloadSuccess: "内容已下载到您的目录。",
    DownloadFailed: "下载失败。",
    InvalidData: "数据不正确",
    NoValue: "---",
    FunctionOffline: "功能暂未开放。",
    Contact: "联系微信公众号或星球号:AITaaS",
    Setting: "设置",
    Start: "开始",
    Search: "查找",
    Developing: "One-click sharing to social media such as Moments, Official Accounts, Douyin, and Xiaohongshu is under development. Stay tuned!",
    OperateSuccess: "操作成功",
    OperateFailed: "操作失败",
    Typing: "正在输入…",
    Processing: "正在处理…",
  },
  Menu: {
    Chat: "角色扮演",
    MV: "融合视频",
    DH: "妙想抖红",
    Video: "视频聊天",
    Setting: "用户设置",
    CBC: "跨境交流",
    Vision: "摄像头",
  },
  FunctionCode: (code: number) => {
    switch (code) {
      case 0:
        return "未知";
      case 1:
        return "AI对话";
      case 2:
        return "图生视频";
      case 3:
        return "文生视频";
      case 4:
        return "语音合成";
      case 5:
        return "语音识别";
      case 6:
        return "EMO检测";
      case 7:
        return "EMO视频";
      case 8:
        return "文本翻译";
      case 9:
        return "视觉识别";
      case 10:
        return "文件识别";
      case 11:
        return "首尾帧视频";
      case 12:
        return "文生图";
      case 13:
        return "语音对话";
      case 14:
        return "文案扩写";
      case 15:
        return "语音转译文本";
      case 16:
        return "编辑图像";
      case 17:
        return "数字人";
      case 18:
        return "视频配音";
      case 19:
        return "用户画像";
      case 90:
        return "充值";
      case 91:
        return "升级到VIP";
      case 92:
        return "升级到SVIP";
      case 80:
        return "下载视频";
      case 81:
        return "升级优先级";
      default:
        return "未知";
    }
  },
  Cons: {
    ChatOutputMode: (key: string) => {
      switch (key) {
        case "Common":
          return {
            title: "普通模式",
            desc: "普通模式适用于低频交互场景"
          };
        case "Stream":
          return {
            title: "打字机模式",
            desc: "适用于长文本输出的场景，可以及时看到文本输出"
          }
        case "Socket":
          return {
            title: "独立通道模式",
            desc: "适用于高频交互场景和任务型场景，例如生成图片、视频等耗时任务"
          }
        default:
          return {
            title: "",
            desc: ""
          };
      }
    },
    ExportType: (key: string) => {
      switch (key) {
        case "text":
          return {
            title: "文本格式",
          };
        case "image":
          return {
            title: "图片格式",
          }
        case "json":
          return {
            title: "JSON数据",
          }
        default:
          return {
            title: "",
            desc: ""
          };
      }
    }
  },
  Payment: {
    Title: "确认支付信息",
    Alert: "正在进行支付操作，请务必仔细确认",
    Confirm: "确认支付",
    PayType: "支付方式",
    PayTypeBalance: "账户余额支付",
    PricePresent: "现价(元)",
    PriceFixed: "原价(元)",
    Price: "支付金额(元)",
    PayFor: "支付用途",
    PayForVIP: "升级成为VIP",
    PayForSVIP: "升级成为SVIP",
    PayForUpgradePriority: "提升当前任务的优先级为最高优先级",
    PayForDownloadVideo: "下载当前任务生成的AI视频",
    Success: "支付成功",
    Failed: "支付失败",
    PaymentStatus: [
      "未知",
      "成功",
      "失败",
    ],
    PaymentType: [
      "余额支付",
      "微信支付",
      "支付宝支付",
    ],
  },
  OSS: {
    SignatureFailed: "无法获取上传签名",
  },
  P2V: {
    Name: "AI视频",
    Page: {
      MVTitle: "AI融合视频",
      MVSubTitle: "生成电商主视频，解说视频等长视频",
      DHTitle: "奇思妙想一键成片",
      DHSubTitle: "一句话生成抖音小红书等社交文案和短视频",
      Search: "搜索任务",
      LeftDay: (count: number) => `(保留期剩余 ${count} 天)`,
      Speeding: "加速中",
      PrepareResult: "正在准备视频下载地址..."
    },
    Editor: {
      EditTask: "编辑任务",
      TaskInfo: "*任务信息",
      EditShot: "编辑分镜内容",
      AudioText: "视频文案：",
      AudioTextDesc:
        "注意：正常语速下大概4字/秒，如果生成的视频时长设置为5秒钟，则文案最好是20字左右，文案过短或过长则会导致视频观感不佳！",
      Prompt: "提示词(可选):",
      PromptDesc: "用于描述图片如何生成视频。例如：让小猫跑起来，让背景中的水面波动等，描述尽可能的突出重点和主题，避免过度动画！",
      Picture: "生成视频的图片",
      PictureDesc: "",
      TaskText: "*文案内容",
      TaskMaterial: "*视频素材",
      Title: "音视频设置项",
      UniTitle: "统一设置项(影响所有视频设置)",
      TaskDesc: "任务描述(可选)",
      TaskPriority: "任务优先级",
      CreateText: "生成文案",
      EditText: "编辑文案",
      SaveText: "保存文案",
      CreatingText: "正在生成文案...",
      TaskName: "*任务名称",
      TaskPrompt: "*文案提示词(输入/查看示例)",
      TaskPromptPlaceholder: "请输入文案提示词，或输入/查看示例",
      TaskPromptDesc: "尽量详细描述，例如：我的一名旅游博主，用小红书的爆款文案格式介绍深圳梅沙尖",
      Category: "类别",
      VideoTarget: "短视频平台",
      HasMaterial: "*上传图片或视频素材",
      MaterialDesc: "素材格式支持jpg/png/mp4，大小不超过10M",
      SelectPicture:
        "*生成视频所用的图片和对应的文案(注意图片次序,首尾图片应突出重点和质量)",
      UploadPicture: "上传图片",
    },
    Validate: {
      InvalidName: "名称不正确",
      InvalidDesc: "提示词需大于10个字",
      InvalidText: "缺少文案内容",
      InvalidSetting: "必填项缺少数据",
      InvalidPictureCount:
        "普通用户最多只能配置1-5张图片，生成的视频时长不超过1分钟；VIP用户可配置1-360张图片，视频时长可达1小时",
    },
    Action: {
      Satrt: "开始任务",
      StartConfirm: "确定开始生成视频吗？确认后任务不允许修改，请谨慎操作！",
      Pay4Video: "下载视频",
      Pay4Priority: "加速",
      PayConfirm:
        "因处理视频需要占用大量付费资源，该功能需要付费使用，确定从账户余额支付9.9元吗？",
      Download: "下载视频",
      Retry: "重试",
      Audio: "试听",
      ReDo: "返工"
    },
    Status: [
      "任务已删除",
      "任务已创建",
      "任务排队中",
      "任务进行中",
      "任务已完成",
      "任务已失败",
      "待付款",
      "待下载",
      "任务已关闭",
    ],
  },
  VideoChat: {
    Title: "视频通话（内测中）",
    DownloadVideo: "下载视频",
    Function: {
      ChangeSkin: "换衣饰",
      ChangeSkinPrompt: "图1中的人物穿戴着图2中的衣饰，人物和衣饰搭配自然协调，具有模特一般的气质",

      ChangeBG: "换背景",
      ChangeBGPrompt: "把图2的人物替换为图1中的人物，整体保持自然和谐",

      DigitalHuman: "数字人",
      DigitalHumanTitle: "音频内容",
      DigitalHumanDesc: "结合设置中的声音配置和图像生成自然的说话、唱歌或表演视频，支持半身照和全身照",

      EMO: "对口型",
      EMOTitle: "音频内容",
      EMODesc: "结合设置中的声音配置和图像生成人物动态肖像视频，仅支持半身照",

      P2V: "动起来",
      P2VTitle: "音频内容",
      P2VPrompt: "提示词(可选):描述如何驱动图像动起来",
      P2VConfirm: "确定开始处理吗？",
      P2VDesc: "结合设置中的声音配置和图像生成视频，支持各种类型的图片和自定义提示词",

      EditImage: "试一试",
      EditImageTitle: "提示词",
      EditImageDesc: "详细描述如何编辑这张图片",
      EditImageDemo: "例如：她举起双手，手掌朝向镜头，手指张开，做出一个俏皮的姿势； 让她闭上双眼等等",

      ChangeActor: "穿越",
      ChangeActorPrompt: "提示词(可选)：描述如何融入视频中",
      ChangeActorDesc: "将照片中的人物融入视频中",
    },
    Error: {
      NoPic: "需先设置一张视频对象照片",
      Common: "AI处理繁忙，请稍后再试",
      Processing: "AI处理中，此过程需要耗费3分钟左右，请耐心等待...",
      CannotSpeak: "未能开启语音权限，请在应用权限中允许使用麦克风等媒体权限",
    },
  },
  Voice: {
    Title: "语音对话",
    Error: {
      RecorderError: "音频环境初始化失败",
      TTSError: "语音合成失败",
      STTError: "未能识别语音",
      SpeakTooShort: "说话时间过短，请至少说3秒钟以上",
    },
    Action: {
      StartVoice: "点击说话",
      StopVoice: "取消说话",
      SendVoice: "点击发送",
      CloseVoice: "关闭对话",
    },
  },
  Chat: {
    Title: "交流",
    SubTitle: (count: number) => `${count} messages`,
    DefaultTopic: "闲聊",
    Hello: "你好，我是AITaaS，一款支持文本、图片、语音、视频等多媒体内容识别、生成和融合的AI智能创作平台。\n试试问我一些问题吧！例如：\n- ✍️ 帮我写一首关于春天的诗\n- 🎨 给我画一幅夏日海滩的风景图\n- 🎥 用附件图片生成一段宣传短视频\n- 🎵 识别附件音频中的说话内容\n- 🖼️ 分析附件图片中的物体或场景信息\n- 📹 解读附件视频中的行为或文字信息\n- 📚 总结附件或链接中的核心内容\n- ➗ 解答数学计算题或逻辑问题\n\n更多创意玩法等你来探索...",
    Prompt: {
      System: "你是一个支持文本、图片、语音、视频等多媒体内容识别、生成和融合的AI智能创作助手，能够帮助用户完成各种创意内容的生成和处理任务，请根据用户的输入提供专业、详细且有创意的回答。",
      History: (content: string) => "这是历史聊天总结作为前情提要：" + content,
      Topic: "返回这句话的简要主题，如果没有主题，请指导用户输入聊天主题",
      Summarize: "简要总结一下对话内容，用作后续的上下文提示 prompt，控制在 200 字以内",
    },
    EditRoomNum: {
      Title: "连接会议室",
      Topic: {
        Title: "会议室编号",
        SubTitle: "新建会议室或者加入已经创建的会议室",
      },
      Close: "退出",
      Join: "加入",
    },
    ChangeLanguage: {
      Title: "更换语言",
    },
    ExportRecords: {
      Subject: "主题",
      Title: "生成会议摘要",
      Export: "导出会议记录",
      CreateSummary: "生成摘要",
      EditSummary: "编辑摘要",
      SaveSummary: "保存摘要",
      CreatingSummary: "正在生成摘要...",
      SummaryDesc: "点击“生成摘要”，如需修订点击“编辑摘要”",
      Validate: {
        InvalidTopic: "主题不能少于10个字",
      },
      Prompt: (lang: string, content: string) => `
你是一个专业的CEO秘书，专注于整理和生成高质量的会议纪要，确保会议目标和行动计划清晰明确，会议内容被全面地记录、准确地表述。
准确记录会议的各个方面，包括议题、讨论、决定和行动计划。
保证语言通畅，易于理解，使每个参会人员都能明确理解会议内容框架和结论。
信息要点明确，不做多余的解释，使用专业术语和格式。
将用户给出的会议内容整理成没有口语、逻辑清晰、内容明确的会议纪要。

## 工作流程:
输入: 用户给出的会议内容，会议内容格式为${lang}的json数组格式，user代表参会人员，content代表其发言。
整理: 遵循以下框架来整理用户提供的会议信息
会议主题：会议的标题和目的。
会议日期：会议的具体日期和时间。
参会人员：列出参加会议的所有人。
会议议程：列出会议的所有主题和讨论点。
主要讨论：详述每个议题的讨论内容，主要包括提出的问题、提议、观点等。
决定和行动计划：列出会议的所有决定，以及计划中要采取的行动，以及负责人和计划完成日期。
下一步计划：列出下一步的计划或在未来的会议中需要讨论的问题。
输出: 输出整理后的结构清晰, 描述完整的会议纪要，${lang}各一份。

## 注意:
整理会议纪要过程中, 需严格遵守信息准确性, 不对用户提供的信息做扩写仅做信息整理, 将一些明显的病句做微调
会议纪要：一份详细记录会议讨论、决定和行动计划的文档。

以下是用户给出的会议内容：
${content}
`
    },
    EditMessage: {
      Title: "Edit All Messages",
      Topic: {
        Title: "主题",
        SubTitle: "更改当前主题",
      },
      ChatMessage: {
        Title: "消息"
      }
    },
    Actions: {
      ChatList: "Go To Chat List",
      CompressedHistory: "Compressed History Memory Prompt",
      Export: "Export All Messages as Markdown",
      Copy: "Copy",
      Stop: "Stop",
      Retry: "Retry",
      Pin: "Pin",
      PinToastContent: "Pinned 1 messages to contextual prompts",
      PinToastAction: "View",
      Delete: "Delete",
      Edit: "Edit",
      FullScreen: "FullScreen",
      ClearScreen: "ClearScreen",
      ClearScreenConfirm: "确定清理对话历史吗？",
      RefreshTitle: "Refresh Title",
      RefreshToast: "Title refresh request sent",
      Speech: "Play",
      StopSpeech: "Stop",
      Share: "Share",
      Useful: "有用",
      Useless: "没用"
    },
    Commands: {
      new: "Start a new chat",
      newm: "Start a new chat with mask",
      next: "Next Chat",
      prev: "Previous Chat",
      clear: "Clear Context",
      fork: "Copy Chat",
      del: "Delete Chat",
    },
    InputActions: {
      Stop: "Stop",
      ToBottom: "To Latest",
      Prompt: "Prompts",
      Masks: "Masks",
      ChangeMask: "更换角色",
      ChangeModel: "更换模型",
      Clear: "Clear Context",
      Settings: "Settings",
      UploadImage: "Upload Images",
      UploadFile: "Upload Files"
    },
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} to send`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Shift + Enter to wrap";
      }
      return inputHints + ", / to search prompts, : to use commands";
    },
    Config: {
      Reset: "Reset to Default",
      SaveAs: "Save as Mask",
    },
    IsContext: "Contextual Prompt",
    ShortcutKey: {
      Title: "Keyboard Shortcuts",
      newChat: "Open New Chat",
      focusInput: "Focus Input Field",
      copyLastMessage: "Copy Last Reply",
      copyLastCode: "Copy Last Code Block",
      showShortcutKey: "Show Shortcuts",
    },
    NewChat: "新的聊天",
    DeleteChat: "确认删除选中的对话？",
  },
  Export: {
    Title: "Export Messages",
    Copy: "Copy All",
    Download: "Download",
    MessageFromYou: "Message From You",
    MessageFromChatGPT: "Message From ChatGPT",
    Share: "Share to ShareGPT",
    Format: {
      Title: "Export Format",
      SubTitle: "Markdown or PNG Image",
    },
    IncludeContext: {
      Title: "Including Context",
      SubTitle: "Export context prompts in mask or not",
    },
    Steps: {
      Select: "选取记录",
      Preview: "预览",
      AISummary: "生成摘要",
    },
    Image: {
      Toast: "Capturing Image...",
      Modal: "Long press or right click to save image",
    },
    Artifacts: {
      Title: "Share Artifacts",
      Error: "Share Error",
    },
  },
  Select: {
    Search: "Search",
    All: "Select All",
    Latest: "Select Latest",
    Clear: "Clear",
  },
  Memory: {
    Title: "Memory Prompt",
    EmptyContent: "Nothing yet.",
    Send: "Send Memory",
    Copy: "Copy Memory",
    Reset: "Reset Session",
    ResetConfirm:
      "Resetting will clear the current conversation history and historical memory. Are you sure you want to reset?",
  },
  Settings: {
    Title: "Settings",
    SubTitle: "All Settings",
    ShowPassword: "ShowPassword",
    SyncConfig: {
      Title: "同步设置",
      Desc: "上传本地设置或从服务器下载设置",
      DownloadConfig: "下载设置",
      DownloadConfigDesc: "从服务器下载设置，本地设置将被覆盖",
      DownloadConfigConfirm: "确定从服务器下载设置吗？本地设置将被覆盖！",
      DownloadConfigSuccess: "设置同步完成",
      DownloadConfigFailed: "设置同步失败",
      UploadConfig: "上传设置",
      UploadConfigDesc: "上传设置到服务器，服务器设置将被覆盖",
      UploadConfigConfirm: "确定上传设置到服务器吗？服务器设置将被覆盖！",
      UploadConfigSuccess: "设置上传完成",
      UploadConfigFailed: "设置上传失败",
    },
    Danger: {
      Reset: {
        Title: "Reset All Settings",
        SubTitle: "Reset all setting items to default",
        Action: "Reset",
        Confirm: "Confirm to reset all settings to default?",
      },
      Clear: {
        Title: "Clear All Data",
        SubTitle: "Clear all messages and settings",
        Action: "Clear",
        Confirm: "Confirm to clear all messages and settings?",
      },
    },
    Lang: {
      Name: "Language", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      All: "All Languages",
    },
    FontSize: {
      Title: "Font Size",
      SubTitle: "Adjust font size of chat content",
    },
    FontFamily: {
      Title: "Chat Font Family",
      SubTitle:
        "Font Family of the chat content, leave empty to apply global default font",
      Placeholder: "Font Family Name",
    },
    InjectSystemPrompts: {
      Title: "Inject System Prompts",
      SubTitle: "Inject a global system prompt for every request",
    },

    Update: {
      Version: (x: string) => `Version: ${x}`,
      IsLatest: "Latest version",
      CheckUpdate: "Check Update",
      IsChecking: "Checking update...",
      FoundUpdate: (x: string) => `Found new version: ${x}`,
      GoToUpdate: "Update",
      Success: "Update Successful.",
      Failed: "Update Failed.",
    },
    SendKey: "Send Key",
    Theme: {
      Title: "Theme",
      List: ["Auto", "Dark", "Light"],
    },
    TightBorder: "Tight Border",
    SendPreviewBubble: {
      Title: "Send Preview Bubble",
      SubTitle: "Preview markdown in bubble",
    },
    AutoGenerateTitle: {
      Title: "Auto Generate Title",
      SubTitle: "Generate a suitable title based on the conversation content",
    },
    Sync: {
      CloudState: "Last Update",
      NotSyncYet: "Not sync yet",
      Success: "Sync Success",
      Fail: "Sync Fail",

      Config: {
        Modal: {
          Title: "Config Sync",
          Check: "Check Connection",
        },
        SyncType: {
          Title: "Sync Type",
          SubTitle: "Choose your favorite sync service",
        },
        Proxy: {
          Title: "Enable CORS Proxy",
          SubTitle: "Enable a proxy to avoid cross-origin restrictions",
        },
        ProxyUrl: {
          Title: "Proxy Endpoint",
          SubTitle:
            "Only applicable to the built-in CORS proxy for this project",
        },

        WebDav: {
          Endpoint: "WebDAV Endpoint",
          UserName: "User Name",
          Password: "Password",
        },

        UpStash: {
          Endpoint: "UpStash Redis REST Url",
          UserName: "Backup Name",
          Password: "UpStash Redis REST Token",
        },
      },

      LocalState: "Local Data",
      Overview: (overview: any) => {
        return `${overview.chat} chats，${overview.message} messages，${overview.prompt} prompts，${overview.mask} masks`;
      },
      ImportFailed: "Failed to import from file",
    },
    Mask: {
      Title: "角色配置",
      Splash: {
        Title: "角色启动页",
        SubTitle: "新建聊天时，展示角色启动页",
      },
      Builtin: {
        Title: "隐藏内置角色",
        SubTitle: "在所有角色列表中隐藏内置角色",
      },
      List: "角色列表",
      ListCount: (count: number) =>
        `共计 ${count} 条`,
      Edit: "编辑角色",
    },
    Prompt: {
      Config: "提示词配置",
      Disable: {
        Title: "禁用提示词自动补全",
        SubTitle: "在输入框开头输入 / 即可触发自动补全",
      },
      List: "提示词列表",
      ListCount: (count: number) =>
        `共计 ${count} 条`,
      Edit: "编辑提示词",
    },
    HistoryCount: {
      Title: "Attached Messages Count",
      SubTitle: "Number of sent messages attached per request",
    },
    CompressThreshold: {
      Title: "History Compression Threshold",
      SubTitle:
        "Will compress if uncompressed messages length exceeds the value",
    },

    Usage: {
      Title: "Account Balance",
      SubTitle(used: any, total: any) {
        return `Used this month $${used}, subscription $${total}`;
      },
      IsChecking: "Checking...",
      Check: "Check",
      NoAccess: "Enter API Key to check balance",
    },
    ModelProvider: {
      Title: "大模型服务配置",
      BaseUrlDesc: "注：一定要根据官方文档，配置OpenAI兼容的base_url",
      CustomEndpoint: {
        Title: "Custom Endpoint",
        SubTitle: "Use custom Azure or OpenAI service",
      },
      Provider: {
        Title: "Model Provider",
        SubTitle: "Select Azure or OpenAI",
      },
      AITaaS: {
        OutputMode: "输出模式"
      },
      OpenAI: {
        ApiKey: {
          Title: "OpenAI API Key",
          SubTitle: "User custom OpenAI Api Key",
          Placeholder: "sk-xxx",
        },

        Endpoint: {
          Title: "OpenAI Endpoint",
          SubTitle: "Must start with http(s):// or use /api/openai as default",
        },
      },
      Azure: {
        ApiKey: {
          Title: "Azure Api Key",
          SubTitle: "Check your api key from Azure console",
          Placeholder: "Azure Api Key",
        },

        Endpoint: {
          Title: "Azure Endpoint",
          SubTitle: "Example: ",
        },

        ApiVerion: {
          Title: "Azure Api Version",
          SubTitle: "Check your api version from azure console",
        },
      },
      Anthropic: {
        ApiKey: {
          Title: "Anthropic API Key",
          SubTitle:
            "Use a custom Anthropic Key to bypass password access restrictions",
          Placeholder: "Anthropic API Key",
        },

        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },

        ApiVerion: {
          Title: "API Version (claude api version)",
          SubTitle: "Select and input a specific API version",
        },
      },
      Baidu: {
        ApiKey: {
          Title: "Baidu API Key",
          SubTitle: "Use a custom Baidu API Key",
          Placeholder: "Baidu API Key",
        },
        SecretKey: {
          Title: "Baidu Secret Key",
          SubTitle: "Use a custom Baidu Secret Key",
          Placeholder: "Baidu Secret Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "not supported, configure in .env",
        },
      },
      Tencent: {
        ApiKey: {
          Title: "Tencent API Key",
          SubTitle: "Use a custom Tencent API Key",
          Placeholder: "Tencent API Key",
        },
        SecretKey: {
          Title: "Tencent Secret Key",
          SubTitle: "Use a custom Tencent Secret Key",
          Placeholder: "Tencent Secret Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "not supported, configure in .env",
        },
      },
      ByteDance: {
        ApiKey: {
          Title: "ByteDance API Key",
          SubTitle: "Use a custom ByteDance API Key",
          Placeholder: "ByteDance API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      Alibaba: {
        ApiKey: {
          Title: "Alibaba API Key",
          SubTitle: "Use a custom Alibaba Cloud API Key",
          Placeholder: "Alibaba Cloud API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      Moonshot: {
        ApiKey: {
          Title: "Moonshot API Key",
          SubTitle: "Use a custom Moonshot API Key",
          Placeholder: "Moonshot API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      XAI: {
        ApiKey: {
          Title: "XAI API Key",
          SubTitle: "Use a custom XAI API Key",
          Placeholder: "XAI API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      ChatGLM: {
        ApiKey: {
          Title: "ChatGLM API Key",
          SubTitle: "Use a custom ChatGLM API Key",
          Placeholder: "ChatGLM API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      Stability: {
        ApiKey: {
          Title: "Stability API Key",
          SubTitle: "Use a custom Stability API Key",
          Placeholder: "Stability API Key",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      Iflytek: {
        ApiKey: {
          Title: "Iflytek API Key",
          SubTitle: "Use a Iflytek API Key",
          Placeholder: "Iflytek API Key",
        },
        ApiSecret: {
          Title: "Iflytek API Secret",
          SubTitle: "Use a Iflytek API Secret",
          Placeholder: "Iflytek API Secret",
        },
        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },
      },
      CustomModel: {
        Title: "Custom Models",
        SubTitle: "Custom model options, seperated by comma",
      },
      Google: {
        ApiKey: {
          Title: "API Key",
          SubTitle: "Obtain your API Key from Google AI",
          Placeholder: "Google AI API Key",
        },

        Endpoint: {
          Title: "Endpoint Address",
          SubTitle: "Example: ",
        },

        ApiVersion: {
          Title: "API Version (specific to gemini-pro)",
          SubTitle: "Select a specific API version",
        },
        GoogleSafetySettings: {
          Title: "Google Safety Settings",
          SubTitle: "Select a safety filtering level",
        },
      },
    },
    RealtimeChat: {
      Title: "实时聊天配置",
    },
    TTT: {
      Title: "实时转译",
      FromTo: "转译模式",
    },
    Audio: {
      Title: "语音配置",
      Voice: "声音",
      VoiceDesc: "",
      Volume: "音量大小(1-100)",
      VolumeDesc: "",
      Speed: "语速(-100-100)",
      SpeedDesc: "数字越大语速越快，0为正常语速",
      Intonation: "语调(-100-100)",
      IntonationDesc: "数字越大音调越高，0为正常语调",
      Emotion: "情感",
      EmotionDesc: "",
      AuditionText: "试听文本",
      Audition: "试听",
    },
    Video: {
      Title: "视频配置",
      DefaultHelloText: "你好，我们聊些什么主题呢？",
      Pic: "上传照片",
      PicDesc: "照片中的人物需清晰且占据主要位置",
      EnableDownloadVideo: "启用下载视频",
      Hello: "招呼语",
      HelloDesc: "对话开始或者空闲时间视频人物使用的招呼语",
      ProcessingVoice: "听到啦！等我想一下哈...",
      FreeVoice: "嗯？你有说话吗？我仿佛听到了什么...",
      Msg: {
        InvalidPic: "无法识别照片中的人物，请选择清晰且人物上半身占据主要位置的照片",
        SetFailed: "设置失败，请重试",
        SetSuccess: "设置成功",
        Confirm: "可以视频啦，请确定是否使用当前的语音通话配置和视频通话配置？",
      }
    },
    Model: {
      Title: "大模型参数配置",
      Model: {
        Title: "当前使用的模型",
        SubTitle: "注：仅对角色扮演有效",
      },
      CompressModel: {
        Title: "对话摘要模型",
        SubTitle: "用于压缩历史记录、生成对话标题的模型",
      },
      Temperature: {
        Title: "随机性 (temperature)",
        SubTitle: "值越大，回复越随机",
      },
      TopP: {
        Title: "核采样 (top_p)",
        SubTitle: "与随机性类似，但不要和随机性一起更改",
      },
      MaxTokens: {
        Title: "单次回复限制 (max_tokens)",
        SubTitle: "单次交互所用的最大 Token 数",
      },
      PresencePenalty: {
        Title: "话题新鲜度 (presence_penalty)",
        SubTitle: "值越大，越有可能扩展到新话题",
      },
      FrequencyPenalty: {
        Title: "频率惩罚度 (frequency_penalty)",
        SubTitle: "值越大，越有可能降低重复字词",
      },
      InputTemplate: {
        Title: "用户输入模板",
        SubTitle: `用户输入的消息会按照此模板填充，占位符支持：
      {{input}}：用户的输入
      {{model}}：模型名称
      {{time}}：当前日期
      {{lang}}：语言
      {{user}}：用户名`,
      },
    },
    AIChat: {
      Title: "角色扮演配置",
      Enable: {
        Title: "Enable TTS",
        SubTitle: "Enable text-to-speech service",
      },
      Autoplay: {
        Title: "Enable Autoplay",
        SubTitle:
          "Automatically generate speech and play, you need to enable the text-to-speech switch first",
      },
      Model: "Model",
      Voice: {
        Title: "Voice",
        SubTitle: "The voice to use when generating the audio",
      },
      Speed: {
        Title: "Speed",
        SubTitle: "The speed of the generated audio",
      },
      Engine: "TTS Engine",
    },
    Realtime: {
      Enable: {
        Title: "Realtime Chat",
        SubTitle: "Enable realtime chat feature",
      },
      Provider: {
        Title: "Model Provider",
        SubTitle: "Switch between different providers",
      },
      Model: {
        Title: "Model",
        SubTitle: "Select a model",
      },
      ApiKey: {
        Title: "API Key",
        SubTitle: "API Key",
        Placeholder: "API Key",
      },
      Azure: {
        Endpoint: {
          Title: "Endpoint",
          SubTitle: "Endpoint",
        },
        Deployment: {
          Title: "Deployment Name",
          SubTitle: "Deployment Name",
        },
      },
      Temperature: {
        Title: "Randomness (temperature)",
        SubTitle: "Higher values result in more random responses",
      },
    },
    P2V: {
      Title: "音视频参数设置",
      Video: {
        Duration: "视频时长",
        Quality: "视频质量",
        QualityDesc: "质量越高耗时越久",
        FPS: "视频帧率",
        FPSDesc: "帧率越高耗时越久",
        Size: "视频尺寸",
        SizeDesc:
          "建议选择根据图片大小等比缩放，一般淘宝系使用1:1的图片，拼多多/抖音商品讲解图使用9:16的图片",
      },
      Audio: {
        Voice: "声音",
        VoiceDesc: "",
        Volume: "音量大小(1-100)",
        VolumeDesc: "",
        Speed: "语速(-100-100)",
        SpeedDesc: "数字越大语速越快，0为正常语速",
        Intonation: "语调(-100-100)",
        IntonationDesc: "数字越大音调越高，0为正常语调",
      },
    },
    Vision: {
      Title: "视觉识别配置",
      EnableVideo: "使用视频",
      EnableVideoDesc: "开启后将实时识别视频，但成本较高",
      EnableSpeak: "开启语音播报",
      EnableSpeakDesc: "开启后语音播报，否则仅显示文本",
    },
    Speech: {
      Title: "说话配置",
      Threshold: "声音阈值",
      ThresholdDesc: "说话声音的阈值，高于此值则判定为有效说话，嘈杂环境调高此值",
    },
  },
  Context: {
    Toast: (x: any) => `With ${x} contextual prompts`,
    Edit: "Current Chat Settings",
    Add: "Add a Prompt",
    Clear: "Context Cleared",
    Revert: "Revert",
  },
  Plugin: {
    Name: "Plugin",
    Page: {
      Title: "Plugins",
      SubTitle: (count: number) => `${count} plugins`,
      Search: "Search Plugin",
      Create: "Create",
      Find: "You can find awesome plugins on github: ",
    },
    Item: {
      Info: (count: number) => `${count} method`,
      View: "View",
      Edit: "Edit",
      Delete: "Delete",
      DeleteConfirm: "Confirm to delete?",
    },
    Auth: {
      None: "None",
      Basic: "Basic",
      Bearer: "Bearer",
      Custom: "Custom",
      CustomHeader: "Parameter Name",
      Token: "Token",
      Proxy: "Using Proxy",
      ProxyDescription: "Using proxies to solve CORS error",
      Location: "Location",
      LocationHeader: "Header",
      LocationQuery: "Query",
      LocationBody: "Body",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `Edit Plugin ${readonly ? "(readonly)" : ""}`,
      Download: "Download",
      Auth: "Authentication Type",
      Content: "OpenAPI Schema",
      Load: "Load From URL",
      Method: "Method",
      Error: "OpenAPI Schema Error",
    },
  },
  Prompt: {
    List: {
      Title: "提示词列表",
      Add: "新建",
      Search: "搜索提示词",
    },
    Edit: {
      Title: "编辑提示词",
      NamePlaceholder: "请输出名称",
      PromptPlaceholder: "请输出提示词",
      InvalidData: "名称或内容不正确",
    },
  },
  Mask: {
    Name: "对话",
    List: {
      Title: "角色列表",
      SubTitle: (count: number) => `${count} 个预设角色定义`,
      Search: "搜索角色",
      Create: "新建",
    },
    ChatMessage: {
      Info: (count: number) => `包含 ${count} 条预设对话`,
      Chat: "对话",
      View: "查看",
      Edit: "编辑",
      Delete: "删除",
      DeleteConfirm: "确认删除？",
    },
    Edit: {
      Title: (readonly: boolean) =>
        `编辑角色 ${readonly ? "（只读）" : ""}`,
      Avatar: "角色头像",
      Name: "*角色名称",
      InvalidData: "名称不正确",
      Model: "模型参数",
      ChatMessage: "预置对话",
      Sync: {
        Title: "使用全局设置",
        SubTitle: "当前对话是否使用全局模型设置",
        Confirm: "当前对话的自定义设置将会被自动覆盖，确认启用全局设置？",
      },
      HideContext: {
        Title: "隐藏预设对话",
        SubTitle: "隐藏后预设对话不会出现在聊天界面",
      },
      Artifacts: {
        Title: "启用Artifacts",
        SubTitle: "启用之后可以直接渲染HTML页面",
      },
      CodeFold: {
        Title: "启用代码折叠",
        SubTitle: "启用之后可以自动折叠/展开过长的代码块",
      },
      Share: {
        Title: "分享此角色",
        SubTitle: "生成此角色的直达链接",
        Action: "复制链接",
      },
    },
  },
  NewChat: {
    Return: "Return",
    Skip: "Just Start",
    Title: "Pick a Mask",
    SubTitle: "Chat with the Soul behind the Mask",
    More: "Find More",
    NotShow: "Never Show Again",
    ConfirmNoShow: "Confirm to disable？You can enable it in settings later.",
  },
  Exporter: {
    Description: {
      Title: "Only messages after clearing the context will be displayed",
    },
    Model: "Model",
    Messages: "Messages",
    Topic: "Topic",
    StartTime: "Time",
    EndTime: "Time",
    StartEnd: "起止时间",
    Attendees: "参会人员"
  },
  URLCommand: {
    Code: "Detected access code from url, confirm to apply? ",
    Settings: "Detected settings from url, confirm to apply?",
  },
  SdPanel: {
    Prompt: "Prompt",
    NegativePrompt: "Negative Prompt",
    PleaseInput: (name: string) => `Please input ${name}`,
    AspectRatio: "Aspect Ratio",
    ImageStyle: "Image Style",
    OutFormat: "Output Format",
    AIModel: "AI Model",
    ModelVersion: "Model Version",
    Submit: "Submit",
    ParamIsRequired: (name: string) => `${name} is required`,
    Styles: {
      D3Model: "3d-model",
      AnalogFilm: "analog-film",
      Anime: "anime",
      Cinematic: "cinematic",
      ComicBook: "comic-book",
      DigitalArt: "digital-art",
      Enhance: "enhance",
      FantasyArt: "fantasy-art",
      Isometric: "isometric",
      LineArt: "line-art",
      LowPoly: "low-poly",
      ModelingCompound: "modeling-compound",
      NeonPunk: "neon-punk",
      Origami: "origami",
      Photographic: "photographic",
      PixelArt: "pixel-art",
      TileTexture: "tile-texture",
    },
  },
  Sd: {
    SubTitle: (count: number) => `${count} images`,
    Actions: {
      Params: "See Params",
      Copy: "Copy Prompt",
      Delete: "Delete",
      Retry: "Retry",
      ReturnHome: "Return Home",
      History: "History",
    },
    EmptyRecord: "No images yet",
    Status: {
      Name: "Status",
      Success: "Success",
      Error: "Error",
      Wait: "Waiting",
      Running: "Running",
    },
    Danger: {
      Delete: "Confirm to delete?",
    },
    GenerateParams: "Generate Params",
    Detail: "Detail",
  },
};

export default en;
