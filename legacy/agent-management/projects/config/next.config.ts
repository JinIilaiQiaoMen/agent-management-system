import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Docker部署优化
  output: 'standalone',

  // 开发环境配置
  allowedDevOrigins: ['*.dev.coze.site'],

  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
  },

  // 性能优化
  compress: true,

  // 生产环境优化
  reactStrictMode: true,

  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
