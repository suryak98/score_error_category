// Main Application Logic
class QAIntelligenceApp {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Analyze button
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.addEventListener('click', () => this.analyzeComments());

        // Clear button
        const clearBtn = document.getElementById('clearBtn');
        clearBtn.addEventListener('click', () => this.clearAll());

        // Enable analyze on text input
        const commentsTextarea = document.getElementById('auditorComments');
        commentsTextarea.addEventListener('input', () => this.updateAnalyzeButton());
    }

    updateAnalyzeButton() {
        const comments = document.getElementById('auditorComments').value.trim();
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.disabled = !comments;
    }

    async analyzeComments() {
        const comments = document.getElementById('auditorComments').value.trim();
        
        if (!comments) {
            alert('Please enter auditor comments before analyzing.');
            return;
        }

        // Show processing indicator
        this.showProcessing(true);
        this.hideSuggestions();

        // Simulate AI processing delay for better UX
        await this.delay(800);

        // Get AI predictions (no scenario)
        const predictions = errorCategoryAI.predictCategories(comments, null);

        // Display results
        this.displayResults(predictions);

        // Hide processing, show suggestions
        this.showProcessing(false);
        this.showSuggestions();
    }

    displayResults(predictions) {
        // Display Primary Category
        if (predictions.primary) {
            document.getElementById('primaryCategory').textContent = predictions.primary.category;
            document.getElementById('primaryConfidence').textContent = 
                `${predictions.primary.confidence}% Confidence`;
            document.getElementById('primaryDescription').textContent = 
                predictions.primary.description;
        } else {
            document.getElementById('primaryCategory').textContent = 'No match found';
            document.getElementById('primaryConfidence').textContent = '';
            document.getElementById('primaryDescription').textContent = 
                'Unable to determine primary category. Please review manually.';
        }

        // Display Secondary Category
        if (predictions.secondary) {
            document.getElementById('secondaryCategory').textContent = predictions.secondary.category;
            document.getElementById('secondaryConfidence').textContent = 
                `${predictions.secondary.confidence}% Confidence`;
            document.getElementById('secondaryDescription').textContent = 
                predictions.secondary.description;
        } else {
            document.getElementById('secondaryCategory').textContent = 'No secondary match';
            document.getElementById('secondaryConfidence').textContent = '';
            document.getElementById('secondaryDescription').textContent = 
                'No suitable secondary category identified.';
        }

        // Display Alternative Categories
        const alternativesList = document.getElementById('alternativesList');
        alternativesList.innerHTML = '';

        if (predictions.alternatives && predictions.alternatives.length > 0) {
            predictions.alternatives.forEach(alt => {
                const altDiv = document.createElement('div');
                altDiv.className = 'alternative-item';
                altDiv.innerHTML = `
                    <span>${alt.category}</span>
                    <span class="alternative-confidence">${alt.confidence}%</span>
                `;
                alternativesList.appendChild(altDiv);
            });
        } else {
            alternativesList.innerHTML = '<p style="color: #64748b;">No alternative categories found.</p>';
        }
    }

    showProcessing(show) {
        const processingIndicator = document.getElementById('processingIndicator');
        processingIndicator.style.display = show ? 'block' : 'none';
    }

    showSuggestions() {
        const suggestionsSection = document.getElementById('suggestionsSection');
        suggestionsSection.style.display = 'block';
    }

    hideSuggestions() {
        const suggestionsSection = document.getElementById('suggestionsSection');
        suggestionsSection.style.display = 'none';
    }


    clearAll() {
        // Clear textarea
        document.getElementById('auditorComments').value = '';

        // Hide result section
        this.hideSuggestions();

        // Disable analyze button
        this.updateAnalyzeButton();

        // Clear results
        document.getElementById('primaryCategory').textContent = '';
        document.getElementById('primaryConfidence').textContent = '';
        document.getElementById('primaryDescription').textContent = '';
        document.getElementById('secondaryCategory').textContent = '';
        document.getElementById('secondaryConfidence').textContent = '';
        document.getElementById('secondaryDescription').textContent = '';
        document.getElementById('alternativesList').innerHTML = '';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new QAIntelligenceApp();
    console.log('QA Intelligence App initialized successfully!');
});
