// Application State
var history = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    try {
        document.getElementById('totalCategories').textContent = ERROR_CATEGORIES.length;
        
        // Character count
        var errorCommentEl = document.getElementById('errorComment');
        if (errorCommentEl) {
            errorCommentEl.addEventListener('input', function(e) {
                var charCountEl = document.getElementById('charCount');
                if (charCountEl) {
                    charCountEl.textContent = e.target.value.length;
                }
            });
            
            // Enter key to submit (with fallback for older browsers)
            errorCommentEl.addEventListener('keypress', function(e) {
                var key = e.key || e.keyCode || e.which;
                var isEnter = (key === 'Enter' || key === 13);
                if (isEnter && !e.shiftKey) {
                    e.preventDefault();
                    analyzeError();
                }
            });
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// Extract keywords from text
function extractKeywords(text) {
    var words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    var stopWords = ['the', 'and', 'for', 'was', 'not', 'with', 'this', 'that', 'from', 'are', 'been', 'have', 'has'];
    return words.filter(function(w) {
        return stopWords.indexOf(w) === -1;
    });
}

// Calculate similarity between two strings
function calculateSimilarity(str1, str2) {
    var s1 = str1.toLowerCase();
    var s2 = str2.toLowerCase();
    
    var matches = 0;
    var total = Math.max(s1.length, s2.length);
    
    for (var i = 0; i < Math.min(s1.length, s2.length); i++) {
        if (s1[i] === s2[i]) matches++;
    }
    
    return matches / total;
}

// Analyze error comment
function analyzeErrorComment(errorComment) {
    var errorLower = errorComment.toLowerCase();
    var keywords = extractKeywords(errorComment);
    
    // Score each category
    var scores = ERROR_CATEGORIES.map(function(category) {
        var score = 0;
        var categoryLower = category.toLowerCase();
        var parts = category.split('-');
        var prefix = parts[0] || "";
        var description = parts.slice(1).join('-') || "";
        
        // Keyword matching in description
        keywords.forEach(function(keyword) {
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
        var similarity = calculateSimilarity(errorComment, description);
        score += similarity * 20;
        
        // Specific keyword rules
        var keywordRules = {
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
            'system': ['SYS-System']
        };
        
        Object.keys(keywordRules).forEach(function(keyword) {
            var prefixes = keywordRules[keyword];
            if (errorLower.includes(keyword)) {
                prefixes.forEach(function(prefixMatch) {
                    if (category.indexOf(prefixMatch) === 0) {
                        score += 15;
                    }
                });
            }
        });
        
        return { category: category, score: score };
    });
    
    // Sort by score
    scores.sort(function(a, b) {
        return b.score - a.score;
    });
    
    // Get top category - prefer non-WRK categories
    var topCategory = null;
    var topScore = 0;
    
    // First, try to find best non-WRK category
    for (var i = 0; i < scores.length; i++) {
        var item = scores[i];
        if (item.category.indexOf('WRK-') !== 0) {
            topCategory = item.category;
            topScore = item.score;
            break;
        }
    }
    
    // If no non-WRK category found or score is very low, allow WRK-
    if (!topCategory || topScore < 20) {
        if (scores.length > 0) {
            topCategory = scores[0].category;
            topScore = scores[0].score;
        } else {
            topCategory = "Unknown";
            topScore = 0;
        }
    }
    
    // Get alternatives (can include WRK- categories)
    var alternatives = [];
    for (var j = 0; j < scores.length && alternatives.length < 3; j++) {
        if (scores[j].category !== topCategory && scores[j].score > 10) {
            alternatives.push(scores[j].category);
        }
    }
    
    // Calculate confidence (normalize score to 0-100)
    var maxPossibleScore = 100;
    var confidence = Math.min(100, Math.floor((topScore / maxPossibleScore) * 100));
    
    // Ensure minimum confidence
    if (confidence < 30) {
        confidence = 30;
    }
    
    // Generate reasoning
    var reasoning = "Matched based on keyword analysis and pattern recognition. ";
    var topDesc = topCategory.split('-').slice(1).join('-');
    
    // Check for keyword match (IE11 compatible)
    var hasKeywordMatch = false;
    for (var k = 0; k < keywords.length; k++) {
        if (topDesc.toLowerCase().indexOf(keywords[k]) !== -1) {
            hasKeywordMatch = true;
            break;
        }
    }
    
    if (hasKeywordMatch) {
        reasoning += "Found direct keyword matches in category description. ";
    } else {
        reasoning += "Selected based on contextual similarity and domain rules. ";
    }
    
    // Add note if WRK- was deprioritized
    if (scores.length > 0 && scores[0].category.indexOf('WRK-') === 0 && topCategory.indexOf('WRK-') !== 0) {
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
function analyzeError() {
    var errorCommentEl = document.getElementById('errorComment');
    if (!errorCommentEl) return;
    
    var errorComment = errorCommentEl.value.trim();
    
    if (!errorComment) {
        return;
    }

    var btn = document.getElementById('analyzeBtn');
    var btnText = document.getElementById('btnText');
    var sendIcon = document.getElementById('sendIcon');
    var loadingIcon = document.getElementById('loadingIcon');
    
    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = 'Analyzing...';
    if (sendIcon) sendIcon.classList.add('hidden');
    if (loadingIcon) loadingIcon.classList.remove('hidden');

    // Simulate processing delay for better UX
    setTimeout(function() {
        try {
            // Validate categories are loaded
            if (!ERROR_CATEGORIES || ERROR_CATEGORIES.length === 0) {
                throw new Error('Categories not loaded');
            }
            
            var result = analyzeErrorComment(errorComment);
            
            // Validate result
            if (!result || !result.category) {
                throw new Error('Invalid analysis result');
            }
            
            displayResult(result, errorComment);
            addToHistory(result, errorComment);
        } catch (error) {
            var errorMsg = 'Analysis failed. Please try again.';
            if (error && error.message) {
                console.error('Analysis error:', error.message);
                // Show more specific error in development
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    errorMsg = 'Error: ' + error.message;
                }
            }
            displayError(errorMsg);
        } finally {
            if (btn) btn.disabled = false;
            if (btnText) btnText.textContent = 'Analyze Error';
            if (sendIcon) sendIcon.classList.remove('hidden');
            if (loadingIcon) loadingIcon.classList.add('hidden');
        }
    }, 300);
}

// Display result
function displayResult(data, comment) {
    var resultCard = document.getElementById('resultCard');
    var resultContent = document.getElementById('resultContent');
    
    if (!resultCard || !resultContent) return;
    
    var confidenceColor = data.confidence >= 80 ? 'green' : data.confidence >= 60 ? 'yellow' : 'orange';
    var confidenceBg = data.confidence >= 80 ? 'bg-green-100' : data.confidence >= 60 ? 'bg-yellow-100' : 'bg-orange-100';
    var confidenceText = data.confidence >= 80 ? 'text-green-600' : data.confidence >= 60 ? 'text-yellow-600' : 'text-orange-600';
    var confidenceBorder = data.confidence >= 80 ? 'border-green-200' : data.confidence >= 60 ? 'border-yellow-200' : 'border-orange-200';

    var alternativesHtml = '';
    if (data.alternative_categories && data.alternative_categories.length > 0) {
        var altItems = data.alternative_categories.map(function(alt) {
            return '<li class="text-sm text-purple-700 flex items-center gap-2">' +
                   '<span class="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>' +
                   alt +
                   '</li>';
        }).join('');
        
        alternativesHtml = '<div class="p-4 bg-purple-50 border border-purple-200 rounded-lg">' +
            '<p class="text-sm font-semibold text-purple-900 mb-2">Alternative Categories</p>' +
            '<ul class="space-y-1">' + altItems + '</ul>' +
            '</div>';
    }

    var progressBarBg = confidenceColor === 'green' ? 'bg-green-600' : confidenceColor === 'yellow' ? 'bg-yellow-600' : 'bg-orange-600';

    resultContent.innerHTML = 
        '<div class="space-y-4">' +
            '<div class="flex items-center gap-2">' +
                '<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>' +
                '</svg>' +
                '<h2 class="text-xl font-semibold text-gray-900">Analysis Complete</h2>' +
            '</div>' +
            '<div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">' +
                '<p class="text-sm font-semibold text-blue-900 mb-2">Assigned Category</p>' +
                '<p class="text-lg font-bold text-blue-700">' + data.category + '</p>' +
            '</div>' +
            '<div class="p-4 ' + confidenceBg + ' border ' + confidenceBorder + ' rounded-lg">' +
                '<div class="flex items-center justify-between mb-2">' +
                    '<p class="text-sm font-medium text-gray-900">Confidence Score</p>' +
                    '<span class="text-2xl font-bold ' + confidenceText + '">' + data.confidence + '%</span>' +
                '</div>' +
                '<div class="w-full bg-gray-200 rounded-full h-2">' +
                    '<div class="h-2 rounded-full transition-all ' + progressBarBg + '" style="width: ' + data.confidence + '%"></div>' +
                '</div>' +
            '</div>' +
            '<div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">' +
                '<p class="text-sm font-semibold text-gray-900 mb-2">Analysis Reasoning</p>' +
                '<p class="text-sm text-gray-700 leading-relaxed">' + data.reasoning + '</p>' +
            '</div>' +
            alternativesHtml +
        '</div>';

    resultCard.classList.remove('hidden');
}

// Display error
function displayError(message) {
    var resultCard = document.getElementById('resultCard');
    var resultContent = document.getElementById('resultContent');
    
    if (!resultCard || !resultContent) return;
    
    resultContent.innerHTML = 
        '<div class="flex items-center gap-2 text-red-600">' +
            '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>' +
            '</svg>' +
            '<p class="font-medium">' + message + '</p>' +
        '</div>';
    
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
    var historyList = document.getElementById('historyList');
    
    if (!historyList) return;
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="text-sm text-gray-500 text-center py-8">No analyses yet</p>';
        return;
    }
    
    var historyHtml = history.map(function(item) {
        var confColor = item.confidence >= 80 ? 'text-green-600' : item.confidence >= 60 ? 'text-yellow-600' : 'text-orange-600';
        return '<div class="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">' +
            '<p class="text-xs text-gray-500 mb-1">' + item.timestamp.toLocaleTimeString() + '</p>' +
            '<p class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">' + item.comment + '</p>' +
            '<div class="flex items-center justify-between">' +
                '<p class="text-xs text-blue-600 font-medium">' + item.category + '</p>' +
                '<span class="text-xs font-bold ' + confColor + '">' + item.confidence + '%</span>' +
            '</div>' +
        '</div>';
    }).join('');
    
    historyList.innerHTML = historyHtml;
}

// Update stats
function updateStats() {
    var analysisCount = document.getElementById('analysisCount');
    if (analysisCount) {
        analysisCount.textContent = history.length;
    }
}
