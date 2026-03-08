import { NextRequest, NextResponse } from 'next/server';

// 文件上传 API
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '请选择文件' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 根据文件类型处理
    let content = '';
    const fileName = file.name;

    // 如果是文本文件，直接读取内容
    if (
      file.type === 'text/plain' ||
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.json') ||
      fileName.endsWith('.csv') ||
      fileName.endsWith('.xml') ||
      fileName.endsWith('.yml') ||
      fileName.endsWith('.yaml')
    ) {
      content = buffer.toString('utf-8');
    } else {
      // 对于其他文件类型（如 PDF、Word），需要使用专门的库
      // 这里简单返回文件信息，实际使用时可以集成 pdf-parse 等库
      content = `[文件类型: ${file.type}]\n[文件大小: ${file.size} bytes]\n\n⚠️ 注意：此文件类型需要专门的解析库才能读取完整内容。\n\n当前支持的纯文本格式：\n- .txt (文本文件)\n- .md (Markdown)\n- .json (JSON数据)\n- .csv (CSV数据)\n- .xml (XML)\n- .yml / .yaml (配置文件)\n\n如需支持 PDF、Word 等格式，请联系管理员集成相应的解析库。`;
    }

    // 提取标题（使用文件名）
    const title = fileName.replace(/\.[^/.]+$/, '');

    return NextResponse.json({
      success: true,
      title,
      content,
      fileName,
      fileSize: file.size,
      fileType: file.type
    });

  } catch (error: any) {
    console.error('文件上传失败:', error);
    return NextResponse.json(
      { error: error.message || '上传失败' },
      { status: 500 }
    );
  }
}
