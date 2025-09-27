# 📝 Feedback Management System

A full-stack web application for collecting and managing feedback.  
It includes **user features** for submitting and tracking feedback, and an **admin dashboard** for managing feedback status with insights via charts and graphs.

---

## 🚀 Features

### 👤 User
- Register & Login with JWT authentication
- Submit new feedback (title, description, category)
- Upvote / unlike feedbacks
- Comment & reply on feedback
- View feedback status in real-time
- Responsive UI with search, filter, and pagination

### 🛠 Admin
- Dedicated **Admin Dashboard**
- Update feedback status (Planned, In Progress, Completed)
- View total users and total feedbacks
- Interactive charts (Bar, Pie, Line) using **Chart.js**
- Feedback trends over time

---

## 🏗 Tech Stack

**Frontend**
- React.js
- React Router
- Chart.js
- CSS (custom, responsive)

**Backend**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (JSON Web Token) for authentication
- bcrypt.js for password hashing

---

## 📂 Project Structure

project-root/
│── backend/
│ ├── models/ # Mongoose schemas (User, Admin, Feedback)
│ ├── routes/ # API routes (auth, feedbacks)
│ ├── middleware/ # JWT middleware
│ ├── server.js # Express app entry point
│
│── frontend/
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Login, Home, FeedbackDetails, AdminDashboard
│ │ ├── App.js
│ │ ├── index.js
│ └── public/
│
│── package.json
│── README.md



---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/feedback-management-system.git
cd feedback-management-system

2️⃣ Install dependencies

Backend :
cd backend
npm install

Frontend :  
cd frontend
npm install

### 3️⃣ Setup environment variables
Create a `.env` file in the `backend/` directory based on `.env.example`:

4️⃣ Run the app

Backend : 
cd backend
npm start

Frontend : 
cd frontend
npm start

Visit 👉 http://localhost:3000
