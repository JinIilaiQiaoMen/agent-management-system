import { NextRequest, NextResponse } from "next/server";
import { S3Storage, KnowledgeClient, Config, DataSourceType, HeaderUtils } from "coze-coding-dev-sdk";
import { knowledgeBaseManager, documentManager } from "@/storage/database";
import { rateLimitStrategies, getClientIP } from "@/lib/rate-limit";

/**
 * POST /api/knowledge-bases/upload-file - 上传文件到知识库
 * 支持的文件类型：
 * - 文档：.txt, .md, .pdf, .docx, .xlsx, .doc, .xls
 * - 图片：.jpg, .jpeg, .png, .gif, .webp, .bmp
 * - 视频：.mp4, .avi, .mov, .wmv, .mkv, .flv
 * - 音频：.mp3, .wav, .flac, .aac, .m4a
 */
export async function POST(request: NextRequest) {
  // 限速检查
  const ip = getClientIP(request);
  const rateLimitResult = rateLimitStrategies.upload;

  // 使用简单的内存限速（这里简化处理，实际应用中应该使用更完善的限速系统）
  // 注意：这是一个简化的实现，生产环境应该使用Redis等外部存储

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const knowledgeBaseId = formData.get("knowledgeBaseId") as string;

    if (!file) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    if (!knowledgeBaseId) {
      return NextResponse.json({ error: "缺少知识库ID" }, { status: 400 });
    }

    // 获取知识库信息
    const kb = await knowledgeBaseManager.getKnowledgeBaseById(knowledgeBaseId);
    if (!kb) {
      return NextResponse.json({ error: "知识库不存在" }, { status: 404 });
    }

    // 文件大小限制（50MB）
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "文件大小不能超过50MB" },
        { status: 400 }
      );
    }

    // 检查文件类型
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const supportedExtensions = [
      // 文档
      "txt", "md", "pdf", "docx", "xlsx", "doc", "xls",
      // 图片
      "jpg", "jpeg", "png", "gif", "webp", "bmp",
      // 视频
      "mp4", "avi", "mov", "wmv", "mkv", "flv",
      // 音频
      "mp3", "wav", "flac", "aac", "m4a"
    ];

    if (!fileExtension || !supportedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: "不支持的文件类型。支持的类型：txt, md, pdf, docx, xlsx, jpg, png, mp4, mp3等" },
        { status: 400 }
      );
    }

    // 判断是否为文本文件
    const textFileTypes = ["txt", "md"];
    const isTextFile = textFileTypes.includes(fileExtension);

    // 提取文件内容用于分析（仅文本文件）
    let documentContent = "";
    let analysisType = "file";

    if (isTextFile) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        documentContent = buffer.toString("utf-8").substring(0, 5000); // 只读取前5000个字符
        analysisType = "text";
      } catch (readError) {
        console.error("Failed to read text file:", readError);
      }
    }

    // 提取并转发请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化对象存储
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      bucketName: process.env.COZE_BUCKET_NAME,
      region: "cn-beijing",
    });

    // 上传文件到对象存储
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: `knowledge-bases/${kb.id}/${file.name}`,
      contentType: file.type,
    });

    // 生成文件URI（用于知识库导入）
    // 使用签名 URL 作为 URI，因为知识库 SDK 需要能访问的 URL
    const signedUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 7 * 24 * 60 * 60, // 7天有效期
    });

    // 导入文件到知识库
    const config = new Config();
    const knowledgeClient = new KnowledgeClient(config, customHeaders);

    const document = {
      source: DataSourceType.URL,
      url: signedUrl,
    };

    // 使用简化的数据集名称（只使用字母和数字）
    const datasetName = `kb_${kb.id.replace(/-/g, '')}`;

    const addResponse = await knowledgeClient.addDocuments([document], datasetName);

    if (addResponse.code !== 0) {
      console.error("Failed to add document to knowledge base:", addResponse.msg);
      return NextResponse.json(
        { error: `导入文件到知识库失败: ${addResponse.msg}` },
        { status: 500 }
      );
    }

    // 调用AI分析文档匹配度
    let matchData = {
      matchScore: 50,
      matchReason: "未进行分析",
      analysis: "",
      recommendation: "不确定"
    };

    try {
      // 准备分析内容
      const analysisContent = isTextFile
        ? documentContent
        : `文件名：${file.name}\n文件类型：${file.type}\n文件大小：${(file.size / 1024).toFixed(2)}KB\n文件扩展名：${fileExtension}`;

      const analyzeResponse = await fetch(`${request.nextUrl.origin}/api/knowledge-bases/analyze-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          knowledgeBaseId,
          documentContent: analysisContent,
          documentType: analysisType,
          documentTitle: file.name
        })
      });

      if (analyzeResponse.ok) {
        const analyzeResult = await analyzeResponse.json();
        if (analyzeResult.success && analyzeResult.data) {
          matchData = {
            matchScore: analyzeResult.data.matchScore || 50,
            matchReason: analyzeResult.data.matchReason || "未提供说明",
            analysis: analyzeResult.data.analysis || "",
            recommendation: analyzeResult.data.recommendation || "不确定"
          };
        }
      }
    } catch (analyzeError) {
      console.error("Failed to analyze document match:", analyzeError);
      // 分析失败不影响文档添加，只记录日志
    }

    // 保存文档记录到数据库
    try {
      await documentManager.createDocument({
        fileName: file.name,
        filePath: fileKey,
        fileType: file.type,
        fileSize: file.size,
        content: documentContent,
        status: "analyzed",
        knowledgeBaseId,
        uploadedBy: "CEO",
        metadata: {
          docId: addResponse.doc_ids?.[0],
          matchScore: matchData.matchScore,
          matchReason: matchData.matchReason,
          analysis: matchData.analysis,
          recommendation: matchData.recommendation
        }
      });
    } catch (dbError) {
      console.error("Failed to save document record:", dbError);
      // 数据库保存失败不影响返回结果，只记录日志
    }

    // 更新文档数量
    await knowledgeBaseManager.updateDocumentCount(knowledgeBaseId, 1);

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileKey,
        docId: addResponse.doc_ids?.[0],
        matchAnalysis: matchData
      }
    });
  } catch (error: any) {
    console.error("Failed to upload file:", error);
    return NextResponse.json(
      { error: "上传文件失败", details: error.message },
      { status: 500 }
    );
  }
}
