# Usage Guide

Learn how to use the Error Categorization Portal effectively.

## 🎯 Basic Usage

### Starting the Portal

1. **Start Backend:**
   ```bash
   cd backend
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   python app.py
   ```

2. **Open Frontend:**
   - Open `frontend/index.html` in your browser
   - Configure server address in Settings (⚙️)

3. **Analyze Errors:**
   - Enter error comment
   - Click "Analyze Error"
   - Review results

## 📝 Analyzing Errors

### Step-by-Step

1. **Enter Error Comment**
   - Paste or type the error description
   - More detail = better accuracy
   - Example: "Member eligibility was not verified correctly before processing the claim"

2. **Click Analyze**
   - Button shows "Analyzing..." while processing
   - Results appear in ~100ms

3. **Review Results**
   - **Assigned Category**: Primary categorization
   - **Confidence Score**: How confident the system is (0-100%)
   - **Reasoning**: Why this category was selected
   - **Alternatives**: Other possible categories

### Example Analysis

**Input:**
```
Member eligibility was not verified correctly
```

**Output:**
```
✅ Assigned Category: ELG-Member Eligibility
📊 Confidence: 85%
💡 Reasoning: Matched based on keyword analysis and pattern recognition. 
   Found direct keyword matches in category description.
📌 Alternatives:
   • COB-Member update incomplete
   • WRK-Documentation/Workflow
   • BEN-Authorization
```

## 🎨 Understanding Results

### Confidence Scores

- **80-100% (Green)**: High confidence - very likely correct
- **60-79% (Yellow)**: Medium confidence - probably correct
- **0-59% (Orange)**: Lower confidence - review alternatives

### Assigned Category

The primary category selected by the AI. This is:
- **Non-WRK preferred**: System prioritizes specific categories
- **WRK- deprioritized**: Only selected when truly appropriate
- **Best match**: Highest scoring category

### Alternative Categories

Up to 3 alternative suggestions:
- May include WRK- categories
- Helpful for edge cases
- Consider when confidence is low

## 🔧 Settings Configuration

### Backend Server Address

Click **Settings (⚙️)** to configure:

**Localhost (Same Computer):**
```
localhost
```

**Network IP (Different Computer):**
```
192.168.1.100
```

**Hostname:**
```
server.company.com
```

### Connection Status

- **🟢 Connected**: Backend is reachable
- **🟡 Not Connected**: Need to configure
- **🔴 Disconnected**: Backend not running or unreachable

## 📊 Statistics Panel

Track your usage:

- **Total Categories**: 126 available categories
- **Analyses Today**: Count of analyses in current session
- **Status**: Connection status to backend

## 📜 History Panel

View recent analyses:
- Shows last 10 analyses
- Click to view details
- Stored in browser only (not on server)
- Clears when browser is closed

## 💡 Tips for Best Results

### 1. Be Descriptive
❌ Bad: "Error in claim"
✅ Good: "Member eligibility was not verified correctly before processing the claim"

### 2. Include Key Details
- What went wrong?
- Which system/process?
- What was affected?

### 3. Use Domain Terms
- "eligibility" → ELG categories
- "provider" → PDM/PEC categories
- "payment" → PMT categories
- "pricing" → PRC categories

### 4. Check Confidence
- High confidence (80+%): Trust the result
- Medium confidence (60-79%): Review alternatives
- Low confidence (<60%): Consider manual review

### 5. Review Alternatives
- Especially important for edge cases
- WRK- categories shown when relevant
- May reveal better matches

## 🎯 Category Prefixes Guide

Understanding category prefixes helps you verify results:

| Prefix | Meaning | Example |
|--------|---------|---------|
| ACU | Actuarial | ACU-Retro Change |
| BEN | Benefits | BEN-Authorization |
| COB | Coordination of Benefits | COB-Primacy Order Incorrect |
| COD | Coding | COD-Type of Service |
| ELG | Eligibility | ELG-Member Eligibility |
| MDOC | Missing Documents | MDOC-Missing Provider Contract |
| OPL | Other Party Liability | OPL-Medicare |
| OTH | Other | OTH-Other |
| PDM | Provider Data Management | PDM-Provider Network |
| PEC | Provider Economics | PEC-Provider Reimbursement |
| PENDING | Pending | PENDING-Awaiting Benefits |
| PMT | Payment | PMT-Duplicate - Approved in Error |
| PRC | Pricing | PRC-DRG |
| SYS | System | SYS-System |
| VND | Vendor | VND-Out of Scope |
| WRK | Workflow | WRK-Documentation/Workflow |

## 🚫 WRK- Category Handling

### How It Works

**Primary Assignment:**
- WRK- categories are **deprioritized**
- System prefers more specific categories
- Only assigns WRK- when truly appropriate

**Alternative Suggestions:**
- WRK- categories **can appear** in alternatives
- Helpful for workflow-related errors
- Available when relevant

### Example

```
Error: "Claim adjustment was incorrect"

Primary: PMT-Line Charge (70%)
Reasoning: "...WRK- categories were considered but 
deprioritized in favor of more specific categories."

Alternatives:
  • WRK-Adjustment Incorrect/Incomplete  ← Available here
  • PMT-Payee Incorrect
```

## 📱 Keyboard Shortcuts

- **Enter**: Submit analysis (when in text area)
- **Shift+Enter**: New line in text area
- **Esc**: Close settings panel

## 🔄 Workflow Examples

### Example 1: Eligibility Error
```
Input: "Member was termed but system showed active"
Result: ELG-Member Eligibility (90%)
Action: High confidence - use this category
```

### Example 2: Payment Error
```
Input: "Claim paid twice for same service"
Result: PMT-Duplicate - Approved in Error (95%)
Action: High confidence - clear match
```

### Example 3: Ambiguous Error
```
Input: "Error in processing"
Result: SYS-System (45%)
Alternatives: WRK-Documentation/Workflow, OTH-Other
Action: Low confidence - review alternatives or add detail
```

## 📊 Batch Processing

For multiple errors:
1. Analyze first error
2. Note category in your spreadsheet
3. Enter next error
4. Repeat

History panel helps track recent analyses.

## 🔒 Privacy & Data

- **No server storage**: Error comments not saved
- **Browser only**: History stored locally
- **No tracking**: No analytics or data collection
- **Network only**: All processing on your network

## 🐛 Troubleshooting Usage Issues

### "Low confidence scores"
- Add more detail to error comments
- Use domain-specific terminology
- Check if category exists in system

### "Wrong category assigned"
- Review alternative suggestions
- Check confidence score
- Consider if error description is clear

### "No alternatives shown"
- Normal if primary match is very strong
- Or if no other categories score well
- Not an error

### "WRK- category as primary"
- Happens when no better match exists
- Review if error is truly workflow-related
- Consider adding more detail

## 📈 Best Practices

1. **Consistent Descriptions**: Use similar wording for similar errors
2. **Review Patterns**: Notice which descriptions work best
3. **Team Standards**: Agree on error description format
4. **Validate Results**: Spot-check high-confidence results
5. **Feedback Loop**: Note mismatches to improve descriptions

## 🎓 Training Your Team

When introducing to your team:

1. **Demo Session**: Show live examples
2. **Practice Errors**: Let them try sample errors
3. **Review Results**: Discuss confidence scores
4. **Share Tips**: Emphasize detailed descriptions
5. **Support**: Be available for questions

---

**Happy Categorizing!** 🎉
