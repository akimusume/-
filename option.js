defaultMatch=false;
var urlMatch=document.getElementById("urlMatch");
var urlUnMatch=document.getElementById("urlUnMatch");
var checkbox=document.getElementById("checkbox");
chrome.runtime.sendMessage({order:"getUrlMatch"},function(response){
	console.log(response);
	defaultMatch=response.defaultMatch;
	checkbox.checked=defaultMatch;
	var i=0;
	var a="";
	for(i=0;i<response.match.length;i++)
		{
			a=a+response.match[i]+"\n";
	console.log(urlMatch.innerText);
}
urlMatch.innerText=a;
	for(i=0;i<response.unMatch.length;i++)
		urlMatch.innerText+=response.unMatch[i]+"\n";
});
checkbox.onclick=function(){
	defaultMatch=checkbox.checked;
}

document.getElementById("saveOption").onclick=function(){
	chrome.runtime.sendMessage({
		order:"saveOption",
		urlMatch:urlMatch.value+"\n\n",
		urlUnMatch:urlUnMatch.value+"\n\n",
		defaultMatch:defaultMatch
	},function(response){
		console.log(response);
	});
};