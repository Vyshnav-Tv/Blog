# Chronicle – Blog Application

Chronicle is a full-stack blog application built using **Laravel, React, and MySQL**. It provides a platform to create, manage, and explore blog posts through a modern web interface.
- **Deployment:-
- frontend==vercel,
- Backend==Render,
- DataBase==Aiven MySQL
- 
## Tech Stack

- **Frontend:** React.js
- **Backend:** Laravel (PHP)
- **Database:** MySQL (Aiven)
- **Deployment:** Render
- **Version Control:** Git & GitHub

## Project Structure

```text
Blog/
├── backend/       # Laravel API
└── frontend/      # React application
```

## Getting Started

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Database

The application uses MySQL for storing application data.

## Deployment

- Backend: Render
- url:https://blog-q3bu.onrender.com
- Database: Aiven MySQL

## License

This project is open-source and available for learning and development purposes.
