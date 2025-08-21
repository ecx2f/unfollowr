// Popup functionality for Twitch Unfollow Pro
class PopupManager {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadStatus();
    }

    initializeElements() {
        this.openManagerBtn = document.getElementById('openManager');
        this.viewStatsBtn = document.getElementById('viewStats');
        this.statusElement = document.getElementById('status');
        this.loadingElement = document.getElementById('loading');
        this.contentElement = document.querySelector('.content');
    }

    setupEventListeners() {
        this.openManagerBtn.addEventListener('click', () => this.openManager());
        this.viewStatsBtn.addEventListener('click', () => this.viewStats());
    }

    async loadStatus() {
        try {
            // Get stored data
            const data = await chrome.storage.local.get(['lastAnalysis', 'totalChannels', 'unfollowedCount']);
            
            if (data.lastAnalysis) {
                const lastAnalysis = new Date(data.lastAnalysis);
                const timeAgo = this.getTimeAgo(lastAnalysis);
                this.statusElement.textContent = `Last analysis: ${timeAgo}`;
                
                if (data.totalChannels) {
                    this.statusElement.textContent += ` (${data.totalChannels} channels)`;
                }
            } else {
                this.statusElement.textContent = 'Ready to analyze';
            }
        } catch (error) {
            console.error('Error loading status:', error);
            this.statusElement.textContent = 'Ready to analyze';
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    async openManager() {
        try {
            this.showLoading();
            
            // Check if user is logged into Twitch
            const isLoggedIn = await this.checkTwitchLogin();
            
            if (!isLoggedIn) {
                this.showError('Please log into Twitch first');
                return;
            }

            // Open Twitch following page with the manager
            await chrome.tabs.create({
                url: 'https://www.twitch.tv/directory/following/channels'
            });

            // Close popup
            window.close();
            
        } catch (error) {
            console.error('Error opening manager:', error);
            this.showError('Failed to open manager. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async checkTwitchLogin() {
        try {
            // Try to get Twitch user info from storage or make a request
            const response = await fetch('https://www.twitch.tv/', {
                method: 'GET',
                credentials: 'include'
            });
            
            // This is a simplified check - in a real implementation,
            // you'd want to check for specific Twitch login indicators
            return response.ok;
        } catch (error) {
            console.error('Error checking Twitch login:', error);
            return false;
        }
    }

    async viewStats() {
        try {
            const data = await chrome.storage.local.get([
                'totalChannels', 
                'unfollowedCount', 
                'lastAnalysis',
                'analysisHistory'
            ]);
            
            let statsMessage = '📊 Follow Manager Statistics\n\n';
            
            if (data.totalChannels) {
                statsMessage += `📺 Total channels analyzed: ${data.totalChannels}\n`;
            }
            
            if (data.unfollowedCount) {
                statsMessage += `🚫 Channels unfollowed: ${data.unfollowedCount}\n`;
            }
            
            if (data.lastAnalysis) {
                const lastAnalysis = new Date(data.lastAnalysis);
                statsMessage += `🕒 Last analysis: ${lastAnalysis.toLocaleDateString()}\n`;
            }
            
            if (data.analysisHistory && data.analysisHistory.length > 0) {
                statsMessage += `📈 Analysis sessions: ${data.analysisHistory.length}\n`;
            }
            
            if (!data.totalChannels && !data.unfollowedCount) {
                statsMessage += 'No data available yet. Run your first analysis!';
            }
            
            alert(statsMessage);
            
        } catch (error) {
            console.error('Error loading stats:', error);
            this.showError('Failed to load statistics');
        }
    }

    showLoading() {
        this.loadingElement.style.display = 'block';
        this.contentElement.style.display = 'none';
    }

    hideLoading() {
        this.loadingElement.style.display = 'none';
        this.contentElement.style.display = 'block';
    }

    showError(message) {
        this.hideLoading();
        
        // Remove existing error
        const existingError = document.querySelector('.error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        
        // Insert at the top of content
        this.contentElement.insertBefore(errorDiv, this.contentElement.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'STATUS_UPDATE') {
        // Update status in popup
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message.status;
        }
    }
    
    if (message.type === 'ANALYSIS_COMPLETE') {
        // Store analysis data
        chrome.storage.local.set({
            lastAnalysis: Date.now(),
            totalChannels: message.totalChannels,
            analysisHistory: chrome.storage.local.get('analysisHistory').then(data => {
                const history = data.analysisHistory || [];
                history.push({
                    date: Date.now(),
                    totalChannels: message.totalChannels
                });
                return history.slice(-10); // Keep last 10 entries
            })
        });
    }
});
