# Chrome Web Store submission

These are prepared listing materials, not confirmation of a store publication. The account owner must upload the package, confirm the disclosures, and submit it for Google's review.

## Files

Run `npm run package` to create:

- `dist/yt-local-db-0.1.0.zip` — upload this as the extension package.
- `dist/yt-local-db-store-assets-0.1.0.zip` — unpack this for listing images and this guide; do not upload it as the extension package.

Listing images:

- `icons/icon128.png` — 128×128 PNG with transparent padding.
- `store/promo-440x280.png` — required small promotional tile.
- `store/screenshot-light-1280x800.png` — actual popup rendered with example history.
- `store/screenshot-dark-1280x800.png` — the same popup in dark mode.

The screenshots use fictional example history, not the developer's personal viewing data.

## Store listing

**Name:** YT Local

**Summary (from the manifest):**

Remember YouTube videos and playback progress locally, without enabling YouTube watch history.

**Language:** English

**Category:** Select the closest tools/productivity category offered by the dashboard.

**Detailed description:**

```text
Remember where you stopped, without enabling YouTube watch history.

YT Local saves your YouTube watch history and playback progress in this browser. Open the toolbar popup to find a recently watched video and resume from your saved position.

Features
• Local watch history, most recent first
• Saved playback positions and progress bars
• Resume links that open videos at the saved timestamp
• Watch finished videos again from the start
• Delete individual entries or clear all saved history
• Clean light and dark themes

No extension account, backend, analytics, or cloud sync. Open source under the MIT license.

Important: keep YouTube's own watch history paused yourself. YT Local does not change your Google account settings, hide recommendations, or prevent YouTube from observing normal page and video requests.

Desktop Chrome only. Regular YouTube watch-page videos are supported; Shorts, embeds, and live streams with unbounded duration are not. Opening a video outside the popup does not automatically seek to the saved position. Removing the extension deletes its saved data.

Source and support: https://github.com/shettyh/yt-local-db
Privacy: https://github.com/shettyh/yt-local-db/blob/main/PRIVACY.md

Independent open-source project. Not affiliated with YouTube or Google.
```

**Homepage:** https://github.com/shettyh/yt-local-db

**Support:** https://github.com/shettyh/yt-local-db/issues

**Privacy policy:** https://github.com/shettyh/yt-local-db/blob/main/PRIVACY.md

## Privacy practices

Read and confirm these answers against the current code before submitting. Local-only handling still needs to be disclosed under Chrome Web Store policy.

### Single purpose

```text
Keep a local history of regular YouTube videos and their playback positions so users can resume watching from the extension popup without enabling YouTube's account watch history.
```

### Storage permission justification

```text
The storage permission persists video IDs, titles, playback positions, durations, and last-watched timestamps in chrome.storage.local in the current browser profile. The popup reads these records to show history and timestamped resume links, and removes them when the user deletes entries or clears history. Chrome Sync is not used.
```

### YouTube site access justification

Use this if the dashboard asks for a host/site-access justification:

```text
The content script runs only on https://www.youtube.com/* and records regular /watch?v=... pages. Access to the whole YouTube site is needed because YouTube navigates from home/search to videos without reloading the page. It reads the video ID, title, duration, and playback position for local history and resume. It does not record other websites, Shorts, embeds, cookies, credentials, or incognito browsing.
```

### Remote code

**No, I am not using remote code.** All extension JavaScript and CSS are bundled. No remotely hosted scripts, fonts, analytics, or application services are used.

### Data categories

Disclose the following local handling using the dashboard's applicable categories:

- **Web history:** watched YouTube video identifiers/URLs and last-watched timestamps.
- **Website content:** video titles and durations read from the watch page/player.
- **User activity:** playback progress and its save timestamps.

The extension does not collect identity, health, financial, authentication, personal communication, or location data. Do **not** choose "no user data" merely because nothing is sent to a developer server.

Confirm the dashboard's certifications that data is not sold/transferred to third parties, not used for unrelated purposes, and not used for creditworthiness/lending. The saved history is used only for the extension's local history/resume feature. A user-initiated Resume link opens normal YouTube with a video ID and timestamp.

## Reviewer test instructions

```text
No extension account or credentials are required.

1. In a normal desktop Chrome window, open a regular public YouTube video, for example https://www.youtube.com/watch?v=aqz-KE-bpKQ.
2. Keep YouTube watch history paused if signed in; the extension does not change that setting.
3. Play or seek the video to at least 30 seconds, then pause. Allow up to five seconds if YouTube is still loading its watch-page metadata.
4. Open YT Local from the toolbar. Verify the video title, playback timestamp, and progress bar appear.
5. Click Resume. Verify a new YouTube tab opens with the saved timestamp in the URL.
6. Delete the entry. Verify it disappears. Further playback of that video may record it again.
7. Add another video and use Clear all. Verify the confirmation prompt and empty history state.

The extension does not automatically seek on unrelated YouTube visits and does not hide recommendations. Incognito operation is disabled.
```

## Submit

1. Sign in to the [Chrome Web Store developer dashboard](https://chrome.google.com/webstore/devconsole).
2. If needed, register, accept Google's agreements, and pay the one-time registration fee yourself. Set your publisher name, verify the contact email, and complete any account/security checks required by the dashboard.
3. Add a new item and upload `dist/yt-local-db-0.1.0.zip`.
4. Fill the listing, upload the icon, promotional tile, and screenshots, and paste the homepage/support/privacy URLs.
5. Fill Privacy practices using the answers above; review them before certifying.
6. Choose free, public distribution and your intended regions. Complete any account-specific declarations shown by Google.
7. Submit for review. Choose automatic publication after approval if you want the item to go live once approved.
8. Once live, add its actual Chrome Web Store URL to the project README. Never invent the item ID or claim publication while it is still draft/pending review.

Google controls approval and timing. A GitHub release does not publish the extension in the Chrome Web Store. Later store uploads need a strictly higher manifest version.

## Official references

- [Developer registration](https://developer.chrome.com/docs/webstore/register)
- [Account setup](https://developer.chrome.com/docs/webstore/set-up-account)
- [Package preparation](https://developer.chrome.com/docs/webstore/prepare)
- [Required image formats and dimensions](https://developer.chrome.com/docs/webstore/images)
- [Privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [Local data disclosure and Limited Use FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)
- [Publication and review](https://developer.chrome.com/docs/webstore/publish)
