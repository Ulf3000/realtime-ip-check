var Request 		= require("sdk/request").Request;
var prefs 			= require('sdk/simple-prefs').prefs;
var {viewFor}  		= require("sdk/view/core");
const { getNodeView } = require("sdk/view/core");
var browserWindows 	= require("sdk/windows").browserWindows;
var { setInterval, clearInterval } = require("sdk/timers");
var {ActionButton} = require("sdk/ui/button/action");
var ss 	= require("sdk/simple-storage");
var child_process = require("sdk/system/child_process");
const XHTML_NS = "http://www.w3.org/1999/xhtml";
const XUL_NS    = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
var interval = prefs["interval"] * 1000 ;
var oldip = [];
var newip = [];
var coLor = [];
var noIP = true;
var length = 4;
var oldLength = 0;
var oldResponseText = "gjhgkl";
const remoteHosts = ["http://curlmyip.net","http://ident.me","https://l2.io/ip","http://ipecho.net/plain","http://myip.dnsomatic.com","http://checkip.amazonaws.com","http://whatismyip.akamai.com"]
var Buttons = [];
if (!ss.storage.remoteHost)
	ss.storage.remoteHost = remoteHosts[0];
if (!ss.storage.extScript)	
	ss.storage.extScript = false;
if (!ss.storage.paused)
	ss.storage.paused = false;

var button = ActionButton({
    id: "ipbutton",
    label: ss.storage.remoteHost,
    icon: 		{
					"16": "./null.png",
					"32": "./null.png",
					"64": "./null.png",
				},
    onClick: function() {
		if (ss.storage.paused == false && noIP == false){
			for (let butt of Buttons) {
				var divs = butt.childNodes;
				for ( i=0; i < length ; i++){
					divs[i].style.backgroundColor = "#76d953";
					coLor[i] = "#76d953";
				}
			}
		}
    }
});

function pause(){
	//console.log(Buttons.length);
	oldResponseText = "jhaskldfhak"; //something different than ip :)
	for (let butt of Buttons) {
		var divs = butt.childNodes;
		for ( i=0; i < length ; i++){
			divs[i].style.backgroundColor = "#60c2da";
			divs[i].textContent = ".";
		};
	}
};
function buildContextMenu(lldoc){
	let oldPop;
	if( oldPop = lldoc.getElementById("IPBUTTONCONTEXTMENU")){
		lldoc.getElementById("mainPopupSet").removeChild(oldPop); // moved from on.upgrade to here
	};
	let ButContext = lldoc.createElementNS(XUL_NS,'menupopup');
	ButContext.setAttribute("id","IPBUTTONCONTEXTMENU");
	
	for (i=0;i<remoteHosts.length;i++){
		let item = lldoc.createElementNS(XUL_NS,"menuitem");
		item.setAttribute("id", "remoteHostsSelect");
		item.setAttribute("label", remoteHosts[i]);
		item.setAttribute("type", "radio");
		item.setAttribute("autocheck", "false"); // workaround for bug 
		if (remoteHosts[i] == ss.storage.remoteHost){
			item.setAttribute("checked", "true");
		}
		// items command
		item.addEventListener("command", function(e){
			ss.storage.remoteHost = e.target.label;
			button.label = ss.storage.remoteHost;
			ss.storage.extScript = false;
			for (let window of browserWindows) {
				let menuChildren = viewFor(window).document.getElementById("IPBUTTONCONTEXTMENU").childNodes;
				for (let menuChild of menuChildren) {
					if (menuChild.label == ss.storage.remoteHost) {
						menuChild.setAttribute("checked", "true");
					}
				}
			}
			IntervalSetter("c");
		},false);
		ButContext.appendChild(item); 
	};
	// one item for the external script
	let item = lldoc.createElementNS(XUL_NS,"menuitem");
	item.setAttribute("id", "scriptSelect");
	item.setAttribute("label", "External Script File");
	item.setAttribute("type", "radio");
	item.setAttribute("autocheck", "false")
	if(ss.storage.extScript == true) item.setAttribute("checked", "true");
	// item command
	item.addEventListener("command", function(e){
		ss.storage.remoteHost = e.target.label;
		button.label = ss.storage.remoteHost;
		ss.storage.extScript = true;
		for (let window of browserWindows) {
			viewFor(window).document.getElementById("scriptSelect").setAttribute("checked", "true");
		}
		IntervalSetter("c");
	},false);
	ButContext.appendChild(item);
	lldoc.getElementById("mainPopupSet").appendChild(ButContext); // should be injected there 


};

function running(window){ // constructing on startup and new window 
	let lldoc = viewFor(window).document;
	let lowlevelbutton = lldoc.getElementById("action-button--jid1-cxyk5vmbogaabqjetpack-ipbutton");
	lowlevelbutton.setAttribute('class', 'action-button');
	lowlevelbutton.onclick = function(e){ // pause 
		if(e.button == 1 || (e.button == 0 && e.ctrlKey)){ // on middleclick
			e.preventDefault();
			if(ss.storage.paused == false){
				ss.storage.paused = true;
				oldResponseText = "";
				IntervalSetter("b");
				pause();
			}else{
				ss.storage.paused = false;
				xxx(); 
				IntervalSetter("a");
			}
			}
	};
	// contextmenu
	lowlevelbutton.setAttribute('context', "IPBUTTONCONTEXTMENU");
	
	buildContextMenu(lldoc);
	// construct custom button with html nodes instead of xul nodes = easy styling
	for ( i=0; i < 8 ; i++){	
		let newButton = lldoc.createElementNS(XHTML_NS,'div');
		newButton.textContent = oldip[i];
		newButton.style.backgroundColor = coLor[i] ;
		newButton.style.color = "black"; ;
		newButton.style.textShadow = "none";
		newButton.style.height = "16px";
		newButton.style.alignItems = "center";
		newButton.style.padding = "1px 5px 0px 5px";
		newButton.style.fontFamily = "arial";
		newButton.style.borderRadius = "4px";
		if(i > 3) 
			newButton.style.display = "none";
		lowlevelbutton.appendChild(newButton);
	};
	Buttons.push(lowlevelbutton);
	if (ss.storage.paused == true) {pause()} ;//else {xxx()}};
};
exports.onUnload = function() {
	for (let window of browserWindows) {
	let lldoc = viewFor(window).document;
		lldoc.getElementById("mainPopupSet").removeChild(lldoc.getElementById("IPBUTTONCONTEXTMENU")); // remove it on unload 
	};
};

function getIP(newResponseText){
	if (newResponseText == oldResponseText) return; // if the same just return and do nothing lol
	if ( newResponseText == "") { // if no ip , connection down
		noIP = true;
		for (let butt of Buttons) {
			let divs = butt.childNodes;//viewFor(window).document.getElementById("action-button--jid1-cxyk5vmbogaabqjetpack-ipbutton").childNodes;
			for ( let div of divs ){
				div.textContent = "-";
				div.style.backgroundColor = "#d95353";
			}
		}
		oldResponseText = "";
		return;
	}
				
	oldResponseText = newResponseText;
	noIP = false;
				
	if(newResponseText.indexOf(':') != -1){   // ipv6 ?
		newip = newResponseText.split(':');
		length = newip.length;
		for (i=0;i<length ;i++){
			if (newip[i] == "") newip[i] = ":";
		}
	}else{ // ipv4 !
		newip = newResponseText.split(".");
		length = 4;
	}
				
	if (oldLength != length){ //hide / unhide based on length
		for (let butt of Buttons) {
			let divs = butt.childNodes;
			for ( i=0; i < length ; i++){
				divs[i].style.display = "block";
			}
			for ( i=length; i < 8 ; i++){
				divs[i].style.display = "none";
			}
		}
		oldLength = length;
	}
						
	for (let butt of Buttons) { // paste the ip values
		let divs = butt.childNodes;
		for ( i=0; i < length ; i++){
			if ( oldip[i] != newip[i]){
				divs[i].textContent = newip[i];
				divs[i].style.backgroundColor = "#d95353";
				coLor[i] = "#d95353";
			}
			else{
				divs[i].textContent = newip[i]; // must stay becasue of "noip" 
				divs[i].style.backgroundColor = coLor[i];
			}
		}
	}
	oldip = newip;
};
function xxx(){   // the actual request and running code
	if (ss.storage.extScript == false){
		var req =  Request({
			url: ss.storage.remoteHost,
			anonymous: true,
			onComplete: function (response) {
				let newResponseText = response.text.trim(); 
				//console.log( newResponseText );
				getIP(newResponseText);
			}	
		});
		req.get(); 
	}else{
		try {
			let ls = child_process.spawn(prefs['executePath']);
			ls.stdout.on('data', function (data) {
				console.log(data);
				getIP(data);
			});

			ls.stderr.on('data', function (data) {
			  console.error(data);
			  getIP("");
			});

			ls.on('close', function (code) {
			  console.log('child process exited with code ' + code);
			});
		} catch(ex) {
			console.error(ex.message);
			getIP("");
		}
	}	
};

require('sdk/simple-prefs').on("interval", function(){ //pref change interval
	IntervalSetter("c")
});
function IntervalSetter(opts){
	if ( opts == "a"){
		intervalVar = setInterval( xxx , prefs["interval"] * 1000);
	}else if ( opts == "b"){
		clearInterval(intervalVar);
	}else if (opts == "c"){
		if (ss.storage.paused == false){
			xxx();
			clearInterval(intervalVar);
			interval = prefs["interval"] * 1000 ;
			intervalVar = setInterval( xxx , interval);
		}
	}
};


for (let window of browserWindows) {
	running(window);
};
browserWindows.on('open', function(window){
	if (window) {running(window);}
});
browserWindows.on('close', function(window){
	lldoc = viewFor(window).document
	for (let butt of Buttons) {
		if( lldoc.contains(butt)){
			Buttons.splice(Buttons.indexOf(butt),1);
		}
	}
	lldoc.getElementById("mainPopupSet").removeChild(lldoc.getElementById("IPBUTTONCONTEXTMENU"));
});

if (ss.storage.paused == false){    //startup
	xxx();
	IntervalSetter("a")
}else{
	pause();
};

