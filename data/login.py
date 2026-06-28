import os
import sys
import subprocess

def setup_playwright():
    try:
        import playwright
    except ImportError:
        print("Playwright is not installed. Installing it now...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"])
        print("Installing Chromium browser binary...")
        subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
        print("Playwright setup complete.")

def main():
    setup_playwright()
    
    import json
    from playwright.sync_api import sync_playwright
    
    storage_state = os.getenv("LEETCODE_STORAGE_STATE") or "storage/leetcode-state.json"
    os.makedirs(os.path.dirname(storage_state), exist_ok=True)
    
    print("Launching Chromium browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        
        base_url = os.getenv("LEETCODE_BASE_URL") or "https://leetcode.com"
        page.goto(f"{base_url}/accounts/login/")
        
        input("\nLog in to LeetCode in the browser window, then press Enter here to save the session...\n")
        
        context.storage_state(path=storage_state)
        browser.close()
        print(f"Saved LeetCode session to {storage_state}")

if __name__ == "__main__":
    main()
