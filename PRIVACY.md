# Privacy

YT Local DB stores these fields for each watched video:

- YouTube video ID and title
- Last playback position and video duration
- Date and time of the latest saved playback progress

Data is stored in `chrome.storage.local` in the current browser profile and used only to provide the local history and resume feature. The extension does not use Chrome Sync, a server, analytics, Google account APIs, or remote images, fonts, or scripts. It makes no application network requests. Clicking Resume or a video title opens the normal YouTube website with that video's ID and playback timestamp in the URL.

YT Local DB's use of user data complies with the Chrome Web Store User Data Policy, including its Limited Use requirements. Saved history is not sold or shared with the developer or third parties, is not used for advertising or credit decisions, and is not available for the developer to read.

The extension requests only the `storage` API permission and content-script access to `https://www.youtube.com/*`. Access to the whole desktop YouTube site is needed because navigating from the homepage to a video often happens without a page reload. Only regular `/watch?v=…` pages are recorded. Incognito operation is disabled. No browser-wide history is accessed.

**Keep YouTube watch history paused yourself.** The extension does not pause, delete, or alter Google account history. If YouTube history is enabled, YouTube may still save the videos you watch.

Local extension storage is not an anonymity boundary. YouTube can still observe page and media requests, cookies, IP addresses, and other usage signals. Paused watch history does not guarantee there will be no recommendations.

The extension does not encrypt its saved data. Anyone with access to the browser profile may be able to read it, and browser-profile backups may contain it. There is no cross-device resume or native YouTube mobile-app tracking.

Delete individual entries or clear all history in the popup. Continued playback can record a deleted video again. Uninstalling the extension removes its local storage.

For privacy questions, [open an issue](https://github.com/shettyh/yt-local-db/issues). Do not include your personal watch history in a public issue.
