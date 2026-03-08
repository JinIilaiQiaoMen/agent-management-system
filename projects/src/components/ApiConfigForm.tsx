"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from '@/components/Toast';

interface ApiConfigFormProps {
  agentId?: string;
  onSuccess?: () => void;
}

interface AuthConfig {
  apiKey?: string;
  apiKeyHeader?: string;
  token?: string;
  username?: string;
  password?: string;
}

export function ApiConfigForm({ agentId, onSuccess }: ApiConfigFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState<{
    agentId: string;
    name: string;
    type: string;
    url: string;
    method: string;
    headers: Array<{ key: string; value: string }>;
    queryParams: Array<{ key: string; value: string }>;
    bodyTemplate: string;
    authType: string;
    authConfig: AuthConfig;
    description: string;
    isActive: boolean;
    timeout: number;
    retryCount: number;
    rateLimit: number;
  }>({
    agentId: agentId || '',
    name: '',
    type: 'REST',
    url: '',
    method: 'GET',
    headers: [{ key: '', value: '' }],
    queryParams: [{ key: '', value: '' }],
    bodyTemplate: '',
    authType: 'none',
    authConfig: {},
    description: '',
    isActive: true,
    timeout: 30000,
    retryCount: 0,
    rateLimit: 60,
  });

  // 更新表单
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 更新请求头
  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...formData.headers];
    newHeaders[index][field] = value;
    setFormData((prev) => ({ ...prev, headers: newHeaders }));
  };

  // 添加请求头
  const addHeader = () => {
    setFormData((prev) => ({ ...prev, headers: [...prev.headers, { key: '', value: '' }] }));
  };

  // 删除请求头
  const removeHeader = (index: number) => {
    const newHeaders = formData.headers.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, headers: newHeaders }));
  };

  // 更新查询参数
  const updateQueryParam = (index: number, field: 'key' | 'value', value: string) => {
    const newParams = [...formData.queryParams];
    newParams[index][field] = value;
    setFormData((prev) => ({ ...prev, queryParams: newParams }));
  };

  // 添加查询参数
  const addQueryParam = () => {
    setFormData((prev) => ({ ...prev, queryParams: [...prev.queryParams, { key: '', value: '' }] }));
  };

  // 删除查询参数
  const removeQueryParam = (index: number) => {
    const newParams = formData.queryParams.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, queryParams: newParams }));
  };

  // 构建请求头对象
  const buildHeaders = () => {
    const headers: Record<string, string> = {};
    formData.headers.forEach(({ key, value }) => {
      if (key && value) {
        headers[key] = value;
      }
    });
    return headers;
  };

  // 构建查询参数对象
  const buildQueryParams = () => {
    const params: Record<string, string> = {};
    formData.queryParams.forEach(({ key, value }) => {
      if (key && value) {
        params[key] = value;
      }
    });
    return params;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agentId) {
      toast.error('请选择智能体');
      return;
    }
    if (!formData.name) {
      toast.error('请输入API名称');
      return;
    }
    if (!formData.url) {
      toast.error('请输入API地址');
      return;
    }

    try {
      setLoading(true);

      await apiPost('/api/agent-api-configs', {
        ...formData,
        headers: buildHeaders(),
        queryParams: buildQueryParams(),
      });

      toast.success('API配置创建成功');
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error('API配置创建失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          添加API配置
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>添加API配置</DialogTitle>
          <DialogDescription>
            为智能体配置外部API接口，支持REST、GraphQL等协议
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="request">请求配置</TabsTrigger>
              <TabsTrigger value="auth">认证配置</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">API名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="例如：用户信息API"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">API类型</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REST">REST API</SelectItem>
                      <SelectItem value="GraphQL">GraphQL</SelectItem>
                      <SelectItem value="WebSocket">WebSocket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">API地址 *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://api.example.com/users"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="method">HTTP方法</Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value) => handleChange('method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">超时时间（毫秒）</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={formData.timeout}
                    onChange={(e) => handleChange('timeout', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="API功能描述"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="request" className="space-y-4 mt-4">
              {/* 请求头 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>请求头</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addHeader}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.headers.map((header, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Header名称"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                      />
                      <Input
                        placeholder="Header值"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeHeader(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 查询参数 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>查询参数</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQueryParam}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.queryParams.map((param, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="参数名"
                        value={param.key}
                        onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                      />
                      <Input
                        placeholder="参数值"
                        value={param.value}
                        onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeQueryParam(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 请求体模板 */}
              {['POST', 'PUT', 'PATCH'].includes(formData.method) && (
                <div className="space-y-2">
                  <Label htmlFor="bodyTemplate">请求体模板（支持变量替换）</Label>
                  <Textarea
                    id="bodyTemplate"
                    value={formData.bodyTemplate}
                    onChange={(e) => handleChange('bodyTemplate', e.target.value)}
                    placeholder='{ "name": "{{userName}}", "email": "{{userEmail}}" }'
                    rows={5}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    使用 {'{{variableName}}'} 格式引用变量，系统会在调用时自动替换
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="auth" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="authType">认证类型</Label>
                <Select
                  value={formData.authType}
                  onValueChange={(value) => handleChange('authType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无需认证</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.authType === 'api_key' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.authConfig.apiKey || ''}
                      onChange={(e) =>
                        handleChange('authConfig', { ...formData.authConfig, apiKey: e.target.value })
                      }
                      placeholder="your-api-key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKeyHeader">Header名称</Label>
                    <Input
                      id="apiKeyHeader"
                      value={formData.authConfig.apiKeyHeader || ''}
                      onChange={(e) =>
                        handleChange('authConfig', { ...formData.authConfig, apiKeyHeader: e.target.value })
                      }
                      placeholder="X-API-Key"
                    />
                  </div>
                </div>
              )}

              {formData.authType === 'bearer' && (
                <div className="space-y-2">
                  <Label htmlFor="token">Token</Label>
                  <Input
                    id="token"
                    type="password"
                    value={formData.authConfig.token || ''}
                    onChange={(e) =>
                      handleChange('authConfig', { ...formData.authConfig, token: e.target.value })
                    }
                    placeholder="your-bearer-token"
                  />
                </div>
              )}

              {formData.authType === 'basic' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <Input
                      id="username"
                      value={formData.authConfig.username || ''}
                      onChange={(e) =>
                        handleChange('authConfig', { ...formData.authConfig, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">密码</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.authConfig.password || ''}
                      onChange={(e) =>
                        handleChange('authConfig', { ...formData.authConfig, password: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* 其他选项 */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
            />
            <Label htmlFor="isActive">启用此API配置</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
