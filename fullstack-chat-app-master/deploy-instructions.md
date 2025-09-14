# 🚀 Deployment Instructions

## Backend Deployment (Railway)

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose `backend` folder as root directory
6. Add environment variables:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
   - `PORT` - 5000

### 3. Get Railway URL
After deployment, copy your Railway URL (e.g., `https://your-app.railway.app`)

## Frontend Deployment (Netlify)

### 1. Deploy to Netlify
1. Go to [Netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Select your repository
5. Set build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

### 2. Add Environment Variables
In Netlify dashboard → Site settings → Environment variables:
- `VITE_API_URL` - Your Railway backend URL (e.g., `https://your-app.railway.app/api`)

### 3. Redeploy
After adding environment variables, trigger a new deploy.

## Testing
1. Test your deployed frontend URL
2. Try logging in and sending messages
3. Check if Socket.io connections work
4. Test file uploads and group chats

## Troubleshooting
- If Socket.io doesn't work, check CORS settings
- If file uploads fail, verify Cloudinary credentials
- If database connection fails, check MongoDB URI

