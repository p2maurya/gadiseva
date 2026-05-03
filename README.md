# 🚛 गाड़ी एक्सप्रेस v2.0
live link gadiseva.vercel.app


Rural Transport Booking Platform — UP Region

---

## 🐛 Problems Fixed from v1

| Problem | Fix |
|---------|-----|
| Phone pe kaam nahi karta | `proxy` hata diya, dynamic API URL |
| Render pe backend nahi tha | Ab Express hi React build serve karta hai |
| CORS errors on mobile | Proper CORS headers added |
| GPS always fails | Fallback to Lucknow if GPS denied |
| Route conflict (`/nearby`) | Fixed route order in Express |

---

## 🚀 Deploy on Render (FREE)

### Step 1: GitHub pe push karo
```bash
git init
git add .
git commit -m "Gaadi Express v2"
git remote add origin https://github.com/YOUR_USERNAME/gaadi-express.git
git push -u origin main
```

### Step 2: Render.com
1. https://render.com → Sign up (free)
2. **New** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `.` (root, not backend)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Click **Create Web Service**

### Step 3: Done! 🎉
Render will give you a URL like: `https://gaadi-express.onrender.com`
- App: `https://gaadi-express.onrender.com`
- API: `https://gaadi-express.onrender.com/api`
- Health: `https://gaadi-express.onrender.com/api/health`

> ⚠️ Free tier sleeps after 15 min inactivity. First load takes ~30 sec.

---

## 💻 Local Development

### Backend only:
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Frontend only:
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:5000 npm start
# Runs on http://localhost:3000
```

### Both together:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && REACT_APP_API_URL=http://localhost:5000 npm start
```

---

## 📱 App Features

### Customer (ग्राहक)
- GPS location
- Fill name, phone, pickup/drop address
- Choose goods type (Saman, Kheti, Pashу, etc.)
- See nearby drivers within 50km
- Call driver directly
- Book with fare estimate
- View booking history by phone number

### Driver (वाहन मालिक)
- Register with vehicle details
- Login with phone number
- Toggle Online/Offline
- View assigned bookings
- Mark trip complete

### Admin Panel
- Password: `admin123`
- Stats dashboard
- Manage all bookings (confirm/start/complete/cancel)
- Assign drivers to pending bookings
- View all drivers with status

---

## 🔧 API Endpoints

```
GET  /api/health
GET  /api/drivers
POST /api/drivers
GET  /api/drivers/nearby/search?lat=&lng=&radius=50
GET  /api/drivers/:id
PATCH /api/drivers/:id/availability
PATCH /api/drivers/:id/location
GET  /api/bookings
POST /api/bookings
GET  /api/bookings/:id
PATCH /api/bookings/:id/status
GET  /api/bookings/admin/stats
```

---

## 🔮 To Add Persistent Data (MongoDB)

Replace `backend/data/store.js` with MongoDB:
1. Create free MongoDB Atlas cluster
2. `npm install mongoose` in backend
3. Add `MONGODB_URI` env var in Render
4. Replace in-memory arrays with Mongoose models

---

## Demo Driver Phone Numbers
- `9876543210` — Ramesh Yadav (Tractor, Sitapur)
- `9812345678` — Suresh Kumar (Mini Truck, Lucknow)  
- `9845678901` — Dinesh Patel (Tempo, Barabanki)
