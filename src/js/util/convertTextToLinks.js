export function convertTextToLinks(text) {
	let urlPattern = /\bhttps?:\/\/\S+/gi;
	return text.replace(urlPattern, function(url) {
		return '<a href="' + url + '" target="_blank">' + url + '</a>';
	});
}
