window.Hubgee = window.Hubgee || {};

window.Hubgee.Utils = (function() {
    const Log = window.Hubgee.Logger;

    return {
        nextFrame: function() {
            return new Promise(resolve => requestAnimationFrame(resolve));
        },
        
        isNodeVisible: function(node) {
            if (!node) return false;
            const style = window.getComputedStyle(node);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                return false;
            }
            const rect = node.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        },
        
        setPayloadFromText: function(text) {
            const Config = window.Hubgee.Config;
            const UI = window.Hubgee.UI;
            
            if (!Config.set(Config.KEYS.payload, text)) {
                if (UI) UI.showToast('Copy failed', '#b91c1c');
                Log.error('Failed to set payload buffer.');
                return false;
            }
            
            if (UI) UI.showToast('Copied ' + text.length + ' chars', '#166534');
            Log.info(`Payload saved to buffer (${text.length} chars).`);
            return true;
        },
        
        downloadPayload: function(text) {
            try {
                const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'code.txt';
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();

                setTimeout(() => {
                    URL.revokeObjectURL(url);
                    if (a.parentNode) a.parentNode.removeChild(a);
                }, 1000);

                Log.info(`Payload downloaded (${text.length} chars).`);
                return true;
            } catch (err) {
                Log.error('Download execution failed:', err);
                return false;
            }
        }
    };
})();
