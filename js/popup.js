function handleFormSubmit(query) {
	if (query.length > 0) {
		search(query);
	} else {
		displayMessage({
			type: "information",
			label: "Information",
			content: "Use the search box to search for words or phrases.",
		});
	}
}

function search(query) {
	$("#searchInput").val(query);

	var searchUrl = 'http://www.urbandictionary.com/define.php';

	$.ajax({
		url: searchUrl,
		type: "GET",
		data: {
			'term': query
		},
		success: function(data) {
			parseResponse(data);
		},
		error: function() {
			displayMessage({
				type: "error",
				label: "Error",
				content: "There was an error.",
			});
		}
	});
}

function parseResponse(response) {
	var tempDiv = document.createElement('div');
    tempDiv.innerHTML = removeScriptTags(response);

    var indexes = tempDiv.getElementsByClassName('index');
	if (indexes.length == 0) {
		displayMessage({
			type: "warning",
			label: "No results",
			content: "Try searching for something else.",
		});
		return;
	}

	var urls = [];
	for (var i = 0; i < indexes.length; i++) {
		// second match is the expression's url on urbandictionary.com
		urls.push(indexes[i].innerHTML.match(/href=\"(.*?)\"/)[1]);
	}

    var words = tempDiv.getElementsByClassName('word');
    var definitions = tempDiv.getElementsByClassName('definition');
    var examples = tempDiv.getElementsByClassName('example');
    var tags = tempDiv.getElementsByClassName('greenery');

	var cleanTags = getTags(tags[0]);
	var elementTags = [];
    for (var i = 0; i < cleanTags.length; i++) {
        var tag = document.createElement('a');
        tag.className = 'tag';
        tag.href = "javascript:search(\"" + cleanTags[i] + "\");";
		tag.innerHTML = cleanTags[i];
		elementTags.push(tag);
    }

	var cleanFields = {
		expression: words[0].innerHTML,
		url: urls[0],
		definition: updateLinks(definitions[0].innerHTML),
		example: updateLinks(examples[0].innerHTML),
		tags: elementTags
	};

	displayInformation(cleanFields);
}

function getTags(rawTags) {
    var tags = rawTags.getElementsByClassName("urbantip");
    var cleanTags = [];

    for (var i = 0; i < tags.length - 1; i++) {
    	console.log(tags[i]);
        cleanTags.push(trim(tags[i].innerHTML));
    }

    return cleanTags;
}

function hideEverything() {
	$('#innerBody').hide();
	$('#expression').hide();
	$('tr').hide();
}

function clearMessage() {
	$("#message > .content").empty();
	$("#message > .label").empty();
	$("#message").hide();
}

function displayInformation(fields) {
	clearMessage();

	$("#expression > td").html(fields["expression"]);
	//$("#expression").attr("href", fields["expression_url"]);
	$("#expression").show();

	$("#definition > .content").html(fields["definition"]);
	$("#definition").show();

	$("#example > .content").html(fields["example"]);
	if ($("#example > .content").html().length == 0) {
		$("#example").hide();
	} else {
		$("#example").show();
	}

	$("#tags > .content").empty();
	var tags = fields["tags"];
	if (tags.length == 0) {
		$("#tags").hide();
	}
	else {
		for (var i = 0; i < tags.length; i++) {
    		$("#tags > .content").append(tags[i]);
		}
		$("#tags").show();
	}

	$("#innerBody").fadeIn(500);
}

function displayMessage(message) {
	$("#message > .label").html($("<span>").addClass(message["type"]).html(message["label"]));
	$("#message > .content").html(message["content"]);

	hideEverything();
	$("#message").show();
	$("#innerBody").fadeIn(500);
}

/*
 *	REGEXES
 */
function trim(s) {
	// removes leading and trailing spaces
	s = s.replace(/^\s+|\s+$/g, "");
	// removes repeated spaces in the middle of the string
	s = s.replace(/\s+/gi,' ');
	return s;
}

function removeScriptTags(s) {
	return s.replace("/<script(.|\s)*?\/script>/g", '');
}

// replaces links to other definitions with calls to function search()
function updateLinks(html) {
	return html.replace(/<a.+href=".*?".*>(.*?)<\/a>/gi, "<a class=\"tag\" href=\"javascript:search(\'$1\');\">$1</a>");
}

/*
 *	STARTUP
 */
$(window).load(function() {
	$("#searchInput").focus();

	chrome.extension.onRequest.addListener(function(selection) {
		search(selection);
	});

	chrome.tabs.executeScript(null, { file: "/js/request.js" });

	$('#searchInput').keypress(function(e) {
		// if pressed key == 'Enter'
		var key = e.keyCode || e.which;
        if (key == 13) {
			handleFormSubmit($("#searchInput").val());
        }
    });
});

