#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
工程级多类型内容爬取自动化Agent
支持图片/音频/视频/文档的合规爬取
"""

import os
import sys
import time
import random
import hashlib
import logging
import argparse
from datetime import datetime
from typing import List, Dict, Set, Optional, Tuple
from urllib.parse import urljoin, urlparse, unquote
from dataclasses import dataclass, field
import json

import requests
from bs4 import BeautifulSoup
import pandas as pd

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'crawler_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


# ============================================================================
# 配置类
# ============================================================================

@dataclass
class CrawlerConfig:
    """爬虫配置类"""
    
    # 爬取范围
    urls: List[str] = field(default_factory=list)
    page_range: Optional[Tuple[int, int]] = None  # (起始页, 结束页)
    
    # 内容类型筛选
    image_types: List[str] = field(default_factory=lambda: ['jpg', 'png', 'webp', 'jpeg'])
    audio_types: List[str] = field(default_factory=lambda: ['mp3', 'wav', 'flac', 'aac'])
    video_types: List[str] = field(default_factory=lambda: ['mp4', 'mov', 'avi', 'mkv'])
    doc_types: List[str] = field(default_factory=lambda: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'])
    
    # 筛选条件
    min_image_size: int = 10240  # 最小图片大小 10KB
    ignore_thumbnails: bool = True  # 忽略缩略图
    min_image_width: int = 0  # 最小图片宽度
    min_image_height: int = 0  # 最小图片高度
    
    # 反爬配置
    user_agents: List[str] = field(default_factory=lambda: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
    ])
    delay_range: Tuple[float, float] = (1.0, 5.0)  # 请求延时范围（秒）
    timeout: int = 10  # 请求超时（秒）
    max_retries: int = 2  # 最大重试次数
    
    # 并发配置
    concurrency_mode: str = 'single'  # single / multi_thread / async
    max_concurrent: int = 1  # 最大并发数，异步模式下不超过10
    
    # 存储配置
    storage_mode: str = 'local'  # local / oss / database
    output_dir: str = './crawled_content'
    oss_config: Optional[Dict] = None  # OSS配置
    db_config: Optional[Dict] = None  # 数据库配置

    def __post_init__(self):
        """初始化后处理，确保所有列表字段都不是None"""
        # 确保所有列表字段都不是None
        if self.urls is None:
            self.urls = []
        if self.image_types is None:
            self.image_types = ['jpg', 'png', 'webp', 'jpeg']
        if self.audio_types is None:
            self.audio_types = ['mp3', 'wav', 'flac', 'aac']
        if self.video_types is None:
            self.video_types = ['mp4', 'mov', 'avi', 'mkv']
        if self.doc_types is None:
            self.doc_types = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']
        if self.user_agents is None:
            self.user_agents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
            ]
        # 确保其他字段有默认值
        if self.delay_range is None:
            self.delay_range = (1.0, 5.0)
        if self.output_dir is None:
            self.output_dir = './crawled_content'
    
    # 输出配置
    report_format: str = 'csv'  # csv / excel / txt
    enable_report: bool = True
    
    # 合规配置
    check_robots: bool = True  # 检查robots.txt
    respect_rate_limit: bool = True  # 遵守速率限制
    allow_redirects: bool = False  # 禁止重定向


# ============================================================================
# 工具类
# ============================================================================

class URLUtils:
    """URL处理工具类"""
    
    @staticmethod
    def normalize_url(url: str, base_url: str) -> str:
        """标准化URL，处理相对路径"""
        try:
            # 检查URL是否为None或空
            if not url or url.strip() == '':
                return url
            
            if url.startswith(('http://', 'https://')):
                return url
            elif url.startswith('//'):
                return f'https:{url}'
            elif url.startswith('/'):
                parsed_base = urlparse(base_url)
                return f'{parsed_base.scheme}://{parsed_base.netloc}{url}'
            else:
                return urljoin(base_url, url)
        except Exception as e:
            logger.warning(f"URL标准化失败: {url}, 错误: {e}")
            return url
    
    @staticmethod
    def get_domain(url: str) -> str:
        """获取域名"""
        try:
            if not url or not isinstance(url, str):
                return 'unknown'
            return urlparse(url).netloc
        except:
            return 'unknown'
    
    @staticmethod
    def is_valid_url(url: str) -> bool:
        """验证URL有效性"""
        try:
            result = urlparse(url)
            return all([result.scheme in ['http', 'https'], result.netloc])
        except:
            return False
    
    @staticmethod
    def get_file_extension(url: str) -> str:
        """获取文件扩展名"""
        try:
            if not url or not isinstance(url, str):
                return ''
            path = unquote(urlparse(url).path)
            ext = os.path.splitext(path)[1].lower().lstrip('.')
            return ext
        except:
            return ''


class DeduplicationManager:
    """去重管理器"""
    
    def __init__(self):
        self.url_hashes: Set[str] = set()
        self.content_hashes: Set[str] = set()
    
    def add_url(self, url: str) -> bool:
        """添加URL，返回是否重复"""
        url_hash = hashlib.md5(url.encode('utf-8')).hexdigest()
        if url_hash in self.url_hashes:
            return True
        self.url_hashes.add(url_hash)
        return False
    
    def add_content(self, content: bytes) -> bool:
        """添加内容，返回是否重复"""
        content_hash = hashlib.md5(content).hexdigest()
        if content_hash in self.content_hashes:
            return True
        self.content_hashes.add(content_hash)
        return False
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        return {
            'unique_urls': len(self.url_hashes),
            'unique_contents': len(self.content_hashes)
        }


class RobotsChecker:
    """robots.txt检查器"""
    
    def __init__(self, user_agent: str = '*'):
        self.user_agent = user_agent
        self.disallowed_paths: Dict[str, Set[str]] = {}
        self.crawl_delay: Dict[str, int] = {}
    
    def check(self, url: str) -> Tuple[bool, str]:
        """检查URL是否允许爬取"""
        try:
            # 检查URL有效性
            if not url or not URLUtils.is_valid_url(url):
                return False, "URL无效"

            domain = URLUtils.get_domain(url)
            if domain == 'unknown':
                return True, "无法解析域名，允许爬取"

            robots_url = f'https://{domain}/robots.txt'

            response = requests.get(robots_url, timeout=10)
            if response.status_code != 200:
                return True, "无法获取robots.txt，允许爬取"

            # 解析robots.txt
            current_ua = None
            for line in response.text.split('\n'):
                line = line.strip()
                if not line:
                    continue

                if line.lower().startswith('user-agent:'):
                    # 安全分割
                    parts = line.split(':', 1)
                    if len(parts) < 2:
                        continue
                    ua = parts[1].strip()
                    if not ua:
                        continue

                    # 检查user_agent是否为字符串
                    if not isinstance(self.user_agent, str):
                        self.user_agent = '*'

                    if ua == '*' or (self.user_agent and ua.lower() in self.user_agent.lower()):
                        current_ua = ua

                elif line.lower().startswith('disallow:'):
                    # 安全分割
                    parts = line.split(':', 1)
                    if len(parts) < 2:
                        continue
                    path = parts[1].strip()
                    if not path:
                        continue

                    if domain not in self.disallowed_paths:
                        self.disallowed_paths[domain] = set()
                    self.disallowed_paths[domain].add(path)

                elif line.lower().startswith('crawl-delay:'):
                    # 安全分割
                    parts = line.split(':', 1)
                    if len(parts) < 2:
                        continue
                    delay_str = parts[1].strip()
                    if not delay_str:
                        continue

                    try:
                        delay = int(delay_str)
                        if domain not in self.crawl_delay:
                            self.crawl_delay[domain] = delay
                    except ValueError:
                        continue

            # 检查当前URL是否被禁止
            if domain in self.disallowed_paths:
                parsed_url = urlparse(url)
                for disallowed in self.disallowed_paths[domain]:
                    if parsed_url.path.startswith(disallowed):
                        return False, f"被robots.txt禁止: {disallowed}"

            return True, "允许爬取"

        except Exception as e:
            logger.warning(f"robots.txt检查失败: {e}")
            return True, "检查失败，默认允许"
    
    def get_crawl_delay(self, url: str) -> int:
        """获取抓取延迟"""
        domain = URLUtils.get_domain(url)
        return self.crawl_delay.get(domain, 1)


# ============================================================================
# 内容解析器
# ============================================================================

class ContentParser:
    """内容解析器"""
    
    def __init__(self, config: CrawlerConfig):
        self.config = config
        # 确保配置项不是None
        if not self.config.image_types:
            self.config.image_types = ['jpg', 'png', 'webp', 'jpeg']
        if not self.config.audio_types:
            self.config.audio_types = ['mp3', 'wav', 'flac', 'aac']
        if not self.config.video_types:
            self.config.video_types = ['mp4', 'mov', 'avi', 'mkv']
        if not self.config.doc_types:
            self.config.doc_types = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']
    
    def parse_html(self, html: str, base_url: str) -> Dict[str, List[str]]:
        """解析HTML页面，提取各种内容链接"""
        soup = BeautifulSoup(html, 'html.parser')
        
        results = {
            'images': self._parse_images(soup, base_url),
            'audios': self._parse_audios(soup, base_url),
            'videos': self._parse_videos(soup, base_url),
            'documents': self._parse_documents(soup, base_url)
        }
        
        logger.info(f"解析完成: 图片{len(results['images'])}个, "
                   f"音频{len(results['audios'])}个, "
                   f"视频{len(results['videos'])}个, "
                   f"文档{len(results['documents'])}个")
        
        return results
    
    def _parse_images(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """解析图片链接"""
        images = []

        # 提取img标签
        for img in soup.find_all('img'):
            for attr in ['src', 'data-src', 'data-original', 'srcset']:
                src = img.get(attr, '')
                if not src:
                    continue

                # 处理srcset
                if attr == 'srcset':
                    src = src.split(',')[0].split()[0]

                url = URLUtils.normalize_url(src, base_url)
                if not url:
                    continue

                ext = URLUtils.get_file_extension(url)

                # 过滤
                if ext not in self.config.image_types:
                    continue

                # 过滤Base64
                if url.startswith('data:image'):
                    continue

                if self.config.ignore_thumbnails and self._is_thumbnail(url, img):
                    continue

                images.append(url)

        # 提取background-image
        for element in soup.find_all(style=True):
            style = element.get('style', '')
            if not style:
                continue

            if 'background-image' in style.lower():
                import re
                matches = re.findall(r'url\([\'"]?([^\'")]+)[\'"]?\)', style)
                for match in matches:
                    url = URLUtils.normalize_url(match, base_url)
                    if not url:
                        continue

                    ext = URLUtils.get_file_extension(url)
                    if ext in self.config.image_types:
                        images.append(url)

        return list(set(images))
    
    def _is_thumbnail(self, url: str, img_element) -> bool:
        """判断是否为缩略图"""
        # 检查URL是否有效
        if not url or not isinstance(url, str):
            return False

        # 简单判断：URL中包含thumbnail、thumb等关键词
        keywords = ['thumb', 'thumbnail', 'small', 'mini', 'icon']
        url_lower = url.lower()
        return any(kw in url_lower for kw in keywords)
    
    def _parse_audios(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """解析音频链接"""
        audios = []

        # 提取audio标签
        for audio in soup.find_all('audio'):
            src = audio.get('src', '')
            if src:
                url = URLUtils.normalize_url(src, base_url)
                if url:
                    ext = URLUtils.get_file_extension(url)
                    if ext in self.config.audio_types:
                        audios.append(url)

            # 提取source标签
            for source in audio.find_all('source'):
                src = source.get('src', '')
                if src:
                    url = URLUtils.normalize_url(src, base_url)
                    if url:
                        ext = URLUtils.get_file_extension(url)
                        if ext in self.config.audio_types:
                            audios.append(url)

        # 提取a标签中的音频链接
        for a in soup.find_all('a', href=True):
            href = a.get('href', '')
            if not href:
                continue

            ext = URLUtils.get_file_extension(href)
            if ext in self.config.audio_types:
                url = URLUtils.normalize_url(href, base_url)
                if url:
                    audios.append(url)

        return list(set(audios))
    
    def _parse_videos(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """解析视频链接"""
        videos = []

        # 提取video标签
        for video in soup.find_all('video'):
            src = video.get('src', '')
            if src:
                url = URLUtils.normalize_url(src, base_url)
                if url:
                    ext = URLUtils.get_file_extension(url)
                    if ext in self.config.video_types:
                        videos.append(url)

            # 提取source标签
            for source in video.find_all('source'):
                src = source.get('src', '')
                if src:
                    url = URLUtils.normalize_url(src, base_url)
                    if url:
                        ext = URLUtils.get_file_extension(url)
                        if ext in self.config.video_types:
                            videos.append(url)

        # 提取a标签中的视频链接
        for a in soup.find_all('a', href=True):
            href = a.get('href', '')
            if not href:
                continue

            ext = URLUtils.get_file_extension(href)
            if ext in self.config.video_types:
                url = URLUtils.normalize_url(href, base_url)
                if url:
                    videos.append(url)

        return list(set(videos))
    
    def _parse_documents(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """解析文档链接"""
        documents = []

        # 提取a标签中的文档链接
        for a in soup.find_all('a', href=True):
            href = a.get('href', '')
            if not href:
                continue

            ext = URLUtils.get_file_extension(href)
            if ext in self.config.doc_types:
                url = URLUtils.normalize_url(href, base_url)
                if url:
                    documents.append(url)

        return list(set(documents))


# ============================================================================
# 存储管理器
# ============================================================================

class StorageManager:
    """存储管理器抽象类"""
    
    def save_file(self, content: bytes, filename: str, content_type: str, url: str, 
                  index: int, domain: str, date_str: str) -> Dict:
        """保存文件"""
        raise NotImplementedError
    
    def save_metadata(self, metadata: Dict):
        """保存元数据"""
        raise NotImplementedError


class LocalStorageManager(StorageManager):
    """本地存储管理器"""
    
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
    
    def save_file(self, content: bytes, filename: str, content_type: str, url: str, 
                  index: int, domain: str, date_str: str) -> Dict:
        """保存文件到本地"""
        try:
            # 创建目录
            save_dir = os.path.join(self.output_dir, domain, date_str, content_type)
            os.makedirs(save_dir, exist_ok=True)
            
            # 生成文件名
            file_ext = URLUtils.get_file_extension(url) or filename.split('.')[-1]
            file_name = f"{index}_{filename}.{file_ext}"
            file_path = os.path.join(save_dir, file_name)
            
            # 检查文件大小
            if len(content) < 10 * 1024:  # 小于10KB的缩略图
                logger.warning(f"文件过小，跳过: {file_name} ({len(content)} bytes)")
                return {'success': False, 'reason': 'file_too_small'}
            
            # 保存文件
            with open(file_path, 'wb') as f:
                f.write(content)
            
            logger.info(f"文件保存成功: {file_path}")
            
            return {
                'success': True,
                'path': file_path,
                'size': len(content),
                'type': content_type
            }
            
        except Exception as e:
            logger.error(f"文件保存失败: {e}")
            return {'success': False, 'reason': str(e)}


# ============================================================================
# 主爬虫类
# ============================================================================

class WebCrawler:
    """主爬虫类"""
    
    def __init__(self, config: CrawlerConfig):
        self.config = config
        # 确保配置项不是None
        if not self.config.image_types:
            self.config.image_types = ['jpg', 'png', 'webp', 'jpeg']
        if not self.config.audio_types:
            self.config.audio_types = ['mp3', 'wav', 'flac', 'aac']
        if not self.config.video_types:
            self.config.video_types = ['mp4', 'mov', 'avi', 'mkv']
        if not self.config.doc_types:
            self.config.doc_types = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']
        self.parser = ContentParser(config)
        self.dedup = DeduplicationManager()
        self.robots_checker = RobotsChecker()
        self.storage = self._init_storage()
        
        # 统计信息
        self.stats = {
            'total_pages': 0,
            'success_downloads': 0,
            'failed_downloads': 0,
            'skipped_duplicates': 0,
            'skipped_too_small': 0,
            'downloaded_content': {}
        }
        
        # 元数据列表
        self.metadata_list = []
    
    def _init_storage(self) -> StorageManager:
        """初始化存储管理器"""
        if self.config.storage_mode == 'local':
            return LocalStorageManager(self.config.output_dir)
        else:
            raise NotImplementedError(f"存储模式 {self.config.storage_mode} 暂未实现")
    
    def _get_session(self) -> requests.Session:
        """创建请求会话"""
        session = requests.Session()
        session.headers.update({
            'User-Agent': random.choice(self.config.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
        })
        return session
    
    def _fetch_page(self, url: str) -> Optional[str]:
        """获取页面内容"""
        # 检查robots.txt
        if self.config.check_robots:
            allowed, message = self.robots_checker.check(url)
            if not allowed:
                logger.warning(f"{url} {message}")
                return None
            logger.info(f"{url} {message}")
        
        # 请求延时
        if self.config.respect_rate_limit:
            delay = random.uniform(*self.config.delay_range)
            logger.debug(f"等待 {delay:.2f} 秒...")
            time.sleep(delay)
        
        session = self._get_session()
        
        # 重试逻辑
        for attempt in range(self.config.max_retries + 1):
            try:
                response = session.get(
                    url,
                    timeout=self.config.timeout,
                    allow_redirects=self.config.allow_redirects
                )
                
                if response.status_code == 200:
                    self.stats['total_pages'] += 1
                    return response.text
                else:
                    logger.warning(f"请求失败: {url}, 状态码: {response.status_code}")
                    
            except requests.exceptions.Timeout:
                logger.warning(f"请求超时: {url}, 尝试 {attempt + 1}/{self.config.max_retries}")
            except Exception as e:
                logger.warning(f"请求异常: {url}, 错误: {e}")
            
            if attempt < self.config.max_retries:
                time.sleep(2 ** attempt)
        
        return None
    
    def _download_file(self, url: str, content_type: str, index: int) -> Optional[Dict]:
        """下载文件"""
        # 去重检查
        if self.dedup.add_url(url):
            logger.debug(f"URL已存在，跳过: {url}")
            self.stats['skipped_duplicates'] += 1
            return None
        
        session = self._get_session()
        
        try:
            response = session.get(url, timeout=self.config.timeout, stream=True)
            response.raise_for_status()
            
            # 读取内容
            content = b''
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    content += chunk
            
            # 内容去重
            if self.dedup.add_content(content):
                logger.debug(f"内容已存在，跳过: {url}")
                self.stats['skipped_duplicates'] += 1
                return None
            
            # 存储文件
            domain = URLUtils.get_domain(url)
            date_str = datetime.now().strftime('%Y%m%d')
            
            result = self.storage.save_file(
                content=content,
                filename=f'{index}',
                content_type=content_type,
                url=url,
                index=index,
                domain=domain,
                date_str=date_str
            )
            
            if result.get('success'):
                self.stats['success_downloads'] += 1
                
                # 记录元数据
                metadata = {
                    'url': url,
                    'content_type': content_type,
                    'file_path': result['path'],
                    'file_size': result['size'],
                    'download_time': datetime.now().isoformat(),
                    'domain': domain
                }
                self.metadata_list.append(metadata)
                
                return metadata
            else:
                self.stats['failed_downloads'] += 1
                if result.get('reason') == 'file_too_small':
                    self.stats['skipped_too_small'] += 1
                
        except Exception as e:
            logger.error(f"下载失败: {url}, 错误: {e}")
            self.stats['failed_downloads'] += 1
        
        return None
    
    def crawl(self) -> Dict:
        """执行爬取任务"""
        logger.info("=" * 60)
        logger.info("爬虫任务启动")
        logger.info("=" * 60)

        start_time = time.time()

        # 检查urls配置
        if not self.config.urls:
            logger.warning("没有配置URL列表，爬取结束")
            elapsed_time = time.time() - start_time
            report = {
                'stats': self.stats,
                'metadata': self.metadata_list,
                'dedup_stats': self.dedup.get_stats(),
                'elapsed_time': elapsed_time,
                'success_rate': '0.00%'
            }
            self._generate_report(report)
            return report

        # 处理每个URL
        for url in self.config.urls:
            if not url:  # 跳过空URL
                logger.warning("跳过空URL")
                continue

            logger.info(f"开始爬取: {url}")
            
            # 获取页面
            html = self._fetch_page(url)
            if not html:
                logger.warning(f"无法获取页面: {url}")
                continue
            
            # 解析内容
            contents = self.parser.parse_html(html, url)
            
            # 下载内容
            total_index = 0
            
            for content_type, urls in contents.items():
                logger.info(f"开始下载 {content_type}: {len(urls)} 个文件")
                
                for i, content_url in enumerate(urls):
                    total_index += 1
                    self._download_file(content_url, content_type, total_index)
        
        # 生成报告
        elapsed_time = time.time() - start_time
        
        report = {
            'stats': self.stats,
            'metadata': self.metadata_list,
            'dedup_stats': self.dedup.get_stats(),
            'elapsed_time': elapsed_time,
            'success_rate': f"{self.stats['success_downloads'] / max(self.stats['success_downloads'] + self.stats['failed_downloads'], 1) * 100:.2f}%"
        }
        
        self._generate_report(report)
        
        logger.info("=" * 60)
        logger.info("爬虫任务完成")
        logger.info(f"总耗时: {elapsed_time:.2f} 秒")
        logger.info(f"成功下载: {self.stats['success_downloads']} 个")
        logger.info(f"失败: {self.stats['failed_downloads']} 个")
        logger.info(f"跳过重复: {self.stats['skipped_duplicates']} 个")
        logger.info("=" * 60)
        
        return report
    
    def _generate_report(self, report: Dict):
        """生成爬取报告"""
        if not self.config.enable_report:
            return
        
        if not self.metadata_list:
            logger.warning("没有元数据，跳过报告生成")
            return
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        try:
            if self.config.report_format == 'csv':
                df = pd.DataFrame(self.metadata_list)
                report_path = f'crawler_report_{timestamp}.csv'
                df.to_csv(report_path, index=False, encoding='utf-8-sig')
                logger.info(f"CSV报告已生成: {report_path}")
                
            elif self.config.report_format == 'excel':
                df = pd.DataFrame(self.metadata_list)
                report_path = f'crawler_report_{timestamp}.xlsx'
                df.to_excel(report_path, index=False)
                logger.info(f"Excel报告已生成: {report_path}")
                
            elif self.config.report_format == 'txt':
                report_path = f'crawler_report_{timestamp}.txt'
                with open(report_path, 'w', encoding='utf-8') as f:
                    f.write("爬取报告\n")
                    f.write("=" * 60 + "\n\n")
                    f.write(f"生成时间: {datetime.now().isoformat()}\n")
                    f.write(f"总耗时: {report['elapsed_time']:.2f} 秒\n\n")
                    f.write("统计信息:\n")
                    for key, value in report['stats'].items():
                        f.write(f"  {key}: {value}\n")
                    f.write("\n" + "=" * 60 + "\n\n")
                    f.write("下载详情:\n")
                    for meta in self.metadata_list:
                        f.write(f"\nURL: {meta['url']}\n")
                        f.write(f"类型: {meta['content_type']}\n")
                        f.write(f"路径: {meta['file_path']}\n")
                        f.write(f"大小: {meta['file_size']} bytes\n")
                        f.write(f"时间: {meta['download_time']}\n")
                logger.info(f"TXT报告已生成: {report_path}")
                
        except Exception as e:
            logger.error(f"报告生成失败: {e}")


# ============================================================================
# 命令行接口
# ============================================================================

def main():
    """命令行入口"""
    parser = argparse.ArgumentParser(description='工程级多类型内容爬取工具')
    
    # 基本参数
    parser.add_argument('urls', nargs='+', help='要爬取的URL列表')
    parser.add_argument('--output-dir', default='./crawled_content', help='输出目录')
    parser.add_argument('--format', choices=['csv', 'excel', 'txt'], default='csv', help='报告格式')
    
    # 内容类型筛选
    parser.add_argument('--image-types', nargs='+', default=['jpg', 'png', 'webp'], help='图片类型')
    parser.add_argument('--audio-types', nargs='+', default=['mp3', 'wav', 'flac'], help='音频类型')
    parser.add_argument('--video-types', nargs='+', default=['mp4', 'mov', 'avi'], help='视频类型')
    parser.add_argument('--doc-types', nargs='+', default=['pdf', 'doc', 'docx'], help='文档类型')
    
    # 其他参数
    parser.add_argument('--no-robots', action='store_true', help='跳过robots.txt检查')
    parser.add_argument('--no-report', action='store_true', help='不生成报告')
    parser.add_argument('--min-size', type=int, default=10240, help='最小文件大小(字节)')
    
    args = parser.parse_args()
    
    # 创建配置
    config = CrawlerConfig(
        urls=args.urls,
        output_dir=args.output_dir,
        report_format=args.format,
        image_types=args.image_types,
        audio_types=args.audio_types,
        video_types=args.video_types,
        doc_types=args.doc_types,
        min_image_size=args.min_size,
        check_robots=not args.no_robots,
        enable_report=not args.no_report
    )
    
    # 执行爬取
    crawler = WebCrawler(config)
    crawler.crawl()


if __name__ == '__main__':
    main()
