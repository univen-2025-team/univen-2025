# RSS Sources Configuration for Vietnamese Financial News
# Each source has URL, name, domain, category, and scrape config

from typing import Dict, Any

RSS_FEEDS: Dict[str, Dict[str, Any]] = {
    # ═══════════════════════════════════════════════════════════════════
    # CHỨNG KHOÁN (Stock Market) - Priority: HIGH
    # ═══════════════════════════════════════════════════════════════════
    'cafef_ck': {
        'url': 'https://cafef.vn/thi-truong-chung-khoan.rss',
        'name': 'CafeF',
        'domain': 'cafef.vn',
        'category': 'stock',
        'priority': 1,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.detail-content', '.content_detail', '.knc-content'],
            'author_selectors': ['.author span', '.author-name', '.source-copyright'],
            'image_selectors': ['.detail-content img', 'figure img', 'article img'],
            'date_selectors': ['.dateandcatdetail', '.pdate', '.time'],
        }
    },
    'vnbusiness_ck': {
        'url': 'https://vnbusiness.vn/rss/chung-khoan.rss',
        'name': 'VnBusiness',
        'domain': 'vnbusiness.vn',
        'category': 'stock',
        'priority': 2,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.content-detail', '.article-content', '.entry-content'],
            'author_selectors': ['.author-name', '.author', '.source'],
            'image_selectors': ['.content-detail img', 'article img'],
            'date_selectors': ['.date', '.time-post'],
        }
    },
    'vneconomy_ck': {
        'url': 'https://vneconomy.vn/rss/chung-khoan.rss',
        'name': 'VnEconomy',
        'domain': 'vneconomy.vn',
        'category': 'stock',
        'priority': 2,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.detail__content', '.article-content', '.content'],
            'author_selectors': ['.detail__author', '.author-name', '.source'],
            'image_selectors': ['.detail__content img', 'article img'],
            'date_selectors': ['.detail__time', '.date'],
        }
    },
    'vnbusiness_cp': {
        'url': 'https://vnbusiness.vn/rss/co-phieu.rss',
        'name': 'VnBusiness',
        'domain': 'vnbusiness.vn',
        'category': 'stock',
        'priority': 2,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.content-detail', '.article-content'],
            'author_selectors': ['.author-name', '.author'],
            'image_selectors': ['.content-detail img'],
            'date_selectors': ['.date', '.time-post'],
        }
    },

    # ═══════════════════════════════════════════════════════════════════
    # TÀI CHÍNH (Finance) - Priority: HIGH
    # ═══════════════════════════════════════════════════════════════════
    'cafef_tcnh': {
        'url': 'https://cafef.vn/tai-chinh-ngan-hang.rss',
        'name': 'CafeF',
        'domain': 'cafef.vn',
        'category': 'finance',
        'priority': 1,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.detail-content', '.content_detail', '.knc-content'],
            'author_selectors': ['.author span', '.author-name'],
            'image_selectors': ['.detail-content img', 'figure img'],
            'date_selectors': ['.dateandcatdetail', '.pdate'],
        }
    },
    'vnbusiness_tc': {
        'url': 'https://vnbusiness.vn/rss/tai-chinh.rss',
        'name': 'VnBusiness',
        'domain': 'vnbusiness.vn',
        'category': 'finance',
        'priority': 2,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.content-detail', '.article-content'],
            'author_selectors': ['.author-name', '.author'],
            'image_selectors': ['.content-detail img'],
            'date_selectors': ['.date'],
        }
    },
    'vneconomy_tc': {
        'url': 'https://vneconomy.vn/rss/tai-chinh.rss',
        'name': 'VnEconomy',
        'domain': 'vneconomy.vn',
        'category': 'finance',
        'priority': 2,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.detail__content', '.article-content'],
            'author_selectors': ['.detail__author', '.author-name'],
            'image_selectors': ['.detail__content img'],
            'date_selectors': ['.detail__time'],
        }
    },
    'vnbusiness_nh': {
        'url': 'https://vnbusiness.vn/rss/ngan-hang.rss',
        'name': 'VnBusiness',
        'domain': 'vnbusiness.vn',
        'category': 'finance',
        'priority': 2,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.content-detail', '.article-content'],
            'author_selectors': ['.author-name'],
            'image_selectors': ['.content-detail img'],
            'date_selectors': ['.date'],
        }
    },

    # ═══════════════════════════════════════════════════════════════════
    # KINH DOANH (Business) - Priority: MEDIUM
    # ═══════════════════════════════════════════════════════════════════
    'vnexpress_kd': {
        'url': 'https://vnexpress.net/rss/kinh-doanh.rss',
        'name': 'VnExpress',
        'domain': 'vnexpress.net',
        'category': 'business',
        'priority': 1,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['article.fck_detail', '.article-content', '.content_detail'],
            'author_selectors': ['.author-name', '.author span', '.source'],
            'image_selectors': ['article.fck_detail img', '.img-content img', 'figure img'],
            'date_selectors': ['.date', '.time'],
        }
    },
    'cafef_dn': {
        'url': 'https://cafef.vn/doanh-nghiep.rss',
        'name': 'CafeF',
        'domain': 'cafef.vn',
        'category': 'business',
        'priority': 1,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.detail-content', '.content_detail'],
            'author_selectors': ['.author span', '.author-name'],
            'image_selectors': ['.detail-content img', 'figure img'],
            'date_selectors': ['.dateandcatdetail'],
        }
    },
    'vnbusiness_dn': {
        'url': 'https://vnbusiness.vn/rss/doanh-nghiep.rss',
        'name': 'VnBusiness',
        'domain': 'vnbusiness.vn',
        'category': 'business',
        'priority': 2,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.content-detail', '.article-content'],
            'author_selectors': ['.author-name'],
            'image_selectors': ['.content-detail img'],
            'date_selectors': ['.date'],
        }
    },
    'vnbusiness_tt': {
        'url': 'https://vnbusiness.vn/rss/thi-truong.rss',
        'name': 'VnBusiness',
        'domain': 'vnbusiness.vn',
        'category': 'business',
        'priority': 2,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.content-detail', '.article-content'],
            'author_selectors': ['.author-name'],
            'image_selectors': ['.content-detail img'],
            'date_selectors': ['.date'],
        }
    },

    # ═══════════════════════════════════════════════════════════════════
    # BẤT ĐỘNG SẢN (Real Estate) - Priority: LOW
    # ═══════════════════════════════════════════════════════════════════
    'cafef_bds': {
        'url': 'https://cafef.vn/bat-dong-san.rss',
        'name': 'CafeF',
        'domain': 'cafef.vn',
        'category': 'realestate',
        'priority': 3,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.detail-content', '.content_detail'],
            'author_selectors': ['.author span'],
            'image_selectors': ['.detail-content img'],
            'date_selectors': ['.dateandcatdetail'],
        }
    },
    'vnbusiness_bds': {
        'url': 'https://vnbusiness.vn/rss/bat-dong-san.rss',
        'name': 'VnBusiness',
        'domain': 'vnbusiness.vn',
        'category': 'realestate',
        'priority': 3,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.content-detail', '.article-content'],
            'author_selectors': ['.author-name'],
            'image_selectors': ['.content-detail img'],
            'date_selectors': ['.date'],
        }
    },

    # ═══════════════════════════════════════════════════════════════════
    # TIN TỔNG HỢP (General News) - Priority: LOW
    # ═══════════════════════════════════════════════════════════════════
    'tuoitre_kd': {
        'url': 'https://tuoitre.vn/rss/kinh-doanh.rss',
        'name': 'Tuổi Trẻ',
        'domain': 'tuoitre.vn',
        'category': 'business',
        'priority': 3,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['#main-detail-body', '.detail-content', '.content-detail'],
            'author_selectors': ['.author-name', '.author'],
            'image_selectors': ['#main-detail-body img', '.detail-content img'],
            'date_selectors': ['.date-time', '.date'],
        }
    },
    'thanhnien_kt': {
        'url': 'https://thanhnien.vn/rss/kinh-te.rss',
        'name': 'Thanh Niên',
        'domain': 'thanhnien.vn',
        'category': 'business',
        'priority': 3,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.detail-content', '.article-content', '.content'],
            'author_selectors': ['.author-info .name', '.author-name', '.author'],
            'image_selectors': ['.detail-content img', 'article img'],
            'date_selectors': ['.date', '.time'],
        }
    },
    'kinhtedothi_ck': {
        'url': 'https://kinhtedothi.vn/rss/chung-khoan.rss',
        'name': 'Kinh tế Đô thị',
        'domain': 'kinhtedothi.vn',
        'category': 'stock',
        'priority': 3,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.detail-content', '.article-content'],
            'author_selectors': ['.author-name', '.author'],
            'image_selectors': ['.detail-content img'],
            'date_selectors': ['.date'],
        }
    },
    'kinhtedothi_tc': {
        'url': 'https://kinhtedothi.vn/rss/tai-chinh.rss',
        'name': 'Kinh tế Đô thị',
        'domain': 'kinhtedothi.vn',
        'category': 'finance',
        'priority': 3,
        'enabled': True,
        'scrape_config': {
            'content_selectors': ['.detail-content', '.article-content'],
            'author_selectors': ['.author-name'],
            'image_selectors': ['.detail-content img'],
            'date_selectors': ['.date'],
        }
    },
}


def get_enabled_feeds() -> Dict[str, Dict[str, Any]]:
    """Get only enabled RSS feeds."""
    return {k: v for k, v in RSS_FEEDS.items() if v.get('enabled', True)}


def get_feeds_by_category(category: str) -> Dict[str, Dict[str, Any]]:
    """Get RSS feeds by category (stock, finance, business, realestate)."""
    return {k: v for k, v in RSS_FEEDS.items() if v.get('category') == category and v.get('enabled', True)}


def get_feeds_by_priority(max_priority: int = 2) -> Dict[str, Dict[str, Any]]:
    """Get RSS feeds with priority <= max_priority (1=highest)."""
    return {k: v for k, v in RSS_FEEDS.items() if v.get('priority', 999) <= max_priority and v.get('enabled', True)}


def get_scrape_config(domain: str) -> Dict[str, Any]:
    """Get scrape config for a domain."""
    for feed in RSS_FEEDS.values():
        if feed.get('domain') == domain:
            return feed.get('scrape_config', {})
    return {}
