/**
 * OpenClaw 工作流模板定义
 * 提供常用的工作流模板，供用户参考和手动创建
 */

// 预设工作流模板（仅用于参考，不涉及数据库操作）
export const OPENCLAW_WORKFLOW_TEMPLATES = [
  {
    name: '新客户自动分析',
    description: '当有新客户注册时，自动分析客户信息、评分并生成跟进邮件',
    enabled: true,
    triggers: [
      {
        type: 'webhook' as const,
        config: {
          webhookUrl: '/api/openclaw/webhooks/customer-created',
          method: 'POST',
          headers: {}
        }
      }
    ],
    actions: [
      {
        type: 'api' as const,
        order: 1,
        config: {
          url: '/api/openclaw/scenarios',
          method: 'POST',
          headers: {},
          bodyTemplate: {
            scenario: 'customer_analyze',
            companyName: '{{companyName}}',
            website: '{{website}}',
            industry: '{{industry}}',
            country: '{{country}}'
          }
        }
      },
      {
        type: 'api' as const,
        order: 2,
        config: {
          url: '/api/openclaw/scenarios',
          method: 'POST',
          headers: {},
          bodyTemplate: {
            scenario: 'score_lead',
            leadData: {
              companyName: '{{companyName}}',
              website: '{{website}}',
              industry: '{{industry}}',
              contactName: '{{contactName}}'
            }
          }
        }
      },
      {
        type: 'api' as const,
        order: 3,
        config: {
          url: '/api/openclaw/scenarios',
          method: 'POST',
          headers: {},
          bodyTemplate: {
            scenario: 'generate_followup_email',
            customerName: '{{contactName}}',
            companyName: '{{companyName}}',
            stage: 'initial',
            lastContact: new Date().toISOString()
          }
        }
      }
    ]
  },
  {
    name: '社媒评论自动回复',
    description: '当收到社媒评论时，自动分析并生成回复',
    enabled: true,
    triggers: [
      {
        type: 'webhook' as const,
        config: {
          webhookUrl: '/api/openclaw/webhooks/comment-received',
          method: 'POST',
          headers: {}
        }
      }
    ],
    actions: [
      {
        type: 'api' as const,
        order: 1,
        config: {
          url: '/api/openclaw/scenarios',
          method: 'POST',
          headers: {},
          bodyTemplate: {
            scenario: 'check_compliance',
            content: '{{commentText}}',
            platform: '{{platform}}'
          }
        }
      },
      {
        type: 'condition' as const,
        order: 2,
        config: {
          condition: '{{previous.complianceCheck.isCompliant}} == true',
          trueActions: [
            {
              type: 'api' as const,
              order: 1,
              config: {
                url: '/api/openclaw/scenarios',
                method: 'POST',
                headers: {},
                bodyTemplate: {
                  scenario: 'chat_assistant',
                  messages: [
                    {
                      role: 'system',
                      content: '你是一个专业的社媒运营专员，负责回复用户评论。回复要友好、专业、有吸引力。'
                    },
                    {
                      role: 'user',
                      content: '{{commentText}}'
                    }
                  ],
                  useKnowledgeBase: true
                }
              }
            }
          ],
          falseActions: [
            {
              type: 'notification' as const,
              order: 1,
              config: {
                type: 'email',
                recipients: ['admin@example.com'],
                subject: '评论合规检查失败',
                body: '评论内容: {{commentText}}\n违规项: {{previous.complianceCheck.violations}}'
              }
            }
          ]
        }
      }
    ]
  },
  {
    name: '库存预警通知',
    description: '当库存低于阈值时，自动发送预警通知',
    enabled: true,
    triggers: [
      {
        type: 'schedule' as const,
        config: {
          cron: '0 */6 * * *', // 每 6 小时执行一次
          timezone: 'Asia/Shanghai'
        }
      }
    ],
    actions: [
      {
        type: 'api' as const,
        order: 1,
        config: {
          url: '/api/supply-chain/inventory',
          method: 'POST',
          headers: {},
          bodyTemplate: {
            action: 'check-all',
            alertThreshold: 10
          }
        }
      },
      {
        type: 'condition' as const,
        order: 2,
        config: {
          condition: '{{previous.inventoryCheck.alerts.length}} > 0',
          trueActions: [
            {
              type: 'notification' as const,
              order: 1,
              config: {
                type: 'email',
                recipients: ['inventory@example.com'],
                subject: '库存预警 - {{date}}',
                bodyTemplate: '以下商品库存不足：\n{{previous.inventoryCheck.alerts.map(item => item.productName + ": " + item.currentStock + " / " + item.minStock).join("\\n")}}'
              }
            },
            {
              type: 'notification' as const,
              order: 2,
              config: {
                type: 'webhook',
                url: 'https://api.openclaw.example.com/notifications',
                bodyTemplate: {
                  type: 'inventory_alert',
                  timestamp: '{{date}}',
                  alerts: '{{previous.inventoryCheck.alerts}}'
                }
              }
            }
          ]
        }
      }
    ]
  },
  {
    name: '客户跟进提醒',
    description: '定期检查未跟进的客户，发送提醒',
    enabled: true,
    triggers: [
      {
        type: 'schedule' as const,
        config: {
          cron: '0 9 * * 1', // 每周一早上 9 点执行
          timezone: 'Asia/Shanghai'
        }
      }
    ],
    actions: [
      {
        type: 'api' as const,
        order: 1,
        config: {
          url: '/api/customers',
          method: 'GET',
          headers: {},
          queryParams: {
            filter: 'not_followed_up',
            days: 7
          }
        }
      },
      {
        type: 'condition' as const,
        order: 2,
        config: {
          condition: '{{previous.customers.data.length}} > 0',
          trueActions: [
            {
              type: 'api' as const,
              order: 1,
              config: {
                url: '/api/openclaw/scenarios',
                method: 'POST',
                headers: {},
                bodyTemplate: {
                  scenario: 'generate_followup_email',
                  customerName: '{{customer.name}}',
                  companyName: '{{customer.company}}',
                  stage: 'reminder',
                  lastContact: '{{customer.lastContactDate}}'
                }
              },
              iteration: {
                array: '{{previous.customers.data}}',
                itemName: 'customer'
              }
            }
          ],
          falseActions: []
        }
      }
    ]
  },
  {
    name: '社媒内容自动发布',
    description: '定时生成并发布社媒内容',
    enabled: true,
    triggers: [
      {
        type: 'schedule' as const,
        config: {
          cron: '0 10 * * *', // 每天早上 10 点执行
          timezone: 'Asia/Shanghai'
        }
      }
    ],
    actions: [
      {
        type: 'api' as const,
        order: 1,
        config: {
          url: '/api/pet-content/generate',
          method: 'POST',
          headers: {},
          bodyTemplate: {
            sku: 'featured-product-{{date}}',
            platform: 'instagram',
            language: 'zh-CN',
            contentType: 'marketing'
          }
        }
      },
      {
        type: 'api' as const,
        order: 2,
        config: {
          url: '/api/openclaw/scenarios',
          method: 'POST',
          headers: {},
          bodyTemplate: {
            scenario: 'check_compliance',
            content: '{{previous.contentGeneration.content.text}}',
            platform: 'instagram'
          }
        }
      },
      {
        type: 'condition' as const,
        order: 3,
        config: {
          condition: '{{previous.complianceCheck.isCompliant}} == true',
          trueActions: [
            {
              type: 'api' as const,
              order: 1,
              config: {
                url: '/api/openclaw/scenarios',
                method: 'POST',
                headers: {},
                bodyTemplate: {
                  scenario: 'publish_social_content',
                  platform: 'instagram',
                  content: '{{previous.contentGeneration.content.text}}',
                  mediaUrls: '{{previous.contentGeneration.content.images}}',
                  hashtags: '{{previous.contentGeneration.content.hashtags}}'
                }
              }
            }
          ],
          falseActions: []
        }
      }
    ]
  },
  {
    name: '销售趋势预测',
    description: '定期分析销售数据，预测未来趋势',
    enabled: true,
    triggers: [
      {
        type: 'schedule' as const,
        config: {
          cron: '0 0 1 * *', // 每月 1 号执行
          timezone: 'Asia/Shanghai'
        }
      }
    ],
    actions: [
      {
        type: 'api' as const,
        order: 1,
        config: {
          url: '/api/supply-chain/forecast',
          method: 'POST',
          headers: {},
          bodyTemplate: {
            type: 'sales',
            period: 30,
            historicalData: '{{monthlySalesData}}'
          }
        }
      },
      {
        type: 'notification' as const,
        order: 2,
        config: {
          type: 'email',
          recipients: ['sales@example.com', 'management@example.com'],
          subject: '销售趋势预测 - {{month}}',
          bodyTemplate: '未来 30 天销售预测：\n\n{{previous.forecast.summary}}\n\n详细数据见附件。'
        }
      }
    ]
  },
  {
    name: '质量检查自动报告',
    description: '定期执行质量检查并生成报告',
    enabled: true,
    triggers: [
      {
        type: 'schedule' as const,
        config: {
          cron: '0 9 * * 5', // 每周五早上 9 点执行
          timezone: 'Asia/Shanghai'
        }
      }
    ],
    actions: [
      {
        type: 'api' as const,
        order: 1,
        config: {
          url: '/api/supply-chain/quality',
          method: 'POST',
          headers: {},
          bodyTemplate: {
            productId: 'all',
            batchNumber: '{{week}}',
            inspectionType: 'routine'
          }
        }
      },
      {
        type: 'notification' as const,
        order: 2,
        config: {
          type: 'email',
          recipients: ['quality@example.com'],
          subject: '质量检查报告 - 第 {{week}} 周',
          bodyTemplate: '本周质量检查结果：\n\n{{previous.qualityCheck.summary}}'
        }
      }
    ]
  },
  {
    name: '成本分析报告',
    description: '定期分析供应链成本并生成报告',
    enabled: true,
    triggers: [
      {
        type: 'schedule' as const,
        config: {
          cron: '0 8 * * *', // 每天早上 8 点执行
          timezone: 'Asia/Shanghai'
        }
      }
    ],
    actions: [
      {
        type: 'api' as const,
        order: 1,
        config: {
          url: '/api/supply-chain/cost',
          method: 'POST',
          headers: {},
          bodyTemplate: {
            period: 'daily',
            includeTransport: true,
            includeStorage: true,
            includeLabor: true
          }
        }
      },
      {
        type: 'condition' as const,
        order: 2,
        config: {
          condition: '{{previous.costAnalysis.totalCost}} > {{budget.daily}}',
          trueActions: [
            {
              type: 'notification' as const,
              order: 1,
              config: {
                type: 'email',
                recipients: ['finance@example.com'],
                subject: '成本超支预警 - {{date}}',
                bodyTemplate: '今日成本: {{previous.costAnalysis.totalCost}}\n预算: {{budget.daily}}\n超支: {{previous.costAnalysis.totalCost - budget.daily}}'
              }
            }
          ],
          falseActions: []
        }
      }
    ]
  }
];

/**
 * 获取所有工作流模板
 */
export function getWorkflowTemplates() {
  return OPENCLAW_WORKFLOW_TEMPLATES;
}

/**
 * 根据名称获取工作流模板
 */
export function getWorkflowTemplateByName(name: string) {
  return OPENCLAW_WORKFLOW_TEMPLATES.find(t => t.name === name);
}

/**
 * 获取工作流模板名称列表
 */
export function getWorkflowTemplateNames() {
  return OPENCLAW_WORKFLOW_TEMPLATES.map(t => t.name);
}
