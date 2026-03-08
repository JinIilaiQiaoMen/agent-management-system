'use client';

import { useState, useEffect } from 'react';
import { Share2, Copy, Check, Users, Calendar, ExternalLink } from 'lucide-react';

interface ShareTemplateDialogProps {
  template: {
    id: string;
    name: string;
    isShared?: boolean;
    shareId?: string;
    shareCount?: number;
  };
  onShare: (shareId: string) => void;
  onUnshare: () => void;
  onClose: () => void;
}

export function ShareTemplateDialog({
  template,
  onShare,
  onUnshare,
  onClose
}: ShareTemplateDialogProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (template.shareId) {
      // 模拟构建分享 URL
      setShareUrl(`${window.location.origin}/templates/shared/${template.shareId}`);
    }
  }, [template.shareId]);

  const handleShare = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/domestic-platforms/templates?id=${template.id}&action=share`,
        { method: 'PUT' }
      );

      const data = await response.json();

      if (data.success) {
        onShare(data.template.shareId);
        setShareUrl(`${window.location.origin}/templates/shared/${data.template.shareId}`);
      }
    } catch (error) {
      console.error('分享失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/domestic-platforms/templates?id=${template.id}&action=unshare`,
        { method: 'PUT' }
      );

      const data = await response.json();

      if (data.success) {
        onUnshare();
      }
    } catch (error) {
      console.error('取消分享失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full">
        {/* 标题 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Share2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {template.isShared ? '管理分享' : '分享模板'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{template.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Copy className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {template.isShared ? (
            <>
              {/* 已分享状态 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                  <Check className="h-4 w-4" />
                  <span>模板已分享</span>
                </div>

                {/* 分享链接 */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 flex items-center space-x-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* 分享统计 */}
                <div className="flex items-center space-x-6 pt-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      使用 {template.shareCount || 0} 次
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-slate-500" />
                    <button
                      onClick={() => window.open(shareUrl, '_blank')}
                      className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      预览分享
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 未分享状态 */}
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    分享模板后，其他用户可以通过链接查看并使用您的模板
                  </p>
                </div>
              </div>
            </>
          )}

          {/* 分享提示 */}
          <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              分享链接永久有效，您可以随时取消分享。分享后，模板会被标记为公开状态。
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
          {template.isShared ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                关闭
              </button>
              <button
                onClick={handleUnshare}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 rounded-lg"
              >
                {loading ? '处理中...' : '取消分享'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleShare}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 rounded-lg flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>{loading ? '生成中...' : '生成分享链接'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
