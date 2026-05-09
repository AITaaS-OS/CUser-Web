/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getClientConfig } from "./config/client";
import type { Metadata, Viewport } from "next";
// import { LayoutID } from "./constant";
// import styles from "./styles/layout.module.scss";
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import { AppSidebar } from "./sidebar";

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { BasePath } from "@/app/config/env";
import { AITaaSLogo } from "./constant";

export const metadata: Metadata = {
  title: "AITaaS - AI智能创作平台",
  icons: AITaaSLogo.Favicon,
  description: "支持文本、图片、语音、视频等多媒体内容生成和融合的AI智能创作平台",
  appleWebApp: {
    title: "AITaaS - AI智能创作平台",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="config" content={JSON.stringify(getClientConfig())} />
        <meta name="referrer" content="no-referrer" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          rel="manifest"
          href={BasePath + "/site.webmanifest"}
          crossOrigin="use-credentials"
        ></link>
        <script src={BasePath + "/serviceWorkerRegister.js"} defer></script>
      </head>
      <body>
        <ConfigProvider theme={{
          token: {
            "colorPrimary": "#cc0000",
            "colorInfo": "#cc0000",
            "borderRadius": 4
          },

          components: {
            Upload: {

            },
          },
        }}
        >
          {/* {children} */}
          <AntdRegistry>{children}</AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}
