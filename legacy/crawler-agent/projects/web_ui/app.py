#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Web UI 后端服务 - Flask API
提供Web界面和爬虫控制API
"""

import os
import sys
import json
import threading
import queue
import asyncio
from datetime import datetime
from flask import Flask, render_template, jsonify, request, Response, stream_with_context
from flask_cors import CORS

# 添加父目录到路径，导入爬虫模块
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.web_crawler import CrawlerConfig, WebCrawler
from core.element_analyzer import ElementAnalyzer
from core.screenshot_analyzer import ScreenshotAnalyzer
from smart_analyzer import smart_analyzer

# 导入新模块
from utils.monitor import Monitor, AlertLevel
from utils.circuit_breaker import CircuitBreaker
from utils.proxy_manager import ProxyManager
from utils.resume_manager import ResumeManager
from core.scrapling_adapter import ScraplingAdapter

import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 全局状态
crawler_status = {
    'running': False,
    'progress': 0,
    'message': '就绪',
    'stats': {},
    'logs': [],
    'log_queue': queue.Queue()
}

# 日志处理器
class WebUILogHandler(logging.Handler):
    """自定义日志处理器，将日志发送到前端"""
    def __init__(self, log_queue):
        super().__init__()
        self.log_queue = log_queue

    def emit(self, record):
        try:
            log_entry = {
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'level': record.levelname,
                'message': self.format(record)
            }
            self.log_queue.put(log_entry)
            # 保留最近100条日志
            if len(crawler_status['logs']) > 100:
                crawler_status['logs'].pop(0)
            crawler_status['logs'].append(log_entry)
        except Exception:
            pass

# 添加日志处理器
web_ui_handler = WebUILogHandler(crawler_status['log_queue'])
web_ui_handler.setFormatter(logging.Formatter('%(message)s'))
logging.getLogger('web_crawler').addHandler(web_ui_handler)


@app.route('/')
def index():
    """主页"""
    return render_template('index.html')

# 新首页（对标biaoda.me风格）
@app.route('/new')
def new_index():
    """新UI首页"""
    return render_template('new_index.html')

# 支持直接通过路径访问HTML文件
@app.route('/<filename>.html')
def render_html(filename):
    """直接访问templates目录下的HTML文件"""
    try:
        return render_template(f'{filename}.html')
    except:
        return "页面不存在", 404

# 新爬取API接口
@app.route('/api/crawl', methods=['POST'])
def api_crawl():
    """统一爬取API，适配新UI"""
    try:
        params = request.get_json()
        source = params.get('source', 'url')
        
        if source == 'url':
            urls = params.get('urls', [])
            depth = params.get('depth', 1)
            max_count = params.get('max_count', 100)
            
            if not urls:
                return jsonify({'success': False, 'message': '请输入要爬取的URL'})
            
            # 初始化爬虫
            results = []
            for url in urls:
                config = CrawlerConfig(
                    urls=[url]
                )
                crawler = WebCrawler(config)
                crawl_result = crawler.crawl()
                
                # 结构化处理结果
                for page in crawl_result:
                    structured_item = {
                        'URL': page.get('url', ''),
                        '标题': page.get('title', ''),
                        '内容': page.get('content', '')[:500] + '...' if len(page.get('content', '')) > 500 else page.get('content', ''),
                        '状态码': page.get('status_code', ''),
                        '爬取时间': page.get('crawled_at', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
                    }
                    results.append(structured_item)
            
            return jsonify({'success': True, 'data': results, 'count': len(results)})
        
        else:
            return jsonify({'success': False, 'message': '暂不支持该数据源类型'})
    
    except Exception as e:
        logger.error(f"爬取API错误: {str(e)}")
        return jsonify({'success': False, 'message': f'爬取失败: {str(e)}'})


@app.route('/preview')
def preview():
    """预览页面"""
    return render_template('preview.html')


@app.route('/api/status', methods=['GET'])
def get_status():
    """获取爬虫状态"""
    return jsonify({
        'running': crawler_status['running'],
        'progress': crawler_status['progress'],
        'message': crawler_status['message'],
        'stats': crawler_status['stats']
    })


@app.route('/api/logs/stream', methods=['GET'])
def stream_logs():
    """实时日志流"""
    def generate():
        while True:
            try:
                # 从队列获取日志
                log = crawler_status['log_queue'].get(timeout=1)
                yield f"data: {json.dumps(log)}\n\n"
            except queue.Empty:
                # 发送心跳
                yield f"data: {json.dumps({'type': 'heartbeat'})}\n\n"

    return Response(stream_with_context(generate()), mimetype='text/event-stream')


@app.route('/api/crawl/start', methods=['POST'])
def start_crawl():
    """启动爬虫"""
    if crawler_status['running']:
        return jsonify({'success': False, 'message': '爬虫正在运行中'})

    try:
        data = request.json
        urls = data.get('urls', [])
        if not urls:
            return jsonify({'success': False, 'message': '请输入至少一个URL'})

        # 清空日志
        crawler_status['logs'] = []
        while not crawler_status['log_queue'].empty():
            crawler_status['log_queue'].get()

        # 创建配置 - 添加None检查
        config = CrawlerConfig(
            urls=urls,
            image_types=data.get('image_types') or ['jpg', 'png', 'webp'],
            audio_types=data.get('audio_types') or ['mp3', 'wav', 'flac'],
            video_types=data.get('video_types') or ['mp4', 'mov', 'avi'],
            doc_types=data.get('doc_types') or ['pdf', 'doc', 'docx'],
            min_image_size=data.get('min_size', 10240) or 10240,
            delay_range=(data.get('delay_min', 1.0) or 1.0, data.get('delay_max', 5.0) or 5.0),
            check_robots=data.get('check_robots', True) if data.get('check_robots') is not None else True,
            output_dir=data.get('output_dir', './crawled_content') or './crawled_content'
        )

        # 在后台线程运行爬虫
        def run_crawler():
            try:
                crawler_status['running'] = True
                crawler_status['message'] = '正在爬取...'
                crawler_status['progress'] = 0

                # 保存配置到断点续爬管理器
                resume_manager.save_config(config.__dict__)

                # 监控任务开始
                monitor.record_task_start()

                crawler = WebCrawler(config)
                report = crawler.crawl()

                crawler_status['running'] = False
                crawler_status['message'] = '爬取完成'
                crawler_status['progress'] = 100
                crawler_status['stats'] = report.get('stats', {})

                # 监控任务成功
                monitor.record_task_success()

                # 清除进度
                resume_manager.clear_progress()

            except Exception as e:
                logger.error(f"爬取错误: {e}")
                crawler_status['running'] = False
                crawler_status['message'] = f'爬取失败: {str(e)}'
                crawler_status['progress'] = 0

                # 监控任务失败
                monitor.record_task_failure(str(e))

                # 保存失败进度
                resume_manager.save_progress(crawler_status['progress'], config.__dict__)

        thread = threading.Thread(target=run_crawler)
        thread.daemon = True
        thread.start()

        return jsonify({'success': True, 'message': '爬虫已启动'})

    except Exception as e:
        logger.error(f"启动爬虫失败: {e}")
        return jsonify({'success': False, 'message': str(e)})


@app.route('/api/crawl/stop', methods=['POST'])
def stop_crawl():
    """停止爬虫"""
    crawler_status['running'] = False
    crawler_status['message'] = '已停止'
    return jsonify({'success': True, 'message': '爬虫已停止'})


@app.route('/api/config/default', methods=['GET'])
def get_default_config():
    """获取默认配置"""
    return jsonify({
        'urls': [],
        'image_types': ['jpg', 'png', 'webp'],
        'audio_types': ['mp3', 'wav', 'flac'],
        'video_types': ['mp4', 'mov', 'avi'],
        'doc_types': ['pdf', 'doc', 'docx'],
        'min_size': 10240,
        'delay_min': 1.0,
        'delay_max': 5.0,
        'check_robots': True,
        'output_dir': './crawled_content'
    })


@app.route('/api/analyze', methods=['POST'])
def analyze_elements():
    """分析网页元素"""
    try:
        data = request.json
        url = data.get('url')

        if not url:
            return jsonify({'success': False, 'message': '请提供URL'})

        # 异步执行分析
        def run_analysis():
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

                # 创建截图分析器
                screenshot_analyzer = ScreenshotAnalyzer()

                try:
                    # 截图并获取元素位置
                    result = loop.run_until_complete(
                        screenshot_analyzer.capture_and_analyze(url)
                    )

                    # 代码分析
                    element_analyzer = ElementAnalyzer(url)
                    element_analyzer.analyze_from_code(result['content'])

                    # 合并结果
                    merged_results = {
                        'screenshot': result['screenshot'],
                        'page_size': result['page_size'],
                        'elements': element_analyzer.merge_with_ai_results(result['elements']),
                        'summary': element_analyzer.get_summary()
                    }

                    return merged_results

                finally:
                    loop.run_until_complete(screenshot_analyzer.stop())
                    loop.close()

            except Exception as e:
                logger.error(f"分析错误: {e}")
                raise

        # 在后台线程运行分析
        thread = threading.Thread(target=lambda: analyzer_results.update(run_analysis()))
        thread.daemon = True
        thread.start()

        return jsonify({'success': True, 'message': '正在分析...'})

    except Exception as e:
        logger.error(f"启动分析失败: {e}")
        return jsonify({'success': False, 'message': str(e)})


@app.route('/api/analyze/result', methods=['GET'])
def get_analysis_result():
    """获取分析结果"""
    global analyzer_results
    return jsonify({'success': True, 'result': analyzer_results.get()})


# 全局变量存储分析结果
analyzer_results = {}

# ============ 新增：监控、熔断、代理、断点续爬 ============

# 初始化监控器
monitor = Monitor()
circuit_breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=60)

# 初始化代理管理器（合规）
proxy_manager = ProxyManager([])  # 初始为空代理列表

# 初始化断点续爬管理器
resume_manager = ResumeManager()

# 初始化 Scrapling 适配器
scrapling_adapter = None

# 启动监控
monitor.start_monitoring(interval=10)  # 每10秒检查一次

logger.info("监控、熔断、代理管理、断点续爬、Scrapling 系统已初始化")


# ============ 新增：内容预览和下载API ============

from content_extractor import GenericCrawler

# 全局变量存储内容提取器
content_extractor = None
preview_results = {}


@app.route('/api/content/preview', methods=['POST'])
def preview_content():
    """
    预览网页内容

    请求体:
    {
        "url": "https://example.com/article"
    }

    返回:
    {
        "success": true,
        "data": {
            "url": "...",
            "title": "文章标题",
            "content": "正文内容...",
            "images": [
                {"id": 1, "url": "...", "alt": "...", "title": "...", "selected": false},
                ...
            ],
            "comments": [
                {"id": 1, "username": "...", "content": "...", "time": "...", "selected": false},
                ...
            ],
            "meta": {
                "image_count": 10,
                "comment_count": 5,
                "content_length": 5000
            }
        }
    }
    """
    global content_extractor, preview_results

    try:
        data = request.json
        url = data.get('url', '').strip()

        if not url:
            return jsonify({'success': False, 'message': '请输入URL'})

        logger.info(f"开始预览内容: {url}")

        # 创建通用爬虫
        crawler = GenericCrawler()
        result = crawler.preview(url)

        if result:
            # 存储提取器和结果
            content_extractor = crawler
            preview_results = result

            logger.info(f"预览成功: 标题={result['title']}, 图片={result['meta']['image_count']}, 评论={result['meta']['comment_count']}")
            return jsonify({'success': True, 'data': result})
        else:
            return jsonify({'success': False, 'message': '预览失败，请检查URL是否正确'})

    except Exception as e:
        logger.error(f"预览错误: {e}")
        return jsonify({'success': False, 'message': f'预览失败: {str(e)}'})


@app.route('/api/content/download', methods=['POST'])
def download_selected_content():
    """
    下载选中的内容

    请求体:
    {
        "selection": {
            "title": true,
            "content": true,
            "images": [1, 3, 5],  // 选中的图片ID列表
            "comments": [1, 2, 3]  // 选中的评论ID列表
        },
        "output_dir": "./downloads"  // 可选，默认 ./downloads
    }

    返回:
    {
        "success": true,
        "message": "下载完成到: ...",
        "result": {
            "title_file": "...",
            "content_file": "...",
            "images_downloaded": [...],
            "comments_file": "..."
        }
    }
    """
    global content_extractor

    try:
        data = request.json
        selection = data.get('selection', {})
        output_dir = data.get('output_dir', './downloads')

        if not content_extractor:
            return jsonify({'success': False, 'message': '未加载内容，请先预览'})

        logger.info(f"开始下载选中的内容: {selection}")

        # 执行下载
        result = content_extractor.download_selected(selection, output_dir)

        if result['success']:
            logger.info(f"下载成功: {result['message']}")
            return jsonify({'success': True, 'message': result['message'], 'result': result})
        else:
            return jsonify({'success': False, 'message': result['message']})

    except Exception as e:
        logger.error(f"下载错误: {e}")
        return jsonify({'success': False, 'message': f'下载失败: {str(e)}'})


@app.route('/api/content/clear', methods=['POST'])
def clear_content():
    """清除已加载的内容"""
    global content_extractor, preview_results

    content_extractor = None
    preview_results = {}

    logger.info("已清除内容缓存")
    return jsonify({'success': True, 'message': '已清除内容缓存'})


# ==================== 智能爬虫路由 ====================

@app.route('/smart')
def smart_crawler():
    """智能爬虫页面"""
    return render_template('smart_crawler.html')


@app.route('/api/smart/analyze', methods=['POST'])
def smart_analyze_page():
    """智能分析网页元素"""
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'success': False, 'message': '请输入URL'})

    try:
        # 使用asyncio运行异步分析
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        result = loop.run_until_complete(smart_analyzer.analyze_page(url))

        loop.close()

        if result['success']:
            logger.info(f"智能分析完成: {url}, 发现 {result['summary']['total']} 个元素")
        else:
            logger.error(f"智能分析失败: {result.get('message')}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"智能分析异常: {e}")
        return jsonify({'success': False, 'message': str(e)})


@app.route('/api/smart/download', methods=['POST'])
def smart_download_elements():
    """下载选中的元素"""
    data = request.get_json()
    elements = data.get('elements', [])
    save_type = data.get('save_type', 'folder')
    output_path = data.get('output_path', './downloads')

    if not elements:
        return jsonify({'success': False, 'message': '请至少选择一个元素'})

    try:
        # 使用asyncio运行异步下载
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        result = loop.run_until_complete(
            smart_analyzer.download_elements(elements, save_type, output_path)
        )

        loop.close()

        if result['success']:
            logger.info(f"智能下载完成: 成功 {result['downloaded']}, 失败 {result['failed']}")
        else:
            logger.error(f"智能下载失败: {result.get('message')}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"智能下载异常: {e}")
        return jsonify({'success': False, 'message': str(e)})


# ==================== 监控、熔断、代理、断点续爬API ====================

@app.route('/api/monitor/data', methods=['GET'])
def get_monitor_data():
    """获取监控数据"""
    try:
        metrics = monitor.get_metrics()
        recent_alerts = monitor.get_alerts(limit=20)

        # 获取熔断器状态
        circuit_state = circuit_breaker.get_state().value
        circuit_stats = circuit_breaker.get_stats()

        # 获取断点续爬信息
        resume_info = resume_manager.get_progress()

        # 获取代理信息
        proxy_info = proxy_manager.get_stats()

        return jsonify({
            'success': True,
            'data': {
                'health_status': monitor._calculate_health_status(metrics),
                'circuit_state': circuit_state,
                'circuit_stats': circuit_stats,
                'alert_count': len(recent_alerts),
                'metrics': metrics,
                'recent_alerts': recent_alerts,
                'resume_info': resume_info,
                'proxy_info': proxy_info
            }
        })
    except Exception as e:
        logger.error(f"获取监控数据失败: {e}")
        return jsonify({'success': False, 'message': str(e)})


@app.route('/api/crawl/resume', methods=['POST'])
def resume_crawl():
    """恢复上次爬取"""
    try:
        progress = resume_manager.get_progress()

        if not progress:
            return jsonify({'success': False, 'message': '没有可恢复的任务'})

        # 读取上次配置
        if progress.get('config'):
            config_data = progress['config']
            config = CrawlerConfig(**config_data)
        else:
            return jsonify({'success': False, 'message': '配置信息不存在'})

        # 恢复进度
        resume_manager.resume()

        # 在后台线程运行爬虫
        def run_crawler():
            try:
                crawler_status['running'] = True
                crawler_status['message'] = '正在恢复爬取...'
                crawler_status['progress'] = progress.get('progress', 0)

                crawler = WebCrawler(config)
                report = crawler.crawl()

                crawler_status['running'] = False
                crawler_status['message'] = '爬取完成'
                crawler_status['progress'] = 100
                crawler_status['stats'] = report.get('stats', {})

                # 清除进度
                resume_manager.clear_progress()

            except Exception as e:
                logger.error(f"恢复爬取错误: {e}")
                crawler_status['running'] = False
                crawler_status['message'] = f'恢复失败: {str(e)}'
                crawler_status['progress'] = progress.get('progress', 0)

        thread = threading.Thread(target=run_crawler)
        thread.daemon = True
        thread.start()

        return jsonify({'success': True, 'message': '已恢复上次爬取'})

    except Exception as e:
        logger.error(f"恢复爬取失败: {e}")
        return jsonify({'success': False, 'message': str(e)})


@app.route('/api/proxies/refresh', methods=['POST'])
def refresh_proxies():
    """刷新代理列表"""
    try:
        # 这里可以添加获取代理的逻辑（合规）
        # 示例：从文件或数据库加载代理
        proxies = [
            # 示例代理（需要替换为实际的合规代理）
        ]

        proxy_manager.load_proxies(proxies)

        return jsonify({'success': True, 'message': '代理列表已刷新'})
    except Exception as e:
        logger.error(f"刷新代理失败: {e}")
        return jsonify({'success': False, 'message': str(e)})


@app.route('/api/proxies/stats', methods=['GET'])
def get_proxy_stats():
    """获取代理统计信息"""
    try:
        stats = proxy_manager.get_stats()
        return jsonify({'success': True, 'data': stats})
    except Exception as e:
        logger.error(f"获取代理统计失败: {e}")
        return jsonify({'success': False, 'message': str(e)})


# ==================== Scrapling API ====================

@app.route('/api/scrapling/fetch', methods=['POST'])
def scrapling_fetch():
    """
    使用 Scrapling 获取页面

    请求体:
    {
        "url": "https://example.com",
        "use_stealthy": false,
        "use_dynamic": false,
        "headless": true
    }

    返回:
    {
        "success": true,
        "data": {
            "url": "...",
            "title": "...",
            "links": [...],
            "images": [...]
        }
    }
    """
    global scrapling_adapter

    try:
        data = request.json
        url = data.get('url', '').strip()
        use_stealthy = data.get('use_stealthy', False)
        use_dynamic = data.get('use_dynamic', False)
        headless = data.get('headless', True)

        if not url:
            return jsonify({'success': False, 'message': '请输入URL'})

        logger.info(f"使用 Scrapling 获取页面: {url}")

        # 初始化适配器
        if not scrapling_adapter:
            scrapling_adapter = ScraplingAdapter()

        # 获取页面
        page = scrapling_adapter.fetch_url(
            url,
            use_stealthy=use_stealthy,
            use_dynamic=use_dynamic,
            headless=headless
        )

        if not page:
            return jsonify({'success': False, 'message': '获取页面失败'})

        # 提取数据
        selectors = {
            'title': 'h1::text',
            'links': 'a::attr(href)',
            'images': 'img::attr(src)'
        }

        extracted_data = scrapling_adapter.extract_data(page, selectors)

        result = {
            'url': url,
            'title': extracted_data.get('title', [''])[0] if extracted_data.get('title') else '',
            'links': extracted_data.get('links', []),
            'images': extracted_data.get('images', [])
        }

        logger.info(f"Scrapling 获取成功: 标题={result['title']}, 链接={len(result['links'])}, 图片={len(result['images'])}")

        return jsonify({'success': True, 'data': result})

    except Exception as e:
        logger.error(f"Scrapling 获取失败: {e}")
        return jsonify({'success': False, 'message': f'获取失败: {str(e)}'})


@app.route('/api/scrapling/extract', methods=['POST'])
def scrapling_extract():
    """
    使用 Scrapling 提取自定义数据

    请求体:
    {
        "url": "https://example.com",
        "selectors": {
            "title": "h1::text",
            "price": ".price::text",
            "image": ".product-img::attr(src)"
        }
    }

    返回:
    {
        "success": true,
        "data": {
            "title": "...",
            "price": "...",
            "image": "..."
        }
    }
    """
    global scrapling_adapter

    try:
        data = request.json
        url = data.get('url', '').strip()
        selectors = data.get('selectors', {})

        if not url:
            return jsonify({'success': False, 'message': '请输入URL'})

        if not selectors:
            return jsonify({'success': False, 'message': '请提供选择器'})

        logger.info(f"使用 Scrapling 提取数据: {url}")

        # 初始化适配器
        if not scrapling_adapter:
            scrapling_adapter = ScraplingAdapter()

        # 获取页面
        page = scrapling_adapter.fetch_url(url)

        if not page:
            return jsonify({'success': False, 'message': '获取页面失败'})

        # 提取数据
        extracted_data = scrapling_adapter.extract_data(page, selectors)

        return jsonify({'success': True, 'data': extracted_data})

    except Exception as e:
        logger.error(f"Scrapling 提取失败: {e}")
        return jsonify({'success': False, 'message': f'提取失败: {str(e)}'})


@app.route('/api/scrapling/bypass', methods=['POST'])
def scrapling_bypass_cloudflare():
    """
    使用 Scrapling 绕过 Cloudflare

    请求体:
    {
        "url": "https://example.com"
    }

    返回:
    {
        "success": true,
        "data": {
            "url": "...",
            "title": "...",
            "content": "..."
        }
    }
    """
    global scrapling_adapter

    try:
        data = request.json
        url = data.get('url', '').strip()

        if not url:
            return jsonify({'success': False, 'message': '请输入URL'})

        logger.info(f"使用 Scrapling 绕过 Cloudflare: {url}")

        # 初始化适配器
        if not scrapling_adapter:
            scrapling_adapter = ScraplingAdapter()

        # 绕过 Cloudflare
        page = scrapling_adapter.bypass_cloudflare(url)

        if not page:
            return jsonify({'success': False, 'message': '绕过 Cloudflare 失败'})

        # 提取数据
        result = {
            'url': url,
            'title': page.css('h1::text').get(),
            'content': page.css('body::text').getall()
        }

        logger.info(f"成功绕过 Cloudflare: {url}")

        return jsonify({'success': True, 'data': result})

    except Exception as e:
        logger.error(f"绕过 Cloudflare 失败: {e}")
        return jsonify({'success': False, 'message': f'绕过失败: {str(e)}'})


if __name__ == '__main__':
    # 检查端口
    port = int(os.environ.get('PORT', 5000))

    print("\n" + "="*60)
    print("Web UI 启动中...")
    print(f"访问地址: http://localhost:{port}")
    print("="*60 + "\n")

    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
