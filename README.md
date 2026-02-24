# DICTIONARY - English to Telugu Dictionary

A simple web application for English to Telugu translation with search history.

## Features
- ✅ Roll number authentication
- ✅ English to Telugu translation
- ✅ Word definitions and synonyms
- ✅ Search history tracking
- ✅ Admin panel for user management
- ✅ Password change functionality

## Quick Deploy to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy" (no configuration needed)
5. Wait for deployment to complete

### Step 3: Configure Firebase (Important!)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `dictionary-31851`
3. Go to **Realtime Database** → **Rules**
4. Copy and paste rules from `database.rules.json`
5. Click **Publish**

## Login Credentials

**Student Login:**
- Username: Any roll number (e.g., `23481A5467`)
- Password: Same as roll number (e.g., `23481A5467`)

**Admin Login:**
- Click "ADMIN" button on login page
- Default Password: `BHARATHI` (Change this after first login!)

## How to Use

1. **Login** with your roll number
2. **Search** for any English word
3. View **Telugu translation**, meaning, synonyms, and examples
4. Access **Storage** to see your search history
5. Visit **Profile** to see your statistics
6. **Change Password** from the home page

## Admin Features

- View all users and their statistics
- Add new users
- Edit user passwords
- Delete users
- View all search logs
- Clear search logs

## Technologies Used

- HTML5, CSS3, JavaScript
- Firebase Realtime Database
- Free Dictionary API
- Google Translate API (free tier)

## File Structure

```
DICTIONARY/
├── index.html          # Landing page
├── login.html          # Login page
├── home.html           # Main search page
├── profile.html        # User profile
├── storage.html        # Search history
├── admin.html          # Admin panel
├── script.js           # Main JavaScript
├── firebase-config.js  # Firebase setup
├── style.css           # Styling
├── vercel.json         # Vercel config
├── database.rules.json # Firebase rules
├── .gitignore          # Git ignore
├── .env.example        # Environment template
└── README.md           # This file
```

## Security Notes

⚠️ **Important**: This project uses Firebase with basic authentication. For production:

1. Enable Firebase Authentication
2. Upload `database.rules.json` to Firebase
3. Change default admin password
4. Consider using environment variables for sensitive data

## Support

For issues or questions, please create an issue on GitHub.

---

**Made with ❤️ for BHARATHI College Students**
