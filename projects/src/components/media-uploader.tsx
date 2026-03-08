'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Video, AlertCircle } from 'lucide-react';

interface MediaUploaderProps {
  mediaUrls: string[];
  onMediaChange: (urls: string[]) => void;
  maxCount?: number;
  maxSize?: number; // MB
  accept?: string;
}

export function MediaUploader({
  mediaUrls,
  onMediaChange,
  maxCount = 9,
  maxSize = 10,
  accept = 'image/*,video/*'
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError('');

    if (files.length === 0) return;

    // 检查数量限制
    if (mediaUrls.length + files.length > maxCount) {
      setError(`最多只能上传 ${maxCount} 个文件`);
      return;
    }

    // 检查文件大小
    const oversizedFiles = files.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`文件大小不能超过 ${maxSize}MB`);
      return;
    }

    setUploading(true);

    try {
      // 模拟上传，实际应该上传到服务器或对象存储
      const uploadedUrls: string[] = [];

      for (const file of files) {
        // 这里使用本地预览URL作为示例
        // 实际应该上传到服务器返回真实URL
        const url = URL.createObjectURL(file);
        uploadedUrls.push(url);
      }

      onMediaChange([...mediaUrls, ...uploadedUrls]);
    } catch (err) {
      setError('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  }, [mediaUrls, maxCount, maxSize, onMediaChange]);

  const handleRemove = (index: number) => {
    const newUrls = mediaUrls.filter((_, i) => i !== index);
    onMediaChange(newUrls);
  };

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  };

  return (
    <div className="space-y-3">
      {/* 上传区域 */}
      {mediaUrls.length < maxCount && (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
          <input
            type="file"
            id="media-upload"
            multiple
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor="media-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            {uploading ? (
              <>
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <p className="text-sm text-slate-600 dark:text-slate-400">上传中...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    点击或拖拽上传图片/视频
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    最多 {maxCount} 个，单个文件不超过 {maxSize}MB
                  </p>
                </div>
              </>
            )}
          </label>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 已上传的媒体 */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {mediaUrls.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden"
            >
              {isVideo(url) ? (
                <video src={url} className="w-full h-full object-cover" controls={false} />
              ) : (
                <img src={url} alt={`上传的媒体 ${index + 1}`} className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-white" />
              </button>
              <div className="absolute bottom-2 left-2 p-1 bg-black/50 rounded-full">
                {isVideo(url) ? (
                  <Video className="h-3 w-3 text-white" />
                ) : (
                  <ImageIcon className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
