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
            btn.classList.remove('gradient-primary', 'text-white');
            btn.style.color = 'var(--gray-600)';
        });

        // Show selected tab
        document.getElementById(`${tabName}Tab`).classList.remove('hidden');

        // Add active state to selected tab button
        const activeBtn = document.getElementById(`tab-${tabName}`);
        activeBtn.classList.add('gradient-primary', 'text-white');
        activeBtn.style.color = '';

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
    },

    handleFileSelect(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('filePreview');

        if (file) {
            preview.classList.remove('hidden');

            if (file.type.startsWith('image/')) {
                preview.innerHTML = `
                    <img src="${URL.createObjectURL(file)}" class="max-h-32 mx-auto rounded">
                    <p class="text-sm text-gray-600 mt-2">${file.name}</p>
                `;
            } else if (file.type.startsWith('video/')) {
                preview.innerHTML = `
                    <video src="${URL.createObjectURL(file)}" class="max-h-32 mx-auto rounded" controls></video>
                    <p class="text-sm text-gray-600 mt-2">${file.name}</p>
                `;
            }
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
                j.status === 'queued' || j.status === 'processing'
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
        const statusColors = {
            queued: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
            processing: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
            completed: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
            failed: 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
            cancelled: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
        };

        const statusIcons = {
            queued: 'fa-clock',
            processing: 'fa-spinner fa-spin',
            completed: 'fa-check-circle',
            failed: 'fa-times-circle',
            cancelled: 'fa-ban'
        };

        const progress = job.progress || 0;
        const statusColor = statusColors[job.status] || 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
        const statusIcon = statusIcons[job.status] || 'fa-question-circle';

        const date = job.created_at ? new Date(job.created_at * 1000).toLocaleString() : 'Unknown';
        const promptPreview = (job.prompt || 'No prompt').substring(0, 100) + (job.prompt?.length > 100 ? '...' : '');

        return `
            <div class="job-card p-6 bg-white" data-status="${job.status}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-3">
                            <span class="px-4 py-2 rounded-xl text-xs font-bold ${statusColor} shadow-md">
                                <i class="fas ${statusIcon} mr-2"></i>${job.status.toUpperCase()}
                            </span>
                            ${job.remixed_from_video_id ? '<span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold"><i class="fas fa-magic mr-1"></i>Remix</span>' : ''}
                        </div>

                        <div class="mb-3">
                            <button onclick="app.copyToClipboard('${job.id}')" class="text-sm text-gray-500 hover:text-blue-600 font-mono bg-gray-50 px-3 py-1 rounded-lg hover:bg-blue-50 transition">
                                ${job.id} <i class="fas fa-copy ml-1"></i>
                            </button>
                        </div>

                        <p class="text-gray-700 mb-3 font-medium">${promptPreview}</p>

                        <div class="flex items-center space-x-5 text-sm text-gray-600">
                            <span class="flex items-center space-x-1"><i class="fas fa-clock text-blue-500"></i><span>${date}</span></span>
                            <span class="flex items-center space-x-1"><i class="fas fa-film text-purple-500"></i><span>${job.seconds || '?'}s</span></span>
                            <span class="flex items-center space-x-1"><i class="fas fa-expand text-pink-500"></i><span>${job.size || '?'}</span></span>
                        </div>

                        ${(job.status === 'processing' || job.status === 'queued') ? `
                            <div class="mt-4">
                                <div class="flex items-center justify-between text-sm text-gray-700 mb-2 font-semibold">
                                    <span>Progress</span>
                                    <span class="text-blue-600">${progress}%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div class="progress-bar h-3 rounded-full" style="width: ${progress}%"></div>
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="ml-6 flex flex-col space-y-2">
                        <button onclick="app.showVideoDetails('${job.id}')" class="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition transform hover:scale-105 text-sm font-bold">
                            <i class="fas fa-eye mr-1"></i>Details
                        </button>

                        ${job.status === 'completed' ? `
                            <button onclick="app.downloadVideo('${job.id}')" class="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition transform hover:scale-105 text-sm font-bold">
                                <i class="fas fa-download mr-1"></i>Download
                            </button>
                            <button onclick="app.showRemixForm('${job.id}')" class="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition transform hover:scale-105 text-sm font-bold">
                                <i class="fas fa-magic mr-1"></i>Remix
                            </button>
                        ` : ''}

                        <button onclick="app.deleteJob('${job.id}')" class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition transform hover:scale-105 text-sm font-bold">
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
            <div class="video-card glass rounded-2xl shadow-lg overflow-hidden cursor-pointer" onclick="app.showVideoDetails('${job.id}')">
                <div id="gallery-preview-${job.id}" class="aspect-video bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center relative">
                    <i class="fas fa-spinner fa-spin text-4xl text-white opacity-75"></i>
                </div>

                <div class="p-5">
                    <p class="text-sm text-gray-700 mb-3 line-clamp-2 font-medium">${promptPreview}</p>

                    <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span class="flex items-center space-x-1"><i class="fas fa-calendar"></i><span>${date}</span></span>
                        <span class="flex items-center space-x-1"><i class="fas fa-film"></i><span>${job.seconds || '?'}s</span></span>
                    </div>

                    <div class="flex space-x-2">
                        <button onclick="event.stopPropagation(); app.downloadVideo('${job.id}')" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition transform hover:scale-105">
                            <i class="fas fa-download mr-1"></i>Download
                        </button>
                        <button onclick="event.stopPropagation(); app.showRemixForm('${job.id}')" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition transform hover:scale-105">
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
        if (this.client && (job.status === 'processing' || job.status === 'queued')) {
            await this.updateJobStatus(videoId);
        }

        const updatedJob = this.jobs.find(j => j.id === videoId);

        const content = document.getElementById('videoDetailsContent');

        const date = updatedJob.created_at ? new Date(updatedJob.created_at * 1000).toLocaleString() : 'Unknown';
        const completedDate = updatedJob.completed_at ? new Date(updatedJob.completed_at * 1000).toLocaleString() : 'N/A';
        const expiresDate = updatedJob.expires_at ? new Date(updatedJob.expires_at * 1000).toLocaleString() : 'N/A';

        content.innerHTML = `
            <div class="space-y-6">
                ${updatedJob.status === 'completed' ? `
                    <div id="videoPreviewContainer" class="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <div class="text-center">
                            <i class="fas fa-spinner fa-spin text-4xl text-white mb-4"></i>
                            <p class="text-gray-600">Loading video preview...</p>
                        </div>
                    </div>
                ` : ''}

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-sm font-medium text-gray-500">Status</label>
                        <p class="text-lg font-semibold text-gray-900">${updatedJob.status}</p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500">Progress</label>
                        <p class="text-lg font-semibold text-gray-900">${updatedJob.progress || 0}%</p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500">Video ID</label>
                        <p class="text-sm font-mono text-gray-900">${updatedJob.id}</p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500">Model</label>
                        <p class="text-sm text-gray-900">${updatedJob.model || 'N/A'}</p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500">Duration</label>
                        <p class="text-sm text-gray-900">${updatedJob.seconds || '?'} seconds</p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500">Resolution</label>
                        <p class="text-sm text-gray-900">${updatedJob.size || 'N/A'}</p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500">Created</label>
                        <p class="text-sm text-gray-900">${date}</p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500">Completed</label>
                        <p class="text-sm text-gray-900">${completedDate}</p>
                    </div>

                    ${updatedJob.expires_at ? `
                        <div class="col-span-2">
                            <label class="text-sm font-medium text-gray-500">Expires</label>
                            <p class="text-sm text-gray-900">${expiresDate}</p>
                        </div>
                    ` : ''}

                    ${updatedJob.remixed_from_video_id ? `
                        <div class="col-span-2">
                            <label class="text-sm font-medium text-gray-500">Remixed From</label>
                            <p class="text-sm text-gray-900 font-mono">${updatedJob.remixed_from_video_id}</p>
                        </div>
                    ` : ''}
                </div>

                <div>
                    <label class="text-sm font-medium text-gray-500">Prompt</label>
                    <p class="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">${updatedJob.prompt || 'No prompt available'}</p>
                </div>

                ${updatedJob.status === 'failed' && updatedJob.error ? `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 class="text-sm font-semibold text-red-900 mb-2">Error Details</h4>
                        <p class="text-sm text-red-700">${updatedJob.error.message || 'Unknown error'}</p>
                        <p class="text-xs text-red-600 mt-1">Code: ${updatedJob.error.code || 'N/A'}</p>
                    </div>
                ` : ''}

                <div class="flex space-x-3 pt-4 border-t border-gray-200">
                    ${updatedJob.status === 'completed' ? `
                        <button onclick="app.downloadVideo('${updatedJob.id}')" class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                            <i class="fas fa-download mr-2"></i>Download Video
                        </button>
                        <button onclick="app.showRemixForm('${updatedJob.id}')" class="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                            <i class="fas fa-magic mr-2"></i>Remix Video
                        </button>
                    ` : ''}

                    <button onclick="app.copyToClipboard('${updatedJob.id}')" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                        <i class="fas fa-copy mr-2"></i>Copy ID
                    </button>
                </div>
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
