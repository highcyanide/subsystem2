import { createInertiaApp } from '@inertiajs/react';
import ReactDOMServer from 'react-dom/server';

const appName = import.meta.env.VITE_APP_NAME || 'Inventory & Sales System';

export default function render(page: any) {
    return createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) => {
            const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true });
            return pages[`./Pages/${name}.tsx` as string];
        },
        setup: ({ App, props }) => <App {...props} />,
    });
}
