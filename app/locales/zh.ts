import { Camera } from "../components/ui-lib";
import { Path } from "../constant";
import { BasePath } from "@/app/config/env";

const zh = {
  AboutMe: "你好，我是AITaaS，一款支持文本、图片、语音、视频等多媒体内容识别、生成和融合的AI智能创作平台。",
  Error: {
    TicketInvalid:
      `❌ 令牌无效, 请关注公众号AITaaS获取有效令牌或通过手机验证码登录`,
    Unauthorized:
      `❌ 未登录，点击[设置](` +
      BasePath +
      "#" +
      Path.Setting +
      `)登录账号或设置访问令牌 `,
    NoPermission:
      `❌ 没有权限使用该功能，点击[设置](` +
      BasePath +
      "#" +
      Path.Setting +
      `)升级账户权限 `,
    InputError: `❌ 输入数据错误，请修正数据后重试 `,
    NetError:
      `❌ 无法连接到服务器，请先登录，点击[设置](` +
      BasePath +
      "#" +
      Path.Setting +
      `)登录或设置访问令牌 `,
    ModelError:
      `❌ 无法调用模型，请检查是否正确配置模型地址和APIKey，点击[设置](` +
      BasePath +
      "#" +
      Path.Setting +
      `)`,
    CommonError: `❌ 处理失败，请稍后重试 `,
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
      "AITaaS系列软件包含Web端、移动端、桌面端。其前身是为企业数字化转型打造的行业普适的业务应用系统，近年随着AI大模型的广泛应用，AITaas结合传统的业务应用，集成多种智能应用场景，如：AI-Assistant(普适性对话/问答/知识库等)、AI-RAG(业务型对话/问答/知识库等)、AI-Tools(业务型智能交互)等等...",
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
    Tips: "关注上面的微信公众号AITaaS即可获得访问令牌",
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
      Desc: "推荐关注微信公众号AITaaS即可获得令牌，无需注册登录账号",
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
        Title: "注册/登录账号",
        Avatar: "头像",
        Username: "用户名",
        UsernameValidation: "用户名为5-10位字母、数字、符号的组合",
        Phone: "*手机号",
        PhoneValidation: "请输入中国境内正常使用的手机号",
        PhonePlaceholder: "请输入手机号",
        VerifyCode: "*验证码",
        VerifyCodeDesc: "请输入发送到您手机的速通互联验证码",
        SendVerifyCode: "获取验证码",
        ValidateCodeValidation: "请输入正确的验证码",
        Success: "欢迎使用AITaaS为您提供的AI服务！",
        Failed: "操作失败，请确保账号信息正确无误",
      },
      Login: "登录账号",
      Logout: "退出账号",
      LogoutConfirm: "确定退出账号吗？",
    },
    Feedback: {
      Title: "建议反馈",
      Phone: "联系方式",
      Desc: "详细描述",
      Success: "提交成功，我们会尽快处理，感谢反馈！",
      Failed: "请填写联系方式内容，内容不少于10个字",
    },
    ModelUsage: {
      Title: "大模型使用情况",
      Tokens: "已用的Token（数量）",
      TokensDesc: "大模型累计消耗的文本Token总和",
      Times: "已用的音频（次数）",
      TimesDesc: "累计音频识别和合成的总音频次数",
      Pic: "已用的图片（张）",
      PicDesc: "大模型累计消耗的图片总数量",
      Second: "已用的视频（秒）",
      SecondDesc: "大模型累计消耗的视频总时长",
    },
    SOARecord: {
      Title: "账单明细(私密信息，注意安全)",
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
    Close: "关闭",
    Config: "配置",
    Copy: "复制",
    CopySuccess: "已复制",
    CopyFailed: "复制失败，请赋予剪贴板权限",
    Edit: "编辑",
    Delete: "删除",
    DeleteConfirm: "确认删除？",
    DeleteSuccess: "删除成功！",
    DeleteFailed: "删除失败！",
    NoData: "没有数据",
    Reload: "刷新",
    Cancel: "取消",
    Confirm: "确定",
    Info: "信息",
    Export: "导出",
    Import: "导入",
    Save: "保存",
    SaveSuccess: "保存成功！",
    SaveFailed: "保存失败",
    Sync: "同步",
    Select: "选择",
    Loading: "加载中...",
    Upload: "上传",
    UploadSuccess: "上传成功。",
    UploadFailedOnSize: "上传失败，文件大小超过限制。",
    UploadFailedOnFormat: "上传失败，暂不支持该格式。",
    UploadFailed: "上传失败，请重新选择文件。",
    Download: "下载",
    DownloadSuccess: "已下载。请检查下载目录。",
    DownloadFailed: "下载失败。",
    InvalidData: "数据不正确",
    NoValue: "---",
    FunctionOffline: "功能暂未开放。",
    Contact: "联系微信公众号或星球号:AITaaS",
    Setting: "设置",
    Start: "开始",
    Search: "查找",
    Developing: "功能开发中，敬请期待。。。",
    OperateSuccess: "操作成功",
    OperateFailed: "操作失败，请稍候再试。",
    Typing: "正在输入…",
    Processing: "正在处理…",
  },
  Menu: {
    Chat: "角色扮演",
    MV: "合成视频",
    DH: "妙享抖红",
    Video: "虚拟朋友",
    CBC: "跨境交流",
    Setting: "用户设置",
    Vision: "视觉识别",
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
      MVTitle: "AI合成视频",
      MVSubTitle: "生成电影、广告等长视频",
      DHTitle: "奇思妙想一键成片",
      DHSubTitle: "生成抖音、小红书等短视频",
      Search: "搜索任务",
      LeftDay: (count: number) => `(保留期剩余 ${count} 天)`,
      Speeding: "加速中",
      PrepareResult: "正在准备下载地址，即将为您呈现精彩视频..."
    },
    Editor: {
      EditTask: "编辑任务",
      TaskInfo: "*视频文案",
      EditShot: "编辑分镜内容",
      AudioText: "音频文案(可选)：",
      AudioTextDesc: "注意：正常语速下大概4字/秒，如果生成的视频时长设置为5秒钟，则文案最好是20字左右，文案过短或过长则会导致视频观感不佳！",
      Prompt: "提示词(可选):",
      PromptDesc: "用于描述图片如何生成视频。例如：让小猫跑起来，让背景中的水面波动等，描述尽可能的突出重点和主题，避免过度动画！",
      Picture: "*生成视频的首(尾)图片",
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
      TaskPrompt: "文案提示词",
      TaskPromptPlaceholder: "请输入文案提示词，或输入/查看示例",
      TaskPromptDesc: "尽量详细描述，例如：我的一名旅游博主，用小红书的爆款文案格式介绍深圳梅沙尖",
      Category: "类别",
      VideoTarget: "短视频平台",
      HasMaterial: "上传图片或视频素材",
      MaterialDesc: "素材格式支持jpg/png/mp4，大小不超过10M",
      SelectPicture: "*设置分镜",
      UploadPicture: "上传图片",
    },
    Validate: {
      InvalidName: "名称不正确",
      InvalidDesc: "提示词需大于10个字且小于2000字",
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
      "任务失败",
      "待付款",
      "待下载",
      "任务已关闭",
    ],
  },
  VideoChat: {
    Title: "视频通话",
    DownloadVideo: "下载视频",
    Function: {
      ChangeSkin: "换衣饰",
      ChangeSkinPrompt: "图1中的人物穿戴着图2中的衣饰，人物和衣饰搭配自然协调，具有模特一般的气质",

      ChangeBG: "换背景",
      ChangeBGPrompt: "把图2的人物替换为图1中的人物，整体保持自然和谐",

      DigitalHuman: "数字人",
      DigitalHumanTitle: "音频内容(10字以上)",
      DigitalHumanDesc: "结合设置中的声音配置和图像生成自然的说话、唱歌或表演视频，支持半身照和全身照。",

      EMO: "对口型",
      EMOTitle: "音频内容(10字以上)",
      EMODesc: "结合设置中的声音配置和图像生成人物动态肖像视频，仅支持半身照。",

      P2V: "动起来",
      P2VTitle: "音频内容(可选)",
      P2VConfirm: "确定开始处理吗？",
      P2VPrompt: "提示词(可选)：描述如何驱动图像动起来",
      P2VDesc: "结合设置中的声音配置和图像生成广告、模特等泛视频，支持各种类型的图片和自定义提示词。",

      EditImage: "修图片",
      EditImageTitle: "提示词",
      EditImageDesc: "详细描述如何编辑这张图片",
      EditImageDemo: "例如：她举起双手，手掌朝向镜头，手指张开，做出一个俏皮的姿势； 让她闭上双眼等等",

      ChangeActor: "换主角",
      ChangeActorPrompt: "提示词(可选)：描述如何将照片中的人物替换视频中的主角",
      ChangeActorDesc: "用照片中的人物替换视频中的主角。视频长度不超过20s，大小不超过20M，视频中的人物需保持单一或突出。",
    },

    Error: {
      NoPic: "需先设置一张视频对象主体照片（设置>视频通话配置）",
      Common: "AI处理繁忙，请稍后再试",
      Processing: "AI处理中，此过程需要耗费3分钟左右，请耐心等待...",
      CannotSpeak: "未能开启语音权限，请在应用权限中允许使用麦克风，本地存储等媒体权限",
    },
  },
  Voice: {
    Title: "语音",
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
    SubTitle: (count: number) => `共 ${count} 条对话`,
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
      Title: "编辑",
      Topic: {
        Title: "主题",
        SubTitle: "更改当前主题",
      },
      ChatMessage: {
        Title: "消息"
      }
    },
    Actions: {
      ChatList: "查看消息列表",
      CompressedHistory: "查看压缩后的历史 Prompt",
      Export: "导出聊天记录",
      Copy: "复制",
      Stop: "停止",
      Retry: "重试",
      Pin: "固定",
      PinToastContent: "已将 1 条对话固定至预设提示词",
      PinToastAction: "查看",
      Delete: "删除",
      Edit: "编辑",
      FullScreen: "全屏",
      ClearScreen: "清理对话历史",
      ClearScreenConfirm: "确定清理对话历史吗？",
      RefreshTitle: "刷新标题",
      RefreshToast: "已发送刷新标题请求",
      Speech: "朗读",
      StopSpeech: "停止",
      Share: "分享",
      Useful: "有用",
      Useless: "没用"
    },
    Commands: {
      new: "新建聊天",
      newm: "从角色新建聊天",
      next: "下一个聊天",
      prev: "上一个聊天",
      clear: "清除上下文",
      fork: "复制聊天",
      del: "删除聊天",
    },
    InputActions: {
      Stop: "停止响应",
      ToBottom: "滚到最新",
      Prompt: "提示词",
      Masks: "所有角色",
      ChangeMask: "换角色",
      ChangeModel: "换模型",
      Clear: "清除聊天",
      Settings: "对话设置",
      UploadImage: "上传图片",
      UploadFile: "附件"
    },
    Input: (submitKey: string) => {
      return "输入/查看提示词";
    },
    Config: {
      Reset: "清除记忆",
      SaveAs: "存为角色",
    },
    IsContext: "预设提示词",
    ShortcutKey: {
      Title: "键盘快捷方式",
      newChat: "打开新聊天",
      focusInput: "聚焦输入框",
      copyLastMessage: "复制最后一个回复",
      copyLastCode: "复制最后一个代码块",
      showShortcutKey: "显示快捷方式",
    },
    NewChat: "新的聊天",
    DeleteChat: "确认删除选中的对话？",
  },
  Export: {
    Title: "导出聊天记录",
    Copy: "全部复制",
    Download: "下载文件",
    Share: "分享到 ShareGPT",
    MessageFromYou: "用户",
    MessageFromChatGPT: "ChatGPT",
    Format: {
      Title: "导出格式",
      SubTitle: "可以导出 Markdown 文本或者 PNG 图片",
    },
    IncludeContext: {
      Title: "包含角色上下文",
      SubTitle: "是否在消息中展示角色上下文",
    },
    Steps: {
      Select: "选取记录",
      Preview: "预览",
      AISummary: "生成摘要",
    },
    Image: {
      Toast: "正在生成截图",
      Modal: "长按或右键保存图片",
    },
    Artifacts: {
      Title: "分享页面",
      Error: "分享失败",
    },
  },
  Select: {
    Search: "搜索消息",
    All: "选取全部",
    Latest: "最近几条",
    Clear: "清除选中",
  },
  Memory: {
    Title: "历史摘要",
    EmptyContent: "对话内容过短，无需总结",
    Send: "自动压缩聊天记录并作为上下文发送",
    Copy: "复制摘要",
    Reset: "[unused]",
    ResetConfirm: "确认清空历史摘要？",
  },
  Settings: {
    Title: "设置",
    SubTitle: "带 * 为必填项",
    ShowPassword: "显示密码",
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
        Title: "重置所有设置",
        SubTitle: "重置所有设置项回默认值",
        Action: "重置设置",
        Confirm: "确认重置所有设置？",
      },
      Clear: {
        Title: "清除所有数据",
        SubTitle: "清除所有聊天、设置数据",
        Action: "清除数据",
        Confirm: "确认清除所有聊天、设置数据？",
      },
    },
    Lang: {
      Name: "语言", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      All: "所有语言",
    },

    FontSize: {
      Title: "字体大小",
      SubTitle: "聊天内容的字体大小",
    },
    FontFamily: {
      Title: "聊天字体",
      SubTitle: "聊天内容的字体，若置空则应用全局默认字体",
      Placeholder: "字体名称",
    },
    InjectSystemPrompts: {
      Title: "注入系统级提示信息",
      SubTitle: "强制给每次请求的消息列表开头添加一个模拟 ChatGPT 的系统提示",
    },

    Update: {
      Version: (x: string) => `当前版本：${x}`,
      IsLatest: "已是最新版本",
      CheckUpdate: "检查更新",
      IsChecking: "正在检查更新...",
      FoundUpdate: (x: string) => `发现新版本：${x}`,
      GoToUpdate: "安装更新",
      Success: "更新成功！",
      Failed: "更新失败",
    },
    SendKey: "发送键",
    Theme: {
      Title: "主题",
      List: ["自动主题", "深色模式", "亮色模式"],
    },
    TightBorder: "无边框模式",
    SendPreviewBubble: {
      Title: "预览气泡",
      SubTitle: "在预览气泡中预览 Markdown 内容",
    },
    AutoGenerateTitle: {
      Title: "自动生成标题",
      SubTitle: "根据对话内容生成合适的标题",
    },
    Sync: {
      CloudState: "云端数据",
      NotSyncYet: "还没有进行过同步",
      Success: "同步成功",
      Fail: "同步失败",

      Config: {
        Modal: {
          Title: "配置云同步",
          Check: "检查可用性",
        },
        SyncType: {
          Title: "同步类型",
          SubTitle: "选择喜爱的同步服务器",
        },
        Proxy: {
          Title: "启用代理",
          SubTitle: "在浏览器中同步时，必须启用代理以避免跨域限制",
        },
        ProxyUrl: {
          Title: "代理地址",
          SubTitle: "仅适用于本项目自带的跨域代理",
        },

        WebDav: {
          Endpoint: "WebDAV 地址",
          UserName: "用户名",
          Password: "密码",
        },

        UpStash: {
          Endpoint: "UpStash Redis REST Url",
          UserName: "备份名称",
          Password: "UpStash Redis REST Token",
        },
      },

      LocalState: "本地数据",
      Overview: (overview: any) => {
        return `${overview.chat} 次对话，${overview.message} 条消息，${overview.prompt} 条提示词，${overview.mask} 个角色`;
      },
      ImportFailed: "导入失败",
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
      Title: "上下文长度",
      SubTitle: "每次请求携带的历史消息数",
    },
    CompressThreshold: {
      Title: "历史消息长度压缩阈值",
      SubTitle: "当未压缩的历史消息超过该值时，将进行压缩",
    },
    Usage: {
      Title: "余额查询",
      SubTitle(used: any, total: any) {
        return `本月已使用 $${used}，订阅总额 $${total}`;
      },
      IsChecking: "正在检查…",
      Check: "重新检查",
      NoAccess: "输入 API Key 或访问密码查看余额",
    },

    ModelProvider: {
      Title: "大模型服务配置",
      BaseUrlDesc: "注：一定要根据官方文档，配置OpenAI兼容的base_url",
      CustomEndpoint: {
        Title: "启用自定义服务",
        SubTitle: "使用自己注册的大模型服务，以下参数配置仅对角色扮演有效",
      },
      Provider: {
        Title: "模型服务",
        SubTitle: "```\n配置模型服务的base_url和APIKey等参数 \n- 服务基地址(base_url): 根据大模型官方文档，配置OpenAI兼容的base_url \n- APIKey: 在大模型官网申请的APIKey，请注意开通权限"
      },
      AITaaS: {
        OutputMode: "输出模式"
      },
      OpenAI: {
        ApiKey: {
          Title: "*APIKey",
          SubTitle: "使用自定义 OpenAI Key",
          Placeholder: "OpenAI API Key",
        },

        Endpoint: {
          Title: "服务基地址(base_url)",
          SubTitle: "除默认地址外，必须包含 http(s)://",
        },
      },
      Azure: {
        ApiKey: {
          Title: "*APIKey",
          SubTitle: "使用自定义 Azure Key",
          Placeholder: "Azure API Key",
        },

        Endpoint: {
          Title: "服务基地址(base_url)",
          SubTitle: "样例：",
        },

        ApiVerion: {
          Title: "接口版本 (azure api version)",
          SubTitle: "选择指定的部分版本",
        },
      },
      Anthropic: {
        ApiKey: {
          Title: "*APIKey",
          SubTitle: "使用自定义 Anthropic Key",
          Placeholder: "Anthropic API Key",
        },

        Endpoint: {
          Title: "服务基地址(base_url)",
          SubTitle: "样例：",
        },

        ApiVerion: {
          Title: "接口版本 (claude api version)",
          SubTitle: "选择一个特定的 API 版本输入",
        },
      },
      Google: {
        ApiKey: {
          Title: "*APIKey",
          SubTitle: "从 Google AI 获取您的 API 密钥",
          Placeholder: "Google AI API KEY",
        },

        Endpoint: {
          Title: "终端地址",
          SubTitle: "示例：",
        },

        ApiVersion: {
          Title: "API 版本（仅适用于 gemini-pro）",
          SubTitle: "选择一个特定的 API 版本",
        },
        GoogleSafetySettings: {
          Title: "Google 安全过滤级别",
          SubTitle: "设置内容过滤级别",
        },
      },
      Baidu: {
        ApiKey: {
          Title: "*APIKey",
          SubTitle: "使用自定义 Baidu API Key",
          Placeholder: "Baidu API Key",
        },
        SecretKey: {
          Title: "*Secret Key",
          SubTitle: "使用自定义 Baidu Secret Key",
          Placeholder: "Baidu Secret Key",
        },
        Endpoint: {
          Title: "服务基地址(base_url)",
          SubTitle: "不支持自定义前往.env配置",
        },
      },
      Tencent: {
        ApiKey: {
          Title: "*APIKey",
          SubTitle: "使用自定义腾讯云API Key",
          Placeholder: "Tencent API Key",
        },
        SecretKey: {
          Title: "*Secret Key",
          SubTitle: "使用自定义腾讯云Secret Key",
          Placeholder: "Tencent Secret Key",
        },
        Endpoint: {
          Title: "服务基地址(base_url)",
          SubTitle: "不支持自定义前往.env配置",
        },
      },
      ByteDance: {
        ApiKey: {
          Title: "*APIKey",
          SubTitle: "使用自定义 ByteDance API Key",
          Placeholder: "ByteDance API Key",
        },
        Endpoint: {
          Title: "服务基地址(base_url)",
          SubTitle: "样例：",
        },
      },
      Alibaba: {
        ApiKey: {
          Title: "*APIKey",
          SubTitle: "使用自定义阿里云API Key",
          Placeholder: "Alibaba Cloud API Key",
        },
        Endpoint: {
          Title: "服务基地址(base_url)",
          SubTitle: "样例：",
        },
      },
      Moonshot: {
        ApiKey: {
          Title: "*APIKey",
          SubTitle: "使用自定义月之暗面API Key",
          Placeholder: "Moonshot API Key",
        },
        Endpoint: {
          Title: "服务基地址(base_url)",
          SubTitle: "样例：",
        },
      },
      XAI: {
        ApiKey: {
          Title: "*APIKey",
          SubTitle: "使用自定义XAI API Key",
          Placeholder: "XAI API Key",
        },
        Endpoint: {
          Title: "服务基地址(base_url)",
          SubTitle: "样例：",
        },
      },
      ChatGLM: {
        ApiKey: {
          Title: "*APIKey",
          SubTitle: "使用自定义 ChatGLM API Key",
          Placeholder: "ChatGLM API Key",
        },
        Endpoint: {
          Title: "服务基地址(base_url)",
          SubTitle: "样例：",
        },
      },
      Stability: {
        ApiKey: {
          Title: "*APIKey",
          SubTitle: "使用自定义 Stability API Key",
          Placeholder: "Stability API Key",
        },
        Endpoint: {
          Title: "服务基地址(base_url)",
          SubTitle: "样例：",
        },
      },
      Iflytek: {
        ApiKey: {
          Title: "*APIKey",
          SubTitle: "从讯飞星火控制台获取的 APIKey",
          Placeholder: "APIKey",
        },
        ApiSecret: {
          Title: "*ApiSecret",
          SubTitle: "从讯飞星火控制台获取的 APISecret",
          Placeholder: "APISecret",
        },
        Endpoint: {
          Title: "服务基地址(base_url)",
          SubTitle: "样例：",
        },
      },
      CustomModel: {
        Title: "自定义模型名",
        SubTitle: "增加自定义模型可选项，多个模型则使用英文逗号隔开，格式：模型名称@模型服务商，例如:deepseek-r1@Alibaba",
      },
    },
    RealtimeChat: {
      Title: "实时聊天配置",
    },
    TTT: {
      Title: "跨境交流配置",
      FromTo: "翻译模式",
    },
    Audio: {
      Title: "语音配置",
      Voice: "声音",
      VoiceDesc: "可选中文或英文声音",
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
      Pic: "上传视频人物照片",
      PicDesc: "人脸清晰且占据主要位置的照片效果最佳",
      EnableDownloadVideo: "启用下载视频",
      Hello: "招呼语",
      HelloDesc: "对话开始或者空闲时间视频主体使用的招呼语",
      ProcessingVoice: "听到啦！等我想一下...",
      FreeVoice: "嗯？你有说话吗？我仿佛听到了什么...",
      Msg: {
        InvalidPic: "无法识别照片中的人物，请选择清晰且人物上半身占据主要位置的照片",
        SetFailed: "设置失败，请重试",
        SetSuccess: "设置成功",
        Confirm: "确定是否使用当前的语音通话配置和视频通话配置？",
      }
    },
    Model: {
      Title: "大模型参数配置",
      Model: {
        Title: "当前使用的模型",
        SubTitle: "注：以下参数配置仅对角色扮演有效",
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
        SubTitle: "```\n用户输入的消息会按照此模板填充，占位符支持：\n- {{input}}：用户的输入\n- {{model}}：模型名称\n- {{time}}：当前日期\n- {{lang}}：语言\n- {{user}}：用户名",
      },
    },
    AIChat: {
      Title: "角色扮演配置",
      Enable: {
        Title: "启用文本转语音",
        SubTitle: "启用文本生成语音服务",
      },
      Autoplay: {
        Title: "启用自动朗读",
        SubTitle: "AI对话自动生成语音并播放",
      },
      Model: "模型",
      Engine: "转换引擎",
      Voice: {
        Title: "声音",
        SubTitle: "生成语音时使用的声音",
      },
      Speed: {
        Title: "速度",
        SubTitle: "生成语音的速度",
      },
    },
    Realtime: {
      Enable: {
        Title: "实时聊天",
        SubTitle: "开启实时聊天功能",
      },
      Provider: {
        Title: "模型服务商",
        SubTitle: "切换不同的服务商",
      },
      Model: {
        Title: "模型",
        SubTitle: "选择一个模型",
      },
      ApiKey: {
        Title: "API Key",
        SubTitle: "API Key",
        Placeholder: "API Key",
      },
      Azure: {
        Endpoint: {
          Title: "接口地址",
          SubTitle: "接口地址",
        },
        Deployment: {
          Title: "部署名称",
          SubTitle: "部署名称",
        },
      },
      Temperature: {
        Title: "随机性 (temperature)",
        SubTitle: "值越大，回复越随机",
      },
    },
    P2V: {
      Title: "音视频参数设置",
      Video: {
        Duration: "每张图片生成的视频时长",
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
    Toast: (x: any) => `包含 ${x} 条预设提示词`,
    Edit: "当前对话设置",
    Add: "新增一条对话",
    Clear: "上下文已清除",
    Revert: "恢复上下文",
  },
  Plugin: {
    Name: "插件",
    Page: {
      Title: "插件",
      SubTitle: (count: number) => `${count} 个插件`,
      Search: "搜索插件",
      Create: "新建",
      Find: "您可以在Github上找到优秀的插件：",
    },
    Item: {
      Info: (count: number) => `${count} 方法`,
      View: "查看",
      Edit: "编辑",
      Delete: "删除",
      DeleteConfirm: "确认删除？",
    },
    Auth: {
      None: "不需要授权",
      Basic: "Basic",
      Bearer: "Bearer",
      Custom: "自定义",
      CustomHeader: "自定义参数名称",
      Token: "Token",
      Proxy: "使用代理",
      ProxyDescription: "使用代理解决 CORS 错误",
      Location: "位置",
      LocationHeader: "Header",
      LocationQuery: "Query",
      LocationBody: "Body",
    },
    EditModal: {
      Title: (readonly: boolean) => `编辑插件 ${readonly ? "（只读）" : ""}`,
      Download: "下载",
      Auth: "授权方式",
      Content: "OpenAPI Schema",
      Load: "从网页加载",
      Method: "方法",
      Error: "格式错误",
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
    Return: "返回",
    Skip: "直接开始",
    NotShow: "不再展示",
    ConfirmNoShow: "确认禁用？禁用后可以随时在设置中重新启用。",
    Title: "挑选一个角色",
    SubTitle: "选择特定角色可以进行灵魂深处的对话",
    More: "查看全部",
  },
  URLCommand: {
    Code: "检测到链接中已经包含访问码，是否自动填入？",
    Settings: "检测到链接中包含了预制设置，是否自动填入？",
  },
  Exporter: {
    Description: {
      Title: "只有清除上下文之后的消息会被展示",
    },
    Model: "模型名称",
    Messages: "消息总数",
    Topic: "聊天主题",
    StartTime: "开始时间",
    EndTime: "结束时间",
    StartEnd: "时长(分钟)",
    Attendees: "参会人员"
  },
  SdPanel: {
    Prompt: "画面提示",
    NegativePrompt: "否定提示",
    PleaseInput: (name: string) => `请输入${name}`,
    AspectRatio: "横纵比",
    ImageStyle: "图像风格",
    OutFormat: "输出格式",
    AIModel: "AI模型",
    ModelVersion: "模型版本",
    Submit: "提交生成",
    ParamIsRequired: (name: string) => `${name}不能为空`,
    Styles: {
      D3Model: "3D模型",
      AnalogFilm: "模拟电影",
      Anime: "动漫",
      Cinematic: "电影风格",
      ComicBook: "漫画书",
      DigitalArt: "数字艺术",
      Enhance: "增强",
      FantasyArt: "幻想艺术",
      Isometric: "等角",
      LineArt: "线描",
      LowPoly: "低多边形",
      ModelingCompound: "建模材料",
      NeonPunk: "霓虹朋克",
      Origami: "折纸",
      Photographic: "摄影",
      PixelArt: "像素艺术",
      TileTexture: "贴图",
    },
  },
  Sd: {
    SubTitle: (count: number) => `共 ${count} 条绘画`,
    Actions: {
      Params: "查看参数",
      Copy: "复制提示词",
      Delete: "删除",
      Retry: "重试",
      ReturnHome: "返回首页",
      History: "查看历史",
    },
    EmptyRecord: "暂无绘画记录",
    Status: {
      Name: "状态",
      Success: "成功",
      Error: "失败",
      Wait: "等待中",
      Running: "运行中",
    },
    Danger: {
      Delete: "确认删除？",
    },
    GenerateParams: "生成参数",
    Detail: "详情",
  },
};

type DeepPartial<T> = T extends object
  ? {
    [P in keyof T]?: DeepPartial<T[P]>;
  }
  : T;

export type LocaleType = typeof zh;
export type PartialLocaleType = DeepPartial<typeof zh>;

export default zh;
