# 💼 JobFinder — Fullstack Job & Social Platform using Next.js, MongoDB & Tailwind

A feature-rich professional networking and job posting platform built for the Τεχνολογίες Εφαρμογών Διαδικτύου (TEDI) course, Summer 2024. Developed with **Next.js**, **MongoDB Atlas**, **Tailwind CSS**, and **Node.js**, the app includes authentication, posts, listings, messaging, and a matrix factorization-based recommendation engine.

---

## 👥 Team

- Δημήτριος Χρυσός – 1115202100275  
- Αναστάσιος Μουμουλίδης – 1115202100108

---

## 🚀 Getting Started

### Prerequisites

- Install Node.js from: https://nodejs.org/en/download/prebuilt-installer

### Run Locally

1. Clone the repository and open it in VS Code or another IDE.
2. Run:
```bash
npm install
npm run dev
```
3. Visit the app at: `https://localhost:3000`

> Note: Self-signed SSL/TLS certificate is used. On first visit, bypass browser warning via **Advanced → Proceed to localhost (unsafe)**.

---

## 🧱 Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Node.js, API Routes (Next.js)
- **Database**: MongoDB Atlas
- **Security**: Self-signed HTTPS with TLS
- **Authentication**: next-auth
- **ML Feature**: Matrix Factorization for recommendations

---

## 🧠 Key Features

- **Admin Mode**: Auto-created admin with credentials (`admin@u.com` / `admin123`)
- **Authentication & Access Control**: Secure page access via `middleware.js`
- **Posts & Listings**: Text, audio, video support
- **Private Messaging**: Full chat system with real-time messages
- **Job Applications**: Users can post listings and submit applications
- **Search Functionality**: User directory search with live filtering
- **Notification System**: Based on interactions like likes/comments
- **Matrix Factorization Engine**:
  - Periodic (every 30 min) matrix updates
  - Data chunked for storage performance

---

## 📁 Structure Highlights

- `/app`: Routes and pages
- `/api`: REST API endpoints
- `/components`: UI components (e.g., PostCard, ChatCard, ListingsMenu)
- `/models`: Mongoose schemas for Users, Posts, Listings, Chats, Matrix data

---

## 🧪 Testing Accounts

- **Admin account**: `admin@u.com` / `admin123`
- **Example account**: `ex@gmail.com` / `123` (has image, audio, and video posts)

---

## 🎯 Design Notes

- Next.js routing is file-based via `page.jsx`
- User role (`admin`) stored in the schema
- Matrix data is chunked and cached for scalability
- Database scripts include `populateDB.mjs` for test data

---

## 📜 Summary

This app was developed as part of the TEDI course (Summer 2024) to demonstrate proficiency in modern fullstack development using JavaScript technologies. Despite challenges, all requirements (including bonus) were met and implemented successfully.
