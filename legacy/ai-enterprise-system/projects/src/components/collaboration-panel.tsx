'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, MessageSquare, MoreVertical, CheckCircle, XCircle, Clock, Shield, Edit2, Eye } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
  joinedAt: string;
}

interface PublishTask {
  id: string;
  title: string;
  platform: string;
  contentType: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published';
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export function CollaborationPanel() {
  const [activeTab, setActiveTab] = useState<'members' | 'tasks'>('members');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<PublishTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PublishTask | null>(null);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'viewer' as 'admin' | 'editor' | 'viewer'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/domestic-platforms/collaboration');
      const data = await response.json();
      setMembers(data.members || []);
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'editor':
        return <Edit2 className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleName = (role: string) => {
    const names: Record<string, string> = {
      admin: '管理员',
      editor: '编辑',
      viewer: '查看者'
    };
    return names[role] || role;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending_review':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-slate-300" />;
    }
  };

  const getStatusName = (status: string) => {
    const names: Record<string, string> = {
      draft: '草稿',
      pending_review: '待审核',
      approved: '已通过',
      rejected: '已拒绝',
      published: '已发布'
    };
    return names[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* 标签页 */}
      <div className="flex items-center space-x-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'members'
              ? 'text-orange-600 border-b-2 border-orange-600 dark:text-orange-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>团队成员 ({members.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'text-orange-600 border-b-2 border-orange-600 dark:text-orange-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>发布任务 ({tasks.length})</span>
        </button>
      </div>

      {/* 成员列表 */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              成员管理
            </h3>
            <button
              onClick={() => setShowInviteDialog(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
            >
              <UserPlus className="h-4 w-4" />
              <span>邀请成员</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent mx-auto mb-4" />
              <p className="text-sm text-slate-500 dark:text-slate-400">加载中...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                暂无团队成员
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {member.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-xs">
                      {getRoleIcon(member.role)}
                      <span className="text-slate-600 dark:text-slate-400">
                        {getRoleName(member.role)}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      member.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {member.status === 'active' ? '活跃' : member.status === 'pending' ? '待确认' : '未激活'}
                    </div>
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                      <MoreVertical className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 任务列表 */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              发布任务
            </h3>
            <button
              onClick={() => setShowTaskDialog(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span>创建任务</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent mx-auto mb-4" />
              <p className="text-sm text-slate-500 dark:text-slate-400">加载中...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                暂无发布任务
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="cursor-pointer p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                          {task.title}
                        </h4>
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {task.platform} · {task.contentType} · {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                      <MoreVertical className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </button>
                  </div>
                  {task.comments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {task.comments.length} 条评论
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 任务详情对话框 */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                {getStatusIcon(selectedTask.status)}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedTask.title}
                  </h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {getStatusName(selectedTask.status)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <XCircle className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 任务信息 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">平台</div>
                    <div className="text-slate-900 dark:text-white capitalize">{selectedTask.platform}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">内容类型</div>
                    <div className="text-slate-900 dark:text-white">{selectedTask.contentType}</div>
                  </div>
                </div>
              </div>

              {/* 评论区 */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  评论 ({selectedTask.comments.length})
                </h4>
                <div className="space-y-3">
                  {selectedTask.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-xs">
                            {comment.userName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {comment.userName}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 邀请成员对话框 */}
      {showInviteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    邀请成员
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    添加新成员到团队
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowInviteDialog(false);
                  setInviteForm({ name: '', email: '', role: 'viewer' });
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <XCircle className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  姓名
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="输入成员姓名"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="输入邮箱地址"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  角色
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="viewer">查看者 - 只能查看内容</option>
                  <option value="editor">编辑者 - 可以创建和编辑</option>
                  <option value="admin">管理员 - 拥有全部权限</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setShowInviteDialog(false);
                  setInviteForm({ name: '', email: '', role: 'viewer' });
                }}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
                    alert('请填写完整信息');
                    return;
                  }

                  try {
                    const response = await fetch('/api/domestic-platforms/collaboration', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'member',
                        ...inviteForm
                      })
                    });

                    const data = await response.json();

                    if (data.success) {
                      alert('邀请已发送！');
                      setShowInviteDialog(false);
                      setInviteForm({ name: '', email: '', role: 'viewer' });
                      fetchData();
                    } else {
                      alert(`邀请失败: ${data.error}`);
                    }
                  } catch (error) {
                    alert('邀请失败，请重试');
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg"
              >
                发送邀请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
