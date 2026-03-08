import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const COMFYUI_DIR = '/workspace/projects/ComfyUI-Service';
const PID_FILE = '/app/work/logs/bypass/comfyui.pid';
const LOG_FILE = '/app/work/logs/bypass/comfyui.log';
const PORT = 8188;

// 检查服务是否运行
async function isServiceRunning(): Promise<boolean> {
  try {
    if (require('fs').existsSync(PID_FILE)) {
      const pid = require('fs').readFileSync(PID_FILE, 'utf-8').trim();
      const { stdout } = await execAsync(`ps -p ${pid}`);
      return stdout.includes(pid);
    }
  } catch (error) {
    return false;
  }
  return false;
}

// 启动服务
async function startService(): Promise<{ success: boolean; message: string }> {
  if (await isServiceRunning()) {
    return { success: true, message: 'ComfyUI 服务已在运行中' };
  }

  try {
    const command = `cd ${COMFYUI_DIR} && source venv/bin/activate && nohup python main.py --listen 0.0.0.0 --port ${PORT} --enable-cors-header "*" > ${LOG_FILE} 2>&1 & echo $! > ${PID_FILE}`;

    await execAsync(command);

    // 等待服务启动
    await new Promise(resolve => setTimeout(resolve, 5000));

    if (await isServiceRunning()) {
      return { success: true, message: 'ComfyUI 服务启动成功' };
    } else {
      return { success: false, message: 'ComfyUI 服务启动失败，请查看日志' };
    }
  } catch (error) {
    return { success: false, message: `启动失败: ${error}` };
  }
}

// 停止服务
async function stopService(): Promise<{ success: boolean; message: string }> {
  try {
    if (require('fs').existsSync(PID_FILE)) {
      const pid = require('fs').readFileSync(PID_FILE, 'utf-8').trim();
      await execAsync(`kill ${pid}`);
      require('fs').unlinkSync(PID_FILE);
      return { success: true, message: 'ComfyUI 服务已停止' };
    }
    return { success: true, message: '服务未运行' };
  } catch (error) {
    return { success: false, message: `停止失败: ${error}` };
  }
}

// GET - 获取服务状态
export async function GET(request: NextRequest) {
  try {
    const running = await isServiceRunning();

    // 检查服务健康状态
    let healthy = false;
    let version = 'unknown';
    if (running) {
      try {
        const response = await fetch(`http://localhost:${PORT}/system_stats`, {
          signal: AbortSignal.timeout(3000)
        });
        if (response.ok) {
          healthy = true;
          const data = await response.json();
          version = data.system?.comfyui_version || 'unknown';
        }
      } catch (error) {
        healthy = false;
      }
    }

    return NextResponse.json({
      running,
      healthy,
      version,
      port: PORT,
      url: `http://localhost:${PORT}`,
      hasModels: require('fs').existsSync(`${COMFYUI_DIR}/models/checkpoints/sd_xl_base_1.0.safetensors`)
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

// POST - 启动或停止服务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'start') {
      const result = await startService();
      return NextResponse.json(result);
    } else if (action === 'stop') {
      const result = await stopService();
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
