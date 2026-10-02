import { createInertiaApp } from '@inertiajs/react';
import ReactDOMServer from 'react-dom/server';

const appName = import.meta.env.VITE_APP_NAME || 'Inventory & Sales System';

export default function render(page: any) {
    return createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) => {
            const pages: Record<string, any> = import.meta.glob(['./Pages/**/*.tsx', './pages/**/*.tsx'], { eager: true });
            return pages[`./Pages/${name}.tsx`] || pages[`./pages/${name}.tsx`];
        },
        setup: ({ App, props }) => <App {...props} />,
    });
}
