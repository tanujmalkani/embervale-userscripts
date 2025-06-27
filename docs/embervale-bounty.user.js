// ==UserScript==
// @name         Embervale Bounty Analyzer (Final Edition)
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Sort, highlight, and filter bounties by XP/STA, coins, class, type, stars, with glossary detection and draggable compact UI
// @match        https://embervale.tv/*
// @grant        none
// @updateURL    https://tanujmalkani.github.io/embervale-userscripts/embervale-bounty.user.js
// @downloadURL  https://tanujmalkani.github.io/embervale-userscripts/embervale-bounty.user.js
// ==/UserScript==

(function () {
  'use strict';

  let container = null;

  const CLASS_OPTIONS = ["None", "Warrior", "Knight", "Rogue", "Ranger", "Mage"];
  const TYPE_OPTIONS = [
    "None", "Abomination", "Aquatic", "Beast", "Construct", "Dragon", "Elemental",
    "Humanoid", "Insect", "Mimic", "Plant", "Slime", "Undead"
  ];
  const STAR_OPTIONS = ["None", "1", "2", "3", "4", "5"];

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
      const titleSpan = item.querySelector(".bounty-title-container span");
      const hasGlossary = titleSpan && titleSpan.style.borderBottom && titleSpan.style.borderBottom !== "";

      const name = titleSpan?.textContent.trim() || "Unknown";
      const xp = getNumberFromItem(item, "core/xp.webp");
      const stamina = getNumberFromItem(item, "stamina.webp");
      const coins = parseCoins(item, includeItemValue);
      const textContent = item.textContent.toLowerCase();

      bounties.push({
        name,
        xp,
        stamina,
        coins,
        hasGlossary,
        textContent,
        xpPerSta: stamina ? (xp / stamina).toFixed(2) : "∞",
        coinsPerSta: stamina ? (coins / stamina).toFixed(2) : "∞",
        element: item
      });
    });

    return bounties;
  }

  function clearHighlights() {
    document.querySelectorAll(".bounty-item").forEach(el => {
      el.style.outline = "none";
      el.style.boxShadow = "none";
    });
  }

  function highlightBounty(bounty, color = "gold") {
    const style = {
      gold: ["2px solid gold", "0 0 10px 3px rgba(255,215,0,0.6)"],
      purple: ["2px solid #a050f5", "0 0 10px rgba(160,80,245,0.6)"]
    };
    if (bounty?.element) {
      bounty.element.style.outline = style[color][0];
      bounty.element.style.boxShadow = style[color][1];
    }
  }
  function displayOverlay(bounties, sortKey, includeItemValue, highlightSideQuests, classFilter, typeFilter, starsFilter) {
    if (container) container.remove();
    clearHighlights();

    container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.background = "rgba(20,20,20,0.85)";
    container.style.backdropFilter = "blur(4px)";
    container.style.color = "#fff";
    container.style.padding = "16px";
    container.style.borderRadius = "12px";
    container.style.boxShadow = "0 8px 24px rgba(0,0,0,0.6)";
    container.style.fontFamily = "Segoe UI, sans-serif";
    container.style.fontSize = "13px";
    container.style.zIndex = 999999;
    container.style.maxHeight = "80vh";
    container.style.overflowY = "auto";
    container.style.minWidth = "350px";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.marginBottom = "12px";
    header.style.cursor = "move";
    header.innerHTML = `
      <div style="font-weight: bold; font-size: 14px;">🗡 Embervale Bounties</div>
      <button id="collapse-overlay" style="background:none;border:none;color:#ccc;font-size:14px;">🔽</button>
    `;
    container.appendChild(header);

    let isDragging = false, offsetX = 0, offsetY = 0;
    header.addEventListener("mousedown", e => {
      isDragging = true;
      offsetX = e.clientX - container.getBoundingClientRect().left;
      offsetY = e.clientY - container.getBoundingClientRect().top;
    });
    document.addEventListener("mousemove", e => {
      if (isDragging) {
        container.style.top = `${e.clientY - offsetY}px`;
        container.style.left = `${e.clientX - offsetX}px`;
        container.style.right = "auto";
      }
    });
    document.addEventListener("mouseup", () => (isDragging = false));

    const options = document.createElement("div");
    options.style.marginBottom = "12px";
    options.innerHTML = `
      <label><input type="checkbox" id="toggle-item-value" ${includeItemValue ? "checked" : ""}/> Include item value</label><br>
      <label><input type="checkbox" id="toggle-sidequest" ${highlightSideQuests ? "checked" : ""}/> Highlight Side Quests</label>
      <div id="sidequest-filters" style="margin-top:8px; ${highlightSideQuests ? "" : "display:none"};">
        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
          <label>Class:
            <select id="filter-class">${CLASS_OPTIONS.map(c => `<option ${c === classFilter ? "selected" : ""}>${c}</option>`).join("")}</select>
          </label>
          <label>Type:
            <select id="filter-type">${TYPE_OPTIONS.map(t => `<option ${t === typeFilter ? "selected" : ""}>${t}</option>`).join("")}</select>
          </label>
          <label>Stars:
            <select id="filter-stars">${STAR_OPTIONS.map(s => `<option ${s === starsFilter ? "selected" : ""}>${s}</option>`).join("")}</select>
          </label>
        </div>
      </div>
    `;
    container.appendChild(options);

    const sortRow = document.createElement("div");
    sortRow.style.margin = "12px 0";
    sortRow.innerHTML = `
      <label for="bounty-sort-mode">Sort by:</label>
      <select id="bounty-sort-mode">
        <option value="xpPerSta" ${sortKey === "xpPerSta" ? "selected" : ""}>XP / STA</option>
        <option value="coinsPerSta" ${sortKey === "coinsPerSta" ? "selected" : ""}>Coins / STA</option>
      </select>
    `;
    container.appendChild(sortRow);

    const list = document.createElement("div");
    list.id = "bounty-list";
    container.appendChild(list);

    document.body.appendChild(container);

    function renderList() {
      list.innerHTML = "";
      clearHighlights();

      const sorted = [...bounties].sort((a, b) =>
        sortKey === "xpPerSta"
          ? parseFloat(b.xpPerSta) - parseFloat(a.xpPerSta)
          : parseFloat(b.coinsPerSta) - parseFloat(a.coinsPerSta)
      );

      const glossaryMatches = sorted.filter(b => b.hasGlossary);
      if (glossaryMatches.length) {
        const glossaryLine = document.createElement("div");
        glossaryLine.style.color = "#ffd700";
        glossaryLine.style.fontWeight = "bold";
        glossaryLine.style.marginBottom = "8px";
        glossaryLine.textContent = `⭐ Bounty with Glossary Entry: ${glossaryMatches.map(b => b.name).join(", ")}`;
        list.appendChild(glossaryLine);
      }

      if (sorted.length > 0) {
        highlightBounty(sorted[0], "gold");
        const maxLine = document.createElement("div");
        maxLine.style.color = "#ffd700";
        maxLine.style.fontWeight = "bold";
        maxLine.style.marginBottom = "8px";
        maxLine.textContent = sortKey === "xpPerSta"
          ? `⭐ Max EXP/Sta: ${sorted[0].name}`
          : `⭐ Max Coins/Sta: ${sorted[0].name}`;
        list.appendChild(maxLine);
      }

      sorted.forEach(b => {
        const isClassMatch = classFilter !== "None" && b.textContent.includes(classFilter.toLowerCase());
        const isTypeMatch = typeFilter !== "None" && b.textContent.includes(typeFilter.toLowerCase());
        const isStarsMatch = starsFilter !== "None" && b.textContent.includes(`${starsFilter}★`);
        const isSideQuest = highlightSideQuests && (isClassMatch || isTypeMatch || isStarsMatch);

        if (isSideQuest) highlightBounty(b, "purple");

        const el = document.createElement("div");
        el.style.borderBottom = "1px solid #333";
        el.style.padding = "6px 0";
        el.style.cursor = "pointer";
        el.innerHTML = `
          <div style="font-weight:bold;color:${isSideQuest ? '#c186f6' : '#eee'};">
          ${isSideQuest ? `💠 Side Quest Match: ${b.name}` : `• ${b.name}`}
          </div>
          <div>XP: ${b.xp} | STA: ${b.stamina} | Coins: ${b.coins}</div>
          <div>XP/STA: ${b.xpPerSta} | C/STA: ${b.coinsPerSta}</div>
        `;

      el.addEventListener("click", () => {
        b.element.scrollIntoView({ behavior: "smooth", block: "center" });
      });

list.appendChild(el);
      });
    }

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

    container.querySelector("#toggle-sidequest").addEventListener("change", e => {
      highlightSideQuests = e.target.checked;
      localStorage.setItem("embervale_highlightSideQuests", highlightSideQuests);
      document.getElementById("sidequest-filters").style.display = highlightSideQuests ? "" : "none";
      renderList();
    });

    container.querySelector("#filter-class").addEventListener("change", e => {
      classFilter = e.target.value;
      localStorage.setItem("embervale_sidequestClass", classFilter);
      renderList();
    });

    container.querySelector("#filter-type").addEventListener("change", e => {
      typeFilter = e.target.value;
      localStorage.setItem("embervale_sidequestType", typeFilter);
      renderList();
    });

    container.querySelector("#filter-stars").addEventListener("change", e => {
      starsFilter = e.target.value;
      localStorage.setItem("embervale_sidequestStars", starsFilter);
      renderList();
    });

    container.querySelector("#collapse-overlay").addEventListener("click", e => {
      const shouldCollapse = container.classList.toggle("collapsed");
      Array.from(container.children).forEach((c, i) => {
        if (i > 0) c.style.display = shouldCollapse ? "none" : "";
      });
      e.target.textContent = shouldCollapse ? "▶" : "🔽";
    });
  }

  function updateUI() {
    const board = document.querySelector(".bounty-board");
    if (board && !container) {
      const sortKey = localStorage.getItem("embervale_sortKey") || "xpPerSta";
      const includeItemValue = localStorage.getItem("embervale_includeItems") === "true";
      const highlightSideQuests = localStorage.getItem("embervale_highlightSideQuests") === "true";
      const classFilter = localStorage.getItem("embervale_sidequestClass") || "None";
      const typeFilter = localStorage.getItem("embervale_sidequestType") || "None";
      const starsFilter = localStorage.getItem("embervale_sidequestStars") || "None";
      const bounties = extractBountyData(includeItemValue);
      displayOverlay(bounties, sortKey, includeItemValue, highlightSideQuests, classFilter, typeFilter, starsFilter);
    } else if (!board && container) {
      container.remove();
      container = null;
    }
  }

  const observe = new MutationObserver(updateUI);
  observe.observe(document.body, { childList: true, subtree: true });

  waitForElement(".bounty-board").then(updateUI);
})();
