#!/usr/bin/env python3
"""Update all HTML pages with the new navigation structure."""

import re
from pathlib import Path

# The new navigation header (without the preview-bar and skip link, just the header part)
NEW_HEADER = '''<header class="header" data-header>
  <a class="brand" href="index.html" aria-label="KOA home">
    <img src="assets/koa-logo.png" alt="">
    <span><strong>KOA</strong><small>Karen Organization of America</small></span>
  </a>
  <nav class="nav" data-nav aria-label="Main navigation">
    <a aria-current="page" href="index.html">Home</a>
    
    <div class="nav-dropdown">
      <button class="nav-dropdown__trigger" aria-haspopup="true" aria-expanded="false">Language + AI</button>
      <div class="nav-dropdown__menu" role="menu">
        <span class="nav-dropdown__section">Tools</span>
        <a href="mango.html" role="menuitem">S'gaw Mango</a>
        <a href="translate.html" role="menuitem">Translate</a>
        <a href="tutor.html" role="menuitem">Tutor</a>
        <a href="dictionary.html" role="menuitem">Dictionary</a>
        <hr>
        <span class="nav-dropdown__section">Advanced</span>
        <a href="ocr.html" role="menuitem">OCR</a>
        <a href="vision.html" role="menuitem">Vision</a>
        <a href="corpus.html" role="menuitem">Corpus Discovery</a>
      </div>
    </div>
    
    <div class="nav-dropdown">
      <button class="nav-dropdown__trigger" aria-haspopup="true" aria-expanded="false">Community Knowledge</button>
      <div class="nav-dropdown__menu" role="menu">
        <a href="contributions.html" role="menuitem">Contributions</a>
        <a href="voices.html" role="menuitem">Voices</a>
        <a href="translation.html" role="menuitem">Translation</a>
        <a href="verification.html" role="menuitem">Verification</a>
        <a href="provenance.html" role="menuitem">Provenance</a>
      </div>
    </div>
    
    <div class="nav-dropdown">
      <button class="nav-dropdown__trigger" aria-haspopup="true" aria-expanded="false">National Community</button>
      <div class="nav-dropdown__menu" role="menu">
        <a href="churches.html" role="menuitem">Churches</a>
        <a href="businesses.html" role="menuitem">Businesses</a>
        <a href="restaurants.html" role="menuitem">Restaurants</a>
        <a href="organizations.html" role="menuitem">Organizations</a>
        <a href="resources.html" role="menuitem">Resources</a>
      </div>
    </div>
    
    <div class="nav-dropdown">
      <button class="nav-dropdown__trigger" aria-haspopup="true" aria-expanded="false">Culture</button>
      <div class="nav-dropdown__menu" role="menu">
        <a href="podcast.html" role="menuitem">Podcast</a>
        <a href="music.html" role="menuitem">Music</a>
        <a href="recipes.html" role="menuitem">Recipes</a>
        <a href="stories.html" role="menuitem">Stories</a>
      </div>
    </div>
    
    <div class="nav-dropdown">
      <button class="nav-dropdown__trigger" aria-haspopup="true" aria-expanded="false">Events</button>
      <div class="nav-dropdown__menu" role="menu">
        <a href="sepak-takraw.html" role="menuitem">Sepak Takraw</a>
        <a href="soccer.html" role="menuitem">Soccer</a>
        <a href="volleyball.html" role="menuitem">Volleyball</a>
        <a href="community-events.html" role="menuitem">Community Events</a>
      </div>
    </div>
    
    <div class="nav-dropdown">
      <button class="nav-dropdown__trigger" aria-haspopup="true" aria-expanded="false">History + Resources</button>
      <div class="nav-dropdown__menu" role="menu">
        <a href="karen-history.html" role="menuitem">Karen History</a>
        <a href="koa-history.html" role="menuitem">KOA History</a>
        <a href="advocacy.html" role="menuitem">Advocacy</a>
        <a href="news.html" role="menuitem">News</a>
        <a href="practical-resources.html" role="menuitem">Practical Resources</a>
      </div>
    </div>
  </nav>
  <div class="header-tools">
    <a class="language-mode" href="/en" aria-label="Open bilingual preview mode"><span>EN · ကညီ</span><small>Bilingual preview</small></a>
    <button class="search-button" type="button" aria-label="Search" data-search-open><span aria-hidden="true"></span></button>
    <button class="motion-button" type="button" aria-pressed="false" data-motion>Motion on</button>
    <button class="menu" type="button" aria-expanded="false" data-menu>Menu</button>
  </div>
</header>'''

# Pages to update
pages = ['about.html', 'programs.html', 'stories.html', 'contact.html']

def update_page(page_path):
    content = page_path.read_text(encoding='utf-8')
    
    # Find and replace the header section
    # Pattern: from <header class="header" data-header> to </header>
    pattern = r'<header class="header" data-header>.*?</header>'
    
    new_content = re.sub(pattern, NEW_HEADER, content, flags=re.DOTALL)
    
    # Also update aria-current for the current page
    page_name = page_path.stem
    if page_name != 'index':
        new_content = new_content.replace(f'href="{page_name}.html"', f'href="{page_name}.html" aria-current="page"')
    
    page_path.write_text(new_content, encoding='utf-8')
    print(f"Updated {page_path}")

for page in pages:
    page_path = Path(f"C:/Users/olive/Projects/koa/public/koa/{page}")
    if page_path.exists():
        update_page(page_path)
    else:
        print(f"NOT FOUND: {page_path}")

print("Done!")