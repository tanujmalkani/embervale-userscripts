// ==UserScript==
// @name         Embervale Bounty Analyzer
// @namespace    https://github.com/tanujmalkani/embervale-userscripts
// @version      1.0.0
// @description  View, sort, and highlight Embervale bounties by XP/STA and Coins/STA
// @match        https://embervale.tv/*
// @grant        none
// @updateURL    https://cdn.jsdelivr.net/gh/tanujmalkani/embervale-userscripts@latest/Embervale%20Bounty%20Analyzer-1.6.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/tanujmalkani/embervale-userscripts@latest/Embervale%20Bounty%20Analyzer-1.6.user.js
//
// ==/UserScript==
(function () {
    'use strict';

    let container = null;

    function waitForElement(selector, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearInterval(interval);
                    resolve(el);
                }
            }, 500);
            setTimeout(() => {
                clearInterval(interval);
                reject(new Error(`Timeout waiting for ${selector}`));
            }, timeout);
        });
    }

    function getNumberFromItem(item, imageKey) {
        const rows = item.querySelectorAll(".bounty-information-text-item");
        for (const row of rows) {
            const icon = row.children[0];
            const text = row.children[1];
            if (!icon || !text) continue;
            const style = icon.getAttribute("style") || "";
            if (style.includes(imageKey)) {
                return parseInt(text.textContent.trim()) || 0;
            }
        }
        return 0;
    }

    function parseCoins(item, includeItemValue) {
        let bountySilver = 0, bountyCopper = 0;
        let itemSilver = 0, itemCopper = 0;

        const moneyBlocks = item.querySelectorAll('.money-img');
        moneyBlocks.forEach(img => {
            const container = img.closest('div');
            const valueEl = Array.from(container.children).find(
                el => el !== img && /^\d+$/.test(el.textContent.trim())
            );
            const value = valueEl ? parseInt(valueEl.textContent.trim()) : 0;
            const isInsideItemTooltip = img.closest(".rpg-tooltip-content");

            if (img.src.includes('silver.webp')) {
                if (isInsideItemTooltip) itemSilver = value;
                else bountySilver = value;
            }
            if (img.src.includes('copper.webp')) {
                if (isInsideItemTooltip) itemCopper = value;
                else bountyCopper = value;
            }
        });

        const totalSilver = bountySilver + (includeItemValue ? itemSilver : 0);
        const totalCopper = bountyCopper + (includeItemValue ? itemCopper : 0);
        return totalSilver * 100 + totalCopper;
    }

    function extractBountyData(includeItemValue = false) {
        const bounties = [];
        const bountyItems = document.querySelectorAll(".bounty-item");

        bountyItems.forEach(item => {
            const name = item.querySelector(".bounty-title-container span")?.textContent.trim() || "Unknown";
            const xp = getNumberFromItem(item, "core/xp.webp");
            const stamina = getNumberFromItem(item, "stamina.webp");
            const coins = parseCoins(item, includeItemValue);

            bounties.push({
                name,
                xp,
                stamina,
                coins,
                xpPerSta: stamina ? (xp / stamina).toFixed(2) : "∞",
                coinsPerSta: stamina ? (coins / stamina).toFixed(2) : "∞",
                element: item
            });
        });

        return bounties;
    }

    function highlightTopBounty(topBounty) {
        document.querySelectorAll(".bounty-item").forEach(el => {
            el.style.outline = "none";
            el.style.boxShadow = "none";
        });

        if (topBounty?.element) {
            topBounty.element.style.outline = "2px solid gold";
            topBounty.element.style.boxShadow = "0 0 10px 3px rgba(255, 215, 0, 0.6)";
            topBounty.element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    function displayOverlay(bountiesRaw, sortKey = "xpPerSta", includeItemValue = false) {
        if (container) container.remove();

        let bounties = extractBountyData(includeItemValue);
        let collapsed = false;

        container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "20px";
        container.style.right = "20px";
        container.style.background = "rgba(20, 20, 20, 0.85)";
        container.style.backdropFilter = "blur(4px)";
        container.style.color = "#fff";
        container.style.padding = "16px";
        container.style.borderRadius = "12px";
        container.style.boxShadow = "0 8px 24px rgba(0,0,0,0.6)";
        container.style.fontFamily = "Segoe UI, Roboto, sans-serif";
        container.style.fontSize = "14px";
        container.style.lineHeight = "1.4";
        container.style.zIndex = 999999;
        container.style.maxHeight = "80vh";
        container.style.overflowY = "auto";
        container.style.minWidth = "320px";

        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.style.marginBottom = "12px";
        header.innerHTML = `
            <div style="font-weight: bold; font-size: 16px;">🗡 Embervale Bounties</div>
            <div>
                <button id="collapse-overlay" title="Collapse"
                  style="background: none; border: none; color: #ccc; font-size: 16px; cursor: pointer;">🔽</button>
            </div>
        `;
        container.appendChild(header);

        const toggleRow = document.createElement("div");
        toggleRow.style.marginBottom = "12px";
        toggleRow.innerHTML = `
            <label>
                <input type="checkbox" id="toggle-item-value" ${includeItemValue ? "checked" : ""} />
                Include item value in Coin Reward
            </label>
        `;
        container.appendChild(toggleRow);

        const sortRow = document.createElement("div");
        sortRow.style.marginBottom = "12px";
        sortRow.innerHTML = `
            <label for="bounty-sort-mode" style="margin-right: 8px;">Sort by:</label>
            <select id="bounty-sort-mode" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #555; background: #222; color: white;">
                <option value="xpPerSta">XP / STA</option>
                <option value="coinsPerSta">Coins / STA</option>
            </select>
        `;
        container.appendChild(sortRow);

        const listContainer = document.createElement("div");
        listContainer.id = "bounty-list";
        container.appendChild(listContainer);

        document.body.appendChild(container);
        container.querySelector("#bounty-sort-mode").value = sortKey;

        const renderList = () => {
            listContainer.innerHTML = "";
            const sorted = [...bounties].sort((a, b) => {
                if (sortKey === "xpPerSta") return parseFloat(b.xpPerSta) - parseFloat(a.xpPerSta);
                if (sortKey === "coinsPerSta") return parseFloat(b.coinsPerSta) - parseFloat(a.coinsPerSta);
                return 0;
            });
            highlightTopBounty(sorted[0]);

            sorted.forEach(b => {
                const bountyCard = document.createElement("div");
                bountyCard.style.borderBottom = "1px solid #333";
                bountyCard.style.padding = "6px 0";
                bountyCard.innerHTML = `
                    <div style="font-weight: bold; color: #eee;">• ${b.name}</div>
                    <div>XP: ${b.xp} | STA: ${b.stamina} | Coins: ${b.coins}</div>
                    <div>XP/STA: ${b.xpPerSta} | C/STA: ${b.coinsPerSta}</div>
                `;
                listContainer.appendChild(bountyCard);
            });
        };

        renderList();

        container.querySelector("#bounty-sort-mode").addEventListener("change", e => {
            sortKey = e.target.value;
            localStorage.setItem("embervale_sortKey", sortKey);
            renderList();
        });

        container.querySelector("#toggle-item-value").addEventListener("change", e => {
            includeItemValue = e.target.checked;
            localStorage.setItem("embervale_includeItems", includeItemValue);
            bounties = extractBountyData(includeItemValue);
            renderList();
        });

        container.querySelector("#collapse-overlay").addEventListener("click", e => {
            collapsed = !collapsed;
            toggleRow.style.display = collapsed ? "none" : "block";
            sortRow.style.display = collapsed ? "none" : "block";
            listContainer.style.display = collapsed ? "none" : "block";
            e.target.textContent = collapsed ? "▶" : "🔽";
        });
    }

    function updateUI() {
        const board = document.querySelector(".bounty-board");
        if (board && !container) {
            const sortKey = localStorage.getItem("embervale_sortKey") || "xpPerSta";
            const includeItemValue = localStorage.getItem("embervale_includeItems") === "true";
            const bounties = extractBountyData(includeItemValue);
            displayOverlay(bounties, sortKey, includeItemValue);
        } else if (!board && container) {
            container.remove();
            container = null;
        }
    }

    function observeBountyBoard() {
        const observer = new MutationObserver(updateUI);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    const run = async () => {
        await waitForElement(".bounty-board").catch(console.warn);
        updateUI();
        observeBountyBoard();
    };

    run();
})();
