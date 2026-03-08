"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface DragDropUploadProps {
  knowledgeBaseId: string;
  onUploadSuccess?: () => void;
  accept?: string;
  maxSize?: number; // MB
}

interface UploadFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export default function DragDropUpload({
  knowledgeBaseId,
  onUploadSuccess,
  accept = ".txt,.md,.pdf,.docx,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.mp3",
  maxSize = 50,
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedExtensions = [
    "txt", "md", "pdf", "docx", "xlsx", "doc", "xls",
    "jpg", "jpeg", "png", "gif", "webp", "bmp",
    "mp4", "avi", "mov", "wmv", "mkv", "flv",
    "mp3", "wav", "flac", "aac", "m4a"
  ];

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `文件大小不能超过${maxSize}MB` };
    }

    // 检查文件类型
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !supportedExtensions.includes(extension)) {
      return { valid: false, error: `不支持的文件类型: .${extension}` };
    }

    return { valid: true };
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const newFiles: UploadFile[] = files.map((file) => {
      const validation = validateFile(file);
      return {
        file,
        progress: 0,
        status: validation.valid ? "pending" : "error",
        error: validation.error,
      };
    });

    setUploadFiles((prev) => [...prev, ...newFiles]);

    // 自动开始上传有效文件
    newFiles.forEach((uploadFile) => {
      if (uploadFile.status === "pending") {
        uploadFileWithProgress(uploadFile.file);
      }
    });
  };

  const uploadFileWithProgress = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("knowledgeBaseId", knowledgeBaseId);

    setUploadFiles((prev) =>
      prev.map((uf) =>
        uf.file === file
          ? { ...uf, progress: 0, status: "uploading" as const }
          : uf
      )
    );

    try {
      const response = await fetch("/api/knowledge-bases/upload-file", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadFiles((prev) =>
          prev.map((uf) =>
            uf.file === file
              ? { ...uf, progress: 100, status: "success" as const }
              : uf
          )
        );

        // 延迟移除成功的文件
        setTimeout(() => {
          setUploadFiles((prev) => prev.filter((uf) => uf.file !== file));
          onUploadSuccess?.();
        }, 2000);
      } else {
        const error = await response.json();
        setUploadFiles((prev) =>
          prev.map((uf) =>
            uf.file === file
              ? {
                  ...uf,
                  status: "error" as const,
                  error: error.error || "上传失败",
                }
              : uf
          )
        );
      }
    } catch (error) {
      setUploadFiles((prev) =>
        prev.map((uf) =>
          uf.file === file
            ? {
                ...uf,
                status: "error" as const,
                error: "网络错误，请重试",
              }
            : uf
        )
      );
    }
  };

  const retryUpload = (file: File) => {
    setUploadFiles((prev) =>
      prev.map((uf) =>
        uf.file === file
          ? { ...uf, status: "pending" as const, error: undefined }
          : uf
      )
    );
    uploadFileWithProgress(file);
  };

  const removeFile = (file: File) => {
    setUploadFiles((prev) => prev.filter((uf) => uf.file !== file));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* 拖拽上传区域 */}
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600" />
        <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">
          拖拽文件到此处上传
        </p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          或点击选择文件 • 支持 {supportedExtensions.join(", ")} • 最大 {maxSize}MB
        </p>
      </Card>

      {/* 上传文件列表 */}
      {uploadFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            上传队列 ({uploadFiles.length})
          </p>
          {uploadFiles.map((uploadFile) => (
            <Card key={uploadFile.file.name} className="p-3">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {formatFileSize(uploadFile.file.size)}
                  </p>
                  {uploadFile.status === "uploading" && (
                    <Progress value={uploadFile.progress} className="h-1 mt-2" />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {uploadFile.status === "success" && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      成功
                    </Badge>
                  )}
                  {uploadFile.status === "error" && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {uploadFile.error || "失败"}
                    </Badge>
                  )}
                  {uploadFile.status === "uploading" && (
                    <Badge variant="secondary">
                      {uploadFile.progress}%
                    </Badge>
                  )}
                  {uploadFile.status === "error" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        retryUpload(uploadFile.file);
                      }}
                    >
                      重试
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(uploadFile.file);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
