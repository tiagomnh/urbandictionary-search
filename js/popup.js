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
	var $response = $(response)

	var numberOfResults = $response.find(".index").length;
	if (numberOfResults == 0) {
		displayMessage({
			type: "warning",
			label: "No results",
			content: "Try searching for something else.",
		});
		return;
	}

	var results = [];
	for (var index = 0; index < numberOfResults; index++) {

		var tags = [];
		// TODO: implement tag scraping

		var result = {
			"href": $.trim($response.find("td.index a").eq(index).attr("href")),
			"expression": $.trim($response.find("td.word").eq(index).html()),
			"definition": updateLinks($response.find(".definition").eq(index).html()),
			"example": updateLinks($response.find(".example").eq(index).html()),
			"tags": tags
		}

		results.push(result);
	}

	// currently only the first one is displayed
	displayInformation(results[0]);
}

function displayInformation(fields) {
	$("tr").hide();

	$("#expression > td").html(fields["expression"]);
	//$("#expression").attr("href", fields["expression_url"]);
	$("#expression").show();

	$("#definition > .content").html(fields["definition"]);
	$("#definition").show();

	$("#example > .content").html(fields["example"]);
	if ($("#example > .content").html().length > 0) {
		$("#example").show();
	}

	$("#tags > .content").empty();
	var tags = fields["tags"];
	if (tags.length > 0) {
		for (var i = 0; i < tags.length; i++) {
    		$("#tags > .content").append(tags[i]);
		}

		$("#tags").show();
	}

	$("#innerBody").fadeIn(250);
}

function displayMessage(message) {
	$("tr").hide();

	$("#message > .label").html($("<span>").addClass(message["type"]).html(message["label"]));
	$("#message > .content").html(message["content"]);

	$("#message").show();
	$("#innerBody").fadeIn(250);
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

