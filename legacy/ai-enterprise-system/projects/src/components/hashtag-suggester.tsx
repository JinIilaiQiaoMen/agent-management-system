'use client';

import { useState, useEffect } from 'react';
import { Hash, X, TrendingUp, Sparkles } from 'lucide-react';

interface HashtagSuggesterProps {
  selectedHashtags: string[];
  onHashtagChange: (hashtags: string[]) => void;
  platform?: string;
  contentType?: string;
}

export function HashtagSuggester({
  selectedHashtags,
  onHashtagChange,
  platform,
  contentType
}: HashtagSuggesterProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 推荐的话题标签（按平台和内容类型）
  const getRecommendedHashtags = (): string[] => {
    const baseHashtags = [
      '热门', '推荐', '新品', '优惠', '限时', '好物', '必买', '精选'
    ];

    const platformHashtags: Record<string, string[]> = {
      taobao: ['淘宝', '购物', '正品', '包邮', '热卖', '店铺', '宝贝'],
      jd: ['京东', '自营', '正品', '秒杀', 'Plus', '家电', '数码'],
      pinduoduo: ['拼多多', '百亿补贴', '团购', '拼团', '砍价', '省钱'],
      douyin: ['抖音', '短视频', '带货', '爆款', '种草', '好物推荐'],
      xiaohongshu: ['小红书', '种草', '测评', '好物', '生活方式', '精致'],
      weibo: ['微博', '热搜', '话题', '热门', '推荐', '精选'],
      bilibili: ['哔哩哔哩', 'B站', 'UP主', '视频', '创作', '分享']
    };

    const contentTypeHashtags: Record<string, string[]> = {
      product: ['商品', '好物', '必买', '省钱', '性价比', '品质'],
      video: ['视频', '短视频', '精彩', '好看', '必看', '分享'],
      article: ['文章', '阅读', '干货', '经验', '分享', '教程'],
      image: ['图片', '摄影', '美图', '分享', '记录', '生活'],
      live: ['直播', '带货', '互动', '福利', '抽奖', '惊喜']
    };

    let hashtags = [...baseHashtags];

    if (platform && platformHashtags[platform]) {
      hashtags = [...hashtags, ...platformHashtags[platform]];
    }

    if (contentType && contentTypeHashtags[contentType]) {
      hashtags = [...hashtags, ...contentTypeHashtags[contentType]];
    }

    // 去重并返回
    return Array.from(new Set(hashtags)).slice(0, 15);
  };

  const recommendedHashtags = getRecommendedHashtags();

  // 实时过滤建议
  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = recommendedHashtags.filter(tag =>
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedHashtags.includes(tag)
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, recommendedHashtags, selectedHashtags]);

  const handleAddHashtag = (tag: string) => {
    const cleanedTag = tag.startsWith('#') ? tag.slice(1) : tag;
    if (!selectedHashtags.includes(cleanedTag)) {
      onHashtagChange([...selectedHashtags, cleanedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleRemoveHashtag = (index: number) => {
    const newHashtags = selectedHashtags.filter((_, i) => i !== index);
    onHashtagChange(newHashtags);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddHashtag(inputValue.trim());
    }
  };

  return (
    <div className="space-y-3">
      {/* 输入框 */}
      <div className="relative">
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="输入或选择话题标签..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* 自动完成建议 */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((tag, index) => (
              <button
                key={index}
                onClick={() => handleAddHashtag(tag)}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 推荐标签 */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="h-4 w-4 text-orange-500" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            推荐标签
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {recommendedHashtags.slice(0, 8).map((tag, index) => (
            <button
              key={index}
              onClick={() => handleAddHashtag(tag)}
              disabled={selectedHashtags.includes(tag)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                selectedHashtags.includes(tag)
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 已选标签 */}
      {selectedHashtags.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              已选标签 ({selectedHashtags.length})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedHashtags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => handleRemoveHashtag(index)}
                  className="hover:text-blue-900 dark:hover:text-blue-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
