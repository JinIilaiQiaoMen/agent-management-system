'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  ShoppingBag,
  Send,
  AlertCircle,
} from 'lucide-react';
import { PLATFORMS } from '@/lib/social-media/platform-config';
import { DOMESTIC_PLATFORMS } from '@/lib/social-media/domestic-platforms';

interface PlatformStatus {
  platformId: string;
  platformName: string;
  status: 'pending' | 'publishing' | 'success' | 'failed';
  message?: string;
  postId?: string;
}

interface OneClickPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  mediaUrls?: string[];
  productName?: string;
}

export default function OneClickPublishModal({
  isOpen,
  onClose,
  content,
  mediaUrls = [],
  productName = '',
}: OneClickPublishModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [useSchedule, setUseSchedule] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [platformStatuses, setPlatformStatuses] = useState<PlatformStatus[]>([]);
  const [publishComplete, setPublishComplete] = useState(false);

  // 海外平台
  const overseasPlatforms = Object.entries(PLATFORMS).map(([id, config]) => ({
    id,
    name: config.name,
    icon: config.icon,
    category: 'overseas',
    requiresAuth: config.requiresAuth,
    supportedTypes: config.supportedContentTypes,
  }));

  // 国内平台（取前10个常用平台）
  const domesticPlatforms = Object.entries(DOMESTIC_PLATFORMS)
    .slice(0, 10)
    .map(([id, config]) => ({
      id,
      name: config.name,
      icon: config.icon,
      category: config.category,
      requiresAuth: config.requiresAuth,
      supportedTypes: config.supportedContentTypes,
    }));

  const allPlatforms = [...overseasPlatforms, ...domesticPlatforms];

  // 重置状态
  useEffect(() => {
    if (!isOpen) {
      setSelectedPlatforms([]);
      setScheduledTime('');
      setUseSchedule(false);
      setPublishing(false);
      setPlatformStatuses([]);
      setPublishComplete(false);
    }
  }, [isOpen]);

  // 切换平台选择
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  // 执行发布
  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) return;

    setPublishing(true);
    setPublishComplete(false);

    // 初始化所有平台状态
    const initialStatuses: PlatformStatus[] = selectedPlatforms.map((id) => {
      const platform = allPlatforms.find((p) => p.id === id);
      return {
        platformId: id,
        platformName: platform?.name || id,
        status: 'pending',
      };
    });
    setPlatformStatuses(initialStatuses);

    // 逐个发布
    for (const platformId of selectedPlatforms) {
      // 更新状态为发布中
      setPlatformStatuses((prev) =>
        prev.map((s) =>
          s.platformId === platformId ? { ...s, status: 'publishing' } : s
        )
      );

      try {
        const response = await fetch('/api/pet-content/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: platformId,
            content,
            mediaUrls,
            scheduledTime: useSchedule ? scheduledTime : undefined,
            productName,
          }),
        });

        const result = await response.json();

        // 更新状态
        setPlatformStatuses((prev) =>
          prev.map((s) =>
            s.platformId === platformId
              ? {
                  ...s,
                  status: result.success ? 'success' : 'failed',
                  message: result.message || result.error,
                  postId: result.postId,
                }
              : s
          )
        );
      } catch (error: any) {
        setPlatformStatuses((prev) =>
          prev.map((s) =>
            s.platformId === platformId
              ? { ...s, status: 'failed', message: error.message }
              : s
          )
        );
      }

      // 添加小延迟，避免请求过快
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setPublishing(false);
    setPublishComplete(true);
  };

  // 关闭对话框
  const handleClose = () => {
    if (!publishing) {
      onClose();
    }
  };

  // 计算发布统计
  const successCount = platformStatuses.filter(
    (s) => s.status === 'success'
  ).length;
  const failedCount = platformStatuses.filter(
    (s) => s.status === 'failed'
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5 text-emerald-600" />
            <span>一键发布到社媒平台</span>
          </DialogTitle>
          <DialogDescription>
            选择要发布的平台，支持同时发布到多个平台
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 内容预览 */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              发布内容预览
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
              {content}
            </p>
            {mediaUrls.length > 0 && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs text-slate-500">附件:</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  {mediaUrls.length} 个媒体文件
                </span>
              </div>
            )}
          </div>

          {/* 平台选择 */}
          {!publishing && !publishComplete && (
            <>
              {/* 海外平台 */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    海外平台
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {overseasPlatforms.map((platform) => (
                    <label
                      key={platform.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                      }`}
                    >
                      <Checkbox
                        checked={selectedPlatforms.includes(platform.id)}
                        onCheckedChange={() => togglePlatform(platform.id)}
                      />
                      <span className="text-lg">{platform.icon}</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {platform.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 国内平台 */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <ShoppingBag className="h-4 w-4 text-orange-600" />
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    国内平台
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {domesticPlatforms.map((platform) => (
                    <label
                      key={platform.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                      }`}
                    >
                      <Checkbox
                        checked={selectedPlatforms.includes(platform.id)}
                        onCheckedChange={() => togglePlatform(platform.id)}
                      />
                      <span className="text-lg">{platform.icon}</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {platform.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 定时发布选项 */}
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex items-center space-x-3 mb-3">
                  <Checkbox
                    id="schedule"
                    checked={useSchedule}
                    onCheckedChange={(checked) => setUseSchedule(checked as boolean)}
                  />
                  <label
                    htmlFor="schedule"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2"
                  >
                    <Clock className="h-4 w-4" />
                    <span>定时发布</span>
                  </label>
                </div>

                {useSchedule && (
                  <Input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="mt-2"
                  />
                )}
              </div>
            </>
          )}

          {/* 发布进度 */}
          {(publishing || publishComplete) && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                发布进度
              </h4>
              <div className="space-y-2">
                {platformStatuses.map((status) => (
                  <div
                    key={status.platformId}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">
                        {status.platformName}
                      </span>
                      {status.status === 'publishing' && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      )}
                      {status.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      )}
                      {status.status === 'failed' && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        status.status === 'success'
                          ? 'text-emerald-600'
                          : status.status === 'failed'
                          ? 'text-red-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {status.status === 'pending' && '等待中'}
                      {status.status === 'publishing' && '发布中...'}
                      {status.status === 'success' && '发布成功'}
                      {status.status === 'failed' && status.message}
                    </span>
                  </div>
                ))}
              </div>

              {/* 发布结果统计 */}
              {publishComplete && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4 mt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        成功: {successCount}
                      </span>
                    </div>
                    {failedCount > 0 && (
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">
                          失败: {failedCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!publishing && !publishComplete && (
            <>
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button
                onClick={handlePublish}
                disabled={selectedPlatforms.length === 0}
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
              >
                <Send className="h-4 w-4 mr-2" />
                发布到 {selectedPlatforms.length} 个平台
              </Button>
            </>
          )}

          {publishComplete && (
            <Button onClick={handleClose} className="w-full">
              完成
            </Button>
          )}

          {publishing && (
            <Button disabled className="w-full">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              发布中，请稍候...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
