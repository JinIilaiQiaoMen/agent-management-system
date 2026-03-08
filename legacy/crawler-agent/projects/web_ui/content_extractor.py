"""
通用内容提取器

支持提取网页的标题、正文、图片、评论等内容
"""

import requests
from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup
from lxml import etree
from urllib.parse import urljoin, urlparse


class ContentExtractor:
    """通用网页内容提取器"""

    def __init__(self, url: str, headers: Optional[Dict[str, str]] = None):
        """
        初始化提取器

        Args:
            url: 目标URL
            headers: 请求头
        """
        self.url = url
        self.headers = headers or self._default_headers()
        self.html = None
        self.soup = None
        self.html_tree = None

    @staticmethod
    def _default_headers() -> Dict[str, str]:
        """默认请求头"""
        return {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        }

    def fetch(self) -> bool:
        """
        获取网页内容

        Returns:
            是否成功
        """
        try:
            response = requests.get(self.url, headers=self.headers, timeout=10)
            response.raise_for_status()
            self.html = response.text
            self.soup = BeautifulSoup(self.html, 'lxml')
            self.html_tree = etree.HTML(self.html)
            return True
        except Exception as e:
            print(f"获取网页失败: {e}")
            return False

    def extract_title(self) -> str:
        """提取标题"""
        if not self.soup:
            return ""

        # 方法1: 从meta标签
        title_meta = self.soup.find('meta', property='og:title')
        if title_meta:
            return title_meta.get('content', '').strip()

        # 方法2: 从title标签
        title_tag = self.soup.find('title')
        if title_tag:
            return title_tag.get_text().strip()

        # 方法3: 从h1标签
        h1_tag = self.soup.find('h1')
        if h1_tag:
            return h1.get_text().strip()

        return ""

    def extract_content(self) -> str:
        """提取正文内容"""
        if not self.soup:
            return ""

        content_parts = []

        # 尝试多种正文选择器
        selectors = [
            'article',
            '.article-content',
            '.post-content',
            '.entry-content',
            '.content',
            '#content',
            '.rich_media_content',  # 微信公众号
            'main',
        ]

        for selector in selectors:
            content_div = self.soup.select_one(selector)
            if content_div:
                # 提取段落文本
                paragraphs = content_div.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                for p in paragraphs:
                    text = p.get_text().strip()
                    if text and len(text) > 10:  # 过滤过短的文本
                        content_parts.append(text)
                if content_parts:
                    break

        return '\n\n'.join(content_parts) if content_parts else ""

    def extract_images(self) -> List[Dict[str, Any]]:
        """提取图片信息"""
        if not self.soup:
            return []

        images = []

        # 查找所有img标签
        img_tags = self.soup.find_all('img')

        for idx, img_tag in enumerate(img_tags, 1):
            # 优先使用data-src
            img_url = img_tag.get('data-src') or img_tag.get('src', '')

            if not img_url:
                continue

            # 构造完整URL
            if not img_url.startswith('http'):
                img_url = urljoin(self.url, img_url)

            images.append({
                'id': idx,
                'url': img_url,
                'alt': img_tag.get('alt', ''),
                'title': img_tag.get('title', ''),
                'selected': False  # 默认不选中
            })

        # 限制图片数量
        return images[:100]

    def extract_comments(self) -> List[Dict[str, Any]]:
        """提取评论内容（通用方法）"""
        if not self.soup:
            return []

        comments = []

        # 尝试多种评论选择器
        selectors = [
            '.comment',
            '.comment-item',
            '.comment-content',
            '.review',
            '.review-content',
            '.reply',
            '.reply-content',
            '[data-comment]',
        ]

        comment_elements = []
        for selector in selectors:
            comment_elements = self.soup.select(selector)
            if comment_elements:
                break

        for idx, comment_elem in enumerate(comment_elements, 1):
            # 提取用户名
            username_elem = comment_elem.select_one('.username, .user-name, .author, .comment-author')
            username = username_elem.get_text().strip() if username_elem else f"用户{idx}"

            # 提取评论内容
            content_elem = comment_elem.select_one('.content, .text, .comment-text, p')
            content = content_elem.get_text().strip() if content_elem else ""

            # 提取时间
            time_elem = comment_elem.select_one('.time, .date, .comment-time, time')
            time_text = time_elem.get_text().strip() if time_elem else ""

            if content and len(content) > 5:
                comments.append({
                    'id': idx,
                    'username': username,
                    'content': content,
                    'time': time_text,
                    'selected': False  # 默认不选中
                })

        # 限制评论数量
        return comments[:50]

    def extract_all(self) -> Dict[str, Any]:
        """
        提取所有内容

        Returns:
            包含所有提取内容的字典
        """
        return {
            'url': self.url,
            'title': self.extract_title(),
            'content': self.extract_content(),
            'images': self.extract_images(),
            'comments': self.extract_comments(),
            'meta': {
                'image_count': len(self.extract_images()),
                'comment_count': len(self.extract_comments()),
                'content_length': len(self.extract_content())
            }
        }


class GenericCrawler:
    """通用爬虫 - 用于Web UI预览"""

    def __init__(self):
        """初始化爬虫"""
        self.extractor = None

    def preview(self, url: str) -> Optional[Dict[str, Any]]:
        """
        预览网页内容

        Args:
            url: 目标URL

        Returns:
            提取的内容字典
        """
        try:
            self.extractor = ContentExtractor(url)
            if not self.extractor.fetch():
                return None

            return self.extractor.extract_all()
        except Exception as e:
            print(f"预览失败: {e}")
            return None

    def download_selected(self, selection: Dict[str, Any], output_dir: str = './downloads') -> Dict[str, Any]:
        """
        下载选中的内容

        Args:
            selection: 用户选择的内容
            {
                'title': bool,  # 是否下载标题
                'content': bool,  # 是否下载正文
                'images': [1, 2, 3],  # 选中的图片ID列表
                'comments': [1, 2, 3],  # 选中的评论ID列表
            }
            output_dir: 输出目录

        Returns:
            下载结果
        """
        import os
        from pathlib import Path
        from datetime import datetime

        if not self.extractor:
            return {'success': False, 'message': '未加载内容'}

        results = {
            'success': True,
            'title_file': None,
            'content_file': None,
            'images_downloaded': [],
            'comments_file': None,
            'message': ''
        }

        # 创建输出目录
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        # 使用标题作为子目录名
        safe_title = self._sanitize_filename(self.extractor.extract_title() or 'unnamed')
        article_dir = output_path / safe_title
        article_dir.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        # 下载标题
        if selection.get('title', False):
            title_file = article_dir / f'title_{timestamp}.txt'
            with open(title_file, 'w', encoding='utf-8') as f:
                f.write(f"标题: {self.extractor.extract_title()}\n")
                f.write(f"来源: {self.url}\n")
                f.write(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            results['title_file'] = str(title_file)

        # 下载正文
        if selection.get('content', False):
            content_file = article_dir / f'content_{timestamp}.txt'
            with open(content_file, 'w', encoding='utf-8') as f:
                f.write(f"标题: {self.extractor.extract_title()}\n")
                f.write(f"来源: {self.url}\n")
                f.write(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("\n" + "="*60 + "\n\n")
                f.write(self.extractor.extract_content())
            results['content_file'] = str(content_file)

        # 下载选中的图片
        if selection.get('images'):
            images_dir = article_dir / 'images'
            images_dir.mkdir(exist_ok=True)

            all_images = self.extractor.extract_images()
            selected_image_ids = selection['images']

            for img_id in selected_image_ids:
                # 找到对应的图片
                img_data = next((img for img in all_images if img['id'] == img_id), None)
                if not img_data:
                    continue

                try:
                    # 下载图片
                    img_response = requests.get(img_data['url'], headers=self.extractor.headers, timeout=10)
                    img_response.raise_for_status()

                    # 确定文件扩展名
                    parsed_url = urlparse(img_data['url'])
                    path = parsed_url.path or ''
                    ext = path.split('.')[-1].lower() if '.' in path else 'jpg'

                    # 保存图片
                    img_file = images_dir / f"image_{img_id:03d}.{ext}"
                    with open(img_file, 'wb') as f:
                        f.write(img_response.content)

                    results['images_downloaded'].append(str(img_file))
                except Exception as e:
                    print(f"下载图片失败 [{img_id}]: {e}")

        # 下载选中的评论
        if selection.get('comments'):
            comments_file = article_dir / f'comments_{timestamp}.txt'
            all_comments = self.extractor.extract_comments()
            selected_comment_ids = selection['comments']

            with open(comments_file, 'w', encoding='utf-8') as f:
                f.write(f"标题: {self.extractor.extract_title()}\n")
                f.write(f"来源: {self.url}\n")
                f.write(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("\n" + "="*60 + "\n\n")

                for comment_id in selected_comment_ids:
                    comment_data = next((c for c in all_comments if c['id'] == comment_id), None)
                    if comment_data:
                        f.write(f"【评论 {comment_id}】\n")
                        f.write(f"用户: {comment_data['username']}\n")
                        if comment_data['time']:
                            f.write(f"时间: {comment_data['time']}\n")
                        f.write(f"内容: {comment_data['content']}\n")
                        f.write("\n" + "-"*40 + "\n\n")

            results['comments_file'] = str(comments_file)

        results['message'] = f"下载完成到: {article_dir}"
        return results

    @staticmethod
    def _sanitize_filename(filename: str) -> str:
        """清理文件名"""
        invalid_chars = '<>:"/\\|?*\r\n'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        return filename[:100]  # 限制长度
