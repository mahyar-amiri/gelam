from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    # Test approach 1 (/test)
    page.goto("http://localhost:3000/test")
    page.wait_for_timeout(2000) # wait for 3d models to load

    # Scroll slowly to show the animation
    page.evaluate("window.scrollTo(0, document.body.scrollHeight / 4)")
    page.wait_for_timeout(1000)

    page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
    page.wait_for_timeout(1000)

    # Text should be visible
    page.screenshot(path="/home/jules/verification/screenshots/approach1_text.png")

    # Interact with the 3D model
    page.mouse.move(500, 500)
    page.mouse.down()
    page.mouse.move(700, 500)
    page.mouse.up()
    page.wait_for_timeout(1000)

    # Scroll to end
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/approach1_end.png")

    # Test approach 2 (/test2)
    page.goto("http://localhost:3000/test2")
    page.wait_for_timeout(2000) # wait for 3d models to load

    # Scroll slowly to show the animation
    page.evaluate("window.scrollTo(0, document.body.scrollHeight / 4)")
    page.wait_for_timeout(1000)

    page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
    page.wait_for_timeout(1000)

    # Text should be visible
    page.screenshot(path="/home/jules/verification/screenshots/approach2_text.png")

    # Scroll to end
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/approach2_end.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
