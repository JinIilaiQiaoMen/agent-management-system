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
  Settings,
  Clock,
  Target,
  Users,
  Sparkles,
  Plus,
  X,
} from 'lucide-react';

interface AgentCapability {
  id: string;
  name: string;
  enabled: boolean;
  icon: string;
  description: string;
}

interface AgentConfig {
  autoReply: boolean;
  autoSchedule: boolean;
  contentStyle: string;
  targetAudience: string;
  postingSchedule: string[];
  replyRules: string[];
}

interface Agent {
  id: string;
  name: string;
  platform: string;
  platformIcon: string;
  capabilities: AgentCapability[];
  config: AgentConfig;
}

interface AgentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
  onSave: (agentId: string, config: AgentConfig, capabilities: AgentCapability[]) => void;
}

const CONTENT_STYLES = [
  '幽默风趣',
  '时尚简约',
  '专业教育',
  '亲切友好',
  '种草风格',
  '热点跟进',
  '情感共鸣',
  '知识科普',
];

const TARGET_AUDIENCES = [
  '18-25岁年轻人',
  '25-35岁职场人群',
  '18-35岁年轻人',
  '25-40岁都市人群',
  '25-50岁',
  '全年龄段',
  '18-35岁女性',
  '35-55岁中年人群',
];

export default function AgentConfigModal({
  isOpen,
  onClose,
  agent,
  onSave,
}: AgentConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AgentConfig>({
    autoReply: false,
    autoSchedule: false,
    contentStyle: '',
    targetAudience: '',
    postingSchedule: [],
    replyRules: [],
  });
  const [capabilities, setCapabilities] = useState<AgentCapability[]>([]);
  const [newScheduleTime, setNewScheduleTime] = useState('');
  const [newReplyRule, setNewReplyRule] = useState('');

  // 初始化表单
  useEffect(() => {
    if (agent) {
      setConfig({ ...agent.config });
      setCapabilities([...agent.capabilities]);
    }
  }, [agent]);

  // 切换能力
  const toggleCapability = (capId: string) => {
    setCapabilities((prev) =>
      prev.map((cap) =>
        cap.id === capId ? { ...cap, enabled: !cap.enabled } : cap
      )
    );
  };

  // 添加发布时间
  const addScheduleTime = () => {
    if (newScheduleTime && !config.postingSchedule.includes(newScheduleTime)) {
      setConfig((prev) => ({
        ...prev,
        postingSchedule: [...prev.postingSchedule, newScheduleTime].sort(),
      }));
      setNewScheduleTime('');
    }
  };

  // 删除发布时间
  const removeScheduleTime = (time: string) => {
    setConfig((prev) => ({
      ...prev,
      postingSchedule: prev.postingSchedule.filter((t) => t !== time),
    }));
  };

  // 添加回复规则
  const addReplyRule = () => {
    if (newReplyRule && !config.replyRules.includes(newReplyRule)) {
      setConfig((prev) => ({
        ...prev,
        replyRules: [...prev.replyRules, newReplyRule],
      }));
      setNewReplyRule('');
    }
  };

  // 删除回复规则
  const removeReplyRule = (rule: string) => {
    setConfig((prev) => ({
      ...prev,
      replyRules: prev.replyRules.filter((r) => r !== rule),
    }));
  };

  // 保存配置
  const handleSave = async () => {
    if (!agent) return;

    setLoading(true);
    try {
      await onSave(agent.id, config, capabilities);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>配置 {agent.name}</span>
          </DialogTitle>
          <DialogDescription>
            配置Agent的能力和运营参数
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 能力配置 */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>能力配置</span>
            </h3>
            <div className="space-y-2">
              {capabilities.map((cap) => (
                <label
                  key={cap.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{cap.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {cap.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {cap.description}
                      </p>
                    </div>
                  </div>
                  <Checkbox
                    checked={cap.enabled}
                    onCheckedChange={() => toggleCapability(cap.id)}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* 自动化设置 */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
              <Target className="h-4 w-4 text-emerald-600" />
              <span>自动化设置</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    自动回复
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    自动回复评论和私信
                  </p>
                </div>
                <Checkbox
                  checked={config.autoReply}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({ ...prev, autoReply: checked as boolean }))
                  }
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    定时发布
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    按时间表自动发布
                  </p>
                </div>
                <Checkbox
                  checked={config.autoSchedule}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({ ...prev, autoSchedule: checked as boolean }))
                  }
                />
              </label>
            </div>
          </div>

          {/* 内容风格 */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              内容风格
            </h3>
            <div className="flex flex-wrap gap-2">
              {CONTENT_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setConfig((prev) => ({ ...prev, contentStyle: style }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    config.contentStyle === style
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* 目标受众 */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
              <Users className="h-4 w-4 text-orange-600" />
              <span>目标受众</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {TARGET_AUDIENCES.map((audience) => (
                <button
                  key={audience}
                  onClick={() => setConfig((prev) => ({ ...prev, targetAudience: audience }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    config.targetAudience === audience
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  {audience}
                </button>
              ))}
            </div>
          </div>

          {/* 发布时间表 */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>发布时间表</span>
            </h3>
            <div className="flex items-center space-x-2 mb-3">
              <Input
                type="time"
                value={newScheduleTime}
                onChange={(e) => setNewScheduleTime(e.target.value)}
                className="w-32"
              />
              <Button
                onClick={addScheduleTime}
                variant="outline"
                size="sm"
                disabled={!newScheduleTime}
              >
                <Plus className="h-4 w-4 mr-1" />
                添加
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.postingSchedule.map((time) => (
                <span
                  key={time}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  <span>{time}</span>
                  <button
                    onClick={() => removeScheduleTime(time)}
                    className="hover:text-blue-900 dark:hover:text-blue-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 回复规则 */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              回复规则
            </h3>
            <div className="flex items-center space-x-2 mb-3">
              <Input
                type="text"
                value={newReplyRule}
                onChange={(e) => setNewReplyRule(e.target.value)}
                placeholder="输入回复规则..."
                className="flex-1"
              />
              <Button
                onClick={addReplyRule}
                variant="outline"
                size="sm"
                disabled={!newReplyRule}
              >
                <Plus className="h-4 w-4 mr-1" />
                添加
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.replyRules.map((rule) => (
                <span
                  key={rule}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                >
                  <span>{rule}</span>
                  <button
                    onClick={() => removeReplyRule(rule)}
                    className="hover:text-emerald-900 dark:hover:text-emerald-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              '保存配置'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
