# StyleSync - AI-Powered Wardrobe Management

A modern web application for intelligent wardrobe management and outfit planning using AI.

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/YOUR_USERNAME/StyleSync.git
cd StyleSync
npm install
```

### 2. Environment Setup
```bash
# Copy the environment template
cp env.template .env

# Edit .env with your Firebase configuration
# Get these values from your Firebase project console
```

### 3. Run Locally
```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

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

### Hosting
- **Azure Static Web Apps** - Frontend hosting with global CDN
- **Azure Functions** - Serverless backend API

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
   
   # Install backend dependencies (for local development)
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

### Frontend - Azure Static Web Apps
The frontend is automatically deployed to Azure Static Web Apps via GitHub Actions.

### Backend - Azure Functions
The backend is deployed as Azure Functions for serverless execution.

**📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.**

## 📁 Project Structure

```
StyleSync/
├── src/                    # Frontend source code
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── services/          # API and Firebase services
│   └── context/           # React context providers
├── backend/               # Backend Azure Functions (local development)
│   ├── functions/         # Azure Function handlers
│   └── shared/            # Shared utilities
├── .github/               # GitHub Actions workflows
├── staticwebapp.config.json # Azure Static Web Apps configuration
└── docs/                  # Documentation
```

## 🌟 Azure Benefits

- **Global CDN**: Fast loading worldwide
- **Built-in Authentication**: Easy user management
- **API Integration**: Seamless connection with Azure Functions
- **Custom Domains**: Professional URLs
- **SSL Certificates**: Automatic HTTPS
- **Preview Environments**: Test before production

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