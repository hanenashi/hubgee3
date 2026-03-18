window.Hubgee = window.Hubgee || {};

window.Hubgee.Git = (function() {
    const Log = window.Hubgee.Logger;
    const UI = window.Hubgee.UI;
    const Utils = window.Hubgee.Utils;
    const Config = window.Hubgee.Config;

    function locateGitHubEditor() {
        const selectors = [
            '.cm-content[contenteditable="true"]',
            'textarea.file-editor-textarea',
            'textarea[aria-label*="file editor" i]',
            'textarea[aria-label*="editor" i]',
            '.cm-editor textarea',
            '[data-testid="codemirror-editor"] textarea',
            'textarea'
        ];

        for (const selector of selectors) {
            const els = document.querySelectorAll(selector);
            for (const el of els) {
                const cls = (el.className || '').toLowerCase();
                const aria = (el.getAttribute('aria-label') || '').toLowerCase();
                const name = (el.getAttribute('name') || '').toLowerCase();
                const id = (el.id || '').toLowerCase();

                if (
                    cls.includes('form-control') || aria.includes('commit') ||
                    aria.includes('description') || aria.includes('pull request') ||
                    name.includes('message') || name.includes('description') ||
                    name.includes('feedback') || name.includes('filename') ||
                    id.includes('commit') || id.includes('search')
                ) continue;

                return el;
            }
        }
        return null;
    }

    async function injectIntoGitHubEditor(newText) {
        const target = locateGitHubEditor();
        if (!target) {
            UI.showToast('No GitHub editor found', '#b91c1c');
            Log.error('GitHub editor target not found.');
            return false;
        }

        try { target.focus(); } catch (err) {}
        let ok = false;

        if (target.tagName === 'TEXTAREA') {
            try {
                const desc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
                const nativeSetter = desc && desc.set ? desc.set : null;
                if (nativeSetter) nativeSetter.call(target, newText);
                else target.value = newText;

                target.dispatchEvent(new InputEvent('input', { bubbles: true, data: newText, inputType: 'insertText' }));
                target.dispatchEvent(new Event('change', { bubbles: true }));
                ok = true;
            } catch (err) { Log.error('Textarea injection failed:', err); }
        }

        if (!ok && target.isContentEditable) {
            try {
                target.focus();
                document.execCommand('selectAll');
                
                ok = await new Promise(resolve => {
                    requestAnimationFrame(() => {
                        try { resolve(!!document.execCommand('insertText', false, newText)); } 
                        catch (err) { resolve(false); }
                    });
                });

                if (!ok) {
                    target.textContent = newText;
                    target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: newText }));
                    ok = true;
                }

                setTimeout(() => { try { target.blur(); } catch(e){} }, 50);
            } catch (err) { Log.error('ContentEditable injection failed:', err); }
        }
        return ok;
    }

    function ensureGitHubButton() {
        if (!window.location.pathname.includes('/edit/')) {
            const existing = document.getElementById('hubgee3-github-container');
            if (existing) existing.remove();
            return;
        }

        const existing = document.getElementById('hubgee3-github-container');
        if (existing) {
            const btn = existing.querySelector('button');
            if (btn && !btn.classList.contains('hubgee3-working')) btn.textContent = Config.modeLabel(Config.getMode());
            return;
        }

        const wrap = document.createElement('div');
        wrap.id = 'hubgee3-github-container';
        wrap.style.cssText = `
            position: fixed; top: 0; left: 0; z-index: 2147483645;
            touch-action: none; user-select: none; -webkit-user-select: none;
            transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
            cursor: pointer; -webkit-tap-highlight-color: transparent;
            width: max-content; height: max-content; display: inline-block;
        `;

        let savedPos = Config.get(Config.KEYS.btnPos, null);
        if (!savedPos || typeof savedPos.x !== 'number') savedPos = { x: window.innerWidth - 110, y: window.innerHeight - 80 };

        const initMaxX = Math.max(0, window.innerWidth - 110);
        const initMaxY = Math.max(0, window.innerHeight - 60);
        savedPos.x = Math.max(5, Math.min(savedPos.x, initMaxX));
        savedPos.y = Math.max(5, Math.min(savedPos.y, initMaxY));

        wrap.style.transform = `translate(${savedPos.x}px, ${savedPos.y}px)`;

        const actionBtn = document.createElement('button');
        actionBtn.textContent = Config.modeLabel(Config.getMode());
        actionBtn.className = 'hubgee3-btn';
        actionBtn.style.cssText = `
            padding: 16px 20px; background: #dc2626; color: #fff; border: none;
            border-radius: 8px; font-weight: bold; font-size: 16px; font-family: sans-serif;
            box-shadow: 0 4px 10px rgba(0,0,0,.35); pointer-events: none;
        `;

        wrap.appendChild(actionBtn);
        document.body.appendChild(wrap);

        const pressState = {
            confirmWorking: function () {
                actionBtn.dataset.hubgeePrevLabel = actionBtn.textContent;
                actionBtn.disabled = true;
                actionBtn.textContent = 'Working...';
                actionBtn.classList.add('hubgee3-working');
                actionBtn.classList.remove('hubgee3-pop');
            },
            resetWorking: function (label) {
                actionBtn.disabled = false;
                actionBtn.classList.remove('hubgee3-working');
                actionBtn.textContent = label || actionBtn.dataset.hubgeePrevLabel || actionBtn.textContent;
                actionBtn.classList.add('hubgee3-pop');
                setTimeout(() => actionBtn.classList.remove('hubgee3-pop'), 300);
            }
        };

        let isTouching = false, isLongPress = false, hasMoved = false, longPressTimer;

        function executeLongPress() {
            if (isLongPress || hasMoved) return;
            isLongPress = true;

            const next = Config.cycleMode();
            if (!actionBtn.classList.contains('hubgee3-working')) actionBtn.textContent = Config.modeLabel(next);
            UI.showToast('Mode: ' + Config.modeLabel(next), '#7c3aed');

            wrap.style.transform = `translate(${savedPos.x}px, ${savedPos.y}px) scale(1.1)`;
            setTimeout(() => {
                if (isTouching && !hasMoved) wrap.style.transform = `translate(${savedPos.x}px, ${savedPos.y}px) scale(0.92)`;
                else if (!isTouching) wrap.style.transform = `translate(${savedPos.x}px, ${savedPos.y}px) scale(1.0)`;
            }, 150);
        }

        wrap.addEventListener('contextmenu', e => { e.preventDefault(); executeLongPress(); });

        async function triggerAction() {
            const incoming = Config.get(Config.KEYS.payload, '');
            if (!incoming || typeof incoming !== 'string') {
                UI.showToast('Buffer empty', '#b91c1c');
                return;
            }

            const mode = Config.getMode();
            pressState.confirmWorking();
            await Utils.nextFrame();

            try {
                if (mode === 'download') {
                    const ok = Utils.downloadPayload(incoming);
                    pressState.resetWorking(Config.modeLabel(Config.getMode()));
                    UI.showToast(ok ? `Downloaded ${incoming.length} chars` : 'Download failed', ok ? '#166534' : '#b91c1c');
                    return;
                }

                // If mode === 'sync', this is where our patcher logic will hook in the future!

                const ok = await injectIntoGitHubEditor(incoming);
                pressState.resetWorking(Config.modeLabel(Config.getMode()));
                UI.showToast(ok ? `Pasted ${incoming.length} chars` : 'Paste failed', ok ? '#166534' : '#b91c1c');
            } catch (err) {
                pressState.resetWorking(Config.modeLabel(Config.getMode()));
                UI.showToast('Action failed', '#b91c1c');
                Log.error('Action execution failed:', err);
            }
        }

        const handleStart = (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            if (e.cancelable) e.preventDefault();

            isTouching = true; isLongPress = false; hasMoved = false;
            const startX = e.clientX, startY = e.clientY;
            const initialPos = { ...savedPos };

            wrap.style.transform = `translate(${initialPos.x}px, ${initialPos.y}px) scale(0.92)`;
            longPressTimer = setTimeout(() => executeLongPress(), 550);

            const handleMove = (moveEvent) => {
                if (moveEvent.cancelable) moveEvent.preventDefault();
                const dx = moveEvent.clientX - startX, dy = moveEvent.clientY - startY;

                if (!hasMoved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
                    hasMoved = true;
                    clearTimeout(longPressTimer);
                }

                if (hasMoved) {
                    let nextX = initialPos.x + dx, nextY = initialPos.y + dy;
                    const rect = wrap.getBoundingClientRect();
                    const maxX = window.innerWidth - (rect.width / 0.92), maxY = window.innerHeight - (rect.height / 0.92);

                    savedPos.x = Math.max(5, Math.min(nextX, maxX - 5));
                    savedPos.y = Math.max(5, Math.min(nextY, maxY - 5));
                    wrap.style.transform = `translate(${savedPos.x}px, ${savedPos.y}px) scale(0.92)`;
                }
            };

            const handleEnd = () => {
                clearTimeout(longPressTimer);
                window.removeEventListener('pointermove', handleMove);
                window.removeEventListener('pointerup', handleEnd);
                window.removeEventListener('pointercancel', handleEnd);

                isTouching = false;
                wrap.style.transform = `translate(${savedPos.x}px, ${savedPos.y}px) scale(1.0)`;

                if (hasMoved) Config.set(Config.KEYS.btnPos, savedPos);
                else if (!isLongPress) { triggerAction(); isLongPress = true; }
            };

            window.addEventListener('pointermove', handleMove, { passive: false });
            window.addEventListener('pointerup', handleEnd, { passive: false });
            window.addEventListener('pointercancel', handleEnd, { passive: false });
        };

        wrap.addEventListener('pointerdown', handleStart);
        wrap.hubgeePos = savedPos;
    }

    return {
        init: function() {
            ensureGitHubButton();
            setInterval(ensureGitHubButton, 800);

            let lastUrl = location.href;
            setInterval(function () {
                if (location.href !== lastUrl) {
                    lastUrl = location.href;
                    ensureGitHubButton();
                }
            }, 500);

            window.addEventListener('resize', () => {
                const wrap = document.getElementById('hubgee3-github-container');
                if (wrap && wrap.hubgeePos) {
                    const rect = wrap.getBoundingClientRect();
                    const maxX = window.innerWidth - rect.width, maxY = window.innerHeight - rect.height;

                    let clampedX = Math.max(5, Math.min(wrap.hubgeePos.x, maxX - 5));
                    let clampedY = Math.max(5, Math.min(wrap.hubgeePos.y, maxY - 5));

                    if (clampedX !== wrap.hubgeePos.x || clampedY !== wrap.hubgeePos.y) {
                        wrap.hubgeePos.x = clampedX;
                        wrap.hubgeePos.y = clampedY;
                        wrap.style.transform = `translate(${wrap.hubgeePos.x}px, ${wrap.hubgeePos.y}px) scale(1.0)`;
                        Config.set(Config.KEYS.btnPos, wrap.hubgeePos);
                    }
                }
            }, { passive: true });
            
            Log.info('Git Handler initialized.');
        }
    };
})();
