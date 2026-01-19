
import os
import json
import random
import re
import urllib.request
from datetime import datetime, timedelta

# Configuration
LESSON_DIR = "client/src/lib/lesson"
OUTPUT_FILE = "client/src/lib/generated-lessons.ts"

# Mock Data Helpers
SYMBOLS = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "DOT"]
VOLATILITY_TYPES = ["strong_up", "strong_down", "volatile", "sideways"]
DIFFICULTY = ["beginner", "intermediate", "advanced"]

def extract_frontmatter(content):
    """
    Extracts YAML-like frontmatter.
    """
    match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    if match:
        frontmatter_raw = match.group(1)
        data = {}
        for line in frontmatter_raw.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                data[key.strip()] = value.strip().strip('"').strip("'")
        return data, content[match.end():]
    return {}, content

def generate_mock_data():
    lessons = []
    
    if not os.path.exists(LESSON_DIR):
        print(f"Directory not found: {LESSON_DIR}")
        return

    files = [f for f in os.listdir(LESSON_DIR) if f.endswith('.md')]
    print(f"Found {len(files)} markdown files.")

    for i, filename in enumerate(files):
        filepath = os.path.join(LESSON_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            raw_content = f.read()

        frontmatter, content = extract_frontmatter(raw_content)
        title = frontmatter.get('title', filename.replace('.md', '').replace('-', ' ').title())
        lesson_id = f"gen-{i+1}"
        
        # Heuristic for summary: take first non-empty paragraph after headers
        # Extract first image if available
        # Prefer http/https urls over data: URIs
        image_matches = re.findall(r'!\[.*?\]\((.*?)\)', content)
        image_url = None
        for img in image_matches:
            if img.startswith('http'):
                image_url = img
                break
        
        if not image_url and image_matches:
            image_url = image_matches[0]

        # Download image locally to avoid hotlink protection
        if image_url and image_url.startswith('http'):
            try:
                # Create directory if not exists (redundant but safe)
                output_dir = "client/public/images/lessons"
                if not os.path.exists(output_dir):
                    os.makedirs(output_dir)
                
                # Generate filename
                ext = image_url.split('.')[-1]
                if len(ext) > 4 or '/' in ext: ext = 'jpg'
                local_filename = f"{lesson_id}.{ext}"
                local_path = os.path.join(output_dir, local_filename)
                
                # Download with User-Agent to match browser
                opener = urllib.request.build_opener()
                opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36')]
                urllib.request.install_opener(opener)
                
                if not os.path.exists(local_path):
                     urllib.request.urlretrieve(image_url, local_path)
                     print(f"Downloaded image for {lesson_id}")
                
                # Update image_url to local path
                image_url = f"/images/lessons/{local_filename}"
            except Exception as e:
                print(f"Failed to download image: {e}")
                
                # Create directory if not exists (redundant but safe)
                output_dir = "client/public/images/lessons"
                if not os.path.exists(output_dir):
                    os.makedirs(output_dir)
                
                # Generate filename
                ext = image_url.split('.')[-1]
                if len(ext) > 4 or '/' in ext: ext = 'jpg'
                local_filename = f"{lesson_id}.{ext}"
                local_path = os.path.join(output_dir, local_filename)
                
                # Download with User-Agent to match browser
                opener = urllib.request.build_opener()
                opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36')]
                urllib.request.install_opener(opener)
                
                urllib.request.urlretrieve(image_url, local_path)
                
                # Update image_url to local path
                image_url = f"/images/lessons/{local_filename}"
                print(f"Downloaded image for {lesson_id}")
            except Exception as e:
                print(f"Failed to download image: {e}")

        # Remove base64 images from content to avoid displaying placeholders
        content = re.sub(r'!\[.*?\]\(data:image/.*?\)', '', content)

        # Remove headers
        clean_text = re.sub(r'#+\s.*', '', content)
        # Remove image links
        clean_text = re.sub(r'!\[.*?\]\(.*?\)', '', clean_text)
        # Split by newlines and find first substantial line
        paragraphs = [p.strip() for p in clean_text.split('\n') if len(p.strip()) > 50]
        news_summary = paragraphs[0][:150] + "..." if paragraphs else "Technical analysis lesson for crypto traders."

        # Key takeaways (dummy for now, or simple extraction)
        key_takeaways = [
            "Hiểu rõ khái niệm và cách sử dụng chỉ báo.",
            "Kết hợp với các công cụ khác để tăng độ chính xác.",
            "Luôn quản lý rủi ro khi giao dịch theo tín hiệu.",
            "Thực hành trên tài khoản demo trước khi trade thật."
        ]

        # Random Date within last 3 months
        random_days = random.randint(0, 90)
        event_date = (datetime.now() - timedelta(days=random_days)).strftime("%Y-%m-%d")

        lesson = {
            "id": f"gen-{i+1}",
            "symbol": random.choice(SYMBOLS),
            "event_date": event_date,
            "volatility_type": random.choice(VOLATILITY_TYPES),
            "news_summary": news_summary,
            "lesson_title": title,
            "lesson_content": raw_content.replace('`', '\\`'), # Escape backticks for JS template literal
            "key_takeaways": key_takeaways,
            "difficulty_level": random.choice(DIFFICULTY),
            "difficulty_level": random.choice(DIFFICULTY),
            "confidence_score": round(random.uniform(0.7, 0.99), 2),
            "image_url": image_url
        }
        lessons.append(lesson)

    # Generate TypeScript file content
    ts_content = 'import type { Lesson } from "./types"\n\n'
    ts_content += 'export const generatedLessons: Lesson[] = '
    # Use standard json dump but strip quotes around keys if we wanted to be fancy, 
    # but valid JSON is valid JS object literal, so it's fine.
    # We need to handle the template literal for lesson_content though to make it readable if possible,
    # but JSON.stringify is safer for correctness.
    
    # We'll use json.dumps for strict correctness, but then do a replace to use backticks for readability if feasible.
    # Actually, let's keep it simple: just valid JSON object structure.
    
    ts_content += json.dumps(lessons, indent=2, ensure_ascii=False)
    ts_content += ";\n"
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    print(f"Generated {OUTPUT_FILE} with {len(lessons)} lessons.")

if __name__ == "__main__":
    generate_mock_data()
