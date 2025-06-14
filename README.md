
          
# Tinder for Jobs

A modern job search application that allows users to swipe through job listings, save favorites, and track applications - all with a familiar and intuitive interface inspired by popular dating apps.


## 🚀 Features

- **Swipe-based Job Discovery**: Quickly browse through job listings with an intuitive swipe interface
- **User Authentication**: Secure login and registration system
- **Resume Management**: Upload and manage your resume
- **Job Matching**: View jobs that match your skills and experience
- **Saved Jobs**: Keep track of jobs you're interested in
- **Application Tracking**: Mark jobs as applied and track your application status
- **Direct Application Links**: Easily apply to jobs through original job postings

## 🛠️ Technologies Used

- **Frontend**: React 18.2.0
- **UI Components**: Material UI 7.1.1
- **Authentication & Database**: Firebase 11.9.0
- **State Management**: React Hooks
- **API Integration**: JSearch API via RapidAPI
- **Swipe Functionality**: react-swipeable 7.0.2
- **HTTP Client**: Axios 1.9.0

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- RapidAPI account with access to JSearch API

## 🔧 Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/tinder-for-jobs.git
cd tinder-for-jobs
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure Firebase**

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password
   - Create a Firestore database
   - Set up Firebase Storage
   - Update the Firebase configuration in `src/services/firebase.js` with your project credentials

4. **Configure JSearch API**

   - Sign up for a RapidAPI account and subscribe to the JSearch API
   - Get your API key and update it in `src/services/jobApi.js`

5. **Start the development server**

```bash
npm start
```

## 🚀 Deployment

### Netlify Deployment

1. Create a Netlify account at [netlify.com](https://www.netlify.com/)
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Deploy your site

### Vercel Deployment

1. Create a Vercel account at [vercel.com](https://vercel.com/)
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel` in your project directory and follow the prompts
4. Or connect your GitHub repository through the Vercel dashboard

### Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize your project: `firebase init`
4. Select Firebase Hosting and configure as a single-page app
5. Build your project: `npm run build`
6. Deploy to Firebase: `firebase deploy`

## 📱 Application Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Jobs/           # Job listing and management components
│   └── Resume/         # Resume upload and management
├── services/
│   ├── firebase.js     # Firebase configuration and services
│   └── jobApi.js       # Job search API integration
└── App.js              # Main application component
```

## 🔍 How It Works

1. **User Authentication**: Users register or log in to access the application
2. **Resume Upload**: Users upload their resume to enable job matching
3. **Job Discovery**: The app fetches job listings from the JSearch API
4. **Swipe Interface**: Users swipe right to save jobs they're interested in or left to skip
5. **Saved Jobs**: Users can view their saved jobs, mark them as applied, or remove them
6. **Application**: Users can directly visit the job application page through provided links

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


---

Happy job hunting! 🎯

        
