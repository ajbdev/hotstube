# HotSTube

HotSTube is a program that records Heroes of the Storm games and reads Blizzard's replay data file 

HotSTube is primarily a cross-platform desktop application. It also has a website that allows for uploads of highlights and game activity.

## Desktop app

The desktop app is an electron based app and uses many of the chromium features to accomplish the recording features. ffmpeg is used to do any necessary video conversions.

The desktop user interface is coded via React components.  

## Web site

The website repurposes the desktop react UI where possible. Webpack is used to bundle all client side code together. 
