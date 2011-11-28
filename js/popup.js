function handleFormSubmit(query) {
	if (query.length > 0) {
		search(query);
	} else {
		messageUser({
			message:"Write something in the text box and press 'Enter'.",
			type:"info",
			hide:true,
			hide_loading:true
		});
	}
}

function search(query) {
	$("#search_input").val(query);
	$("#loading_animation").show("scale");

	var url_query = replaceSpacesWithPlus(trim(query));
	var search_url = 'http://www.urbandictionary.com/define.php?term=' + url_query;
    
	$.ajax({
		url: search_url,
		success: function(data) {
			parseResponse(data);
		},
		error: function() {
			messageUser({
				message:"Error. <a href=\"javascript:search('" + query + "');\">Try again.</a>",
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
			message:"No results.",
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
	$("#definition").html(fields["definition"]);
	$("#example").html(fields["example"]);
	if ($("#example").html().length == 0) {
		$("#example").hide();
	} else {
		$("#example").show();
	}
	
	$("#tags").empty();
	var tags = fields["tags"];
	for (var i = 0; i < tags.length; i++) {
    	$("#tags").append(tags[i]);
	}
	
	$("#inner_body").show("highlight", {color:"#BBBBBB"});
	$("#loading_animation").hide("scale");
	//$("#loading_animation").css({"visibility":"hidden"})
	$("#message_box").hide();
}

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
		.show("highlight");	
}


function trim(s) {
	// removes leading and trailing spaces
	s = s.replace(/^\s+|\s+$/g, "");
	// removes repeated spaces in the middle of the string
	s = s.replace(/\s+/gi,' ');
	return s;
}
 
function replaceSpacesWithPlus(s) {
    return s.replace(/ /g, "+");
}

function removeScriptTags(s) {
	return s.replace("/<script(.|\s)*?\/script>/g", '');
}

// replaces links to other definitions with calls to function search()
function updateLinks(html) {
	return html.replace(/<a.+href=".*?".*>(.*?)<\/a>/gi, "<a class=\"tag\" href=\"javascript:search(\'$1\');\">$1</a>");
}

