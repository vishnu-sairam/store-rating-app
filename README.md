# Store Rating Web App

A full-stack web application for rating and managing stores, featuring separate dashboards for Admin, Owner, and User roles. Built with React (frontend) and Node.js/Express (backend), with MySQL for data storage.

---

## 🚀 Features
- User authentication (login/register)
- Role-based dashboards: Admin, Owner, User
- Store management (CRUD)
- User management (CRUD)
- Store rating and analytics
- Password update flows for all roles
- Toast notifications and loading spinners
- Responsive, modern UI with beautiful effects

---

## 🛠️ Tech Stack
- **Frontend:** React, Tailwind CSS, React Router, React Toastify, React Spinners, React Icons
- **Backend:** Node.js, Express, MySQL
- **Other:** JWT Auth, REST API, CORS, Helmet

---

## 📦 Project Structure
```
store_rating_web_app/
  ├── backend/      # Node.js/Express API
  └── frontend/     # React app
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd store_rating_web_app
```

### 2. Backend Setup
```sh
cd backend
npm install
# Configure your .env file (DB connection, JWT secret, etc.)
# Example: cp .env.example .env
npm start
```

### 3. Frontend Setup
```sh
cd ../frontend
npm install
npm start
```

- The frontend runs on [http://localhost:3000](http://localhost:3000)
- The backend runs on [http://localhost:4000](http://localhost:4000)

---

## 🌐 Deployment

### Frontend
- Deploy to [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/)
- Build command: `npm run build`
- Output directory: `build`

### Backend
- Deploy to [Render](https://render.com/) or [Railway](https://railway.app/)
- Build command: `npm install`
- Start command: `node index.js`
- Add environment variables in the dashboard

---

## 🧪 Running Tests

### Frontend
- Uses Jest and React Testing Library
- To run tests:
```sh
cd frontend
npm test
```

### Backend
- Uses Jest or Mocha/Chai (add your tests in `backend/tests`)
- To run tests:
```sh
cd backend
npm test
```

---

## 📸 Screenshots
_Add screenshots of your app here!_

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
[MIT](LICENSE)

---

## 🙏 Acknowledgements
- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Render](https://render.com/)
- [Vercel](https://vercel.com/) 

---

## 👤 Default Admin Credentials

- **Admin Email:** admin1@gmail.com
- **Admin Password:** Admin@123

> Only this admin account can access the Admin Dashboard. Admin registration is disabled for regular users. 