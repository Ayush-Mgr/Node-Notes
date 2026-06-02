---
title: "Super MVP"
date: 2026-06-02T10:14:59.529Z
tags: [vault, web]
---

CompileFuture Website Checklist ✅
create Website with Prompt (give competitor url)
use (logofa.st) for the logo & favicon
Add Favicon (use real favicon generator)
website should be mobile responsive
do SEO with prompt (write about the tool 600 words)
add FAQ section
add privacy policy, about us, terms & conditions, contact us pages
add error pages (404, 500)
robots.txt
sitemap.xml
add google analytics code
add _headers file for cloudflare pages / if using workers then disable workers.dev domains after connecting the .com domain


sources:
ai skill : webdesignguidelines.md vercel's design , tailwindagentskills,
mcp server :astro js mcp

Prompt:
I have initialized a new astrojs project, use astro docs mcp and tailwind-4-docs & web-design-guidelines skills for creating the website. Also use @DESIGN.md file and keep the website design like vercel.

Name: Real Online Ruler
Domain: realonlineruler.com

Create an online ruler website that will have ruler on the edges, user can select where to place the ruler. we want these 3 calibration methods
Method 1: Auto-Detect Device
Method 2: Screen Diagonal
Method 3: Credit Card Calibration
   
creation:
My competitor website is https://anruler.com/ and it have some features which we need and we need to make a website better than it. Give me ideas how to make it better. go on to this website and check what exactly we need to make. Do not copy design or ui from that website.

tips 
multi page application
fabicons
no dup website


SEO:
Do the On Page SEO of this Website for

Main Keyword: Online Ruler
Supporting Keywords: online ruler inches, online ruler in cm, online ruler mm, online ruler cm, free online ruler, online ruler in mm, online ruler camera, mm online ruler, accurate online ruler, 12 inch online ruler, online ruler inches actual size, online ruler to scale, online ruler 12 inch, online ruler tool, online ruler actual size, real online ruler, actual size online ruler

these above keywords, also use proper og meta tags for SEO
on home page write 600 words about the tool for SEO

FAQ:
NOTE: Use JSON-LD for FAQ SEO
example: ```
 <script type="application/ld+json">
 {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [{
 "@type": "Question",
 "name": "How to find an apprenticeship?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "<p>We provide an official service to search through available apprenticeships. To get started, create an account here, specify the desired region, and your preferences. You will be able to search through all officially registered open apprenticeships.</p>"
 }
 }, {
 "@type": "Question",
 "name": "Whom to contact?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "You can contact the apprenticeship office through our official phone hotline above, or with the web-form below. We generally respond to written requests within 7-10 days."
 }
 }]



---
add error pages , robot.txt,