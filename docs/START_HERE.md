# 🎬 Sora Studio - START HERE

Welcome to **Sora Studio**, your web interface for OpenAI's Video API!

---

## ⚡ Quick Start (60 seconds)

### 1️⃣ Add Your API Key

Open `.env` in any text editor and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-key-here
```

### 2️⃣ Start the Server

In terminal, run:

```bash
cd "/Users/marwankashef/Desktop/YouTube/Sora Script"
./start-server.sh
```

### 3️⃣ Open Your Browser

Navigate to:
```
http://localhost:8000
```

**Done!** 🎉 You're ready to generate AI videos!

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[README.md](README.md)** - Complete documentation
- **[openai-video-api-guide.md](openai-video-api-guide.md)** - API reference

---

## ✨ Features at a Glance

✅ **Create Videos** - Text-to-video with customizable duration & resolution
✅ **Dashboard** - Real-time job monitoring with auto-refresh
✅ **Gallery** - View all completed videos
✅ **Remix** - Create variations of existing videos
✅ **Download** - Save videos locally
✅ **Settings** - Configure defaults and preferences

---

## 🎯 Your First Video

1. **Enter a prompt:**
   ```
   A golden retriever puppy playing in a field of colorful wildflowers at sunset
   ```

2. **Select settings:**
   - Duration: 8 seconds
   - Resolution: 1280x720 (Landscape)

3. **Click "Generate Video"**

4. **Monitor in Dashboard** - Auto-refreshes every 10 seconds

5. **Download when complete!**

---

## 🆘 Need Help?

**Server not working?**
```bash
# Make script executable
chmod +x start-server.sh

# Or run manually
python3 -m http.server 8000
```

**API key issues?**
- Ensure key starts with `sk-`
- No extra spaces in `.env` file
- Get your key at: https://platform.openai.com/api-keys

**Page not loading?**
- Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
- Check browser console (F12) for errors
- Verify accessing `http://localhost:8000` not `file://`

---

## 🔐 Security Note

Your API key in `.env` is only accessible locally. The `.gitignore` file prevents it from being committed to version control.

---

## 🚀 Ready to Create?

Your server is running at: **http://localhost:8000**

Start generating amazing AI videos! 🎥✨

---

*For detailed features, troubleshooting, and best practices, see [README.md](README.md)*
