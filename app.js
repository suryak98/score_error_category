// Application State
let history = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('totalCategories').textContent = ERROR_CATEGORIES.length;
    
    // Character count
    document.getElementById('errorComment').addEventListener('input', function(e) {
        document.getElementById('charCount').textContent = e.target.value.length;
    });
    
    // Enter key to submit
    document.getElementById('errorComment').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            analyzeError();
        }
    });
});

// Extract keywords from text
function extractKeywords(text) {
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const stopWords = new Set(['the', 'and', 'for', 'was', 'not', 'with', 'this', 'that', 'from', 'are', 'been', 'have', 'has']);
    return words.filter(w => !stopWords.has(w));
}

// Calculate similarity between two strings
function calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    let matches = 0;
    let total = Math.max(s1.length, s2.length);
    
    for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
        if (s1[i] === s2[i]) matches++;
    }
    
    return matches / total;
}

// Analyze error comment
function analyzeErrorComment(errorComment) {
    const errorLower = errorComment.toLowerCase();
    const keywords = extractKeywords(errorComment);
    
    // Score each category
    const scores = ERROR_CATEGORIES.map(category => {
        let score = 0;
        const categoryLower = category.toLowerCase();
        const parts = category.split('-');
        const prefix = parts[0] || "";
        const description = parts.slice(1).join('-') || "";
        
        // Keyword matching in description
        keywords.forEach(keyword => {
            if (description.toLowerCase().includes(keyword)) {
                score += 10;
            }
            if (categoryLower.includes(keyword)) {
                score += 5;
            }
        });
        
        // Exact phrase matching
        if (description && errorLower.includes(description.toLowerCase())) {
            score += 30;
        }
        
        // Similarity score
        const similarity = calculateSimilarity(errorComment, description);
        score += similarity * 20;
        
        // Specific keyword rules
        const keywordRules = {
            'eligibility': ['ELG-'],
            'member': ['ELG-', 'COB-'],
            'provider': ['PDM-', 'PEC-'],
            'payment': ['PMT-'],
            'pricing': ['PRC-'],
            'benefit': ['BEN-'],
            'authorization': ['BEN-'],
            'duplicate': ['PMT-Duplicate'],
            'deductible': ['PMT-Member Liability (OOP) - Deductible'],
            'copay': ['PMT-Member Liability (OOP) - Copay'],
            'coinsurance': ['PMT-Member Liability (OOP) - Coinsurance'],
            'network': ['PMT-Paid In-/Out-of-Network', 'PDM-Provider Network'],
            'contract': ['PEC-Provider Contract', 'PRC-Contract/Rate Sheet Load'],
            'coordination': ['COB-'],
            'dental': ['COD-'],
            'medicare': ['OPL-Medicare'],
            'interest': ['PMT-Interest'],
            'timely': ['PMT-Timely Filing'],
            'adjustment': ['WRK-Adjustment'],
            'documentation': ['WRK-Documentation'],
            'system': ['SYS-System'],
        };
        
        Object.entries(keywordRules).forEach(([keyword, prefixes]) => {
            if (errorLower.includes(keyword)) {
                prefixes.forEach(prefixMatch => {
                    if (category.startsWith(prefixMatch)) {
                        score += 15;
                    }
                });
            }
        });
        
        return { category, score };
    });
    
    // Sort by score
    scores.sort((a, b) => b.score - a.score);
    
    // Get top category - prefer non-WRK categories
    let topCategory = null;
    let topScore = 0;
    
    // First, try to find best non-WRK category
    for (const item of scores) {
        if (!item.category.startsWith('WRK-')) {
            topCategory = item.category;
            topScore = item.score;
            break;
        }
    }
    
    // If no non-WRK category found or score is very low, allow WRK-
    if (!topCategory || topScore < 20) {
        topCategory = scores[0].category;
        topScore = scores[0].score;
    }
    
    // Get alternatives (can include WRK- categories)
    const alternatives = scores
        .filter(item => item.category !== topCategory && item.score > 10)
        .slice(0, 3)
        .map(item => item.category);
    
    // Calculate confidence (normalize score to 0-100)
    const maxPossibleScore = 100;
    let confidence = Math.min(100, Math.floor((topScore / maxPossibleScore) * 100));
    
    // Ensure minimum confidence
    if (confidence < 30) {
        confidence = 30;
    }
    
    // Generate reasoning
    let reasoning = "Matched based on keyword analysis and pattern recognition. ";
    const topDesc = topCategory.split('-').slice(1).join('-');
    const hasKeywordMatch = keywords.some(kw => topDesc.toLowerCase().includes(kw));
    
    if (hasKeywordMatch) {
        reasoning += "Found direct keyword matches in category description. ";
    } else {
        reasoning += "Selected based on contextual similarity and domain rules. ";
    }
    
    // Add note if WRK- was deprioritized
    if (scores[0].category.startsWith('WRK-') && !topCategory.startsWith('WRK-')) {
        reasoning += "WRK- categories were considered but deprioritized in favor of more specific categories.";
    }
    
    return {
        success: true,
        category: topCategory,
        confidence: confidence,
        reasoning: reasoning,
        alternative_categories: alternatives
    };
}

// Analyze error
async function analyzeError() {
    const errorComment = document.getElementById('errorComment').value.trim();
    
    if (!errorComment) {
        return;
    }

    const btn = document.getElementById('analyzeBtn');
    const btnText = document.getElementById('btnText');
    const sendIcon = document.getElementById('sendIcon');
    const loadingIcon = document.getElementById('loadingIcon');
    
    btn.disabled = true;
    btnText.textContent = 'Analyzing...';
    sendIcon.classList.add('hidden');
    loadingIcon.classList.remove('hidden');

    // Simulate processing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
        const result = analyzeErrorComment(errorComment);
        displayResult(result, errorComment);
        addToHistory(result, errorComment);
    } catch (error) {
        displayError('Analysis failed. Please try again.');
    } finally {
        btn.disabled = false;
        btnText.textContent = 'Analyze Error';
        sendIcon.classList.remove('hidden');
        loadingIcon.classList.add('hidden');
    }
}

// Display result
function displayResult(data, comment) {
    const resultCard = document.getElementById('resultCard');
    const resultContent = document.getElementById('resultContent');
    
    const confidenceColor = data.confidence >= 80 ? 'green' : data.confidence >= 60 ? 'yellow' : 'orange';
    const confidenceBg = data.confidence >= 80 ? 'bg-green-100' : data.confidence >= 60 ? 'bg-yellow-100' : 'bg-orange-100';
    const confidenceText = data.confidence >= 80 ? 'text-green-600' : data.confidence >= 60 ? 'text-yellow-600' : 'text-orange-600';
    const confidenceBorder = data.confidence >= 80 ? 'border-green-200' : data.confidence >= 60 ? 'border-yellow-200' : 'border-orange-200';

    let alternativesHtml = '';
    if (data.alternative_categories && data.alternative_categories.length > 0) {
        alternativesHtml = `
            <div class="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p class="text-sm font-semibold text-purple-900 mb-2">Alternative Categories</p>
                <ul class="space-y-1">
                    ${data.alternative_categories.map(alt => `
                        <li class="text-sm text-purple-700 flex items-center gap-2">
                            <span class="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                            ${alt}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    resultContent.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center gap-2">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h2 class="text-xl font-semibold text-gray-900">Analysis Complete</h2>
            </div>

            <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-sm font-semibold text-blue-900 mb-2">Assigned Category</p>
                <p class="text-lg font-bold text-blue-700">${data.category}</p>
            </div>

            <div class="p-4 ${confidenceBg} border ${confidenceBorder} rounded-lg">
                <div class="flex items-center justify-between mb-2">
                    <p class="text-sm font-medium text-gray-900">Confidence Score</p>
                    <span class="text-2xl font-bold ${confidenceText}">${data.confidence}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all ${confidenceColor === 'green' ? 'bg-green-600' : confidenceColor === 'yellow' ? 'bg-yellow-600' : 'bg-orange-600'}" style="width: ${data.confidence}%"></div>
                </div>
            </div>

            <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p class="text-sm font-semibold text-gray-900 mb-2">Analysis Reasoning</p>
                <p class="text-sm text-gray-700 leading-relaxed">${data.reasoning}</p>
            </div>

            ${alternativesHtml}
        </div>
    `;

    resultCard.classList.remove('hidden');
}

// Display error
function displayError(message) {
    const resultCard = document.getElementById('resultCard');
    const resultContent = document.getElementById('resultContent');
    
    resultContent.innerHTML = `
        <div class="flex items-center gap-2 text-red-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="font-medium">${message}</p>
        </div>
    `;
    
    resultCard.classList.remove('hidden');
}

// Add to history
function addToHistory(data, comment) {
    history.unshift({
        comment: comment,
        category: data.category,
        confidence: data.confidence,
        timestamp: new Date()
    });
    
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    updateHistory();
    updateStats();
}

// Update history display
function updateHistory() {
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="text-sm text-gray-500 text-center py-8">No analyses yet</p>';
        return;
    }
    
    historyList.innerHTML = history.map(item => `
        <div class="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
            <p class="text-xs text-gray-500 mb-1">${item.timestamp.toLocaleTimeString()}</p>
            <p class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">${item.comment}</p>
            <div class="flex items-center justify-between">
                <p class="text-xs text-blue-600 font-medium">${item.category}</p>
                <span class="text-xs font-bold ${item.confidence >= 80 ? 'text-green-600' : item.confidence >= 60 ? 'text-yellow-600' : 'text-orange-600'}">${item.confidence}%</span>
            </div>
        </div>
    `).join('');
}

// Update stats
function updateStats() {
    document.getElementById('analysisCount').textContent = history.length;
}
