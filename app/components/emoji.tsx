import EmojiPicker, {
  Emoji,
  EmojiStyle,
  Theme as EmojiTheme,
} from "emoji-picker-react";

import LogoIcon from "../icons/logo.png";
import { DEFAULT_MASK_AVATAR } from "../constant";

export function getEmojiUrl(unified: string, style: EmojiStyle) {
  return `https://fastly.jsdelivr.net/npm/emoji-datasource-apple/img/${style}/64/${unified}.png`;
}

export function AvatarPicker(props: {
  onEmojiClick: (emojiId: string) => void;
}) {
  return (
    <EmojiPicker
      width={"100%"}
      lazyLoadEmojis
      theme={EmojiTheme.AUTO}
      getEmojiUrl={getEmojiUrl}
      onEmojiClick={(e) => {
        props.onEmojiClick(e.unified);
      }}
    />
  );
}

export function Avatar(props: Readonly<{ avatar?: string }>) {
  if (!props.avatar|| props.avatar === DEFAULT_MASK_AVATAR) {
    return (
      <div className="no-dark">
        {/* <BotIcon className="user-avatar" /> */}
        <img alt="AITaaS" src={LogoIcon.src} className="bot-avatar"/>
      </div>
    );
  }

  return (
    <div className="user-avatar">
      <EmojiAvatar avatar={props.avatar} />
    </div>
  );
}

export function EmojiAvatar(props: { avatar: string; size?: number }) {
  return (
    <Emoji
      unified={props.avatar}
      size={props.size ?? 18}
      getEmojiUrl={getEmojiUrl}
    />
  );
}
