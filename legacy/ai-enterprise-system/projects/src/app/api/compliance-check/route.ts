import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

interface ComplianceCheckRequest {
  content: string;
  platform: string;
  generateSuggestion?: boolean; // 是否生成修改建议
}

interface ComplianceIssue {
  type: 'error' | 'warning' | 'info';
  level: 'high' | 'medium' | 'low';
  category: string;
  message: string;
  suggestion: string;
  position?: number;
}

interface CheckResult {
  overall: 'pass' | 'warning' | 'fail';
  score: number;
  issues: ComplianceIssue[];
  checkedItems: {
    item: string;
    status: 'pass' | 'warning' | 'fail';
    details?: string;
  }[];
  suggestedContent?: string; // 修改建议内容
  suggestedChanges?: { // 修改说明
    original: string;
    modified: string;
    reason: string;
  }[];
}

/**
 * 真实的合规审核 API
 * 使用 AI 根据平台规则和广告法进行内容检查
 */
export async function POST(request: NextRequest) {
  try {
    const body: ComplianceCheckRequest = await request.json();
    const { content, platform, generateSuggestion } = body;

    if (!content) {
      return NextResponse.json(
        { error: '缺少必要参数: content' },
        { status: 400 }
      );
    }

    // 平台规则定义
    const platformRules = {
      tiktok: {
        forbiddenWords: ['test product', 'sample', '免费送', 'free gift', 'get it free', 'click below for free', '100% free'],
        requiredElements: ['标题', '话题标签'],
        maxHashtags: 5,
        minHashtags: 3,
        maxLength: 2200,
        adDisclosure: ['广告', 'sponsored', 'paid partnership']
      },
      instagram: {
        forbiddenWords: ['test product', 'sample', '免费送', 'free gift'],
        requiredElements: ['标题', '话题标签'],
        maxHashtags: 30,
        minHashtags: 5,
        maxLength: 2200,
        adDisclosure: ['广告', 'ad', 'sponsored']
      },
      youtube: {
        forbiddenWords: ['test product', 'sample', '免费送', 'free gift'],
        requiredElements: ['标题', '描述'],
        maxHashtags: 15,
        minHashtags: 3,
        maxLength: 5000,
        adDisclosure: ['广告', 'sponsored', 'paid promotion']
      },
      amazon: {
        forbiddenWords: ['best in the world', 'number one', 'perfect', 'guaranteed', '无条件退货', 'free for life'],
        requiredElements: ['产品标题', '产品描述', '五点描述'],
        maxHashtags: 0,
        minHashtags: 0,
        maxLength: 2000,
        adDisclosure: []
      }
    };

    const rules = platformRules[platform as keyof typeof platformRules] || platformRules.tiktok;

    // 初始化检查结果
    const issues: ComplianceIssue[] = [];
    const checkedItems: Array<{ item: string; status: 'pass' | 'warning' | 'fail'; details?: string }> = [
      { item: '平台规则', status: 'pass', details: '' },
      { item: '广告法合规', status: 'pass', details: '' },
      { item: '敏感词检测', status: 'pass', details: '' },
      { item: '知识产权', status: 'pass', details: '' },
      { item: '误导性信息', status: 'pass', details: '' }
    ];

    // 1. 敏感词检测
    const foundForbiddenWords: string[] = [];
    rules.forbiddenWords.forEach(word => {
      if (content.toLowerCase().includes(word.toLowerCase())) {
        foundForbiddenWords.push(word);
      }
    });

    if (foundForbiddenWords.length > 0) {
      issues.push({
        type: 'error',
        level: 'high',
        category: '敏感词违规',
        message: `发现禁用词：${foundForbiddenWords.join(', ')}`,
        suggestion: '请删除或替换这些违禁词汇',
        position: content.toLowerCase().indexOf(foundForbiddenWords[0].toLowerCase())
      });
      checkedItems[2].status = 'fail';
      checkedItems[2].details = `发现 ${foundForbiddenWords.length} 个违禁词`;
    }

    // 2. 话题标签检查
    const hashtags = content.match(/#[\w\u4e00-\u9fa5]+/g) || [];
    if (platform !== 'amazon') {
      if (hashtags.length < rules.minHashtags) {
        issues.push({
          type: 'warning',
          level: 'medium',
          category: '话题标签',
          message: `话题标签数量不足（当前${hashtags.length}个，最少需要${rules.minHashtags}个）`,
          suggestion: `请添加至少 ${rules.minHashtags} 个相关的话题标签`
        });
        checkedItems[0].status = 'warning';
        checkedItems[0].details = '话题标签数量不足';
      }
      if (hashtags.length > rules.maxHashtags) {
        issues.push({
          type: 'warning',
          level: 'low',
          category: '话题标签',
          message: `话题标签数量过多（当前${hashtags.length}个，最多${rules.maxHashtags}个）`,
          suggestion: `请减少话题标签数量，保持在 ${rules.maxHashtags} 个以内`
        });
      }
    }

    // 3. 长度检查
    if (content.length > rules.maxLength) {
      issues.push({
        type: 'warning',
        level: 'medium',
        category: '内容长度',
        message: `内容超出长度限制（当前${content.length}字，最多${rules.maxLength}字）`,
        suggestion: '请精简内容，确保在平台限制范围内'
      });
      checkedItems[0].status = 'warning';
    }

    // 4. 广告披露检查
    const hasAdDisclosure = rules.adDisclosure.some(word =>
      content.toLowerCase().includes(word.toLowerCase())
    );
    if (rules.adDisclosure.length > 0 && !hasAdDisclosure) {
      issues.push({
        type: 'warning',
        level: 'medium',
        category: '广告披露',
        message: '缺少广告披露标识',
        suggestion: '请添加广告、赞助等披露标识，如"广告"或"sponsored"'
      });
    }

    // 5. 使用 AI 进行深度合规检查
    try {
      const aiCheckPrompt = `你是一位专业的内容合规审核专家，请对以下内容进行合规检查。

平台：${platform}
内容：
${content}

请检查以下方面：
1. 广告法合规（是否包含绝对化用语、虚假宣传、误导性信息）
2. 平台规则（是否符合平台的内容政策）
3. 知识产权风险（是否有侵权嫌疑）
4. 敏感信息（是否包含不当内容）

请以 JSON 格式返回检查结果，格式如下：
{
  "adLawIssues": [{"type": "error/warning", "message": "问题描述", "suggestion": "建议"}],
  "platformIssues": [{"type": "error/warning", "message": "问题描述", "suggestion": "建议"}],
  "ipIssues": [{"type": "error/warning", "message": "问题描述", "suggestion": "建议"}],
  "misleadingInfo": [{"type": "error/warning", "message": "问题描述", "suggestion": "建议"}]
}`;

      const config = new Config();
      const llmClient = new LLMClient(config);

      const aiResult = await llmClient.invoke([
        { role: 'user', content: aiCheckPrompt }
      ], {
        model: 'doubao-seed-2-0-pro-260215',
        temperature: 0.3
      });

      if (aiResult && typeof aiResult === 'object' && 'content' in aiResult) {
        const aiContent = String(aiResult.content);

        // 尝试解析 AI 返回的 JSON
        try {
          // 提取 JSON 部分
          const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const aiCheckData = JSON.parse(jsonMatch[0]);

            // 广告法问题
            if (aiCheckData.adLawIssues && aiCheckData.adLawIssues.length > 0) {
              aiCheckData.adLawIssues.forEach((issue: any) => {
                issues.push({
                  type: issue.type || 'warning',
                  level: issue.type === 'error' ? 'high' : 'medium',
                  category: '广告法合规',
                  message: issue.message,
                  suggestion: issue.suggestion
                });
                checkedItems[1].status = issue.type === 'error' ? 'fail' : 'warning';
              });
            }

            // 平台规则问题
            if (aiCheckData.platformIssues && aiCheckData.platformIssues.length > 0) {
              aiCheckData.platformIssues.forEach((issue: any) => {
                issues.push({
                  type: issue.type || 'warning',
                  level: issue.type === 'error' ? 'high' : 'medium',
                  category: '平台规则',
                  message: issue.message,
                  suggestion: issue.suggestion
                });
                if (checkedItems[0].status === 'pass') {
                  checkedItems[0].status = issue.type === 'error' ? 'fail' : 'warning';
                }
              });
            }

            // 知识产权问题
            if (aiCheckData.ipIssues && aiCheckData.ipIssues.length > 0) {
              aiCheckData.ipIssues.forEach((issue: any) => {
                issues.push({
                  type: issue.type || 'warning',
                  level: 'high',
                  category: '知识产权',
                  message: issue.message,
                  suggestion: issue.suggestion
                });
              });
            }

            // 误导性信息
            if (aiCheckData.misleadingInfo && aiCheckData.misleadingInfo.length > 0) {
              aiCheckData.misleadingInfo.forEach((issue: any) => {
                issues.push({
                  type: issue.type || 'warning',
                  level: issue.type === 'error' ? 'high' : 'medium',
                  category: '误导性信息',
                  message: issue.message,
                  suggestion: issue.suggestion
                });
                if (checkedItems[3].status === 'pass') {
                  checkedItems[3].status = issue.type === 'error' ? 'fail' : 'warning';
                }
              });
            }
          }
        } catch (parseError) {
          console.error('解析 AI 检查结果失败:', parseError);
        }
      }
    } catch (aiError) {
      console.error('AI 检查失败:', aiError);
      // AI 检查失败不影响基础检查的结果
    }

    // 计算总体评分
    let score = 100;
    issues.forEach(issue => {
      if (issue.type === 'error') {
        score -= 20;
      } else if (issue.type === 'warning') {
        if (issue.level === 'high') score -= 10;
        else if (issue.level === 'medium') score -= 5;
        else score -= 2;
      }
    });

    score = Math.max(0, Math.min(100, score));

    // 确定整体状态
    let overall: 'pass' | 'warning' | 'fail' = 'pass';
    const hasErrors = issues.some(i => i.type === 'error');
    const hasWarnings = issues.some(i => i.type === 'warning');

    if (hasErrors) {
      overall = 'fail';
    } else if (hasWarnings) {
      overall = 'warning';
    }

    // 生成修改建议
    let suggestedContent: string | undefined;
    let suggestedChanges: Array<{ original: string; modified: string; reason: string }> | undefined;

    if (generateSuggestion && issues.length > 0) {
      try {
        const issuesSummary = issues.map(issue =>
          `${issue.type === 'error' ? '❌' : '⚠️'} ${issue.category}: ${issue.message}\n建议: ${issue.suggestion}`
        ).join('\n\n');

        // 计算需要的标签数量
        const currentHashtags = content.match(/#[\w\u4e00-\u9fa5]+/g) || [];
        const minHashtags = platform === 'amazon' ? 0 : (platform === 'instagram' ? 5 : 3);
        const maxHashtags = platform === 'amazon' ? 0 : (platform === 'instagram' ? 30 : 5);

        const suggestionPrompt = `你是一位专业的内容优化专家，请根据以下合规检查结果，优化修改原始内容，使其符合平台规则和法律法规。

平台：${platform}
平台话题标签限制：最少${minHashtags}个，最多${maxHashtags}个

原始内容：
${content}

发现的问题：
${issuesSummary}

请提供修改后的内容，要求：
1. 保留原文的核心意思和风格
2. 修复所有检测到的问题
3. 优化表达，使其更符合平台要求
4. 如果需要添加广告披露，请自然地融入内容
5. 话题标签数量严格控制在${minHashtags}-${maxHashtags}个之间
6. 避免"免费"、"送"等可能引起误解的词汇，改用"体验"、"试用"等
7. 避免使用"2024年X月X日"等模板占位符，使用更通用的表述
8. 如果涉及活动，明确说明所有条件和限制
9. 不要添加日期、数量等具体数字，用"活动期间"、"限量"等表述代替

请只输出修改后的内容，不要其他说明：`;

        const config = new Config();
        const llmClient = new LLMClient(config);

        const suggestionResult = await llmClient.invoke([
          { role: 'user', content: suggestionPrompt }
        ], {
          model: 'doubao-seed-2-0-pro-260215',
          temperature: 0.7
        });

        if (suggestionResult && typeof suggestionResult === 'object' && 'content' in suggestionResult) {
          suggestedContent = String(suggestionResult.content).trim();

          // 生成修改说明
          suggestedChanges = issues.map(issue => ({
            original: `原文包含${issue.category}问题`,
            modified: issue.suggestion,
            reason: `解决：${issue.message}`
          }));

          // 如果添加了广告披露，添加到修改说明中
          if (issues.some(i => i.category === '广告披露') && suggestedContent.includes('广告')) {
            suggestedChanges.push({
              original: '原文缺少广告披露',
              modified: '添加了广告披露标识',
              reason: '符合平台广告披露要求'
            });
          }
        }
      } catch (suggestionError) {
        console.error('生成修改建议失败:', suggestionError);
        // 生成建议失败不影响检查结果
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        overall,
        score,
        issues,
        checkedItems,
        suggestedContent,
        suggestedChanges
      }
    });

  } catch (error: any) {
    console.error('合规检查失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '合规检查失败',
        details: error.message
      },
      { status: 500 }
    );
  }
}
