/**
 * ComfyUI 客户端
 * 封装 ComfyUI API，实现工作流自动化
 */

import { COMFYUI_CONFIG } from '../ai-platform/config';

interface WorkflowInput {
  workflow: string;
  images?: { [key: string]: string };
  params?: { [key: string]: any };
}

interface WorkflowOutput {
  images: string[];
  videos?: string[];
  metadata?: any;
}

/**
 * ComfyUI 客户端类
 */
class ComfyUI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = COMFYUI_CONFIG.endpoint;
  }

  /**
   * 加载工作流
   */
  async loadWorkflow(workflowName: string): Promise<any> {
    const workflowFilename = COMFYUI_CONFIG.workflows[workflowName as keyof typeof COMFYUI_CONFIG.workflows];

    if (!workflowFilename) {
      throw new Error(`工作流 ${workflowName} 不存在`);
    }

    try {
      // 从 public/workflows 目录加载工作流文件
      const fullPath = `${COMFYUI_CONFIG.workflowPath}/${workflowFilename}`;
      const response = await fetch(`/${workflowFilename}`);

      if (!response.ok) {
        throw new Error(`工作流文件加载失败: ${response.statusText}`);
      }

      const workflow = await response.json();

      // 验证工作流格式
      if (!workflow || typeof workflow !== 'object') {
        throw new Error('工作流格式无效');
      }

      return workflow;
    } catch (error) {
      console.error(`加载工作流 ${workflowName} 失败:`, error);
      throw error;
    }
  }

  /**
   * 替换工作流中的占位符参数
   * @param workflow 工作流对象
   * @param params 参数对象
   * @returns 替换后的工作流
   */
  replaceWorkflowParams(workflow: any, params: { [key: string]: any }): any {
    const workflowCopy = JSON.parse(JSON.stringify(workflow));

    // 遍历工作流的所有节点
    for (const nodeId in workflowCopy) {
      const node = workflowCopy[nodeId];

      if (node.inputs) {
        // 遍历节点的所有输入
        for (const inputKey in node.inputs) {
          const inputValue = node.inputs[inputKey];

          // 检查是否为占位符字符串
          if (typeof inputValue === 'string' && inputValue.startsWith('{{') && inputValue.endsWith('}}')) {
            const paramName = inputValue.slice(2, -2);

            // 从 params 中获取值并替换
            if (params[paramName] !== undefined) {
              node.inputs[inputKey] = params[paramName];
            }
          }
          // 处理数组类型的输入（如 features）
          else if (Array.isArray(inputValue)) {
            node.inputs[inputKey] = inputValue.map((item) => {
              if (typeof item === 'string' && item.startsWith('{{') && item.endsWith('}}')) {
                const paramName = item.slice(2, -2);
                return params[paramName] !== undefined ? params[paramName] : item;
              }
              return item;
            });
          }
        }
      }
    }

    return workflowCopy;
  }

  /**
   * 构建提示词（根据业务参数）
   */
  buildPrompt(params: any, workflowType: string): string {
    switch (workflowType) {
      case 'petProductScene':
        return `A professional product photography of ${params.productDescription} in a ${params.background} setting. The product is being used by a ${params.petType}. ${params.pose} pose. ${params.lighting} lighting. High quality, detailed, commercial photography style, 8k resolution.`;

      case 'petProductUnboxing':
        return `A professional unboxing scene showing ${params.productDescription} being taken out of a ${params.boxStyle} box. ${params.lighting} lighting. ${params.angle} angle. Hand holding the product. High quality, detailed, commercial photography, 8k resolution.`;

      case 'petProductFeatures':
        const features = Array.isArray(params.features)
          ? params.features.join(', ')
          : params.features;
        return `A professional product features showcase of ${params.productDescription}. Highlights: ${features}. ${params.layout} layout. ${params.style} style. Clean, organized, commercial photography, 8k resolution.`;

      case 'shortVideo':
        return `A dynamic promotional video for ${params.productDescription}. Fast-paced, engaging, ${params.transition} transitions. ${params.musicStyle} background music. Commercial quality, high resolution.`;

      default:
        return params.productDescription || 'Professional product photography';
    }
  }

  /**
   * 执行工作流
   */
  async executeWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
    try {
      // 1. 提交工作流
      const response = await fetch(`${this.baseUrl}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: input.workflow,
          client_id: this.generateClientId()
        })
      });

      if (!response.ok) {
        throw new Error(`ComfyUI 请求失败: ${response.statusText}`);
      }

      const result = await response.json();
      const promptId = result.prompt_id;

      // 2. 轮询等待完成
      const outputs = await this.waitForCompletion(promptId);

      return outputs;
    } catch (error) {
      console.error('ComfyUI 工作流执行失败:', error);
      throw error;
    }
  }

  /**
   * 等待工作流完成
   */
  private async waitForCompletion(promptId: string, timeout: number = 300000): Promise<WorkflowOutput> {
    const startTime = Date.now();
    let lastNode = '';

    while (Date.now() - startTime < timeout) {
      const response = await fetch(`${this.baseUrl}/history/${promptId}`);
      const history = await response.json();

      if (history[promptId]) {
        const outputs: WorkflowOutput = { images: [], videos: [] };

        // 解析输出
        for (const [nodeId, nodeOutput] of Object.entries(history[promptId].outputs)) {
          const output = nodeOutput as any;
          if (output.images) {
            for (const image of output.images) {
              const imageUrl = `${this.baseUrl}/view?filename=${image.filename}&subfolder=${image.subfolder}&type=${image.type}`;
              outputs.images.push(imageUrl);
            }
          }

          if (output.videos) {
            outputs.videos = outputs.videos || [];
            for (const video of output.videos) {
              const videoUrl = `${this.baseUrl}/view?filename=${video.filename}&subfolder=${video.subfolder}&type=${video.type}`;
              outputs.videos.push(videoUrl);
            }
          }
        }

        if (outputs.images.length > 0 || (outputs.videos && outputs.videos.length > 0)) {
          return outputs;
        }
      }

      // 检查进度
      const progress = await this.getProgress(promptId);
      if (progress) {
        console.log(`工作流进度: ${(progress.value * 100).toFixed(2)}% - ${progress.node}`);
      }

      // 等待 1 秒
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('工作流执行超时');
  }

  /**
   * 获取进度
   */
  private async getProgress(promptId: string): Promise<{ value: number; node: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/queue`);
      const data = await response.json();

      const queueRunning = data.queue_running;
      const item = queueRunning.find((item: any) => item[1] === promptId);

      if (item) {
        return {
          value: item[2]?.value || 0,
          node: item[2]?.node || ''
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 上传图片
   */
  async uploadImage(imageBuffer: Buffer, filename: string, overwrite: boolean = true): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(imageBuffer)]);
    formData.append('image', blob, filename);
    formData.append('overwrite', overwrite.toString());

    const response = await fetch(`${this.baseUrl}/upload/image`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`图片上传失败: ${response.statusText}`);
    }

    const result = await response.json();
    return result.name;
  }

  /**
   * 生成客户端 ID
   */
  private generateClientId(): string {
    return Math.random().toString(36).substring(7);
  }
}

export const comfyuiClient = new ComfyUI();

/**
 * 预设工作流执行器
 */
export class WorkflowExecutor {
  /**
   * 生成宠物产品场景图
   */
  async generatePetProductScene(params: {
    productImage: string;
    productDescription: string;
    background: string;
    lighting: string;
    petType: string;
    pose: string;
  }) {
    // 加载工作流
    const workflow = await comfyuiClient.loadWorkflow('petProductScene');

    // 构建提示词
    const prompt = comfyuiClient.buildPrompt(params, 'petProductScene');

    // 替换工作流参数
    const workflowWithParams = comfyuiClient.replaceWorkflowParams(workflow, {
      PROMPT: prompt,
      PRODUCT_IMAGE: params.productImage,
      BACKGROUND: params.background,
      LIGHTING: params.lighting,
      PET_TYPE: params.petType,
      POSE: params.pose
    });

    // 上传产品图片到 ComfyUI
    const imageBuffer = await fetch(params.productImage).then(r => r.arrayBuffer());
    const uploadedImageName = await comfyuiClient.uploadImage(
      Buffer.from(imageBuffer),
      'product_image.png'
    );

    // 执行工作流
    const output = await comfyuiClient.executeWorkflow({
      workflow: workflowWithParams,
      images: { product: uploadedImageName }
    });

    return {
      ...output,
      prompt,
      params
    };
  }

  /**
   * 生成宠物产品开箱图
   */
  async generatePetProductUnboxing(params: {
    productImage: string;
    productDescription: string;
    handImage?: string;
    boxStyle: string;
    lighting: string;
    angle: string;
  }) {
    const workflow = await comfyuiClient.loadWorkflow('petProductUnboxing');

    const prompt = comfyuiClient.buildPrompt(params, 'petProductUnboxing');

    const workflowWithParams = comfyuiClient.replaceWorkflowParams(workflow, {
      PROMPT: prompt,
      PRODUCT_IMAGE: params.productImage,
      BOX_STYLE: params.boxStyle,
      LIGHTING: params.lighting,
      ANGLE: params.angle
    });

    const imageBuffer = await fetch(params.productImage).then(r => r.arrayBuffer());
    const uploadedImageName = await comfyuiClient.uploadImage(
      Buffer.from(imageBuffer),
      'product_unboxing.png'
    );

    const output = await comfyuiClient.executeWorkflow({
      workflow: workflowWithParams,
      images: { product: uploadedImageName }
    });

    return {
      ...output,
      prompt,
      params
    };
  }

  /**
   * 生成宠物产品卖点图
   */
  async generatePetProductFeatures(params: {
    productImage: string;
    productDescription: string;
    features: string[];
    layout: string;
    style: string;
  }) {
    const workflow = await comfyuiClient.loadWorkflow('petProductFeatures');

    const prompt = comfyuiClient.buildPrompt(params, 'petProductFeatures');

    const workflowWithParams = comfyuiClient.replaceWorkflowParams(workflow, {
      PROMPT: prompt,
      PRODUCT_IMAGE: params.productImage,
      FEATURES: Array.isArray(params.features) ? params.features.join(', ') : params.features,
      LAYOUT: params.layout,
      STYLE: params.style
    });

    const imageBuffer = await fetch(params.productImage).then(r => r.arrayBuffer());
    const uploadedImageName = await comfyuiClient.uploadImage(
      Buffer.from(imageBuffer),
      'product_features.png'
    );

    const output = await comfyuiClient.executeWorkflow({
      workflow: workflowWithParams,
      images: { product: uploadedImageName }
    });

    return {
      ...output,
      prompt,
      params
    };
  }

  /**
   * 生成短视频
   */
  async generateShortVideo(params: {
    productDescription: string;
    productImages: string[];
    musicStyle: string;
    transition: string;
    duration: number;
    textOverlay?: string[];
  }) {
    const workflow = await comfyuiClient.loadWorkflow('shortVideo');

    const prompt = comfyuiClient.buildPrompt(params, 'shortVideo');

    const workflowWithParams = comfyuiClient.replaceWorkflowParams(workflow, {
      PROMPT: prompt,
      FRAME_RATE: '24',
      LOOP_COUNT: '1',
      DURATION: params.duration.toString(),
      MUSIC_STYLE: params.musicStyle,
      TRANSITION: params.transition,
      TEXT_OVERLAYS: JSON.stringify(params.textOverlay || [])
    });

    // 上传所有产品图片
    const images: { [key: string]: string } = {};
    for (let i = 0; i < params.productImages.length; i++) {
      const imageBuffer = await fetch(params.productImages[i]).then(r => r.arrayBuffer());
      const uploadedImageName = await comfyuiClient.uploadImage(
        Buffer.from(imageBuffer),
        `frame_${i}.png`
      );
      images[`frame_${i}`] = uploadedImageName;
    }

    const output = await comfyuiClient.executeWorkflow({
      workflow: workflowWithParams,
      images
    });

    return {
      ...output,
      prompt,
      params
    };
  }
}

export const workflowExecutor = new WorkflowExecutor();
