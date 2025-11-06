# BHOLE Co Hisab Kitab

A modern cricket betting ledger calculator built with React, TypeScript, Vite, and Tailwind CSS.

🌐 **Live Demo**: [View on GitHub Pages](https://nainasachdev10.github.io/Hisaab-Kitaab/)

## Features

- 📊 Track customer exposures for cricket matches
- 💰 Calculate partner shares and totals
- 📈 Average odds calculations
- 🔄 Quick converter: Odds → Exposure
- 📥 CSV Import/Export functionality
- 🎨 Modern, responsive UI

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment

1. Push changes to the `main` or `master` branch
2. GitHub Actions will automatically build and deploy the app
3. The site will be available at `https://nainasachdev10.github.io/Hisaab-Kitaab/`

### Manual Deployment

To manually deploy:

1. Build the project:
   ```bash
   npm run build
   ```

2. The `dist` folder contains the production-ready files
3. Deploy the `dist` folder to your hosting service

### GitHub Pages Setup

1. Go to your repository settings
2. Navigate to "Pages" section
3. Select "GitHub Actions" as the source
4. The workflow will automatically deploy on every push to main/master branch

## Usage

1. **Set Team Names**: Enter names for Team A and Team B
2. **Add Customers**: Click "+ Add Customer" to add new rows
3. **Enter Exposures**: Fill in exposure values (negative = you lose if that team wins)
4. **Set Share %**: Enter your share percentage for each bet
5. **View Totals**: See automatic calculations for totals and average odds
6. **Use Converter**: Convert odds to exposures quickly
7. **Import/Export**: Save and load ledger data via CSV

## License

MIT

