'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Loader2,
  Calendar,
  Clock,
  FileText,
  Target,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  platform: string;
  platformIcon: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  selectedAgent?: Agent | null;
  onCreated: () => void;
}

const TASK_TYPES = [
  { id: 'content_gen', name: '内容生成', icon: '✨', description: 'AI生成并发布内容' },
  { id: 'schedule', name: '定时发布', icon: '📅', description: '在指定时间发布内容' },
  { id: 'auto_reply', name: '自动回复', icon: '💬', description: '自动回复评论和私信' },
  { id: 'analytics', name: '数据报告', icon: '📊', description: '生成数据分析报告' },
  { id: 'engage', name: '互动增强', icon: '🎯', description: '自动互动提升曝光' },
];

const PRIORITIES = [
  { id: 'high', name: '高优先级', color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
  { id: 'medium', name: '中优先级', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
  { id: 'low', name: '低优先级', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
];

const REPEAT_OPTIONS = [
  { id: 'none', name: '不重复' },
  { id: 'daily', name: '每天' },
  { id: 'weekly', name: '每周' },
  { id: 'monthly', name: '每月' },
];

export default function CreateTaskModal({
  isOpen,
  onClose,
  agents,
  selectedAgent,
  onCreated,
}: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    agentId: selectedAgent?.id || '',
    taskType: 'schedule',
    title: '',
    content: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'medium',
    repeat: 'none',
    mediaUrls: [] as string[],
  });

  // 当选中的Agent变化时更新表单
  useEffect(() => {
    if (selectedAgent) {
      setFormData((prev) => ({
        ...prev,
        agentId: selectedAgent.id,
      }));
    }
  }, [selectedAgent]);

  // 初始化和重置表单
  useEffect(() => {
    if (isOpen) {
      // 打开时初始化表单
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      setFormData({
        agentId: selectedAgent?.id || '',
        taskType: 'schedule',
        title: '',
        content: '',
        scheduledDate: today,
        scheduledTime: currentTime,
        priority: 'medium',
        repeat: 'none',
        mediaUrls: [],
      });
    } else {
      // 关闭时清空表单
      setFormData({
        agentId: selectedAgent?.id || '',
        taskType: 'schedule',
        title: '',
        content: '',
        scheduledDate: '',
        scheduledTime: '',
        priority: 'medium',
        repeat: 'none',
        mediaUrls: [],
      });
    }
  }, [isOpen, selectedAgent]);

  // 提交表单
  const handleSubmit = async () => {
    console.log('开始提交任务，表单数据:', formData);

    if (!formData.agentId || !formData.content || !formData.scheduledDate || !formData.scheduledTime) {
      console.log('表单验证失败', {
        hasAgentId: !!formData.agentId,
        hasContent: !!formData.content,
        hasScheduledDate: !!formData.scheduledDate,
        hasScheduledTime: !!formData.scheduledTime,
      });
      alert('请填写所有必填项');
      return;
    }

    setLoading(true);
    try {
      const agent = agents.find((a) => a.id === formData.agentId);
      const scheduledTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();

      console.log('准备发送API请求:', {
        agentId: formData.agentId,
        agentName: agent?.name,
        platform: agent?.platform,
        platformIcon: agent?.platformIcon,
        taskType: formData.taskType,
        title: formData.title || `定时${TASK_TYPES.find((t) => t.id === formData.taskType)?.name || '任务'}`,
        content: formData.content,
        scheduledTime,
        priority: formData.priority,
        repeat: formData.repeat,
        mediaUrls: formData.mediaUrls,
      });

      const response = await fetch('/api/social-media-agents/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: formData.agentId,
          agentName: agent?.name,
          platform: agent?.platform,
          platformIcon: agent?.platformIcon,
          taskType: formData.taskType,
          title: formData.title || `定时${TASK_TYPES.find((t) => t.id === formData.taskType)?.name || '任务'}`,
          content: formData.content,
          scheduledTime,
          priority: formData.priority,
          repeat: formData.repeat,
          mediaUrls: formData.mediaUrls,
        }),
      });

      const result = await response.json();

      console.log('API响应:', result);

      if (result.success) {
        onCreated();
        onClose();
      } else {
        alert(`创建失败: ${result.error}`);
      }
    } catch (error: any) {
      console.error('创建任务失败:', error);
      alert(`创建失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 获取最小日期（今天）
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // 获取最小时间
  const getMinTime = () => {
    if (formData.scheduledDate === getMinDate()) {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    return '00:00';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>创建定时任务</span>
          </DialogTitle>
          <DialogDescription>
            设置定时发布任务，Agent将在指定时间自动执行
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 选择Agent */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              选择Agent <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.agentId}
              onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">请选择Agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.platformIcon} {agent.name}
                </option>
              ))}
            </select>
          </div>

          {/* 任务类型 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              任务类型
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TASK_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData({ ...formData, taskType: type.id })}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    formData.taskType === type.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {type.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 任务标题 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              任务标题
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例如：发布新品宣传内容"
            />
          </div>

          {/* 发布内容 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              发布内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="输入要发布的文案内容..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 resize-none"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formData.content.length} 字
            </p>
          </div>

          {/* 执行时间 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              执行时间 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={getMinDate()}
                />
              </div>
              <div>
                <Input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  min={getMinTime()}
                />
              </div>
            </div>
          </div>

          {/* 优先级 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              优先级
            </label>
            <div className="flex space-x-2">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority.id}
                  onClick={() => setFormData({ ...formData, priority: priority.id })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.priority === priority.id
                      ? priority.color
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  {priority.name}
                </button>
              ))}
            </div>
          </div>

          {/* 重复设置 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              重复设置
            </label>
            <select
              value={formData.repeat}
              onChange={(e) => setFormData({ ...formData, repeat: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {REPEAT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          {/* 提示信息 */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">注意事项</p>
                <ul className="space-y-1 text-xs">
                  <li>• 任务将在指定时间自动执行</li>
                  <li>• 请确保Agent处于运行状态</li>
                  <li>• 重复任务将在每个周期自动创建新任务</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.agentId || !formData.content || !formData.scheduledDate || !formData.scheduledTime}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                创建中...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                创建任务
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
