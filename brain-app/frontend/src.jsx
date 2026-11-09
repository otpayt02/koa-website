import React from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  return <main><p className="eyebrow">KAREN ORGANIZATION OF AMERICA</p><h1>Company Brain</h1><p className="lead">Your shared workspace is being prepared.</p><section><h2>Setup in progress</h2><p>Executive sign-in and the shared knowledge workspace have not been implemented yet. Please do not enter credentials here.</p><p>Inbox automation is reserved for the next phase.</p></section></main>;
}

createRoot(document.getElementById('root')).render(<App />);
