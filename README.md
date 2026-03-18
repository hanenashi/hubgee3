# Hubgee3 🚀🐢

**The Modular Copy/Paste/Diff Bridge for AI and GitHub.**

Hubgee3 is a lightweight, brutalist userscript designed to seamlessly teleport code from LLM web interfaces (Gemini, ChatGPT) directly into GitHub's mobile and desktop editors.

It bypasses GitHub's strict Content Security Policies (CSP), completely neutralizes Android `EditContext` crashes, and uses a modular, sandboxed `@require` architecture to keep the injection engine fast and clean.

## ⚙️ Installation

You will need a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) installed in your browser.

### 🌟 Stable Release (Recommended)
This tracks the `main` branch. It only updates when features are fully tested and stable.
* **[Install Hubgee3 (Stable)](https://raw.githubusercontent.com/hanenashi/hubgee3/main/hubgee3.user.js)**

### 🧪 Bleeding Edge (Development)
This tracks the `dev` branch. It receives live, chaotic updates as new features (like the asynchronous diff-patcher) are actively being coded. It might break.
* **[Install Hubgee3 (Dev)](https://raw.githubusercontent.com/hanenashi/hubgee3/dev/hubgee3.user.js)**

---

## ✨ Features

* **The CodeMirror Heist:** Bypasses visual DOM hacking and injects code directly into GitHub's hidden mobile IME textareas, perfectly syncing CodeMirror 6's internal state machine and preventing jumping cursors.
* **EditContext Crash Immunity:** Stripped of manual Selection/Range hacking to guarantee 100% stability on Android Chromium browsers (like Kiwi).
* **Hybrid Generation Detection:** Bulletproof DOM scrapers that know exactly when Gemini or ChatGPT have actually finished typing.
* **Modular Architecture:** The core script is just a seed. All logic (UI, GitHub routing, AI parsing, Settings) is separated into isolated modules that run safely inside the extension sandbox.
* **Native Settings:** No messy HTML modals. Settings and Debug toggles are injected directly into your Tampermonkey extension menu.

## 🏗️ Architecture

Hubgee3 uses a dynamic `@require` pipeline to load specific handlers based on your current active tab:

1. `hubgee3.user.js` (The Seed) boots the orchestrator.
2. `core.js` determines your location.
3. If on an AI site, it loads `ai-handler.js` to inject the Grabber buttons.
4. If on GitHub, it loads `git-handler.js` to inject the Injector button and CodeMirror routing.
