import fs from "fs/promises";
import path from "path";

// 支持的文件类型
export const SUPPORTED_FILE_TYPES = [
  "txt",
  "md",
  "pdf",
  "docx",
  "doc",
  "xlsx",
  "xls",
  "csv",
  "json",
  "pptx",
  "ppt",
] as const;

export type FileType = (typeof SUPPORTED_FILE_TYPES)[number];

/**
 * 解析文件内容
 */
export async function parseFile(filePath: string, fileType: FileType): Promise<string> {
  try {
    switch (fileType) {
      case "txt":
      case "md":
        return await parseTextFile(filePath);
      case "pdf":
        return await parsePDF(filePath);
      case "docx":
      case "doc":
        return await parseWord(filePath);
      case "xlsx":
      case "xls":
      case "csv":
        return await parseExcel(filePath, fileType);
      case "json":
        return await parseJson(filePath);
      case "pptx":
      case "ppt":
        return await parsePowerPoint(filePath);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error);
    throw error;
  }
}

/**
 * 解析文本文件
 */
async function parseTextFile(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath, "utf-8");
  return content;
}

/**
 * 解析PDF文件
 */
async function parsePDF(filePath: string): Promise<string> {
  const pdfParse = await import("pdf-parse");
  const dataBuffer = await fs.readFile(filePath);
  const data = await (pdfParse as any).default(dataBuffer);
  return data.text;
}

/**
 * 解析Word文档
 */
async function parseWord(filePath: string): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

/**
 * 解析Excel文件
 */
async function parseExcel(filePath: string, fileType: FileType): Promise<string> {
  const xlsx = await import("xlsx");
  const workbook = xlsx.readFile(filePath);
  let content = "";

  // 遍历所有工作表
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    content += `\n=== Sheet: ${sheetName} ===\n`;
    jsonData.forEach((row: any) => {
      if (Array.isArray(row)) {
        content += row.join("\t") + "\n";
      }
    });
  });

  return content;
}

/**
 * 解析JSON文件
 */
async function parseJson(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath, "utf-8");
  try {
    const jsonData = JSON.parse(content);
    return JSON.stringify(jsonData, null, 2);
  } catch {
    return content;
  }
}

/**
 * 解析PowerPoint文件
 */
async function parsePowerPoint(filePath: string): Promise<string> {
  // PowerPoint解析比较复杂，这里提供一个基本的实现
  // 实际项目中可能需要使用更专业的库如 pptx-parser
  try {
    const xlsx = await import("xlsx");
    // 尝试作为zip文件读取（pptx本质是zip）
    const workbook = xlsx.readFile(filePath);
    let content = "";

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      
      jsonData.forEach((row: any) => {
        if (Array.isArray(row)) {
          const rowContent = row.filter((cell: any) => cell !== undefined && cell !== null).join(" ");
          if (rowContent.trim()) {
            content += rowContent + "\n";
          }
        }
      });
    });

    return content || "PowerPoint文件解析暂不支持完整内容提取";
  } catch (error) {
    console.error("PowerPoint parsing error:", error);
    return "PowerPoint文件解析暂不支持完整内容提取";
  }
}

/**
 * 根据文件名获取文件类型
 */
export function getFileType(fileName: string): FileType | null {
  const ext = path.extname(fileName).toLowerCase().slice(1);
  if (SUPPORTED_FILE_TYPES.includes(ext as FileType)) {
    return ext as FileType;
  }
  return null;
}

/**
 * 验证文件类型是否支持
 */
export function isFileTypeSupported(fileName: string): boolean {
  return getFileType(fileName) !== null;
}

/**
 * 获取文件的MIME类型
 */
export function getFileMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".csv": "text/csv",
    ".json": "application/json",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };

  return mimeTypes[ext] || "application/octet-stream";
}
