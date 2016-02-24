var Request = require("sdk/request").Request;
var prefs = require('sdk/simple-prefs').prefs;
var {viewFor}  = require("sdk/view/core");
var browserWindows = require("sdk/windows").browserWindows;
var { setInterval, clearInterval } = require("sdk/timers");
var { ActionButton } = require("sdk/ui/button/action");

var ns = "http://www.w3.org/1999/xhtml";
var interval = prefs["interval"] * 1000 ;
var oldip = [];
var newip = [];
var coLor = [];

var button = ActionButton({
    id: "ipbutton",
    label: "ipbutton",
    icon: 		{
					"16": "./null.png",
					"32": "./null.png",
					"64": "./null.png",
				},
    onClick: function(state) {
        for (let window of browserWindows) {
			for ( i=0; i <= 3 ; i++){
				var llbutton = viewFor(window).document.getElementById("NeWiPbUtToN352638-" + i);
				llbutton.style.backgroundColor = "#76d953";
				coLor[i] = "#76d953";
			};
		}
    }
});

for (let window of browserWindows) {
	running(window);
};
browserWindows.on('open', function(window){
	if (window) {running(window);}
});
 
function running(window){ 
	var lowlevelbutton = viewFor(window).document.getElementById("action-button--jid1-cxyk5vmbogaabqjetpack-ipbutton");
	lowlevelbutton.setAttribute('class', 'action-button');
	for ( i=0; i <= 3 ; i++){	
		var newButton = viewFor(window).document.createElementNS(ns,'button');
		newButton.id = "NeWiPbUtToN352638-" + i;
		newButton.textContent = oldip[i];
		lowlevelbutton.appendChild(newButton);
		newButton.style.backgroundColor = coLor[i] ;
		newButton.style.border = "none";
		newButton.style.borderRadius = "5px";
	};
};

function xxx(){
	var req =  Request({
		url: "https://l2.io/ip",
		onComplete: function (response) {
			//console.log("BRRRLLLFFF");
			// /./i.test(response.text);
			
			var newip = response.text.split(".");
			if (newip.length <= 2) {
				for (let window of browserWindows) {
						for ( i=0; i <= 3 ; i++){
							var llbutton = viewFor(window).document.getElementById("NeWiPbUtToN352638-"+ i);
							llbutton.textContent = "";
							llbutton.style.backgroundColor = "#d95353";
						};
				};
				return;
			};
			for (let window of browserWindows) {
					for ( i=0; i <= 3 ; i++){
						if ( oldip[i] != newip[i]){
							var llbutton = viewFor(window).document.getElementById("NeWiPbUtToN352638-"+ i);
							llbutton.textContent = newip[i];
							llbutton.style.backgroundColor = "#d95353";
							coLor[i] = "#d95353";
						}
						else{
							var llbutton = viewFor(window).document.getElementById("NeWiPbUtToN352638-"+ i);
							llbutton.textContent = newip[i];
							llbutton.style.backgroundColor = coLor[i];
						};
					};
			};
			oldip = newip;
		},
	});
	req.post(); 
};
   
xxx();

var intervalVar = setInterval( xxx , interval);

require('sdk/simple-prefs').on("interval", function(){ 
	clearInterval(intervalVar);
	interval = prefs["interval"] * 1000 ;
	intervalVar = setInterval( xxx , interval);
});


