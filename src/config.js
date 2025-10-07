// Configuration loader for environment variables
// This file loads the .env file and makes it available to the app

const Config = {
    OPENAI_API_KEY: null,

    async load() {
        try {
            // Try to load .env file
            const response = await fetch('.env');
            if (response.ok) {
                const envContent = await response.text();
                this.parseEnv(envContent);
                console.log('✅ Configuration loaded from .env file');
                return true;
            }
        } catch (error) {
            console.log('ℹ️ No .env file found, will use localStorage');
        }
        return false;
    },

    parseEnv(content) {
        const lines = content.split('\n');
        for (const line of lines) {
            // Skip comments and empty lines
            if (line.trim().startsWith('#') || !line.trim()) continue;

            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=').trim();

            if (key.trim() === 'OPENAI_API_KEY' && value) {
                this.OPENAI_API_KEY = value;
            }
        }
    },

    getApiKey() {
        // Priority: .env file > localStorage
        if (this.OPENAI_API_KEY) {
            return this.OPENAI_API_KEY;
        }
        return localStorage.getItem('openai_api_key');
    },

    hasApiKey() {
        return !!this.getApiKey();
    }
};
