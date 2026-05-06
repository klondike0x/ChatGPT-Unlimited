// ==UserScript==
// @name         ChatGPT-Unlimited
// @namespace    https://github.com/klondike0x/ChatGPT-Enhancer
// @version      2.0.0
// @description  Убирает лимит сообщение в ChatGPT
// @author       klondike0x
// @match        *://chatgpt.com/*
// @icon         https://raw.githubusercontent.com/klondike0x/ChatGPT-Enhancer/refs/heads/main/canvas.png
// @updateURL    https://raw.githubusercontent.com/klondike0x/ChatGPT-Enhancer/main/ChatGPT-Enhancer.user.js
// @downloadURL  https://raw.githubusercontent.com/klondike0x/ChatGPT-Enhancer/main/ChatGPT-Enhancer.user.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "enhancer_enabled";
  let enabled = localStorage.getItem(STORAGE_KEY) !== "false";
  let ticking = false;

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

  function removeOverlay() {
    if (!enabled) return;

    const el = document.querySelector("div.absolute.start-0.end-0.bottom-full");
    if (el) el.remove();
  }

  function detectLimit() {
    const text = document.body.innerText.toLowerCase();

    if (
      text.includes("limit") ||
      text.includes("лимит") ||
      text.includes("you are out of")
    ) {
      updateStatus("LIMIT");
    } else {
      updateStatus(enabled ? "ON" : "OFF");
    }
  }

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

  function addToggle() {
    const container = document.querySelector(
      '[data-testid="thread-header-right-actions"]',
    );

    if (!container) return;

    // не дублируем
    if (document.getElementById("enhancer-toggle")) return;

    const btn = document.createElement("button");
    btn.id = "enhancer-toggle";

    btn.textContent = enabled ? "Enhancer ON" : "Enhancer OFF";

    btn.className = "btn relative";

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
    };

    container.appendChild(btn);
  }

  function patch() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      enableButton();
      removeOverlay();
      addBadge();
      addToggle();
      detectLimit();
      ticking = false;
    });
  }

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

  const observer = new MutationObserver(patch);

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  patch();
  setupEnter();
})();
