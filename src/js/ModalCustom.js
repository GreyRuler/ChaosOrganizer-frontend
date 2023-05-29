import Modal from 'bootstrap/js/dist/modal';

export default class ModalCustom extends Modal {
	static get selectorModal() {
		return '.modal';
	}

	static get selectorCoordinates() {
		return '#coordinates';
	}

	static get selectorSaveBtn() {
		return '#save-btn';
	}

	constructor(element, options) {
		super(element, options);
		this.coordinatesInput = this._element.querySelector(
			ModalCustom.selectorCoordinates,
		);
		this.saveBtn = this._element.querySelector(
			ModalCustom.selectorSaveBtn,
		);
		this.registerEvents();
	}

	registerEvents() {
		this.coordinatesInput.addEventListener('input', () => {
			if (this.coordinatesInput.checkValidity()) {
				this.coordinatesInput.classList.remove('is-invalid');
			} else {
				this.coordinatesInput.classList.add('is-invalid');
			}
		});

		this._element.addEventListener('hide.bs.modal', () => {
			this.saveBtn.removeEventListener('click', this.onHandleSave);
		});
	}

	getCoords() {
		return new Promise((resolve) => {
			this.onHandleSave = () => {
				this.handlerSave(resolve);
			};
			this.saveBtn.addEventListener('click', this.onHandleSave);
		});
	}

	handlerSave(resolve) {
		if (this.coordinatesInput.checkValidity()) {
			const coords = this.coordinatesInput.value.split(', ');
			this.coordinatesInput.value = '';
			this.hide();
			this.saveBtn.removeEventListener('click', this.onHandleSave);
			resolve(`${coords[0]} ${coords[1]}`);
		} else {
			this.coordinatesInput.classList.add('is-invalid');
		}
	}
}
