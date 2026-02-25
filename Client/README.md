# FoodBuzz Client

A modern, responsive food ordering and recipe discovery platform built with React and Vite.

## Features

- 🍽️ Browse and order from menu
- 📚 Discover and explore recipes
- 🛒 Shopping cart functionality
- ❤️ Favorite recipes and menu items
- 👤 User authentication and profiles
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🔔 Real-time notifications
- ⭐ Review and rating system

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4
- **Routing:** React Router DOM 6
- **State Management:** React Context API
- **Icons:** React Icons, Font Awesome
- **Animations:** Framer Motion
- **Charts:** Chart.js, React Chartjs 2

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd FoodBuzz/Client
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your backend API URL:

```
VITE_API_URL=https://your-backend-api.vercel.app
```

4. Start development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Preview Production Build

```bash
npm run preview
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard:
   - `VITE_API_URL` = Your backend API URL
4. Deploy

The app is configured with `vercel.json` for optimal deployment.

### Netlify

The app includes `netlify.toml` configuration for Netlify deployment.

## Project Structure

```
Client/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable components
│   ├── context/     # React Context providers
│   ├── data/        # Static data files
│   ├── hooks/       # Custom React hooks
│   ├── pages/       # Page components
│   ├── styles/      # CSS files
│   ├── utils/       # Utility functions
│   ├── App.jsx      # Main app component
│   └── main.jsx     # Entry point
├── .env             # Environment variables
├── index.html       # HTML template
├── package.json     # Dependencies
├── vercel.json      # Vercel configuration
└── vite.config.js   # Vite configuration
```

## Environment Variables

- `VITE_API_URL` - Backend API URL (required)
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version
- `VITE_ENABLE_ANALYTICS` - Enable analytics (true/false)
- `VITE_ENABLE_PWA` - Enable PWA features (true/false)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Design

The application is fully responsive and optimized for:

- Mobile devices (320px - 767px)
- Tablets (768px - 1023px)
- Desktops (1024px+)

## License

All Rights Reserved © 2025 FoodBuzz

## Support

For support, email foodbuzz@gmail.com
