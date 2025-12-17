// ==UserScript==
// @name         Embervale Bounty Analyzer
// @namespace    https://embervale.tv/
// @version      2.5.0
// @description  Embervale bounty analyzer with sorting, side-quest highlighting, draggable & minimizable overlay
// @match        https://embervale.tv/*
// @updateURL    https://tanujmalkani.github.io/embervale-userscripts/embervale-bounty.user.js
// @downloadURL  https://tanujmalkani.github.io/embervale-userscripts/embervale-bounty.user.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let overlay = null;
  let minimized = false;

  /* =========================
     HELPERS
  ========================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const LS = {
    sort: 'ev_sort',
    sideEnabled: 'ev_side_enabled',
    sideClass: 'ev_side_class',
    sideStars: 'ev_side_stars',
    posX: 'ev_overlay_x',
    posY: 'ev_overlay_y',
    minimized: 'ev_overlay_min'
  };

  /* =========================
     PARSE BOUNTIES
  ========================= */
  function parseAllBounties() {
    const results = [];

    $$('.bounty-item').forEach(item => {
      const name =
        item.querySelector('.bounty-title span')?.textContent.trim() ||
        'Unknown';

      let bountyClass = null;
      const classImg = item.querySelector('.bounty-class-icon');
      if (classImg?.src) {
        bountyClass = classImg.src.split('/').pop().replace('.webp', '');
      }

      let stars = 0;
      const starBox = $$('.bounty-stat-box-left', item).find(box =>
        box.querySelector('.bounty-stat-icon')
          ?.style.backgroundImage.includes('star.webp')
      );
      if (starBox) {
        stars = parseInt(
          starBox.querySelector('.bounty-stat-value')?.textContent.trim() || '0',
          10
        );
      }

      let xp = 0, stamina = 0;
      $$('.bounty-stat-box-right', item).forEach(box => {
        const val = parseInt(
          box.querySelector('.bounty-stat-value')?.textContent.trim() || '0',
          10
        );
        const icon = box.querySelector('.bounty-stat-icon')?.style.backgroundImage || '';
        if (icon.includes('xp.webp')) xp = val;
        if (icon.includes('stamina.webp')) stamina = val;
      });

      let silver = 0, copper = 0;
      $$('img.money-img', item).forEach(img => {
        const v = parseInt(img.nextElementSibling?.textContent.trim() || '0', 10);
        if (img.src.includes('silver.webp')) silver = v;
        if (img.src.includes('copper.webp')) copper = v;
      });

      const coins = silver * 100 + copper;

      results.push({
        name,
        class: bountyClass,
        stars,
        xp,
        stamina,
        coins,
        xpPerSta: stamina ? +(xp / stamina).toFixed(2) : Infinity,
        coinsPerSta: stamina ? +(coins / stamina).toFixed(2) : Infinity,
        element: item
      });
    });

    return results;
  }

  /* =========================
     HIGHLIGHTING
  ========================= */
  function clearHighlights(bounties) {
    bounties.forEach(b => {
      b.element.style.outline = '';
      b.element.style.boxShadow = '';
    });
  }

  function highlightTopBounty(bounty) {
    if (!bounty) return;
    bounty.element.style.outline = '2px solid gold';
    bounty.element.style.boxShadow = '0 0 12px rgba(255,215,0,0.7)';
  }

  function applySideQuestHighlight(bounties) {
    if (localStorage.getItem(LS.sideEnabled) !== 'true') return;

    const fClass = localStorage.getItem(LS.sideClass) || 'none';
    const fStars = localStorage.getItem(LS.sideStars) || 'none';
    if (fClass === 'none' && fStars === 'none') return;

    bounties.forEach(b => {
      let match = false;
      if (fClass !== 'none' && b.class === fClass) match = true;
      if (fStars !== 'none' && b.stars === Number(fStars)) match = true;
      if (match) {
        b.element.style.outline = '2px solid #a855f7';
        b.element.style.boxShadow = '0 0 10px rgba(168,85,247,0.7)';
      }
    });
  }

  /* =========================
     OVERLAY UI
  ========================= */
  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;
      background:rgba(20,20,20,0.85);
      backdrop-filter:blur(6px);
      color:#fff;
      z-index:999999;
      padding:10px;
      border-radius:10px;
      font-family:system-ui,sans-serif;
      font-size:11px;
      min-width:300px;
      max-height:80vh;
      overflow:auto;
    `;

    const x = localStorage.getItem(LS.posX);
    const y = localStorage.getItem(LS.posY);
    overlay.style.left = x ? `${x}px` : 'auto';
    overlay.style.top = y ? `${y}px` : '16px';
    overlay.style.right = x ? 'auto' : '16px';

    overlay.innerHTML = `
      <div id="ev-header"
           style="display:flex;justify-content:space-between;
                  align-items:center;cursor:move">
        <div id="ev-title" style="font-weight:bold">
          🗡 Embervale Bounty Analyzer
        </div>
        <button id="ev-min"
                style="background:none;border:none;color:#ccc;
                       cursor:pointer;font-size:12px">
          ▾
        </button>
      </div>

      <div id="ev-body">
        <div style="text-align:center;margin:6px 0">
          <select id="ev-sort">
            <option value="xpPerSta">XP / STA</option>
            <option value="coinsPerSta">Coins / STA</option>
          </select>
        </div>

        <div style="text-align:center;margin-bottom:6px">
          <label>
            <input type="checkbox" id="ev-side-enabled">
            Highlight Side Quest
          </label>
        </div>

        <div id="ev-side-filters"
             style="display:none;gap:6px;justify-content:center;
                    align-items:center;margin-bottom:8px">
          <select id="ev-side-class">
            <option value="none">Class</option>
            <option value="warrior">Warrior</option>
            <option value="knight">Knight</option>
            <option value="rogue">Rogue</option>
            <option value="ranger">Ranger</option>
            <option value="mage">Mage</option>
          </select>

          <select id="ev-side-stars">
            <option value="none">Stars</option>
            <option value="1">1★</option>
            <option value="2">2★</option>
            <option value="3">3★</option>
            <option value="4">4★</option>
            <option value="5">5★</option>
          </select>
        </div>

        <hr style="border-color:#333">

        <div id="ev-list" style="text-align:center"></div>
      </div>
    `;

    document.body.appendChild(overlay);
    enableDrag();

    minimized = localStorage.getItem(LS.minimized) === 'true';
    applyMinimizeState();

    $('#ev-sort').value = localStorage.getItem(LS.sort) || 'xpPerSta';
    $('#ev-side-enabled').checked = localStorage.getItem(LS.sideEnabled) === 'true';
    $('#ev-side-class').value = localStorage.getItem(LS.sideClass) || 'none';
    $('#ev-side-stars').value = localStorage.getItem(LS.sideStars) || 'none';

    $('#ev-side-filters').style.display =
      $('#ev-side-enabled').checked ? 'flex' : 'none';

    $('#ev-min').onclick = toggleMinimize;
    $('#ev-title').onclick = toggleMinimize;

    overlay.addEventListener('change', refresh);
  }

  function toggleMinimize() {
    minimized = !minimized;
    localStorage.setItem(LS.minimized, minimized);
    applyMinimizeState();
  }

  function applyMinimizeState() {
    $('#ev-body').style.display = minimized ? 'none' : 'block';
    $('#ev-min').textContent = minimized ? '▸' : '▾';
  }

  /* =========================
     DRAG HANDLER
  ========================= */
  function enableDrag() {
    const handle = $('#ev-header');
    let startX, startY, startLeft, startTop, dragging = false;

    handle.addEventListener('mousedown', e => {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = overlay.offsetLeft;
      startTop = overlay.offsetTop;
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      overlay.style.left = `${startLeft + (e.clientX - startX)}px`;
      overlay.style.top = `${startTop + (e.clientY - startY)}px`;
      overlay.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      document.body.style.userSelect = '';
      localStorage.setItem(LS.posX, overlay.offsetLeft);
      localStorage.setItem(LS.posY, overlay.offsetTop);
    });
  }

  /* =========================
     RENDER
  ========================= */
  function refresh() {
    if (!overlay || minimized) return;

    localStorage.setItem(LS.sort, $('#ev-sort').value);
    localStorage.setItem(LS.sideEnabled, $('#ev-side-enabled').checked);
    localStorage.setItem(LS.sideClass, $('#ev-side-class').value);
    localStorage.setItem(LS.sideStars, $('#ev-side-stars').value);

    $('#ev-side-filters').style.display =
      $('#ev-side-enabled').checked ? 'flex' : 'none';

    const list = $('#ev-list');
    list.innerHTML = '';

    const bounties = parseAllBounties();
    clearHighlights(bounties);

    const sortKey = $('#ev-sort').value;
    bounties.sort((a, b) => b[sortKey] - a[sortKey]);

    highlightTopBounty(bounties[0]);
    applySideQuestHighlight(bounties);

    bounties.forEach(b => {
      const row = document.createElement('div');
      row.style.cssText = 'margin-bottom:8px;cursor:pointer';
      row.innerHTML = `
        <strong>${b.name}</strong><br>
        XP:${b.xp} STA:${b.stamina} Coins:${b.coins}<br>
        XP/STA:${b.xpPerSta} | C/STA:${b.coinsPerSta}
      `;
      row.onclick = () =>
        b.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      list.appendChild(row);
    });
  }

  /* =========================
     LIFECYCLE
  ========================= */
  function updateLifecycle() {
    const board = $('.bounty-board');

    if (board && !overlay) {
      buildOverlay();
      refresh();
    }

    if (!board && overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  new MutationObserver(updateLifecycle).observe(document.body, {
    childList: true,
    subtree: true
  });

})();
