import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const ReactDOM = {
    render(element, container) {
        const root = createRoot(container || document.getElementById('root'));
        root.render(element);
    }
};

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);