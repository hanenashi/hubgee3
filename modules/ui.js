window.Hubgee = window.Hubgee || {};

window.Hubgee.UI = (function() {
    const Log = window.Hubgee.Logger;

    return {
        injectStyles: function() {
            if (document.getElementById('hubgee3-style')) return;

            const style = document.createElement('style');
            style.id = 'hubgee3-style';
            style.textContent = `
                .hubgee3-btn {
                    transition: transform 0.14s ease, box-shadow 0.14s ease, filter 0.14s ease, opacity 0.14s ease, background 0.2s ease;
                    will-change: transform;
                }
                .hubgee3-btn:not(:disabled):hover { transform: translateY(-1px); filter: brightness(1.04); }
                .hubgee3-btn:not(:disabled):active { transform: scale(0.92); filter: brightness(0.92); }
                .hubgee3-btn.hubgee3-working { animation: hubgee3Pulse 0.9s ease-in-out infinite; cursor: progress !important; opacity: 0.96; }
                .hubgee3-btn.hubgee3-generating { background: #4b5563 !important; cursor: wait !important; opacity: 0.8; animation: hubgee3PulseSlow 2.5s ease-in-out infinite; pointer-events: none; }
                .hubgee3-pop { animation: hubgee3PopAnim 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important; }
                @keyframes hubgee3Pulse { 0% { transform: scale(1); box-shadow: 0 4px 10px rgba(0,0,0,.25); } 50% { transform: scale(1.03); box-shadow: 0 6px 18px rgba(0,0,0,.35); } 100% { transform: scale(1); box-shadow: 0 4px 10px rgba(0,0,0,.25); } }
                @keyframes hubgee3PulseSlow { 0% { filter: brightness(1); } 50% { filter: brightness(1.15); } 100% { filter: brightness(1); } }
                @keyframes hubgee3PopAnim { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
            `;
            document.head.appendChild(style);
            Log.debug('Global UI styles injected.');
        },

        showToast: function(message, bgColor) {
            const toast = document.createElement('div');
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
                background: ${bgColor || '#222'}; color: #fff; padding: 10px 14px;
                border-radius: 8px; font-family: sans-serif; font-size: 13px; font-weight: bold;
                box-shadow: 0 4px 12px rgba(0,0,0,0.35); z-index: 2147483647;
                pointer-events: none; white-space: pre-wrap; max-width: 90vw;
                opacity: 1; transition: opacity 0.25s ease;
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.style.opacity = '0', 1600);
            setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 2000);
        },

        createSourceButton: function(label) {
            const btn = document.createElement('button');
            btn.textContent = label;
            btn.className = 'hubgee3-btn';
            btn.style.cssText = `
                display: block; width: 100%; padding: 14px; margin-bottom: 8px;
                background: #2563eb; color: #fff; border: none; border-radius: 6px;
                font-size: 16px; font-weight: bold; font-family: sans-serif;
                cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,.18);
            `;
            return btn;
        },

        armWorkingOnPress: function(eventTarget, visualTarget) {
            if (!eventTarget || !visualTarget) return null;

            function showWorkingSoon() {
                if (visualTarget.disabled || visualTarget.classList.contains('hubgee3-generating')) return;
                visualTarget.dataset.hubgeePressArmed = '1';
                visualTarget.dataset.hubgeePrevLabel = visualTarget.textContent;
                visualTarget.textContent = 'Working...';
                visualTarget.classList.add('hubgee3-working');
            }

            function cancelWorkingSoon() {
                if (visualTarget.dataset.hubgeePressArmed !== '1') return;
                visualTarget.dataset.hubgeePressArmed = '0';
                visualTarget.classList.remove('hubgee3-working');
                visualTarget.textContent = visualTarget.dataset.hubgeePrevLabel || visualTarget.textContent;
            }

            eventTarget.addEventListener('pointerdown', showWorkingSoon);
            eventTarget.addEventListener('mousedown', showWorkingSoon);
            eventTarget.addEventListener('touchstart', showWorkingSoon, { passive: true });

            eventTarget.addEventListener('pointerleave', cancelWorkingSoon);
            eventTarget.addEventListener('mouseleave', cancelWorkingSoon);
            eventTarget.addEventListener('touchcancel', cancelWorkingSoon, { passive: true });

            return {
                confirmWorking: function() {
                    visualTarget.dataset.hubgeePressArmed = '0';
                    visualTarget.disabled = true;
                    visualTarget.textContent = 'Working...';
                    visualTarget.classList.add('hubgee3-working');
                    visualTarget.classList.remove('hubgee3-pop');
                },
                resetWorking: function(label) {
                    visualTarget.dataset.hubgeePressArmed = '0';
                    visualTarget.disabled = false;
                    visualTarget.classList.remove('hubgee3-working');
                    visualTarget.textContent = label || visualTarget.dataset.hubgeePrevLabel || visualTarget.textContent;

                    visualTarget.classList.add('hubgee3-pop');
                    setTimeout(() => visualTarget.classList.remove('hubgee3-pop'), 300);
                }
            };
        }
    };
})();
