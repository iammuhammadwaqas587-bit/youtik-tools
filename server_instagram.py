#!/usr/bin/env python3
import sys
import json
import subprocess
import re

def clean_error_text(err):
    lines = err.splitlines()
    clean_lines = [
        line for line in lines 
        if not line.startswith("Deprecated Feature:") 
        and not "Confirm you are on the latest version" in line
        and not "please report this issue" in line
        and not "[parth-dl]" in line
    ]
    cleaned = " ".join(clean_lines).strip()
    
    if "unauthorized" in cleaned.lower() or "login" in cleaned.lower() or "401" in cleaned or "403" in cleaned or "failed after" in cleaned.lower():
        return "This Instagram post or Reel is private, restricted, or requires an Instagram login. Please ensure the link is to a public post."
    
    return cleaned or "Unable to extract Instagram post. Please verify the link is public."

def extract_instagram(url):
    clean_url = url.strip()
    clean_url = re.sub(r'([?&])(igsh|utm_[^=]+)=[^&]*', '', clean_url).rstrip('&? ')
    
    cmd = [sys.executable, "-m", "server_parth_dl.cli", "--json", clean_url]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if proc.returncode == 0 and proc.stdout.strip():
            stdout_text = proc.stdout.strip()
            first_brace = stdout_text.find('{')
            if first_brace != -1:
                stdout_text = stdout_text[first_brace:]
            data = json.loads(stdout_text)
            
            # Format normalized response
            entries = data.get("entries", [])
            files = []
            
            for idx, entry in enumerate(entries):
                kind = entry.get("kind", "image")
                formats = entry.get("formats", [])
                best_format = formats[0] if formats else {}
                url_direct = best_format.get("url") or data.get("thumbnail")
                width = best_format.get("width")
                height = best_format.get("height")
                res_str = f"{width}x{height}" if width and height else ("1080p HD" if kind == "video" else "Original Quality")
                
                files.append({
                    "id": f"ig-{data.get('id', 'post')}-{idx + 1}",
                    "index": idx + 1,
                    "type": kind,
                    "thumbnail": data.get("thumbnail") or url_direct,
                    "downloadUrl": url_direct,
                    "width": width,
                    "height": height,
                    "resolution": res_str,
                    "filename": f"Instagram_{data.get('uploader', 'creator')}_{data.get('id', 'post')}_{idx + 1}.{'mp4' if kind == 'video' else 'jpg'}"
                })
            
            return {
                "success": True,
                "platform": "instagram",
                "id": data.get("id"),
                "title": (data.get("title") or "Instagram Post").strip(),
                "author": f"@{data.get('uploader')}" if data.get("uploader") else "@instagram_user",
                "thumbnail": data.get("thumbnail"),
                "isMultiple": len(files) > 1,
                "totalFiles": len(files),
                "files": files
            }
        else:
            err = proc.stderr or proc.stdout or "Extraction failed"
            return {"success": False, "error": clean_error_text(err)}
    except Exception as e:
        return {"success": False, "error": clean_error_text(str(e))}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Missing URL"}))
        sys.exit(1)
    url = sys.argv[1]
    res = extract_instagram(url)
    print(json.dumps(res))
