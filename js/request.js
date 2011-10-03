var selection = window.getSelection().toString();

if (selection.length > 0) {
	chrome.extension.sendRequest(selection);
}