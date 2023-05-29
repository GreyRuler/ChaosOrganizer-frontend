export default class Message {
	static get selectorDate() {
		return '.date_message';
	}

	static get selectorText() {
		return '.text_message';
	}

	static get selectorFavouritesBtn() {
		return '.favourites';
	}

	static get markup() {
		return `
			<div class="message">
				<div class="message-container">
					<div class="title_message mute_text">
						<div class="date_message"></div>
					</div>
					<div class="text_message"></div>
				</div>
				<svg class="favourites favourites-message" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48" xml:space="preserve">
					<polygon points="11.7,44 14.9,29.9 4,20.5 18.4,19.2 24,6 29.6,19.2 44,20.5 33.1,29.9 36.4,44 24,36.5"/>
				</svg>
			</div>
		`;
	}

	constructor(container, message) {
		this.container = container;
		this.message = message;
	}

	bindToDOM() {
		this.container.innerHTML = Message.markup;
		const date = this.container.querySelector(Message.selectorDate);
		const textContainer = this.container.querySelector(Message.selectorText);
		const favouritesBtn = this.container.querySelector(Message.selectorFavouritesBtn);
		date.textContent = this.message.date;
		textContainer.innerHTML = this.message.text;
		favouritesBtn.dataset.id = this.message.id;
		if (this.message.favourites) favouritesBtn.classList.add('active');
	}
}
