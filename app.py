"""
Paaksathi AI - Crop Disease Detection Application
Flask Backend Server
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file
from flask_cors import CORS
from datetime import datetime
import os
import json
from werkzeug.utils import secure_filename
import sqlite3
from functools import wraps
import pandas as pd
from io import BytesIO
import pytz

import os
import google.generativeai as genai
from PIL import Image

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def detect_crop_disease(image_path):
    model = genai.GenerativeModel("gemini-1.5-flash")

    image = Image.open(image_path)

    
    prompt = """
તમે કૃષિ વિષયના નિષ્ણાત છો.

આ પાનના ફોટા પરથી પાકનો રોગ ઓળખો.
જવાબ સંપૂર્ણપણે ગુજરાતી માં આપો.
English શબ્દો બિલકુલ ઉપયોગ ન કરો.

જવાબ નીચેના FORMAT માં જ આપવો:

રોગનું નામ:
(ફક્ત ગુજરાતી નામ)

લક્ષણો:
- લક્ષણ 1
- લક્ષણ 2
- લક્ષણ 3

ઉપચાર:
- ઉપચાર 1
- ઉપચાર 2

ખાતર / દવા:
- દવાનું નામ
- માત્રા (એકર અથવા લિટર મુજબ)

રોકથામ:
- રોકથામ 1
- રોકથામ 2
"""

    response = model.generate_content([prompt, image])
    return response.text

app = Flask(__name__)
app.secret_key = 'paaksathi_ai_secret_key_2024'  # Change this in production
CORS(app)

# Configuration
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Create model directory if it doesn't exist
os.makedirs('model', exist_ok=True)

# Database initialization
def init_db():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect('paaksathi.db')
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  mobile TEXT UNIQUE NOT NULL,
                  email TEXT,
                  password TEXT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Visits table
    c.execute('''CREATE TABLE IF NOT EXISTS visits
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  ip_address TEXT,
                  visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  date DATE DEFAULT (date('now')))''')
    
    # Scans table
    c.execute('''CREATE TABLE IF NOT EXISTS scans
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER,
                  crop_type TEXT,
                  disease_name TEXT,
                  image_path TEXT,
                  scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (user_id) REFERENCES users(id))''')
    
    # Crops, Diseases, Schemes tables for admin-managed content
    c.execute('''CREATE TABLE IF NOT EXISTS crops
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name_gu TEXT NOT NULL,
                  name_en TEXT)''')

    c.execute('''CREATE TABLE IF NOT EXISTS diseases
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name_gu TEXT NOT NULL,
                  name_en TEXT,
                  crop TEXT,
                  symptoms TEXT,
                  treatment TEXT,
                  prevention TEXT)''')

    c.execute('''CREATE TABLE IF NOT EXISTS schemes
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title TEXT NOT NULL,
                  description TEXT)''')

    # Admin table
    c.execute('''CREATE TABLE IF NOT EXISTS admin
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT UNIQUE NOT NULL,
                  password TEXT NOT NULL)''')
    
    # Create default admin if not exists
    c.execute('''INSERT OR IGNORE INTO admin (username, password) 
                 VALUES (?, ?)''', ('admin', 'admin123'))

    # Seed default crops if empty
    c.execute('SELECT COUNT(*) as count FROM crops')
    result = c.fetchone()
    if result and result[0] == 0:
        default_crops = [
            ('કપાસ','Cotton'),
            ('ઘઉં','Wheat'),
            ('ચોખા','Rice'),
            ('ટમેટા','Tomato'),
            ('બટાટા','Potato'),
            ('મગફળી','Groundnut'),
            ('ડુંગળી','Onion'),
            ('મરચું','Chilli'),
            ('રીંગણ','Brinjal'),
            ('મકાઈ','Maize')
        ]
        c.executemany('INSERT INTO crops (name_gu, name_en) VALUES (?, ?)', default_crops)

    # Seed default diseases if empty
    c.execute('SELECT COUNT(*) as count FROM diseases')
    result = c.fetchone()
    if result and result[0] == 0:
        # Basic disease entries (details can be edited via admin panel later)
        diseases = [
            ('કપાસમાં પાંદડાનો કર્લ રોગ','Cotton Leaf Curl Disease','કપાસ','["પાંદડા વળી જાય છે", "નસો જાડી થાય છે"]','["ઇમિડાક્લોપ્રિડ 17.8% SL"]','["પ્રતિકારક જાતો વાવો"]'),
            ('મગફળીમાં ટિક્કા રોગ','Groundnut Tikka Disease','મગફળી','["પાંદડાઓ પર નાનાં બિંદુઓ"]','["ફફૂંદનાશક દવા"]','["સરસ વાવણી અંતર"]'),
            ('ઘઉંમાં કાટરોગ','Wheat Rust','ઘઉં','["પાંદડાઓ પર ગાંઠસરસ લક્ષણો"]','["ફફૂંદનાશક દવા"]','["પ્રતિકારક જાતો વાવો"]')
        ]
        c.executemany('''INSERT INTO diseases (name_gu, name_en, crop, symptoms, treatment, prevention)
                         VALUES (?, ?, ?, ?, ?, ?)''', diseases)

    # Seed default schemes if empty
    c.execute('SELECT COUNT(*) as count FROM schemes')
    result = c.fetchone()
    if result and result[0] == 0:
        schemes = [
            ('પીએમ કિસાન સન્માન નિધિ (PM-KISAN)','ભારત સરકારની યોજના જેમાં ખેડૂતોને વર્ષમાં ₹6000 આર્થિક સહાય મળે છે'),
            ('પ્રધાનમંત્રી ફસલ વીમા યોજના (PM Fasal Bima Yojana)','કુદરતી આફતથી ફસલને થતા નુકસાન માટે વીમા યોજના'),
            ('માટી આરોગ્ય કાર્ડ યોજના (Soil Health Card Scheme)','ખેડૂતોને તેમની જમીનની માટી ચકાસણી માટે મફત કાર્ડ')
        ]
        c.executemany('INSERT INTO schemes (title, description) VALUES (?, ?)', schemes)

    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect('paaksathi.db')
    conn.row_factory = sqlite3.Row
    return conn

# ==================== ROUTES ====================

@app.route('/')
def index():
    """Home page"""
    # Track visit
    track_visit(request.remote_addr)
    return render_template('pages/index.html')

@app.route('/login')
def login_page():
    """Login page"""
    # Track visit
    track_visit(request.remote_addr)
    return render_template('pages/login.html')

@app.route('/signup')
def signup_page():
    """Signup page"""
    # Track visit
    track_visit(request.remote_addr)
    return render_template('pages/signup.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload_page():
    """Crop image upload + Gemini detection"""
    track_visit(request.remote_addr)

    if request.method == 'POST':
        file = request.files.get('image')

        if file and file.filename != "":
            upload_dir = "uploads"
            os.makedirs(upload_dir, exist_ok=True)

            filename = secure_filename(file.filename)
            image_path = os.path.join(upload_dir, filename)
            file.save(image_path)

            ai_result = detect_crop_disease(image_path)

            return render_template(
                'pages/result.html',
                ai_result=ai_result
            )

    return render_template('pages/upload.html')


@app.route('/result')
def result_page():
    """Disease result page"""
    # Track visit
    track_visit(request.remote_addr)
    return render_template('pages/result.html')

@app.route('/crops')
def crops_page():
    """Crops information page"""
    # Track visit
    track_visit(request.remote_addr)
    return render_template('pages/crops.html')

@app.route('/supported-crops')
def supported_crops_page():
    """Supported crops page"""
    track_visit(request.remote_addr)
    return render_template('pages/supported-crops.html')

@app.route('/disease-library')
def disease_library_page():
    """Disease library page"""
    # Track visit
    track_visit(request.remote_addr)
    return render_template('pages/disease-library.html')

@app.route('/weather')
def weather_page():
    """Weather page"""
    # Track visit
    track_visit(request.remote_addr)
    return render_template('pages/weather.html')

@app.route('/government-schemes')
def government_schemes_page():
    """Government schemes page"""
    # Track visit
    track_visit(request.remote_addr)
    return render_template('pages/government-schemes.html')

@app.route('/faq')
def faq_page():
    """FAQ page"""
    # Track visit
    track_visit(request.remote_addr)
    return render_template('pages/faq.html')

@app.route('/contact')
def contact_page():
    """Contact page"""
    # Track visit
    track_visit(request.remote_addr)
    return render_template('pages/contact.html')

@app.route('/dashboard')
def dashboard_page():
    """User dashboard page"""
    # Track visit
    track_visit(request.remote_addr)
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('pages/dashboard.html')

@app.route('/profile')
def profile_page():
    """User profile page"""
    # Track visit
    track_visit(request.remote_addr)
    if 'user' not in session:
        return redirect(url_for('login_page'))

    user_id = session.get('user_id')
    conn = get_db_connection()
    c = conn.cursor()

    # Total visits (site-wide)
    c.execute('SELECT COUNT(*) as count FROM visits')
    total_visits = c.fetchone()['count']

    # Total scans by user
    c.execute('SELECT COUNT(*) as count FROM scans WHERE user_id = ?', (user_id,))
    total_scans = c.fetchone()['count']

    conn.close()

    return render_template('pages/profile.html',
                           total_visits=total_visits,
                           total_scans=total_scans)


@app.route('/admin')
def admin_page():
    """Admin panel page"""
    # Track visit
    track_visit(request.remote_addr)
    return render_template('pages/admin.html')

# ==================== API ROUTES ====================

@app.route('/api/track-visit', methods=['POST'])
def track_visit_api():
    """API to track website visit"""
    track_visit(request.remote_addr)
    return jsonify({'success': True})

def track_visit(ip_address):
    """Track website visit"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO visits (ip_address) VALUES (?)', (ip_address,))
    conn.commit()
    conn.close()

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get website statistics"""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Total visits
    c.execute('SELECT COUNT(*) as count FROM visits')
    total_visits = c.fetchone()['count']
    
    # Total scans
    c.execute('SELECT COUNT(*) as count FROM scans')
    total_scans = c.fetchone()['count']
    
    # Total users
    c.execute('SELECT COUNT(*) as count FROM users')
    total_users = c.fetchone()['count']
    
    conn.close()
    
    return jsonify({
        'total_visits': total_visits,
        'total_scans': total_scans,
        'total_users': total_users
    })

@app.route('/api/user/signup', methods=['POST'])
def user_signup():
    """User registration API"""
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'message': 'અમાન્ય વિનંતી'}), 400
            
        name = data.get('name')
        mobile = data.get('mobile')
        email = data.get('email', '')
        password = data.get('password')
        
        if not name or not mobile or not password:
            return jsonify({'success': False, 'message': 'નામ, મોબાઇલ અને પાસવર્ડ જરૂરી છે'}), 400
        
        # Validate mobile number (should be 10 digits)
        if not mobile.isdigit() or len(mobile) != 10:
            return jsonify({'success': False, 'message': 'માન્ય 10 અંકનો મોબાઇલ નંબર દાખલ કરો'}), 400
        
        # Validate password length
        if len(password) < 6:
            return jsonify({'success': False, 'message': 'પાસવર્ડ ઓછામાં ઓછા 6 અક્ષરોનો હોવો જોઈએ'}), 400
        
        conn = get_db_connection()
        c = conn.cursor()
        
        try:
            c.execute('''INSERT INTO users (name, mobile, email, password) 
                         VALUES (?, ?, ?, ?)''', 
                      (name, mobile, email, password))
            conn.commit()
            user_id = c.lastrowid
            conn.close()
            
            session['user_id'] = user_id
            session['user_name'] = name
            session['email'] = email
            session['mobile'] = mobile
            session['user'] = True
            session['login_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            return jsonify({'success': True, 'message': 'રજિસ્ટ્રેશન સફળ!'})
        except sqlite3.IntegrityError:
            conn.close()
            return jsonify({'success': False, 'message': 'આ મોબાઇલ નંબર પહેલેથી જ અસ્તિત્વમાં છે'}), 400
    except Exception as e:
        print(f"Error in user_signup: {str(e)}")
        return jsonify({'success': False, 'message': 'રજિસ્ટ્રેશન દરમિયાન ભૂલ આવી'}), 500

@app.route('/api/user/login', methods=['POST'])
def user_login():
    """User login API"""
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'message': 'અમાન્ય વિનંતી'}), 400
            
        mobile = data.get('mobile')
        password = data.get('password')
        
        if not mobile or not password:
            return jsonify({'success': False, 'message': 'મોબાઇલ અને પાસવર્ડ જરૂરી છે'}), 400
        
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE mobile = ? AND password = ?', 
                  (mobile, password))
        user = c.fetchone()
        conn.close()
        
        if user:
            session['user_id'] = user['id']
            session['user_name'] = user['name']
            session['email'] = user['email']
            session['mobile'] = user['mobile']
            session['user'] = True
            session['login_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            return jsonify({'success': True, 'message': 'લોગિન સફળ!'})
        else:
            return jsonify({'success': False, 'message': 'અમાન્ય મોબાઇલ નંબર અથવા પાસવર્ડ'}), 401
    except Exception as e:
        print(f"Error in user_login: {str(e)}")
        return jsonify({'success': False, 'message': 'લોગિન દરમિયાન ભૂલ આવી'}), 500

@app.route('/api/user/logout', methods=['POST'])
def user_logout():
    """User logout API"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Get user profile"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    
    user_id = session['user_id']
    conn = get_db_connection()
    c = conn.cursor()
    
    # User info
    c.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = c.fetchone()
    
    # User's scan count
    c.execute('SELECT COUNT(*) as count FROM scans WHERE user_id = ?', (user_id,))
    user_scans = c.fetchone()['count']
    
    conn.close()
    
    return jsonify({
        'success': True,
        'user': {
            'id': user['id'],
            'name': user['name'],
            'mobile': user['mobile'],
            'email': user['email']
        },
        'user_scans': user_scans
    })

@app.route('/api/scan/upload', methods=['POST'])
def scan_upload():
    """Crop image upload and disease detection API"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'કોઈ ફાઇલ પ્રદાન કરવામાં આવી નથી'}), 400
        
        file = request.files['file']
        crop_type = request.form.get('crop_type', 'cotton')
        
        if file.filename == '':
            return jsonify({'success': False, 'message': 'કોઈ ફાઇલ પસંદ કરવામાં આવી નથી'}), 400
        
        if not file or not allowed_file(file.filename):
            return jsonify({'success': False, 'message': 'અમાન્ય ફાઇલ પ્રકાર. કૃપા કરીને PNG, JPG, JPEG અથવા GIF ફાઇલ અપલોડ કરો'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Detect disease using ML model or mock data
        disease_result = detect_disease(filepath, crop_type)
        
        # Save scan to database (increments scan count)
        user_id = session.get('user_id')
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''INSERT INTO scans (user_id, crop_type, disease_name, image_path) 
                     VALUES (?, ?, ?, ?)''',
                  (user_id, crop_type, disease_result['disease_name'], filepath))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'result': disease_result,
            'image_path': filepath
        })
    
    except Exception as e:
        print(f"Error in scan_upload: {str(e)}")
        return jsonify({'success': False, 'message': 'સ્કેન દરમિયાન ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.'}), 500

def detect_disease(image_path, crop_type):
    """
    Detect crop disease from image
    This function can use ML model or return mock data
    """
    # Check if ML model exists and use it
    model_path = 'model/crop_disease_model.h5'
    if os.path.exists(model_path):
        # TODO: Load and use actual ML model
        # Example:
        # from tensorflow import keras
        # model = keras.models.load_model(model_path)
        # prediction = model.predict(preprocessed_image)
        # return format_prediction(prediction, crop_type)
        pass
    
    # For now, return mock data based on crop type
    return detect_disease_mock(crop_type)

def detect_disease_mock(crop_type):
    """Mock disease detection (replace with actual AI model)"""
    # This is a placeholder - replace with actual model inference
    diseases = {
        'cotton': {
            'disease_name': 'Bacterial Blight',
            'disease_name_guj': 'બેક્ટેરિયલ બ્લાઇટ',
            'symptoms': 'Water-soaked lesions on leaves, angular spots',
            'symptoms_guj': 'પાન પર પાણી ભીના ઘા, કોણીય ડાઘ',
            'treatment': 'Use copper-based fungicides, remove infected plants',
            'treatment_guj': 'કોપર આધારિત ફૂગનાશકનો ઉપયોગ કરો, સંક્રમિત છોડ દૂર કરો',
            'fertilizer': 'NPK 19:19:19, apply at 2kg per acre'
        },
        'wheat': {
            'disease_name': 'Rust',
            'disease_name_guj': 'રસ્ટ',
            'symptoms': 'Orange-brown pustules on leaves and stems',
            'symptoms_guj': 'પાન અને દાંડી પર નારંગી-બદામી પસ્ટ્યુલ',
            'treatment': 'Apply fungicides like Propiconazole',
            'treatment_guj': 'Propiconazole જેવા ફૂગનાશક લગાવો',
            'fertilizer': 'Urea 46% at 50kg per acre'
        },
        'rice': {
            'disease_name': 'Blast',
            'disease_name_guj': 'બ્લાસ્ટ',
            'symptoms': 'Diamond-shaped lesions on leaves',
            'symptoms_guj': 'પાન પર હીરા આકારના ઘા',
            'treatment': 'Use Tricyclazole or Carbendazim',
            'treatment_guj': 'Tricyclazole અથવા Carbendazim નો ઉપયોગ કરો',
            'fertilizer': 'DAP 18:46:0 at 100kg per acre'
        },
        'tomato': {
            'disease_name': 'Early Blight',
            'disease_name_guj': 'અર્લી બ્લાઇટ',
            'symptoms': 'Brown spots with concentric rings on leaves',
            'symptoms_guj': 'પાન પર કેન્દ્રિત રિંગ સાથે બદામી ડાઘ',
            'treatment': 'Apply Mancozeb or Chlorothalonil',
            'treatment_guj': 'Mancozeb અથવા Chlorothalonil લગાવો',
            'fertilizer': 'NPK 20:20:20 foliar spray'
        },
        'potato': {
            'disease_name': 'Late Blight',
            'disease_name_guj': 'લેટ બ્લાઇટ',
            'symptoms': 'Dark lesions on leaves, white mold on underside',
            'symptoms_guj': 'પાન પર ઘેરા ઘા, નીચેની બાજુએ સફેદ ફૂગ',
            'treatment': 'Use Metalaxyl or Mancozeb',
            'treatment_guj': 'Metalaxyl અથવા Mancozeb નો ઉપયોગ કરો',
            'fertilizer': 'Potash 60% at 40kg per acre'
        }
    }
    
    return diseases.get(crop_type.lower(), diseases['cotton'])

@app.route('/api/weather', methods=['GET'])
def get_weather():
    """Get weather data API"""
    try:
        # Get location from query params or use default
        lat = request.args.get('lat', '23.0225')  # Default: Ahmedabad
        lon = request.args.get('lon', '72.5714')
        
        # TODO: Integrate actual weather API (OpenWeatherMap, etc.)
        # Example:
        # import requests
        # api_key = os.getenv('WEATHER_API_KEY')
        # url = f'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric'
        # response = requests.get(url)
        # data = response.json()
        # weather_data = format_weather_response(data)
        
        # For now, return mock data
        weather_data = {
            'temperature': 28,
            'humidity': 65,
            'wind_speed': 12,
            'rain_probability': 30,
            'condition': 'Partly Cloudy',
            'condition_guj': 'અંશતઃ વાદળછાયા'
        }
        
        return jsonify({'success': True, 'data': weather_data})
    except Exception as e:
        print(f"Error in get_weather: {str(e)}")
        return jsonify({'success': False, 'message': 'હવામાન માહિતી મેળવવામાં ભૂલ આવી'}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Admin login API"""
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'message': 'અમાન્ય વિનંતી'}), 400
            
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'યુઝરનેઝ અને પાસવર્ડ જરૂરી છે'}), 400
        
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('SELECT * FROM admin WHERE username = ? AND password = ?',
                  (username, password))
        admin = c.fetchone()
        conn.close()
        
        if admin:
            session['admin_id'] = admin['id']
            session['admin_username'] = admin['username']
            return jsonify({'success': True, 'message': 'એડમિન લોગિન સફળ!'})
        else:
            return jsonify({'success': False, 'message': 'અમાન્ય યુઝરનેઝ અથવા પાસવર્ડ'}), 401
    except Exception as e:
        print(f"Error in admin_login: {str(e)}")
        return jsonify({'success': False, 'message': 'લોગિન દરમિયાન ભૂલ આવી'}), 500

@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    """Admin logout API"""
    session.pop('admin_id', None)
    session.pop('admin_username', None)
    return jsonify({'success': True, 'message': 'લોગઆઉટ સફળ!'})

@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    """Get admin dashboard statistics"""
    try:
        if 'admin_id' not in session:
            return jsonify({'success': False, 'message': 'અનધિકૃત પ્રવેશ'}), 401
        
        conn = get_db_connection()
        c = conn.cursor()
        
        # Total visits
        c.execute('SELECT COUNT(*) as count FROM visits')
        total_visits = c.fetchone()['count']
        
        # Total users
        c.execute('SELECT COUNT(*) as count FROM users')
        total_users = c.fetchone()['count']
        
        # Total scans
        c.execute('SELECT COUNT(*) as count FROM scans')
        total_scans = c.fetchone()['count']
        
        # Recent visits (last 50)
        c.execute('''SELECT ip_address, visit_time, date 
                     FROM visits 
                     ORDER BY visit_time DESC 
                     LIMIT 50''')
        recent_visits = [dict(row) for row in c.fetchall()]
        
        # User details
        c.execute('''SELECT id, name, mobile, email, created_at 
                     FROM users 
                     ORDER BY created_at DESC''')
        users = [dict(row) for row in c.fetchall()]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_visits': total_visits,
                'total_users': total_users,
                'total_scans': total_scans
            },
            'recent_visits': recent_visits,
            'users': users
        })
    except Exception as e:
        print(f"Error in admin_stats: {str(e)}")
        return jsonify({'success': False, 'message': 'આંકડા મેળવવામાં ભૂલ આવી'}), 500

# -------------------- Admin: scan records --------------------
@app.route('/api/admin/scan-records', methods=['GET'])
def admin_scan_records():
    """Return aggregated scan records for admin dashboard"""
    try:
        if 'admin_id' not in session:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''SELECT crop_type as crop, disease_name as disease, COUNT(*) as count
                     FROM scans
                     GROUP BY crop_type, disease_name
                     ORDER BY count DESC
                     LIMIT 100''')
        rows = [dict(row) for row in c.fetchall()]
        conn.close()
        return jsonify({'success': True, 'records': rows})
    except Exception as e:
        print(f"Error in admin_scan_records: {str(e)}")
        return jsonify({'success': False, 'message': 'Error fetching records'}), 500

# -------------------- Crops API --------------------
@app.route('/api/crops', methods=['GET'])
def get_crops():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id, name_gu, name_en FROM crops ORDER BY name_gu')
    crops = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify({'success': True, 'crops': crops})

@app.route('/api/crops', methods=['POST'])
def add_crop():
    try:
        if 'admin_id' not in session:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        data = request.json
        name_gu = data.get('name_gu')
        name_en = data.get('name_en', '')
        if not name_gu:
            return jsonify({'success': False, 'message': 'name_gu required'}), 400
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('INSERT INTO crops (name_gu, name_en) VALUES (?, ?)', (name_gu, name_en))
        conn.commit()
        crop_id = c.lastrowid
        conn.close()
        return jsonify({'success': True, 'crop_id': crop_id})
    except Exception as e:
        print(f"Error adding crop: {str(e)}")
        return jsonify({'success': False, 'message': 'Error adding crop'}), 500

@app.route('/api/crops/<int:crop_id>', methods=['DELETE'])
def delete_crop(crop_id):
    try:
        if 'admin_id' not in session:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('DELETE FROM crops WHERE id = ?', (crop_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error deleting crop: {str(e)}")
        return jsonify({'success': False, 'message': 'Error deleting crop'}), 500

# -------------------- Diseases API --------------------
@app.route('/api/diseases', methods=['GET'])
def get_diseases():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id, name_gu, name_en, crop, symptoms, treatment, prevention FROM diseases ORDER BY name_gu')
    diseases = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify({'success': True, 'diseases': diseases})

@app.route('/api/diseases', methods=['POST'])
def add_disease():
    try:
        if 'admin_id' not in session:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        data = request.json
        name_gu = data.get('name_gu')
        name_en = data.get('name_en', '')
        crop = data.get('crop', '')
        symptoms = json.dumps(data.get('symptoms', []), ensure_ascii=False)
        treatment = json.dumps(data.get('treatment', []), ensure_ascii=False)
        prevention = json.dumps(data.get('prevention', []), ensure_ascii=False)
        if not name_gu:
            return jsonify({'success': False, 'message': 'name_gu required'}), 400
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''INSERT INTO diseases (name_gu, name_en, crop, symptoms, treatment, prevention)
                     VALUES (?, ?, ?, ?, ?, ?)''', (name_gu, name_en, crop, symptoms, treatment, prevention))
        conn.commit()
        disease_id = c.lastrowid
        conn.close()
        return jsonify({'success': True, 'disease_id': disease_id})
    except Exception as e:
        print(f"Error adding disease: {str(e)}")
        return jsonify({'success': False, 'message': 'Error adding disease'}), 500

@app.route('/api/diseases/<int:disease_id>', methods=['DELETE'])
def delete_disease(disease_id):
    try:
        if 'admin_id' not in session:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('DELETE FROM diseases WHERE id = ?', (disease_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error deleting disease: {str(e)}")
        return jsonify({'success': False, 'message': 'Error deleting disease'}), 500

# -------------------- Schemes API --------------------
@app.route('/api/schemes', methods=['GET'])
def get_schemes():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id, title, description FROM schemes ORDER BY id')
    schemes = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify({'success': True, 'schemes': schemes})

@app.route('/api/schemes', methods=['POST'])
def add_scheme():
    try:
        if 'admin_id' not in session:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        data = request.json
        title = data.get('title')
        description = data.get('description', '')
        if not title:
            return jsonify({'success': False, 'message': 'title required'}), 400
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('INSERT INTO schemes (title, description) VALUES (?, ?)', (title, description))
        conn.commit()
        scheme_id = c.lastrowid
        conn.close()
        return jsonify({'success': True, 'scheme_id': scheme_id})
    except Exception as e:
        print(f"Error adding scheme: {str(e)}")
        return jsonify({'success': False, 'message': 'Error adding scheme'}), 500

@app.route('/api/schemes/<int:scheme_id>', methods=['DELETE'])
def delete_scheme(scheme_id):
    try:
        if 'admin_id' not in session:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('DELETE FROM schemes WHERE id = ?', (scheme_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error deleting scheme: {str(e)}")
        return jsonify({'success': False, 'message': 'Error deleting scheme'}), 500

# -------------------- Excel Export API --------------------
@app.route('/api/admin/export-users', methods=['GET'])
def export_users_to_excel():
    """Export user data to Excel file - Admin only"""
    try:
        # Check admin authentication
        if 'admin_id' not in session:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        
        # Get database connection
        conn = get_db_connection()
        c = conn.cursor()
        
        # Fetch all users from database
        c.execute('''SELECT name, mobile, email, created_at 
                     FROM users 
                     ORDER BY created_at DESC''')
        users = c.fetchall()
        conn.close()
        
        # Convert to list of dictionaries
        users_data = []
        ist_timezone = pytz.timezone('Asia/Kolkata')
        
        for user in users:
            name, mobile, email, created_at = user
            
            # Convert timestamp to IST and format
            if created_at:
                try:
                    # Parse the timestamp
                    if isinstance(created_at, str):
                        # Try different date formats
                        try:
                            dt = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')
                        except:
                            try:
                                dt = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S.%f')
                            except:
                                # Fallback to current time if parsing fails
                                dt = datetime.now()
                    else:
                        dt = created_at
                    
                    # Convert to IST if timezone info is missing
                    if dt.tzinfo is None:
                        # Assume UTC if no timezone info
                        dt = pytz.utc.localize(dt)
                    dt_ist = dt.astimezone(ist_timezone)
                    
                    # Format as requested: "27 ડિસેમ્બર, 2025 એ 11:10 AM વાગ્યે"
                    day = dt_ist.day
                    month_num = dt_ist.month
                    year = dt_ist.year
                    hour = dt_ist.hour
                    minute = dt_ist.minute
                    
                    # Month names in Gujarati
                    month_map = {
                        1: 'જાન્યુઆરી', 2: 'ફેબ્રુઆરી', 3: 'માર્ચ',
                        4: 'એપ્રિલ', 5: 'મે', 6: 'જૂન',
                        7: 'જુલાઈ', 8: 'ઑગસ્ટ', 9: 'સપ્ટેમ્બર',
                        10: 'ઑક્ટોબર', 11: 'નવેમ્બર', 12: 'ડિસેમ્બર'
                    }
                    month_gu = month_map.get(month_num, '')
                    
                    # Format time in 12-hour format
                    period = 'AM' if hour < 12 else 'PM'
                    hour_12 = hour % 12
                    if hour_12 == 0:
                        hour_12 = 12
                    
                    formatted_date = f'{day} {month_gu}, {year} એ {hour_12}:{minute:02d} {period} વાગ્યે'
                except Exception as e:
                    # If formatting fails, use a simple format
                    print(f"Error formatting date: {e}")
                    formatted_date = str(created_at) if created_at else '-'
            else:
                formatted_date = '-'
            
            users_data.append({
                'Name': name or '-',
                'Mobile': mobile or '-',
                'Email': email or '-',
                'Registration Date (IST)': formatted_date
            })
        
        # Create DataFrame
        df = pd.DataFrame(users_data)
        
        # Create Excel file in memory
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Users')
            
            # Get the workbook and worksheet
            workbook = writer.book
            worksheet = writer.sheets['Users']
            
            # Auto-adjust column widths
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max_length + 2, 50)
                worksheet.column_dimensions[column_letter].width = adjusted_width
        
        output.seek(0)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'users_export_{timestamp}.xlsx'
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        print(f"Error exporting users to Excel: {str(e)}")
        return jsonify({'success': False, 'message': 'Excel export failed'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

