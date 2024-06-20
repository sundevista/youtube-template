export const NO_VIDEO_ERROR = 'No video found';
export const NO_CHANNEL_ERROR = 'No video found';
export const NO_INTERNET_ERROR = 'No internet connection';
export const WRONG_API_KEY_ERROR = 'API key is wrong';

export const NO_INTERNET_CATCHING_ERROR = 'net::ERR_INTERNET_DISCONNECTED';

// chapters: \n${videoData.chapters.map((chapter) => `    - "${chapter}"\n`).join('')}
// hashtags: \n${videoData.hashtags.map((hashtag) => `    - "#${hashtag}"\n`).join('')}

export const ROOT_FOLDER = '/';
export const DEFAULT_CHAPTER_FORMAT = ' - "{{chapter}}"\n';
export const DEFAULT_HASHTAG_FORMAT = ' - "#{{hashtag}}"\n';
export const DEFAULT_TEMPLATE = `---
tags:
  - type/youtube
aliases: 
title: "{{title}}"
channel_name: "{{channelName}}"
subscribers: {{subscribers}}
length: "{{length}}"
publish_date: "{{publishDate}}"
chapters: \n{{chapters}}
hashtags: \n{{hashtags}}
thumbnail: "![[{{thumbnail}}]]"
description: "{{description}}"
note_created: "{{noteCreated}}"
note_modifiend: "{{noteCreatedDateTime}}"
youtube_url: "{{youtubeUrl}}"
template-type: "YouTube"
template-version: "1.0"
---

![[{{thumbnail}}]]

<iframe title="{{title}}" src="https://www.youtube.com/embed/{{id}}?feature=oembed" height="113" width="200" style="aspect-ratio: 1.76991 / 1; width: 100%; height: 100%;" allowfullscreen="" allow="fullscreen"></iframe>


# 🌍 What It's About
- 

# 🔍 How I Discovered IT
- 

# 🧠 Thoughts
- 

## What I Liked About IT
- 

## What I Didn't Like About it
- 

# ✍️ The Video in 3 Sentences

# ✍️ My Top 3 Quotes

# 🎨 Impressions

# ☘️ How the Video Changed Me

# 📒 Summary + Notes

# 🥰 Who Would Like it ?
- 

# 📚Related Videos
-  
`;
