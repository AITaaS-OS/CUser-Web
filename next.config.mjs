import webpack from "webpack";

const mode = process.env.BUILD_MODE ?? "standalone";
const disableChunk = !!process.env.DISABLE_CHUNK || mode === "export";

// Add by AITaaS
// 配置运行时根路径
// 例如需要访问http://xxx/cuser时，则配置basePath = '/cuser';
// 如果运行在根路径http://xxx，则配置basePath = '';
// ！！！不要最后的/ ！！！
// ！！！同时设置constant.ts中的BasePath和此处一致！！！
// 另外还需要手动修改serviceWorkerRegister.js中的serviceWorkerPath和 site.webmanifest中的start_url
// 还有tauri.conf.json的build.devPath的路径和tauri.windows.url的路径
const basePath = "/cuser";
// 输出目录dist
// 须同时修改tauri.conf.json中的distDir
const distPath = "/dist" + basePath;

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    if (disableChunk) {
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
      );
    }

    config.resolve.fallback = {
      child_process: false,
    };

    return config;
  },
  output: mode,
  images: {
    unoptimized: mode === "export",
  },
  experimental: {
    forceSwcTransforms: true,
    serverComponentsExternalPackages: ["pino", "pino-pretty"],
  },
  // eslint: {
  //   ignorePatterns: ["public/**"],
  //   // ignoreDuringBuilds: true,
  // },

  basePath: basePath,
  distDir: distPath,
};

const CorsHeaders = [
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Allow-Origin", value: "*" },
  {
    key: "Access-Control-Allow-Methods",
    value: "*",
  },
  {
    key: "Access-Control-Allow-Headers",
    value: "*",
  },
  {
    key: "Access-Control-Max-Age",
    value: "86400",
  },
];

if (mode !== "export") {
  nextConfig.headers = async () => {
    return [
      {
        source: "/api/:path*",
        headers: CorsHeaders,
      },
      {
        source: "/openapi/:path*",
        headers: CorsHeaders,
      },
    ];
  };

  nextConfig.rewrites = async () => {
    const ret = [
      {
        source:
          "/api/proxy/azure/:resource_name/deployments/:deploy_name/:path*",
        destination:
          "https://:resource_name.openai.azure.com/openai/deployments/:deploy_name/:path*",
      },
      {
        source: "/api/proxy/google/:path*",
        destination: "https://generativelanguage.googleapis.com/:path*",
      },
      {
        source: "/api/proxy/openai/:path*",
        destination: "https://api.openai.com/:path*",
      },
      {
        source: "/api/proxy/anthropic/:path*",
        destination: "https://api.anthropic.com/:path*",
      },
      {
        source: "/google-fonts/:path*",
        destination: "https://fonts.googleapis.com/:path*",
      },
      {
        source: "/sharegpt",
        destination: "https://sharegpt.com/api/conversations",
      },
      {
        source: "/api/proxy/alibaba/:path*",
        destination: "https://dashscope.aliyuncs.com/compatible-mode/v1/:path*",
      },
    ];

    return {
      beforeFiles: ret,
    };
  };
}

export default nextConfig;
