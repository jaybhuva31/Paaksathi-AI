# Paaksathi AI - કૃષિ રોગ ડિટેક્શન સિસ્ટમ

AI-પાવર્ડ ક્રોપ ડિઝીઝ ડિટેક્શન વેબ એપ્લિકેશન

## 📋 વિષયસૂચી

- [વિશેષતાઓ](#વિશેષતાઓ)
- [ટેકનોલોજી](#ટેકનોલોજી)
- [સ્થાપન](#સ્થાપન)
- [ઉપયોગ](#ઉપયોગ)
- [પ્રોજેક્ટ સ્ટ્રક્ચર](#પ્રોજેક્ટ-સ્ટ્રક્ચર)
- [API ડોક્યુમેન્ટેશન](#api-ડોક્યુમેન્ટેશન)

## ✨ વિશેષતાઓ

### 🎯 મુખ્ય વિશેષતાઓ

- **AI-પાવર્ડ રોગ ડિટેક્શન**: અદ્યતન AI તકનીક સાથે પાકના રોગોની ઝડપથી ઓળખ
- **લાઇવ હવામાન**: વાસ્તવિક સમયની હવામાન માહિતી
- **રોગ લાઇબ્રેરી**: વિસ્તૃત રોગ ડેટાબેઝ અને ઉપચાર માર્ગદર્શિકા
- **સરકારી યોજનાઓ**: કૃષકો માટે લાભકારી યોજનાઓની માહિતી
- **યુઝર ડેશબોર્ડ**: વ્યક્તિગત પ્રોફાઇલ અને સ્કેન ઇતિહાસ
- **એડમિન પેનલ**: વેબસાઇટ આંકડાઓ અને યુઝર મેનેજમેન્ટ

### 🌾 સપોર્ટેડ પાક

- કપાસ (Cotton)
- ઘઉં (Wheat)
- ચોખા (Rice)
- ટમેટા (Tomato)
- બટાટા (Potato)

## 🛠 ટેકનોલોજી

### Frontend
- HTML5
- CSS3 (Custom responsive design)
- JavaScript (Vanilla JS)
- Font Awesome Icons

### Backend
- Python 3.8+
- Flask (Web framework)
- SQLite (Database)

### AI/ML
- Pretrained crop disease detection model (Placeholder - ready for integration)

## 📦 સ્થાપન

### પૂર્વજરૂરીયાતો

- Python 3.8 અથવા નવીનતમ
- pip (Python package manager)

### સ્ટેપ-બાય-સ્ટેપ સ્થાપન

1. **રિપોઝિટરી ક્લોન કરો અથવા ડાઉનલોડ કરો**

```bash
# જો Git ઇન્સ્ટોલ હોય
git clone <repository-url>
cd usingcursor

# અથવા ફાઇલો extract કરો
```

2. **વર્ચ્યુઅલ એન્વાયર્નમેન્ટ બનાવો (વૈકલ્પિક પણ ભલામણ)**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. **જરૂરી પેકેજો ઇન્સ્ટોલ કરો**

```bash
pip install -r requirements.txt
```

4. **ડેટાબેઝ ઇનિશિયલાઇઝ કરો**

ડેટાબેઝ આપમેળે બનશે જ્યારે તમે એપ્લિકેશન ચલાવશો. પ્રથમ વખત `app.py` ચલાવતી વખતે `paaksathi.db` ફાઇલ બનશે.

5. **એપ્લિકેશન ચલાવો**

```bash
python app.py
```

6. **બ્રાઉઝરમાં ખોલો**

```
http://localhost:5000
```

## 🚀 ઉપયોગ

### યુઝર માર્ગદર્શિકા

1. **હોમ પેજ**: વેબસાઇટની મુખ્ય પાનું, વિશેષતાઓ અને આંકડા જુઓ

2. **રજિસ્ટ્રેશન/લોગિન**:
   - નવા યુઝર: `/signup` પર જઈને એકાઉન્ટ બનાવો
   - અસ્તિત્વમાં યુઝર: `/login` પર જઈને લોગિન કરો

3. **પાક સ્કેન**:
   - `/upload` પર જાઓ
   - પાક પસંદ કરો (કપાસ, ઘઉં, વગેરે)
   - રોગગ્રસ્ત પાકની છબી અપલોડ કરો
   - "રોગ ઓળખો" બટન પર ક્લિક કરો
   - પરિણામ જુઓ

4. **ડેશબોર્ડ**:
   - `/dashboard` પર જઈને તમારી પ્રોફાઇલ અને આંકડા જુઓ

5. **હવામાન**:
   - `/weather` પર જઈને લાઇવ હવામાન માહિતી જુઓ

### એડમિન માર્ગદર્શિકા

1. **એડમિન લોગિન**:
   - `/admin` પર જાઓ
   - Default credentials:
     - Username: `admin`
     - Password: `admin123`
   - ⚠️ **Production માં પાસવર્ડ બદલો!**

2. **એડમિન ડેશબોર્ડ**:
   - કુલ મુલાકાતો, યુઝર્સ, અને સ્કેન જુઓ
   - તાજેતરની મુલાકાતોની યાદી
   - રજિસ્ટર્ડ યુઝર્સની યાદી

## 📁 પ્રોજેક્ટ સ્ટ્રક્ચર

```
usingcursor/
├── app.py                      # Flask backend application
├── requirements.txt            # Python dependencies
├── README.md                   # Project documentation
├── paaksathi.db               # SQLite database (auto-generated)
├── templates/
│   └── pages/
│       ├── index.html         # Home page
│       ├── login.html         # Login page
│       ├── signup.html        # Signup page
│       ├── upload.html        # Crop image upload
│       ├── result.html        # Disease detection result
│       ├── crops.html         # Crops information
│       ├── disease-library.html # Disease library
│       ├── weather.html       # Weather page
│       ├── government-schemes.html # Government schemes
│       ├── faq.html           # FAQ page
│       ├── contact.html       # Contact page
│       ├── dashboard.html     # User dashboard
│       └── admin.html         # Admin panel
├── static/
│   ├── css/
│   │   ├── style.css          # Main stylesheet
│   │   ├── auth.css           # Authentication pages
│   │   ├── upload.css         # Upload page
│   │   ├── result.css         # Result page
│   │   ├── dashboard.css      # Dashboard page
│   │   ├── admin.css          # Admin panel
│   │   └── weather.css        # Weather page
│   ├── js/
│   │   ├── main.js            # Main JavaScript
│   │   ├── auth.js            # Authentication logic
│   │   ├── upload.js          # Upload functionality
│   │   ├── result.js          # Result display
│   │   ├── dashboard.js       # Dashboard logic
│   │   ├── admin.js           # Admin panel logic
│   │   └── weather.js         # Weather functionality
│   └── uploads/               # Uploaded images (auto-generated)
└── venv/                      # Virtual environment (optional)
```

## 🔌 API ડોક્યુમેન્ટેશન

### User APIs

#### `POST /api/user/signup`
User registration
```json
{
  "name": "User Name",
  "mobile": "9876543210",
  "email": "user@example.com",
  "password": "password123"
}
```

#### `POST /api/user/login`
User login
```json
{
  "mobile": "9876543210",
  "password": "password123"
}
```

#### `POST /api/user/logout`
User logout

#### `GET /api/user/profile`
Get user profile (requires login)

### Scan APIs

#### `POST /api/scan/upload`
Upload crop image for disease detection
- Form data:
  - `file`: Image file
  - `crop_type`: cotton, wheat, rice, tomato, potato

### Statistics APIs

#### `GET /api/stats`
Get website statistics (visits, scans, users)

#### `POST /api/track-visit`
Track website visit

### Weather APIs

#### `GET /api/weather?lat=23.0225&lon=72.5714`
Get weather data for location

### Admin APIs

#### `POST /api/admin/login`
Admin login
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### `GET /api/admin/stats`
Get admin dashboard statistics (requires admin login)

## 🔒 સુરક્ષા નોંધો

⚠️ **Production માટે:**

1. **Secret Key બદલો**: `app.py` માં `app.secret_key` બદલો
2. **Admin Password બદલો**: Database માં admin password બદલો
3. **Password Hashing**: Production માં passwords hash કરો (bcrypt વગેરે)
4. **HTTPS**: Production માં HTTPS ઉપયોગ કરો
5. **Environment Variables**: Sensitive data માટે environment variables ઉપયોગ કરો

## 🤖 AI મોડેલ ઇન્ટેગ્રેશન

હાલમાં, disease detection માટે mock data return થાય છે. Actual AI model integrate કરવા માટે:

1. **Model File**: Pretrained model file (`.h5`, `.pkl`, વગેરે) add કરો
2. **Update `detect_disease_mock()` function**: `app.py` માં `detect_disease_mock()` ને actual model inference સાથે replace કરો
3. **Dependencies**: TensorFlow/Keras અથવા અન્ય ML library add કરો

Example:
```python
import tensorflow as tf
from tensorflow import keras

model = keras.models.load_model('path/to/model.h5')

def detect_disease(image_path, crop_type):
    # Preprocess image
    img = preprocess_image(image_path)
    # Predict
    prediction = model.predict(img)
    # Return result
    return format_result(prediction, crop_type)
```

## 🌐 Weather API ઇન્ટેગ્રેશન

હાલમાં mock weather data return થાય છે. Actual weather API integrate કરવા માટે:

1. **API Key મેળવો**: OpenWeatherMap અથવા અન્ય weather API
2. **Update `get_weather()` function**: `app.py` માં actual API call add કરો

Example:
```python
import requests

def get_weather(lat, lon):
    api_key = os.getenv('WEATHER_API_KEY')
    url = f'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}'
    response = requests.get(url)
    data = response.json()
    return format_weather_data(data)
```

## 🐛 Troubleshooting

### Database Error
- `paaksathi.db` ફાઇલ delete કરો અને ફરીથી run કરો
- Database permissions તપાસો

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Module Not Found
```bash
pip install -r requirements.txt
```

## 📝 લાઇસન્સ

આ પ્રોજેક્ટ educational purposes માટે છે.

## 👥 સંપર્ક

- Email: info@paaksathiai.com
- Phone: +91 98765 43210

## 🙏 આભાર

- PlantVillage dataset for crop disease detection
- Font Awesome for icons
- Flask community

---

**નોંધ**: આ એપ્લિકેશન development stage માં છે. Production માં deploy કરતા પહેલા security અને performance optimizations કરો.

