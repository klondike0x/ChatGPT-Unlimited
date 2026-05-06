// ==UserScript==
// @name         ChatGPT-Unlimited
// @homepageURL  https://github.com/klondike0x/ChatGPT-Unlimited
// @version      2.0.1
// @description  Removes message limits in ChatGPT
// @author       klondike0x
// @match        *://chatgpt.com/*
// @icon         https://raw.githubusercontent.com/klondike0x/ChatGPT-Unlimited/refs/heads/main/canvas.png
// @updateURL    https://raw.githubusercontent.com/klondike0x/ChatGPT-Unlimited/main/ChatGPT-Unlimited.user.js?update=1
// @downloadURL  https://raw.githubusercontent.com/klondike0x/ChatGPT-Unlimited/main/ChatGPT-Unlimited.user.js?update=1
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "enhancer_enabled";
  let enabled = localStorage.getItem(STORAGE_KEY) !== "false";
  let ticking = false;

  // ---------------------------
  // BUTTON
  // ---------------------------
  function getSendButton() {
    return document.querySelector(
      'button[data-testid="send-button"], button[type="submit"]',
    );
  }

  function enableButton() {
    if (!enabled) return;

    const btn = getSendButton();
    if (!btn) return;

    btn.disabled = false;
    btn.removeAttribute("disabled");
  }

  // ---------------------------
  // OVERLAY FIX
  // ---------------------------
  function removeOverlay() {
    if (!enabled) return;

    const el = document.querySelector("div.absolute.start-0.end-0.bottom-full");
    if (el) el.remove();
  }

  // ---------------------------
  // LIMIT DETECTOR
  // ---------------------------
  function detectLimit() {
    const errorBlocks = document.querySelectorAll(
      '[data-testid="conversation-turn"], .text-token-text-error',
    );

    let hasLimit = false;

    errorBlocks.forEach((el) => {
      const text = el.innerText.toLowerCase();

      if (
        text.includes("исчерпали") ||
        text.includes("limit reached") ||
        text.includes("try again later") ||
        text.includes("лимит")
      ) {
        hasLimit = true;
      }
    });

    if (hasLimit) {
      updateStatus("LIMIT");
    } else {
      updateStatus(enabled ? "ON" : "OFF");
    }
  }

  // ---------------------------
  // BADGE
  // ---------------------------
  function addBadge() {
    const wordmark = document.querySelector(
      'button[data-testid="model-switcher-dropdown-button"] .header-wordmark',
    );

    if (!wordmark) return;
    if (wordmark.parentElement.querySelector(".klondike-badge")) return;

    const badge = document.createElement("span");
    badge.className = "klondike-badge";

    badge.innerHTML = `
      <span class="dot"></span>
      <span class="text">Enhancer</span>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .klondike-badge {
        display:inline-flex;
        align-items:center;
        gap:5px;
        margin-left:8px;
        padding:2px 8px;
        border-radius:999px;
        font-size:11px;
        background:rgba(255,255,255,0.08);
        color:#94a3b8;
      }

      .klondike-badge .dot {
        width:6px;
        height:6px;
        border-radius:50%;
        background:#22c55e;
        animation:pulse 1.5s infinite;
      }

      @keyframes pulse {
        0% { opacity:0.3; }
        50% { opacity:1; }
        100% { opacity:0.3; }
      }
    `;

    document.head.appendChild(style);
    wordmark.parentElement.appendChild(badge);
  }

  // ---------------------------
  // STATUS
  // ---------------------------
  function updateStatus(state) {
    const badge = document.querySelector(".klondike-badge .text");
    const dot = document.querySelector(".klondike-badge .dot");

    if (!badge || !dot) return;

    if (state === "LIMIT") {
      badge.textContent = "LIMIT";
      dot.style.background = "#ef4444";
    } else if (state === "ON") {
      badge.textContent = "ON";
      dot.style.background = "#22c55e";
    } else {
      badge.textContent = "OFF";
      dot.style.background = "#64748b";
    }
  }

  // ---------------------------
  // TOGGLE BUTTON (HEADER)
  // ---------------------------
  function addToggle() {
    const container = document.querySelector(
      '[data-testid="thread-header-right-actions"]',
    );

    if (!container) return;
    if (document.getElementById("enhancer-toggle")) return;

    const btn = document.createElement("button");
    btn.id = "enhancer-toggle";

    btn.textContent = enabled ? "Enhancer ON" : "Enhancer OFF";

    Object.assign(btn.style, {
      padding: "6px 10px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "500",
      background: "rgba(255,255,255,0.06)",
      color: "#e5e7eb",
      marginLeft: "8px",
      cursor: "pointer",
      whiteSpace: "nowrap",
    });

    btn.onclick = () => {
      enabled = !enabled;
      localStorage.setItem(STORAGE_KEY, enabled);

      btn.textContent = enabled ? "Enhancer ON" : "Enhancer OFF";
      updateStatus(enabled ? "ON" : "OFF");

      if (!enabled) restoreTooltip();
    };

    container.appendChild(btn);
  }

  // ---------------------------
  // TOOLTIP TEXT PATCH
  // ---------------------------
  function replaceTooltip() {
    if (!enabled) return;

    document
      .querySelectorAll('[data-keyboard-action="composerSubmit"] span')
      .forEach((el) => {
        if (!el.dataset.enhancer) {
          el.textContent = "Отправить подсказку";
          el.dataset.enhancer = "true";
        }
      });
  }

  function restoreTooltip() {
    document
      .querySelectorAll('[data-keyboard-action="composerSubmit"] span')
      .forEach((el) => {
        if (el.dataset.enhancer) {
          el.textContent = "Send message";
          delete el.dataset.enhancer;
        }
      });
  }

  // ---------------------------
  // PATCH LOOP (OPTIMIZED)
  // ---------------------------
  function patch() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      enableButton();
      removeOverlay();
      addBadge();
      addToggle();
      detectLimit();
      replaceTooltip();
      ticking = false;
    });
  }

  // ---------------------------
  // ENTER FIX
  // ---------------------------
  function setupEnter() {
    document.addEventListener(
      "keydown",
      (e) => {
        if (!enabled) return;

        if (e.key !== "Enter" || e.shiftKey) return;

        const active = document.activeElement;
        if (!active || !active.closest('[contenteditable="true"], textarea'))
          return;

        const btn = getSendButton();
        if (!btn) return;

        e.preventDefault();
        btn.click();
      },
      true,
    );
  }

  // ---------------------------
  // OBSERVER
  // ---------------------------
  const observer = new MutationObserver(patch);

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // ---------------------------
  // INIT
  // ---------------------------
  patch();
  setupEnter();
})();
