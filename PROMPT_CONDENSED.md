# 🎬 One-Shot Prompt: Sora Studio

Build a complete OpenAI Video API (Sora) web interface using vanilla HTML/CSS/JavaScript.

## Stack
- Pure HTML/CSS/JS (no frameworks)
- Tailwind CSS + Font Awesome (CDN)
- Python HTTP server (localhost:8000)
- `.env` file for API key

## Critical Requirements

### 1. API Key Management
- **Load from `.env` file automatically** on page load
- Parse `OPENAI_API_KEY=sk-...` from .env
- Show success toast when loaded
- Priority: .env → localStorage fallback
- Settings panel to manually set key

### 2. Video Creation Form
- **Prompt:** Textarea with char counter (0/1000)
- **Model:** sora-2 (dropdown)
- **Duration:** Visual buttons for **4s, 8s, 12s** (default: 4s) ← API only supports these!
- **Resolution:** 4 visual cards showing:
  - 720x1280 (Portrait)
  - 1024x1808 (Tall Portrait)
  - 1280x720 (Landscape) ← highlight selected
  - 1808x1024 (Wide Landscape)
- **Optional:** File upload for image/video reference
  - **CRITICAL:** Validate image dimensions match selected resolution!
  - Show green checkmark if dimensions match
  - Show yellow warning if dimensions don't match
  - Display actual vs expected dimensions
- **Button:** "Generate Video" → creates job via POST /videos

### 3. Auto-Refresh Dashboard (CRITICAL!)

**Must work perfectly:**
```javascript
// Every 10 seconds:
setInterval(async () => {
  // Find active jobs (queued, in_progress, or processing)
  const activeJobs = jobs.filter(j =>
    j.status === 'queued' || j.status === 'processing' || j.status === 'in_progress'
  );

  // Update each job
  for (const job of activeJobs) {
    const updated = await api.retrieveVideo(job.id);

    // Update local data
    job.status = updated.status;
    job.progress = updated.progress;

    // Show toast if completed
    if (updated.status === 'completed') {
      showToast('Video completed!', 'success');
    }
  }

  // CRITICAL: Re-render UI immediately
  renderDashboard();

}, 10000);
```

**CRITICAL API Status Values:**
- API returns `in_progress` (with underscore) NOT `processing`
- Must support: `queued`, `in_progress`, `completed`, `failed`, `cancelled`
- Display as: "Queued", "In Progress", "Completed", "Failed", "Cancelled"

**Must handle:**
- ✅ queued → in_progress → completed transitions
- ✅ Progress bar updates (0% → 100%)
- ✅ UI re-renders automatically (NO manual refresh!)
- ✅ Toast notifications for completed videos
- ✅ Multiple jobs updating simultaneously

**Job Cards Show:**
- Status badge (🟡 queued, 🔵 in_progress, 🟢 completed, 🔴 failed)
- Prompt preview (100 chars)
- Progress bar (if active)
- Buttons: Details, Download (if completed), Remix (if completed), Delete

### 4. Gallery with Instant Loading (CRITICAL!)

**Two-stage loading for performance:**

```javascript
// Stage 1: Instant thumbnails
async loadGallery() {
  for (const video of completedVideos) {
    // Fetch thumbnail (fast! ~50KB)
    const thumb = await api.downloadContent(video.id, 'thumbnail');
    showThumbnail(thumb); // Shows in <1 second

    // Stage 2: Load video in background
    loadVideoInBackground(video.id);
  }
}

// Background video loading
async loadVideoInBackground(videoId) {
  const blob = await api.downloadContent(videoId, 'video');
  const url = URL.createObjectURL(blob);

  // Replace thumbnail with video
  element.innerHTML = `
    <video loop muted playsinline
      onmouseover="this.play(); this.muted=false"
      onmouseout="this.pause(); this.muted=true; this.currentTime=0">
      <source src="${url}" type="video/mp4">
    </video>
  `;
}
```

**Result:**
- Thumbnails load instantly (<1 second)
- Videos load in background (silent)
- Hover = play with audio
- Mouse out = pause and reset

### 5. Download Functionality (CRITICAL!)

**Use correct variant:**
```javascript
// ✅ CORRECT
await api.downloadContent(videoId, 'video');

// ❌ WRONG (will fail!)
await api.downloadContent(videoId, 'mp4');
```

### 6. Navigation & UX
- **3 tabs:** Create Video, Dashboard, Gallery
- **Tab design:** Subtle gray with 2px gradient bottom border for active tab ONLY
- **Logo click:** "Sora Studio" → return to Create tab
- **Default:** Start on Create tab
- **Modals:** Click outside to close, X button visible above modal (not overlapping)

### 7. Settings Panel
- API key input (show/hide toggle)
- Default duration (4, 8, 12s)
- Default resolution (dropdown)
- Auto-refresh interval (5-60s)
- Clear all data button

### 8. Remix Feature
- Available for completed videos only
- Prompts for new prompt
- Calls POST /videos/{id}/remix
- Shows "Remixed from: {original_id}"

## Design System (Silicon Valley Quality)

### Colors - EXTREME RESTRAINT
- **Primary gradient (#667eea → #764ba2):** ONLY for primary CTA buttons
- **All other buttons:** Neutral grays (#f3f4f6 bg, #374151 text)
- **Destructive:** Red tint (#fef2f2 bg, #dc2626 text)
- **Status badges:** Small pills - green (completed), amber (processing/queued), red (failed)
- **Page background:** #f9fafb (light gray)
- **Cards:** #ffffff (white)

### Typography
- **Font:** Inter, -apple-system, BlinkMacSystemFont
- **H1:** 32px/700 (headings are #111827, NOT purple!)
- **H2:** 28px/700
- **Body:** 15px/400, #374151
- **Labels:** 12px/500, #6b7280, uppercase, letter-spacing: 0.05em

### Spacing
- 8px baseline: 4, 8, 16, 24, 32, 40, 48, 64px
- Card padding: 32px
- Section gaps: 24px

### Components
- **Cards:** 12px radius, shadow: `0 1px 3px rgba(0,0,0,0.1)`
- **Buttons:** 10px radius, 12px 24px padding
- **Inputs:** 1.5px border, 12px radius, focus glow
- **Modals:** 16px radius, shadow: `0 20px 60px rgba(0,0,0,0.15)`

### Modal Structure
- Max-width: 900px
- White background, clean shadows
- Two-column info grid (24px/40px gaps)
- Video player at top with black letterboxing
- Professional button hierarchy (dark primary, gray secondary)

## API Client Structure

```javascript
class OpenAIVideoClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }

  // POST /videos
  async createVideo({ prompt, model, seconds, size, inputReference }) {}

  // GET /videos
  async listVideos({ after, limit, order }) {}

  // GET /videos/{id}
  async retrieveVideo(videoId) {}

  // DELETE /videos/{id}
  async deleteVideo(videoId) {}

  // POST /videos/{id}/remix
  async remixVideo(videoId, prompt) {}

  // GET /videos/{id}/content?variant={variant}
  async downloadContent(videoId, variant = 'video') {}
  // variant: 'video' | 'thumbnail' | 'spritesheet'
}
```

## File Structure

```
/
├── index.html              # All UI
├── src/
│   ├── app.js             # Main logic + API client
│   └── config.js          # .env loader
├── scripts/
│   └── start-server.sh    # Server startup
├── .env                   # OPENAI_API_KEY=sk-...
├── .env.example           # Template
├── .gitignore            # Ignore .env
└── README.md             # Setup instructions
```

## Server Startup

```bash
#!/bin/bash
# scripts/start-server.sh

echo "🎬 Starting Sora Studio..."

if [ -f ".env" ] && grep -q "OPENAI_API_KEY=sk-" .env; then
    echo "✅ API key found"
else
    echo "⚠️  Add API key to .env"
fi

echo "🚀 http://localhost:8000"
python3 -m http.server 8000
```

## Success Test

```
1. Run: ./scripts/start-server.sh
   ✅ Opens http://localhost:8000
   ✅ Toast: "API key loaded from .env"

2. Create video (with correct duration!)
   ✅ Enter prompt → 8s → Landscape → Generate
   ✅ Job appears in dashboard: 🟡 Queued

3. Wait 10 seconds (auto-refresh)
   ✅ Status: 🔵 In Progress (45%)
   ✅ NO manual refresh needed!

4. Wait more
   ✅ Status: 🟢 Completed (100%)
   ✅ Toast: "Video completed!"
   ✅ Download button appears

5. Download
   ✅ Click Download
   ✅ File: sora-video_xxx.mp4
   ✅ Video plays

6. Gallery
   ✅ Switch to Gallery
   ✅ Thumbnail loads instantly
   ✅ Hover → video plays with audio
   ✅ Move away → pauses

7. Remix
   ✅ Click Remix
   ✅ Enter new prompt
   ✅ New job created
```

## Critical Success Factors

### Must Work:
1. ✅ .env file loads automatically
2. ✅ Auto-refresh updates UI without manual intervention
3. ✅ Download uses variant='video' (not 'mp4')
4. ✅ Gallery loads thumbnails first (fast), then videos
5. ✅ Status transitions: queued → in_progress → completed
6. ✅ Toast notifications for completed videos
7. ✅ Duration validation: only 4, 8, 12 seconds
8. ✅ Image dimension validation for references
9. ✅ Status display: "In Progress" not "in_progress"

### Common Mistakes to Avoid:
- ❌ Using variant='mp4' for downloads
- ❌ Not re-rendering UI after status updates
- ❌ Loading full videos in gallery immediately (slow!)
- ❌ Forgetting to await promises in auto-refresh
- ❌ Not showing toast notifications for completed videos
- ❌ Using 6 seconds for duration (API doesn't support it!)
- ❌ Not checking for `in_progress` status (API uses underscore)
- ❌ Showing raw status values instead of formatted labels
- ❌ Using purple everywhere (extreme color restraint!)
- ❌ Not validating image dimensions for references

## Deliverables

1. **Working app** at http://localhost:8000
2. **README.md** with 4-step setup
3. **All features functional** (no bugs)
4. **Clean code** with comments
5. **Professional UI** matching Linear/Vercel/Stripe quality
6. **Extreme color restraint** - purple gradient ONLY for primary CTAs

## The App is Perfect When:

User does this and everything works:
1. Add API key to .env
2. Run ./scripts/start-server.sh
3. Create video → wait → auto-updates → download works
4. Gallery loads fast → hover plays video
5. Remix creates new video
6. Click outside modals to close
7. Status updates automatically from queued → in_progress → completed

**Zero manual intervention. Everything automatic. Clean, professional design. ✨**
