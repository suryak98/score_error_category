# QA Intelligence - AI Quality Review System

An intelligent, AI-powered quality assurance review system that automatically suggests error categories based on auditor comments.

## 🎯 Features

- **AI-Powered Predictions**: Automatically suggests the most relevant error categories based on auditor comments
- **Smart Categorization** (v1.3.0): 
  - Categories ranked by **confidence score**, not type
  - Primary = Highest confidence (can be any category type)
  - Secondary = Second highest confidence
  - Alternative category suggestions (up to 5)
- **🔒 Automatic PHI Masking** (v1.3.0 NEW!):
  - Detects and masks 15+ types of Protected Health Information
  - DCN, UM numbers, INQ IDs, Member IDs, SSN, Phone, DOB, etc.
  - Visual notification when PHI is masked
  - HIPAA compliance built-in
- **AI Caution Message**: Clear warning displayed at the end of results that recommendations are AI-generated and should be reviewed
- **Confidence Scoring**: Each suggestion includes a confidence percentage (45%-95%)
- **User-Friendly Interface**: Clean, modern UI with responsive design
- **Clear Functionality**: Quick reset button to clear all inputs and results
- **Cross-Browser Compatible**: Works on all major browsers and devices

## 📋 Error Categories

The system includes 124 predefined error categories across multiple domains:

- **ACU** - Accumulator
- **BEN** - Benefits
- **COB** - Coordination of Benefits
- **COD** - Coding
- **ELG** - Eligibility
- **MDOC** - Missing Documentation
- **OPL** - Other Party Liability
- **PDM** - Provider Data Management
- **PEC** - Provider Contract
- **PMT** - Payment
- **PRC** - Pricing
- **SYS** - System
- **WRK** - Workflow/Work Process
- And more...

## 🚀 Getting Started

### Local Development

1. Clone or download this repository
2. Open `index.html` in a web browser
3. No build process or dependencies required!

### GitHub Pages Deployment

1. Create a new GitHub repository
2. Upload all files to the repository:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `aiModel.js`
   - `errorCategories.js`
   - `README.md`

3. Go to repository Settings → Pages
4. Under "Source", select the branch (usually `main` or `master`)
5. Click Save
6. Your site will be published at: `https://[username].github.io/[repository-name]/`

## 💻 Usage

1. **Enter Auditor Comments**: Type or paste the error description in the text area

2. **Analyze**: Click the "Analyze & Suggest Categories" button

3. **Review AI Suggestions**: The AI will display:
   - **Primary Error Category**: The most likely error category (non-WRK)
   - **Secondary Error Category**: A complementary category (WRK preferred)
   - **Alternative Categories**: Up to 5 other possible matches

4. **Review AI Caution**: Read the warning message at the end about AI-generated recommendations

5. **Clear**: Use the Clear button to reset and start a new analysis

## 🧠 How It Works

The AI model uses:

1. **Keyword Matching**: Identifies relevant keywords in auditor comments
2. **Semantic Analysis**: Analyzes word patterns and context
3. **Confidence Scoring**: Calculates match confidence based on multiple factors
4. **Smart Filtering**: Ensures WRK categories are only suggested as secondary options
5. **Category Ranking**: Sorts and prioritizes the most relevant error categories

## 📁 Project Structure

```
qa-intelligence/
├── index.html           # Main HTML structure
├── styles.css           # Styling and responsive design
├── app.js              # Main application logic
├── aiModel.js          # AI prediction engine
├── errorCategories.js  # Error category data
└── README.md           # Documentation
```

## 🎨 Customization

### Adding New Error Categories

Edit `errorCategories.js` and add new categories to the `ERROR_CATEGORIES` array:

```javascript
const ERROR_CATEGORIES = [
    // ... existing categories
    "NEW-Category Name",
];
```

### Updating Keywords

Modify the `initializeKeywords()` method in `aiModel.js`:

```javascript
'Category-Name': ['keyword1', 'keyword2', 'phrase example'],
```

### Changing Scenarios

Update scenario buttons in `index.html` and scenario weights in `aiModel.js`.

## 🔧 Technical Details

- **Pure JavaScript**: No frameworks or libraries required
- **Client-Side Processing**: All AI processing happens in the browser
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern CSS**: Uses CSS Grid, Flexbox, and CSS Variables
- **Accessibility**: Keyboard navigation and focus states included

## 📊 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## 🤝 Contributing

Suggestions and improvements are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is open source and available for use in quality assurance workflows.

## 🆘 Support

For issues or questions:
- Review the documentation above
- Check the browser console for errors
- Ensure all files are properly uploaded to GitHub Pages

## 🔮 Future Enhancements

Potential improvements:
- Machine learning model integration
- Historical data analysis
- Export functionality for suggestions
- Multi-language support
- Advanced filtering options
- Integration with audit management systems

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Developed for**: Quality Assurance Teams
