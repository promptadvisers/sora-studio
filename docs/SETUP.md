# 🚀 Quick Setup Guide - Sora Studio

Get started with Sora Studio in 3 easy steps!

## Step 1: Add Your API Key

Edit the `.env` file and add your OpenAI API key:

```bash
# Open the .env file
nano .env

# Add your API key (replace with your actual key)
OPENAI_API_KEY=sk-your-actual-api-key-here
```

Save the file (Ctrl+O, Enter, Ctrl+X in nano).

## Step 2: Start the Server

Run the startup script:

```bash
./start-server.sh
```

You should see:
```
🎬 Starting Sora Studio...

✅ Found API key in .env file

🚀 Starting web server on http://localhost:8000
   Press Ctrl+C to stop the server
```

## Step 3: Open the App

Open your browser and go to:
```
http://localhost:8000
```

## That's It! 🎉

You're ready to start generating AI videos!

### First Video

1. Enter a descriptive prompt like:
   ```
   A golden retriever puppy playing in a field of flowers at sunset
   ```

2. Choose your settings:
   - Duration: 4, 6, or 8 seconds
   - Resolution: Portrait, Landscape, etc.

3. Click "Generate Video"

4. Switch to the Dashboard tab to watch progress

5. Download when complete!

---

## Troubleshooting

### Server won't start?
```bash
# Make sure the script is executable
chmod +x start-server.sh

# Try running directly
python3 -m http.server 8000
```

### API key not working?
- Make sure your key starts with `sk-`
- Check there are no extra spaces
- Verify the key is valid at https://platform.openai.com/api-keys

### Browser shows empty page?
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Check browser console for errors (F12)
- Make sure you're accessing `http://localhost:8000` not `file://`

---

**Need more help?** See the full [README.md](README.md) for detailed documentation.
