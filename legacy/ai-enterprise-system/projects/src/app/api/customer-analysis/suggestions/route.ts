import { NextRequest, NextResponse } from 'next/server';

interface SuggestionQuestion {
  id: string;
  question: string;
  icon: string;
  category: string;
}

// 预设的推荐问题模板
const baseSuggestions: SuggestionQuestion[] = [
  {
    id: '1',
    question: '这家公司的主营业务是什么？',
    icon: '💼',
    category: '基本信息'
  },
  {
    id: '2',
    question: '请分析这家公司的市场地位和竞争优势',
    icon: '📊',
    category: '市场分析'
  },
  {
    id: '3',
    question: '这家公司有什么潜在风险？',
    icon: '⚠️',
    category: '风险评估'
  },
  {
    id: '4',
    question: '与这家公司合作有什么建议？',
    icon: '🤝',
    category: '合作建议'
  },
  {
    id: '5',
    question: '这家公司的财务状况如何？',
    icon: '💰',
    category: '财务分析'
  },
  {
    id: '6',
    question: '这家公司的客户群体和业务规模？',
    icon: '👥',
    category: '业务规模'
  },
  {
    id: '7',
    question: '这家公司的行业发展趋势如何？',
    icon: '📈',
    category: '行业趋势'
  },
  {
    id: '8',
    question: '有什么需要注意的合规问题？',
    icon: '⚖️',
    category: '合规检查'
  }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyName = searchParams.get('companyName');

    // 根据公司名称生成更具体的建议问题
    let suggestions = [...baseSuggestions];

    if (companyName) {
      // 在问题中动态插入公司名称
      suggestions = suggestions.map((s, index) => {
        if (index === 0) {
          return {
            ...s,
            question: `${companyName} 的主营业务是什么？`
          };
        } else if (index === 1) {
          return {
            ...s,
            question: `请分析 ${companyName} 的市场地位和竞争优势`
          };
        } else if (index === 2) {
          return {
            ...s,
            question: `${companyName} 有什么潜在风险？`
          };
        } else if (index === 3) {
          return {
            ...s,
            question: `与 ${companyName} 合作有什么建议？`
          };
        }
        return s;
      });

      // 添加一些额外的公司特定问题
      const specificSuggestions: SuggestionQuestion[] = [
        {
          id: '9',
          question: `${companyName} 在国际市场的表现如何？`,
          icon: '🌍',
          category: '国际业务'
        },
        {
          id: '10',
          question: `${companyName} 的主要竞争对手有哪些？`,
          icon: '🎯',
          category: '竞争分析'
        },
        {
          id: '11',
          question: `${companyName} 的最新发展动态？`,
          icon: '📰',
          category: '最新动态'
        },
        {
          id: '12',
          question: `${companyName} 的供应链情况如何？`,
          icon: '🔗',
          category: '供应链'
        }
      ];

      suggestions = [...suggestions, ...specificSuggestions];
    }

    // 随机打乱顺序并返回前 8 个问题
    const shuffled = suggestions.sort(() => Math.random() - 0.5);
    const result = shuffled.slice(0, 8);

    return NextResponse.json({
      suggestions: result
    });

  } catch (error: any) {
    console.error('获取推荐问题失败:', error);
    return NextResponse.json(
      { error: error.message || '获取推荐问题失败' },
      { status: 500 }
    );
  }
}
