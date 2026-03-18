window.Hubgee = window.Hubgee || {};

window.Hubgee.Config = (function() {
    const Log = window.Hubgee.Logger;

    const KEYS = {
        payload: 'hubgee3_payload',
        baseCode: 'hubgee3_base_code',
        btnPos: 'hubgee3_btn_pos',
        mode: 'hubgee3_mode',
        debug: 'hubgee3_debug'
    };

    const MODES = ['paste', 'download', 'sync'];

    // --- Core Memory Functions ---
    function get(key, fallback) {
        try { return GM_getValue(key, fallback); } 
        catch (err) { return fallback; }
    }

    function set(key, value) {
        try { GM_setValue(key, value); return true; } 
        catch (err) { Log.error('Failed to save state:', key); return false; }
    }

    // --- UI Helpers ---
    function modeLabel(mode) {
        if (mode === 'download') return 'Download';
        if (mode === 'sync') return 'Sync';
        return 'Paste';
    }

    // --- Settings Menu Builder ---
    function buildMenu() {
        if (typeof GM_registerMenuCommand === 'undefined') return;

        const isDebugOn = get(KEYS.debug, false);

        // 1. Toggle Debug Mode
        GM_registerMenuCommand(`🐛 Debug Mode: ${isDebugOn ? 'ON' : 'OFF'}`, () => {
            set(KEYS.debug, !isDebugOn);
            window.location.reload(); 
        });

        // 2. Clear Payload Buffer
        GM_registerMenuCommand('🗑️ Clear Payload Buffer', () => {
            set(KEYS.payload, '');
            if (window.Hubgee.UI) window.Hubgee.UI.showToast('Buffer Cleared', '#d97706');
        });

        // 3. Reset Button Position
        GM_registerMenuCommand('🔄 Reset Button Position', () => {
            set(KEYS.btnPos, null);
            if (window.Hubgee.UI) window.Hubgee.UI.showToast('Position Reset. Refresh page.', '#2563eb');
        });
        
        Log.debug('Native settings menu registered.');
    }

    return {
        KEYS: KEYS,
        MODES: MODES,
        
        get: get,
        set: set,
        modeLabel: modeLabel, // <-- THE MISSING LINK!
        
        isDebug: () => get(KEYS.debug, false),
        
        getMode: () => {
            const m = get(KEYS.mode, 'paste');
            return MODES.includes(m) ? m : 'paste';
        },
        setMode: (m) => {
            if (MODES.includes(m)) set(KEYS.mode, m);
        },
        cycleMode: function() {
            const current = this.getMode();
            const next = MODES[(MODES.indexOf(current) + 1) % MODES.length];
            this.setMode(next);
            return next;
        },
        
        init: function() {
            buildMenu();
            Log.info('Config initialized.');
        }
    };
})();
