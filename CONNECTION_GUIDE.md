# 🔗 System Connection Guide - Paaksathi AI

## ✅ All Components Connected!

This document explains how all parts of the system are connected and working together.

---

## 📋 1. HTML ↔ CSS ↔ JavaScript Linking

### ✅ Status: CONNECTED

**All HTML files correctly link:**
- CSS: `{{ url_for('static', filename='css/style.css') }}`
- JavaScript: `{{ url_for('static', filename='js/FILE.js') }}`
- Font Awesome: CDN link included

**Navigation Links:**
- All pages use Flask routing: `/login`, `/signup`, `/upload`, etc.
- Logo links to home: `/`
- Active page highlighting works

---

## 🔌 2. Flask Routing (app.py)

### ✅ Status: ALL ROUTES CONNECTED

**Page Routes:**
- `/` → Home page
- `/login` → Login page
- `/signup` → Signup page
- `/upload` → Upload page
- `/result` → Result page
- `/dashboard` → Dashboard (protected)
- `/admin` → Admin panel
- `/weather` → Weather page
- `/crops` → Crops info
- `/disease-library` → Disease library
- `/government-schemes` → Govt schemes
- `/faq` → FAQ page
- `/contact` → Contact page

**API Routes:**
- `POST /api/user/signup` → User registration
- `POST /api/user/login` → User login
- `POST /api/user/logout` → User logout
- `GET /api/user/profile` → Get user profile
- `POST /api/scan/upload` → Upload crop image
- `GET /api/stats` → Get website statistics
- `POST /api/track-visit` → Track visit
- `GET /api/weather` → Get weather data
- `POST /api/admin/login` → Admin login
- `POST /api/admin/logout` → Admin logout
- `GET /api/admin/stats` → Admin dashboard data

---

## 🔐 3. User Authentication Flow

### ✅ Status: FULLY CONNECTED

**Signup Flow:**
1. User fills form in `signup.html`
2. `auth.js` → `POST /api/user/signup`
3. `app.py` validates and saves to database
4. Session created
5. Redirect to `/dashboard`

**Login Flow:**
1. User fills form in `login.html`
2. `auth.js` → `POST /api/user/login`
3. `app.py` validates credentials
4. Session created
5. Redirect to `/dashboard`

**Session Management:**
- Sessions stored in Flask session
- Protected routes check `session['user_id']`
- Logout clears session

---

## 📊 4. Visit Counter & Scan Counter

### ✅ Status: WORKING

**Visit Tracking:**
- Every page route calls `track_visit(request.remote_addr)`
- Visits saved to `visits` table
- Counter displayed on:
  - Home page (hero section)
  - Dashboard
  - Admin panel

**Scan Tracking:**
- When image uploaded via `/api/scan/upload`
- Scan saved to `scans` table
- Counter displayed on:
  - Home page (hero section)
  - Dashboard
  - Admin panel

**API Endpoints:**
- `GET /api/stats` → Returns total visits, scans, users
- JavaScript calls this on page load

---

## 📤 5. Image Upload → Model → Result

### ✅ Status: CONNECTED (Mock Data Ready for ML Model)

**Upload Flow:**
1. User selects image in `upload.html`
2. `upload.js` validates file
3. Form submitted to `POST /api/scan/upload`
4. `app.py`:
   - Saves file to `static/uploads/`
   - Calls `detect_disease(image_path, crop_type)`
   - Currently uses mock data
   - Ready for ML model integration
5. Result saved to database
6. Result stored in `sessionStorage`
7. Redirect to `/result`
8. `result.js` displays result

**ML Model Integration:**
- Structure ready in `app.py`
- Function: `detect_disease(image_path, crop_type)`
- Currently calls `detect_disease_mock()`
- To integrate: Replace with actual model inference
- Model directory: `model/`
- See `model/README.md` for integration guide

---

## 🌤️ 6. Weather Page Connection

### ✅ Status: CONNECTED (Mock Data Ready for API)

**Weather Flow:**
1. User visits `/weather`
2. `weather.js` calls `GET /api/weather`
3. `app.py` returns weather data
4. Currently returns mock data
5. Ready for OpenWeatherMap API integration
6. Data displayed on page

**To Integrate Real API:**
- Get API key from OpenWeatherMap
- Update `get_weather()` in `app.py`
- Add `requests` library to requirements.txt

---

## 👨‍💼 7. Admin Panel Connection

### ✅ Status: FULLY CONNECTED

**Admin Login:**
1. User visits `/admin`
2. Enters credentials
3. `admin.js` → `POST /api/admin/login`
4. Session created
5. Dashboard displayed

**Admin Dashboard:**
- `admin.js` calls `GET /api/admin/stats`
- Displays:
  - Total visits
  - Total users
  - Total scans
  - Recent visits table
  - Users table

**Admin Logout:**
- `admin.js` → `POST /api/admin/logout`
- Session cleared
- Login form shown

---

## 💾 8. Database Connection

### ✅ Status: CONNECTED & AUTO-INITIALIZED

**Database:**
- SQLite database: `paaksathi.db`
- Auto-created on first run
- Tables auto-created:
  - `users` - User accounts
  - `visits` - Website visits
  - `scans` - Crop scans
  - `admin` - Admin accounts

**Database Functions:**
- `init_db()` - Creates tables
- `get_db_connection()` - Gets connection
- `track_visit()` - Saves visit

**Default Admin:**
- Username: `admin`
- Password: `admin123`
- Auto-created on first run

---

## ⚠️ 9. Error Handling

### ✅ Status: IMPLEMENTED

**Error Handling Added:**
- Try-catch blocks in all API routes
- User-friendly error messages in Gujarati
- Validation for:
  - Empty fields
  - Invalid file types
  - Invalid mobile numbers
  - Password length
  - Duplicate mobile numbers
- Error notifications displayed to users

**Error Messages:**
- Login errors
- Signup errors
- Upload errors
- API errors
- All in Gujarati language

---

## 🧪 Testing Checklist

### ✅ Test These Flows:

1. **Home Page**
   - [x] Visit counter increments
   - [x] Stats load correctly
   - [x] Navigation works

2. **User Signup**
   - [x] Form validation
   - [x] Database save
   - [x] Session creation
   - [x] Redirect to dashboard

3. **User Login**
   - [x] Credential validation
   - [x] Session creation
   - [x] Redirect to dashboard

4. **Image Upload**
   - [x] File validation
   - [x] File save
   - [x] Disease detection (mock)
   - [x] Database save
   - [x] Redirect to result

5. **Result Page**
   - [x] Result display
   - [x] Image display
   - [x] Disease information

6. **Dashboard**
   - [x] User profile display
   - [x] Stats display
   - [x] Logout works

7. **Admin Panel**
   - [x] Admin login
   - [x] Stats display
   - [x] Tables populate
   - [x] Logout works

8. **Weather Page**
   - [x] Weather data loads
   - [x] Display works

---

## 🚀 Quick Start

1. **Run the application:**
   ```bash
   python app.py
   ```

2. **Open browser:**
   ```
   http://localhost:5000
   ```

3. **Test flows:**
   - Sign up a new user
   - Login
   - Upload a crop image
   - View result
   - Check dashboard
   - Login as admin (admin/admin123)
   - View admin panel

---

## 📝 Notes

- **ML Model**: Currently using mock data. Ready for integration.
- **Weather API**: Currently using mock data. Ready for integration.
- **Error Handling**: All errors handled with user-friendly messages.
- **Database**: Auto-initialized on first run.
- **Sessions**: Properly managed for users and admin.

---

## ✅ System Status: FULLY CONNECTED & WORKING!

All components are connected and working together as one integrated system.

