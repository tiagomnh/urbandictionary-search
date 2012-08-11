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
	var $response = $(response);

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
			"definition": handleLinks($response.find(".definition").eq(index).html()),
			"example": handleLinks($response.find(".example").eq(index).html()),
			"tags": tags
		}

		results.push(result);
	}

	// currently only the first one is displayed
	displayInformation(results[0]);
}

function insertInfoRow(type, label, content) {
	var $row = $("<tr>").addClass(type);
	$row.append($("<td>").addClass("label").html(label));
	$row.append($("<td>").addClass("content").html(content));
	$("#resultInfo").append($row);
}

function displayInformation(fields) {
	$("#resultInfo").hide();
	$("#resultInfo").empty();

	var $expression = $("<a>").attr("href", fields["href"]).html(fields["expression"]);
	var $expressionCell = $("<td>").attr("colspan", 2).html($expression);
	var $expressionRow = $("<tr>").addClass("expression").html($expressionCell);
	$("#resultInfo").append($expressionRow);

	insertInfoRow("definition", "Definition", fields["definition"]);

	if (fields["example"].length > 0) {
		insertInfoRow("example", "Example", fields["example"]);
	}

	$("#resultInfo").fadeIn(250);
	$("#result").show();
}

function displayMessage(message) {
	$("#resultInfo").hide();
	$("#resultInfo").empty();

	insertInfoRow(message["type"], message["label"], message["content"]);

	$("#resultInfo").fadeIn(250);
	$("#result").show();
}

function handleLinks(html) {
	// right now the anchors are being removed
	// later on I want to convert them to search links
	var tempDiv = $("<div>").html(html);
	tempDiv.find("a").contents().unwrap();
	return tempDiv.html();
}

$(window).load(function() {
	$("#searchInput").focus();

	chrome.extension.onRequest.addListener(function(selection) {
		search(selection);
	});

	chrome.tabs.executeScript(null, { file: "/js/request.js" });

	$("#searchInput").keypress(function(e) {
		// if pressed key == 'Enter'
		var key = e.keyCode || e.which;
        if (key == 13) {
			handleFormSubmit($("#searchInput").val());
        }
    });
});
