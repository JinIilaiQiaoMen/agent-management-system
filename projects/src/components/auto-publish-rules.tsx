'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, Repeat, Zap, Plus, Trash2, ToggleLeft, ToggleRight, Settings } from 'lucide-react';

interface AutoPublishRule {
  id: string;
  name: string;
  platforms: string[];
  contentType: string;
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    time?: string;
    interval?: number;
    timezone?: string;
  };
  templateId?: string;
  conditions?: {
    minLikes?: number;
    minViews?: number;
  };
  isActive: boolean;
  createdAt: string;
}

export function AutoPublishRules() {
  const [rules, setRules] = useState<AutoPublishRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AutoPublishRule>>({
    name: '',
    platforms: [],
    contentType: 'product',
    schedule: {
      type: 'scheduled',
      time: '10:00',
      timezone: 'Asia/Shanghai',
      interval: 1
    },
    isActive: true
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/domestic-platforms/optimization?type=rules');
      const data = await response.json();
      setRules(data.rules || []);
    } catch (error) {
      console.error('获取规则失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      const response = await fetch('/api/domestic-platforms/optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rule',
          ...newRule
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateDialog(false);
        setNewRule({
          name: '',
          platforms: [],
          contentType: 'product',
          schedule: {
            type: 'scheduled',
            time: '10:00',
            timezone: 'Asia/Shanghai',
            interval: 1
          },
          isActive: true
        });
        fetchRules();
      }
    } catch (error) {
      console.error('创建规则失败:', error);
      alert('创建失败，请重试');
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    try {
      await fetch(`/api/domestic-platforms/optimization?type=rule&id=${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !rule.isActive
        })
      });

      setRules(rules.map(r =>
        r.id === ruleId ? { ...r, isActive: !r.isActive } : r
      ));
    } catch (error) {
      console.error('更新规则失败:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('确定要删除这条规则吗？')) return;

    try {
      await fetch(`/api/domestic-platforms/optimization?type=rule&id=${ruleId}`, {
        method: 'DELETE'
      });

      setRules(rules.filter(r => r.id !== ruleId));
    } catch (error) {
      console.error('删除规则失败:', error);
      alert('删除失败，请重试');
    }
  };

  const getScheduleIcon = (type: string) => {
    switch (type) {
      case 'immediate':
        return <Zap className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'recurring':
        return <Repeat className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getScheduleDescription = (schedule: any) => {
    switch (schedule.type) {
      case 'immediate':
        return '立即发布';
      case 'scheduled':
        return `定时发布: ${schedule.time}`;
      case 'recurring':
        return `每 ${schedule.interval} 天 ${schedule.time}`;
      default:
        return '未知';
    }
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            自动发布规则
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            设置自动发布计划，解放双手
          </p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Plus className="h-4 w-4" />
          <span>创建规则</span>
        </button>
      </div>

      {/* 规则列表 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">加载中...</p>
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            暂无自动发布规则
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            点击"创建规则"开始设置
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-5 bg-white dark:bg-slate-800 rounded-xl border ${
                rule.isActive
                  ? 'border-slate-200 dark:border-slate-700'
                  : 'border-slate-300 dark:border-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                      {rule.name}
                    </h4>
                    <div className={`px-2 py-0.5 rounded-full text-xs ${
                      rule.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {rule.isActive ? '启用中' : '已停用'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      {getScheduleIcon(rule.schedule.type)}
                      <span>{getScheduleDescription(rule.schedule)}</span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-slate-600 dark:text-slate-400">
                        平台: <span className="text-slate-900 dark:text-white">{rule.platforms.join(', ')}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        类型: <span className="text-slate-900 dark:text-white">{rule.contentType}</span>
                      </div>
                    </div>

                    {rule.conditions && (rule.conditions.minLikes || rule.conditions.minViews) && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        条件: {rule.conditions.minLikes && `最少 ${rule.conditions.minLikes} 点赞`}
                        {rule.conditions.minLikes && rule.conditions.minViews && ', '}
                        {rule.conditions.minViews && `最少 ${rule.conditions.minViews} 浏览`}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                    {rule.isActive ? (
                      <ToggleRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 创建规则对话框 */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                创建自动发布规则
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  规则名称
                </label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="例如：每日商品发布"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  发布类型
                </label>
                <select
                  value={newRule.schedule?.type}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    schedule: { ...newRule.schedule!, type: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="immediate">立即发布</option>
                  <option value="scheduled">定时发布</option>
                  <option value="recurring">周期性发布</option>
                </select>
              </div>

              {(newRule.schedule?.type === 'scheduled' || newRule.schedule?.type === 'recurring') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    发布时间
                  </label>
                  <input
                    type="time"
                    value={newRule.schedule?.time || '10:00'}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      schedule: { ...newRule.schedule!, time: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              )}

              {newRule.schedule?.type === 'recurring' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    发布间隔（天）
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newRule.schedule?.interval || 1}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      schedule: { ...newRule.schedule!, interval: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleCreateRule}
                disabled={!newRule.name}
                className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 rounded-lg"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
