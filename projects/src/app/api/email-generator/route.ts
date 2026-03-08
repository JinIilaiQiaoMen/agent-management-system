import { NextRequest, NextResponse } from 'next/server';

/**
 * 邮件生成API
 */

interface EmailRequest {
  template: string;
  to: string;
  subject?: string;
  params?: Record<string, any>;
}

const emailTemplates = {
  'welcome': {
    subject: '欢迎加入智元AI中台',
    content: '尊敬的{{name}}，欢迎加入智元AI中台！'
  },
  'product-intro': {
    subject: '产品介绍 - {{product}}',
    content: '您好{{name}}，为您介绍我们的产品{{product}}...'
  },
  'follow-up': {
    subject: '跟进提醒 - {{topic}}',
    content: '您好{{name}}，关于{{topic}}的跟进事项...'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { template, to, subject, params = {} } = body;

    if (!template || !to) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const templateData = emailTemplates[template as keyof typeof emailTemplates];
    if (!templateData) {
      return NextResponse.json(
        { success: false, error: '模板不存在' },
        { status: 404 }
      );
    }

    // 模拟邮件发送
    const emailId = `email-${Date.now()}`;
    const emailData = {
      id: emailId,
      to,
      subject: subject || templateData.subject,
      content: templateData.content.replace(
        /{{(\w+)}}/g, 
        (_, key) => params[key] || ''
      ),
      template,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: emailData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '生成失败' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: Object.keys(emailTemplates).map(key => ({
      id: key,
      name: key,
      subject: emailTemplates[key as keyof typeof emailTemplates].subject,
    })),
  });
}
