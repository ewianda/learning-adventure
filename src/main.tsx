
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const REQUIRED_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_GEMINI_API_KEY',
];

const missingEnvKeys = REQUIRED_ENV_KEYS.filter((key) => {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  return !value || value.trim().length === 0;
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}
const appRoot = rootElement as HTMLElement;

if (missingEnvKeys.length) {
  appRoot.innerHTML = `
    <div style="font-family: 'Nunito', system-ui, sans-serif; max-width: 600px; margin: 5rem auto; padding: 2rem; background: #fff1f2; border-radius: 1.5rem; border: 2px solid #f97316; color: #0f172a;">
      <h1 style="font-size: 1.75rem; margin-bottom: 1rem;">Environment not configured</h1>
      <p style="margin-bottom: 1rem;">The preview build needs Firebase and Gemini credentials. Create a <code>.env.local</code> (or <code>.env.production</code>) file before running <code>pnpm preview</code>.</p>
      <p style="margin-bottom: 0.5rem; font-weight: 700;">Missing variables:</p>
      <ul style="margin-left: 1rem; margin-bottom: 1.5rem;">
        ${missingEnvKeys.map((key) => `<li><code>${key}</code></li>`).join('')}
      </ul>
      <p>See the README for the full setup guide.</p>
    </div>
  `;
} else {
  bootstrap();
}

async function bootstrap() {
  const [{ default: App }, { AppProvider }] = await Promise.all([
    import('./App'),
    import('./hooks/useAppContext'),
  ]);

  const root = ReactDOM.createRoot(appRoot);
  root.render(
    <React.StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </React.StrictMode>,
  );
}
