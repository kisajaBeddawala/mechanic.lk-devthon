#  Mechanic.LK

> Your all-in-one automotive ecosystem — connecting drivers with mechanics, garages, parking, and emergency services across Sri Lanka.

> **📱 This application is primarily designed and optimized for mobile users.** It is also fully compatible with desktop/PC browsers.

🔗 **Live Demo:** [https://mechaniclk.netlify.app](https://mechaniclk.netlify.app)  
🔗 **API:** [https://mechaniclk-devthon-production.up.railway.app](https://mechaniclk-devthon-production.up.railway.app)

---

## 🔑 Demo Login Credentials

You can also **sign up** to create a new account.

| Role | Email | Password |
|---|---|---|
| Driver | `driver@mail.com` | `Driver` |
| Mechanic / Garage | `mech@mail.lk` | `mech2025` |
| Parking Owner | `park@mail.lk` | `park2025` |

---

##  Setup Instructions

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- **MongoDB** instance (local or MongoDB Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/mechanic.lk-devthon.git
cd mechanic.lk-devthon
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the server:

```bash
npm run dev       # Development (with hot-reload)
npm start         # Production
```

### 3. Setup the Frontend

```bash
cd client
npm install
npm run dev
```

### 4. Build for Production

```bash
cd client
npm run build
npm start
```

---

##  Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Leaflet / React-Leaflet
- Netlify (Hosting)

### Backend

- Node.js
- Express 5
- MongoDB / Mongoose 9
- JWT (jsonwebtoken)
- bcryptjs
- Multer
- Socket.IO
- Helmet & Morgan
- Railway (Hosting)

---

##  Team Members

| Name | Role |
|---|---|
| **Kalhara Jayathissa** | Team Lead ·  0758167938 ·  kalharaj.23@cse.mrt.ac.lk |
| **Kisaja Beddawela** | Member |
| **Gishan Chamith** | Member |
| **Sanka Vidanage** | Member |
| **Nilesh Amarathunge** | Member |
