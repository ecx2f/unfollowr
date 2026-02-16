// ===== TWITCH UNFOLLOW PRO - MAIN SCRIPT =====
// A completely redesigned, intuitive and safe unfollow management system

class TwitchUnfollowManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.channels = [];
        this.selectedChannels = [];
        this.tempSelectedChannels = []; // Para selección temporal en "All Channels"
        this.isAnalyzing = false;
        this.isUnfollowing = false;
        this.canCancel = false;
        this.progress = 0;
        this.currentAction = '';
        
        this.initialize();
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Twitch Unfollow Pro...');
            
            // Wait for page to be ready
            await this.waitForPageReady();
            
            // Check if we're on the correct page
            if (!this.isCorrectPage()) {
                this.showError('Please navigate to your Twitch following page first.');
                return;
            }
            
            // Create and inject the interface
            this.createInterface();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load any saved data
            await this.loadSavedData();
            
            console.log('✅ Twitch Unfollow Pro initialized successfully!');
            
        } catch (error) {
            console.error('❌ Error initializing Follow Manager:', error);
            this.showError('Failed to initialize. Please refresh the page and try again.');
        }
    }

    async waitForPageReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
                return;
            }
            
            const onReady = () => {
                if (document.readyState === 'complete') {
                    document.removeEventListener('readystatechange', onReady);
                    resolve();
                }
            };
            
            document.addEventListener('readystatechange', onReady);
        });
    }

    isCorrectPage() {
        return window.location.href.includes('twitch.tv/directory/following/channels');
    }

    createInterface() {
        const interfaceHTML = `
            <div class="follow-manager-container" id="followManagerContainer">
                <div class="follow-manager-modal">
                    <!-- Header -->
                    <div class="follow-manager-header">
                        <button class="close-button" id="closeButton" aria-label="Close">×</button>
                        <h1 class="follow-manager-title">unfollowr</h1>
                        <p class="follow-manager-subtitle">Manage your follows safely & efficiently</p>
                    </div>

                    <!-- Step Navigation -->
                    <div class="step-navigation">
                        <div class="step-item active" data-step="1">
                            <div class="step-number">1</div>
                            <div class="step-label">Analyze</div>
                        </div>
                        <div class="step-item" data-step="2">
                            <div class="step-number">2</div>
                            <div class="step-label">Select</div>
                        </div>
                        <div class="step-item" data-step="3">
                            <div class="step-number">3</div>
                            <div class="step-label">Preview</div>
                        </div>
                        <div class="step-item" data-step="4">
                            <div class="step-number">4</div>
                            <div class="step-label">Execute</div>
                        </div>
                    </div>

                    <!-- Main Content -->
                    <div class="follow-manager-content">
                        <!-- Step 1: Analysis -->
                        <div class="step-content active" id="step1">
                            <div class="analysis-section">
                                <div class="analysis-icon" aria-hidden="true">—</div>
                                <h2 class="analysis-title">Analyze Your Follows</h2>
                                <p class="analysis-description">
                                    We'll scan your Twitch following list to identify all channels you're currently following. 
                                    This process is safe and only reads public information.
                                </p>
                                <button class="analysis-button" id="analyzeButton">
                                    <span class="button-text">Start Analysis</span>
                                    <span class="loading-spinner" style="display: none;"></span>
                                </button>
                            </div>
                        </div>

                        <!-- Step 2: Selection -->
                        <div class="step-content" id="step2">
                            <div class="selection-section">
                                <div class="channel-list-container">
                                    <div class="channel-list-header">
                                        <h3 class="channel-list-title">All Channels</h3>
                                        <span class="channel-count" id="totalCount">0</span>
                                    </div>
                                    <div class="channel-controls">
                                        <input type="text" class="channel-search" id="allChannelsSearch" placeholder="Search channels...">
                                        <div class="channel-buttons">
                                            <button class="channel-button" id="selectAllBtn">Select All</button>
                                            <button class="channel-button" id="deselectAllBtn">Deselect All</button>
                                            <button class="channel-button move-btn" id="moveSelectedBtn">Move Selected</button>
                                        </div>
                                    </div>
                                    <div class="channel-list" id="allChannelsList">
                                        <div class="channel-item-placeholder">Start analysis to see your channels</div>
                                    </div>
                                </div>
                                
                                <div class="channel-list-container">
                                    <div class="channel-list-header">
                                        <h3 class="channel-list-title">Keep Following</h3>
                                        <span class="channel-count" id="selectedCount">0</span>
                                    </div>
                                    <div class="channel-controls">
                                        <input type="text" class="channel-search" id="selectedChannelsSearch" placeholder="Search selected...">
                                        <div class="channel-buttons">
                                            <button class="channel-button" id="selectAllKeepBtn">Select All</button>
                                            <button class="channel-button" id="clearSelectedBtn">Clear All</button>
                                        </div>
                                    </div>
                                    <div class="channel-list" id="selectedChannelsList">
                                        <div class="channel-item-placeholder">Select channels to keep following</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 3: Preview -->
                        <div class="step-content" id="step3">
                            <div class="preview-section">
                                <div class="preview-icon" aria-hidden="true">—</div>
                                <h2 class="preview-title">Preview Actions</h2>
                                <p class="preview-description">
                                    Review what will happen before we make any changes. 
                                    You can still modify your selection or cancel the process.
                                </p>
                                
                                <div class="preview-stats">
                                    <div class="stat-card total">
                                        <div class="stat-number" id="previewTotal">0</div>
                                        <div class="stat-label">Total Channels</div>
                                    </div>
                                    <div class="stat-card keeping">
                                        <div class="stat-number" id="previewKeeping">0</div>
                                        <div class="stat-label">Keeping</div>
                                    </div>
                                    <div class="stat-card unfollowing">
                                        <div class="stat-number" id="previewUnfollowing">0</div>
                                        <div class="stat-label">Unfollowing</div>
                                    </div>
                                </div>
                                
                                <div class="preview-channels" id="previewChannelsList">
                                    <!-- Preview channels will be populated here -->
                                </div>
                            </div>
                        </div>

                        <!-- Step 4: Execution -->
                        <div class="step-content" id="step4">
                            <div class="execution-section">
                                <div class="execution-icon" aria-hidden="true">—</div>
                                <h2 class="execution-title">Executing Changes</h2>
                                <p class="execution-description">
                                    We're now processing your unfollow requests. 
                                    Please keep this tab open and don't navigate away.
                                </p>
                                
                                <div class="progress-container">
                                    <div class="current-action" id="currentAction">Preparing...</div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                                    </div>
                                    <div class="progress-text" id="progressText">0% Complete</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="follow-manager-footer">
                        <button class="footer-button secondary" id="backButton" style="display: none;">Back</button>
                        <button class="footer-button secondary" id="cancelButton" style="display: none;">Cancel</button>
                        <button class="footer-button primary" id="nextButton" style="display: none;">Continue</button>
                        <button class="footer-button danger" id="confirmButton" style="display: none;">Confirm Unfollow</button>
                        <button class="footer-button success" id="finishButton" style="display: none;">Finish</button>
                    </div>
                </div>

                <!-- Confirmation Modal -->
                <div class="confirmation-modal" id="confirmationModal" style="display: none;">
                    <div class="confirmation-content">
                        <div class="confirmation-icon" aria-hidden="true">!</div>
                        <h3 class="confirmation-title">WARNING: You are about to unfollow <span id="unfollowCount">0</span> channels!</h3>
                        <p class="confirmation-description">
                            This action cannot be undone. Are you absolutely sure you want to continue?
                        </p>
                        <div class="confirmation-buttons">
                            <button class="confirmation-button cancel" id="cancelConfirmBtn">Cancel</button>
                            <button class="confirmation-button confirm" id="proceedConfirmBtn">Yes, Unfollow</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', interfaceHTML);
    }

    setupEventListeners() {
        // Close button
        document.getElementById('closeButton').addEventListener('click', () => {
            this.closeInterface();
        });

        // Step navigation
        document.querySelectorAll('.step-item').forEach(item => {
            item.addEventListener('click', () => {
                const step = parseInt(item.dataset.step);
                if (step <= this.currentStep) {
                    this.goToStep(step);
                }
            });
        });

        // Analysis button
        document.getElementById('analyzeButton').addEventListener('click', () => {
            this.startAnalysis();
        });

        // Search functionality
        document.getElementById('allChannelsSearch').addEventListener('input', (e) => {
            this.filterChannels('all', e.target.value);
        });

        document.getElementById('selectedChannelsSearch').addEventListener('input', (e) => {
            this.filterChannels('selected', e.target.value);
        });

        // Selection buttons
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.selectAllChannels();
        });

        document.getElementById('deselectAllBtn').addEventListener('click', () => {
            this.deselectAllChannels();
        });

        document.getElementById('selectAllKeepBtn').addEventListener('click', () => {
            this.selectAllKeepChannels();
        });

        document.getElementById('clearSelectedBtn').addEventListener('click', () => {
            this.clearSelectedChannels();
        });

        document.getElementById('moveSelectedBtn').addEventListener('click', () => {
            this.moveSelectedChannels();
        });

        // Footer buttons
        document.getElementById('backButton').addEventListener('click', () => {
            this.previousStep();
        });

        document.getElementById('nextButton').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('cancelButton').addEventListener('click', () => {
            this.cancelOperation();
        });

        document.getElementById('confirmButton').addEventListener('click', () => {
            this.confirmUnfollow();
        });

        document.getElementById('finishButton').addEventListener('click', () => {
            this.closeInterface();
        });

        // Click outside to close
        document.getElementById('followManagerContainer').addEventListener('click', (e) => {
            if (e.target.id === 'followManagerContainer') {
                this.closeInterface();
            }
        });

        // Close confirmation modal when clicking outside
        document.getElementById('confirmationModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmationModal') {
                document.getElementById('confirmationModal').style.display = 'none';
            }
        });
    }

    async loadSavedData() {
        try {
            const data = await chrome.storage.local.get(['channels', 'selectedChannels']);
            if (data.channels && data.channels.length > 0) {
                this.channels = data.channels;
                this.selectedChannels = data.selectedChannels || [];
                this.updateChannelLists();
                this.updateStepNavigation();
            }
        } catch (error) {
            console.warn('Could not load saved data:', error);
        }
    }

    async saveData() {
        try {
            await chrome.storage.local.set({
                channels: this.channels,
                selectedChannels: this.selectedChannels,
                lastUpdate: Date.now()
            });
        } catch (error) {
            console.warn('Could not save data:', error);
        }
    }

    async startAnalysis() {
        if (this.isAnalyzing) return;

        this.isAnalyzing = true;
        this.updateAnalysisButton(true);

        try {
            console.log('🔍 Starting channel analysis...');
            
            // Scroll to load all channels
            await this.scrollToLoadAllChannels();
            
            // Extract channel information
            this.channels = await this.extractChannels();
            
            console.log(`✅ Found ${this.channels.length} channels`);
            
            // Update interface
            this.updateChannelLists();
            this.updateStepNavigation();
            
            // Save data
            await this.saveData();
            
            // Notify popup
            chrome.runtime.sendMessage({
                type: 'ANALYSIS_COMPLETE',
                totalChannels: this.channels.length
            });
            
            // Auto-advance to next step
            setTimeout(() => this.nextStep(), 1000);
            
        } catch (error) {
            console.error('❌ Analysis failed:', error);
            this.showError('Analysis failed. Please try again.');
        } finally {
            this.isAnalyzing = false;
            this.updateAnalysisButton(false);
        }
    }

    async scrollToLoadAllChannels() {
        const scrollElement = await this.waitForElement('[class*="root-scrollable__content"]', 10000);
        if (!scrollElement) {
            throw new Error('Could not find scrollable content');
        }

        let previousHeight = 0;
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
            await this.wait(2000);

            const currentHeight = scrollElement.scrollHeight;
            if (currentHeight === previousHeight) {
                break;
            }

            previousHeight = currentHeight;
            attempts++;
        }

        // Scroll back to top
        scrollElement.scrollTop = 0;
    }

    async extractChannels() {
        const channelElements = document.querySelectorAll('[data-a-target="user-card-modal"]');
        const channels = [];

        channelElements.forEach(element => {
            const anchor = element.querySelector('a');
            if (anchor) {
                const href = anchor.getAttribute('href');
                const name = anchor.textContent.trim();
                
                if (href && name) {
                    channels.push({
                        id: href.replace('/', ''),
                        name: name,
                        href: href,
                        avatar: this.getChannelAvatar(name)
                    });
                }
            }
        });

        return channels.sort((a, b) => a.name.localeCompare(b.name));
    }

    getChannelAvatar(name) {
        // Generate a simple avatar based on the channel name
        const colors = ['#9147ff', '#772ce8', '#ff4757', '#2ed573', '#ffa502', '#3742fa'];
        const color = colors[name.length % colors.length];
        const initial = name.charAt(0).toUpperCase();
        
        return { color, initial };
    }

    updateChannelLists() {
        this.updateAllChannelsList();
        this.updateSelectedChannelsList();
        this.updateCounts();
    }

    updateAllChannelsList() {
        const container = document.getElementById('allChannelsList');
        const searchTerm = document.getElementById('allChannelsSearch').value.toLowerCase();
        
        const filteredChannels = this.channels.filter(channel => 
            !this.selectedChannels.includes(channel.id) &&
            channel.name.toLowerCase().includes(searchTerm)
        );

        if (filteredChannels.length === 0) {
            container.innerHTML = '<div class="channel-item-placeholder">No channels found</div>';
            return;
        }

        container.innerHTML = filteredChannels.map(channel => {
            const isTempSelected = this.tempSelectedChannels.includes(channel.id);
            return `
                <div class="channel-item ${isTempSelected ? 'temp-selected' : ''}" data-channel-id="${channel.id}">
                    <div class="channel-avatar" style="background: ${channel.avatar.color}">
                        ${channel.avatar.initial}
                    </div>
                    <div class="channel-name">${channel.name}</div>
                    <div class="channel-checkbox ${isTempSelected ? 'checked' : ''}" onclick="window.followManager.toggleTempSelection('${channel.id}')"></div>
                </div>
            `;
        }).join('');

        // Add click event listeners to channel items
        container.querySelectorAll('.channel-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't trigger if clicking on the checkbox (it has its own handler)
                if (e.target.classList.contains('channel-checkbox')) {
                    return;
                }
                const channelId = item.dataset.channelId;
                this.toggleTempSelection(channelId);
            });
        });
    }

    updateSelectedChannelsList() {
        const container = document.getElementById('selectedChannelsList');
        const searchTerm = document.getElementById('selectedChannelsSearch').value.toLowerCase();
        
        const selectedChannelData = this.channels.filter(channel => 
            this.selectedChannels.includes(channel.id) &&
            channel.name.toLowerCase().includes(searchTerm)
        );

        if (selectedChannelData.length === 0) {
            container.innerHTML = '<div class="channel-item-placeholder">No selected channels</div>';
            return;
        }

        container.innerHTML = selectedChannelData.map(channel => `
            <div class="channel-item selected" data-channel-id="${channel.id}">
                <div class="channel-avatar" style="background: ${channel.avatar.color}">
                    ${channel.avatar.initial}
                </div>
                <div class="channel-name">${channel.name}</div>
                <div class="channel-checkbox checked" onclick="window.followManager.toggleChannelSelection('${channel.id}')"></div>
            </div>
        `).join('');

        // Add click event listeners to channel items
        container.querySelectorAll('.channel-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't trigger if clicking on the checkbox (it has its own handler)
                if (e.target.classList.contains('channel-checkbox')) {
                    return;
                }
                const channelId = item.dataset.channelId;
                this.toggleChannelSelection(channelId);
            });
        });
    }

    updateCounts() {
        document.getElementById('totalCount').textContent = this.channels.filter(channel => 
            !this.selectedChannels.includes(channel.id)
        ).length;
        document.getElementById('selectedCount').textContent = this.selectedChannels.length;
    }

    filterChannels(type, searchTerm) {
        // The filtering is handled in updateChannelLists()
        this.updateChannelLists();
    }

    toggleTempSelection(channelId) {
        const index = this.tempSelectedChannels.indexOf(channelId);
        
        if (index > -1) {
            this.tempSelectedChannels.splice(index, 1);
        } else {
            this.tempSelectedChannels.push(channelId);
        }
        
        console.log('Temp selected channels:', this.tempSelectedChannels);
        
        this.updateChannelLists();
        this.updateStepNavigation(); // Forzar actualización de botones
    }

    toggleChannelSelection(channelId) {
        // Si está en "Keep Following", lo movemos de vuelta a "All Channels"
        const index = this.selectedChannels.indexOf(channelId);
        
        if (index > -1) {
            this.selectedChannels.splice(index, 1);
            this.showSuccess('Channel moved back to "All Channels"!');
        } else {
            // Si no está en "Keep Following", lo movemos ahí
            this.selectedChannels.push(channelId);
            this.showSuccess('Channel moved to "Keep Following"!');
        }
        
        this.updateChannelLists();
        this.updateStepNavigation();
    }

    selectAllChannels() {
        // Seleccionar temporalmente todos los canales en "All Channels"
        this.tempSelectedChannels = this.channels
            .filter(channel => !this.selectedChannels.includes(channel.id))
            .map(channel => channel.id);
        
        console.log('Select All - Channels to select:', this.tempSelectedChannels);
        console.log('Select All - Total channels:', this.channels.length);
        console.log('Select All - Selected channels (Keep Following):', this.selectedChannels.length);
        
        this.updateChannelLists();
        this.updateStepNavigation(); // Forzar actualización de botones
        this.showSuccess('All channels selected for action!');
    }

    deselectAllChannels() {
        this.tempSelectedChannels = [];
        this.updateChannelLists();
        this.updateStepNavigation(); // Forzar actualización de botones
        this.showSuccess('All temporary selections cleared!');
    }

    selectAllKeepChannels() {
        this.selectedChannels = [...this.channels.map(channel => channel.id)];
        this.tempSelectedChannels = [];
        this.updateChannelLists();
        this.updateStepNavigation();
        this.showSuccess('All channels selected to keep!');
    }

    toggleExcludeMode() {
        // In exclude mode, we select all channels except the ones we want to keep
        const currentSelected = [...this.selectedChannels];
        this.selectedChannels = this.channels
            .filter(channel => !currentSelected.includes(channel.id))
            .map(channel => channel.id);
        
        this.updateChannelLists();
        this.updateStepNavigation();
        this.showSuccess('Switched to exclude mode!');
    }

    clearSelectedChannels() {
        this.selectedChannels = [];
        this.updateChannelLists();
        this.updateStepNavigation();
        this.showSuccess('Selected channels cleared!');
    }

    moveSelectedChannels() {
        if (this.tempSelectedChannels.length === 0) {
            this.showError('No channels selected to move!');
            return;
        }

        // Mover los canales temporalmente seleccionados a "Keep Following"
        this.selectedChannels = [...this.selectedChannels, ...this.tempSelectedChannels];
        this.tempSelectedChannels = [];
        
        this.updateChannelLists();
        this.updateStepNavigation();
        this.showSuccess(`${this.selectedChannels.length} channels moved to "Keep Following"!`);
    }

    // Método para mover canales directamente sin selección temporal
    moveChannelToKeepFollowing(channelId) {
        if (!this.selectedChannels.includes(channelId)) {
            this.selectedChannels.push(channelId);
            this.updateChannelLists();
            this.updateStepNavigation();
            this.showSuccess('Channel moved to "Keep Following"!');
        }
    }

    // Método para mover canales desde Keep Following de vuelta a All Channels
    moveChannelToAllChannels(channelId) {
        const index = this.selectedChannels.indexOf(channelId);
        if (index > -1) {
            this.selectedChannels.splice(index, 1);
            this.updateChannelLists();
            this.updateStepNavigation();
            this.showSuccess('Channel moved back to "All Channels"!');
        }
    }

    updateStepNavigation() {
        // Update step completion status
        const steps = document.querySelectorAll('.step-item');
        
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Update footer buttons
        this.updateFooterButtons();
    }

    updateFooterButtons() {
        const backButton = document.getElementById('backButton');
        const nextButton = document.getElementById('nextButton');
        const cancelButton = document.getElementById('cancelButton');
        const confirmButton = document.getElementById('confirmButton');
        const finishButton = document.getElementById('finishButton');

        // Hide all buttons first
        [backButton, nextButton, cancelButton, confirmButton, finishButton].forEach(btn => {
            btn.style.display = 'none';
        });

        console.log('=== updateFooterButtons Debug ===');
        console.log('Current step:', this.currentStep);
        console.log('Temp selected channels:', this.tempSelectedChannels);
        console.log('Temp selected length:', this.tempSelectedChannels.length);
        console.log('Selected channels (Keep Following):', this.selectedChannels);
        console.log('Selected channels length:', this.selectedChannels.length);
        console.log('Is unfollowing:', this.isUnfollowing);
        console.log('Progress:', this.progress);

        // Show appropriate buttons based on current step
        switch (this.currentStep) {
            case 1:
                if (this.channels.length > 0) {
                    nextButton.style.display = 'inline-block';
                    console.log('Step 1: Showing next button');
                }
                break;
            case 2:
                backButton.style.display = 'inline-block';
                // Mostrar "Continue" si hay canales temporalmente seleccionados para eliminar
                // (independientemente de si hay canales en "Keep Following")
                if (this.tempSelectedChannels.length > 0) {
                    nextButton.style.display = 'inline-block';
                    console.log('Step 2: Showing next button - channels selected for unfollowing!');
                } else {
                    console.log('Step 2: Not showing next button - no channels selected for unfollowing');
                }
                break;
            case 3:
                backButton.style.display = 'inline-block';
                confirmButton.style.display = 'inline-block';
                console.log('Step 3: Showing back and confirm buttons');
                break;
            case 4:
                if (this.isUnfollowing && this.progress < 100) {
                    // Durante el proceso de eliminación (antes del 100%)
                    cancelButton.style.display = 'inline-block';
                    console.log('Step 4: Showing cancel button (unfollowing in progress, progress < 100%)');
                } else if (this.progress >= 100 || (!this.isUnfollowing && this.progress > 0)) {
                    // Proceso completado (100% o terminado)
                    finishButton.style.display = 'inline-block';
                    console.log('Step 4: Showing finish button (process complete, progress >= 100%)');
                }
                break;
        }
        console.log('=== End updateFooterButtons Debug ===');
    }

    goToStep(step) {
        if (step < 1 || step > this.totalSteps) return;
        
        // Hide all step content
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show target step content
        document.getElementById(`step${step}`).classList.add('active');
        
        this.currentStep = step;
        this.updateStepNavigation();
        
        // Update preview if on step 3
        if (step === 3) {
            this.updatePreview();
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.goToStep(this.currentStep + 1);
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    }

    updatePreview() {
        const total = this.channels.length;
        const keeping = this.channels.length - this.tempSelectedChannels.length; // Los que no están temporalmente seleccionados
        const unfollowing = this.tempSelectedChannels.length; // Los temporalmente seleccionados

        document.getElementById('previewTotal').textContent = total;
        document.getElementById('previewKeeping').textContent = keeping;
        document.getElementById('previewUnfollowing').textContent = unfollowing;

        // Update preview channels list
        const previewContainer = document.getElementById('previewChannelsList');
        const channelsToShow = this.channels.slice(0, 10); // Show first 10 channels

        previewContainer.innerHTML = channelsToShow.map(channel => {
            const isKeeping = !this.tempSelectedChannels.includes(channel.id);
            return `
                <div class="preview-channel-item">
                    <div class="preview-channel-avatar" style="background: ${channel.avatar.color}">
                        ${channel.avatar.initial}
                    </div>
                    <div class="preview-channel-name">${channel.name}</div>
                    <div class="preview-channel-action ${isKeeping ? 'keeping' : 'unfollowing'}">
                        ${isKeeping ? 'Keeping' : 'Unfollowing'}
                    </div>
                </div>
            `;
        }).join('');

        if (this.channels.length > 10) {
            previewContainer.innerHTML += `
                <div class="preview-channel-item">
                    <div class="preview-channel-name" style="text-align: center; opacity: 0.7;">
                        ... and ${this.channels.length - 10} more channels
                    </div>
                </div>
            `;
        }
    }

    async confirmUnfollow() {
        // Los canales a unfollowear son los que están temporalmente seleccionados en "All Channels"
        const unfollowing = this.tempSelectedChannels.length;
        
        if (unfollowing === 0) {
            this.showError('No channels selected for unfollowing. Please select channels in "All Channels" first.');
            return;
        }

        // Show confirmation modal
        document.getElementById('unfollowCount').textContent = unfollowing;
        document.getElementById('confirmationModal').style.display = 'flex';

        // Set up one-time event listeners for the modal buttons
        const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
        const proceedConfirmBtn = document.getElementById('proceedConfirmBtn');

        // Remove any existing listeners
        const newCancelBtn = cancelConfirmBtn.cloneNode(true);
        const newProceedBtn = proceedConfirmBtn.cloneNode(true);
        cancelConfirmBtn.parentNode.replaceChild(newCancelBtn, cancelConfirmBtn);
        proceedConfirmBtn.parentNode.replaceChild(newProceedBtn, proceedConfirmBtn);

        // Add new listeners
        newCancelBtn.addEventListener('click', () => {
            document.getElementById('confirmationModal').style.display = 'none';
        });

        newProceedBtn.addEventListener('click', async () => {
            document.getElementById('confirmationModal').style.display = 'none';
            this.goToStep(4);
            await this.startUnfollowProcess();
        });
    }

    async startUnfollowProcess() {
        if (this.isUnfollowing) return;

        this.isUnfollowing = true;
        this.canCancel = true;
        this.progress = 0;

        // Update buttons immediately to show Cancel button
        this.updateFooterButtons();

        // Solo unfollowear los canales temporalmente seleccionados
        const channelsToUnfollow = this.channels.filter(channel => 
            this.tempSelectedChannels.includes(channel.id)
        );

        try {
            for (let i = 0; i < channelsToUnfollow.length; i++) {
                if (!this.canCancel) {
                    this.updateProgress('Operation cancelled', 100);
                    break;
                }

                const channel = channelsToUnfollow[i];
                this.updateProgress(`Unfollowing ${channel.name}...`, (i / channelsToUnfollow.length) * 100);

                await this.unfollowChannel(channel);
                await this.wait(1000); // Rate limiting
            }

            if (this.canCancel) {
                this.updateProgress('All done!', 100);
                this.showSuccess(`Successfully unfollowed ${channelsToUnfollow.length} channels.`);
                
                // Update storage
                await chrome.storage.local.set({
                    unfollowedCount: (await chrome.storage.local.get('unfollowedCount')).unfollowedCount + channelsToUnfollow.length
                });

                // Mark as complete before updating buttons
                this.isUnfollowing = false;
                this.canCancel = false;
                
                // Show finish button
                this.updateFooterButtons();
            }

        } catch (error) {
            console.error('❌ Unfollow process failed:', error);
            this.showError('Some unfollows failed. Please check the console for details.');
        } finally {
            // Only set to false if not already set in the success block
            if (this.isUnfollowing) {
                this.isUnfollowing = false;
                this.canCancel = false;
            }
        }
    }

    async unfollowChannel(channel) {
        try {
            // Find the unfollow button for this channel
            const channelElement = document.querySelector(`[data-a-target="user-card-modal"] a[href="${channel.href}"]`);
            if (!channelElement) {
                console.warn(`Could not find channel element for ${channel.name}`);
                return;
            }

            const userCard = channelElement.closest('[data-a-target="user-card-modal"]');
            const unfollowButton = userCard.querySelector('[data-test-selector="unfollow-button"]');
            
            if (!unfollowButton) {
                console.warn(`Could not find unfollow button for ${channel.name}`);
                return;
            }

            // Click unfollow button
            unfollowButton.click();
            await this.wait(500);

            // Click confirmation button
            const confirmButton = await this.waitForElement('[data-a-target="modal-unfollow-button"]', 3000);
            if (confirmButton) {
                confirmButton.click();
                console.log(`✅ Unfollowed ${channel.name}`);
            } else {
                console.warn(`Could not find confirmation button for ${channel.name}`);
            }

        } catch (error) {
            console.error(`Failed to unfollow ${channel.name}:`, error);
        }
    }

    updateProgress(action, percentage) {
        this.currentAction = action;
        this.progress = percentage;

        document.getElementById('currentAction').textContent = action;
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('progressText').textContent = `${Math.round(percentage)}% Complete`;
        
        // Update buttons when progress reaches 100%
        if (percentage >= 100) {
            this.updateFooterButtons();
        }
    }

    cancelOperation() {
        if (this.isUnfollowing) {
            this.canCancel = false;
            this.updateProgress('Cancelling...', this.progress);
        }
    }

    updateAnalysisButton(loading) {
        const button = document.getElementById('analyzeButton');
        const buttonText = button.querySelector('.button-text');
        const spinner = button.querySelector('.loading-spinner');

        if (loading) {
            button.disabled = true;
            buttonText.textContent = 'Analyzing...';
            spinner.style.display = 'inline-block';
        } else {
            button.disabled = false;
            buttonText.textContent = 'Start Analysis';
            spinner.style.display = 'none';
        }
    }

    async waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found after ${timeout}ms`));
            }, timeout);
        });
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Segoe UI', sans-serif;
            box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
            max-width: 300px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    showSuccess(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ed573;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Segoe UI', sans-serif;
            box-shadow: 0 4px 12px rgba(46, 213, 115, 0.3);
            max-width: 300px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Método para forzar actualización completa
    forceUpdate() {
        this.updateChannelLists();
        this.updateStepNavigation();
        console.log('Force update completed');
    }

    closeInterface() {
        const container = document.getElementById('followManagerContainer');
        if (container) {
            container.remove();
        }
    }
}

// Initialize the manager when the page is ready
let followManager;

// Function to initialize the manager
function initializeManager() {
    if (!followManager) {
        followManager = new TwitchUnfollowManager();
        window.followManager = followManager;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeManager, 1000);
    });
} else {
    setTimeout(initializeManager, 1000);
}

// Also try to initialize after a delay in case the page loads differently
setTimeout(initializeManager, 3000);
