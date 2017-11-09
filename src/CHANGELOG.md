Version 0.86
-
11/9/2017

* Greatly simplified error handling 
* Fixed a bug where older versions of windows downloaded the most recent version of the app to C:\Windows\System32, resulting in an unexecutable binary
* Fixed a couple of bugs related to loading and parsing the game
* Removed some unnecessary modules

Version 0.8.5
-
11/8/2017
* Automatic updating hero images. Hero images will now automatically download so when a new hero comes out there shouldn't be too much of a delay before the artwork shows up in the app. (Next up: talents!)
* Replays can now automatically be uploaded to HotSApi (this option is ON by default - go into the configuration to disable it)
* Fixed bug where the video icon would not appear on the sidebar for games that have highlights
* Reworked the user interface for the video options on highlights and full video. The options for videos now appear overlayed in the top right of the video when hovered over.

Coming soon:
* Completely revamped talent tooltips with more build specifics and talent descriptions
* Easily create clips from the video tab and save or share them
* Full video upload (probably to YouTube)


Version 0.8.4
-
11/2/2017
* Improved crash handling 
* Refactored a significant chunk of code that will result in improved replay loading and less errors when returning from a recently completed game
* Fixed bug where deleting a replay will screw up the order of full videos and cause problems with future games/videos


Version 0.8.3
-
10/28/2017
* Improved error tracking/debugging and metrics

Version 0.8.2
-
10/27/2017
* Implemented configuration options to load HotSTube when you login to your computer, start minimized by default, and to minimize to the tray instead of task bar (windows only)

Version 0.8.0
-
10/26/2017
* **NEW!** Video tab - you can now watch the entire game. Highlights are annotated in the video player tracker along with the list of any deaths that occur beneath the video. 
* Full game video is now retained by default. This will greatly increase the amount of storage the app uses. To see the amount of space the app is using at any given time, look at the advanced settings.
* Reformatted the highlight kill text into a KDA table. I think this is a little easier to skim. Let me know what you guys think.
* The window is now resizable. Woohoo!
* The recorder will now scale the recording to the aspect ratio of your monitor resolution. This should fix support for ultra wide monitors. Thanks to Brambo for the constant troubleshooting and feedback for helping with this. 
* Added image assets for junkrat
* Fixed the coloring of teams to be relative to the recording player. The recording player's team is now always blue, just like the game (thanks JustaFleshWound for making this obvious fact known to me)

Version 0.6.9
-
10/18/2017
* Automatically patch the protocol decoder for new HotS versions. This means that the app should now patch itself automatically when a new HotS patch is released. 

Version 0.6.4
-
10/17/2017
* Update for junkrat patch

Version 0.6.3
-
10/11/2017
* Update for latest patch

Version 0.6.2
-
10/3/2017
* Switched video conversion from base64 string data URL to video object URL. This should increase performance when viewing videos in the app.
* Switched from observing process list and instead using built in chromium desktop capturer to monitor for when HotS is loaded. This also fixes an issue where the entire app would freeze up every five seconds when HotS was not running
* Made it possible to link to specific timeline events that have occurred on hotstube.com (look for the link icon next to the timeline event's time)
* Expanded video size to take up full width of timeline

Version 0.6.0
-
10/3/2017
* Selected talents are now shown on the score screen and when hovering over a player name on the highlights

Version 0.5.6
-
10/3/2017
* Update for hotfix


Version 0.5.5
-
10/2/2017
* Reformatted scores tab
* Added scores tab to hotstube.com

Version 0.5.4
-
9/27/2017
* Added Volskaya artwork
* Fixed a bug where the program did not record unless it was opened after Heroes was already opened

Version 0.5.3
-
9/27/2017
* Fixed a bug that prevented highlights from being saved
* Fixed a bug that prevented replays from being deleted
* Fixed a bug allowing replays for games that did not finish to load
* Fixed a bug where toggled between games would sometimes create a memory leak
* Fixed a bug where no replays displayed when a custom HotS account directory is setup

Version 0.5.2
-
9/27/2017
* Entire game history can now be uploaded to hotstube.com with highlights
* You must now use your own Streamable account to upload highlights
* Ana portrait added


Version 0.4.4
-
9/26/2017
* Update replay parser to Ana patch

Version 0.4.3
-
9/21/2017
* Update replay parser to most recent HotS client version

Version 0.4.2
-
9/10/2017
* Added winner information to timeline
* Fixed a big with solo kills not appearing on score tab
* Added total kills to top of game

Version 0.4.0
-
9/9/2017
* Improved the time synchronization issues with highlights (especially at the end of games)
* Change release notes format to be easier to update and conform to standards.

Version 0.3.6
-
9/8/2017
* Fix auto updater distribution link.
* Update for latest hotfix patch.

Version 0.3.5 - 9/8/2017 
-
* Implemented auto-updater for new versions.
* Fixed a bug where saving highlights wasn't working.

Version 0.3.4
-
9/6/2017 
* Fixed a bug where the release notes window is not closable.
* Fixed Streamable uploads not working.

Version 0.3.3
-
9/6/2017 
* Updated artwork for Kel'Thuzad patch and added patch notes.

Version 0.3.2 
-
9/5/2017 
* Added link to release notes in settings page.
* Added support for Kel'Thuzad patch.
* Implemented a basic deploy process for the app and website.

Version 0.3.1 
- 
9/3/2017 
* Fixed a bug where videos appeared as a gray screen.
* Fixed a bug where certain videos wouldn't display from group fights.

Version 0.3.0 
-
9/3/2017 
* Improved loading time of highlights.
* Added blue camera icon next to replays containing  highlight.
* Added the release notes screen.