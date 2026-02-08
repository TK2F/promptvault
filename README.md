# PromptVault

<p align="center">
  <img src="public/icons/icon128.svg" alt="PromptVault Logo" width="128" height="128">
</p>

<p align="center">
  <strong>🇺🇸 English</strong> | <a href="README_JA.md">🇯🇵 日本語</a>
</p>

> Chrome Extension for Managing AI Prompts – Built for Power Users

A Chrome extension for ChatGPT / Gemini / Claude users to "instantly search, reuse, and edit" large collections of long prompts (up to 10,000).

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Real-time Search** | Search across title, content, and tags (with case-sensitive option) |
| 📌 **Pin Prompts** | Keep frequently used prompts at the top |
| 🏷️ **Multi-tag Support** | Bulk input with comma, space, or tab |
| 🎯 **Drag & Drop** | Easily reorder with mouse |
| 🔖 **Tag/Category Filter** | Click to filter, click again to deselect |
| 📊 **Sort Order Selection (7 modes)** | Custom / Updated / Created / Name (asc/desc) |
| 📋 **One-click Copy** | Instantly paste into AI chat |
| 🌐 **Multi-language** | English / Japanese toggle |
| 🌙 **Dark / Light Mode** | Syncs with OS (manual override available) |
| 🎨 **Glassmorphism UI** | Modern, beautiful glass-effect design |
| 📝 **Markdown Preview** | View structured prompts clearly |
| 💾 **Offline Ready** | Fully offline with local storage |
| 📤 **Export/Import** | JSON/CSV format for backup and migration |

---

## 📦 Installation

### Build from Source

```bash
git clone https://github.com/YOUR_USERNAME/promptvault.git
cd promptvault
npm install
npm run build
```

1. Open `chrome://extensions` in Chrome
2. Enable "**Developer mode**"
3. Click "**Load unpacked**"
4. Select the `dist` folder
5. Click the toolbar icon to open the side panel

---

## 🚀 Usage

### Basic Operations

| Action | How |
|--------|-----|
| Open Side Panel | Click toolbar icon |
| Add Prompt | Click "+" button (bottom right) |
| Search | Type in search bar |
| Copy | Hover card → Copy button |
| Pin | Hover card → Pin button |
| Reorder | Drag the left handle |

### Keyboard Shortcuts

| Key | Function |
|-----|----------|
| `Esc` | Close detail / Cancel edit |
| `Ctrl+S` | Save edits |

---

## ⚡ Performance

| Spec | Value |
|------|-------|
| **Max Prompts** | 10,000 |
| **Search** | Cached real-time search |
| **Rendering** | Lazy loading (50 items per batch) |
| **Storage** | chrome.storage.local (5MB) |

---

## 🛠️ Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19 | UI Framework |
| Zustand | 5 | State Management |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | - | Components |
| @dnd-kit | 6 | Drag & Drop |
| Vite | 7 | Build Tool |
| TypeScript | 5.8 | Type System |

---

## 🔒 Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Save prompts and settings locally |
| `sidePanel` | Display as side panel |

**No data is sent to external servers.** All data is stored locally in your browser.

---

## 📚 Documentation

| File | Content |
|------|---------|
| [docs/USAGE_EN.md](docs/USAGE_EN.md) | User Guide (English) |
| [docs/USAGE_JA.md](docs/USAGE_JA.md) | User Guide (Japanese) |
| [docs/TECHNICAL.md](docs/TECHNICAL.md) | Technical Specification |
| [docs/INSTALL_EN.md](docs/INSTALL_EN.md) | Installation Guide (English) |
| [docs/INSTALL_JA.md](docs/INSTALL_JA.md) | Installation Guide (Japanese) |
| [PRIVACY_POLICY.md](PRIVACY_POLICY.md) | Privacy Policy |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution Guide |
| [CHANGELOG.md](CHANGELOG.md) | Changelog |
| [LICENSE](LICENSE) | License (MIT + Third-party) |

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

This project was developed using Google Antigravity.
All AI-generated code is released under the MIT License.

---

## 🤝 Contributing

Issues and Pull Requests are welcome!
See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 💬 Support

We hope PromptVault helps you.

As TK2LAB, we focus on exploring learning, enjoying the process, and sharing discoveries.
PromptVault is one of the projects born from that ongoing effort.

If you resonate with this approach, we'd be grateful for your support via [GitHub Sponsors](https://github.com/sponsors/tk2f).
