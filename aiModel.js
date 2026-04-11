// AI Model for Error Category Prediction
// This uses keyword matching, semantic analysis, and scenario-based weighting

class ErrorCategoryAI {
    constructor() {
        this.keywords = this.initializeKeywords();
        this.scenarioWeights = this.initializeScenarioWeights();
    }

    // Initialize keyword mappings for each category
    initializeKeywords() {
        return {
            // Payment Related
            'PMT-Duplicate - Approved in Error': ['duplicate', 'approved', 'twice', 'double payment', 'paid multiple'],
            'PMT-Duplicate - Denied in Error': ['duplicate', 'denied', 'should have paid', 'incorrectly denied'],
            'PMT-Member Liability (OOP) - Copay': ['copay', 'co-pay', 'member responsibility', 'patient pay'],
            'PMT-Member Liability (OOP) - Coinsurance': ['coinsurance', 'co-insurance', 'percentage', '80/20', '70/30'],
            'PMT-Member Liability (OOP) - Deductible': ['deductible', 'ded', 'member owes', 'not met'],
            'PMT-Payee Incorrect': ['wrong payee', 'paid wrong', 'incorrect payee', 'payee error'],
            'PMT-Patient Incorrect': ['wrong patient', 'incorrect patient', 'wrong member'],
            'PMT-Paid In-/Out-of-Network': ['network', 'in-network', 'out-of-network', 'oon', 'inn'],
            'PMT-Timely Filing': ['timely filing', 'late', 'filing limit', 'submission deadline'],
            'PMT-Interest Calculation Incorrect': ['interest', 'interest calculation', 'prompt pay interest'],
            'PMT-Line Charge': ['line', 'line charge', 'line item', 'service line'],
            'PMT-Voided Claim': ['void', 'voided', 'reversal', 'reversed'],
            'PMT-Split Claim': ['split', 'split claim', 'separated'],

            // Pricing Related
            'PRC-Method & Rule': ['pricing method', 'pricing rule', 'reimbursement method'],
            'PRC-DRG': ['drg', 'diagnosis related group', 'grouper'],
            'PRC-Per Diem': ['per diem', 'daily rate', 'day rate'],
            'PRC-Ambulance': ['ambulance', 'transport', 'emergency transport'],
            'PRC-Anesthesia': ['anesthesia', 'anesthesiologist', 'crna'],
            'PRC-DME': ['dme', 'durable medical equipment', 'equipment'],
            'PRC-Drugs': ['drug', 'medication', 'pharmaceutical', 'pharmacy'],
            'PRC-Multiple Surgeries': ['multiple surgery', 'multiple procedure', 'bilateral'],
            'PRC-Outpatient': ['outpatient', 'op', 'ambulatory'],
            'PRC-Clinical Edit': ['clinical edit', 'edit', 'medical necessity'],
            'PRC-Contract/Rate Sheet Load': ['contract', 'rate sheet', 'fee schedule'],
            'PRC-ITS Allowed Amount': ['its', 'allowed amount', 'bluecard'],

            // Eligibility/Benefits
            'ELG-Member Eligibility': ['eligibility', 'not eligible', 'termed', 'inactive', 'coverage'],
            'ELG-Group Active/Inactive': ['group', 'group inactive', 'group termed'],
            'BEN-Benefits - Services Paid/Not Paid': ['benefit', 'covered', 'not covered', 'exclusion'],
            'BEN-Authorization': ['authorization', 'auth', 'prior auth', 'pre-auth', 'precert'],
            'BEN-Benefits Maximum/Accum': ['maximum', 'max', 'accumulator', 'limit reached'],

            // COB (Coordination of Benefits)
            'COB-Primacy Order Incorrect Commercial': ['cob', 'primary', 'secondary', 'coordination', 'other insurance'],
            'COB-Primacy Order Incorrect Medicare': ['medicare', 'msp', 'medicare secondary payer'],
            'COB-Payment/Cost Savings Incorrect': ['cob payment', 'cost savings', 'cob calculation'],
            'COB-Effective/Term Date Incorrect': ['effective date', 'term date', 'cob dates'],
            'COB-Member update incomplete': ['cob update', 'member update', 'incomplete update'],

            // Coding
            'COD-Type of Service': ['type of service', 'tos', 'service type'],
            'COD-Data Incorrect/Missing': ['coding', 'code', 'incorrect code', 'missing code'],
            'COD-Dental Tooth': ['tooth', 'dental', 'tooth number'],
            'COD-Pricing Method & Rule NonFinancial': ['pricing method', 'non-financial'],

            // Provider Data
            'PDM-Provider Name': ['provider name', 'wrong provider', 'incorrect provider'],
            'PDM-Provider Network': ['provider network', 'network status', 'par', 'non-par'],
            'PDM-TIN/NPI#': ['tin', 'npi', 'tax id', 'provider id'],
            'PDM-Address': ['address', 'provider address', 'location'],

            // Provider Contract
            'PEC-Provider Contract/Agreement': ['provider contract', 'agreement', 'contract missing'],
            'PEC-Provider Reimbursement/Discount': ['reimbursement', 'discount', 'contract rate'],

            // Workflow (WRK)
            'WRK-Adjustment Incorrect/Incomplete': ['adjustment', 'adjusted', 'reprocess', 'correction'],
            'WRK-Denial Code': ['denial code', 'denial reason', 'denied'],
            'WRK-Claim Note Text': ['note', 'claim note', 'comment', 'remark'],
            'WRK-EOB Message Code': ['eob', 'explanation of benefits', 'message code'],
            'WRK-Documentation/Workflow': ['documentation', 'workflow', 'process', 'procedure'],
            'WRK-Misrouted': ['misrouted', 'wrong queue', 'routing'],
            'WRK-Adjustment Reason Code': ['adjustment reason', 'reason code', 'carc', 'rarc'],

            // System
            'SYS-System': ['system error', 'system issue', 'technical', 'glitch'],

            // Other Party Liability
            'OPL-Medicare': ['medicare', 'cms', 'medicare advantage'],
            'OPL-Worker\'s Comp / Subrogation': ['workers comp', 'subrogation', 'subro', 'accident'],

            // Accumulator
            'ACU-Embedded/Non Embedded': ['embedded', 'non-embedded', 'deductible type'],
            'ACU-Incorrect Year/Contract/Member Worked': ['accumulator', 'wrong year', 'contract year'],

            // Documentation
            'MDOC-Missing Group Documents': ['missing documents', 'group documents', 'documentation missing'],
            'MDOC-Missing Provider Contract': ['missing contract', 'provider contract missing']
        };
    }

    // Initialize scenario-based weights
    initializeScenarioWeights() {
        return {
            payment: {
                prefixes: ['PMT', 'PRC', 'COB'],
                boost: 2.0
            },
            eligibility: {
                prefixes: ['ELG', 'BEN', 'ACU', 'COB'],
                boost: 2.0
            },
            pricing: {
                prefixes: ['PRC', 'COD', 'PEC'],
                boost: 2.0
            }
        };
    }

    // Main prediction function
    predictCategories(comments, scenario = null) {
        const normalizedComments = comments.toLowerCase();
        const scores = {};

        // Calculate base scores for all categories
        ERROR_CATEGORIES.forEach(category => {
            scores[category] = this.calculateScore(category, normalizedComments);
        });

        // Apply scenario weights if selected
        if (scenario && this.scenarioWeights[scenario]) {
            const scenarioConfig = this.scenarioWeights[scenario];
            Object.keys(scores).forEach(category => {
                const prefix = category.split('-')[0];
                if (scenarioConfig.prefixes.includes(prefix)) {
                    scores[category] *= scenarioConfig.boost;
                }
            });
        }

        // Sort categories by score
        const sortedCategories = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .filter(([_, score]) => score > 0);

        // Get primary (non-WRK with highest score)
        const primary = this.getPrimaryCategory(sortedCategories);

        // Get secondary (can include WRK)
        const secondary = this.getSecondaryCategory(sortedCategories, primary);

        // Get alternatives
        const alternatives = this.getAlternatives(sortedCategories, primary, secondary);

        return {
            primary,
            secondary,
            alternatives
        };
    }

    // Calculate score for a category based on keywords
    calculateScore(category, comments) {
        let score = 0;
        const categoryKeywords = this.keywords[category] || [];

        // Keyword matching
        categoryKeywords.forEach(keyword => {
            if (comments.includes(keyword.toLowerCase())) {
                score += 10;
            }
        });

        // Partial word matching
        const categoryWords = category.toLowerCase().split(/[-\s/()]+/);
        categoryWords.forEach(word => {
            if (word.length > 3 && comments.includes(word)) {
                score += 3;
            }
        });

        // Prefix matching (less weight)
        const prefix = category.split('-')[0];
        const prefixWords = CATEGORY_PREFIXES[prefix]?.toLowerCase().split(' ') || [];
        prefixWords.forEach(word => {
            if (comments.includes(word)) {
                score += 1;
            }
        });

        return score;
    }

    // Get primary category (exclude WRK)
    getPrimaryCategory(sortedCategories) {
        const nonWRKCategories = sortedCategories.filter(([cat, _]) => !isWRKCategory(cat));
        
        if (nonWRKCategories.length > 0) {
            const [category, score] = nonWRKCategories[0];
            return {
                category,
                confidence: this.calculateConfidence(score),
                description: this.getCategoryDescription(category)
            };
        }

        // Fallback to first category if all are WRK (shouldn't happen normally)
        if (sortedCategories.length > 0) {
            const [category, score] = sortedCategories[0];
            return {
                category,
                confidence: this.calculateConfidence(score),
                description: this.getCategoryDescription(category)
            };
        }

        return null;
    }

    // Get secondary category (WRK preferred, but not required)
    getSecondaryCategory(sortedCategories, primary) {
        // First try to find a WRK category
        const wrkCategories = sortedCategories.filter(([cat, _]) => 
            isWRKCategory(cat) && cat !== primary?.category
        );

        if (wrkCategories.length > 0) {
            const [category, score] = wrkCategories[0];
            return {
                category,
                confidence: this.calculateConfidence(score),
                description: this.getCategoryDescription(category)
            };
        }

        // If no WRK, get second highest non-WRK
        const alternatives = sortedCategories.filter(([cat, _]) => 
            cat !== primary?.category && !isWRKCategory(cat)
        );

        if (alternatives.length > 0) {
            const [category, score] = alternatives[0];
            return {
                category,
                confidence: this.calculateConfidence(score),
                description: this.getCategoryDescription(category)
            };
        }

        return null;
    }

    // Get alternative categories
    getAlternatives(sortedCategories, primary, secondary) {
        const excludeCategories = [primary?.category, secondary?.category].filter(Boolean);
        
        return sortedCategories
            .filter(([cat, _]) => !excludeCategories.includes(cat))
            .slice(0, 5)
            .map(([category, score]) => ({
                category,
                confidence: this.calculateConfidence(score),
                description: this.getCategoryDescription(category)
            }));
    }

    // Calculate confidence percentage
    calculateConfidence(score) {
        if (score >= 30) return 95;
        if (score >= 20) return 85;
        if (score >= 15) return 75;
        if (score >= 10) return 65;
        if (score >= 5) return 55;
        return 45;
    }

    // Get category description
    getCategoryDescription(category) {
        const group = getCategoryGroup(category);
        const prefix = getCategoryPrefix(category);
        return `${group} (${prefix}) - ${category.split('-').slice(1).join('-')}`;
    }
}

// Create global AI instance
const errorCategoryAI = new ErrorCategoryAI();
