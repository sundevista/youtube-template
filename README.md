# YouTube Template

![cover image](https://github.com/sundevista/youtube-template/blob/master/assets/image_demo.png?raw=true)

## Demo

![demo GIF](https://github.com/sundevista/youtube-template/blob/master/assets/demo.gif?raw=true)

## Description

A plugin that will help you take notes on YouTube videos using a configurable template. It has a single command that takes a YouTube video URL and
creates a note from it. You can choose the template folder, template, and format for chapters and hashtags.

## Roadmap (features of the next 1.1.0 release)

- [ ] Template for a file name (alongside with the ability to set folder location).
- [ ] Folder creator (add an option to create an attachment folder if it doesn't exist and create a folder from the file name template).
- [ ] Template file instead of a settings textarea (it will be easier to use the Templater plugin for advanced users).
- [ ] New {{thumbnailUrl}} field to allow you to use image URLs instead of downloading them.

## Receiving API key

To make this plugin work, you need to paste your Google Cloud API key to be able to access the YouTube Data API. To do so, you need to create a
project, then visit [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) and add a new API key.
Afterward, go to [https://console.cloud.google.com/apis/dashboard](https://console.cloud.google.com/apis/dashboard), click the "Enable APIs and
Services" button, and search for "YouTube Data API v3". Enable this service for your API key (it should be turned off by default). Finally,
you need to paste this API key into the plugin settings ("Google Cloud API key" field).

## Acceptable YouTube video URLs

The plugin uses a special regular expression to detect a YouTube ID from a given URL. These ones would be detected for sure:

-   http://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index
-   http://www.youtube.com/user/IngridMichaelsonVEVO#p/a/u/1/QdK8U-VIH_o
-   http://www.youtube.com/v/0zM3nApSvMg?fs=1&amp;hl=en_US&amp;rel=0
-   http://www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s
-   http://www.youtube.com/embed/0zM3nApSvMg?rel=0
-   http://www.youtube.com/watch?v=0zM3nApSvMg
-   http://youtu.be/0zM3nApSvMg
-   https://youtube.com/shorts/0dPkkQeRwTI?feature=share
-   https://youtube.com/shorts/0dPkkQeRwTI

## Contributions and Issues

If you would like to add a new feature or fix a bug yourself, you are welcome to create a pull request (PR) and I will review it.

If you discover any bugs, please feel free to create an issue. Provide the URL and a description of the issue so that I can reproduce and fix it.
