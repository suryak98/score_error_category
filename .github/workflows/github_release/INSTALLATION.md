# Installation Guide

Complete step-by-step installation instructions for the Error Categorization Portal.

## 📋 Prerequisites

Before you begin, ensure you have:
- **Python 3.8 or higher** installed
- **pip** (Python package manager)
- **Modern web browser** (Chrome, Firefox, Edge, Safari)
- **Terminal/Command Prompt** access

## 🚀 Installation Steps

### Step 1: Download the Project

Download or clone this repository to your local machine.

```bash
# If using git
git clone <repository-url>
cd error-categorization-portal

# Or download and extract the ZIP file
```

### Step 2: Set Up Python Virtual Environment

**Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- Flask (web framework)
- Flask-CORS (cross-origin support)

### Step 4: Verify Category File

Ensure the category file exists:
```bash
# From project root
ls data/ERR_CTGRY_TXT.csv
```

Should show: `ERR_CTGRY_TXT.csv` with 126 categories.

### Step 5: Start the Backend Server

```bash
# Make sure you're in the backend directory with venv activated
python app.py
```

You should see:
```
* Serving Flask app 'app'
* Debug mode: on
* Running on http://0.0.0.0:5000
* Running on http://127.0.0.1:5000
* Running on http://[YOUR_IP]:5000
```

**Keep this terminal window open!** The backend must stay running.

### Step 6: Open the Frontend

1. Navigate to the `frontend` folder
2. Open `index.html` in your web browser
   - **Windows**: Double-click `index.html`
   - **Mac**: Right-click → Open With → Browser
   - **Linux**: `xdg-open index.html`

### Step 7: Configure Backend Server

1. In the web interface, click **Settings (⚙️)** in the top right
2. Enter your server address:
   - **Same computer**: `localhost`
   - **Different computer**: Your IP address (shown in backend terminal)
3. Click **Save & Connect**
4. You should see "Connected" status in green

### Step 8: Test the Portal

Try analyzing an error:
1. Enter: `Member eligibility was not verified correctly`
2. Click **Analyze Error**
3. You should see:
   - Primary category: `ELG-Member Eligibility`
   - Confidence score: ~85%
   - Alternative categories

## ✅ Verification Checklist

- [ ] Python 3.8+ installed (`python --version`)
- [ ] Virtual environment created and activated
- [ ] Dependencies installed (`pip list` shows flask, flask-cors)
- [ ] Category file exists (126 categories)
- [ ] Backend server running (port 5000)
- [ ] Frontend opens in browser
- [ ] Server configured in Settings
- [ ] "Connected" status shows green
- [ ] Test analysis works

## 🌐 Network Setup (Optional)

### For Team Access

If you want others to access the portal:

**1. Find Your IP Address:**

Windows:
```bash
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

Linux/Mac:
```bash
ifconfig
# or
ip addr show
```

**2. Configure Firewall:**

Windows:
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Error Portal" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

Linux:
```bash
sudo ufw allow 5000/tcp
```

**3. Share with Team:**
- Give them your IP address (e.g., `192.168.1.100`)
- They open `frontend/index.html` in their browser
- They configure Settings with your IP
- They can now use the portal!

## 🐛 Common Issues

### Issue: "Python not found"
**Solution**: Install Python from [python.org](https://python.org)

### Issue: "pip not found"
**Solution**: 
```bash
python -m ensurepip --upgrade
```

### Issue: "Cannot connect to backend"
**Solution**:
1. Verify backend is running
2. Check server address in Settings
3. Try `localhost` instead of IP
4. Check firewall settings

### Issue: "Port 5000 already in use"
**Solution**: 
1. Stop other applications using port 5000
2. Or edit `app.py` to use different port:
   ```python
   app.run(host='0.0.0.0', port=5001, debug=True)
   ```

### Issue: "Categories not loading"
**Solution**:
1. Check `data/ERR_CTGRY_TXT.csv` exists
2. Verify file has 127 lines (header + 126 categories)
3. Restart backend server

### Issue: "CORS errors in browser"
**Solution**: Backend already has CORS enabled. If issues persist:
1. Clear browser cache
2. Try different browser
3. Check browser console for specific errors

## 📱 Mobile Access

To access from mobile devices:

1. Ensure mobile is on same WiFi network
2. Use your computer's IP address in Settings
3. Mobile browsers work the same as desktop

## 🔄 Updating

To update the portal:

1. Stop the backend server (Ctrl+C)
2. Pull latest changes or download new files
3. Update dependencies:
   ```bash
   pip install -r requirements.txt --upgrade
   ```
4. Restart backend server

## 🎯 Next Steps

After installation:
1. Read the main [README.md](README.md) for features
2. Review [USAGE.md](USAGE.md) for detailed usage
3. Customize categories in `data/ERR_CTGRY_TXT.csv`
4. Share with your team!

## 📞 Need Help?

If you encounter issues:
1. Check this troubleshooting section
2. Verify all prerequisites are met
3. Review error messages in terminal
4. Check browser console (F12) for frontend errors

---

**Installation complete!** 🎉 You're ready to categorize errors!
