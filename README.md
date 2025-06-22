# StyleSync 🎨

A modern, intelligent wardrobe management application that helps you organize your clothing, plan outfits, and get personalized style recommendations based on weather and your preferences.

[![StyleSync](https://img.shields.io/badge/StyleSync-Wardrobe%20Management-blue?style=for-the-badge&logo=react)](https://github.com/HarshaTalatala/stylesync)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9.1-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.10-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)


## 🌟 Features

### 👕 Wardrobe Management
- **Digital Closet**: Upload and organize your clothing items with photos
- **Smart Categorization**: Categorize items as Top, Bottom, Shoes, or Accessories
- **Color & Tag System**: Add colors and tags (Casual, Formal, Sporty, Seasonal) to your items
- **Search & Filter**: Easily find items by category, color, or tags
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 🎯 Outfit Planning
- **Outfit Creation**: Create and save outfit combinations from your wardrobe
- **Calendar Integration**: Plan outfits for specific dates and events
- **History Tracking**: Monitor your outfit history and preferences
- **Seasonal Planning**: Organize outfits for different seasons

### 📱 Modern User Experience
- **Intuitive Interface**: Clean, modern UI with smooth animations using Framer Motion
- **Real-time Updates**: Instant synchronization across browser tabs
- **Multi-tab Sync**: Stay logged in across browser tabs with automatic state management
- **Responsive Design**: Optimized for all device sizes

### 🔐 Secure Authentication
- **Firebase Authentication**: Secure user registration and login
- **Session Persistence**: Automatic login state management
- **Privacy Focused**: Your wardrobe data stays private and secure
- **Error Handling**: Robust error handling and user feedback

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form handling and validation
- **React Hot Toast** - User notifications

### Backend & Services
- **Firebase** - Authentication, Firestore database, and cloud storage
- **Firebase Storage** - Image upload and management
- **Azure Functions** - Serverless backend API (planned for future)

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Mocha & Chai** - Testing framework

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Firebase project setup

### 1. Clone the Repository
```bash
git clone https://github.com/HarshaTalatala/stylesync.git
cd stylesync
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```bash
cp env.template .env
```

Fill in your Firebase configuration:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Set up Firebase Storage with appropriate security rules
5. Copy your Firebase config to the `.env` file

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
StyleSync/
├── api/                    # Azure Functions backend (planned)
│   ├── deleteBlob/
│   ├── generateSas/
│   ├── health/
│   └── shared/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ConfirmDialog.jsx
│   │   ├── Navbar.jsx
│   │   └── OutfitCard.jsx
│   ├── context/           # React context providers
│   │   └── AuthContext.jsx
│   ├── pages/             # Page components
│   │   ├── CalendarView.jsx
│   │   ├── Dashboard.jsx
│   │   ├── History.jsx
│   │   ├── LandingPage.jsx
│   │   ├── Login.jsx
│   │   ├── PlanOutfit.jsx
│   │   ├── Settings.jsx
│   │   ├── Signup.jsx
│   │   └── Wardrobe.jsx
│   ├── services/          # API and external services
│   │   ├── firebase.js
│   │   ├── plannerService.js
│   │   └── wardrobeService.js
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles
├── .env.template         # Environment variables template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.js        # Vite build configuration
```

## 🎯 Usage Guide

### Getting Started
1. **Sign Up**: Create a new account with your email and password
2. **Add Items**: Start by adding your clothing items to your digital wardrobe
3. **Organize**: Categorize and tag your items for easy searching
4. **Plan Outfits**: Use the outfit planner to create combinations
5. **Track**: Monitor your outfit history and preferences

### Key Features

#### Wardrobe Management
- Upload photos of your clothing items (JPG, PNG, GIF up to 5MB)
- Add descriptions, colors, and tags
- Filter items by category, color, or tags
- Delete items you no longer own
- Responsive grid layout for all screen sizes

#### Outfit Planning
- Create outfit combinations from your wardrobe
- Plan outfits for specific dates
- Save favorite combinations
- Track outfit history

#### Calendar View
- Schedule outfits for upcoming events
- Track what you've worn
- Plan seasonal wardrobes

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style
- Follow ESLint configuration
- Use functional components with hooks
- Implement proper error handling
- Write meaningful commit messages

### Testing
```bash
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
```

## 🚀 Deployment

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Azure Static Web Apps (Recommended)
1. Connect your GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy automatically on push

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase** for authentication and database services
- **Tailwind CSS** for the beautiful UI framework
- **React Community** for the amazing ecosystem
- **Framer Motion** for smooth animations
- **React Hook Form** for form management
- **React Hot Toast** for notifications

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/HarshaTalatala/stylesync/issues)
- **Discussions**: [GitHub Discussions](https://github.com/HarshaTalatala/stylesync/discussions)

## 🔮 Roadmap

### Upcoming Features
- [ ] Weather API integration for outfit recommendations
- [ ] AI-powered outfit suggestions
- [ ] Social sharing features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and insights
- [ ] Integration with fashion retailers
- [ ] Virtual try-on features
- [ ] Outfit export and sharing

### Version History
- **v0.1.0** - Initial release with basic wardrobe management
- **v0.2.0** - Added outfit planning and calendar features
- **v0.3.0** - Enhanced UI/UX and mobile responsiveness
- **v0.4.0** - Multi-tab synchronization and improved auth

---

**Made with ❤️ by the StyleSync Team**

*Transform your wardrobe management experience with StyleSync - where style meets simplicity.* 