// eslint-disable-next-line import/prefer-default-export
export function convertTextToLinks(text) {
	const urlPattern = /\bhttps?:\/\/\S+/gi;
	return text.replace(urlPattern, function (url) {
		return `<a href="${url}" target="_blank">${url}</a>`;
	});
}
