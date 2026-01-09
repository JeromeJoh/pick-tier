# 🏆 Pick Tier - Ranking Tool

A tier ranking web application similar to tier-maker website, for ranking and categorizing elements.

## ✨ Key Features

- **📁 Image Upload**: Support batch upload of images as ranking elements
- **🎯 Drag & Drop Ranking**: Intuitive drag-and-drop operations to move elements to different tier slots
- **⚙️ Custom Tiers**: 
  - Modify tier label names
  - Customize tier colors
  - Add/remove tiers
- **✏️ Element Management**: 
  - Edit element names and descriptions
  - Delete unwanted elements
- **🎨 Personalized Configuration**: Fully customizable tier styles and layouts

## 🚀 Quick Start

1. Clone the project locally
2. Start a local server in the project directory:
   ```bash
   # Using Python (recommended)
   python -m http.server 8000
   
   # Or using Node.js
   npx serve .
   
   # Or any other static file server
   ```
3. Open `http://localhost:8000` in your browser

## 📖 Usage Guide

### Upload Elements
1. Click the "📁 Upload Images" button
2. Select one or more image files
3. Images will appear in the "Elements Pool" at the bottom

### Ranking Operations
1. Drag elements from the pool to corresponding tier rows
2. Elements will automatically snap to tier slots
3. You can re-drag between different tiers to adjust

### Customize Tiers
1. Click the "⚙️ Configure Tiers" button
2. Modify tier label names
3. Choose tier colors
4. Add new tiers or delete existing ones

### Edit Elements
1. Hover over elements to show action buttons
2. Click "✏️" to edit element information
3. Click "❌" to delete elements

## 🛠️ Technical Features

- **Pure Native Technology**: Built with HTML5, CSS3, and JavaScript, no framework dependencies
- **Responsive Design**: Supports desktop and mobile devices
- **Smooth Animations**: CSS animations and transition effects
- **Intuitive Interactions**: Rich interactions including drag-drop, hover, click
- **Local Processing**: All data processed locally in browser, no server required

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🎯 Project Structure

```
pick-tier/
├── index.html              # Main page
├── src/
│   ├── js/
│   │   ├── main.js         # Application entry point
│   │   ├── tierMaker.js    # Main application class
│   │   ├── dragHandler.js  # Drag and drop functionality
│   │   ├── modalManager.js # Modal management
│   │   ├── renderer.js     # HTML rendering
│   │   └── utils.js        # Utility functions
│   └── css/
│       ├── base.css        # Base styles
│       └── styles.css      # Main styles
├── package.json            # Project configuration
└── README.md              # Documentation
```

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to improve this project!

## 📄 License

MIT License