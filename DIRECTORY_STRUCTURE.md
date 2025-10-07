# 📁 Directory Structure Guide

## Overview

The repository is organized into logical folders for easy navigation and maintenance.

---

## 📂 Root Directory

```
Sora Script/
├── index.html          # Main entry point - Open this in browser
├── .env                # Your OpenAI API key (DO NOT COMMIT)
├── .env.example        # Template for .env file
├── .gitignore          # Git ignore rules (protects .env)
├── README.md           # Main documentation
├── CLAUDE.md           # Guidance for Claude Code AI
├── src/                # Source code files
├── scripts/            # Utility scripts
└── docs/               # All documentation files
```

---

## 📂 `/src` - Source Code

**Purpose:** All JavaScript application code

```
src/
├── app.js              # Main application logic (1000+ lines)
└── config.js           # Configuration loader for .env
```

### `app.js` - Main Application
**What it contains:**
- `OpenAIVideoClient` class - API wrapper
- `app` object - Main application controller
- UI rendering functions
- Event handlers
- Auto-refresh logic
- Video preview loading
- Gallery management

**Key functions:**
- `init()` - Initialize app
- `createVideo()` - Generate new videos
- `renderJobs()` - Display dashboard
- `renderGallery()` - Display gallery
- `showVideoDetails()` - Show video modal
- `startAutoRefresh()` - Auto-update jobs

**When to edit:**
- Adding new features
- Fixing bugs
- Changing UI behavior
- Modifying API calls

---

### `config.js` - Configuration Loader
**What it contains:**
- `.env` file parser
- API key loader
- Configuration priority logic

**Key functions:**
- `Config.load()` - Load from .env
- `Config.getApiKey()` - Get API key
- `Config.hasApiKey()` - Check if key exists

**When to edit:**
- Adding new config options
- Changing .env format
- Adding new environment variables

---

## 📂 `/scripts` - Utility Scripts

**Purpose:** Helper scripts for development and deployment

```
scripts/
└── start-server.sh     # Quick server startup script
```

### `start-server.sh` - Server Startup
**What it does:**
- Checks for .env file
- Validates API key presence
- Starts Python HTTP server on port 8000
- Shows helpful status messages

**Usage:**
```bash
./scripts/start-server.sh
```

**When to edit:**
- Changing default port
- Adding pre-start checks
- Customizing startup messages
- Adding new server options

---

## 📂 `/docs` - Documentation

**Purpose:** All documentation and guides

```
docs/
├── START_HERE.md                  # Quick start (read this first!)
├── SETUP.md                       # Detailed setup guide
├── openai-video-api-guide.md      # Complete API reference
├── FIXES.md                       # Bug fixes changelog
├── AUTO_REFRESH_IMPROVEMENTS.md   # Auto-refresh feature docs
├── GALLERY_FEATURES.md            # Gallery features guide
├── GALLERY_OPTIMIZATION.md        # Performance optimization docs
└── DEBUG_AUTO_REFRESH.md          # Debugging guide
```

---

### Quick Reference

| Document | Purpose | When to Read |
|----------|---------|--------------|
| `START_HERE.md` | Quick start guide | First time setup |
| `SETUP.md` | Detailed setup instructions | Need more details |
| `openai-video-api-guide.md` | API reference | Understanding the API |
| `FIXES.md` | Bug fixes log | Checking what was fixed |
| `AUTO_REFRESH_IMPROVEMENTS.md` | Auto-refresh feature | Understanding auto-updates |
| `GALLERY_FEATURES.md` | Gallery features | Learning gallery capabilities |
| `GALLERY_OPTIMIZATION.md` | Performance docs | Understanding optimization |
| `DEBUG_AUTO_REFRESH.md` | Debugging guide | Troubleshooting auto-refresh |

---

### Documentation Details

#### `START_HERE.md` 📘
**Best for:** Brand new users
**Contains:**
- 60-second quick start
- Essential steps only
- Links to detailed docs

#### `SETUP.md` 📗
**Best for:** Detailed setup
**Contains:**
- Step-by-step instructions
- Configuration options
- Troubleshooting tips

#### `openai-video-api-guide.md` 📕
**Best for:** API understanding
**Contains:**
- All API endpoints
- Request/response examples
- Parameter documentation
- Best practices
- Code samples

#### `FIXES.md` 📙
**Best for:** What's been fixed
**Contains:**
- Bug descriptions
- Solutions implemented
- Technical details
- Before/after comparisons

#### `AUTO_REFRESH_IMPROVEMENTS.md` 📔
**Best for:** Understanding auto-refresh
**Contains:**
- How auto-refresh works
- Implementation details
- Testing guide
- Performance improvements

#### `GALLERY_FEATURES.md` 📓
**Best for:** Gallery capabilities
**Contains:**
- Video preview features
- Logo click navigation
- Usage tips
- Technical implementation

#### `GALLERY_OPTIMIZATION.md` 📒
**Best for:** Performance details
**Contains:**
- Optimization strategy
- Loading improvements
- Before/after metrics
- Technical deep-dive

#### `DEBUG_AUTO_REFRESH.md` 🔍
**Best for:** Troubleshooting
**Contains:**
- Debug instructions
- Console commands
- Common issues
- Step-by-step diagnosis

---

## 🎯 Quick Navigation

### I want to...

**...get started quickly**
→ Read `docs/START_HERE.md`

**...understand the full setup**
→ Read `docs/SETUP.md`

**...modify the UI**
→ Edit `index.html`

**...change application logic**
→ Edit `src/app.js`

**...add a new feature**
→ Edit `src/app.js` and `index.html`

**...understand the API**
→ Read `docs/openai-video-api-guide.md`

**...debug auto-refresh**
→ Read `docs/DEBUG_AUTO_REFRESH.md`

**...see what was fixed**
→ Read `docs/FIXES.md`

**...optimize performance**
→ Read `docs/GALLERY_OPTIMIZATION.md`

---

## 🔧 Common Edits

### Change UI Styling
**File:** `index.html`
**Location:** `<style>` tag or inline classes
**Example:** Change colors, fonts, layouts

### Add New API Endpoint
**File:** `src/app.js`
**Location:** `OpenAIVideoClient` class
**Example:** Add new method like `generateThumbnail()`

### Modify Auto-Refresh
**File:** `src/app.js`
**Location:** `startAutoRefresh()` function
**Example:** Change interval, add logging

### Update Configuration
**File:** `src/config.js`
**Location:** `Config` object
**Example:** Add new environment variables

### Add New Documentation
**File:** Create in `docs/` folder
**Format:** Markdown (`.md`)
**Example:** `docs/NEW_FEATURE.md`

---

## 📦 File Sizes

| File | Size | Purpose |
|------|------|---------|
| `index.html` | ~25 KB | UI structure |
| `src/app.js` | ~40 KB | Main logic |
| `src/config.js` | ~2 KB | Config loader |
| `docs/*.md` | ~5-20 KB each | Documentation |

---

## 🚫 What NOT to Edit

**Do NOT edit these files manually:**
- `.env` - Edit in text editor, but don't commit
- `.gitignore` - Only change if adding new ignore patterns
- `CLAUDE.md` - Only for Claude Code AI

**Safe to edit:**
- `index.html` - UI changes
- `src/app.js` - Logic changes
- `src/config.js` - Config changes
- `docs/*.md` - Documentation updates
- `README.md` - Main docs

---

## 🔐 Security Files

### `.env` - API Key Storage
**Contains:** Your OpenAI API key
**Security:** Listed in `.gitignore`
**Edit:** Yes, to add your key
**Commit:** ❌ NEVER commit this file

### `.env.example` - Template
**Contains:** Example format
**Security:** Safe to commit
**Edit:** Update if adding new variables
**Commit:** ✅ Safe to commit

### `.gitignore` - Ignore Rules
**Contains:** Files to exclude from git
**Security:** Protects sensitive files
**Edit:** Add new patterns if needed
**Commit:** ✅ Safe to commit

---

## 📝 Development Workflow

### Adding a New Feature

1. **Plan** - Decide what to build
2. **Edit** - Modify `src/app.js` and `index.html`
3. **Test** - Refresh browser and test
4. **Document** - Add to `docs/` if needed
5. **Commit** - Save changes to git

### Fixing a Bug

1. **Identify** - Find the issue
2. **Locate** - Find code in `src/app.js` or `index.html`
3. **Fix** - Make changes
4. **Test** - Verify fix works
5. **Document** - Add to `docs/FIXES.md`

### Updating Documentation

1. **Choose file** - Pick appropriate doc in `docs/`
2. **Edit** - Update content
3. **Format** - Use Markdown
4. **Save** - Commit changes

---

## 🎨 Code Organization

### `src/app.js` Structure

```javascript
// 1. API Client Class
class OpenAIVideoClient {
    createVideo()
    listVideos()
    retrieveVideo()
    deleteVideo()
    remixVideo()
    downloadContent()
}

// 2. Main Application
const app = {
    // Initialization
    init()

    // Settings
    loadSettings()
    saveSettings()

    // Tab Management
    switchTab()

    // Video Creation
    createVideo()

    // Job Management
    renderJobs()
    updateJobStatus()
    startAutoRefresh()

    // Gallery
    renderGallery()
    loadGalleryVideoPreview()

    // Utilities
    showToast()
    copyToClipboard()
}
```

---

## 🗂️ Best Practices

### File Naming
- **Code:** camelCase (`app.js`, `config.js`)
- **Docs:** UPPERCASE with underscores (`START_HERE.md`)
- **Scripts:** kebab-case (`start-server.sh`)

### Folder Organization
- **Source code** → `src/`
- **Documentation** → `docs/`
- **Scripts** → `scripts/`
- **Config files** → Root directory

### Documentation
- **Getting started** → `docs/START_HERE.md`
- **Detailed guides** → `docs/SETUP.md`
- **Feature docs** → `docs/FEATURE_NAME.md`
- **API reference** → `docs/openai-video-api-guide.md`

---

## 📊 Directory Tree (Complete)

```
Sora Script/
│
├── 📄 index.html                      # Entry point
├── 📄 README.md                       # Main documentation
├── 📄 CLAUDE.md                       # Claude Code guidance
├── 📄 .env                            # API key (DO NOT COMMIT)
├── 📄 .env.example                    # API key template
├── 📄 .gitignore                      # Git ignore rules
│
├── 📁 src/                            # Source code
│   ├── 📄 app.js                      # Main application (40 KB)
│   └── 📄 config.js                   # Config loader (2 KB)
│
├── 📁 scripts/                        # Utility scripts
│   └── 📄 start-server.sh             # Server startup
│
└── 📁 docs/                           # Documentation
    ├── 📄 START_HERE.md               # Quick start ⭐
    ├── 📄 SETUP.md                    # Setup guide
    ├── 📄 openai-video-api-guide.md   # API reference
    ├── 📄 FIXES.md                    # Bug fixes log
    ├── 📄 AUTO_REFRESH_IMPROVEMENTS.md
    ├── 📄 GALLERY_FEATURES.md
    ├── 📄 GALLERY_OPTIMIZATION.md
    └── 📄 DEBUG_AUTO_REFRESH.md
```

---

## 🚀 Getting Started

1. **Read** `docs/START_HERE.md` for quick start
2. **Edit** `.env` to add your API key
3. **Run** `./scripts/start-server.sh` to start
4. **Open** `http://localhost:8000` in browser
5. **Create** your first video!

---

**Everything is now organized and easy to find!** 🎉
