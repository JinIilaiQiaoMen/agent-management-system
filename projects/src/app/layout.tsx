/**
 * ZAEP - 根布局
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '智元企业AI中台 ZAEP',
  description: '企业级AI智能化管理平台 - 融合外贸业务、企业管理、智能营销三大核心能力',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
