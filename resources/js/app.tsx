import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Inventory & Sales System';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
       resolve: (name) => {
        const pages: Record<string, any> = import.meta.glob(['./Pages/**/*.tsx', './pages/**/*.tsx'], { eager: true });
        return pages[`./Pages/${name}.tsx`] || pages[`./pages/${name}.tsx`];
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#16a34a',
    },
});
