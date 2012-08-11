function handleFormSubmit(query) {
	if (query.length > 0) {
		search(query);
	} else {
		display("message", {
			type: "information",
			label: "Information",
			content: "Use the search box to search for words or phrases.",
		});
	}
}

function search(query) {
	$("#search-icon").addClass("loading");
	$("#search-input").val(query);

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
			display("message", {
				type: "error",
				label: "Error",
				content: "There was an error.",
			});
		}
	});
}

function parseResponse(response) {
	var $response = $(response);

	var numberOfResults = $response.find(".index").length;
	if (numberOfResults == 0) {
		display("message", {
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
			"definition": handleLinks($response.find(".definition").eq(index).html()),
			"example": handleLinks($response.find(".example").eq(index).html()),
			"tags": tags
		}

		results.push(result);
	}

	// currently only the first one is displayed
	display("result", results[0]);
}

function insertInfoRow(type, label, content) {
	var $row = $("<tr>").addClass(type);
	$row.append($("<td>").addClass("label").html(label));
	$row.append($("<td>").addClass("content").html(content));
	$("#result-info").append($row);
}

function display(type, content) {
	$("#search-icon").removeClass("loading");
	$("#result-info").hide();
	$("#result-info").empty();

	if (type == "result") {
		displayResult(content);
	}
	else if (type == "message") {
		displayMessage(content);
	}

	$("#result-info").fadeIn(250);
	$("#result").show();
}

function displayResult(fields) {
	var $expression = $("<a>").attr("href", fields["href"]).html(fields["expression"]);
	var $expressionCell = $("<td>").attr("colspan", 2).html($expression);
	var $expressionRow = $("<tr>").addClass("expression").html($expressionCell);
	$("#result-info").append($expressionRow);

	insertInfoRow("definition", "Definition", fields["definition"]);

	if (fields["example"].length > 0) {
		insertInfoRow("example", "Example", fields["example"]);
	}
}

function displayMessage(message) {
	insertInfoRow(message["type"], message["label"], message["content"]);
}

function handleLinks(html) {
	// right now the anchors are being removed
	// later on I want to convert them to search links
	var tempDiv = $("<div>").html(html);
	tempDiv.find("a").contents().unwrap();
	return tempDiv.html();
}

$(window).load(function() {
	$("#search-input").focus();

	chrome.extension.onRequest.addListener(function(selection) {
		search(selection);
	});

	chrome.tabs.executeScript(null, { file: "/js/request.js" });

	$("#search-input").keypress(function(e) {
		// if pressed key == 'Enter'
		var key = e.keyCode || e.which;
        if (key == 13) {
			handleFormSubmit($("#search-input").val());
        }
    });
});
