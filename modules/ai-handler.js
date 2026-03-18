window.Hubgee = window.Hubgee || {};

window.Hubgee.AI = (function() {
    const Log = window.Hubgee.Logger;
    const UI = window.Hubgee.UI;
    const Utils = window.Hubgee.Utils;

    function isBlockGenerating(block, isGPT, isLastBlock) {
        const now = Date.now();
        // Use textContent instead of innerText to avoid triggering a layout reflow just to check length
        const currentLen = (block.textContent || '').length;

        if (block._hubgeeLastLen !== currentLen) {
            block._hubgeeLastLen = currentLen;
            block._hubgeeLastChange = now;
        }

        const recentlyChanged = (now - (block._hubgeeLastChange || 0)) < 1500;

        if (isGPT) {
            const msgContainer = block.closest('[data-message-author-role="assistant"], article, [role="article"]') || document;
            const hasSpinner = !!(block.parentElement && block.parentElement.querySelector('svg.animate-spin'));
            const isStreaming = !!block.closest('.result-streaming');

            let hasVisibleStopBtn = false;
            
            // 🔥 PERFORMANCE FIX: Only run expensive layout-thrashing visibility checks on the final block
            if (isLastBlock) {
                const stopBtns = msgContainer.querySelectorAll('button[aria-label*="stop" i]');
                for (const btn of stopBtns) {
                    if (Utils.isNodeVisible(btn)) {
                        hasVisibleStopBtn = true;
                        break;
                    }
                }
            }

            const wrapper = block.parentElement && block.parentElement.parentElement;
            const hasNativeCopy = !!(wrapper && wrapper.querySelector('button[aria-label="Copy" i]'));

            return recentlyChanged || hasSpinner || isStreaming || (hasVisibleStopBtn && isLastBlock && !hasNativeCopy);
        } else {
            let hasVisibleStopBtn = false;
            if (isLastBlock) {
                const stopBtns = document.querySelectorAll('button[aria-label*="stop" i], button[aria-label*="Stop stream" i]');
                for (const btn of stopBtns) {
                    if (Utils.isNodeVisible(btn)) {
                        hasVisibleStopBtn = true;
                        break;
                    }
                }
            }

            return recentlyChanged || (hasVisibleStopBtn && isLastBlock);
        }
    }

    function initGemini() {
        setInterval(function () {
            if (!window.location.pathname.startsWith('/app/')) return;

            const allPres = document.querySelectorAll('pre');
            allPres.forEach(function (block, index) {
                const blockNum = index + 1;
                const defaultLabel = `📦 Copy Block #${blockNum}`;
                const isLastBlock = index === allPres.length - 1;
                const isGenerating = isBlockGenerating(block, false, isLastBlock);

                if (!block.classList.contains('hubgee3-injected')) {
                    block.classList.add('hubgee3-injected');
                    const btn = UI.createSourceButton(defaultLabel);
                    block._hubgeeBtn = btn;

                    const pressState = UI.armWorkingOnPress(btn, btn);

                    btn.addEventListener('click', async function (e) {
                        e.preventDefault();
                        if (btn.classList.contains('hubgee3-generating')) return;

                        pressState.confirmWorking();
                        await Utils.nextFrame();

                        let rawCode = block.innerText || block.textContent || '';
                        rawCode = rawCode.replace(/\u00a0/g, ' ');
                        const ok = Utils.setPayloadFromText(rawCode);

                        pressState.resetWorking(ok ? `✅ Copied #${blockNum}` : defaultLabel);

                        setTimeout(() => {
                            if (block._hubgeeBtn && !block._hubgeeBtn.classList.contains('hubgee3-generating')) {
                                block._hubgeeBtn.textContent = defaultLabel;
                            }
                        }, 1600);
                    });

                    if (block.parentNode) block.parentNode.insertBefore(btn, block);
                }

                const btn = block._hubgeeBtn;
                if (btn && btn.dataset.hubgeePressArmed !== '1' && !btn.classList.contains('hubgee3-working') && !btn.textContent.includes('✅')) {
                    if (isGenerating) {
                        btn.disabled = true;
                        btn.classList.add('hubgee3-generating');
                        btn.textContent = `⏳ Generating #${blockNum}...`;
                    } else {
                        btn.disabled = false;
                        btn.classList.remove('hubgee3-generating');
                        btn.textContent = defaultLabel;
                    }
                }
            });
        }, 1200);
    }

    function extractChatGPTCodeText(pre) {
        const cmReadonly = pre.querySelector('.cm-content.q9tKkq_readonly') || pre.querySelector('.cm-content');
        if (cmReadonly) return (cmReadonly.innerText || cmReadonly.textContent || '').replace(/\u00a0/g, ' ');
        return (pre.innerText || pre.textContent || '').replace(/\u00a0/g, ' ');
    }

    function initChatGPT() {
        setInterval(function () {
            const allPres = document.querySelectorAll('pre');
            
            // First loop: Ensure all blocks have buttons
            allPres.forEach(function (pre, index) {
                if (pre.classList.contains('hubgee3-injected')) return;
                if (!pre.querySelector('#code-block-viewer') && !pre.querySelector('.cm-editor') && !pre.querySelector('.cm-content')) return;
                
                pre.classList.add('hubgee3-injected');
                const blockNum = index + 1;
                const defaultLabel = `📦 Copy Block #${blockNum}`;
                const btn = UI.createSourceButton(defaultLabel);
                pre._hubgeeBtn = btn;

                const pressState = UI.armWorkingOnPress(btn, btn);

                btn.addEventListener('click', async function (e) {
                    e.preventDefault();
                    if (btn.classList.contains('hubgee3-generating')) return;

                    pressState.confirmWorking();
                    await Utils.nextFrame();

                    const rawCode = extractChatGPTCodeText(pre);
                    const ok = Utils.setPayloadFromText(rawCode);

                    pressState.resetWorking(ok ? `✅ Copied #${blockNum}` : defaultLabel);

                    setTimeout(() => {
                        if (pre._hubgeeBtn && !pre._hubgeeBtn.classList.contains('hubgee3-generating')) {
                            pre._hubgeeBtn.textContent = defaultLabel;
                        }
                    }, 1600);
                });

                if (pre.parentNode) pre.parentNode.insertBefore(btn, pre);
            });

            // Second loop: Dynamic UI Updates
            allPres.forEach(function (pre, index) {
                if (!pre.classList.contains('hubgee3-injected')) return;
                
                const btn = pre._hubgeeBtn;
                const isLastBlock = index === allPres.length - 1;
                const isGenerating = isBlockGenerating(pre, true, isLastBlock);
                const defaultLabel = `📦 Copy Block #${index + 1}`;

                if (btn && btn.dataset.hubgeePressArmed !== '1' && !btn.classList.contains('hubgee3-working') && !btn.textContent.includes('✅')) {
                    if (isGenerating) {
                        btn.disabled = true;
                        btn.classList.add('hubgee3-generating');
                        btn.textContent = `⏳ Generating #${index + 1}...`;
                    } else {
                        btn.disabled = false;
                        btn.classList.remove('hubgee3-generating');
                        btn.textContent = defaultLabel;
                    }
                }
            });
        }, 1200);
    }

    return {
        init: function() {
            initGemini();
            initChatGPT();
            Log.info('AI Handler initialized (Gemini & ChatGPT).');
        }
    };
})();
                    
