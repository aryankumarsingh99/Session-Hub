# SessionHub - Wellness Session Management Platform

A wellness session management platform built with Next.js 15 and MongoDB. Create, manage, and discover meditation, breathing, and mindfulness sessions.

## 🚀 Live Demo
🔗  https://session-hub.vercel.app/

## ✨ Features
- **User Authentication** - JWT-based login/registration
- **Session Management** - Create, edit, delete wellness sessions
- **Draft & Publish** - Save drafts or publish publicly
- **Session Discovery** - Browse and filter sessions
- **Responsive Design** - Works on all devices

## 🛠️ Tech Stack
- Next.js 15, React, Tailwind CSS
- MongoDB Atlas, Mongoose
- JWT Authentication
- Deployed on Vercel

## ⚙️ Quick Setup

1. **Clone & Install**
```bash
git clone https://github.com/aryankumarsingh99/Session-Hub.git
cd Session-Hub
npm install
```

2. **Environment Variables** - Create `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/SessionHub
JWT_SECRET=your_long_secret_key_here
NODE_ENV=development
```

3. **Run Development Server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 🛣️ API Routes

### Public Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/sessions` - Get published sessions

### Protected Endpoints (JWT Required)
- `GET /api/my-sessions` - Get user's sessions
- `GET /api/my-sessions/[id]` - Get single session
- `DELETE /api/my-sessions/[id]` - Delete session
- `POST /api/my-sessions/save-draft` - Save draft
- `POST /api/my-sessions/publish` - Publish session

## 📱 Frontend Pages
- `/` - Home page
- `/login` - Authentication
- `/my-sessions` - Session management
- `/my-sessions/[id]` - View session
- `/sessions/create` - Create/edit sessions

## 🧪 Testing Flow
1. Register/Login → Create Session → Save Draft → View in My Sessions → Edit → Publish → Check Public API

## 🚀 Deploy to Vercel
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel settings
3. Deploy automatically on push to main

## 🐛 Troubleshooting
- **Build fails**: Remove any `page.js` files from `/api/` directories
- **Database issues**: Check MongoDB URI and IP whitelist
- **Auth issues**: Verify JWT_SECRET is set

## 👨‍💻 Author
**Aryan Kumar Singh** - [@aryankumarsingh99](https://github.com/aryankumarsingh99)

---
Built with ❤️ using Next.js 15
