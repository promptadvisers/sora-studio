# Sora Studio - OpenAI Video API Web Interface

A modern, user-friendly web application for generating AI videos using OpenAI's Sora Video API. This application provides a clean interface to create, manage, and download AI-generated videos with full control over all available parameters.

![Sora Studio](https://img.shields.io/badge/OpenAI-Sora%20API-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

### 🎬 Video Creation
- **Text-to-Video Generation**: Create videos from descriptive text prompts
- **Multiple Duration Options**: Choose between 4, 6, or 8-second videos
- **Resolution Selection**: 4 aspect ratios with visual previews
  - 720x1280 (Portrait - 9:16)
  - 1024x1808 (Tall Portrait - 9:16 HD)
  - 1280x720 (Landscape - 16:9)
  - 1808x1024 (Wide Landscape - 16:9 HD)
- **Optional Reference Upload**: Guide generation with image or video references
- **Character Counter**: Track prompt length (max 1000 characters)
- **Example Prompts**: Built-in template library for inspiration

### 📊 Job Management Dashboard
- **Real-time Status Tracking**: Monitor video generation progress
- **Auto-refresh**: Automatic updates every 10 seconds for active jobs
- **Status Filtering**: Filter by queued, processing, completed, or failed
- **Search Functionality**: Find videos by prompt or ID
- **Progress Bars**: Visual progress indicators for active jobs
- **Color-coded Status**: Easy-to-read status badges

### 🎭 Video Details & Preview
- **Comprehensive Metadata**: View all video properties
- **Error Details**: See error messages for failed jobs
- **Copy to Clipboard**: Easily copy video IDs
- **Expiration Tracking**: Monitor when videos expire
- **Remix History**: Track which videos are remixes

### 🔄 Remix Functionality
- **Quick Remix**: Create variations of completed videos
- **Prompt Evolution**: Build on successful generations
- **Remix Tracking**: See which video a remix originated from

### 🎨 Gallery View
- **Visual Grid**: Browse completed videos in an attractive layout
- **Quick Actions**: Download or remix directly from gallery
- **Date Tracking**: See when videos were created

### ⚙️ Settings & Configuration
- **API Key Management**: Secure localStorage-based key storage
- **Default Preferences**: Set preferred duration and resolution
- **Auto-refresh Control**: Customize refresh interval (5-60 seconds)
- **Data Management**: Clear all local data when needed

### 🎯 Additional Features
- **Export History**: Download job history as JSON
- **Toast Notifications**: Clear feedback for all actions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **No Build Required**: Pure HTML/CSS/JS - runs directly in browser
- **Offline Job Storage**: Jobs persist in localStorage

## Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- OpenAI API key with access to the Video API (Sora)
- Local web server (optional but recommended)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd "/Users/marwankashef/Desktop/YouTube/Sora Script"
   ```

2. **Start the server:**

   **Option 1: Using the startup script (easiest)**
   ```bash
   ./scripts/start-server.sh
   ```

   **Option 2: Python (Python 3)**
   ```bash
   python3 -m http.server 8000
   ```

   **Option 3: Python (Python 2)**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   **Option 4: Node.js (npx)**
   ```bash
   npx http-server -p 8000
   ```

   **Option 5: PHP**
   ```bash
   php -S localhost:8000
   ```

3. **Open your browser:**
   ```
   http://localhost:8000
   ```

### Configuration

#### Option 1: Using .env File (Recommended)

1. **Edit the .env file:**
   ```bash
   nano .env
   # or use any text editor
   ```

2. **Add your API key:**
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Save and refresh the browser**
   - The app will automatically load your API key
   - No need to enter it in Settings

#### Option 2: Using Settings Panel

1. **Add Your API Key:**
   - Click the "Settings" button in the top-right corner
   - Enter your OpenAI API key (starts with `sk-`)
   - Click "Save Settings"

   ⚠️ **Security Note:** API key is stored in browser localStorage. Using .env is more secure for local development.

#### Additional Settings (Optional)

2. **Set Default Preferences:**
   - Default duration (4, 6, or 8 seconds)
   - Default resolution
   - Auto-refresh interval

## Usage Guide

### Creating Your First Video

1. **Navigate to the "Create Video" tab** (default view)

2. **Enter a descriptive prompt:**
   ```
   A golden retriever puppy playing in a field of colorful wildflowers at sunset
   ```
   *Tip: Use the "View Example Prompts" button for inspiration*

3. **Select parameters:**
   - **Duration**: Choose 4s, 6s, or 8s
   - **Resolution**: Select your preferred aspect ratio
   - **Reference** (optional): Upload an image or video to guide generation

4. **Click "Generate Video"**

5. **Switch to the "Dashboard" tab** to monitor progress

### Managing Video Jobs

- **Refresh**: Click the refresh button or wait for auto-refresh
- **Filter**: Use status dropdown to show specific job types
- **Search**: Type in the search box to find specific jobs
- **View Details**: Click "Details" button for full information
- **Download**: Click "Download" when job is completed
- **Remix**: Click "Remix" to create variations
- **Delete**: Remove jobs you no longer need

### Downloading Videos

**From Dashboard:**
1. Wait for video status to show "completed"
2. Click the green "Download" button
3. Video will be saved as `sora-{video-id}.mp4`

**From Gallery:**
1. Switch to "Gallery" tab
2. Click "Download" on any completed video

**From Details Modal:**
1. Click "Details" on any completed video
2. Click "Download Video" button

### Remixing Videos

**What is remixing?**
Remixing creates a new video based on a completed video, using a new prompt to modify or extend the scene.

**How to remix:**
1. Click "Remix" on any completed video
2. Enter a new prompt that describes how you want to modify the video
3. The new video will maintain elements from the original

**Example:**
- Original: "A cat playing piano"
- Remix: "Same scene but now the cat takes a bow to a cheering audience"

## Architecture

### File Structure
```
/
├── index.html              # Main HTML file (entry point)
├── .env                    # Your API key (DO NOT COMMIT)
├── .env.example            # Example environment file
├── .gitignore              # Git ignore rules
├── README.md               # Main documentation
├── CLAUDE.md               # Claude Code guidance
│
├── src/                    # Source code
│   ├── app.js              # Main application logic
│   └── config.js           # Configuration loader for .env
│
├── scripts/                # Utility scripts
│   └── start-server.sh     # Server startup script
│
└── docs/                   # Documentation
    ├── START_HERE.md                  # Quick start guide
    ├── SETUP.md                       # Detailed setup instructions
    ├── openai-video-api-guide.md      # Complete API reference
    ├── FIXES.md                       # Bug fixes log
    ├── AUTO_REFRESH_IMPROVEMENTS.md   # Auto-refresh feature docs
    ├── GALLERY_FEATURES.md            # Gallery features docs
    ├── GALLERY_OPTIMIZATION.md        # Performance optimization docs
    └── DEBUG_AUTO_REFRESH.md          # Debugging guide
```

### Key Components

**OpenAIVideoClient Class** (`src/app.js`)
- `createVideo()` - Generate new videos
- `listVideos()` - Fetch all videos
- `retrieveVideo()` - Get specific video details
- `deleteVideo()` - Remove videos
- `remixVideo()` - Create video remixes
- `downloadContent()` - Download video files

**Config Loader** (`src/config.js`)
- Loads API key from `.env` file
- Falls back to localStorage
- Priority: .env → localStorage

**Application Object** (`src/app.js`)
- State management
- UI rendering
- Form handling
- Auto-refresh logic
- LocalStorage persistence

### Data Storage

**LocalStorage Keys:**
- `openai_api_key` - Your API key
- `video_jobs` - Array of all video jobs
- `default_duration` - Preferred duration setting
- `default_size` - Preferred resolution setting
- `refresh_interval` - Auto-refresh interval in seconds

## API Integration

This application integrates with the following OpenAI Video API endpoints:

- `POST /videos` - Create video
- `GET /videos` - List videos
- `GET /videos/{id}` - Retrieve video
- `DELETE /videos/{id}` - Delete video
- `POST /videos/{id}/remix` - Remix video
- `GET /videos/{id}/content` - Download video

For detailed API documentation, see `openai-video-api-guide.md`.

## Best Practices

### Prompt Writing Tips

✅ **Good Prompts:**
- Be specific and descriptive
- Include details about lighting, mood, camera angles
- Mention movement and action
- Specify time of day or weather if relevant

```
A close-up shot of a hummingbird hovering near a red hibiscus flower.
The scene is shot in slow motion with morning sunlight creating a soft glow.
The background is a blurred garden.
```

❌ **Avoid Vague Prompts:**
```
bird and flower
```

### Performance Tips

1. **Test with short durations first** (4s) to validate prompts
2. **Use appropriate resolution** - higher res = longer generation time
3. **Monitor expiration dates** - download important videos before they expire
4. **Clean up old jobs** - delete completed jobs you don't need
5. **Batch similar prompts** - generate multiple related videos together

### Cost Optimization

- Start with 4-second durations for testing
- Use lower resolutions (720x1280) for drafts
- Generate full resolution only for final versions
- Delete videos after downloading to free up storage

## Troubleshooting

### API Key Issues

**Problem:** "API Key Required" warning
**Solution:**
1. Click Settings
2. Enter your OpenAI API key
3. Ensure it starts with `sk-`
4. Click Save Settings

### Videos Not Appearing

**Problem:** Dashboard is empty
**Solution:**
1. Click the refresh button
2. Check browser console for errors
3. Verify API key is valid
4. Ensure you have generated at least one video

### Download Fails

**Problem:** Can't download video
**Solution:**
1. Ensure video status is "completed"
2. Check if video has expired
3. Verify API key has proper permissions
4. Try refreshing the job status

### CORS Errors

**Problem:** CORS policy error in console
**Solution:**
1. Run app through a local web server (not file://)
2. Use one of the server options in Quick Start
3. Ensure API key is correct

### Auto-refresh Not Working

**Problem:** Jobs not updating automatically
**Solution:**
1. Check if auto-refresh is paused
2. Click the pause/resume button
3. Verify refresh interval in settings
4. Ensure there are active jobs to refresh

## Security Considerations

⚠️ **Important Security Notes:**

1. **API Key Storage**: This application stores your API key in browser localStorage, which is accessible to any JavaScript running on the page. For production use:
   - Implement a backend proxy
   - Use environment variables
   - Never commit API keys to version control

2. **Client-side Only**: This is a client-side application with no backend. All API calls are made directly from the browser.

3. **Sensitive Data**: Do not enter sensitive information in prompts, as they are stored locally and sent to OpenAI.

4. **HTTPS**: Always use HTTPS in production to encrypt data in transit.

## Browser Compatibility

✅ Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Keyboard Shortcuts

- `Ctrl/Cmd + Enter` in prompt field - Submit form
- `Esc` - Close modals

## Advanced Features

### Export Job History

Export all job data as JSON for backup or analysis:
1. Go to Gallery tab
2. Click "Export History"
3. JSON file will download

### Batch Processing

To generate multiple videos:
1. Create first video
2. While it processes, create additional videos
3. All jobs will appear in dashboard
4. Auto-refresh will update all active jobs

### Share Video Details

Share video information:
1. Click "Details" on any video
2. Click "Copy ID"
3. Share the video ID with others (requires same API account)

## Limitations

- Video preview must be downloaded to view (browser limitations)
- API rate limits apply (varies by account)
- Videos expire after a certain period (check expires_at field)
- Maximum prompt length: 1000 characters
- No batch upload for reference files
- No video editing capabilities

## Roadmap

Future enhancements planned:
- [ ] Dark mode
- [ ] Video thumbnail generation
- [ ] Batch prompt upload (CSV)
- [ ] Video comparison view
- [ ] Custom resolution support
- [ ] Progress notifications
- [ ] Export gallery as HTML

## Support

For issues related to:

**This Application:**
- Check the Troubleshooting section
- Review browser console for errors
- Ensure you're running a local server

**OpenAI API:**
- Visit: https://platform.openai.com/docs
- Status: https://status.openai.com
- Community: https://community.openai.com

## License

MIT License - Feel free to use, modify, and distribute.

## Credits

Built for use with OpenAI's Sora Video API.

---

**Made with ❤️ for video creators**

Last updated: October 2025
