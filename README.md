# VocabUltra - Vocabulary Learning Application

A comprehensive full-stack web application for vocabulary learning, featuring word management, typing practice, quizzes, and personal notes with Google OAuth authentication.

## 🌟 Features

### Core Features
- **Dictionary Lookup**: Search and learn word meanings with bilingual support (English and Hindi)
- **Personal Word Collection**: Save and manage your vocabulary words
- **Interactive Quiz**: Test your vocabulary knowledge with timed quizzes
- **Typing Practice**: Improve typing speed with WPM tracking, ghost mode, and performance analytics
- **Personal Notes**: Create, manage, and organize notes with image upload support
- **User Authentication**: Secure authentication with Google OAuth and email verification
- **Theme Support**: Light/Dark mode toggle for comfortable reading
- **Responsive Design**: Mobile-optimized interface for learning on the go

### Advanced Features
- **Bloom Filter**: Efficient duplicate checking for usernames and emails
- **Performance Tracking**: Track typing speed progress over time with detailed graphs
- **Cloud Storage**: Image uploads powered by Cloudinary
- **Toast Notifications**: Clean user feedback using react-hot-toast

## 🏗️ Project Structure

```
word_meaning/
├── client/                      # React frontend (Vite)
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── assets/             # Images and static files
│   │   ├── components/         # Reusable React components
│   │   │   ├── Auth/           # Authentication components
│   │   │   ├── Profile/        # User profile components
│   │   │   ├── Navbar.jsx      # Navigation bar
│   │   │   └── ThemeSwitcher.jsx
│   │   ├── context/            # React Context providers
│   │   │   ├── AuthContext.jsx # Authentication state
│   │   │   └── ThemeContext.jsx # Theme state
│   │   ├── pages/              # Page components
│   │   │   ├── Home.jsx        # Landing page
│   │   │   ├── Dictionary.jsx  # Word lookup
│   │   │   ├── MyWords.jsx     # Saved words
│   │   │   ├── Quiz.jsx        # Quiz functionality
│   │   │   ├── TypingPractice.jsx # Typing test
│   │   │   ├── Notes.jsx       # Personal notes
│   │   │   ├── Login.jsx       # Authentication
│   │   │   └── VerifyEmail.jsx # Email verification
│   │   ├── utils/              # Utility functions
│   │   │   └── wordList.js     # Word data
│   │   ├── App.jsx             # Root component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── .env                    # Environment variables (client)
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   └── package.json            # Client dependencies
│
├── server/                      # Node.js/Express backend
│   ├── config/                 # Configuration files
│   │   ├── db.js               # MongoDB connection
│   │   └── cloudinary.js       # Cloudinary setup
│   ├── controllers/            # Route controllers
│   │   ├── authController.js   # Authentication logic
│   │   ├── wordController.js   # Word operations
│   │   └── noteController.js   # Notes operations
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # JWT authentication
│   │   └── upload.js           # File upload handling
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js             # User model
│   │   ├── Word.js             # Word model
│   │   └── Note.js             # Note model
│   ├── routes/                 # API routes
│   │   ├── auth.js             # Auth endpoints
│   │   ├── api.js              # Word endpoints
│   │   └── notes.js            # Notes endpoints
│   ├── utils/                  # Utility functions
│   │   ├── BloomFilter.js      # Bloom filter implementation
│   │   └── sendEmail.js        # Email service
│   ├── uploads/                # Uploaded files (local)
│   ├── .env                    # Environment variables (server)
│   ├── server.js               # Entry point
│   └── package.json            # Server dependencies
│
├── .gitignore                  # Git ignore rules
└── package.json                # Root package.json (scripts)
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas)
- **Google OAuth Credentials** (for authentication)
- **Cloudinary Account** (for image uploads)
- **Email Service** (for email verification)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd word_meaning
```

2. **Install all dependencies**
```bash
npm run install-all
```

This command installs dependencies for:
- Root package (concurrently)
- Server (Express, MongoDB, etc.)
- Client (React, Vite, etc.)

### Environment Variables

#### Server (.env in `/server`)
Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:5173
```

#### Client (.env in `/client`)
Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Running the Application

#### Development Mode (Both Client & Server)
```bash
npm start
```

This runs both the frontend and backend concurrently:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

#### Run Client Only
```bash
npm run client
```

#### Run Server Only
```bash
npm run server
```

#### Production Build
```bash
# Build the client
cd client
npm run build

# Start the server
cd ../server
npm start
```

## 📦 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Recharts** - Charts for typing analytics
- **@react-oauth/google** - Google authentication
- **jwt-decode** - JWT token decoding
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google Auth Library** - OAuth integration
- **Nodemailer** - Email service
- **Multer** - File uploads
- **Cloudinary** - Cloud storage
- **CORS** - Cross-origin support
- **dotenv** - Environment variables

## 🔐 Authentication Flow

1. User signs up with email/password or Google OAuth
2. Email verification link sent to user's email
3. User clicks verification link
4. Account activated, user can now log in
5. JWT token stored for authenticated sessions
6. Bloom filter checks for duplicate usernames/emails

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /google` - Google OAuth login
- `GET /verify-email` - Email verification
- `GET /me` - Get current user

### Word Routes (`/api`)
- `GET /words` - Get user's saved words
- `POST /words` - Add new word
- `DELETE /words/:id` - Delete word
- `GET /words/search` - Search dictionary

### Notes Routes (`/api/notes`)
- `GET /` - Get all user notes
- `POST /` - Create new note
- `PUT /:id` - Update note
- `DELETE /:id` - Delete note
- `POST /upload` - Upload note image

## 🎯 Key Features Explained

### Bloom Filter
Implemented for efficient duplicate checking of usernames and emails before database queries, reducing unnecessary database load.

### Typing Practice
- Real-time WPM calculation
- Ghost mode to compete with previous best performance
- Detailed performance graphs using Recharts
- Session-based progress tracking
- Mobile-optimized input handling

### Cloud Image Storage
Notes support image uploads stored securely in Cloudinary with automatic optimization.

### Responsive Design
Fully responsive UI with mobile-first approach, ensuring seamless experience across devices.

## 🛠️ Development

### Code Structure Guidelines
- Components are organized by feature/functionality
- Context providers for global state (Auth, Theme)
- Protected routes require authentication
- Error handling with toast notifications

### Adding New Features
1. Create necessary models in `/server/models`
2. Add controllers in `/server/controllers`
3. Define routes in `/server/routes`
4. Create React components in `/client/src/components` or `/client/src/pages`
5. Update navigation in `Navbar.jsx` and `App.jsx`

