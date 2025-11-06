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

This project is configured for deployment on Vercel.

### Deploy to Vercel

#### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to complete deployment

#### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click "Add New Project"
3. Import your GitHub repository: `nainasachdev10/Hisaab-Kitaab`
4. Vercel will auto-detect Vite configuration
5. Click "Deploy"

### Automatic Deployments

Once connected to Vercel:
- Every push to `main` branch will trigger an automatic deployment
- Preview deployments are created for pull requests
- You can manage deployments from the Vercel dashboard

### Manual Deployment

To manually deploy:

1. Build the project:
   ```bash
   npm run build
   ```

2. The `dist` folder contains the production-ready files
3. Deploy the `dist` folder to your hosting service

## License

MIT
