import { NextRequest, NextResponse } from 'next/server';

const COMFYUI_URL = process.env.NEXT_PUBLIC_COMFYUI_ENDPOINT || 'http://localhost:8188';

// 加载工作流
function loadWorkflow(prompt: string, width = 1024, height = 1024) {
  return {
    "3": {
      "inputs": {
        "seed": Math.floor(Math.random() * 2147483647),
        "steps": 20,
        "cfg": 8,
        "sampler_name": "euler",
        "scheduler": "normal",
        "denoise": 1,
        "model": ["4", 0],
        "positive": ["6", 0],
        "negative": ["7", 0],
        "latent_image": ["5", 0]
      },
      "class_type": "KSampler"
    },
    "4": {
      "inputs": {
        "ckpt_name": "sd_xl_base_1.0.safetensors"
      },
      "class_type": "CheckpointLoaderSimple"
    },
    "5": {
      "inputs": {
        "width": width,
        "height": height,
        "batch_size": 1
      },
      "class_type": "EmptyLatentImage"
    },
    "6": {
      "inputs": {
        "text": prompt,
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "7": {
      "inputs": {
        "text": "ugly, blurry, low quality, distorted, deformed, bad anatomy",
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "8": {
      "inputs": {
        "samples": ["3", 0],
        "vae": ["4", 2]
      },
      "class_type": "VAEDecode"
    },
    "9": {
      "inputs": {
        "filename_prefix": `pet_content_${Date.now()}`,
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    }
  };
}

// 提交任务到队列
async function submitPrompt(workflow: any): Promise<string> {
  const response = await fetch(`${COMFYUI_URL}/prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: workflow,
      client_id: `web-${Date.now()}`
    }),
  });

  const data = await response.json();
  return data.prompt_id;
}

// 获取队列状态
async function getHistory(promptId: string): Promise<any> {
  const response = await fetch(`${COMFYUI_URL}/history/${promptId}`);
  return await response.json();
}

// 获取图片
async function getImage(filename: string, subfolder: string, type: string): Promise<Blob> {
  const params = new URLSearchParams({
    filename,
    subfolder,
    type
  });

  const response = await fetch(`${COMFYUI_URL}/view?${params}`);
  return await response.blob();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, width = 1024, height = 1024 } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 检查服务是否可用
    try {
      const healthCheck = await fetch(`${COMFYUI_URL}/system_stats`, {
        signal: AbortSignal.timeout(3000)
      });
      if (!healthCheck.ok) {
        return NextResponse.json({ error: 'ComfyUI 服务未启动或无响应' }, { status: 503 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'ComfyUI 服务未启动，请先启动服务' }, { status: 503 });
    }

    // 加载工作流
    const workflow = loadWorkflow(prompt, width, height);

    // 提交任务
    const promptId = await submitPrompt(workflow);

    // 等待任务完成
    let attempts = 0;
    const maxAttempts = 60; // 最多等待 60 秒

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const history = await getHistory(promptId);

      if (history[promptId] && history[promptId].outputs) {
        const outputs = history[promptId].outputs;

        // 查找生成的图片
        for (const nodeId in outputs) {
          const output = outputs[nodeId];
          if (output.images && output.images.length > 0) {
            const imageInfo = output.images[0];

            // 获取图片
            const blob = await getImage(
              imageInfo.filename,
              imageInfo.subfolder || '',
              imageInfo.type
            );

            // 转换为 base64
            const buffer = await blob.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const mimeType = blob.type || 'image/png';

            return NextResponse.json({
              success: true,
              promptId,
              image: `data:${mimeType};base64,${base64}`,
              filename: imageInfo.filename
            });
          }
        }
      }

      attempts++;
    }

    return NextResponse.json({ error: '生成超时，请稍后重试' }, { status: 408 });
  } catch (error) {
    console.error('ComfyUI generation error:', error);
    return NextResponse.json({ error: `生成失败: ${error}` }, { status: 500 });
  }
}
