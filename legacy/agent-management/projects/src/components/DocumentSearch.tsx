"use client";

import { useState, useEffect } from "react";
import { Search, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { apiPost } from "@/lib/api";

interface DocumentSearchProps {
  knowledgeBaseId?: string;
  onDocumentSelect?: (documentId: string) => void;
}

export default function DocumentSearch({ knowledgeBaseId, onDocumentSelect }: DocumentSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const data = await apiPost<{
        success: boolean;
        query: string;
        count: number;
        data: any[];
      }>("/api/knowledge-bases/search", {
        query,
        knowledgeBaseId,
        limit: 10,
      });

      setResults(data.data || []);
      setShowResults(true);
    } catch (error: any) {
      console.error("搜索失败:", error);
      // 设置错误状态，但不影响用户体验
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="relative">
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="搜索文档..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 搜索结果下拉框 */}
      {showResults && results.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 max-h-96 overflow-y-auto p-2 shadow-lg">
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 border-b">
              找到 {results.length} 个结果
            </div>
            {results.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  onDocumentSelect?.(doc.id);
                  setShowResults(false);
                  setQuery("");
                }}
                className="w-full text-left p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate"
                      dangerouslySetInnerHTML={{ __html: doc.fileName }}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {doc.fileType.split("/")[1] || doc.fileType}
                      </Badge>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </div>
                    {doc.contentPreview && (
                      <p
                        className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: doc.contentPreview }}
                      />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* 无结果提示 */}
      {showResults && results.length === 0 && !isSearching && query.trim() && (
        <Card className="absolute z-50 w-full mt-2 p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-slate-400" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              没有找到相关文档
            </p>
          </div>
        </Card>
      )}

      {/* 加载中 */}
      {isSearching && (
        <Card className="absolute z-50 w-full mt-2 p-4 shadow-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            搜索中...
          </p>
        </Card>
      )}
    </div>
  );
}
