// OpenAI Video API Client and Application Logic

class OpenAIVideoClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.openai.com/v1';
    }

    async createVideo(params) {
        const formData = new FormData();
        formData.append('prompt', params.prompt);
        formData.append('model', params.model || 'sora-2');
        formData.append('seconds', params.seconds || '4');
        formData.append('size', params.size || '720x1280');

        if (params.inputReference) {
            formData.append('input_reference', params.inputReference);
        }

        const response = await fetch(`${this.baseURL}/videos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to create video');
        }

        return await response.json();
    }

    async listVideos(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.after) queryParams.append('after', params.after);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.order) queryParams.append('order', params.order);

        const url = `${this.baseURL}/videos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to list videos');
        }

        return await response.json();
    }

    async retrieveVideo(videoId) {
        const response = await fetch(`${this.baseURL}/videos/${videoId}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to retrieve video');
        }

        return await response.json();
    }

    async deleteVideo(videoId) {
        const response = await fetch(`${this.baseURL}/videos/${videoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to delete video');
        }

        return await response.json();
    }

    async remixVideo(videoId, prompt) {
        const response = await fetch(`${this.baseURL}/videos/${videoId}/remix`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to remix video');
        }

        return await response.json();
    }

    async downloadContent(videoId, variant = 'video') {
        const url = `${this.baseURL}/videos/${videoId}/content?variant=${variant}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to download video content');
        }

        return await response.blob();
    }

    getDownloadURL(videoId, variant = 'video') {
        return `${this.baseURL}/videos/${videoId}/content?variant=${variant}`;
    }
}

// Main Application
const app = {
    client: null,
    jobs: [],
    autoRefreshInterval: null,
    autoRefreshEnabled: true,
    currentTab: 'create',

    // Initialize the application
    async init() {
        console.log('Initializing Sora Studio...');

        // Load configuration from .env file
        await Config.load();

        // Load settings
        this.loadSettings();

        // Check for API key (priority: .env > localStorage)
        const apiKey = Config.getApiKey();
        if (apiKey) {
            this.client = new OpenAIVideoClient(apiKey);
            document.getElementById('apiKeyWarning').classList.add('hidden');

            // If loaded from .env, show success message
            if (Config.OPENAI_API_KEY) {
                console.log('✅ Using API key from .env file');
                this.showToast('API key loaded from .env', 'success');
            }
        } else {
            document.getElementById('apiKeyWarning').classList.remove('hidden');
        }

        // Load jobs from localStorage
        this.loadJobsFromStorage();

        // Set up form handlers
        this.setupFormHandlers();

        // Set up character counter
        this.setupCharacterCounter();

        // Initialize default selections
        this.selectDuration('4');
        this.selectResolution('720x1280');

        // Start auto-refresh if enabled
        if (this.autoRefreshEnabled && this.client) {
            this.startAutoRefresh();
        }

        // Initial render
        this.renderJobs();
        this.renderGallery();

        console.log('Sora Studio initialized successfully!');
    },

    // Settings Management
    loadSettings() {
        // Get API key from .env or localStorage
        const apiKey = Config.getApiKey() || '';
        const defaultDuration = localStorage.getItem('default_duration') || '4';
        const defaultSize = localStorage.getItem('default_size') || '720x1280';
        const refreshInterval = localStorage.getItem('refresh_interval') || '10';

        document.getElementById('apiKeyInput').value = apiKey;
        document.getElementById('defaultDuration').value = defaultDuration;
        document.getElementById('defaultSize').value = defaultSize;
        document.getElementById('refreshIntervalInput').value = refreshInterval;
        document.getElementById('refreshInterval').textContent = refreshInterval;

        // Show note if API key is from .env
        if (Config.OPENAI_API_KEY) {
            const apiKeyInput = document.getElementById('apiKeyInput');
            apiKeyInput.disabled = true;
            apiKeyInput.placeholder = 'Loaded from .env file';
        }
    },

    showSettings() {
        document.getElementById('settingsModal').classList.remove('hidden');
    },

    closeSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    },

    saveSettings() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        const defaultDuration = document.getElementById('defaultDuration').value;
        const defaultSize = document.getElementById('defaultSize').value;
        const refreshInterval = document.getElementById('refreshIntervalInput').value;

        if (apiKey) {
            localStorage.setItem('openai_api_key', apiKey);
            this.client = new OpenAIVideoClient(apiKey);
            document.getElementById('apiKeyWarning').classList.add('hidden');
            this.showToast('API key saved successfully!', 'success');
        } else {
            this.showToast('Please enter a valid API key', 'error');
            return;
        }

        localStorage.setItem('default_duration', defaultDuration);
        localStorage.setItem('default_size', defaultSize);
        localStorage.setItem('refresh_interval', refreshInterval);
        document.getElementById('refreshInterval').textContent = refreshInterval;

        // Restart auto-refresh with new interval
        if (this.autoRefreshEnabled) {
            this.stopAutoRefresh();
            this.startAutoRefresh();
        }

        this.closeSettings();
    },

    toggleApiKeyVisibility() {
        const input = document.getElementById('apiKeyInput');
        const icon = document.getElementById('apiKeyToggleIcon');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    },

    clearAllData() {
        if (confirm('Are you sure you want to clear all local data? This will remove your API key and job history.')) {
            localStorage.clear();
            this.jobs = [];
            this.client = null;
            this.showToast('All data cleared', 'success');
            window.location.reload();
        }
    },

    // Tab Management
    switchTab(tabName) {
        this.currentTab = tabName;

        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });

        // Remove active state from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.color = '#6b7280';
        });

        // Show selected tab
        document.getElementById(`${tabName}Tab`).classList.remove('hidden');

        // Add active state to selected tab button
        const activeBtn = document.getElementById(`tab-${tabName}`);
        activeBtn.classList.add('active');
        activeBtn.style.color = '#111827';

        // Refresh content if needed
        if (tabName === 'dashboard') {
            this.renderJobs();
        } else if (tabName === 'gallery') {
            this.renderGallery();
        }
    },

    // Form Setup
    setupFormHandlers() {
        const form = document.getElementById('createVideoForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createVideo();
        });
    },

    setupCharacterCounter() {
        const promptInput = document.getElementById('prompt');
        const charCount = document.getElementById('charCount');

        promptInput.addEventListener('input', () => {
            const count = promptInput.value.length;
            charCount.textContent = `${count} / 1000`;

            if (count > 900) {
                charCount.classList.add('text-red-500');
            } else {
                charCount.classList.remove('text-red-500');
            }
        });
    },

    selectDuration(seconds) {
        document.getElementById('seconds').value = seconds;

        // Update UI - use segment instead of duration-btn
        document.querySelectorAll('.segment').forEach(btn => {
            if (btn.dataset.duration === seconds) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    selectResolution(size) {
        document.getElementById('size').value = size;

        // Update UI - keep resolution-card logic
        document.querySelectorAll('.size-btn').forEach(btn => {
            if (btn.dataset.size === size) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });

        // Re-validate uploaded file if any
        const fileInput = document.getElementById('inputReference');
        if (fileInput && fileInput.files.length > 0) {
            this.handleFileSelect({ target: fileInput });
        }
    },

    handleFileSelect(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('filePreview');

        if (!file) {
            preview.classList.add('hidden');
            return;
        }

        const selectedSize = document.getElementById('size').value;
        const [expectedWidth, expectedHeight] = selectedSize.split('x').map(Number);

        if (file.type.startsWith('image/')) {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                const dimensionsMatch = img.width === expectedWidth && img.height === expectedHeight;

                preview.classList.remove('hidden');
                preview.innerHTML = `
                    <div class="p-4 rounded-lg ${dimensionsMatch ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-300'}">
                        <img src="${objectUrl}" class="max-h-32 mx-auto rounded mb-2">
                        <p class="text-sm font-medium ${dimensionsMatch ? 'text-green-900' : 'text-yellow-900'} mb-1">${file.name}</p>
                        <p class="text-xs ${dimensionsMatch ? 'text-green-700' : 'text-yellow-700'}">
                            Dimensions: ${img.width} × ${img.height}
                            ${dimensionsMatch
                                ? '<span class="font-semibold"> ✓ Matches selected resolution</span>'
                                : `<br><strong>⚠ Warning:</strong> Expected ${expectedWidth} × ${expectedHeight}. Image will be resized/cropped.`
                            }
                        </p>
                    </div>
                `;
                URL.revokeObjectURL(objectUrl);
            };

            img.onerror = () => {
                preview.classList.remove('hidden');
                preview.innerHTML = `
                    <div class="p-4 rounded-lg bg-red-50 border border-red-200">
                        <p class="text-sm text-red-900">Error loading image</p>
                    </div>
                `;
                URL.revokeObjectURL(objectUrl);
            };

            img.src = objectUrl;

        } else if (file.type.startsWith('video/')) {
            const objectUrl = URL.createObjectURL(file);
            preview.classList.remove('hidden');
            preview.innerHTML = `
                <div class="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <video src="${objectUrl}" class="max-h-32 mx-auto rounded mb-2" controls></video>
                    <p class="text-sm font-medium text-blue-900 mb-1">${file.name}</p>
                    <p class="text-xs text-blue-700">Video reference uploaded</p>
                </div>
            `;
        } else {
            preview.classList.remove('hidden');
            preview.innerHTML = `
                <div class="p-4 rounded-lg bg-red-50 border border-red-200">
                    <p class="text-sm text-red-900">Please upload an image or video file</p>
                </div>
            `;
        }
    },

    // Video Creation
    async createVideo() {
        if (!this.client) {
            this.showToast('Please add your API key in Settings', 'error');
            this.showSettings();
            return;
        }

        const prompt = document.getElementById('prompt').value.trim();
        const model = document.getElementById('model').value;
        const seconds = document.getElementById('seconds').value;
        const size = document.getElementById('size').value;
        const inputReference = document.getElementById('inputReference').files[0];

        if (!prompt) {
            this.showToast('Please enter a prompt', 'error');
            return;
        }

        try {
            this.showToast('Creating video job...', 'info');

            const video = await this.client.createVideo({
                prompt,
                model,
                seconds,
                size,
                inputReference
            });

            // Store job locally
            const job = {
                ...video,
                prompt,
                created_at: video.created_at || Math.floor(Date.now() / 1000)
            };

            this.jobs.unshift(job);
            this.saveJobsToStorage();

            this.showToast('Video job created successfully!', 'success');

            // Reset form
            document.getElementById('createVideoForm').reset();
            document.getElementById('filePreview').classList.add('hidden');
            this.selectDuration('4');
            this.selectResolution('720x1280');

            // Switch to dashboard
            this.switchTab('dashboard');
            this.renderJobs();

        } catch (error) {
            console.error('Error creating video:', error);
            this.showToast(`Error: ${error.message}`, 'error');
        }
    },

    // Job Management
    loadJobsFromStorage() {
        const stored = localStorage.getItem('video_jobs');
        if (stored) {
            try {
                this.jobs = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading jobs from storage:', e);
                this.jobs = [];
            }
        }
    },

    saveJobsToStorage() {
        localStorage.setItem('video_jobs', JSON.stringify(this.jobs));
    },

    async refreshJobs() {
        if (!this.client) return;

        try {
            this.showToast('Refreshing jobs...', 'info');

            // Fetch all videos from API
            const response = await this.client.listVideos({ limit: 100, order: 'desc' });

            // Update local jobs with API data
            if (response.data && response.data.length > 0) {
                // Merge API data with local data
                response.data.forEach(apiJob => {
                    const existingIndex = this.jobs.findIndex(j => j.id === apiJob.id);
                    if (existingIndex >= 0) {
                        // Update existing job
                        this.jobs[existingIndex] = { ...this.jobs[existingIndex], ...apiJob };
                    } else {
                        // Add new job
                        this.jobs.push(apiJob);
                    }
                });

                // Sort by created_at
                this.jobs.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

                this.saveJobsToStorage();
                this.renderJobs();
                this.renderGallery();
            }

            this.showToast('Jobs refreshed', 'success');

        } catch (error) {
            console.error('Error refreshing jobs:', error);
            this.showToast(`Error refreshing: ${error.message}`, 'error');
        }
    },

    async updateJobStatus(videoId) {
        if (!this.client) {
            console.warn('⚠️ updateJobStatus called but no client available');
            return;
        }

        try {
            console.log(`📡 Fetching latest status for ${videoId}...`);
            const video = await this.client.retrieveVideo(videoId);

            const index = this.jobs.findIndex(j => j.id === videoId);
            if (index >= 0) {
                const oldStatus = this.jobs[index].status;
                const oldProgress = this.jobs[index].progress || 0;
                const newStatus = video.status;
                const newProgress = video.progress || 0;

                console.log(`📝 ${videoId}: ${oldStatus} (${oldProgress}%) → ${newStatus} (${newProgress}%)`);

                this.jobs[index] = { ...this.jobs[index], ...video };
                this.saveJobsToStorage();

                // Render immediately after updating this job
                this.renderJobs();
                this.renderGallery();

                console.log(`✓ Rendered UI after updating ${videoId}`);

                // Show notification if status changed to completed
                if (oldStatus !== 'completed' && newStatus === 'completed') {
                    this.showToast(`Video completed! ${videoId}`, 'success');
                    console.log(`🎉 Video ${videoId} completed!`);
                }

                // Show notification if failed
                if (oldStatus !== 'failed' && newStatus === 'failed') {
                    this.showToast(`Video failed: ${videoId}`, 'error');
                    console.log(`❌ Video ${videoId} failed!`);
                }
            } else {
                console.warn(`⚠️ Job ${videoId} not found in local jobs array`);
            }

        } catch (error) {
            console.error(`❌ Error updating job ${videoId}:`, error);
        }
    },

    startAutoRefresh() {
        const interval = parseInt(localStorage.getItem('refresh_interval') || '10') * 1000;

        console.log(`⏰ Auto-refresh started with ${interval/1000}s interval`);

        this.autoRefreshInterval = setInterval(async () => {
            // Only refresh if there are active jobs
            const activeJobs = this.jobs.filter(j =>
                j.status === 'queued' || j.status === 'processing' || j.status === 'in_progress'
            );

            console.log(`🔍 Checking jobs... Total: ${this.jobs.length}, Active: ${activeJobs.length}`);

            if (activeJobs.length > 0) {
                console.log(`🔄 Auto-refreshing ${activeJobs.length} active job(s)...`, activeJobs.map(j => ({id: j.id, status: j.status, progress: j.progress})));

                // Show refreshing indicator
                const indicator = document.getElementById('refreshingIndicator');
                if (indicator) {
                    indicator.classList.remove('hidden');
                }

                try {
                    // Update all active jobs
                    const updates = await Promise.all(
                        activeJobs.map(job => this.updateJobStatus(job.id))
                    );

                    console.log('📊 Updates completed, current statuses:', this.jobs.map(j => ({id: j.id, status: j.status, progress: j.progress})));

                    // Force re-render after all updates - CRITICAL!
                    console.log('🎨 Forcing re-render of dashboard and gallery...');
                    this.renderJobs();
                    this.renderGallery();

                    console.log('✅ Auto-refresh complete');
                } catch (error) {
                    console.error('❌ Auto-refresh error:', error);
                }

                // Hide refreshing indicator
                if (indicator) {
                    indicator.classList.add('hidden');
                }
            }
        }, interval);
    },

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    },

    toggleAutoRefresh() {
        this.autoRefreshEnabled = !this.autoRefreshEnabled;
        const btn = document.getElementById('autoRefreshToggle');

        if (this.autoRefreshEnabled) {
            btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            this.startAutoRefresh();
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i> Resume';
            this.stopAutoRefresh();
        }
    },

    filterJobs() {
        const status = document.getElementById('statusFilter').value;
        const search = document.getElementById('searchJobs').value.toLowerCase();

        const jobCards = document.querySelectorAll('.job-card');

        jobCards.forEach(card => {
            const cardStatus = card.dataset.status;
            const cardText = card.textContent.toLowerCase();

            const statusMatch = status === 'all' || cardStatus === status;
            const searchMatch = search === '' || cardText.includes(search);

            if (statusMatch && searchMatch) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    },

    renderJobs() {
        const container = document.getElementById('jobsList');
        const emptyState = document.getElementById('emptyState');

        if (this.jobs.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        container.innerHTML = this.jobs.map(job => this.renderJobCard(job)).join('');
    },

    renderJobCard(job) {
        const statusConfig = {
            queued: { bg: '#fef3c7', text: '#92400e', icon: 'fa-clock', label: 'Queued' },
            processing: { bg: '#fef3c7', text: '#92400e', icon: 'fa-spinner fa-spin', label: 'Processing' },
            in_progress: { bg: '#fef3c7', text: '#92400e', icon: 'fa-spinner fa-spin', label: 'In Progress' },
            completed: { bg: '#10b981', text: 'white', icon: 'fa-check-circle', label: 'Completed' },
            failed: { bg: '#ef4444', text: 'white', icon: 'fa-times-circle', label: 'Failed' },
            cancelled: { bg: '#f3f4f6', text: '#6b7280', icon: 'fa-ban', label: 'Cancelled' }
        };

        const config = statusConfig[job.status] || { ...statusConfig.cancelled, label: job.status };
        const progress = job.progress || 0;
        const date = job.created_at ? new Date(job.created_at * 1000).toLocaleString() : 'Unknown';
        const promptPreview = (job.prompt || 'No prompt').substring(0, 100) + (job.prompt?.length > 100 ? '...' : '');

        return `
            <div class="job-card p-6 bg-white" data-status="${job.status}">
                <div class="flex items-start justify-between gap-6">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-3">
                            <span class="px-3 py-1 rounded-full text-xs font-medium" style="background: ${config.bg}; color: ${config.text};">
                                <i class="fas ${config.icon} mr-1"></i>${config.label}
                            </span>
                        </div>

                        <div class="mb-3">
                            <button onclick="app.copyToClipboard('${job.id}')" class="text-xs font-mono hover:text-gray-900 transition" style="color: #9ca3af;">
                                ${job.id} <i class="fas fa-copy ml-1"></i>
                            </button>
                        </div>

                        <p class="mb-3" style="color: #374151;">${promptPreview}</p>

                        <div class="flex items-center gap-4 text-sm" style="color: #6b7280;">
                            <span><i class="fas fa-clock mr-1"></i>${date}</span>
                            <span><i class="fas fa-film mr-1"></i>${job.seconds || '?'}s</span>
                            <span><i class="fas fa-expand mr-1"></i>${job.size || '?'}</span>
                        </div>

                        ${(job.status === 'processing' || job.status === 'in_progress' || job.status === 'queued') ? `
                            <div class="mt-4">
                                <div class="flex items-center justify-between text-sm mb-2" style="color: #6b7280;">
                                    <span>Progress</span>
                                    <span>${progress}%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="progress-bar h-2 rounded-full" style="width: ${progress}%"></div>
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="flex flex-col gap-2" style="min-width: 120px;">
                        <button onclick="app.showVideoDetails('${job.id}')" class="btn-secondary text-sm">
                            <i class="fas fa-eye mr-1"></i>Details
                        </button>

                        ${job.status === 'completed' ? `
                            <button onclick="app.downloadVideo('${job.id}')" class="btn-secondary text-sm">
                                <i class="fas fa-download mr-1"></i>Download
                            </button>
                            <button onclick="app.showRemixForm('${job.id}')" class="btn-secondary text-sm">
                                <i class="fas fa-magic mr-1"></i>Remix
                            </button>
                        ` : ''}

                        <button onclick="app.deleteJob('${job.id}')" class="btn-destructive text-sm">
                            <i class="fas fa-trash mr-1"></i>Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Gallery
    renderGallery() {
        const container = document.getElementById('galleryGrid');
        const emptyState = document.getElementById('emptyGallery');

        const completedJobs = this.jobs.filter(j => j.status === 'completed');

        if (completedJobs.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        container.innerHTML = completedJobs.map(job => this.renderGalleryCard(job)).join('');

        // Load video previews after rendering
        if (this.currentTab === 'gallery') {
            completedJobs.forEach(job => {
                this.loadGalleryVideoPreview(job.id);
            });
        }
    },

    renderGalleryCard(job) {
        const date = job.created_at ? new Date(job.created_at * 1000).toLocaleDateString() : 'Unknown';
        const promptPreview = (job.prompt || 'No prompt').substring(0, 80) + (job.prompt?.length > 80 ? '...' : '');

        return `
            <div class="video-card cursor-pointer" onclick="app.showVideoDetails('${job.id}')">
                <div id="gallery-preview-${job.id}" class="aspect-video bg-gray-100 flex items-center justify-center">
                    <i class="fas fa-spinner fa-spin text-2xl" style="color: #d1d5db;"></i>
                </div>

                <div class="p-4">
                    <p class="text-sm mb-3 line-clamp-2" style="color: #374151;">${promptPreview}</p>

                    <div class="flex items-center justify-between text-xs mb-4" style="color: #6b7280;">
                        <span><i class="fas fa-calendar mr-1"></i>${date}</span>
                        <span><i class="fas fa-film mr-1"></i>${job.seconds || '?'}s</span>
                    </div>

                    <div class="flex gap-2">
                        <button onclick="event.stopPropagation(); app.downloadVideo('${job.id}')" class="flex-1 btn-secondary text-xs">
                            <i class="fas fa-download mr-1"></i>Download
                        </button>
                        <button onclick="event.stopPropagation(); app.showRemixForm('${job.id}')" class="flex-1 btn-secondary text-xs">
                            <i class="fas fa-magic mr-1"></i>Remix
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    async loadGalleryVideoPreview(videoId) {
        if (!this.client) return;

        try {
            // First, try to load thumbnail for instant preview
            try {
                const thumbnailBlob = await this.client.downloadContent(videoId, 'thumbnail');
                const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

                const container = document.getElementById(`gallery-preview-${videoId}`);
                if (container) {
                    container.innerHTML = `
                        <div class="relative w-full h-full">
                            <img src="${thumbnailUrl}" class="w-full h-full object-cover" alt="Video thumbnail">
                            <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-10 transition">
                                <i class="fas fa-play-circle text-6xl text-white opacity-75"></i>
                            </div>
                        </div>
                    `;

                    // Now load video in background for hover playback
                    this.loadVideoForHover(videoId);
                }
            } catch (thumbError) {
                console.log('Thumbnail not available, loading video directly...');
                // If thumbnail fails, fall back to video
                await this.loadFullVideoPreview(videoId);
            }
        } catch (error) {
            console.error(`Error loading gallery preview for ${videoId}:`, error);
            const container = document.getElementById(`gallery-preview-${videoId}`);
            if (container) {
                container.innerHTML = `
                    <i class="fas fa-play-circle text-6xl text-white opacity-75"></i>
                `;
            }
        }
    },

    async loadFullVideoPreview(videoId) {
        const blob = await this.client.downloadContent(videoId, 'video');
        const videoUrl = URL.createObjectURL(blob);

        const container = document.getElementById(`gallery-preview-${videoId}`);
        if (container) {
            container.innerHTML = `
                <video
                    class="w-full h-full object-cover"
                    loop
                    muted
                    playsinline
                    onmouseover="this.play(); this.muted=false"
                    onmouseout="this.pause(); this.muted=true; this.currentTime=0"
                >
                    <source src="${videoUrl}" type="video/mp4">
                </video>
            `;
        }
    },

    async loadVideoForHover(videoId) {
        try {
            const blob = await this.client.downloadContent(videoId, 'video');
            const videoUrl = URL.createObjectURL(blob);

            const container = document.getElementById(`gallery-preview-${videoId}`);
            if (container) {
                container.innerHTML = `
                    <video
                        class="w-full h-full object-cover"
                        loop
                        muted
                        playsinline
                        onmouseover="this.play(); this.muted=false"
                        onmouseout="this.pause(); this.muted=true; this.currentTime=0"
                    >
                        <source src="${videoUrl}" type="video/mp4">
                    </video>
                `;
            }
        } catch (error) {
            console.error(`Error loading video for hover ${videoId}:`, error);
        }
    },

    // Video Details Modal
    async showVideoDetails(videoId) {
        const job = this.jobs.find(j => j.id === videoId);

        if (!job) {
            this.showToast('Job not found', 'error');
            return;
        }

        // Refresh job data if needed
        if (this.client && (job.status === 'processing' || job.status === 'in_progress' || job.status === 'queued')) {
            await this.updateJobStatus(videoId);
        }

        const updatedJob = this.jobs.find(j => j.id === videoId);

        const content = document.getElementById('videoDetailsContent');

        // Format dates
        const formatDate = (timestamp) => {
            if (!timestamp) return 'N/A';
            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }) + ' at ' + date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        };

        const createdDate = formatDate(updatedJob.created_at);
        const completedDate = formatDate(updatedJob.completed_at);
        const expiresDate = formatDate(updatedJob.expires_at);

        // Status indicator and labels
        const statusInfo = {
            completed: { color: '#10b981', label: 'Completed' },
            processing: { color: '#f59e0b', label: 'Processing' },
            in_progress: { color: '#f59e0b', label: 'In Progress' },
            queued: { color: '#f59e0b', label: 'Queued' },
            failed: { color: '#ef4444', label: 'Failed' },
            cancelled: { color: '#6b7280', label: 'Cancelled' }
        };
        const status = statusInfo[updatedJob.status] || { color: '#6b7280', label: updatedJob.status };
        const progress = updatedJob.progress || 0;

        content.innerHTML = `
            <!-- Video Player -->
            ${updatedJob.status === 'completed' ? `
                <div id="videoPreviewContainer" class="mb-8 rounded-xl overflow-hidden bg-black" style="box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div class="aspect-video flex items-center justify-center">
                        <i class="fas fa-spinner fa-spin text-3xl text-white opacity-50"></i>
                    </div>
                </div>
            ` : ''}

            <!-- Information Grid -->
            <div class="modal-info-grid mb-8">
                <!-- Status -->
                <div>
                    <div class="modal-info-label">STATUS</div>
                    <div class="modal-info-value" style="font-size: 16px; font-weight: 600;">
                        <span class="status-dot" style="background: ${status.color};"></span>${status.label}
                    </div>
                </div>

                <!-- Progress -->
                <div>
                    <div class="modal-info-label">PROGRESS</div>
                    <div class="modal-info-value-large">${progress}%</div>
                    ${progress < 100 && (updatedJob.status === 'processing' || updatedJob.status === 'in_progress' || updatedJob.status === 'queued') ? `
                        <div class="mt-2 w-full bg-gray-200 rounded-full" style="height: 4px;">
                            <div class="h-full rounded-full" style="width: ${progress}%; background: #10b981;"></div>
                        </div>
                    ` : ''}
                </div>

                <!-- Video ID -->
                <div>
                    <div class="modal-info-label">VIDEO ID</div>
                    <div class="flex items-center gap-2">
                        <code class="text-sm" style="font-family: ui-monospace, monospace; color: #374151;">${updatedJob.id}</code>
                        <button onclick="app.copyToClipboard('${updatedJob.id}')" class="text-xs px-2 py-1 rounded hover:bg-gray-100 transition" style="color: #6b7280;">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>

                <!-- Model -->
                <div>
                    <div class="modal-info-label">MODEL</div>
                    <div class="modal-info-value">${updatedJob.model || 'N/A'}</div>
                </div>

                <!-- Duration -->
                <div>
                    <div class="modal-info-label">DURATION</div>
                    <div class="modal-info-value">${updatedJob.seconds || '?'} seconds</div>
                </div>

                <!-- Resolution -->
                <div>
                    <div class="modal-info-label">RESOLUTION</div>
                    <div class="modal-info-value">${updatedJob.size || 'N/A'}</div>
                </div>

                <!-- Created -->
                <div>
                    <div class="modal-info-label">CREATED</div>
                    <div style="font-size: 15px; font-weight: 400; color: #374151;">${createdDate}</div>
                </div>

                <!-- Completed -->
                <div>
                    <div class="modal-info-label">COMPLETED</div>
                    <div style="font-size: 15px; font-weight: 400; color: #374151;">${completedDate}</div>
                </div>

                ${updatedJob.expires_at ? `
                    <div style="grid-column: 1 / -1;">
                        <div class="modal-info-label">EXPIRES</div>
                        <div style="font-size: 15px; font-weight: 400; color: #374151;">${expiresDate}</div>
                    </div>
                ` : ''}
            </div>

            <!-- Prompt Section -->
            <div class="mb-8">
                <div class="modal-info-label">PROMPT</div>
                <div class="modal-prompt-box">${updatedJob.prompt || 'No prompt available'}</div>
            </div>

            ${updatedJob.status === 'failed' && updatedJob.error ? `
                <div class="mb-8 p-4 rounded-lg" style="background: #fef2f2; border: 1px solid #fecaca;">
                    <div class="modal-info-label" style="color: #dc2626; margin-bottom: 4px;">ERROR DETAILS</div>
                    <p style="font-size: 14px; color: #991b1b; margin-bottom: 4px;">${updatedJob.error.message || 'Unknown error'}</p>
                    <p style="font-size: 12px; color: #dc2626;">Code: ${updatedJob.error.code || 'N/A'}</p>
                </div>
            ` : ''}

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-end" style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
                ${updatedJob.status === 'completed' ? `
                    <button onclick="app.downloadVideo('${updatedJob.id}')" style="background: #111827; color: white; padding: 12px 24px; border-radius: 10px; font-size: 15px; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#374151'" onmouseout="this.style.background='#111827'">
                        <i class="fas fa-download mr-2"></i>Download
                    </button>
                    <button onclick="app.showRemixForm('${updatedJob.id}')" class="btn-secondary">
                        <i class="fas fa-wand-magic-sparkles mr-2"></i>Remix
                    </button>
                ` : ''}
            </div>
        `;

        document.getElementById('videoDetailsModal').classList.remove('hidden');

        // Load video preview if completed
        if (updatedJob.status === 'completed' && this.client) {
            this.loadVideoPreview(updatedJob.id);
        }
    },

    async loadVideoPreview(videoId) {
        try {
            const blob = await this.client.downloadContent(videoId);
            const videoUrl = URL.createObjectURL(blob);

            const container = document.getElementById('videoPreviewContainer');
            if (container) {
                container.innerHTML = `
                    <video controls class="w-full h-full rounded-lg" autoplay>
                        <source src="${videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
            }
        } catch (error) {
            console.error('Error loading video preview:', error);
            const container = document.getElementById('videoPreviewContainer');
            if (container) {
                container.innerHTML = `
                    <div class="text-center">
                        <i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
                        <p class="text-gray-600">Failed to load preview</p>
                        <p class="text-sm text-gray-500 mt-2">${error.message}</p>
                    </div>
                `;
            }
        }
    },

    closeVideoDetails() {
        document.getElementById('videoDetailsModal').classList.add('hidden');
    },

    // Video Actions
    async downloadVideo(videoId) {
        if (!this.client) {
            this.showToast('API client not initialized', 'error');
            return;
        }

        try {
            this.showToast('Preparing download...', 'info');

            const blob = await this.client.downloadContent(videoId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sora-${videoId}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.showToast('Video downloaded successfully!', 'success');

        } catch (error) {
            console.error('Error downloading video:', error);
            this.showToast(`Download failed: ${error.message}`, 'error');
        }
    },

    async deleteJob(videoId) {
        if (!confirm('Are you sure you want to delete this video job?')) {
            return;
        }

        try {
            if (this.client) {
                await this.client.deleteVideo(videoId);
            }

            // Remove from local storage
            this.jobs = this.jobs.filter(j => j.id !== videoId);
            this.saveJobsToStorage();
            this.renderJobs();
            this.renderGallery();

            this.showToast('Video deleted successfully', 'success');

        } catch (error) {
            console.error('Error deleting video:', error);
            this.showToast(`Delete failed: ${error.message}`, 'error');
        }
    },

    // Remix
    showRemixForm(videoId) {
        const job = this.jobs.find(j => j.id === videoId);

        if (!job) {
            this.showToast('Job not found', 'error');
            return;
        }

        const newPrompt = prompt(`Remix video: ${job.id}\n\nOriginal prompt: ${job.prompt}\n\nEnter new prompt for remix:`);

        if (newPrompt && newPrompt.trim()) {
            this.remixVideo(videoId, newPrompt.trim());
        }
    },

    async remixVideo(videoId, prompt) {
        if (!this.client) {
            this.showToast('Please add your API key in Settings', 'error');
            return;
        }

        try {
            this.showToast('Creating remix...', 'info');

            const video = await this.client.remixVideo(videoId, prompt);

            // Store job locally
            const job = {
                ...video,
                prompt,
                created_at: video.created_at || Math.floor(Date.now() / 1000)
            };

            this.jobs.unshift(job);
            this.saveJobsToStorage();

            this.showToast('Remix created successfully!', 'success');
            this.switchTab('dashboard');
            this.renderJobs();

        } catch (error) {
            console.error('Error creating remix:', error);
            this.showToast(`Remix failed: ${error.message}`, 'error');
        }
    },

    // Prompt Templates
    showPromptTemplates() {
        const templates = [
            'A calico cat playing a piano on stage with dramatic lighting',
            'A golden retriever puppy playing in a field of colorful wildflowers at sunset',
            'Ocean waves crashing against rocky cliffs during a storm',
            'Time-lapse of clouds moving across a vibrant sunset sky',
            'A butterfly landing on a blooming flower in slow motion',
            'Aerial view of a winding river through a lush green forest',
            'A robot dancing gracefully in the rain on a city street',
            'Close-up of rain drops falling on window glass with bokeh lights',
            'A serene mountain landscape at dawn with morning mist',
            'Futuristic cityscape with flying cars and neon lights at night'
        ];

        const modal = document.getElementById('promptTemplatesModal');
        const container = modal.querySelector('.space-y-3');

        container.innerHTML = templates.map(template => `
            <button onclick="app.usePromptTemplate('${template.replace(/'/g, "\\'")}')"
                    class="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition">
                <p class="text-sm text-gray-700">${template}</p>
            </button>
        `).join('');

        modal.classList.remove('hidden');
    },

    closePromptTemplates() {
        document.getElementById('promptTemplatesModal').classList.add('hidden');
    },

    usePromptTemplate(template) {
        document.getElementById('prompt').value = template;
        document.getElementById('charCount').textContent = `${template.length} / 1000`;
        this.closePromptTemplates();
        this.switchTab('create');
        this.showToast('Template applied!', 'success');
    },

    // Utilities
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showToast('Failed to copy', 'error');
        });
    },

    exportHistory() {
        const data = JSON.stringify(this.jobs, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `sora-history-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showToast('History exported!', 'success');
    },

    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');

        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md`;
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
