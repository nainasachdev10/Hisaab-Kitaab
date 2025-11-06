# Hisab Kitab
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

## License

MIT

