"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 模拟发送验证码API
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStep(2);
      setSuccess('验证码已发送到您的邮箱');
    } catch (error) {
      setError('发送验证码失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('密码长度至少为6位');
      setIsLoading(false);
      return;
    }

    try {
      // 模拟重置密码API
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStep(3);
      setSuccess('密码重置成功，正在跳转到登录页...');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (error) {
      setError('重置密码失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </button>
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
            <span className="text-3xl">🏛️</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {step === 1 && '重置密码'}
            {step === 2 && '验证身份'}
            {step === 3 && '完成'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {step === 1 && '输入邮箱以接收验证码'}
            {step === 2 && '输入验证码和新密码'}
            {step === 3 && '密码重置成功'}
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

        {/* 步骤1：发送验证码 */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>忘记密码</CardTitle>
              <CardDescription>
                输入您的邮箱地址，我们将发送验证码到您的邮箱
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? '发送中...' : '发送验证码'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 步骤2：重置密码 */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>验证并重置</CardTitle>
              <CardDescription>
                输入验证码和您的新密码
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">验证码</Label>
                  <Input
                    id="code"
                    type="text"
                    name="code"
                    placeholder="6位验证码"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">新密码</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    placeholder="至少6位"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认新密码</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="再次输入新密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    返回
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || !code || !newPassword || !confirmPassword}
                  >
                    {isLoading ? '重置中...' : '重置密码'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 步骤3：完成 */}
        {step === 3 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    密码重置成功
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    您的密码已成功重置，现在可以使用新密码登录
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full"
                >
                  去登录
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 登录链接 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            记起密码了？{' '}
            <button
              onClick={() => router.push('/auth/signin')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              立即登录
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
