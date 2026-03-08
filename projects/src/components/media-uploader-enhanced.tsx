'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Video, AlertCircle, Link, GripVertical, Edit, RefreshCw } from 'lucide-react';

interface MediaUploaderEnhancedProps {
  mediaUrls: string[];
  onMediaChange: (urls: string[]) => void;
  maxCount?: number;
  maxSize?: number; // MB
  accept?: string;
}

export function MediaUploaderEnhanced({
  mediaUrls,
  onMediaChange,
  maxCount = 9,
  maxSize = 10,
  accept = 'image/*,video/*'
}: MediaUploaderEnhancedProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
      // 模拟上传和压缩
      const uploadedUrls: string[] = [];

      for (const file of files) {
        // 压缩图片（如果是图片）
        let url = URL.createObjectURL(file);
        
        // 模拟压缩
        if (file.type.startsWith('image/')) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        uploadedUrls.push(url);
      }

      onMediaChange([...mediaUrls, ...uploadedUrls]);
    } catch (err) {
      setError('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  }, [mediaUrls, maxCount, maxSize, onMediaChange]);

  const handleUrlImport = async () => {
    if (!urlInput.trim()) return;

    setError('');
    setUploading(true);

    try {
      // 验证URL格式
      try {
        new URL(urlInput);
      } catch {
        setError('请输入有效的图片URL');
        setUploading(false);
        return;
      }

      // 检查数量限制
      if (mediaUrls.length >= maxCount) {
        setError(`最多只能上传 ${maxCount} 个文件`);
        setUploading(false);
        return;
      }

      // 模拟导入
      await new Promise(resolve => setTimeout(resolve, 500));

      onMediaChange([...mediaUrls, urlInput]);
      setUrlInput('');
      setShowUrlInput(false);
    } catch (err) {
      setError('导入失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const newUrls = mediaUrls.filter((_, i) => i !== index);
    onMediaChange(newUrls);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newUrls = [...mediaUrls];
    const [draggedItem] = newUrls.splice(draggedIndex, 1);
    newUrls.splice(dropIndex, 0, draggedItem);

    onMediaChange(newUrls);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  };

  const isUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  return (
    <div className="space-y-3">
      {/* 上传区域 */}
      {mediaUrls.length < maxCount && (
        <div className="space-y-2">
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
                  <p className="text-sm text-slate-600 dark:text-slate-400">处理中...</p>
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

          {/* URL导入 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center space-x-2 text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Link className="h-4 w-4" />
              <span>从URL导入</span>
            </button>
          </div>

          {showUrlInput && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
                placeholder="输入图片URL..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
              <button
                onClick={handleUrlImport}
                disabled={uploading || !urlInput.trim()}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 text-sm"
              >
                导入
              </button>
            </div>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 已上传的媒体 - 支持拖拽排序 */}
      {mediaUrls.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>拖拽可调整顺序</span>
            <span>{mediaUrls.length}/{maxCount}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {mediaUrls.map((url, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border-2 transition-all ${
                  draggedIndex === index
                    ? 'border-orange-500 opacity-50'
                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {/* 拖拽手柄 */}
                <div className="absolute top-2 left-2 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                  <GripVertical className="h-3 w-3 text-white" />
                </div>

                {/* 媒体内容 */}
                {isVideo(url) ? (
                  <video src={url} className="w-full h-full object-cover" controls={false} />
                ) : (
                  <img src={url} alt={`媒体 ${index + 1}`} className="w-full h-full object-cover" />
                )}

                {/* 媒体类型标识 */}
                <div className="absolute bottom-2 left-2 p-1 bg-black/50 rounded-full">
                  {isVideo(url) ? (
                    <Video className="h-3 w-3 text-white" />
                  ) : isUrl(url) ? (
                    <Link className="h-3 w-3 text-white" />
                  ) : (
                    <ImageIcon className="h-3 w-3 text-white" />
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {/* 编辑功能待实现 */}}
                    className="p-1 bg-black/50 rounded-full hover:bg-black/70"
                    title="编辑"
                  >
                    <Edit className="h-3 w-3 text-white" />
                  </button>
                  <button
                    onClick={() => handleRemove(index)}
                    className="p-1 bg-black/50 rounded-full hover:bg-red-600"
                    title="删除"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>

                {/* 序号 */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 rounded-full text-xs text-white">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
