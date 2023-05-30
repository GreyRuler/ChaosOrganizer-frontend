import ChatView from './ChatView';

window.hostWS = 'ws://localhost:3000';
window.host = 'http://localhost:3000';
// window.hostWS = 'wss://chaosorganizer.onrender.com';
// window.host = 'https://chaosorganizer.onrender.com';

const app = document.querySelector('#app');
const messages = new ChatView(app);
messages.render();
