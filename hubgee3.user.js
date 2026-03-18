// ==UserScript==
// @name         Hubgee3 - The Bridge (DEV)
// @namespace    https://github.com/hanenashi
// @version      3.0.1-dev
// @description  Modular Copy/Paste/Diff Bridge for AI and GitHub (Bleeding Edge)
// @author       hanenashi
// @match        *://*.gemini.google.com/*
// @match        *://gemini.google.com/*
// @match        *://*.chatgpt.com/*
// @match        *://chatgpt.com/*
// @match        *://*.openai.com/*
// @match        *://*.github.com/*
// @match        *://github.com/*
// @icon         https://raw.githubusercontent.com/hanenashi/hubgee3/main/icon.svg
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
//
// --- THE MODULES (Loading from DEV branch) ---
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/dev/modules/logger.js?v=3.0.1-dev
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/dev/modules/config.js?v=3.0.1-dev
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/dev/modules/utils.js?v=3.0.1-dev
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/dev/modules/ui.js?v=3.0.1-dev
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/dev/modules/ai-handler.js?v=3.0.1-dev
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/dev/modules/git-handler.js?v=3.0.1-dev
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/dev/modules/patcher.js?v=3.0.1-dev
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/dev/modules/core.js?v=3.0.1-dev
// ==/UserScript==

(function() {
    'use strict';
    
    // Ensure the global namespace exists
    window.Hubgee = window.Hubgee || {};

    // Boot the engine from the required core module
    if (window.Hubgee && window.Hubgee.Core) {
        window.Hubgee.Core.init();
    } else {
        console.error('🛑 [Hubgee3 DEV] FATAL: Modules failed to load into the sandbox.');
    }
})();
