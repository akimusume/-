var content=document.getElementById("content");
chrome.runtime.sendMessage({order:"read"},function(response){
	console.log(response);
	content.innerHTML=response;
});
var date=new Date();
document.getElementById("cleanHistory").onclick=function(){
	content.innerHTML="";
	chrome.runtime.sendMessage({order:"cleanhistory"},function(response){
		console.log(response);
	});
};
document.getElementById("saveHistory").onclick=function saveHistory() {
	var dateString=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+"-"+date.getMinutes()+"-"+date.getSeconds();
	var blob = new Blob([document.getElementsByTagName("html")[0].innerText], {type: "text/plain;charset=utf-8"});
	saveAs(blob, "历史记录 "+dateString);
}
document.getElementById("saveMagnet").onclick=function saveMagnet() {
	chrome.runtime.sendMessage({order:"saveMagnet"},function(response){
	var dateString=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+"-"+date.getMinutes()+"-"+date.getSeconds();
	var blob = new Blob([response], {type: "text/plain;charset=utf-8"});
	saveAs(blob, "磁力链接 "+dateString);
	});
}