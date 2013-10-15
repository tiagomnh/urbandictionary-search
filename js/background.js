function setDefaultSuggestion(text) {
    chrome.omnibox.setDefaultSuggestion({description: 'Search ' + text + ' on Urban Dictionary'});
}

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
    function(text, suggest) {
        setDefaultSuggestion(text);
    }
);

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
    function(text) {
        if (text.length > 0) {
            chrome.tabs.create({url: 'http://www.urbandictionary.com/define.php?term=' + text});

            // If Extension is also opened it will also search for the given tag
            // however it cannot open the Extension popup without user interaction
            // http://developer.chrome.com/extensions/faq.html#faq-open-popups
            chrome.extension.sendMessage(text);
        }
    }
);

setDefaultSuggestion('');