# 🚀 NexusChat - Enterprise-Grade Realtime Chat Application

<div align="center">

![NexusChat](https://img.shields.io/badge/NexusChat-v2.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-v18+-success?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)

**A production-ready, AI-powered chat application with military-grade encryption and advanced features**

[Live Demo](#) | [Documentation](#) | [Report Bug](#) | [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [🌟 Highlights](#-highlights)
- [✨ Advanced Features](#-advanced-features)
- [🤖 AI-Powered Intelligence](#-ai-powered-intelligence)
- [🔐 Security Architecture](#-security-architecture)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Quick Start](#-quick-start)
- [📸 Screenshots](#-screenshots)
- [🏗️ Project Structure](#️-project-structure)
- [🔧 Configuration](#-configuration)
- [📱 API Documentation](#-api-documentation)
- [🎨 Themes](#-themes)
- [👨‍💻 About Developer](#-about-developer)

---

## 🌟 Highlights

> **What makes NexusChat stand out from other chat applications?**

```diff
+ 🤖 AI-Powered Smart Replies using Google Gemini
+ 🔐 Military-Grade AES-256-CBC-HMAC Encryption
+ 👥 Advanced Group Chat with Role-Based Permissions
+ ⚡ Real-time Everything (Messages, Typing, Presence)
+ 🎨 30+ Beautiful Themes (Dark, Light, Cyberpunk, Synthwave...)
+ 📊 Enterprise-Level Security Dashboard
+ 🔄 Automatic Key Rotation (Perfect Forward Secrecy)
+ 💬 Emoji Reactions & File Sharing
+ 📱 Fully Responsive & Modern UI/UX
```

---

## ✨ Advanced Features

### 🤖 **AI-Powered Smart Reply System**

**The Evolution of Intelligence:**

#### **Phase 1: NLP-Based Pattern Matching** _(Previous Implementation)_

- Rule-based natural language processing
- Regex pattern matching for 10+ conversation contexts
- Static predefined responses with confidence scoring
- Emoji intelligence based on keyword detection
- Client-side processing for instant suggestions

**How it worked:**

```javascript
Message: "How are you doing?"
  ↓ NLP Analysis
Pattern Match: "how are you" → Category: greeting
  ↓ Confidence Scoring
Suggestions: ["I'm doing great! 😊", "Pretty good, thanks!", ...]
```

#### **Phase 2: Google Gemini AI Integration** _(Current Implementation)_

- **Real AI-powered response generation** using Google's Gemini Pro model
- **Context-aware suggestions** analyzing conversation history
- **Natural language understanding** for complex messages
- **Dynamic response adaptation** based on conversation flow
- **Sentiment analysis** for appropriate tone matching
- **Automatic fallback** to NLP patterns if AI service is unavailable

**How it works now:**

```javascript
User receives: "Hey! I'm thinking about learning React..."
  ↓
Google Gemini AI analyzes message + conversation history
  ↓
AI generates contextual suggestions:
- "That's awesome! React is great for building UIs! 🚀"
- "I'd be happy to help! What specifically interests you?"
- "Great choice! Start with the official React docs 📚"
- "Exciting! Are you familiar with JavaScript already?"
  ↓
User clicks → Instant intelligent reply
```

**Technical Implementation:**

- Backend: `/api/ai/smart-replies` endpoint
- AI Service: `aiService.js` with Gemini SDK
- Frontend: Real-time API calls with loading states
- **Fallback Chain:** Gemini AI → NLP Patterns → Generic Responses
- **Performance:** ~1-2 second response time with caching

**Key Differentiators:**
| Feature | NLP-Based | AI-Powered (Current) |
|---------|-----------|---------------------|
| Intelligence Level | Pattern Matching | True AI Understanding |
| Context Awareness | Keyword-based | Conversation History |
| Response Quality | Static Templates | Dynamic & Natural |
| Adaptability | Fixed Patterns | Learns from Context |
| Processing | Client-side | Server-side (Gemini API) |

---

### 🔐 **Military-Grade End-to-End Encryption**

**Security Architecture:**

- **Algorithm:** AES-256-CBC with HMAC authentication
- **Key Derivation:** PBKDF2 with 10,000 iterations
- **Key Management:** Automatic 24-hour key rotation
- **Perfect Forward Secrecy:** Compromised keys don't affect past messages
- **Zero-Knowledge:** Server cannot decrypt messages
- **Message Integrity:** HMAC verification prevents tampering

**Security Levels:**

- 🔓 **Legacy:** Unencrypted (for testing)
- 🔒 **Enterprise:** AES-256-CBC-HMAC (default)
- 🛡️ **Military:** Maximum security with extended key rotation

**Encryption Dashboard:**

- Real-time encryption status monitoring
- Manual key rotation controls
- Live encryption testing tools
- Security audit logs

---

### 👥 **Advanced Group Chat System**

**Features:**

- ✅ Create groups with unlimited members
- ✅ Role-based access control (Admin/Member)
- ✅ Granular permission management
- ✅ Group settings customization
- ✅ Real-time member management
- ✅ Group notifications
- ✅ Member invite controls
- ✅ Admin promotion/demotion

**Permission Controls:**

- Who can invite new members
- Who can send messages
- Who can change group info
- Who can remove members

---

### 💬 **Rich Messaging Experience**

**Message Features:**

- ✨ Emoji reactions (like Slack/Discord)
- 📎 File sharing with Cloudinary
- 🖼️ Image uploads with preview
- ✍️ Real-time typing indicators
- ✅ Read receipts & delivery status
- 🔄 Message status tracking (Sent → Delivered → Read)
- 🗑️ Message deletion
- 📊 Message statistics

**Real-Time Features:**

- 🟢 Online/Offline user status
- ⌨️ Live typing indicators with auto-cleanup
- 🔔 Instant message notifications
- 📱 Socket.io bi-directional communication
- ⚡ Sub-second message delivery

---

### 🎨 **Modern UI/UX Design**

**30+ Premium Themes:**

```
Light Themes: light, cupcake, corporate, emerald, fantasy, lofi, pastel, wireframe
Dark Themes: dark, synthwave, halloween, forest, black, luxury, dracula, night, coffee
Unique Themes: cyberpunk, retro, valentine, aqua, acid, lemonade, winter, dim, nord, sunset
```

**UI Features:**

- 🎭 Smooth animations & transitions
- 💫 Skeleton loaders for better UX
- 📱 Fully responsive design (mobile-first)
- 🎨 Beautiful gradient effects
- 🖱️ Intuitive drag-and-drop
- ⌨️ Keyboard shortcuts support

---

## 🔐 Security Architecture

### **Encryption Flow:**

```
┌─────────────┐
│   User A    │
└──────┬──────┘
       │ Plain text: "Hello World"
       │
       ▼
┌─────────────────────────┐
│   Encryption Service    │
│  • Generate IV          │
│  • AES-256 Encrypt      │
│  • Generate HMAC        │
└──────────┬──────────────┘
           │ Encrypted Data + IV + HMAC
           │
           ▼
┌─────────────────────────┐
│   MongoDB Storage       │
│  (Encrypted blob)       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   User B Receives       │
│  • Fetch encrypted data │
│  • Verify HMAC          │
│  • Decrypt with key     │
└──────────┬──────────────┘
           │
           ▼
   "Hello World" (Plain text)
```

### **Key Management:**

- Per-user encryption keys stored securely
- Shared keys derived from user pair (deterministic)
- Automatic rotation every 24 hours
- Key versioning for backward compatibility
- Secure key storage with metadata

---

## 🛠️ Technology Stack

### **Frontend**

```javascript
{
  "framework": "React 18",
  "styling": "TailwindCSS + DaisyUI",
  "stateManagement": "Zustand",
  "routing": "React Router v6",
  "http": "Axios",
  "realtime": "Socket.io Client",
  "icons": "Lucide React",
  "notifications": "React Hot Toast",
  "build": "Vite"
}
```

### **Backend**

```javascript
{
  "runtime": "Node.js 18+",
  "framework": "Express.js",
  "database": "MongoDB + Mongoose",
  "authentication": "JWT + bcryptjs",
  "encryption": "CryptoJS (AES-256)",
  "realtime": "Socket.io",
  "ai": "Google Generative AI (Gemini Pro)",
  "cloudStorage": "Cloudinary",
  "validation": "Express Validator"
}
```

### **Security & AI**

```javascript
{
  "encryption": "AES-256-CBC-HMAC",
  "keyDerivation": "PBKDF2",
  "authentication": "JWT",
  "hashing": "bcryptjs",
  "ai": "Google Gemini Pro",
  "cors": "Express CORS"
}
```

### **DevOps**

```javascript
{
  "hosting": "Render (Backend + Frontend)",
  "database": "MongoDB Atlas",
  "cdn": "Cloudinary",
  "versionControl": "Git/GitHub"
}
```

---

## 🚀 Quick Start

### **Prerequisites**

- Node.js v18 or higher
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key (free)
- Cloudinary account (free)

### **Installation**

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/NexusChat.git
cd NexusChat
```

2. **Install dependencies**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Environment Configuration**

Create `backend/.env` file:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nexuschat

# Server
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key
```

**Get API Keys:**

- MongoDB: [cloud.mongodb.com](https://cloud.mongodb.com)
- Cloudinary: [cloudinary.com](https://cloudinary.com)
- Gemini AI: [makersuite.google.com](https://makersuite.google.com/app/apikey)

4. **Run the application**

```bash
# Terminal 1: Start backend (from backend folder)
npm run dev

# Terminal 2: Start frontend (from frontend folder)
npm run dev
```

5. **Access the application**

```
Frontend: http://localhost:5173
Backend: http://localhost:5000
```

---

## 📸 Screenshots

> _Add your application screenshots here_

---

## 🏗️ Project Structure

```
NexusChat/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── ai.controller.js          # AI endpoints
│   │   │   ├── auth.controller.js        # Authentication
│   │   │   ├── message.controller.js     # Messaging
│   │   │   ├── group.controller.js       # Group chat
│   │   │   └── security.controller.js    # Encryption
│   │   ├── lib/
│   │   │   ├── aiService.js              # Gemini AI integration
│   │   │   ├── encryption.js             # AES-256 encryption
│   │   │   ├── keyManager.js             # Key management
│   │   │   ├── messageCleanup.js         # Message utilities
│   │   │   ├── socket.js                 # WebSocket server
│   │   │   └── cloudinary.js             # File uploads
│   │   ├── middleware/
│   │   │   └── auth.middleware.js        # JWT verification
│   │   ├── models/
│   │   │   ├── user.model.js             # User schema
│   │   │   ├── message.model.js          # Message schema
│   │   │   └── group.model.js            # Group schema
│   │   ├── routes/
│   │   │   ├── ai.route.js               # AI routes
│   │   │   ├── auth.route.js             # Auth routes
│   │   │   ├── message.route.js          # Message routes
│   │   │   ├── group.route.js            # Group routes
│   │   │   └── security.route.js         # Security routes
│   │   └── index.js                      # Express app
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SmartReplySuggestions.jsx # AI-powered replies
│   │   │   ├── ChatContainer.jsx         # Main chat UI
│   │   │   ├── GroupChatContainer.jsx    # Group chat UI
│   │   │   ├── SecuritySettings.jsx      # Encryption dashboard
│   │   │   ├── EmojiReactions.jsx        # Reaction system
│   │   │   └── ...
│   │   ├── store/
│   │   │   ├── useAuthStore.js           # Auth state
│   │   │   ├── useChatStore.js           # Chat state
│   │   │   ├── useGroupStore.js          # Group state
│   │   │   └── useThemeStore.js          # Theme state
│   │   ├── pages/
│   │   ├── lib/
│   │   └── App.jsx
│   └── package.json
│
├── render.yaml                            # Render deployment config
└── README.md
```

---

## 🔧 Configuration

### **MongoDB Setup**

1. Create MongoDB Atlas cluster
2. Whitelist IP: `0.0.0.0/0` (for development)
3. Create database user
4. Copy connection string to `.env`

### **Google Gemini API**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy key to `GEMINI_API_KEY` in `.env`
4. **Free tier:** 60 requests/minute, 1500 requests/day

### **Cloudinary Setup**

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get Cloud Name, API Key, and API Secret
3. Add to `.env` file

---

## 📱 API Documentation

### **Authentication**

```http
POST /api/auth/signup      # Register new user
POST /api/auth/login       # Login user
POST /api/auth/logout      # Logout user
GET  /api/auth/check       # Check auth status
PUT  /api/auth/update-profile  # Update profile
```

### **Messages**

```http
GET  /api/messages/users              # Get users for sidebar
GET  /api/messages/:userId            # Get messages with user
POST /api/messages/send/:userId       # Send message
POST /api/messages/reaction/:messageId # Add reaction
```

### **AI Features**

```http
POST /api/ai/smart-replies  # Generate AI suggestions
GET  /api/ai/status         # Get AI service status
```

### **Groups**

```http
GET  /api/groups                    # Get all groups
POST /api/groups/create             # Create new group
GET  /api/groups/:groupId/messages  # Get group messages
POST /api/groups/:groupId/send      # Send group message
POST /api/groups/:groupId/members   # Add members
```

### **Security**

```http
GET  /api/security/status           # Get encryption status
POST /api/security/rotate-key       # Rotate encryption key
POST /api/security/test             # Test encryption
```

---

## 🎨 Themes

Change themes in Settings page. Available themes:

**Light:** `light`, `cupcake`, `corporate`, `emerald`, `fantasy`, `lofi`, `pastel`, `wireframe`

**Dark:** `dark`, `synthwave`, `halloween`, `forest`, `black`, `luxury`, `dracula`, `night`, `coffee`

**Special:** `cyberpunk`, `retro`, `valentine`, `aqua`, `acid`, `lemonade`, `winter`, `dim`, `nord`, `sunset`

---

## 🚢 Deployment

### **Deploy to Render**

1. Push code to GitHub
2. Go to [Render](https://render.com)
3. Create new Blueprint
4. Connect GitHub repository
5. Render will detect `render.yaml` and deploy automatically

### **Environment Variables on Render**

All variables from `.env` need to be added in Render dashboard.

---

## 👨‍💻 About Developer

**Abhijeet Patil** - Full Stack Developer

This project demonstrates expertise in:

- ✅ Full-stack development (MERN)
- ✅ AI/ML integration (Google Gemini)
- ✅ Advanced cryptography & security
- ✅ Real-time systems (WebSockets)
- ✅ Cloud services & deployment
- ✅ Modern UI/UX design
- ✅ RESTful API design
- ✅ State management & optimization

---

## 📞 Contact

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/abhijeet-patil-b23b94228/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/abhijeetpatilrm)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

**Built with ❤️ by Abhijeet Patil**

© 2025 Abhijeet Patil. All Rights Reserved.

</div>
