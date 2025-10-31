document.addEventListener('DOMContentLoaded', () => {
    const scroller = document.getElementById('auto-scrolling-icons');
    if (scroller) {
        const originalIcons = Array.from(scroller.children);
        for (let i = 0; i < 2; i++) {
            originalIcons.forEach(icon => scroller.appendChild(icon.cloneNode(true)));
        }

        let scrollSpeed = 1.5;
        let totalOriginalWidth = 0;
        let animationFrameId;

        function calculateWidth() {
            totalOriginalWidth = 0;
            originalIcons.forEach(icon => {
                if (icon.offsetWidth) {
                    totalOriginalWidth += icon.offsetWidth + 30;
                }
            });
        }

        function animateScroll() {
            if (totalOriginalWidth > 0) {
                scroller.scrollLeft += scrollSpeed;
                if (scroller.scrollLeft >= totalOriginalWidth) {
                    scroller.scrollLeft = 0;
                }
            }
            animationFrameId = requestAnimationFrame(animateScroll);
        }

        function startAutoScroll() {
            cancelAnimationFrame(animationFrameId);
            calculateWidth();
            animateScroll();
        }

        startAutoScroll();

        let userInteracting = false;
        scroller.addEventListener('scroll', () => {
            if (!userInteracting) return;
        });
        ['mousedown', 'touchstart'].forEach(event => {
            scroller.addEventListener(event, () => { userInteracting = true; });
        });
        ['mouseup', 'touchend'].forEach(event => {
            scroller.addEventListener(event, () => { userInteracting = false; });
        });

        window.addEventListener('resize', calculateWidth);
    }

    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const addressTextElement = button.previousElementSibling;
            const addressText = addressTextElement.innerText;
            const originalText = button.innerText;

            function showCopiedMessage() {
                button.innerText = 'Copied!';
                button.classList.add('copied');
                setTimeout(() => {
                    button.innerText = originalText;
                    button.classList.remove('copied');
                }, 2000);
            }

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(addressText).then(() => {
                    showCopiedMessage();
                }).catch(err => {
                    console.error('Failed to copy with navigator: ', err);
                    fallbackCopy(addressTextElement, showCopiedMessage);
                });
            } else {
                fallbackCopy(addressTextElement, showCopiedMessage);
            }
        });
    });

    function fallbackCopy(elementToCopy, callback) {
        const range = document.createRange();
        range.selectNode(elementToCopy);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                callback();
            } else {
                console.error('Fallback copy failed.');
                alert('Failed to copy address.');
            }
        } catch (err) {
            console.error('Fallback copy error: ', err);
            alert('Failed to copy address.');
        }
        
        window.getSelection().removeAllRanges();
    }

    // --- (هذا هو الجزء الجديد الذي تمت إضافته) ---
    async function fetchTokenStats() {
        document.getElementById('stat-holders').innerText = '3551'; 
        document.getElementById('stat-integrations').innerText = '5';
        
        document.getElementById('stat-marketcap').innerText = '...';
        document.getElementById('stat-volume').innerText = '...';
        document.getElementById('stat-followers').innerText = '...';
        document.getElementById('stat-liquidity').innerText = '...';

        try {
            const coingeckoId = 'shiba-inu';
            const contractAddress = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';

            const cgPromise = fetch(`https://api.coingecko.com/api/v3/coins/${coingeckoId}`);
            const dsPromise = fetch(`https://api.dexscreener.com/latest/Token/Search?q=${contractAddress}`);

            const [cgResponse, dsResponse] = await Promise.all([cgPromise, dsPromise]);

            if (!cgResponse.ok) throw new Error('CoinGecko API failed');
            if (!dsResponse.ok) throw new Error('DexScreener API failed');

            const cgData = await cgResponse.json();
            const dsData = await dsResponse.json();

            const formatNumber = (num) => {
                if (num > 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
                if (num > 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
                if (num > 1_000) return `$${(num / 1_000).toFixed(2)}K`;
                return `$${num.toFixed(0)}`;
            };

            const formatInt = (num) => num.toLocaleString('en-US');

            if (cgData.market_data) {
                document.getElementById('stat-marketcap').innerText = formatNumber(cgData.market_data.market_cap.usd);
                document.getElementById('stat-volume').innerText = formatNumber(cgData.market_data.total_volume.usd);
            }

            if (cgData.community_data) {
                document.getElementById('stat-followers').innerText = formatInt(cgData.community_data.twitter_followers);
            }

            if (dsData.pairs && dsData.pairs.length > 0) {
                const liquidity = parseFloat(dsData.pairs[0].liquidity.usd);
                document.getElementById('stat-liquidity').innerText = formatNumber(liquidity);
            }

        } catch (error) {
            console.error('Failed to fetch token stats:', error);
            document.getElementById('stat-marketcap').innerText = 'N/A';
            document.getElementById('stat-volume').innerText = 'N/A';
            document.getElementById('stat-followers').innerText ='9999';
            document.getElementById('stat-liquidity').innerText = 'N/A';
        }
    }

    fetchTokenStats();
    // --- (نهاية الجزء المضاف) ---

});
