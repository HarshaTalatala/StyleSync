# StyleSync - AI-Powered Wardrobe Management

A modern web application for intelligent wardrobe management and outfit planning using AI.

## 🚀 Features

- **Smart Wardrobe Management**: Organize and categorize your clothing items
- **AI-Powered Outfit Planning**: Get intelligent outfit suggestions
- **Calendar Integration**: Plan outfits for specific dates
- **User Authentication**: Secure login and registration
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Authentication and database
- **React Router** - Client-side routing

### Backend
- **Azure Functions** - Serverless backend
- **Node.js** - JavaScript runtime
- **Firebase Admin SDK** - Database operations
- **Azure Storage** - File storage

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Azure CLI (for deployment)
- Firebase project

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd StyleSync
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Environment Setup**
   Create `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the application**
   ```bash
   # Start frontend (in root directory)
   npm run dev
   
   # Start backend (in backend directory)
   cd backend
   npm start
   ```

## 🚀 Deployment

### Frontend - GitHub Pages
The frontend is automatically deployed to GitHub Pages via GitHub Actions.

### Backend - Azure Functions
The backend is deployed as Azure Functions for serverless execution.

## 📁 Project Structure

```
StyleSync/
├── src/                    # Frontend source code
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── services/          # API and Firebase services
│   └── context/           # React context providers
├── backend/               # Backend Azure Functions
│   ├── functions/         # Azure Function handlers
│   └── shared/            # Shared utilities
├── .github/               # GitHub Actions workflows
└── docs/                  # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@stylesync.com or create an issue in this repository. 