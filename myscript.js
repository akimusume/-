function isMixed(inputString,type) {
	if(type=="magnet")
		if(inputString.search(/[0-9]/) >= 0 && (inputString.search(/[a-z]/) >= 0 || inputString.search(/[A-Z]/) >= 0))
			return 1;
		else
			return 0;
	if(type=="pan")
		if(inputString.search(/[0-9]/) >= 0 && inputString.search(/[a-z]/) >= 0 && inputString.search(/[A-Z]/) >= 0)
			return 1;
		else
			return 0;
}


var doMatch = false;
chrome.runtime.sendMessage({ order: "getUrlMatch" }, function (urlMatch) {
	console.log(urlMatch);
	var url = document.URL;
	console.log(document.URL);
	doMatch = urlMatch.defaultMatch;
	for (var i = 0; i < urlMatch.match.length; i++) {
		if (url.search(urlMatch.match[i]) >= 0) {
			doMatch = true;
			break;
		}
	}
	for (var i = 0; i < urlMatch.unMatch.length; i++) {
		if (url.search(urlMatch.unMatch[i]) >= 0) {
			doMatch = false;
			break;
		}
	}
	if (doMatch) {
		console.log("开始识别");
		var theHTML = document.getElementsByTagName("html");

		var doReplace=1;
		if(document.URL.search("www.hacg.")>=0&&theHTML[0].innerHTML.search('<a href="#">')>=0)
			doReplace=0;
		console.log(doReplace);

		var magnetRE = new RegExp("[A-Z0-9]{40}|[a-z0-9]{40}[\n\r \<]", "g");
		var partOfmagnetRE= new RegExp("[^a-zA-Z0-9\b]([A-Z0-9]{10,30}|[a-z0-9]{10,30})[^a-zA-Z0-9\b]", "g");
		var panRE = new RegExp("[^a-zA-Z0-9][a-zA-Z0-9]{8}[\n\r \#\<]", "g");
		var magnetLinks = new Array();
		var panLinks = new Array();
		var panLink = { core: " ", link: " ", password: " " };
		var i = 0;
		var date = new Date();
		var dateString = date.getFullYear() + "/"
			+ (date.getMonth() + 1) + "/"
			+ date.getDate() + " "
			+ date.getHours() + ":"
			+ date.getMinutes() + ":"
			+ date.getSeconds();
		console.log(dateString);

		for (i = 0;; i++) {
			if(i>50)
				break;
			magnetLinks[i] = { hash: "", link: "" };
			magnetLinks[i].hash = magnetRE.exec(theHTML[0].innerHTML);
			console.log(magnetLinks[i].hash);
			
			if (magnetLinks[i].hash&&magnetLinks[i].hash!="") 
			{
				
				
				if (!isMixed(magnetLinks[i].hash.toString(),"magnet")) 
				{
					i--;
					continue;
				}
				var temp=theHTML[0].innerHTML.substr(magnetRE.lastIndex-magnetLinks[i].hash.toString().length+40,10);
				magnetLinks[i].hash = magnetLinks[i].hash.toString().substr(0, 40);
				if(i>0)
				{console.log(magnetLinks[i].hash);
				console.log(magnetLinks[i-1].hash);}
				if(i>0&&magnetLinks[i].hash==magnetLinks[i-1].hash)
				{console.log(2);
//					magnetRE.lastIndex += 40;
					i--;
					continue;
				}
				console.log(magnetLinks[i].hash);
				console.log(theHTML[0].innerHTML.substr(magnetRE.lastIndex-50,100));
				console.log(temp);
				magnetLinks[i].link = '<a target="blank" href="magnet:?xt=urn:btih:' + magnetLinks[i].hash + '">magnet:?xt=urn:btih:' + magnetLinks[i].hash + '</a>';
				if(doReplace)
				{
					theHTML[0].innerHTML = theHTML[0].innerHTML.replace(magnetLinks[i].hash+temp, magnetLinks[i].link+temp);
					magnetRE.lastIndex += 109;
				}

			}
			else
				break;
		}

		while(1)
		{
			var part1="",part2="",locOfPart1,locOfPart2;
			part1=partOfmagnetRE.exec(theHTML[0].innerText);
			if(part1)
				{
					console.log(part1);
					//part1=part1.toString().substr(1,part1.toString().length-2);
					locOfPart1=partOfmagnetRE.lastIndex;
					console.log(locOfPart1);
					if(!isMixed(part1.toString(),"magnet"))
						continue;
				}
			else
				break;
			part2=partOfmagnetRE.exec(theHTML[0].innerText);
			if(part2)
				{
					console.log(part2);
					//part2=part2.toString().substr(1,part2.toString().length-2);
					locOfPart2=partOfmagnetRE.lastIndex;
					console.log(locOfPart2);
					if(!isMixed(part2.toString(),"magnet"))
					continue;
				}
			else
				break;
			console.log(part1[1].toString().length+part2[1].toString().length);
			console.log(magnetLinks.length);
			if((part1[1].toString().length+part2[1].toString().length)!=40&&(part1[1].toString().length+part2[1].toString().length)!=32)
				continue;
			else
			{
				magnetLinks[i].hash=part1[1]+part2[1];
				magnetLinks[i].link = '<a target="blank" href="magnet:?xt=urn:btih:' + magnetLinks[i].hash + '">magnet:?xt=urn:btih:' + magnetLinks[i].hash + '</a>';
				var temp=theHTML[0].innerText.substr(locOfPart1-part1[1].toString().length-1,locOfPart2-locOfPart1+part1[1].toString().length);
				console.log(temp);
				console.log(theHTML[0].innerHTML.search(temp));
				if(doReplace)
				{
					theHTML[0].innerHTML = theHTML[0].innerHTML.replace(temp, magnetLinks[i].link);
				}
				
				i++;
				magnetLinks[i] = { hash: "", link: "" };
			}
		}
	
		for (i = 0;; i++) {
			if(i>100)
				break;
			panLinks[i] = { core: "", link: "", password: "" };
			panLinks[i].core = panRE.exec(theHTML[0].innerHTML);
			console.log(panLinks[i].core);
			if (panLinks[i].core) {
				if(!isMixed(panLinks[i].core.toString(),"pan"))
				{
					i--;
					continue;
				}
				if(theHTML[0].innerHTML.substr(panRE.lastIndex-panLinks[i].core.toString().length-3,3)=="var")
				{
					i--;
					continue;
				}				
				panLinks[i].core = panLinks[i].core.toString().substr(1, 8);
				if(i>0)
				{console.log(panLinks[i].core);
				console.log(panLinks[i-1].core);}
				if(i>0&&panLinks[i].core==panLinks[i-1].core)
				{
//					panRE.lastIndex += 8;
					i--;
					continue;
				}
				console.log(panLinks[i].core);
				var temp=theHTML[0].innerHTML.substr(panRE.lastIndex-panLinks[i].core.toString().length+9,10);
				console.log(temp);
				if(theHTML[0].innerHTML.substr(panRE.lastIndex-1, 1)==" ")
					panLinks[i].password = theHTML[0].innerHTML.substr(panRE.lastIndex+1, 4);
				console.log(panLinks[i].password);
				if (panLinks[i].password.search(/[0-9a-z]{4}/) != 0)
					panLinks[i].password = "";
				panLinks[i].link = '<a target="blank" href="http://pan.baidu.com/s/' + panLinks[i].core + '">http://pan.baidu.com/s/' + panLinks[i].core + '</a>';
				console.log(panLinks[i].link);
				if(doReplace)
					{
						theHTML[0].innerHTML = theHTML[0].innerHTML.replace(panLinks[i].core+temp, panLinks[i].link+temp);
						panRE.lastIndex += 83;
					}
				console.log(panLinks[i]);
				console.log(panRE.lastIndex);
			}
			else
				break;	
		}

		if (magnetLinks[1] || panLinks[1]) {
			console.log(magnetLinks);
			console.log(panLinks);
			chrome.runtime.sendMessage({
				order: "write",
				time: dateString,
				title: document.title,
				url: url,
				magnetLinks: magnetLinks,
				panLinks: panLinks,
			},
			function (response) {
				console.log(response);
			});
		}

	}

});