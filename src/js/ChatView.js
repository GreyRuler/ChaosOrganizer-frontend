// eslint-disable-next-line import/no-extraneous-dependencies
import { sanitize } from 'dompurify';
import Message from './Message';
import { convertTextToLinks } from './util/convertTextToLinks';
import ModalCustom from './ModalCustom';

export default class ChatView {
	static get selectorMessageChat() {
		return '.input_chat';
	}

	static get selectorMessagesChat() {
		return '.messages_chat';
	}

	static get selectorSearchMessagesChat() {
		return '.messages_chat.search';
	}

	static get selectorFavouritesMessagesChat() {
		return '.messages_chat.favourites';
	}

	static get selectorChat() {
		return '.chat';
	}

	static get selectorImportBtn() {
		return '#import';
	}

	static get selectorExportBtn() {
		return '.export';
	}

	static get selectorSearchBtn() {
		return '.search';
	}

	static get selectorSearchInput() {
		return '.search + .form-control';
	}

	static get selectorLocationBtn() {
		return '.location';
	}

	static get selectorFavouritesBtn() {
		return '.favourites';
	}

	static get markup() {
		return `
			<div class="chat">
				<div class="d-flex justify-content-end flex-row" id="toolbar">
					<svg class="favourites" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48" xml:space="preserve">
						<polygon points="11.7,44 14.9,29.9 4,20.5 18.4,19.2 24,6 29.6,19.2 44,20.5 33.1,29.9 36.4,44 24,36.5"/>
					</svg>
					<div class="location"></div>
					<label class="import" for="import">
						<input type="file" id="import" class="d-none" accept=".json">
					</label>
					<div class="export"></div>
					<div class="input-group flex-nowrap w-auto">
						<span class="input-group-text search border-0"></span>
						<input type="text" class="form-control" placeholder="Поиск">
					</div>
				</div>
<!--				<div class="pin-message">-->
<!--					<div class="message flex-grow-1 me-1">-->
<!--						<div>Закреплённое сообщение</div>-->
<!--						<div class="text"></div>-->
<!--					</div>-->
<!--					<button type="button" class="btn-close"></button>-->
<!--				</div>-->
				<div class="messages_chat"></div>
				<div class="messages_chat search w-auto d-none"></div>
				<div class="messages_chat favourites d-none"></div>
				<textarea class="input_chat form-control" rows="1" autofocus></textarea>
			</div>
		`;
	}

	constructor(element) {
		this.element = element;
		this.count = 20;
	}

	render() {
		this.bindToDOM();
		this.registerEvents();
	}

	bindToDOM() {
		this.element.innerHTML = ChatView.markup;
		this.messagesChat = this.element.querySelector(
			ChatView.selectorMessagesChat,
		);
		this.searchMessagesChat = this.element.querySelector(
			ChatView.selectorSearchMessagesChat,
		);
		this.favouritesMessagesChat = this.element.querySelector(
			ChatView.selectorFavouritesMessagesChat,
		);
		this.messageInput = this.element.querySelector(
			ChatView.selectorMessageChat,
		);
	}

	registerEvents() {
		const chat = this.element.querySelector(
			ChatView.selectorChat,
		);
		const ws = new WebSocket('wss://chaosorganizer.onrender.com/ws');
		const importBtn = this.element.querySelector(ChatView.selectorImportBtn);
		const exportBtn = this.element.querySelector(ChatView.selectorExportBtn);
		const searchBtn = this.element.querySelector(ChatView.selectorSearchBtn);
		const searchInput = this.element.querySelector(ChatView.selectorSearchInput);
		const locationBtn = this.element.querySelector(ChatView.selectorLocationBtn);
		const favouritesBtn = this.element.querySelector(ChatView.selectorFavouritesBtn);

		ws.addEventListener('message', (e) => {
			const messages = JSON.parse(e.data);
			messages.forEach((message) => {
				this.addMessageToChatAndScroll(this.messagesChat, message);
			});
		});

		this.messageInput.addEventListener('input', () => {
			this.messageInput.style.height = ''; // Сбросить явно заданную высоту перед изменением содержимого
			this.messageInput.style.height = `${this.messageInput.scrollHeight}px`; // Установить высоту равной высоте содержимого
		});
		this.messageInput.addEventListener('keyup', async (event) => {
			if (event.key === 'Enter') {
				if (event.shiftKey) {
					// Перенос строки при удержании клавиши "Shift" и нажатии "Enter"
					this.messageInput.value += '\n';
				} else {
					const text = convertTextToLinks(
						sanitize(
							this.messageInput.value.trim(),
							{ ALLOWED_TAGS: ['a'] },
						),
					);
					if (!text) return;
					ws.send(JSON.stringify(text));
					this.messageInput.value = '';
				}
			}
		});

		chat.addEventListener('dragover', (event) => {
			event.stopPropagation();
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		});
		chat.addEventListener('drop', async (event) => {
			event.stopPropagation();
			event.preventDefault();
			const files = [...event.dataTransfer.files];
			const formData = this.prepareFiles(files);
			const { result } = await this.sendFiles(formData);

			result.forEach((text) => {
				this.addMessageToChatAndScroll(this.messagesChat, text);
			});
		});

		this.messagesChat.addEventListener('scroll', async () => {
			if (!this.messagesChat.scrollTop) {
				await this.loadMessages();
			}
		});

		importBtn.addEventListener('change', async () => {
			const formData = this.prepareFiles([...importBtn.files]);
			await fetch('https://chaosorganizer.onrender.com/import', {
				method: 'POST',
				body: formData,
			});
		});
		exportBtn.addEventListener('click', async () => {
			const filename = 'chaos-organizer-history.json';
			const response = await fetch('https://chaosorganizer.onrender.com/export');
			const json = await response.json();
			this.downloadObjectAsJson(json, filename);
		});
		searchBtn.addEventListener('click', () => searchInput.classList.toggle('show'));
		searchInput.addEventListener('input', async () => {
			if (searchInput.value.trim()) {
				const response = await fetch(`https://chaosorganizer.onrender.com/search/${searchInput.value}`);
				const json = await response.json();
				const { messages } = json;
				if (!messages.length) return;
				this.searchMessagesChat.innerHTML = '';
				messages.forEach((message) => {
					this.addMessageToChatAndScroll(this.searchMessagesChat, message);
				});
				this.messagesChat.classList.add('d-none');
				this.favouritesMessagesChat.classList.add('d-none');
				this.searchMessagesChat.classList.remove('d-none');
			} else {
				this.messagesChat.classList.remove('d-none');
				this.searchMessagesChat.classList.add('d-none');
			}
		});
		locationBtn.addEventListener('click', async () => {
			const coords = await this.getLocation();
			ws.send(JSON.stringify(coords));
		});
		favouritesBtn.addEventListener('click', async (event) => {
			const { target } = event;
			if (target.classList.contains('favourites')) {
				target.classList.toggle('active');
			}
			if (favouritesBtn.classList.contains('active')) {
				const response = await fetch('https://chaosorganizer.onrender.com/favourites');
				const json = await response.json();
				const { messages } = json;
				this.favouritesMessagesChat.innerHTML = '';
				messages.forEach((message) => {
					this.addMessageToChatAndScroll(this.favouritesMessagesChat, message);
				});
				this.favouritesMessagesChat.classList.remove('d-none');
				this.messagesChat.classList.add('d-none');
				this.searchMessagesChat.classList.add('d-none');
			} else {
				this.messagesChat.classList.remove('d-none');
				this.favouritesMessagesChat.classList.add('d-none');
				this.searchMessagesChat.classList.add('d-none');
			}
		});
		document.addEventListener('click', (event) => {
			const { target } = event;
			if (target.classList.contains('favourites-message')) {
				target.classList.toggle('active');
			}
		});
		document.addEventListener('click', async (event) => {
			const { target } = event;
			if (target.classList.contains('favourites-message')) {
				await fetch(`https://chaosorganizer.onrender.com/favourites/${target.dataset.id}`, {
					method: 'POST',
				});
			}
		});
	}

	addMessageToChatAndScroll(chat, message) {
		const messageObj = this.createMessage(message);
		chat.append(messageObj.container);
		chat.scrollTop = chat.scrollHeight;
	}

	prependAndScrollToBottom(messages) {
		const { scrollHeight } = this.messagesChat;
		messages.forEach((message) => {
			const messageObj = this.createMessage(message);
			this.messagesChat.prepend(messageObj.container);
		});
		this.messagesChat.scrollTop = this.messagesChat.scrollHeight - scrollHeight;
	}

	// eslint-disable-next-line class-methods-use-this
	createMessage(message) {
		const messageObj = new Message(document.createElement('div'), message);
		messageObj.bindToDOM();
		return messageObj;
	}

	async checkScroll(noMoreData) {
		if (this.messagesChat.scrollHeight <= this.messagesChat.clientHeight && !noMoreData) {
			await this.loadMessages();
		}
	}

	async loadMessages() {
		const response = await fetch(`https://chaosorganizer.onrender.com/messages/${this.count}`);
		const { messages, noMoreData } = await response.json();
		if (noMoreData) return;
		this.count += 10;
		this.prependAndScrollToBottom(messages);
		await this.checkScroll(noMoreData);
	}

	// eslint-disable-next-line class-methods-use-this
	prepareFiles(files) {
		const formData = new FormData();
		files.forEach((file) => {
			formData.append('file', file);
		});
		return formData;
	}

	// eslint-disable-next-line consistent-return,class-methods-use-this
	async sendFiles(formData) {
		try {
			const response = await fetch('https://chaosorganizer.onrender.com/upload', {
				method: 'POST',
				body: formData,
			});
			return await response.json();
		} catch (error) {
			// eslint-disable-next-line no-alert
			alert(`Ошибка:${error}`);
		}
	}

	// eslint-disable-next-line class-methods-use-this
	downloadObjectAsJson(exportObj, exportName) {
		const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportObj))}`;
		const downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute('href', dataStr);
		downloadAnchorNode.setAttribute('download', `${exportName}.json`);
		document.body.appendChild(downloadAnchorNode);
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	// eslint-disable-next-line class-methods-use-this
	getLocation() {
		return new Promise((resolve) => {
			navigator.geolocation.getCurrentPosition((data) => {
				resolve(`${data.coords.latitude} ${data.coords.longitude}`);
			}, function () {
				const modal = new ModalCustom(
					document.querySelector(ModalCustom.selectorModal),
				);
				modal.show();
				resolve(modal.getCoords());
			});
		});
	}
}
