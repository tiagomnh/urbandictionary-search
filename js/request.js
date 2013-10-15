// gets characters currently selected with mouse
var selection = window.getSelection().toString();

if (selection.length > 0) {
	chrome.extension.sendMessage(selection);
}