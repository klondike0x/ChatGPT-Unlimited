const fs = require("fs");

const header = `// ==UserScript==
// @name         ChatGPT-Unlimited
// @version      2.0.1
// @description  Enhances ChatGPT UI
// @match        *://chatgpt.com/*
// @icon         https://raw.githubusercontent.com/klondike0x/ChatGPT-Unlimited/main/canvas.png
// @homepageURL  https://github.com/klondike0x/ChatGPT-Unlimited
// @updateURL    https://raw.githubusercontent.com/klondike0x/ChatGPT-Unlimited/main/dist/ChatGPT-Unlimited.user.js
// @downloadURL  https://raw.githubusercontent.com/klondike0x/ChatGPT-Unlimited/main/dist/ChatGPT-Unlimited.user.js
// @grant        none
// ==/UserScript==

`;

const code = fs.readFileSync("./src/main.js", "utf8");

fs.writeFileSync(
  "./dist/ChatGPT-Unlimited.user.js",
  header + "\n" + code
);

console.log("✅ Build completed");