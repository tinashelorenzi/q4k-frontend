# Quest4Knowledge

A modern learning platform built with React, Vite, and Tailwind CSS. Embark on a journey of discovery and learning with our interactive educational platform.

## 🚀 Features

- **Interactive Learning**: Engage with dynamic content that adapts to your learning style
- **Progress Tracking**: Monitor your learning journey with detailed analytics and insights
- **Community**: Connect with fellow learners and share knowledge together
- **Modern UI**: Beautiful, responsive design built with Tailwind CSS
- **Fast Development**: Hot module replacement and fast builds with Vite

## 🛠️ Tech Stack

- **React 19** - Modern React with the latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - Automatic vendor prefixing

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quest4knowledge
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
quest4knowledge/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and other assets
│   ├── components/      # React components
│   ├── App.jsx          # Main App component
│   ├── App.css          # App-specific styles
│   ├── index.css        # Global styles with Tailwind
│   └── main.jsx         # Application entry point
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── README.md           # Project documentation
```

## 🎨 Customization

### Tailwind CSS Configuration

The project uses Tailwind CSS v4 with a custom configuration. You can modify the `tailwind.config.js` file to:

- Add custom colors, fonts, and spacing
- Configure responsive breakpoints
- Add custom plugins
- Extend the default theme

### Styling

The project includes:
- Custom component classes in `src/index.css`
- Responsive design with mobile-first approach
- Dark theme with gradient backgrounds
- Glassmorphism effects

## 🚀 Deployment

To build the project for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Bundled with [Vite](https://vitejs.dev/)
