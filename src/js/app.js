import ChatView from './ChatView';

const app = document.querySelector('#app');
const messages = new ChatView(app);
messages.render();
