window.Hubgee = window.Hubgee || {};

window.Hubgee.Core = (function() {
    return {
        init: function() {
            // 1. Ensure the logger exists. If not, use basic console.
            const Log = window.Hubgee.Logger || { info: console.log, debug: console.log, warn: console.warn, error: console.error };
            
            Log.info('Hubgee3 Core Engine booting...');
            
            // 2. Initialize universal configuration & native GM settings menu
            if (window.Hubgee.Config) {
                window.Hubgee.Config.init();
            } else {
                Log.error('Config module missing. Terminating boot.');
                return;
            }

            // 3. Inject global CSS styles immediately
            if (window.Hubgee.UI) {
                window.Hubgee.UI.injectStyles();
            }

            // 4. Traffic Control - Determine environment and boot specific handler
            const host = window.location.hostname;

            if (host.includes('gemini.google.com') || host.includes('chatgpt.com') || host.includes('openai.com')) {
                Log.debug('AI environment detected. Launching AI Handler.');
                if (window.Hubgee.AI) {
                    window.Hubgee.AI.init();
                } else {
                    Log.error('AI Handler module missing.');
                }
            } else if (host.includes('github.com')) {
                Log.debug('GitHub environment detected. Launching Git Handler.');
                if (window.Hubgee.Git) {
                    window.Hubgee.Git.init();
                } else {
                    Log.error('Git Handler module missing.');
                }
            } else {
                Log.warn('Unknown execution environment:', host);
            }
        }
    };
})();
