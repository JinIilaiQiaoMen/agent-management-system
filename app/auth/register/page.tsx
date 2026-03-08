"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Mail, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { z } from 'zod';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 验证密码
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      setIsLoading(false);
      return;
    }

    // 验证密码强度
    if (formData.password.length < 6) {
      setError('密码长度至少为6位');
      setIsLoading(false);
      return;
    }

    try {
      // 模拟注册API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess('注册成功，正在跳转到登录页...');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 1000);

    } catch (error) {
      setError('注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return formData.email && formData.name;
      case 2:
        return formData.phone;
      case 3:
        return formData.password && formData.confirmPassword &&
               formData.password === formData.confirmPassword &&
               formData.password.length >= 6;
      default:
        return false;
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
            创建账户
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            开始使用ZAEP智能企业AI中台
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

        {/* 步骤进度 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              步骤 {step} / 3
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {step === 1 && '账户信息'}
              {step === 2 && '联系方式'}
              {step === 3 && '设置密码'}
            </div>
          </div>
          <div className="flex gap-2">
            <div className={`flex-1 h-2 rounded-full transition-all ${
              step >= 1 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
            <div className={`flex-1 h-2 rounded-full transition-all ${
              step >= 2 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
            <div className={`flex-1 h-2 rounded-full transition-all ${
              step >= 3 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
          </div>
        </div>

        {/* 注册卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>创建新账户</CardTitle>
            <CardDescription>
              步骤 {step} / 3: {step === 1 && '账户信息'}
              {step === 2 && '联系方式'}
              {step === 3 && '设置密码'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 步骤1：账户信息 */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="您的姓名"
                        className="pl-10"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 步骤2：联系方式 */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">手机号（选填）</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder="+86 138 0000 0000"
                        className="pl-10"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    手机号用于接收重要通知和验证码（选填）
                  </p>
                </div>
              )}

              {/* 步骤3：设置密码 */}
              {step === 3 && (
                <div className="space-y-4">
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
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">确认密码</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      placeholder="•••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    密码长度至少为6位，建议使用字母、数字和符号的组合
                  </p>
                </div>
              )}

              {/* 按钮 */}
              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    上一步
                  </Button>
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={!isStepValid(step) || isLoading}
                    className="flex-1"
                  >
                    下一步
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? '注册中...' : '注册'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 登录链接 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            已有账号？{' '}
            <button
              onClick={() => router.push('/auth/signin')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              登录
            </button>
          </p>
        </div>

        {/* 服务条款 */}
        <div className="mt-8 text-center text-xs text-slate-600 dark:text-slate-400">
          <p>
            注册即表示您同意我们的{' '}
            <a href="#" className="hover:underline text-slate-900 dark:text-slate-100">
              服务条款
            </a>{' '}
            和{' '}
            <a href="#" className="hover:underline text-slate-900 dark:text-slate-100">
              隐私政策
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
