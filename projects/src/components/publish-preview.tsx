'use client';

import { DOMESTIC_PLATFORMS } from '@/lib/social-media/domestic-platforms';

interface PublishPreviewProps {
  platformId: string;
  contentType: string;
  title?: string;
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  productInfo?: {
    price?: string;
    originalPrice?: string;
    stock?: string;
    category?: string;
  };
  scheduledTime?: string;
}

export function PublishPreview({
  platformId,
  contentType,
  title,
  content,
  mediaUrls,
  hashtags,
  productInfo,
  scheduledTime
}: PublishPreviewProps) {
  const platform = DOMESTIC_PLATFORMS[platformId];

  if (!platform) {
    return null;
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      {/* 预览头部 */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{platform.icon}</span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{platform.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {contentType === 'product' ? '商品' : contentType} 预览
            </p>
          </div>
        </div>
      </div>

      {/* 预览内容 */}
      <div className="p-4">
        {/* 商品标题（仅电商） */}
        {contentType === 'product' && title && (
          <div className="mb-3">
            <p className="text-base font-bold text-slate-900 dark:text-white line-clamp-2">
              {title}
            </p>
          </div>
        )}

        {/* 商品信息（仅电商） */}
        {contentType === 'product' && productInfo && (
          <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ¥{productInfo.price}
                </p>
                {productInfo.originalPrice && (
                  <p className="text-sm text-slate-400 line-through">
                    ¥{productInfo.originalPrice}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  库存: {productInfo.stock || '不限'}
                </p>
                {productInfo.category && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {productInfo.category}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 媒体内容 */}
        {mediaUrls.length > 0 && (
          <div className="mb-3">
            {mediaUrls.length === 1 ? (
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={mediaUrls[0]}
                  alt="预览图片"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`grid gap-2 ${
                mediaUrls.length === 2 ? 'grid-cols-2' :
                mediaUrls.length === 3 ? 'grid-cols-2 grid-rows-2' :
                'grid-cols-2'
              }`}>
                {mediaUrls.slice(0, 4).map((url, index) => (
                  <div
                    key={index}
                    className={`aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden ${
                      mediaUrls.length === 3 && index === 0 ? 'row-span-2' : ''
                    }`}
                  >
                    <img
                      src={url}
                      alt={`预览图片 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 文本内容 */}
        <div className="mb-3">
          <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap line-clamp-3">
            {content}
          </p>
        </div>

        {/* 话题标签 */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {hashtags.map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        {/* 定时信息 */}
        {scheduledTime && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>定时: {new Date(scheduledTime).toLocaleString('zh-CN')}</span>
          </div>
        )}

        {/* 平台特性提示 */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ℹ️ {platform.description}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            支持: {platform.supportedContentTypes.join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
}
