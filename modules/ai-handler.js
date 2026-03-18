window.Hubgee = window.Hubgee || {};

window.Hubgee.AI = (function() {
    const Log = window.Hubgee.Logger;
    const UI = window.Hubgee.UI;
    const Utils = window.Hubgee.Utils;

    function isBlockGenerating(block, isGPT) {
        const now = Date.now();
        const currentLen = block.innerText.length;

        if (block._hubgeeLastLen !== currentLen) {
            block._hubgeeLastLen = currentLen;
            block._hubgeeLastChange = now;
        }

        const recentlyChanged = (now - (block._hubgeeLastChange || 0)) < 1500;
        const allPres = document.querySelectorAll('pre');
        const isLastBlock = allPres[allPres.length - 1] === block;

        if (isGPT) {
            const msgContainer = block.closest('[data-message-author-role="assistant"], article, [role="article"]') || document;
            const hasSpinner = !!(block.parentElement && block.parentElement.querySelector('svg.animate-spin'));
            const isStreaming = !!block.closest('.result-streaming');

            let hasVisibleStopBtn = false;
            const stopBtns = msgContainer.querySelectorAll('button[aria-label*="stop" i]');
            stopBtns.forEach(btn => {
                if (Utils.isNodeVisible(btn)) hasVisibleStopBtn = true;
            });

            const wrapper = block.parentElement && block.parentElement.parentElement;
            const hasNativeCopy = !!(wrapper && wrapper.querySelector('button[aria-label="Copy" i]'));

            return recentlyChanged || hasSpinner || isStreaming || (hasVisibleStopBtn && isLastBlock && !hasNativeCopy);
        } else {
            let hasVisibleStopBtn = false;
            const stopBtns = document.querySelectorAll('button[aria-label*="stop" i], button[aria-label*="Stop stream" i]');
            stopBtns.forEach(btn => {
                if (Utils.isNodeVisible(btn)) hasVisibleStopBtn = true;
            });

            return recentlyChanged || (hasVisibleStopBtn && isLastBlock);
        }
    }

    function initGemini() {
        setInterval(function () {
            if (!window.location.pathname.startsWith('/app/')) return;

            document.querySelectorAll('pre').forEach(function (block, index) {
                const blockNum = index + 1;
                const defaultLabel = `📦 Copy Block #${blockNum}`;
                const isGenerating = isBlockGenerating(block, false);

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
            document.querySelectorAll('pre').forEach(function (pre, index) {
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

            document.querySelectorAll('pre.hubgee3-injected').forEach(function (pre, index) {
                const btn = pre._hubgeeBtn;
                const isGenerating = isBlockGenerating(pre, true);
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
