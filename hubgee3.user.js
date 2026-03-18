// ==UserScript==
// @name         Hubgee3 - The Bridge
// @namespace    https://github.com/hanenashi
// @version      3.0.0
// @description  Modular Copy/Paste/Diff Bridge for AI and GitHub
// @author       hanenashi
// @match        *://*.gemini.google.com/*
// @match        *://gemini.google.com/*
// @match        *://*.chatgpt.com/*
// @match        *://chatgpt.com/*
// @match        *://*.openai.com/*
// @match        *://*.github.com/*
// @match        *://github.com/*
// @icon         https://raw.githubusercontent.com/hanenashi/hubgee2/main/icon.svg
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
//
// --- THE MODULES ---
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/main/modules/logger.js?v=3.0.0
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/main/modules/config.js?v=3.0.0
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/main/modules/utils.js?v=3.0.0
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/main/modules/ui.js?v=3.0.0
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/main/modules/ai-handler.js?v=3.0.0
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/main/modules/git-handler.js?v=3.0.0
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/main/modules/patcher.js?v=3.0.0
// @require      https://raw.githubusercontent.com/hanenashi/hubgee3/main/modules/core.js?v=3.0.0
// ==/UserScript==

(function() {
    'use strict';
    
    // Ensure the global namespace exists
    window.Hubgee = window.Hubgee || {};

    // Boot the engine from the required core module
    if (window.Hubgee && window.Hubgee.Core) {
        window.Hubgee.Core.init();
    } else {
        console.error('🛑 [Hubgee3] FATAL: Modules failed to load into the sandbox.');
    }
})();
