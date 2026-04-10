# Error Categorization Portal

AI-powered error categorization system with 126 error categories. Works entirely in your browser - no backend required!

## 🚀 [Try it Live!](https://yourusername.github.io/error-categorization-portal/)

## ✨ Features

- **126 Error Categories** - Comprehensive coverage
- **Smart AI Matching** - Rule-based categorization
- **WRK- Deprioritization** - Prioritizes specific categories
- **No Backend Needed** - Runs entirely in browser
- **Instant Results** - Real-time analysis
- **Confidence Scoring** - Know how accurate each match is
- **Alternative Suggestions** - See other possible categories
- **History Tracking** - Review recent analyses
- **Mobile Friendly** - Works on all devices

## 🎯 How to Use

1. **Visit the Portal** - Open the website
2. **Enter Error Comment** - Paste or type your error description
3. **Click Analyze** - Get instant categorization
4. **Review Results** - See category, confidence, and alternatives

### Example

**Input:**
```
Member eligibility was not verified correctly before processing the claim
```

**Output:**
- **Category:** ELG-Member Eligibility
- **Confidence:** 85%
- **Alternatives:** COB-Member update incomplete, WRK-Documentation/Workflow

## 📊 Category Breakdown

**Total:** 126 categories

**By Prefix:**
- ACU (4) - Actuarial
- BEN (3) - Benefits
- COB (19) - Coordination of Benefits
- COD (6) - Coding
- ELG (2) - Eligibility
- MDOC (2) - Missing Documents
- OPL (2) - Other Party Liability
- OTH (3) - Other
- PDM (6) - Provider Data Management
- PEC (2) - Provider Economics
- PENDING (2) - Pending
- PMT (23) - Payment
- PRC (28) - Pricing
- SYS (1) - System
- VND (1) - Vendor
- WRK (21) - Workflow *(deprioritized for primary)*

## 🎨 How It Works

### Smart Categorization
1. **Keyword Extraction** - Identifies key terms
2. **Pattern Matching** - Compares with category descriptions
3. **Similarity Scoring** - Calculates best matches
4. **WRK- Handling** - Deprioritizes workflow categories
5. **Confidence Calculation** - Provides accuracy score

### WRK- Category Logic
- **Primary Assignment:** WRK- categories are deprioritized
- **Alternatives:** WRK- can appear in suggestions
- **Smart Selection:** Only assigns WRK- when truly appropriate

## 💡 Tips for Best Results

1. **Be Descriptive** - More detail = better accuracy
2. **Use Domain Terms** - "eligibility", "provider", "payment", etc.
3. **Check Confidence** - Higher = more reliable
4. **Review Alternatives** - Especially for edge cases
5. **Include Context** - What went wrong and where

## 🛠️ Technology

- **HTML5** - Structure
- **JavaScript** - AI logic (no dependencies!)
- **Tailwind CSS** - Styling
- **100% Client-Side** - No server needed

## 📱 Deployment

### GitHub Pages (Recommended)

1. Fork this repository
2. Go to Settings → Pages
3. Source: Deploy from branch `main`
4. Your portal will be live at:
   ```
   https://yourusername.github.io/error-categorization-portal/
   ```

### Local Usage

1. Download the repository
2. Open `index.html` in your browser
3. Start analyzing!

## 🔒 Privacy

- ✅ **No data sent to servers** - Everything runs in your browser
- ✅ **No tracking** - No analytics or cookies
- ✅ **No storage** - History only in browser session
- ✅ **100% Private** - Your data never leaves your device

## 📄 License

MIT License - Free to use and modify

## 🤝 Contributing

Contributions welcome! Feel free to:
- Add more categories
- Improve matching algorithms
- Enhance UI/UX
- Fix bugs

## 📞 Support

- **Issues:** Use GitHub Issues
- **Questions:** Check existing issues first
- **Improvements:** Submit a pull request

## 🎉 Credits

Built for Claims Quality teams to streamline error categorization.

---

**Made with ❤️ for efficient error management**
