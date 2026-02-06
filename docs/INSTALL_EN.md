# Installation Guide

## Requirements

- **Node.js** 18 or higher
- **npm** 9 or higher
- **Google Chrome** latest version

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/promptvault.git
cd promptvault
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build

```bash
npm run build
```

After a successful build, a `dist` folder will be created.

### 4. Load into Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "**Developer mode**" in the top right corner
3. Click "**Load unpacked**"
4. Select the `dist` folder

### 5. Enable Side Panel

PromptVault works as a side panel.

1. Click the PromptVault icon (🔖) in the toolbar
2. The side panel will open

## Updating

1. Get the latest code
   ```bash
   git pull origin main
   ```

2. Rebuild
   ```bash
   npm install
   npm run build
   ```

3. Click the "Update" button on Chrome's extensions page

## Troubleshooting

### Build Errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npm run build
```

### Extension Won't Load

- Verify that the `dist` folder exists
- Verify that `dist/manifest.json` exists
- Ensure Developer mode is enabled

### Side Panel Won't Open

- Ensure Chrome version is 114 or higher
- Try disabling and re-enabling the extension
