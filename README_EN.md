# ChatGPT Enhancer

### [Русский](README.md) | English

**ChatGPT Enhancer** is a Tampermonkey userscript that improves the interaction with the ChatGPT interface.

---

## What the script does

- **Keeps the "Send" button active**  
  Even if the site temporarily disables the button, the script monitors it and keeps it clickable.

- **Removes auxiliary UI elements**  
  Certain interface blocks that visually interfere are automatically removed.

- **Restores sending messages via the Enter key**  
  Shift+Enter still inserts a new line, Enter sends the message.

- **Works with dynamically updated DOM**  
  Any changes on the page are tracked, so functionality is preserved even after new elements are loaded.

> ⚠️ The script operates entirely on the client side and does not modify server-side logic.

---

## Installation

1. Install [Violentmonkey](https://violentmonkey.github.io/) for your browser.  
2. [Install the script via Violentmonkey](https://raw.githubusercontent.com/klondike0x/ChatGPT-Unlimited/main/ChatGPT-Unlimited.user.js).

Now the "Send" button will be active, unnecessary elements removed, and Enter will send messages.

---

## Configuration

If you need to change button selectors or elements, you can do so directly in the script, for example:

```javascript
document.querySelector('button[aria-label="Отправить подсказку"]');
document.querySelector('div.absolute.start-0.end-0.bottom-full.-z-1');
