#!/usr/bin/env python3
import sys
import json
import subprocess
import os
import re
import urllib.request
import urllib.parse

def clean_error_text(err):
    """Filter out Python deprecation warnings and internal logs."""
    lines = err.splitlines()
    clean_lines = [
        line for line in lines 
        if not line.startswith("Deprecated Feature:") 
        and not "Confirm you are on the latest version" in line
        and not "please report this issue" in line
    ]
    cleaned = " ".join(clean_lines).strip()
    
    if "login" in cleaned.lower() or "unsupported url" in cleaned.lower() or "cannot parse data" in cleaned.lower():
        return "This Facebook video or Reel is private, restricted to logged-in users, or no longer available. Please ensure the link is to a public Facebook post."
    
    return cleaned or "Unable to extract Facebook video. Make sure the video is public."

def normalize_facebook_url(url):
    """Normalize various Facebook URL formats into canonical watch/reel URL."""
    clean = url.strip()
    
    # Extract fbid or v param
    fbid_match = re.search(r'[?&](?:fbid|v)=(\d+)', clean)
    if fbid_match:
        video_id = fbid_match.group(1)
        return f"https://www.facebook.com/watch/?v={video_id}", video_id

    # Extract ID from /videos/12345/ or /reel/12345/
    path_id_match = re.search(r'/(?:videos|reel)/(\d+)', clean)
    if path_id_match:
        video_id = path_id_match.group(1)
        return f"https://www.facebook.com/watch/?v={video_id}", video_id

    # Strip extra tracking parameters
    clean = re.sub(r'([?&])(_fb_noscript|ref|sfnsn|mibextid|fs)=[^&]*', '', clean)
    clean = clean.rstrip('&? ')
    return clean, None

def extract_from_html(url, video_id=None):
    """Fallback extractor scraping public HTML for direct mp4 links."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # Unescape html
            html = html.replace('\\/', '/').replace('&amp;', '&').replace('&quot;', '"')
            
            # Find SD/HD URLs
            hd_match = (
                re.search(r'"browser_native_hd_url":"([^"]+)"', html) or
                re.search(r'"playable_url_quality_hd":"([^"]+)"', html) or
                re.search(r'hd_src:"([^"]+)"', html)
            )
            sd_match = (
                re.search(r'"browser_native_sd_url":"([^"]+)"', html) or
                re.search(r'"playable_url":"([^"]+)"', html) or
                re.search(r'sd_src:"([^"]+)"', html)
            )
            
            best_url = (hd_match.group(1) if hd_match else None) or (sd_match.group(1) if sd_match else None)
            
            if best_url:
                title_match = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', html)
                og_title = re.search(r'property="og:title"\s+content="([^"]+)"', html)
                og_image = re.search(r'property="og:image"\s+content="([^"]+)"', html)
                
                title = (title_match.group(1) if title_match else (og_title.group(1) if og_title else "Facebook Video"))
                thumb = og_image.group(1) if og_image else ""
                vid = video_id or "video"
                
                return {
                    "success": True,
                    "platform": "facebook",
                    "id": vid,
                    "title": title.strip(),
                    "author": "Facebook Creator",
                    "thumbnail": thumb,
                    "isMultiple": False,
                    "totalFiles": 1,
                    "files": [{
                        "id": f"fb-{vid}-1",
                        "index": 1,
                        "type": "video",
                        "thumbnail": thumb,
                        "downloadUrl": best_url,
                        "resolution": "1080p Full HD" if hd_match else "Standard Quality",
                        "filename": f"Facebook_Video_{vid}.mp4"
                    }]
                }
    except Exception:
        pass
    return None

def extract_facebook(url):
    normalized_url, video_id = normalize_facebook_url(url)
    
    yt_dlp_bin = os.path.abspath("./yt-dlp")
    if not os.path.exists(yt_dlp_bin):
        yt_dlp_bin = "yt-dlp"
        
    cmd = [
        yt_dlp_bin, 
        "-J", 
        "--no-warnings",
        "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        normalized_url
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if proc.returncode == 0 and proc.stdout.strip():
            stdout_text = proc.stdout.strip()
            first_brace = stdout_text.find('{')
            if first_brace != -1:
                stdout_text = stdout_text[first_brace:]
            data = json.loads(stdout_text)
            
            title = data.get("fulltitle") or data.get("title") or "Facebook Video"
            author = data.get("uploader") or "Facebook Creator"
            thumbnail = data.get("thumbnail") or ""
            vid = str(data.get("id") or video_id or "video")
            
            formats = data.get("formats", [])
            prog = [f for f in formats if f.get("vcodec") != "none" and f.get("acodec") != "none"]
            
            hd_format = next((f for f in prog if f.get("format_id") == "hd"), None)
            best_format = hd_format or (prog[-1] if prog else None)
            
            if not best_format and formats:
                with_url = [f for f in formats if f.get("url")]
                if with_url:
                    best_format = with_url[-1]
            
            direct_url = (best_format or {}).get("url") or data.get("url")
            resolution = (best_format or {}).get("resolution") or data.get("resolution") or "1080p Full HD"
            
            files = []
            if direct_url:
                files.append({
                    "id": f"fb-{vid}-1",
                    "index": 1,
                    "type": "video",
                    "thumbnail": thumbnail,
                    "downloadUrl": direct_url,
                    "resolution": resolution,
                    "filename": f"Facebook_{author.replace(' ', '_')}_{vid}.mp4"
                })
            
            entries = data.get("entries")
            if entries and isinstance(entries, list):
                files = []
                for idx, entry in enumerate(entries):
                    e_prog = [f for f in entry.get("formats", []) if f.get("vcodec") != "none" and f.get("acodec") != "none"]
                    e_best = e_prog[-1] if e_prog else (entry.get("formats", [{}])[-1] if entry.get("formats") else {})
                    e_url = e_best.get("url") or entry.get("url")
                    if e_url:
                        files.append({
                            "id": f"fb-{vid}-{idx + 1}",
                            "index": idx + 1,
                            "type": "video",
                            "thumbnail": entry.get("thumbnail") or thumbnail,
                            "downloadUrl": e_url,
                            "resolution": e_best.get("resolution") or "Original HD",
                            "filename": f"Facebook_{author.replace(' ', '_')}_{vid}_{idx + 1}.mp4"
                        })

            if files:
                return {
                    "success": True,
                    "platform": "facebook",
                    "id": vid,
                    "title": title.strip(),
                    "author": author,
                    "thumbnail": thumbnail,
                    "duration": data.get("duration"),
                    "isMultiple": len(files) > 1,
                    "totalFiles": len(files),
                    "files": files
                }

        # If yt-dlp couldn't extract, try direct HTML scraping fallback
        html_fallback = extract_from_html(normalized_url, video_id)
        if html_fallback:
            return html_fallback

        err = proc.stderr or proc.stdout or "Extraction failed"
        return {"success": False, "error": clean_error_text(err)}
    except Exception as e:
        return {"success": False, "error": clean_error_text(str(e))}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Missing URL"}))
        sys.exit(1)
    url = sys.argv[1]
    res = extract_facebook(url)
    print(json.dumps(res))
