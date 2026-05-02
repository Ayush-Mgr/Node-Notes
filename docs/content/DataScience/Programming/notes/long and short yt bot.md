https://www.youtube.com/watch?v=DokVGHgU8Zk

AIzaSyBgbQ1fzBkTs_ukiVeaORbJjpFTkOBEZiQ

import os

import random

import asyncio

from playwright.async_api import async_playwright

import edge_tts

from moviepy import VideoFileClip, AudioFileClip, ImageClip, CompositeVideoClip, ColorClip, concatenate_videoclips, vfx

  

# --- ⚙️ SETTINGS ---

# Use a specific gossip subreddit or a general top list

SUBREDDIT_URL = "https://www.reddit.com/r/TrueOffMyChest/top/?t=week"

ASKREDDIT_URL = "https://www.reddit.com/r/AskReddit/top/?t=day"

VOICE = "en-US-AnaNeural"

  

# Local folders (relative to where you run the script)

OUTPUT_FOLDER = "output"

BACKGROUND_VIDEO = "background.mov"

HISTORY_FILE = "processed_posts.txt"

  

# Ensure output folder exists

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

  

class NoApiBot:

def __init__(self):

self.history = self.load_history()

  

def load_history(self):

if not os.path.exists(HISTORY_FILE):

return set()

with open(HISTORY_FILE, "r") as f:

return set(line.strip() for line in f if line.strip())

  

def save_to_history(self, permalink):

with open(HISTORY_FILE, "a") as f:

f.write(f"{permalink}\n")

self.history.add(permalink)

  

async def get_top_post_data(self):

print(f"🕵️ Scraper looking at: {SUBREDDIT_URL}")

post_data = None

async with async_playwright() as p:

# Launch browser (headless=False lets you see it working, set to True to hide)

browser = await p.chromium.launch(headless=True)

context = await browser.new_context(

user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

)

page = await context.new_page()

try:

# Go to Subreddit

await page.goto(SUBREDDIT_URL, wait_until="domcontentloaded")

await asyncio.sleep(4)

  

# Click the first 'shreddit-post' (New Reddit UI)

posts = page.locator("shreddit-post")

count = await posts.count()

if count == 0:

print("Could not find shreddit-post tag. Reddit UI might have changed.")

await browser.close()

return None

  

target_post = None

post_permalink = None

post_title = None

  

print(f"🔎 Found {count} posts. Checking for duplicates...")

  

for i in range(count):

p = posts.nth(i)

permalink = await p.get_attribute("permalink")

if permalink and permalink not in self.history:

target_post = p

post_permalink = permalink

post_title = await p.get_attribute("post-title")

print(f"✨ New Post Found: {post_title}")

break

else:

print(f"⏭️ Skipping duplicate: {permalink}")

if not target_post:

print("⚠️ All posts on the front page have been processed!")

await browser.close()

return None

  

# Navigate to the specific post to read comments/body

full_url = f"https://www.reddit.com{post_permalink}"

await page.goto(full_url, wait_until="domcontentloaded")

await asyncio.sleep(3)

  

# Screenshot the Title

screenshot_path = "screenshot.png"

try:

await target_post.screenshot(path=screenshot_path)

except:

# Fallback screenshot

await page.screenshot(path=screenshot_path, clip={"x":0, "y":0, "width":400, "height":600})

  

# Get Body Text

try:

# Try to find the content div

body_element = page.locator("div[id*='-post-rtjson-content']")

story_text = await body_element.inner_text()

except:

story_text = "Check the video for more details!"

  

post_data = {

"title": post_title,

"text": story_text[:3000], # Up to ~3-4 mins of text

"screenshot": screenshot_path,

"permalink": post_permalink

}

  

except Exception as e:

print(f"❌ Scraping error: {e}")

await browser.close()

# Save to history ONLY if we successfully got any data

if post_data and post_data.get("permalink"):

self.save_to_history(post_data["permalink"])

return post_data

  

async def generate_audio(self, text, filename):

print("🗣️ Synthesizing Audio...")

communicate = edge_tts.Communicate(text, VOICE)

await communicate.save(filename)

  

def render_video(self, data, audio_path):

print("🎬 Rendering Video...")

try:

audio = AudioFileClip(audio_path)

# Enforce Max Duration (3 Minutes)

if audio.duration > 180:

print(f"⚠️ Audio too long ({audio.duration}s), clipping to 180s.")

audio = audio.subclipped(0, 180)

# Fade out audio at the end

audio = audio.with_effects([vfx.AudioFadeOut(duration=2)])

  

# Handle Background

if os.path.exists(BACKGROUND_VIDEO):

bg = VideoFileClip(BACKGROUND_VIDEO)

bg = bg.without_audio() # Mute background

  

# Loop if audio is longer than background

if bg.duration < audio.duration:

bg = bg.with_effects([vfx.Loop(duration=audio.duration)])

# Random start time

if bg.duration > audio.duration:

max_start = bg.duration - audio.duration

start = random.uniform(0, max_start)

bg = bg.subclipped(start, start + audio.duration)

else:

bg = bg.subclipped(0, audio.duration)

else:

print(f"⚠️ {BACKGROUND_VIDEO} not found. Using black screen.")

bg = ColorClip(size=(1080, 1920), color=(0,0,0), duration=audio.duration)

  

# Strict 9:16 Crop (Cover Mode)

target_ratio = 9 / 16

current_ratio = bg.w / bg.h

if current_ratio > target_ratio:

# Too wide: Scale height to match, then crop width

new_h = 1920

new_w = int(bg.w * (1920 / bg.h))

bg = bg.resized(height=new_h)

bg = bg.cropped(x1=(new_w/2 - 540), width=1080, height=1920)

else:

# Too tall: Scale width to match, then crop height

new_w = 1080

new_h = int(bg.h * (1080 / bg.w))

bg = bg.resized(width=new_w)

bg = bg.cropped(y1=(new_h/2 - 960), width=1080, height=1920)

  

# Overlay Screenshot

if data["screenshot"] and os.path.exists(data["screenshot"]):

img = ImageClip(data["screenshot"]).with_duration(audio.duration)

img = img.resized(width=1080 * 0.90) # 90% width

img = img.with_position("center")

final = CompositeVideoClip([bg, img])

else:

final = bg

  

final = final.with_audio(audio)

output_file = os.path.join(OUTPUT_FOLDER, "final_video.mp4")

# Preset 'medium' or 'slow' for better compression/quality trade-off

final.write_videofile(output_file, fps=30, codec="libx264", audio_codec="aac", bitrate="5000k")

print(f"✅ Video Finished: {output_file}")

except Exception as e:

print(f"❌ Rendering Error: {e}")

  

async def run(self):

# 1. Scrape

data = await self.get_top_post_data()

if not data:

print("No data found, exiting.")

return

# 2. Audio

script = f"{data['title']}. {data['text']}"

audio_file = "temp_audio.mp3"

await self.generate_audio(script, audio_file)

# 3. Render

self.render_video(data, audio_file)

# Cleanup

if os.path.exists(audio_file): os.remove(audio_file)

if os.path.exists(data["screenshot"]): os.remove(data["screenshot"])

  

class CommentShortsBot:

async def get_post_and_comments(self):

print(f"🕵️ Scraping Comments from: {ASKREDDIT_URL}")

data = {"title": "", "comments": []}

async with async_playwright() as p:

browser = await p.chromium.launch(headless=True)

context = await browser.new_context(

user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"

)

page = await context.new_page()

await page.set_viewport_size({"width": 400, "height": 800}) # Mobile view

try:

# 1. Go to Feed

await page.goto(ASKREDDIT_URL, wait_until="domcontentloaded")

await asyncio.sleep(4)

  

# 2. Find a good post (Text only, no images)

# We skip the first one (usually an ad or pinned post)

posts = page.locator("shreddit-post")

count = await posts.count()

selected_post = None

for i in range(count):

post = posts.nth(i)

url = await post.get_attribute("permalink")

if url:

selected_post = post

break

if not selected_post: return None

  

post_url = f"https://www.reddit.com{await selected_post.get_attribute('permalink')}"

print(f"🔗 Navigate: {post_url}")

await page.goto(post_url, wait_until="domcontentloaded")

await asyncio.sleep(4) # Wait for comments to load

  

# 3. Screenshot Title

title_path = os.path.join(OUTPUT_FOLDER, "title.png")

# Try to clean UI before screenshot

await page.evaluate("document.getElementsByTagName('header')[0].style.display = 'none';")

# Screenshot the main post header

await page.locator("shreddit-post").first.screenshot(path=title_path)

data["title"] = {

"text": await page.locator("shreddit-post").first.get_attribute("post-title"),

"image": title_path

}

  

# 4. Scrape Top 3 Comments

comments = page.locator("shreddit-comment")

comment_count = await comments.count()

print(f"💬 Found {comment_count} comments. Processing top 3...")

for i in range(min(5, comment_count)): # Check top 5, take 3 valid

comm = comments.nth(i)

# Skip moderator/bot comments

author = await comm.get_attribute("author")

if author == "AutoModerator": continue

  

# Get Text

# Reddit puts text in a specific div inside the comment

try:

text_div = comm.locator("div[slot='comment']").first

text = await text_div.inner_text()

# Filter: too long or too short

if len(text) < 10 or len(text) > 400: continue

# Screenshot Comment

img_path = os.path.join(OUTPUT_FOLDER, f"comment_{len(data['comments'])}.png")

# Scroll into view

await comm.scroll_into_view_if_needed()

await comm.screenshot(path=img_path)

data["comments"].append({

"text": text,

"image": img_path

})

print(f" -> Saved comment {len(data['comments'])}")

if len(data["comments"]) >= 3: break

except Exception as e:

print(f" -> Skipped comment: {e}")

continue

  

except Exception as e:

print(f"❌ Scraping Error: {e}")

await browser.close()

return data

  

async def generate_audio(self, text, filename):

communicate = edge_tts.Communicate(text, VOICE)

await communicate.save(filename)

  

async def render(self, data):

if not data["comments"]:

print("No comments found!")

return

clips = []

# --- 1. Prepare Background ---

if os.path.exists(BACKGROUND_VIDEO):

bg_source = VideoFileClip(BACKGROUND_VIDEO)

# Remove audio from background to avoid mixing background noise

bg_source = bg_source.without_audio()

else:

print("⚠️ Background video not found, using black screen")

bg_source = ColorClip(size=(1080, 1920), color=(0,0,0), duration=60)

  

# Helper to crop background vertical

def get_bg_segment(duration):

# Random start

# Ensure we don't go out of bounds

if bg_source.duration > duration:

max_start = bg_source.duration - duration

start = random.uniform(0, max_start)

bg = bg_source.subclipped(start, start + duration)

else:

# Loop it if too short

bg = bg_source.with_effects([vfx.Loop(duration=duration)])

# Strict 9:16 Crop

target_ratio = 9 / 16

current_ratio = bg.w / bg.h

if current_ratio > target_ratio:

# Too wide: Scale height to match, then crop width

new_h = 1920

new_w = int(bg.w * (1920 / bg.h))

bg = bg.resized(height=new_h)

bg = bg.cropped(x1=(new_w/2 - 540), width=1080, height=1920)

else:

# Too tall: Scale width to match, then crop height

new_w = 1080

new_h = int(bg.h * (1080 / bg.w))

bg = bg.resized(width=new_w)

bg = bg.cropped(y1=(new_h/2 - 960), width=1080, height=1920)

return bg

  

# --- 2. Create Title Scene ---

print("🎬 Building Title Scene...")

audio_path = os.path.join(OUTPUT_FOLDER, "title.mp3")

await self.generate_audio(data["title"]["text"], audio_path)

audioclip = AudioFileClip(audio_path)

bg_clip = get_bg_segment(audioclip.duration)

if os.path.exists(data["title"]["image"]):

img_clip = ImageClip(data["title"]["image"]).with_duration(audioclip.duration)

img_clip = img_clip.resized(width=1080*0.9).with_position("center")

scene_title = CompositeVideoClip([bg_clip, img_clip]).with_audio(audioclip)

else:

scene_title = bg_clip.with_audio(audioclip)

clips.append(scene_title)

  

# --- 3. Create Comment Scenes ---

for i, comment in enumerate(data["comments"]):

print(f"🎬 Building Comment Scene {i+1}...")

# Check length (Strictly < 59s total)

current_len = sum([c.duration for c in clips])

if current_len >= 58:

print(" -> Video full!")

break

  

c_audio_path = os.path.join(OUTPUT_FOLDER, f"comment_{i}.mp3")

await self.generate_audio(comment["text"], c_audio_path)

c_audio = AudioFileClip(c_audio_path)

# Logic: If adding this comment exceeds 59s, we skip it.

if current_len + c_audio.duration > 59:

print(" -> Skipping comment (would exceed 60s limit)")

continue

  

c_bg = get_bg_segment(c_audio.duration)

if os.path.exists(comment["image"]):

c_img = ImageClip(comment["image"]).with_duration(c_audio.duration)

c_img = c_img.resized(width=1080*0.9).with_position("center")

scene_comment = CompositeVideoClip([c_bg, c_img]).with_audio(c_audio)

else:

scene_comment = c_bg.with_audio(c_audio)

clips.append(scene_comment)

  

# --- 4. Final Stitch ---

final_video = concatenate_videoclips(clips)

final_output = os.path.join(OUTPUT_FOLDER, "Final_Short.mp4")

final_video.write_videofile(final_output, fps=30, codec="libx264", audio_codec="aac", bitrate="5000k")

print(f"✅ DONE! Saved to: {final_output}")

# Cleanup clips to release file handles before deleting

final_video.close()

for clip in clips:

clip.close()

  

if os.path.exists(audio_path): os.remove(audio_path)

if os.path.exists(data["title"]["image"]): os.remove(data["title"]["image"])

for i in range(len(data["comments"])):

c_p = os.path.join(OUTPUT_FOLDER, f"comment_{i}.mp3")

i_p = os.path.join(OUTPUT_FOLDER, f"comment_{i}.png")

if os.path.exists(c_p): os.remove(c_p)

if os.path.exists(i_p): os.remove(i_p)

  

async def run(self):

data = await self.get_post_and_comments()

if data:

await self.render(data)

  

if __name__ == "__main__":

print("--- Reddit Video Maker ---")

print("1: Long Story Mode (r/TrueOffMyChest + Full Body)")

print("2: Short Comment Mode (r/AskReddit + Top Comments)")

choice = input("Select Mode (1 or 2): ")

if choice == "2":

bot = CommentShortsBot()

asyncio.run(bot.run())

else:

bot = Long_NoApiBot()

asyncio.run(bot.run())

---
Tags: #content-creation


#Miscellaneous
