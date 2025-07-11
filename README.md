# Store Rating Web App

A full-stack web application for rating and managing stores, featuring separate dashboards for Admin, Owner, and User roles. Built with React (frontend) and Node.js/Express (backend), with **PostgreSQL** for data storage. Deployed on **Render** (backend) and **Vercel** (frontend).

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
- **Backend:** Node.js, Express, **PostgreSQL**
- **Other:** JWT Auth, REST API, CORS, Helmet
- **Deployment:** **Render** (backend), **Vercel** (frontend)

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
- Deployed to [Vercel](https://vercel.com/)
- Build command: `npm run build`
- Output directory: `build`
- [Live Frontend URL](https://store-rating-app-m51q.vercel.app/)

### Backend
- Deployed to [Render](https://render.com/)
- Build command: `npm install`
- Start command: `node index.js`
- [Live Backend URL](https://store-rating-app-9.onrender.com/)
- Add environment variables in the Render dashboard

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
- Add your tests in `backend/tests`
- To run tests:
```sh
cd backend
npm test
```

---

## 📸 Screenshots

### Entry Page
![Entry Page](./screenshots/entry-page.png)
*The landing page where users can discover, rate, and join the store rating community.*

### Login Page
![Login Page](./screenshots/login-page.png)
*User login screen with a modern, gradient UI.*

### User Dashboard
![User Dashboard](./screenshots/user-dashboard.png)
*Dashboard for users to view, search, and rate stores. Shows ratings and comments for each store.*

### Store Analytics (Owner/Store View)
![Store Analytics](./screenshots/store-analytics.png)
*Store analytics page showing total ratings, most common rating, most recent rating, and a table of user ratings for a store.*

---

## 📑 API Documentation

### Authentication

#### POST `/login`
- **Request:**
  ```json
  { "email": "user@example.com", "password": "Password123!" }
  ```
- **Response:**
  ```json
  { "token": "<jwt>", "user": { "id": 1, "name": "User", "email": "user@example.com", "role": "User" } }
  ```

#### POST `/register`
- **Request:**
  ```json
  { "name": "User Name", "email": "user@example.com", "password": "Password123!", "address": "Address", "role": "User" }
  ```
- **Response:**
  ```json
  { "message": "User registered successfully." }
  ```

### Store Management

#### GET `/stores`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  [ { "id": 1, "name": "Store 1", "address": "Address", "avgrating": 4.5 }, ... ]
  ```

#### POST `/admin/stores` (Admin only)
- **Headers:** `Authorization: Bearer <token>`
- **Request:**
  ```json
  { "name": "Store Name", "email": "owner@email.com", "address": "Address" }
  ```
- **Response:**
  ```json
  { "message": "Store created successfully." }
  ```

### Rating

#### POST `/user/rate`
- **Headers:** `Authorization: Bearer <token>`
- **Request:**
  ```json
  { "storeId": 1, "rating": 5, "comment": "Great store!" }
  ```
- **Response:**
  ```json
  { "message": "Rating submitted successfully." }
  ```

#### GET `/ratings/:storeId`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  { "rating": 5, "comment": "Great store!" }
  ```

### User Management (Admin)

#### GET `/admin/users`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  [ { "id": 1, "name": "User", "email": "user@example.com", "role": "User" }, ... ]
  ```

#### POST `/admin/users`
- **Headers:** `Authorization: Bearer <token>`
- **Request:**
  ```json
  { "name": "User Name", "email": "user@example.com", "password": "Password123!", "address": "Address", "role": "User" }
  ```
- **Response:**
  ```json
  { "message": "User created successfully." }
  ```

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
- [PostgreSQL](https://www.postgresql.org/)

---

## 👤 Default Admin Credentials

- **Admin Email:** admin1@gmail.com
- **Admin Password:** Admin@123

> Only this admin account can access the Admin Dashboard. Admin registration is disabled for regular users. 