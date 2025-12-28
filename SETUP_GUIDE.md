# 🚀 Quick Setup Guide - Paaksathi AI

## Step 1: Install Python
- Download Python 3.8+ from [python.org](https://www.python.org/downloads/)
- During installation, check "Add Python to PATH"

## Step 2: Open Terminal/Command Prompt
- Windows: Press `Win + R`, type `cmd`, press Enter
- Or open PowerShell

## Step 3: Navigate to Project Folder
```bash
cd "C:\Users\Welcome\Desktop\Project\DIFFERENT PROJECT\crop disease detection\usingcursor"
```

## Step 4: Install Dependencies
```bash
pip install -r requirements.txt
```

If you get permission error, use:
```bash
pip install --user -r requirements.txt
```

## Step 5: Run the Application
```bash
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

## Step 6: Open in Browser
Open your browser and go to:
```
http://localhost:5000
```

## ✅ That's it! Your application is running!

---

## 🔑 Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change these in production!

---

## 🐛 Common Issues

### Issue: "python is not recognized"
**Solution**: 
- Reinstall Python and check "Add Python to PATH"
- Or use `py` instead of `python`:
```bash
py app.py
```

### Issue: "Module not found"
**Solution**: 
```bash
pip install Flask flask-cors Werkzeug
```

### Issue: Port 5000 already in use
**Solution**: 
- Close other applications using port 5000
- Or change port in `app.py` (last line):
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Issue: Database error
**Solution**: 
- Delete `paaksathi.db` file if it exists
- Run `app.py` again - it will create a new database

---

## 📱 Testing the Application

1. **Home Page**: Visit `http://localhost:5000`
2. **Sign Up**: Click "સાઇન અપ" and create an account
3. **Upload Image**: Go to "પાક સ્કેન કરો" and upload a crop image
4. **View Result**: See disease detection result
5. **Dashboard**: Check your profile and stats
6. **Admin Panel**: Visit `/admin` and login with default credentials

---

## 🎯 Next Steps

1. **Integrate AI Model**: Replace mock detection with actual model
2. **Add Weather API**: Integrate real weather API (OpenWeatherMap)
3. **Enhance Security**: Add password hashing, HTTPS
4. **Deploy**: Deploy to Heroku, AWS, or similar platform

---

## 📞 Need Help?

Check the main `README.md` file for detailed documentation.

