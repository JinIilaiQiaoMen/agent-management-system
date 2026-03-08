'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Database, 
  Plus,
  Upload,
  Search,
  FileText,
  Book,
  Lightbulb,
  HelpCircle,
  Loader2,
  Trash2,
  Edit,
  X,
  File,
  Folder,
  Sparkles,
  Check
} from 'lucide-react';

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source_type: string;
  source_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [editingDoc, setEditingDoc] = useState<KnowledgeDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'product',
    tags: '',
    sourceUrl: ''
  });

  // 确保 formData 始终有完整的结构
  const safeFormData = {
    title: formData.title || '',
    content: formData.content || '',
    category: formData.category || 'product',
    tags: formData.tags || '',
    sourceUrl: formData.sourceUrl || ''
  };

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'product', label: '产品信息', icon: FileText },
    { value: 'pricing', label: '价格政策', icon: Book },
    { value: 'process', label: '业务流程', icon: Lightbulb },
    { value: 'faq', label: '常见问题', icon: HelpCircle }
  ];

  // 加载文档列表
  useEffect(() => {
    loadDocuments();
  }, [selectedCategory, searchQuery]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/knowledge-documents?${params}`);
      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('加载文档失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData(prev => ({
          ...prev,
          title: data.title,
          content: data.content
        }));
      } else {
        alert(data.error || '文件处理失败');
      }
    } catch (error) {
      alert('文件上传失败');
    } finally {
      setUploading(false);
    }
  };

  // AI 智能分析
  const handleAIAnalyze = async () => {
    if (!safeFormData.content.trim()) {
      alert('请先上传文件或输入文档内容');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai-analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: safeFormData.content,
          fileName: safeFormData.title
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { title, category, tags, summary } = data.analysis;
        
        setFormData(prev => ({
          ...prev,
          title: title || prev.title || '',
          category: category || 'product',
          tags: Array.isArray(tags) ? tags.join(', ') : (tags || prev.tags || '')
        }));

        alert('✅ AI 分析完成！已自动填充标题、分类和标签');
      } else {
        alert(data.error || 'AI 分析失败');
      }
    } catch (error) {
      alert('AI 分析失败，请稍后重试');
    } finally {
      setAnalyzing(false);
    }
  };

  // 保存文档
  const handleSave = async () => {
    if (!safeFormData.title.trim() || !safeFormData.content.trim()) {
      alert('请填写标题和内容');
      return;
    }

    setUploading(true);
    try {
      const url = editingDoc
        ? `/api/knowledge-documents/${editingDoc.id}`
        : '/api/knowledge-documents';

      const method = editingDoc ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: safeFormData.title,
          content: safeFormData.content,
          category: safeFormData.category,
          tags: safeFormData.tags.split(',').map(t => t.trim()).filter(t => t),
          sourceUrl: safeFormData.sourceUrl || null,
          sourceType: 'text'
        })
      });

      if (response.ok) {
        alert(editingDoc ? '更新成功' : '添加成功');
        setUploadModalOpen(false);
        setEditingDoc(null);
        resetForm();
        loadDocuments();
      } else {
        const data = await response.json();
        alert(data.error || '保存失败');
      }
    } catch (error) {
      alert('操作失败');
    } finally {
      setUploading(false);
    }
  };

  // 删除文档
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个文档吗？')) return;

    try {
      const response = await fetch(`/api/knowledge-documents/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('删除成功');
        loadDocuments();
      } else {
        alert('删除失败');
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  // 编辑文档
  const handleEdit = (doc: KnowledgeDocument) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      content: doc.content,
      category: doc.category,
      tags: doc.tags.join(', '),
      sourceUrl: doc.source_url || ''
    });
    setUploadModalOpen(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'product',
      tags: '',
      sourceUrl: ''
    });
  };

  // 打开新建窗口
  const handleNew = () => {
    setEditingDoc(null);
    resetForm();
    setUploadModalOpen(true);
  };

  // 拖拽事件处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileSelect(files[0]);
    }
  };

  // 点击上传
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      product: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      pricing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      process: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      faq: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    };
    return colors[category] || colors.product;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    知识库管理
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    RAG 文档管理与 AI 智能识别
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleNew}
              className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" />
              <span>添加文档</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">文档总数</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">分类数量</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{categories.length - 1}</p>
              </div>
              <Folder className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">标签总数</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {documents.reduce((sum, doc) => sum + doc.tags.length, 0)}
                </p>
              </div>
              <Book className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索文档内容..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {categories.map(cat => {
                const CategoryIcon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      selectedCategory === cat.value
                        ? 'bg-cyan-500 text-white'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <File className="h-16 w-16 mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                暂无文档
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                点击"添加文档"开始构建您的知识库
              </p>
              <button
                onClick={handleNew}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-cyan-600"
              >
                添加文档
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {documents.map(doc => (
                <div key={doc.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getCategoryColor(doc.category)}`}>
                          {categories.find(c => c.value === doc.category)?.label}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(doc.created_at).toLocaleDateString('zh-CN')}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          · {doc.content.length} 字
                        </span>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {doc.title}
                      </h3>
                      <p className="mb-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {doc.content}
                      </p>
                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {doc.tags.map(tag => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        title="编辑"
                      >
                        <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="rounded-lg border border-slate-200 p-2 hover:bg-red-50 hover:border-red-300 dark:border-slate-700 dark:hover:bg-red-900/20"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4 text-slate-600 dark:text-slate-400 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {editingDoc ? '编辑文档' : '添加文档'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setUploadModalOpen(false);
                    setEditingDoc(null);
                    resetForm();
                  }}
                  className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* 拖拽上传区域 */}
              {!editingDoc && (
                <>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClickUpload}
                    className={`mb-4 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-slate-300 hover:border-cyan-400 dark:border-slate-700'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileInputChange}
                      className="hidden"
                      accept=".txt,.md,.json,.csv,.xml,.yml,.yaml"
                    />
                    <Upload className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      拖拽文件到此处或点击上传
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                      支持 TXT, MD, JSON, CSV, XML, YAML 等纯文本格式
                    </p>
                    {safeFormData.content && (
                      <div className="mt-3 flex items-center justify-center space-x-1 text-xs text-green-600 dark:text-green-400">
                        <Check className="h-3 w-3" />
                        <span>已读取 {safeFormData.content.length} 字</span>
                      </div>
                    )}
                  </div>

                  {/* AI 智能识别区域 */}
                  {safeFormData.content && (
                    <div className="mb-4 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 p-5 shadow-sm dark:border-purple-800 dark:from-purple-900/30 dark:via-purple-900/20 dark:to-pink-900/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                              <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                                AI 智能识别
                              </h4>
                              <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">
                                自动提取标题、分类、标签和摘要
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-400">
                              <Check className="h-3.5 w-3.5" />
                              <span>智能标题提取</span>
                            </div>
                            <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-400">
                              <Check className="h-3.5 w-3.5" />
                              <span>自动分类识别</span>
                            </div>
                            <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-400">
                              <Check className="h-3.5 w-3.5" />
                              <span>关键词标签生成</span>
                            </div>
                            <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-400">
                              <Check className="h-3.5 w-3.5" />
                              <span>文档摘要生成</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={handleAIAnalyze}
                            disabled={analyzing}
                            className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-purple-600 hover:to-pink-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {analyzing ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>分析中...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                <span>开始识别</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    标题 *
                  </label>
                  <input
                    type="text"
                    value={safeFormData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入文档标题"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    分类
                  </label>
                  <select
                    value={safeFormData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="product">产品信息</option>
                    <option value="pricing">价格政策</option>
                    <option value="process">业务流程</option>
                    <option value="faq">常见问题</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    内容 *
                  </label>
                  <textarea
                    value={safeFormData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="输入文档内容..."
                    rows={10}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none font-mono"
                  />
                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>字符数: {safeFormData.content.length}</span>
                    <span>行数: {safeFormData.content.split('\n').length}</span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    标签（用逗号分隔，AI 可自动识别）
                  </label>
                  <input
                    type="text"
                    value={safeFormData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="例如：产品, 介绍, 手册"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    来源 URL（可选）
                  </label>
                  <input
                    type="url"
                    value={safeFormData.sourceUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
                    placeholder="https://example.com/document"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setUploadModalOpen(false);
                      setEditingDoc(null);
                      resetForm();
                    }}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={uploading}
                    className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? (
                      <span className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>保存中...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <Check className="h-4 w-4" />
                        <span>保存</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
