function handleFormSubmit(query) {
	if (query.length > 0) {
		search(query);
	} else {
		messageUser({
			message:"<b>info:</b> type something in the search box first",
			type:"info",
			hide:true,
			hide_loading:true
		});
	}
}

function search(query) {
	$("#search_input").val(query);
	$("#loading_animation").show("scale");

	var url_query = encodeURIComponent(trim(query));
	var search_url = 'http://www.urbandictionary.com/define.php?term=' + url_query;

	$.ajax({
		url: search_url,
		success: function(data) {
			parseResponse(data);
		},
		error: function() {
			messageUser({
				message:"<b>error:</b> <a href=\"javascript:search('" + query + "');\">try again</a>",
				type:"error",
				hide:true,
				hide_loading:true
			});
		}
	});
}

function parseResponse(response) {
	var tempDiv = document.createElement('div');
    tempDiv.innerHTML = removeScriptTags(response);

    var indexes = tempDiv.getElementsByClassName('index');
	if (indexes.length == 0) {
		messageUser({
			message:"<b>info:</b> no results.",
			type:"info",
			hide:true,
			hide_loading:true
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

	var clean_tags = getTags(tags[0]);
	var element_tags = [];
    for (var i = 0; i < clean_tags.length; i++) {
        var tag = document.createElement('a');
        tag.className = 'tag';
        tag.href = "javascript:search(\"" + clean_tags[i] + "\");";
		tag.innerHTML = clean_tags[i];
		element_tags.push(tag);
    }

	var clean_fields = {
		expression: words[0].innerHTML,
		url: urls[0],
		definition: updateLinks(definitions[0].innerHTML),
		example: updateLinks(examples[0].innerHTML),
		tags: element_tags
	};

	showInformation(clean_fields);
}

function getTags(raw_tags) {
    var tags = raw_tags.getElementsByClassName("urbantip");
    var clean_tags = [];

    for (var i = 0; i < tags.length - 1; i++) {
        clean_tags.push(trim(tags[i].innerHTML));
    }

    return clean_tags;
}

function showInformation(fields) {
	$("#expression").attr("href", fields["expression_url"]);
	$("#expression").html(fields["expression"]);
	$("#definition > .content").html(fields["definition"]);
	$("#example > .content").html(fields["example"]);
	if ($("#example > .content").html().length == 0) {
		$("#example").hide();
		$("#example").next().hide();
	} else {
		$("#example").show();
		$("#example").next().show();
	}

	$("#tags > .content").empty();
	var tags = fields["tags"];
	if (tags.length == 0) {
		$("#tags").hide();
		$("#tags").next().hide();
	}
	else {
		for (var i = 0; i < tags.length; i++) {
    		$("#tags > .content").append(tags[i]);
		}
		$("#tags").show();
		$("#tags").next().show();
	}

	$("#inner_body").show("fade", {color:"#BBBBBB"});
	$("#loading_animation").hide("scale");
	//$("#loading_animation").css({"visibility":"hidden"})
	$("#message_box").hide();
}

// hides definition body and presents the message passed in params
function messageUser(params) {
	if (params["hide"] == true) {
		$("#inner_body").hide();
	}
	if (params["hide_loading"] == true) {
		$("#loading_animation").hide("scale");
		//$("#loading_animation").css({"visibility":"hidden"})
	}

	$("#message_box")
		.addClass(params["type"])
		.html(params["message"])
		.show("fade");
}


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

// track access
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-27979301-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = '/js/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

$(window).load(function() {
	$("#search_input").focus();

	chrome.extension.onRequest.addListener(function(selection) {
		_gaq.push(['_trackEvent', 'Search', 'selection']);
		search(selection);
	});

	chrome.tabs.executeScript(null, { file: "/js/request.js" });

	$('#search_input').keypress(function(e) {
		// if pressed key == 'Enter'
		var key = e.keyCode || e.which;
        if (key == 13) {
			// tracks search event
			_gaq.push(['_trackEvent', 'Search', 'form']);

			$('#message_box').val('asdas');
			handleFormSubmit($("#search_input").val());
        }
    });
});
