var linksHistory=new Array();
var emptyArray=new Array();
var test=new Array();
var urlMatch=new Array();
var urlUnMatch=new Array();
var dateString;
var num=0,i=0,j=0,k=0;
var popupContent="";
var magnetFile="";
var temp="";
var defaultMatch=false;
urlMatch[0]="www.hacg.li/";
function writePopup(link) {
	var i=0;
	temp=popupContent;
	popupContent="";
	popupContent+=link.time+"<br>";
	popupContent+='<a target="blank" href="'+link.url+'">'+link.title+'</a>'+"<br>";
	for(i=0;i<link.magnetLinks.length-1;i++)
		popupContent+=link.magnetLinks[i].link+"<br>";
	for(i=0;i<link.panLinks.length-1;i++)
		popupContent+=link.panLinks[i].link+" "+link.panLinks[i].password+"<br>";
	popupContent+="<br>";
	popupContent+=temp;
}

function writeMagnetFile(link) {
    var i=0;
    temp=magnetFile;
    magnetFile="";
    for(i=0;i<link.magnetLinks.length-1;i++)
        magnetFile+=("magnet:?xt=urn:btih:"+link.magnetLinks[i].hash+"\n");
    magnetFile+=temp;

}

chrome.browserAction.setBadgeText({text:""});
chrome.storage.local.get("history",function (result) {
	if(result.history)
	{
		linksHistory=result.history;
		for(i=0;i<linksHistory.length;i++)
			writePopup(linksHistory[i]);
	}
	
});

chrome.storage.local.get("urlMatch",function (result) {
	if(result.urlMatch)
	{
		urlMatch=result.urlMatch.match;
		urlUnMatch=result.urlMatch.unMatch;
        defaultMatch=result.urlMatch.defaultMatch;
	}
});

chrome.storage.local.get("popupContent",function (result) {
    if(result.popupContent)
        popupContent=result.popupContent;
});

chrome.storage.local.get("magnetFile",function (result) {
    if(result.magnetFile)
        magnetFile=result.magnetFile;
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.order == "write") {
        sendResponse("替换并传递成功");
        i=linksHistory.length;
        linksHistory[i] = message;
        writePopup(linksHistory[i]);
        writeMagnetFile(linksHistory[i]);
        i++;
        num += message.magnetLinks.length + message.panLinks.length - 2;
        chrome.browserAction.setBadgeText({ text: num.toString() });
        chrome.storage.local.set({ "history": linksHistory,"popupContent":popupContent,"magnetFile":magnetFile}, function () {
        });
        console.log(popupContent);
    }

    if (message.order == "read") {
        num = 0;
        chrome.browserAction.setBadgeText({ text: "" });
        sendResponse(popupContent);
    }

    if (message.order == "cleanhistory") {
        linksHistory = emptyArray;
        popupContent = "";
        magnetFile="";
        num = 0;
        i = 0;
        chrome.browserAction.setBadgeText({ text: "" });
        chrome.storage.local.remove("history", function () {});
        chrome.storage.local.remove("popupContent", function () {});
        chrome.storage.local.remove("magnetFile", function () {});
    }

    if (message.order == "getUrlMatch") {
        sendResponse({ 
            match: urlMatch, 
            unMatch: urlUnMatch, 
            defaultMatch: defaultMatch
        });
    }

    if (message.order == "saveOption") {
        defaultMatch = message.defaultMatch;
        urlMatch = [];
        urlUnMatch = [];
        for (j = 0; ; j++) {
            start = message.urlMatch.search("\n");
            if (start == 0 || j > 100) break;
            urlMatch[j] = message.urlMatch.substr(0, start);
            message.urlMatch = message.urlMatch.substr(start + 1);
        }
        for (j = 0; ; j++) {
            start = message.urlUnMatch.search("\n");
            if (start == 0 || j > 100) break;
            urlUnMatch[j] = message.urlUnMatch.substr(0, start);
            message.urlUnMatch = message.urlUnMatch.substr(start + 1);
        }
        chrome.storage.local.set({ "urlMatch": { "match": urlMatch, "unMatch": urlUnMatch,"defaultMatch":defaultMatch } }, function () {
        });
    }
    if (message.order == "saveMagnet") {    
        sendResponse(magnetFile);
    }
});
