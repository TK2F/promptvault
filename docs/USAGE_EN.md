# User Guide

## Interface Overview

PromptVault consists of three main screens:

1. **List View** - Prompt list, search, and pinned items
2. **Detail View** - View and edit prompt content
3. **Settings** - Theme, language, data management

---

## Basic Operations

### Add a Prompt

1. Click the "**+**" button (with glow effect) at bottom right
2. Enter the following:
   - **Name** (required): Prompt title
   - **Category** (optional): Classification label
   - **Tags** (optional): Multiple tags separated by comma, space, or tab
   - **Content** (required): Prompt body
3. Click "**Add**"

### Search Prompts

Type keywords in the search bar to search across:
- Name
- Content
- Category
- Tags

#### Case Sensitivity

Toggle the "**Case Sensitive**" button below the search bar:
- **ON** (blue): Exact case match
- **OFF** (gray): Ignore case

### Copy a Prompt

Hover over a prompt card to reveal action buttons:
1. Click the **Copy button** (📋)
2. Content is copied to clipboard
3. Paste into ChatGPT/Gemini/Claude

### Pin a Prompt

Keep frequently used prompts at the top:

1. Hover over a prompt card
2. Click the **Pin button** (📌)
3. It appears in the Pinned section

Click again to unpin.

### Reorder Prompts

Drag and drop to reorder:

1. Drag the handle (⠿) on the left side of a card
2. Drop at the desired position
3. Order is saved automatically

### Edit a Prompt

1. Click a prompt card to open detail view
2. Click the **Edit button** (✏️) at top right
3. Make changes
4. Click **Save** (💾) or press `Ctrl+S`

### Delete a Prompt

1. Hover over a prompt card
2. Click the **Delete button** (🗑️)
3. Confirm in the dialog

---

## Settings

Click the gear icon (⚙️) to open settings.

### Language

- 🇯🇵 **日本語** (Japanese)
- 🇺🇸 **English**

### Theme

- ☀️ **Light** - Light background (gradient)
- 🌙 **Dark** - Dark background (glassmorphism)
- 🖥️ **System** - Match OS settings

### Font Size

- **Small** - Compact display
- **Medium** - Standard
- **Large** - Larger text

---

## Data Management

### Export

Export your prompts to a file:

1. Settings → Click **Export** button
2. Select format:
   - **JSON** - For backup and migration
   - **CSV** - For Excel/spreadsheets
3. Category filter (optional):
   - Tap category chips to select specific categories
   - **No selection = Export all**
4. Click **Export**

### Import

Migrate from another PC or restore backups:

1. Settings → Click **Import (JSON/CSV)** button
2. Select a file
3. Choose import mode:
   - **Add**: Add to existing prompts
   - **Replace**: Delete all existing, then import
4. Click **Import**

**Warning**: Replace mode deletes all existing prompts

### Delete All Data (Danger Zone)

To delete all data:

1. Settings → Scroll to **Danger Zone**
2. Click **Delete All Data**
3. Type "DELETE" in the confirmation dialog
4. Click **Delete**

**Warning**: This action cannot be undone

---

## Data Persistence

| Situation | Effect on Prompts |
|-----------|------------------|
| Chrome restart | ✅ Preserved |
| Chrome update | ✅ Preserved |
| Clear cache | ✅ Preserved |
| Uninstall extension | ⚠️ Deleted |

**Recommendation**: Regularly export backups

---

## Keyboard Shortcuts

| Key | Function |
|-----|----------|
| `Esc` | Close detail / Cancel edit |
| `Ctrl+S` | Save edits |

---

## Tips

- **Recently Used**: Shows last 5 copied prompts
- **Tag Input**: Press Enter, Tab, or comma to confirm
- **Markdown**: Prompt content renders as Markdown
- **Performance**: Handles up to 10,000 prompts smoothly (lazy loading)
