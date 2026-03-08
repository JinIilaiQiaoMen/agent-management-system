import { NextRequest, NextResponse } from "next/server";
import { documentManager } from "@/storage/database";
import { parseFile, getFileType, isFileTypeSupported } from "@/utils/fileParser";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// 上传目录
const UPLOAD_DIR = path.join(process.cwd(), "tmp", "uploads");

// 确保上传目录存在
async function ensureUploadDir() {
  try {
    await writeFile(path.join(UPLOAD_DIR, ".gitkeep"), "");
  } catch {
    // 目录已存在
  }
}

// POST: 上传并解析文档
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const knowledgeBaseId = formData.get("knowledgeBaseId") as string | null;
    const uploadedBy = formData.get("uploadedBy") as string || "CEO";

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "没有上传文件" },
        { status: 400 }
      );
    }

    // 确保上传目录存在
    await ensureUploadDir();

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const fileName = file.name;
        
        // 检查文件类型是否支持
        if (!isFileTypeSupported(fileName)) {
          errors.push({
            fileName,
            error: `不支持的文件类型。支持的类型: ${["pdf", "docx", "xlsx", "txt", "md", "csv", "json", "pptx"].join(", ")}`,
          });
          continue;
        }

        const fileType = getFileType(fileName)!;
        const fileId = uuidv4();
        const filePath = path.join(UPLOAD_DIR, `${fileId}-${fileName}`);

        // 保存文件
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // 解析文件内容
        let content = "";
        let status = "parsing";
        
        try {
          content = await parseFile(filePath, fileType);
          status = "analyzed";
        } catch (parseError) {
          console.error(`解析文件 ${fileName} 失败:`, parseError);
          status = "failed";
          content = `解析失败: ${parseError instanceof Error ? parseError.message : String(parseError)}`;
        }

        // 保存文档记录
        const document = await documentManager.createDocument({
          fileName,
          filePath,
          fileType,
          fileSize: file.size,
          content,
          status,
          knowledgeBaseId,
          uploadedBy,
          metadata: {
            originalName: fileName,
            parseTime: new Date().toISOString(),
          },
        });

        results.push({
          success: true,
          document,
        });

      } catch (error) {
        console.error(`处理文件 ${file.name} 失败:`, error);
        errors.push({
          fileName: file.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        uploaded: results.length,
        failed: errors.length,
        results,
        errors,
      },
    });
  } catch (error) {
    console.error("上传文档失败:", error);
    return NextResponse.json(
      { error: "上传文档失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET: 获取文档列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const knowledgeBaseId = searchParams.get("knowledgeBaseId");
    const status = searchParams.get("status");

    let documents;
    if (knowledgeBaseId) {
      documents = await documentManager.getDocumentsByKnowledgeBaseId(knowledgeBaseId);
    } else if (status) {
      documents = await documentManager.getDocumentsByStatus(status);
    } else {
      documents = await documentManager.getAllDocuments();
    }

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("获取文档列表失败:", error);
    return NextResponse.json(
      { error: "获取文档列表失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
