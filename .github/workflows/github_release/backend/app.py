from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import csv
from typing import List, Dict
import re
from difflib import SequenceMatcher

app = Flask(__name__)
CORS(app)

# Load error categories
ERROR_CATEGORIES = []

def load_categories():
    """Load error categories from CSV file"""
    global ERROR_CATEGORIES
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'ERR_CTGRY_TXT.csv')
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)  # Skip header
            # Load ALL categories (including WRK-)
            ERROR_CATEGORIES = [
                row[0].strip() for row in reader 
                if row and row[0].strip()
            ]
    except FileNotFoundError:
        print(f"Warning: Category file not found at {csv_path}")
        ERROR_CATEGORIES = []

load_categories()

def extract_keywords(text: str) -> List[str]:
    """Extract meaningful keywords from text"""
    # Convert to lowercase and split
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    
    # Remove common stop words
    stop_words = {'the', 'and', 'for', 'was', 'not', 'with', 'this', 'that', 'from', 'are', 'been', 'have', 'has'}
    keywords = [w for w in words if w not in stop_words]
    
    return keywords

def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate similarity between two texts"""
    return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()

def analyze_error_with_rules(error_comment: str, categories: List[str]) -> Dict:
    """Use rule-based matching to categorize error comment"""
    try:
        error_lower = error_comment.lower()
        keywords = extract_keywords(error_comment)
        
        # Category matching scores
        scores = []
        
        for category in categories:
            score = 0
            category_lower = category.lower()
            category_parts = category.split('-')
            
            # Extract category prefix and description
            prefix = category_parts[0] if category_parts else ""
            description = '-'.join(category_parts[1:]) if len(category_parts) > 1 else ""
            
            # Keyword matching in description
            for keyword in keywords:
                if keyword in description.lower():
                    score += 10
                if keyword in category_lower:
                    score += 5
            
            # Exact phrase matching
            if description.lower() in error_lower:
                score += 30
            
            # Similarity score
            similarity = calculate_similarity(error_comment, description)
            score += similarity * 20
            
            # Specific keyword rules
            keyword_rules = {
                'eligibility': ['ELG-'],
                'member': ['ELG-', 'COB-'],
                'provider': ['PDM-', 'PEC-'],
                'payment': ['PMT-'],
                'pricing': ['PRC-'],
                'benefit': ['BEN-'],
                'authorization': ['BEN-', 'RECON-'],
                'claim': ['PMT-', 'WRK-'],
                'duplicate': ['PMT-Duplicate'],
                'deductible': ['PMT-Member Liability (OOP) - Deductible'],
                'copay': ['PMT-Member Liability (OOP) - Copay'],
                'coinsurance': ['PMT-Member Liability (OOP) - Coinsurance'],
                'network': ['PMT-Paid In-/Out-of-Network', 'PDM-Provider Network'],
                'contract': ['PEC-Provider Contract', 'PRC-Contract/Rate Sheet Load'],
                'coordination': ['COB-'],
                'dental': ['COD-'],
                'medicare': ['OPL-Medicare', 'WRK-Medicare'],
                'interest': ['PMT-Interest', 'RECON-Interest'],
                'timely': ['PMT-Timely Filing', 'RECON-Timely Filing'],
                'adjustment': ['WRK-Adjustment'],
                'documentation': ['WRK-Documentation'],
                'system': ['SYS-System'],
            }
            
            for keyword, matching_prefixes in keyword_rules.items():
                if keyword in error_lower:
                    for prefix_match in matching_prefixes:
                        if category.startswith(prefix_match):
                            score += 15
            
            scores.append((category, score))
        
        # Sort by score
        scores.sort(key=lambda x: x[1], reverse=True)
        
        # Get top category - skip WRK- if there's a better non-WRK option
        top_category = None
        top_score = 0
        
        # First, try to find best non-WRK category
        for cat, score in scores:
            if not cat.startswith('WRK-'):
                top_category = cat
                top_score = score
                break
        
        # If no non-WRK category found or score is very low, allow WRK-
        if not top_category or top_score < 20:
            top_category, top_score = scores[0] if scores else ("Unknown", 0)
        
        # Get alternatives (can include WRK- categories)
        alternatives = []
        for cat, score in scores:
            if cat != top_category and score > 10 and len(alternatives) < 3:
                alternatives.append(cat)
        
        # Calculate confidence (normalize score to 0-100)
        max_possible_score = 100
        confidence = min(100, int((top_score / max_possible_score) * 100))
        
        # Ensure minimum confidence
        if confidence < 30:
            confidence = 30
        
        # Generate reasoning
        reasoning = f"Matched based on keyword analysis and pattern recognition. "
        if any(kw in error_lower for kw in extract_keywords(top_category.split('-')[1] if '-' in top_category else top_category)):
            reasoning += "Found direct keyword matches in category description. "
        else:
            reasoning += "Selected based on contextual similarity and domain rules. "
        
        # Add note if WRK- was deprioritized
        if scores and scores[0][0].startswith('WRK-') and not top_category.startswith('WRK-'):
            reasoning += "WRK- categories were considered but deprioritized in favor of more specific categories. "
        
        return {
            "success": True,
            "category": top_category,
            "confidence": confidence,
            "reasoning": reasoning,
            "alternative_categories": alternatives
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Analysis failed: {str(e)}"
        }

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "categories_loaded": len(ERROR_CATEGORIES),
        "ai_provider": "Rule-Based (Free)"
    })

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all error categories"""
    return jsonify({
        "categories": ERROR_CATEGORIES,
        "total": len(ERROR_CATEGORIES)
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_error():
    """Analyze error comment and assign category"""
    data = request.get_json()
    
    if not data or 'error_comment' not in data:
        return jsonify({
            "success": False,
            "error": "error_comment field is required"
        }), 400
    
    error_comment = data['error_comment'].strip()
    
    if not error_comment:
        return jsonify({
            "success": False,
            "error": "error_comment cannot be empty"
        }), 400
    
    if not ERROR_CATEGORIES:
        return jsonify({
            "success": False,
            "error": "Error categories not loaded"
        }), 500
    
    # Analyze with rule-based system
    result = analyze_error_with_rules(error_comment, ERROR_CATEGORIES)
    
    if result.get("success"):
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@app.route('/api/batch-analyze', methods=['POST'])
def batch_analyze():
    """Analyze multiple error comments"""
    data = request.get_json()
    
    if not data or 'error_comments' not in data:
        return jsonify({
            "success": False,
            "error": "error_comments field is required"
        }), 400
    
    error_comments = data['error_comments']
    
    if not isinstance(error_comments, list):
        return jsonify({
            "success": False,
            "error": "error_comments must be an array"
        }), 400
    
    results = []
    for comment in error_comments:
        if comment.strip():
            result = analyze_error_with_rules(comment, ERROR_CATEGORIES)
            results.append({
                "comment": comment,
                "analysis": result
            })
    
    return jsonify({
        "success": True,
        "results": results,
        "total": len(results)
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
