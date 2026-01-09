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
- **🎬 Present Mode**: 
  - Slideshow-style presentation of elements
  - Quick ranking with keyboard shortcuts
  - Auto-advance and manual navigation
  - Immersive full-screen experience
- **📸 Export Functionality**: 
  - Export tier rankings as high-quality PNG or JPEG images
  - Professional layout with headers, footers, and branding
  - Automatic timestamp and generation info
- **🎨 Modern UI Design**: Clean, documentation-style interface with sidebar navigation
- **📱 Responsive Layout**: Optimized for both desktop and mobile devices

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

### Present Mode
1. Click the "🎬 Present Mode" button in the sidebar or main controls
2. Elements will be displayed one by one in full-screen slideshow format
3. Use navigation controls or keyboard shortcuts:
   - **Arrow Keys**: Navigate between elements
   - **Number Keys (1-5)**: Quick rank to corresponding tier
   - **Space**: Next element
   - **S**: Skip current element
   - **Escape**: Exit present mode
4. Click tier buttons to instantly rank the current element
5. Toggle auto-advance for hands-free presentation
6. Progress bar shows completion status

### Export Rankings
1. Click the "📸 Export Image" button in the sidebar or main controls
2. Choose from the available options:
   - **Preview PNG/JPEG**: See how the exported image will look before downloading
   - **Export PNG/JPEG**: Directly export without preview
3. In preview mode:
   - Review the generated image with professional layout
   - Check image dimensions and element count
   - Confirm export or cancel if adjustments are needed
4. Exported images include professional headers, timestamps, and branding

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
│   │   ├── exportManager.js # Image export functionality
│   │   ├── presentMode.js  # Slideshow presentation mode
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