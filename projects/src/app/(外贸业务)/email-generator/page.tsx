'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Send,
  Brain,
  FileText,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface IntentAnalysis {
  intent: string;
  sentiment: string;
  urgency: string;
  keyPoints: string[];
  questions: string[];
  suggestion: string;
  tone: string;
}

export default function EmailGeneratorPage() {
  const [emailType, setEmailType] = useState<'reply' | 'followup' | 'new'>('new');
  const [recipientName, setRecipientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [previousEmail, setPreviousEmail] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [intentAnalysis, setIntentAnalysis] = useState<IntentAnalysis | null>(null);
  const [showIntentPanel, setShowIntentPanel] = useState(false);

  // 邮件类型标签
  const emailTypeLabels = {
    reply: '回复邮件',
    followup: '跟进邮件',
    new: '新开发邮件'
  };

  // 意图类型标签
  const getIntentBadge = (intent: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      inquiry: { color: 'bg-blue-100 text-blue-700', label: '询价咨询' },
      complaint: { color: 'bg-red-100 text-red-700', label: '投诉反馈' },
      order: { color: 'bg-green-100 text-green-700', label: '订单相关' },
      followup: { color: 'bg-yellow-100 text-yellow-700', label: '跟进询问' },
      other: { color: 'bg-gray-100 text-gray-700', label: '其他' }
    };
    return badges[intent] || badges.other;
  };

  // 情感倾向标签
  const getSentimentBadge = (sentiment: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      positive: { color: 'bg-green-100 text-green-700', label: '正面' },
      negative: { color: 'bg-red-100 text-red-700', label: '负面' },
      neutral: { color: 'bg-gray-100 text-gray-700', label: '中性' }
    };
    return badges[sentiment] || badges.neutral;
  };

  // 紧急程度标签
  const getUrgencyBadge = (urgency: string) => {
    const badges: Record<string, { color: string; label: string; icon: any }> = {
      high: { color: 'bg-red-100 text-red-700', label: '紧急', icon: AlertCircle },
      medium: { color: 'bg-yellow-100 text-yellow-700', label: '一般', icon: HelpCircle },
      low: { color: 'bg-green-100 text-green-700', label: '不紧急', icon: Check }
    };
    return badges[urgency] || badges.medium;
  };

  // 生成邮件
  const generateEmail = async () => {
    if (!recipientName || !companyName) {
      alert('请填写收件人姓名和公司名称');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/email-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailType,
          recipientName,
          companyName,
          subject,
          previousEmail,
          intentAnalysis
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedEmail(data.content);
      if (!subject && data.subject) {
        setSubject(data.subject);
      }
    } catch (error: any) {
      alert('生成失败：' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 分析邮件意图
  const analyzeEmailIntent = async () => {
    if (!previousEmail) {
      alert('请先粘贴对方的邮件内容');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/email-generator/analyze-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailContent: previousEmail
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setIntentAnalysis(data.analysis);
      setShowIntentPanel(true);
      setEmailType('reply');

      // 自动生成回复
      await generateEmail();
    } catch (error: any) {
      alert('分析失败：' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 清空表单
  const resetForm = () => {
    setRecipientName('');
    setCompanyName('');
    setSubject('');
    setGeneratedEmail('');
    setPreviousEmail('');
    setIntentAnalysis(null);
    setShowIntentPanel(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Mail className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              智能邮件生成器
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            AI驱动的外贸邮件生成，支持意图分析和上下文感知
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：输入区域 */}
          <div className="space-y-6">
            {/* 邮件类型选择 */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">邮件类型</CardTitle>
                <CardDescription>选择您要生成的邮件类型</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={emailType} onValueChange={(v) => setEmailType(v as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="new" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>新开发</span>
                    </TabsTrigger>
                    <TabsTrigger value="reply" className="flex items-center space-x-2">
                      <ReplyIcon className="h-4 w-4" />
                      <span>回复</span>
                    </TabsTrigger>
                    <TabsTrigger value="followup" className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>跟进</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* 基本信息 */}
            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader>
                <CardTitle className="text-lg">基本信息</CardTitle>
                <CardDescription>收件人信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipientName">收件人姓名 *</Label>
                    <Input
                      id="recipientName"
                      placeholder="John Smith"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">公司名称 *</Label>
                    <Input
                      id="companyName"
                      placeholder="ABC Trading Co."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">邮件主题（可选）</Label>
                  <Input
                    id="subject"
                    placeholder="关于产品合作的询问"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 上下文邮件 */}
            {(emailType === 'reply' || emailType === 'followup') && (
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">对方邮件内容</CardTitle>
                      <CardDescription>
                        {emailType === 'reply' ? '粘贴对方发来的邮件' : '粘贴之前的邮件内容'}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={analyzeEmailIntent}
                      disabled={isAnalyzing || !previousEmail}
                      className="flex items-center space-x-2"
                    >
                      <Brain className="h-4 w-4" />
                      <span>{isAnalyzing ? '分析中...' : '分析意图并生成'}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="在此粘贴对方的邮件内容..."
                    value={previousEmail}
                    onChange={(e) => setPreviousEmail(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </CardContent>
              </Card>
            )}

            {/* 意图分析结果 */}
            {showIntentPanel && intentAnalysis && (
              <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span>邮件意图分析</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 意图和情感 */}
                  <div className="flex flex-wrap gap-2">
                    <Badge {...getIntentBadge(intentAnalysis.intent)}>
                      {getIntentBadge(intentAnalysis.intent).label}
                    </Badge>
                    <Badge {...getSentimentBadge(intentAnalysis.sentiment)}>
                      {getSentimentBadge(intentAnalysis.sentiment).label}
                    </Badge>
                    <Badge {...getUrgencyBadge(intentAnalysis.urgency)}>
                      {(() => {
                        const urgencyBadge = getUrgencyBadge(intentAnalysis.urgency);
                        const IconComponent = urgencyBadge.icon;
                        return <IconComponent className="h-3 w-3 mr-1" />;
                      })()}
                      {getUrgencyBadge(intentAnalysis.urgency).label}
                    </Badge>
                  </div>

                  {/* 关键信息 */}
                  {intentAnalysis.keyPoints.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
                        关键信息：
                      </h4>
                      <ul className="space-y-1">
                        {intentAnalysis.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 需要回答的问题 */}
                  {intentAnalysis.questions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
                        需要回答的问题：
                      </h4>
                      <ul className="space-y-1">
                        {intentAnalysis.questions.map((question, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="mr-2">Q{index + 1}:</span>
                            <span>{question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 回复建议 */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-300">
                      回复建议：
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {intentAnalysis.suggestion}
                    </p>
                    <div className="mt-2">
                      <span className="text-xs text-purple-600 dark:text-purple-400">
                        建议语气：{intentAnalysis.tone}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 生成按钮 */}
            <div className="flex space-x-3">
              <Button
                onClick={generateEmail}
                disabled={isGenerating || (!recipientName || !companyName)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    生成邮件
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                重置
              </Button>
            </div>
          </div>

          {/* 右侧：生成结果 */}
          <Card className="border-l-4 border-l-green-500 sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">生成的邮件</CardTitle>
                  <CardDescription>可直接编辑和复制</CardDescription>
                </div>
                {generatedEmail && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          复制
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedEmail ? (
                <div className="space-y-4">
                  {/* 邮件主题 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      主题：
                    </Label>
                    <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="border-none bg-transparent"
                      />
                    </div>
                  </div>

                  {/* 可编辑的邮件正文 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      正文（可编辑）：
                    </Label>
                    <Textarea
                      value={generatedEmail}
                      onChange={(e) => setGeneratedEmail(e.target.value)}
                      rows={20}
                      className="resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <FileText className="h-4 w-4" />
                    <span>提示：您可以直接编辑上面的内容</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                  <Mail className="h-16 w-16 text-gray-300" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      填写左侧信息后点击"生成邮件"
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      AI 将为您生成专业的商务邮件
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 使用说明 */}
        <Card className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
          <CardHeader>
            <CardTitle className="text-lg">💡 使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-purple-600" />
                  意图分析功能
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="mr-2">1.</span>
                    <span>在"对方邮件内容"中粘贴收到的邮件</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">2.</span>
                    <span>点击"分析意图并生成"按钮</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">3.</span>
                    <span>AI 会自动分析邮件意图、情感和关键信息</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">4.</span>
                    <span>基于分析结果生成更精准的回复</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <EditIcon className="h-4 w-4 mr-2 text-blue-600" />
                  可编辑功能
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>邮件主题可直接编辑修改</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>邮件正文支持完整编辑</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>修改后可直接复制使用</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>建议根据实际情况调整语气和细节</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 辅助组件
function ReplyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}
