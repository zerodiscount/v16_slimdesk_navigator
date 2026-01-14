# [Release] SlimDesk Navigator: Persistent Sidebar for v16 (Solve Context Switching Fatigue)

Hi everyone,

Like many of you testing the new v16 UI, I found myself getting "lost" when navigating between different modules. The new design is beautiful, but the constant need to click "Home" or "Desk" just to switch was getting confusing -  I missed the structure and "anchor" of a persistent navigation sidebar.

Searching through the forum, I saw I wasn't alone:
> "Navigation inefficiency... need to return to Desk to switch modules."
> "Confusing module switching... context changes make it difficult to stay oriented."

So I built **SlimDesk Navigator** to solve this.

## What is it?
It's a simple, unobtrusive app that injects a **persistent, slim sidebar** on the left side of your screen. 

**Result:** You can jump from *Accounting* to *Manufacturing* in **one click**, without ever losing your current page context or going back to the grid.

### Key Features
*   **Persistent & Unobtrusive:** Always there, but takes up minimal space.
*   **Dark Theme:** Sleek sidebar aesthetics with a dedicated dark mode (`#1a202c`) and high-contrast active states.
*   **Smart Shortcuts:** Add shortcuts to **DocTypes, Reports, or Pages**.
*   **Custom Tooltips:** Define custom hover text for any shortcut.
*   **Auto-Discovery:** Automatically detects icons for your installed apps.
*   **Fully Customizable:** Drag & drop reordering via a simple "Edit" dialog.

## Screenshots
[Insert Screenshot Here - showing the Sidebar next to a standard List View]

## Installation
The app is open source and public.

```bash
bench get-app v16_slimdesk_navigator https://github.com/zerodiscount/v16_slimdesk_navigator
bench --site [your-site] install-app v16_slimdesk_navigator
```

## Repository
[https://github.com/zerodiscount/v16_slimdesk_navigator](https://github.com/zerodiscount/v16_slimdesk_navigator)

I hope this helps. My contribution to the community. Feedback is welcome.


