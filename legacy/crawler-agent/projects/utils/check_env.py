#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
环境检查脚本
检查项目依赖和环境配置
"""

import sys
import os
import subprocess
from pathlib import Path


def print_header(title):
    """打印标题"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)


def check_python_version():
    """检查 Python 版本"""
    print("\n📌 检查 Python 版本...")
    version = sys.version_info
    print(f"   Python 版本: {version.major}.{version.minor}.{version.micro}")

    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("   ❌ Python 版本过低，需要 3.8 或更高版本")
        return False
    else:
        print("   ✅ Python 版本符合要求")
        return True


def check_module(module_name, package_name=None):
    """检查 Python 模块"""
    try:
        __import__(module_name)
        print(f"   ✅ {module_name} 已安装")
        return True
    except ImportError:
        print(f"   ❌ {module_name} 未安装")
        if package_name:
            print(f"      安装命令: pip install {package_name}")
        return False


def check_required_packages():
    """检查必需的 Python 包"""
    print("\n📌 检查必需的 Python 包...")

    packages = {
        'flask': 'flask',
        'flask_cors': 'flask-cors',
        'requests': 'requests',
        'bs4': 'beautifulsoup4',
        'lxml': 'lxml',
        'pandas': 'pandas',
        'playwright': 'playwright',
        'scrapling': 'scrapling',
        'curl_cffi': 'curl_cffi',
        'cssselect': 'cssselect',
        'orjson': 'orjson',
    }

    all_ok = True
    for module, package in packages.items():
        if not check_module(module, package):
            all_ok = False

    return all_ok


def check_playwright_browsers():
    """检查 Playwright 浏览器"""
    print("\n📌 检查 Playwright 浏览器...")

    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            try:
                browser = p.chromium.launch(headless=True)
                browser.close()
                print("   ✅ Chromium 浏览器已安装")
                return True
            except Exception as e:
                print(f"   ❌ Chromium 浏览器未安装: {e}")
                print("      安装命令: playwright install chromium")
                return False
    except Exception as e:
        print(f"   ❌ Playwright 未正确安装: {e}")
        return False


def check_redis():
    """检查 Redis 服务"""
    print("\n📌 检查 Redis 服务...")

    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("   ✅ Redis 服务运行正常")
        return True
    except Exception as e:
        print(f"   ⚠️  Redis 服务未运行或未安装")
        print(f"      错误信息: {e}")
        print("      Redis 是可选的，不影响核心功能")
        return True  # Redis 是可选的，不返回 False


def check_directories():
    """检查必需的目录"""
    print("\n📌 检查项目目录结构...")

    required_dirs = [
        'web_ui',
        'core',
        'downloads',
        'data',
    ]

    all_ok = True
    for dir_name in required_dirs:
        dir_path = Path(dir_name)
        if dir_path.exists():
            print(f"   ✅ {dir_name}/ 目录存在")
        else:
            print(f"   ❌ {dir_name}/ 目录不存在")
            all_ok = False

    return all_ok


def check_files():
    """检查必需的文件"""
    print("\n📌 检查必需的文件...")

    required_files = [
        'requirements.txt',
        'web_ui/app.py',
        'README.md',
    ]

    all_ok = True
    for file_name in required_files:
        file_path = Path(file_name)
        if file_path.exists():
            print(f"   ✅ {file_name} 文件存在")
        else:
            print(f"   ❌ {file_name} 文件不存在")
            all_ok = False

    return all_ok


def check_port_availability(port=5000):
    """检查端口是否可用"""
    print(f"\n📌 检查端口 {port} 是否可用...")

    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', port))
        sock.close()

        if result == 0:
            print(f"   ❌ 端口 {port} 已被占用")
            return False
        else:
            print(f"   ✅ 端口 {port} 可用")
            return True
    except Exception as e:
        print(f"   ⚠️  无法检查端口 {port}: {e}")
        return True


def check_network():
    """检查网络连接"""
    print("\n📌 检查网络连接...")

    try:
        import requests
        response = requests.get('https://www.baidu.com', timeout=5)
        if response.status_code == 200:
            print("   ✅ 网络连接正常")
            return True
        else:
            print(f"   ⚠️  网络连接异常，状态码: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ 网络连接失败: {e}")
        return False


def run_install_command():
    """运行安装命令"""
    print("\n📌 运行安装命令...")
    print("   正在安装依赖包，这可能需要几分钟...")

    try:
        result = subprocess.run(
            [sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'],
            capture_output=True,
            text=True,
            timeout=300
        )

        if result.returncode == 0:
            print("   ✅ 依赖包安装成功")
            return True
        else:
            print(f"   ❌ 依赖包安装失败")
            print(f"      错误信息: {result.stderr}")
            return False
    except Exception as e:
        print(f"   ❌ 安装过程中出错: {e}")
        return False


def main():
    """主函数"""
    print_header("智能 Web 爬虫控制系统 - 环境检查")

    # 检查 Python 版本
    python_ok = check_python_version()
    if not python_ok:
        print("\n❌ Python 版本不符合要求，请升级 Python 到 3.8 或更高版本")
        sys.exit(1)

    # 检查必需的包
    packages_ok = check_required_packages()

    # 检查 Playwright 浏览器
    playwright_ok = check_playwright_browsers()

    # 检查 Redis
    redis_ok = check_redis()

    # 检查目录结构
    dirs_ok = check_directories()

    # 检查文件
    files_ok = check_files()

    # 检查端口
    port_ok = check_port_availability()

    # 检查网络
    network_ok = check_network()

    # 汇总结果
    print_header("检查结果汇总")

    checks = [
        ("Python 版本", python_ok),
        ("必需的 Python 包", packages_ok),
        ("Playwright 浏览器", playwright_ok),
        ("Redis 服务（可选）", redis_ok),
        ("项目目录结构", dirs_ok),
        ("必需文件", files_ok),
        ("端口可用性", port_ok),
        ("网络连接", network_ok),
    ]

    all_ok = True
    for name, ok in checks:
        status = "✅ 通过" if ok else "❌ 失败"
        print(f"   {name:.<40} {status}")
        if not ok:
            all_ok = False

    print("\n" + "="*60)

    if all_ok:
        print("🎉 所有检查通过！可以启动系统了。")
        print("\n启动命令:")
        print("  Windows: start_windows.bat")
        print("  Linux/Mac: ./start_linux.sh")
        print("  手动: python web_ui/app.py")
    else:
        print("⚠️  部分检查未通过，请处理上述问题。")
        print("\n快速修复:")
        print("  1. 安装缺失的包: pip install -r requirements.txt")
        print("  2. 安装 Playwright: playwright install chromium")

        # 询问是否自动安装
        if not packages_ok:
            print("\n是否自动安装缺失的依赖包？(y/n): ", end='')
            try:
                choice = input().lower().strip()
                if choice == 'y':
                    if run_install_command():
                        print("\n✅ 依赖包安装完成，请重新运行检查脚本")
                    else:
                        print("\n❌ 依赖包安装失败，请手动安装")
            except KeyboardInterrupt:
                print("\n\n已取消安装")

    print("="*60 + "\n")


if __name__ == '__main__':
    main()
