# Twitch Unfollowr

Chrome extension to manage Twitch follows: bulk unfollow with preview, confirmations, and progress tracking.

**Author:** ecx2f

## Install

1. Clone or download this repo.
2. Open `chrome://extensions/`, enable **Developer mode**, click **Load unpacked** and select the extension folder.

## Use

1. Open the extension popup and click **Open Unfollow Manager** (or go to Twitch Following).
2. **Analyze** – Start analysis to load your followed channels.
3. **Select** – Choose channels to unfollow; move others to "Keep Following" to exclude them.
4. **Preview** – Review counts and list before executing.
5. **Execute** – Confirm and run; you can cancel during the process.

## Features

- Preview before unfollowing
- Multiple confirmations
- Progress tracking and cancel anytime
- Search and bulk select
- Selections saved automatically

## Tech

- Manifest V3, content scripts on Twitch, background service worker, Chrome storage.

## License

MIT. See [LICENSE](LICENSE).
