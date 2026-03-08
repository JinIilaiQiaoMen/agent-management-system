"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('邮箱或密码错误');
      } else {
        setSuccess('登录成功，正在跳转...');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      setError('登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await signIn(provider, { callbackUrl: `${window.location.origin}/auth/callback` });
    } catch (error) {
      setError('登录失败，请重试');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
            <span className="text-3xl">🏛️</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            ZAEP 智元企业AI中台
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            登录以继续使用三省六部系统
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* 成功提示 */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* 登录卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>欢迎回来</CardTitle>
            <CardDescription>
              选择登录方式访问系统
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  邮箱
                </TabsTrigger>
                <TabsTrigger value="wechat" className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded text-white text-xs flex items-center justify-center">
                    微
                  </div>
                  微信
                </TabsTrigger>
                <TabsTrigger value="dingtalk" className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded text-white text-xs flex items-center justify-center">
                    钉
                  </div>
                  钉钉
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="mt-6">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={loginData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="•••••••••"
                        className="pl-10 pr-10"
                        value={loginData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => router.push('/auth/forgot-password')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      忘记密码？
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? '登录中...' : '登录'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="wechat" className="mt-6">
                <div className="space-y-4">
                  <Button
                    onClick={() => handleOAuthSignIn('wechat')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                        <span className="text-green-500 text-xs font-bold">微</span>
                      </div>
                      {isLoading ? '跳转中...' : '微信登录'}
                    </div>
                  </Button>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                    将使用您的微信账号进行登录
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="dingtalk" className="mt-6">
                <div className="space-y-4">
                  <Button
                    onClick={() => handleOAuthSignIn('dingtalk')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                        <span className="text-blue-500 text-xs font-bold">钉</span>
                      </div>
                      {isLoading ? '跳转中...' : '钉钉登录'}
                    </div>
                  </Button>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                    将使用您的钉钉账号进行登录
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 注册链接 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            还没有账号？{' '}
            <button
              onClick={() => router.push('/auth/register')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              立即注册
            </button>
          </p>
        </div>

        {/* 底部链接 */}
        <div className="mt-8 text-center text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <p>
            © 2026 ZAEP 智元企业AI中台. 保留所有权利.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100">
              隐私政策
            </a>
            <span>·</span>
            <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100">
              服务条款
            </a>
            <span>·</span>
            <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100">
              联系我们
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
