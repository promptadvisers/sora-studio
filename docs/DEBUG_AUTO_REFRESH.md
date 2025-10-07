# 🔍 Debug Auto-Refresh - Step by Step

I've added extensive logging to help us figure out why auto-refresh isn't working. Let's diagnose the issue together.

---

## Step 1: Hard Refresh the Browser

```
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows)
```

---

## Step 2: Open Browser Console

Press `F12` or:
- Mac: `Cmd + Option + J`
- Windows: `Ctrl + Shift + J`

---

## Step 3: Watch the Console

You should see these messages when the app loads:

### On Page Load:
```
Initializing Sora Studio...
✅ Configuration loaded from .env file
⏰ Auto-refresh started with 10s interval
Sora Studio initialized successfully!
```

### Every 10 Seconds:
```
🔍 Checking jobs... Total: 1, Active: 1
🔄 Auto-refreshing 1 active job(s)... [{ id: "video_xxx", status: "processing", progress: 45 }]
📡 Fetching latest status for video_xxx...
📝 video_xxx: processing (45%) → processing (67%)
✓ Rendered UI after updating video_xxx
📊 Updates completed, current statuses: [{ id: "video_xxx", status: "processing", progress: 67 }]
🎨 Forcing re-render of dashboard and gallery...
✅ Auto-refresh complete
```

### When Video Completes:
```
🔍 Checking jobs... Total: 1, Active: 1
🔄 Auto-refreshing 1 active job(s)... [{ id: "video_xxx", status: "processing", progress: 95 }]
📡 Fetching latest status for video_xxx...
📝 video_xxx: processing (95%) → completed (100%)
✓ Rendered UI after updating video_xxx
🎉 Video video_xxx completed!
📊 Updates completed, current statuses: [{ id: "video_xxx", status: "completed", progress: 100 }]
🎨 Forcing re-render of dashboard and gallery...
✅ Auto-refresh complete
```

**And you should see a green toast notification!**

---

## What to Look For

### Problem 1: Auto-refresh not starting
**Symptoms:**
- No `⏰ Auto-refresh started` message
- No `🔍 Checking jobs...` messages every 10 seconds

**Possible Causes:**
- API key not loaded
- Auto-refresh was paused
- Client not initialized

**Fix:**
- Check if API key loaded: Look for "✅ Configuration loaded from .env file"
- Click the Pause/Resume button on dashboard
- Refresh page

---

### Problem 2: Auto-refresh running but not fetching
**Symptoms:**
- See `🔍 Checking jobs... Active: 0` (but you have processing videos)
- No `📡 Fetching latest status...` messages

**Possible Causes:**
- Jobs stored with wrong status
- Filter issue

**Debug:**
Check what's in localStorage:
```javascript
// Run in console:
JSON.parse(localStorage.getItem('video_jobs'))
```

**Fix:**
- Click manual refresh button
- Or clear all data in Settings

---

### Problem 3: Fetching but not rendering
**Symptoms:**
- See `📡 Fetching latest status...`
- See `📝 video_xxx: processing → completed`
- But UI doesn't update

**Possible Causes:**
- Render function error
- DOM not ready

**Debug:**
Run in console:
```javascript
// Force a render:
app.renderJobs();
app.renderGallery();
```

---

### Problem 4: Status not changing on API
**Symptoms:**
- See `📝 video_xxx: processing (50%) → processing (50%)`
- Same status/progress repeatedly

**Possible Cause:**
- Video is actually stuck processing
- API delay

**Check:**
- Wait longer (videos can take 2-5 minutes)
- Manually check status at: https://platform.openai.com/

---

## Manual Testing

### Test 1: Is auto-refresh interval running?

Run in console:
```javascript
// This should return a number (the interval ID)
app.autoRefreshInterval
```

If it returns `null` or `undefined`, auto-refresh is not running.

**Fix:**
```javascript
app.startAutoRefresh()
```

---

### Test 2: Check current jobs status

```javascript
// See all jobs and their statuses
app.jobs.map(j => ({ id: j.id, status: j.status, progress: j.progress }))
```

---

### Test 3: Manually update a job

```javascript
// Replace with your actual video ID
await app.updateJobStatus('video_68e557686c8481989dd85330b031422607a226894e699910')
```

Watch the console for the detailed logs.

---

### Test 4: Force re-render

```javascript
app.renderJobs();
app.renderGallery();
```

Does the UI update now?

---

## Common Issues & Solutions

### Issue: "Active: 0" when video is processing

**Cause:** Local job status is wrong

**Fix:**
```javascript
// Click the refresh button on dashboard
// Or run:
app.refreshJobs()
```

---

### Issue: Interval keeps running but Active: 0

**Cause:** Job completed but still in localStorage with old status

**Fix:**
```javascript
// Clear and re-fetch all jobs
await app.refreshJobs()
```

---

### Issue: Console shows updates but UI frozen

**Cause:** React-like issue where DOM isn't re-rendering

**Fix:**
```javascript
// Force clear and re-render
const container = document.getElementById('jobsList');
container.innerHTML = '';
app.renderJobs();
```

---

## Report Back

After refreshing the page, please tell me:

1. **Do you see the startup messages?**
   - ✅ Configuration loaded
   - ⏰ Auto-refresh started

2. **Every 10 seconds, do you see:**
   - 🔍 Checking jobs...
   - 📡 Fetching latest status...

3. **When status changes, do you see:**
   - 📝 video_xxx: processing → completed
   - 🎉 Video completed!

4. **Does the UI update automatically?**

5. **Copy/paste the console output** when a video transitions from processing to completed

This will help me identify exactly what's happening!

---

## Quick Fix Commands

If auto-refresh seems stuck:

```javascript
// Stop current refresh
app.stopAutoRefresh()

// Start fresh
app.startAutoRefresh()

// Force update all active jobs
app.jobs.filter(j => j.status === 'processing').forEach(j => app.updateJobStatus(j.id))
```

---

**Let's get to the bottom of this!** 🔍
