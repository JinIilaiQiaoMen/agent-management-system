"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Bot,
  Settings,
  Database,
  Key,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function WechatConfigPage() {
  const [activeTab, setActiveTab] = useState('wechat');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 微信配置
  const [wechatConfig, setWechatConfig] = useState({
    appType: 'public', // public, enterprise, miniprogram
    appId: '',
    secret: '',
    token: '',
    encoding: 'UTF-8',
  });

  // 模型配置
  const [modelConfig, setModelConfig] = useState({
    provider: 'coze', // coze, zhipu, wenxin, qwen, openai, anthropic
    apiKey: '',
    baseUrl: '',
    model: '',
    temperature: 0.7,
    maxTokens: 500,
    timeout: 30000,
  });

  // 客服配置
  const [agentConfig, setAgentConfig] = useState({
    name: '客服助手',
    type: 'customer_service', // customer_service, sales, technical
    systemPrompt: '',
    autoReply: true,
    escalateToHuman: false,
    escalateKeywords: '',
    responseTime: 5000, // ms
    maxContextMessages: 10,
  });

  // 回复模板
  const [replyTemplates, setReplyTemplates] = useState([
    { id: 1, type: 'greeting', intent: 'greeting', content: '', priority: 1 },
    { id: 2, type: 'farewell', intent: 'farewell', content: '', priority: 1 },
    { id: 3, type: 'faq', intent: 'refund', content: '', priority: 9 },
    { id: 4, type: 'escalation', intent: 'escalate_to_human', content: '', priority: 10 },
  ]);

  // 产品信息
  const [productInfo, setProductInfo] = useState({
    name: '',
    business: '',
    customers: '',
    products: '',
    support: '',
    policy: '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // 保存配置到后端
      const response = await fetch('/api/config/wechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wechat: wechatConfig,
          model: modelConfig,
          agent: agentConfig,
          templates: replyTemplates,
          product: productInfo,
        }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert(`保存失败: ${error.message}`);
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/config/wechat/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: wechatConfig.appType,
          appId: wechatConfig.appId,
          secret: wechatConfig.secret,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert('连接测试成功！');
      } else {
        const error = await response.json();
        alert(`连接测试失败: ${error.message}`);
      }
    } catch (error) {
      console.error('连接测试失败:', error);
      alert('连接测试失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-teal-600 text-white">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  微信客服配置
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  配置微信自动回复系统
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">配置已保存</span>
                </div>
              )}
              <Button
                onClick={handleSave}
                disabled={loading}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? '保存中...' : '保存配置'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="wechat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              微信配置
            </TabsTrigger>
            <TabsTrigger value="model" className="gap-2">
              <Bot className="h-4 w-4" />
              大模型配置
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-2">
              <Settings className="h-4 w-4" />
              客服配置
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Database className="h-4 w-4" />
              回复模板
            </TabsTrigger>
            <TabsTrigger value="product" className="gap-2">
              <Key className="h-4 w-4" />
              产品信息
            </TabsTrigger>
          </TabsList>

          {/* 微信配置 */}
          <TabsContent value="wechat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>微信接入配置</CardTitle>
                <CardDescription>
                  配置微信公众号、企业微信或小程序的接入信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 应用类型 */}
                <div className="space-y-2">
                  <Label>应用类型</Label>
                  <Select value={wechatConfig.appType} onValueChange={(v) => setWechatConfig(prev => ({ ...prev, appType: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择应用类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">微信公众号</SelectItem>
                      <SelectItem value="enterprise">企业微信</SelectItem>
                      <SelectItem value="miniprogram">小程序</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* AppID */}
                <div className="space-y-2">
                  <Label htmlFor="appId">AppID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="appId"
                      placeholder="wx1234567890abcdef"
                      value={wechatConfig.appId}
                      onChange={(e) => setWechatConfig(prev => ({ ...prev, appId: e.target.value }))}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestConnection}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      测试连接
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    在微信公众平台 -> 基本配置 -> 开发者ID(AppID) 中查看
                  </p>
                </div>

                {/* AppSecret */}
                <div className="space-y-2">
                  <Label htmlFor="secret">AppSecret</Label>
                  <Input
                    id="secret"
                    type="password"
                    placeholder="1234567890abcdef"
                    value={wechatConfig.secret}
                    onChange={(e) => setWechatConfig(prev => ({ ...prev, secret: e.target.value }))}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    在微信公众平台 -> 基本配置 -> 开发者密码(AppSecret) 中查看
                  </p>
                </div>

                {/* Token (企业微信） */}
                {wechatConfig.appType === 'enterprise' && (
                  <div className="space-y-2">
                    <Label htmlFor="token">企业微信Token</Label>
                    <Input
                      id="token"
                      type="password"
                      placeholder="wwwwwwww-xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={wechatConfig.token}
                      onChange={(e) => setWechatConfig(prev => ({ ...prev, token: e.target.value }))}
                    />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      在企业微信管理后台 -> 企业管理 -> 获取企业Secret 中获取
                    </p>
                  </div>
                )}

                {/* 编码格式 */}
                <div className="space-y-2">
                  <Label>编码格式</Label>
                  <Select value={wechatConfig.encoding} onValueChange={(v) => setWechatConfig(prev => ({ ...prev, encoding: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择编码格式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTF-8">UTF-8</SelectItem>
                      <SelectItem value="GBK">GBK</SelectItem>
                      <SelectItem value="GB2312">GB2312</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 配置说明 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">配置说明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">微信公众号</h4>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-4">
                    <li>1. 访问 <a href="https://mp.weixin.qq.com" target="_blank" className="text-blue-600 hover:underline">微信公众平台</a></li>
                    <li>2. 登录并进入"开发"页面</li>
                    <li>3. 在"基本配置"中查看 AppID 和 AppSecret</li>
                    <li>4. 在"接口权限"中启用"服务器配置"</li>
                    <li>5. 配置"服务器地址(URL)"和"令牌(Token)"</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">企业微信</h4>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-4">
                    <li>1. 访问 <a href="https://work.weixin.qq.com" target="_blank" className="text-blue-600 hover:underline">企业微信管理后台</a></li>
                    <li>2. 进入"应用管理" → "自建应用"</li>
                    <li>3. 创建应用或选择已有应用</li>
                    <li>4. 在"企业内部开发"中获取企业微信ID和Secret</li>
                    <li>5. 在"通讯录管理"中配置部门和成员</li>
                    <li>6. 在"应用"中配置"应用可见范围"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 大模型配置 */}
          <TabsContent value="model" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI大模型配置</CardTitle>
                <CardDescription>
                  配置公司已部署或使用的AI大模型，用于生成自动回复
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 模型提供商 */}
                <div className="space-y-2">
                  <Label>模型提供商</Label>
                  <Select value={modelConfig.provider} onValueChange={(v) => setModelConfig(prev => ({ ...prev, provider: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择模型提供商" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coze">Coze (扣子)</SelectItem>
                      <SelectItem value="zhipu">智谱AI</SelectItem>
                      <SelectItem value="wenxin">文心一言</SelectItem>
                      <SelectItem value="qwen">通义千问</SelectItem>
                      <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                      <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-proj-..."
                    value={modelConfig.apiKey}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    在对应AI平台的开发者中心获取API Key
                  </p>
                </div>

                {/* Base URL (可选） */}
                <div className="space-y-2">
                  <Label htmlFor="baseUrl">Base URL (可选)</Label>
                  <Input
                    id="baseUrl"
                    placeholder="https://api.example.com"
                    value={modelConfig.baseUrl}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    自定义API端点，如果使用代理或自定义部署请填写
                  </p>
                </div>

                {/* 模型名称 */}
                <div className="space-y-2">
                  <Label htmlFor="modelName">模型名称</Label>
                  <Input
                    id="modelName"
                    placeholder="gpt-4-turbo"
                    value={modelConfig.model}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, model: e.target.value }))}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    要使用的模型名称，如 gpt-4-turbo, chatglm-turbo 等
                  </p>
                </div>

                {/* 温度 */}
                <div className="space-y-2">
                  <Label htmlFor="temperature">温度 ({modelConfig.temperature})</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={modelConfig.temperature}
                      onChange={(e) => setModelConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      较低 = 更确定，较高 = 更随机
                    </span>
                  </div>
                </div>

                {/* 最大Token数 */}
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">最大回复Token数</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="100"
                    max="4000"
                    value={modelConfig.maxTokens}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    控制回复的最大长度，建议500-2000
                  </p>
                </div>

                {/* 超时时间 */}
                <div className="space-y-2">
                  <Label htmlFor="timeout">请求超时 (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="1000"
                    max="120000"
                    value={modelConfig.timeout}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    单次请求的最大等待时间，建议30000 (30秒)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 测试模型 */}
            <Card>
              <CardHeader>
                <CardTitle>测试模型连接</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="输入测试消息..."
                    rows={3}
                    className="mb-4"
                  />
                  <Button onClick={handleTestConnection} disabled={loading} className="w-full">
                    {loading ? '测试中...' : '测试模型'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 客服配置 */}
          <TabsContent value="agent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>客服Agent配置</CardTitle>
                <CardDescription>
                  配置AI客服的行为和回复风格
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Agent名称 */}
                <div className="space-y-2">
                  <Label htmlFor="agentName">Agent名称</Label>
                  <Input
                    id="agentName"
                    placeholder="我的客服助手"
                    value={agentConfig.name}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* Agent类型 */}
                <div className="space-y-2">
                  <Label>Agent类型</Label>
                  <Select value={agentConfig.type} onValueChange={(v) => setAgentConfig(prev => ({ ...prev, type: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择Agent类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer_service">客服助手</SelectItem>
                      <SelectItem value="sales">销售助手</SelectItem>
                      <SelectItem value="technical">技术支持</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 系统提示词 */}
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">系统提示词</Label>
                  <Textarea
                    id="systemPrompt"
                    placeholder="你是一个专业的客服助手..."
                    value={agentConfig.systemPrompt}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    rows={6}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    这是AI的"人设"，用于控制回复风格和行为
                  </p>
                </div>

                {/* 自动回复 */}
                <div className="flex items-center justify-between">
                  <Label>启用自动回复</Label>
                  <Switch
                    checked={agentConfig.autoReply}
                    onCheckedChange={(checked) => setAgentConfig(prev => ({ ...prev, autoReply: checked }))}
                  />
                </div>

                {/* 升级到人工 */}
                <div className="space-y-2">
                  <Label>升级到人工关键词</Label>
                  <Input
                    placeholder="人工, 客服, 转接"
                    value={agentConfig.escalateKeywords}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, escalateKeywords: e.target.value }))}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    当消息包含这些关键词时，自动升级到人工客服
                  </p>
                </div>

                {/* 响应时间 */}
                <div className="space-y-2">
                  <Label>期望响应时间 (ms)</Label>
                  <Input
                    type="number"
                    min="1000"
                    max="60000"
                    value={agentConfig.responseTime}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, responseTime: parseInt(e.target.value) }))}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    系统会在此时间内生成回复，建议3000-5000 (3-5秒）
                  </p>
                </div>

                {/* 上下文消息数 */}
                <div className="space-y-2">
                  <Label>上下文消息数量</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={agentConfig.maxContextMessages}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, maxContextMessages: parseInt(e.target.value) }))}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    发送给AI模型的最近对话消息数量，建议5-10
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 回复模板 */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">回复模板</h2>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                添加模板
              </Button>
            </div>

            {/* 模板列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {replyTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={template.priority >= 9 ? 'destructive' : template.priority >= 5 ? 'secondary' : 'outline'}>
                        优先级: {template.priority}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-base">{getTemplateName(template.type)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-2">
                      {template.content || '模板内容...'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>意图: {template.intent}</span>
                      <span>类型: {template.type}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 添加模板表单 */}
            <Card>
              <CardHeader>
                <CardTitle>添加新模板</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>模板类型</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greeting">问候语</SelectItem>
                        <SelectItem value="farewell">告别语</SelectItem>
                        <SelectItem value="faq">常见问题</SelectItem>
                        <SelectItem value="escalation">升级到人工</SelectItem>
                        <SelectItem value="out_of_business">下班/不在</SelectItem>
                        <SelectItem value="business_hours">工作时间</SelectItem>
                        <SelectItem value="holiday">节假日</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>意图</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择意图" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greeting">greeting</SelectItem>
                        <SelectItem value="farewell">farewell</SelectItem>
                        <SelectItem value="refund">refund</SelectItem>
                        <SelectItem value="price_inquiry">price_inquiry</SelectItem>
                        <SelectItem value="product_inquiry">product_inquiry</SelectItem>
                        <SelectItem value="order_inquiry">order_inquiry</SelectItem>
                        <SelectItem value="technical_support">technical_support</SelectItem>
                        <SelectItem value="company_info">company_info</SelectItem>
                        <SelectItem value="escalate_to_human">escalate_to_human</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>模板内容</Label>
                  <Textarea
                    placeholder="输入回复模板内容，可以使用变量如 {name}, {time} 等"
                    rows={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">保存模板</Button>
                  <Button variant="outline" className="flex-1">预览效果</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 产品信息 */}
          <TabsContent value="product" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>公司和产品信息</CardTitle>
                <CardDescription>
                  这些信息将用于AI生成回复，确保回复内容准确
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 公司名称 */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">公司名称</Label>
                  <Input
                    id="companyName"
                    placeholder="ZAEP科技有限公司"
                    value={productInfo.name}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* 业务描述 */}
                <div className="space-y-2">
                  <Label htmlFor="business">业务描述</Label>
                  <Textarea
                    id="business"
                    placeholder="公司的主要业务和产品..."
                    value={productInfo.business}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, business: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* 服务客户 */}
                <div className="space-y-2">
                  <Label htmlFor="customers">服务客户类型</Label>
                  <Input
                    id="customers"
                    placeholder="中小企业、大型企业、个人用户等"
                    value={productInfo.customers}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, customers: e.target.value }))}
                  />
                </div>

                {/* 主要产品 */}
                <div className="space-y-2">
                  <Label htmlFor="products">主要产品</Label>
                  <Textarea
                    id="products"
                    placeholder="列出公司的主要产品..."
                    value={productInfo.products}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, products: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* 服务承诺 */}
                <div className="space-y-2">
                  <Label htmlFor="support">服务承诺</Label>
                  <Textarea
                    id="support"
                    placeholder="7x24小时在线服务、30分钟响应等..."
                    value={productInfo.support}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, support: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* 公司政策 */}
                <div className="space-y-2">
                  <Label htmlFor="policy">公司政策</Label>
                  <Textarea
                    id="policy"
                    placeholder="退款政策、隐私政策、服务条款等..."
                    value={productInfo.policy}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, policy: e.target.value }))}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 快速测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              快速测试
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>测试消息</Label>
                <Input
                  placeholder="输入测试消息..."
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">测试微信消息接收</Button>
                <Button variant="outline" className="flex-1">测试AI回复生成</Button>
                <Button variant="outline" className="flex-1">测试完整流程</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function getTemplateName(type: string): string {
  const names: Record<string, string> = {
    greeting: '问候语',
    farewell: '告别语',
    faq: '常见问题',
    escalation: '升级到人工',
    out_of_business: '下班/不在',
    business_hours: '工作时间',
    holiday: '节假日',
  };

  return names[type] || type;
}
