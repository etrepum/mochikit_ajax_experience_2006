// S5 v1.1 slides.js -- released into the Public Domain
// Modified for Docutils (http://docutils.sf.net) by David Goodger
//
// Please see http://www.meyerweb.com/eric/tools/s5/credits.html for
// information about all the wonderful and talented contributors to this code!

var undef;
var slideCSS = '';
var snum = 0;
var smax = 1;
var slideIDs = new Array();
var incpos = 0;
var number = undef;
var s5mode = true;
var defaultView = 'slideshow';
var controlVis = 'visible';

var isIE = navigator.appName == 'Microsoft Internet Explorer' ? 1 : 0;
var isOp = navigator.userAgent.indexOf('Opera') > -1 ? 1 : 0;
var isGe = navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('Safari') < 1 ? 1 : 0;

function hasClass(object, className) {
	if (!object.className) return false;
	return (object.className.search('(^|\\s)' + className + '(\\s|$)') != -1);
}

function hasValue(object, value) {
	if (!object) return false;
	return (object.search('(^|\\s)' + value + '(\\s|$)') != -1);
}

function removeClass(object,className) {
	if (!object) return;
	object.className = object.className.replace(new RegExp('(^|\\s)'+className+'(\\s|$)'), RegExp.$1+RegExp.$2);
}

function addClass(object,className) {
	if (!object || hasClass(object, className)) return;
	if (object.className) {
		object.className += ' '+className;
	} else {
		object.className = className;
	}
}

function GetElementsWithClassName(elementName,className) {
	var allElements = document.getElementsByTagName(elementName);
	var elemColl = new Array();
	for (var i = 0; i< allElements.length; i++) {
		if (hasClass(allElements[i], className)) {
			elemColl[elemColl.length] = allElements[i];
		}
	}
	return elemColl;
}

function isParentOrSelf(element, id) {
	if (element == null || element.nodeName=='BODY') return false;
	else if (element.id == id) return true;
	else return isParentOrSelf(element.parentNode, id);
}

function nodeValue(node) {
	var result = "";
	if (node.nodeType == 1) {
		var children = node.childNodes;
		for (var i = 0; i < children.length; ++i) {
			result += nodeValue(children[i]);
		}		
	}
	else if (node.nodeType == 3) {
		result = node.nodeValue;
	}
	return(result);
}

function slideLabel() {
	var slideColl = GetElementsWithClassName('*','slide');
	var list = document.getElementById('jumplist');
	smax = slideColl.length;
	for (var n = 0; n < smax; n++) {
		var obj = slideColl[n];

		var did = 'slide' + n.toString();
		if (obj.getAttribute('id')) {
			slideIDs[n] = obj.getAttribute('id');
		}
		else {
			obj.setAttribute('id',did);
			slideIDs[n] = did;
		}
		if (isOp) continue;

		var otext = '';
		var menu = obj.firstChild;
		if (!menu) continue; // to cope with empty slides
		while (menu && menu.nodeType == 3) {
			menu = menu.nextSibling;
		}
	 	if (!menu) continue; // to cope with slides with only text nodes

		var menunodes = menu.childNodes;
		for (var o = 0; o < menunodes.length; o++) {
			otext += nodeValue(menunodes[o]);
		}
		list.options[list.length] = new Option(n + ' : '  + otext, n);
	}
}

function currentSlide() {
	var cs;
	var footer_nodes;
	var vis = 'visible';
	if (document.getElementById) {
		cs = document.getElementById('currentSlide');
		footer_nodes = document.getElementById('footer').childNodes;
	} else {
		cs = document.currentSlide;
		footer = document.footer.childNodes;
	}
	cs.innerHTML = '<span id="csHere">' + snum + '<\/span> ' + 
		'<span id="csSep">\/<\/span> ' + 
		'<span id="csTotal">' + (smax-1) + '<\/span>';
	if (snum == 0) {
		vis = 'hidden';
	}
	cs.style.visibility = vis;
	for (var i = 0; i < footer_nodes.length; i++) {
		if (footer_nodes[i].nodeType == 1) {
			footer_nodes[i].style.visibility = vis;
		}
	}		
}

function go(step) {
	if (document.getElementById('slideProj').disabled || step == 0) return;
	var jl = document.getElementById('jumplist');
	var cid = slideIDs[snum];
	var ce = document.getElementById(cid);
	if (incrementals[snum].length > 0) {
		for (var i = 0; i < incrementals[snum].length; i++) {
			removeClass(incrementals[snum][i], 'current');
			removeClass(incrementals[snum][i], 'incremental');
		}
	}
	if (step != 'j') {
		snum += step;
		lmax = smax - 1;
		if (snum > lmax) snum = lmax;
		if (snum < 0) snum = 0;
	} else
		snum = parseInt(jl.value);
	var nid = slideIDs[snum];
	var ne = document.getElementById(nid);
	if (!ne) {
		ne = document.getElementById(slideIDs[0]);
		snum = 0;
	}
	if (step < 0) {incpos = incrementals[snum].length} else {incpos = 0;}
	if (incrementals[snum].length > 0 && incpos == 0) {
		for (var i = 0; i < incrementals[snum].length; i++) {
			if (hasClass(incrementals[snum][i], 'current'))
				incpos = i + 1;
			else
				addClass(incrementals[snum][i], 'incremental');
		}
	}
	if (incrementals[snum].length > 0 && incpos > 0)
		addClass(incrementals[snum][incpos - 1], 'current');
	ce.style.visibility = 'hidden';
	ne.style.visibility = 'visible';
	jl.selectedIndex = snum;
	currentSlide();
	number = 0;
}

function goTo(target) {
	if (target >= smax || target == snum) return;
	go(target - snum);
}

function subgo(step) {
	if (step > 0) {
		removeClass(incrementals[snum][incpos - 1],'current');
		removeClass(incrementals[snum][incpos], 'incremental');
		addClass(incrementals[snum][incpos],'current');
		incpos++;
	} else {
		incpos--;
		removeClass(incrementals[snum][incpos],'current');
		addClass(incrementals[snum][incpos], 'incremental');
		addClass(incrementals[snum][incpos - 1],'current');
	}
}

function toggle() {
	var slideColl = GetElementsWithClassName('*','slide');
	var slides = document.getElementById('slideProj');
	var outline = document.getElementById('outlineStyle');
	if (!slides.disabled) {
		slides.disabled = true;
		outline.disabled = false;
		s5mode = false;
		fontSize('1em');
		for (var n = 0; n < smax; n++) {
			var slide = slideColl[n];
			slide.style.visibility = 'visible';
		}
	} else {
		slides.disabled = false;
		outline.disabled = true;
		s5mode = true;
		fontScale();
		for (var n = 0; n < smax; n++) {
			var slide = slideColl[n];
			slide.style.visibility = 'hidden';
		}
		slideColl[snum].style.visibility = 'visible';
	}
}

function showHide(action) {
	var obj = GetElementsWithClassName('*','hideme')[0];
	switch (action) {
	case 's': obj.style.visibility = 'visible'; break;
	case 'h': obj.style.visibility = 'hidden'; break;
	case 'k':
		if (obj.style.visibility != 'visible') {
			obj.style.visibility = 'visible';
		} else {
			obj.style.visibility = 'hidden';
		}
	break;
	}
}

// 'keys' code adapted from MozPoint (http://mozpoint.mozdev.org/)
function keys(key) {
	if (!key) {
		key = event;
		key.which = key.keyCode;
	}
	if (key.which == 84) {
		toggle();
		return;
	}
	if (s5mode) {
		switch (key.which) {
			case 10: // return
			case 13: // enter
				if (window.event && isParentOrSelf(window.event.srcElement, 'controls')) return;
				if (key.target && isParentOrSelf(key.target, 'controls')) return;
				if(number != undef) {
					goTo(number);
					break;
				}
			case 32: // spacebar
			case 34: // page down
			case 39: // rightkey
			case 40: // downkey
				if(number != undef) {
					go(number);
				} else if (!incrementals[snum] || incpos >= incrementals[snum].length) {
					go(1);
				} else {
					subgo(1);
				}
				break;
			case 33: // page up
			case 37: // leftkey
			case 38: // upkey
				if(number != undef) {
					go(-1 * number);
				} else if (!incrementals[snum] || incpos <= 0) {
					go(-1);
				} else {
					subgo(-1);
				}
				break;
			case 36: // home
				goTo(0);
				break;
			case 35: // end
				goTo(smax-1);
				break;
			case 67: // c
				showHide('k');
				break;
		}
		if (key.which < 48 || key.which > 57) {
			number = undef;
		} else {
			if (window.event && isParentOrSelf(window.event.srcElement, 'controls')) return;
			if (key.target && isParentOrSelf(key.target, 'controls')) return;
			number = (((number != undef) ? number : 0) * 10) + (key.which - 48);
		}
	}
	return false;
}

function clicker(e) {
	number = undef;
	var target;
	if (window.event) {
		target = window.event.srcElement;
		e = window.event;
	} else target = e.target;
    if (target.href != null || hasValue(target.rel, 'external') || isParentOrSelf(target, 'controls') || isParentOrSelf(target,'embed') || isParentOrSelf(target, 'object')) return true; 
	if (!e.which || e.which == 1) {
		if (!incrementals[snum] || incpos >= incrementals[snum].length) {
			go(1);
		} else {
			subgo(1);
		}
	}
}

function findSlide(hash) {
	var target = document.getElementById(hash);
	if (target) {
		for (var i = 0; i < slideIDs.length; i++) {
			if (target.id == slideIDs[i]) return i;
		}
	}
	return null;
}

function slideJump() {
	if (window.location.hash == null || window.location.hash == '') {
		currentSlide();
		return;
	}
	if (window.location.hash == null) return;
	var dest = null;
	dest = findSlide(window.location.hash.slice(1));
	if (dest == null) {
		dest = 0;
	}
	go(dest - snum);
}

function fixLinks() {
	var thisUri = window.location.href;
	thisUri = thisUri.slice(0, thisUri.length - window.location.hash.length);
	var aelements = document.getElementsByTagName('A');
	for (var i = 0; i < aelements.length; i++) {
		var a = aelements[i].href;
		var slideID = a.match('\#.+');
		if ((slideID) && (slideID[0].slice(0,1) == '#')) {
			var dest = findSlide(slideID[0].slice(1));
			if (dest != null) {
				if (aelements[i].addEventListener) {
					aelements[i].addEventListener("click", new Function("e",
						"if (document.getElementById('slideProj').disabled) return;" +
						"go("+dest+" - snum); " +
						"if (e.preventDefault) e.preventDefault();"), true);
				} else if (aelements[i].attachEvent) {
					aelements[i].attachEvent("onclick", new Function("",
						"if (document.getElementById('slideProj').disabled) return;" +
						"go("+dest+" - snum); " +
						"event.returnValue = false;"));
				}
			}
		}
	}
}

function externalLinks() {
	if (!document.getElementsByTagName) return;
	var anchors = document.getElementsByTagName('a');
	for (var i=0; i<anchors.length; i++) {
		var anchor = anchors[i];
		if (anchor.getAttribute('href') && hasValue(anchor.rel, 'external')) {
			anchor.target = '_blank';
			addClass(anchor,'external');
		}
	}
}

function createControls() {
	var controlsDiv = document.getElementById("controls");
	if (!controlsDiv) return;
	var hider = ' onmouseover="showHide(\'s\');" onmouseout="showHide(\'h\');"';
	var hideDiv, hideList = '';
	if (controlVis == 'hidden') {
		hideDiv = hider;
	} else {
		hideList = hider;
	}
	controlsDiv.innerHTML = '<form action="#" id="controlForm"' + hideDiv + '>' +
	'<div id="navLinks">' +
	'<a accesskey="t" id="toggle" href="javascript:toggle();">&#216;<\/a>' +
	'<a accesskey="z" id="prev" href="javascript:go(-1);">&laquo;<\/a>' +
	'<a accesskey="x" id="next" href="javascript:go(1);">&raquo;<\/a>' +
	'<div id="navList"' + hideList + '><select id="jumplist" onchange="go(\'j\');"><\/select><\/div>' +
	'<\/div><\/form>';
	if (controlVis == 'hidden') {
		var hidden = document.getElementById('navLinks');
	} else {
		var hidden = document.getElementById('jumplist');
	}
	addClass(hidden,'hideme');
}

function fontScale() {  // causes layout problems in FireFox that get fixed if browser's Reload is used; same may be true of other Gecko-based browsers
	if (!s5mode) return false;
	var vScale = 22;  // both yield 32 (after rounding) at 1024x768
	var hScale = 32;  // perhaps should auto-calculate based on theme's declared value?
	if (window.innerHeight) {
		var vSize = window.innerHeight;
		var hSize = window.innerWidth;
	} else if (document.documentElement.clientHeight) {
		var vSize = document.documentElement.clientHeight;
		var hSize = document.documentElement.clientWidth;
	} else if (document.body.clientHeight) {
		var vSize = document.body.clientHeight;
		var hSize = document.body.clientWidth;
	} else {
		var vSize = 700;  // assuming 1024x768, minus chrome and such
		var hSize = 1024; // these do not account for kiosk mode or Opera Show
	}
	var newSize = Math.min(Math.round(vSize/vScale),Math.round(hSize/hScale));
	fontSize(newSize + 'px');
	if (isGe) {  // hack to counter incremental reflow bugs
		var obj = document.getElementsByTagName('body')[0];
		obj.style.display = 'none';
		obj.style.display = 'block';
	}
}

function fontSize(value) {
	if (!(s5ss = document.getElementById('s5ss'))) {
		if (!isIE) {
			document.getElementsByTagName('head')[0].appendChild(s5ss = document.createElement('style'));
			s5ss.setAttribute('media','screen, projection');
			s5ss.setAttribute('id','s5ss');
		} else {
			document.createStyleSheet();
			document.s5ss = document.styleSheets[document.styleSheets.length - 1];
		}
	}
	if (!isIE) {
		while (s5ss.lastChild) s5ss.removeChild(s5ss.lastChild);
		s5ss.appendChild(document.createTextNode('body {font-size: ' + value + ' !important;}'));
	} else {
		document.s5ss.addRule('body','font-size: ' + value + ' !important;');
	}
}

function notOperaFix() {
	slideCSS = document.getElementById('slideProj').href;
	var slides = document.getElementById('slideProj');
	var outline = document.getElementById('outlineStyle');
	slides.setAttribute('media','screen');
	outline.disabled = true;
	if (isGe) {
		slides.setAttribute('href','null');   // Gecko fix
		slides.setAttribute('href',slideCSS); // Gecko fix
	}
	if (isIE && document.styleSheets && document.styleSheets[0]) {
		document.styleSheets[0].addRule('img', 'behavior: url(ui/default/iepngfix.htc)');
		document.styleSheets[0].addRule('div', 'behavior: url(ui/default/iepngfix.htc)');
		document.styleSheets[0].addRule('.slide', 'behavior: url(ui/default/iepngfix.htc)');
	}
}

function getIncrementals(obj) {
	var incrementals = new Array();
	if (!obj) 
		return incrementals;
	var children = obj.childNodes;
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (hasClass(child, 'incremental')) {
			if (child.nodeName == 'OL' || child.nodeName == 'UL') {
				removeClass(child, 'incremental');
				for (var j = 0; j < child.childNodes.length; j++) {
					if (child.childNodes[j].nodeType == 1) {
						addClass(child.childNodes[j], 'incremental');
					}
				}
			} else {
				incrementals[incrementals.length] = child;
				removeClass(child,'incremental');
			}
		}
		if (hasClass(child, 'show-first')) {
			if (child.nodeName == 'OL' || child.nodeName == 'UL') {
				removeClass(child, 'show-first');
				if (child.childNodes[isGe].nodeType == 1) {
					removeClass(child.childNodes[isGe], 'incremental');
				}
			} else {
				incrementals[incrementals.length] = child;
			}
		}
		incrementals = incrementals.concat(getIncrementals(child));
	}
	return incrementals;
}

function createIncrementals() {
	var incrementals = new Array();
	for (var i = 0; i < smax; i++) {
		incrementals[i] = getIncrementals(document.getElementById(slideIDs[i]));
	}
	return incrementals;
}

function defaultCheck() {
	var allMetas = document.getElementsByTagName('meta');
	for (var i = 0; i< allMetas.length; i++) {
		if (allMetas[i].name == 'defaultView') {
			defaultView = allMetas[i].content;
		}
		if (allMetas[i].name == 'controlVis') {
			controlVis = allMetas[i].content;
		}
	}
}

// Key trap fix, new function body for trap()
function trap(e) {
	if (!e) {
		e = event;
		e.which = e.keyCode;
	}
	try {
		modifierKey = e.ctrlKey || e.altKey || e.metaKey;
	}
	catch(e) {
		modifierKey = false;
	}
	return modifierKey || e.which == 0;
}

function startup() {
	defaultCheck();
	if (!isOp) createControls();
	slideLabel();
	fixLinks();
	externalLinks();
	fontScale();
	if (!isOp) {
		notOperaFix();
		incrementals = createIncrementals();
		slideJump();
		if (defaultView == 'outline') {
			toggle();
		}
		document.onkeyup = keys;
		document.onkeypress = trap;
		document.onclick = clicker;
	}
}

window.onload = startup;
window.onresize = function(){setTimeout('fontScale()', 50);}

/***

    MochiKit.MochiKit 1.3 : PACKED VERSION

    THIS FILE IS AUTOMATICALLY GENERATED.  If creating patches, please
    diff against the source tree, not this file.

    See <http://mochikit.com/> for documentation, downloads, license, etc.

    (c) 2005 Bob Ippolito.  All rights Reserved.

***/

if(typeof (dojo)!="undefined"){
dojo.provide("MochiKit.Base");
}
if(typeof (MochiKit)=="undefined"){
MochiKit={};
}
if(typeof (MochiKit.Base)=="undefined"){
MochiKit.Base={};
}
MochiKit.Base.VERSION="1.3";
MochiKit.Base.NAME="MochiKit.Base";
MochiKit.Base.update=function(_1,_2){
if(_1==null){
_1={};
}
for(var i=1;i<arguments.length;i++){
var o=arguments[i];
if(typeof (o)!="undefined"&&o!=null){
for(var k in o){
_1[k]=o[k];
}
}
}
return _1;
};
MochiKit.Base.update(MochiKit.Base,{__repr__:function(){
return "["+this.NAME+" "+this.VERSION+"]";
},toString:function(){
return this.__repr__();
},counter:function(n){
if(arguments.length==0){
n=1;
}
return function(){
return n++;
};
},clone:function(_7){
var me=arguments.callee;
if(arguments.length==1){
me.prototype=_7;
return new me();
}
},flattenArguments:function(_9){
var res=[];
var m=MochiKit.Base;
var _12=m.extend(null,arguments);
while(_12.length){
var o=_12.shift();
if(o&&typeof (o)=="object"&&typeof (o.length)=="number"){
for(var i=o.length-1;i>=0;i--){
_12.unshift(o[i]);
}
}else{
res.push(o);
}
}
return res;
},extend:function(_13,obj,_15){
if(!_15){
_15=0;
}
if(obj){
var l=obj.length;
if(typeof (l)!="number"){
if(typeof (MochiKit.Iter)!="undefined"){
obj=MochiKit.Iter.list(obj);
l=obj.length;
}else{
throw new TypeError("Argument not an array-like and MochiKit.Iter not present");
}
}
if(!_13){
_13=[];
}
for(var i=_15;i<l;i++){
_13.push(obj[i]);
}
}
return _13;
},updatetree:function(_17,obj){
if(_17==null){
_17={};
}
for(var i=1;i<arguments.length;i++){
var o=arguments[i];
if(typeof (o)!="undefined"&&o!=null){
for(var k in o){
var v=o[k];
if(typeof (_17[k])=="object"&&typeof (v)=="object"){
arguments.callee(_17[k],v);
}else{
_17[k]=v;
}
}
}
}
return _17;
},setdefault:function(_19,obj){
if(_19==null){
_19={};
}
for(var i=1;i<arguments.length;i++){
var o=arguments[i];
for(var k in o){
if(!(k in _19)){
_19[k]=o[k];
}
}
}
return _19;
},keys:function(obj){
var _20=[];
for(var _21 in obj){
_20.push(_21);
}
return _20;
},items:function(obj){
var _22=[];
var e;
for(var _24 in obj){
var v;
try{
v=obj[_24];
}
catch(e){
continue;
}
_22.push([_24,v]);
}
return _22;
},_newNamedError:function(_25,_26,_27){
_27.prototype=new MochiKit.Base.NamedError(_25.NAME+"."+_26);
_25[_26]=_27;
},operator:{truth:function(a){
return !!a;
},lognot:function(a){
return !a;
},identity:function(a){
return a;
},not:function(a){
return ~a;
},neg:function(a){
return -a;
},add:function(a,b){
return a+b;
},sub:function(a,b){
return a-b;
},div:function(a,b){
return a/b;
},mod:function(a,b){
return a%b;
},mul:function(a,b){
return a*b;
},and:function(a,b){
return a&b;
},or:function(a,b){
return a|b;
},xor:function(a,b){
return a^b;
},lshift:function(a,b){
return a<<b;
},rshift:function(a,b){
return a>>b;
},zrshift:function(a,b){
return a>>>b;
},eq:function(a,b){
return a==b;
},ne:function(a,b){
return a!=b;
},gt:function(a,b){
return a>b;
},ge:function(a,b){
return a>=b;
},lt:function(a,b){
return a<b;
},le:function(a,b){
return a<=b;
},ceq:function(a,b){
return MochiKit.Base.compare(a,b)==0;
},cne:function(a,b){
return MochiKit.Base.compare(a,b)!=0;
},cgt:function(a,b){
return MochiKit.Base.compare(a,b)==1;
},cge:function(a,b){
return MochiKit.Base.compare(a,b)!=-1;
},clt:function(a,b){
return MochiKit.Base.compare(a,b)==-1;
},cle:function(a,b){
return MochiKit.Base.compare(a,b)!=1;
},logand:function(a,b){
return a&&b;
},logor:function(a,b){
return a||b;
},contains:function(a,b){
return b in a;
}},forward:function(_30){
return function(){
return this[_30].apply(this,arguments);
};
},itemgetter:function(_31){
return function(arg){
return arg[_31];
};
},typeMatcher:function(){
var _33={};
for(var i=0;i<arguments.length;i++){
var typ=arguments[i];
_33[typ]=typ;
}
return function(){
for(var i=0;i<arguments.length;i++){
if(!(typeof (arguments[i]) in _33)){
return false;
}
}
return true;
};
},isNull:function(){
for(var i=0;i<arguments.length;i++){
if(arguments[i]!==null){
return false;
}
}
return true;
},isUndefinedOrNull:function(){
for(var i=0;i<arguments.length;i++){
var o=arguments[i];
if(!(typeof (o)=="undefined"||o==null)){
return false;
}
}
return true;
},isNotEmpty:function(obj){
for(var i=0;i<arguments.length;i++){
var o=arguments[i];
if(!(o&&o.length)){
return false;
}
}
return true;
},isArrayLike:function(){
for(var i=0;i<arguments.length;i++){
var o=arguments[i];
var typ=typeof (o);
if((typ!="object"&&!(typ=="function"&&typeof (o.item)=="function"))||o==null||typeof (o.length)!="number"){
return false;
}
}
return true;
},isDateLike:function(){
for(var i=0;i<arguments.length;i++){
var o=arguments[i];
if(typeof (o)!="object"||o==null||typeof (o.getTime)!="function"){
return false;
}
}
return true;
},xmap:function(fn){
if(fn==null){
return MochiKit.Base.extend(null,arguments,1);
}
var _36=[];
for(var i=1;i<arguments.length;i++){
_36.push(fn(arguments[i]));
}
return _36;
},map:function(fn,lst){
var m=MochiKit.Base;
var _38=m.isArrayLike;
if(arguments.length<=2){
if(!_38(lst)){
if(MochiKit.Iter){
lst=MochiKit.Iter.list(lst);
if(fn==null){
return lst;
}
}else{
throw new TypeError("Argument not an array-like and MochiKit.Iter not present");
}
}
if(fn==null){
return m.extend(null,lst);
}
var _39=[];
for(var i=0;i<lst.length;i++){
_39.push(fn(lst[i]));
}
return _39;
}else{
if(fn==null){
fn=Array;
}
var _40=null;
for(i=1;i<arguments.length;i++){
if(!_38(arguments[i])){
if(MochiKit.Iter){
arguments[i]=MochiKit.Iter.list(arguments[i]);
}else{
throw new TypeError("Argument not an array-like and MochiKit.Iter not present");
}
}
var l=arguments[i].length;
if(_40==null||_40>l){
_40=l;
}
}
_39=[];
for(i=0;i<_40;i++){
var _41=[];
for(var j=1;j<arguments.length;j++){
_41.push(arguments[j][i]);
}
_39.push(fn.apply(this,_41));
}
return _39;
}
},xfilter:function(fn){
var _43=[];
if(fn==null){
fn=MochiKit.Base.operator.truth;
}
for(var i=1;i<arguments.length;i++){
var o=arguments[i];
if(fn(o)){
_43.push(o);
}
}
return _43;
},filter:function(fn,lst,_44){
var _45=[];
var m=MochiKit.Base;
if(!m.isArrayLike(lst)){
if(MochiKit.Iter){
lst=MochiKit.Iter.list(lst);
}else{
throw new TypeError("Argument not an array-like and MochiKit.Iter not present");
}
}
if(fn==null){
fn=m.operator.truth;
}
if(typeof (Array.prototype.filter)=="function"){
return Array.prototype.filter.call(lst,fn,_44);
}else{
if(typeof (_44)=="undefined"||_44==null){
for(var i=0;i<lst.length;i++){
var o=lst[i];
if(fn(o)){
_45.push(o);
}
}
}else{
for(i=0;i<lst.length;i++){
o=lst[i];
if(fn.call(_44,o)){
_45.push(o);
}
}
}
}
return _45;
},_wrapDumbFunction:function(_46){
return function(){
switch(arguments.length){
case 0:
return _46();
case 1:
return _46(arguments[0]);
case 2:
return _46(arguments[0],arguments[1]);
case 3:
return _46(arguments[0],arguments[1],arguments[2]);
}
var _47=[];
for(var i=0;i<arguments.length;i++){
_47.push("arguments["+i+"]");
}
return eval("(func("+_47.join(",")+"))");
};
},bind:function(_48,_49){
if(typeof (_48)=="string"){
_48=_49[_48];
}
var _50=_48.im_func;
var _51=_48.im_preargs;
var _52=_48.im_self;
var m=MochiKit.Base;
if(typeof (_48)=="function"&&typeof (_48.apply)=="undefined"){
_48=m._wrapDumbFunction(_48);
}
if(typeof (_50)!="function"){
_50=_48;
}
if(typeof (_49)!="undefined"){
_52=_49;
}
if(typeof (_51)=="undefined"){
_51=[];
}else{
_51=_51.slice();
}
m.extend(_51,arguments,2);
var _53=function(){
var _54=arguments;
var me=arguments.callee;
if(me.im_preargs.length>0){
_54=m.concat(me.im_preargs,_54);
}
var _49=me.im_self;
if(!_49){
_49=this;
}
return me.im_func.apply(_49,_54);
};
_53.im_self=_52;
_53.im_func=_50;
_53.im_preargs=_51;
return _53;
},bindMethods:function(_55){
var _56=MochiKit.Base.bind;
for(var k in _55){
var _57=_55[k];
if(typeof (_57)=="function"){
_55[k]=_56(_57,_55);
}
}
},registerComparator:function(_58,_59,_60,_61){
MochiKit.Base.comparatorRegistry.register(_58,_59,_60,_61);
},_primitives:{"bool":true,"string":true,"number":true},compare:function(a,b){
if(a==b){
return 0;
}
var _62=(typeof (a)=="undefined"||a==null);
var _63=(typeof (b)=="undefined"||b==null);
if(_62&&_63){
return 0;
}else{
if(_62){
return -1;
}else{
if(_63){
return 1;
}
}
}
var m=MochiKit.Base;
var _64=m._primitives;
if(!(typeof (a) in _64&&typeof (b) in _64)){
try{
return m.comparatorRegistry.match(a,b);
}
catch(e){
if(e!=m.NotFound){
throw e;
}
}
}
if(a<b){
return -1;
}else{
if(a>b){
return 1;
}
}
var _65=m.repr;
throw new TypeError(_65(a)+" and "+_65(b)+" can not be compared");
},compareDateLike:function(a,b){
return MochiKit.Base.compare(a.getTime(),b.getTime());
},compareArrayLike:function(a,b){
var _66=MochiKit.Base.compare;
var _67=a.length;
var _68=0;
if(_67>b.length){
_68=1;
_67=b.length;
}else{
if(_67<b.length){
_68=-1;
}
}
for(var i=0;i<_67;i++){
var cmp=_66(a[i],b[i]);
if(cmp){
return cmp;
}
}
return _68;
},registerRepr:function(_70,_71,_72,_73){
MochiKit.Base.reprRegistry.register(_70,_71,_72,_73);
},repr:function(o){
if(typeof (o)=="undefined"){
return "undefined";
}else{
if(o===null){
return "null";
}
}
try{
if(typeof (o.__repr__)=="function"){
return o.__repr__();
}else{
if(typeof (o.repr)=="function"&&o.repr!=arguments.callee){
return o.repr();
}
}
return MochiKit.Base.reprRegistry.match(o);
}
catch(e){
if(typeof (o.NAME)=="string"&&(o.toString==Function.prototype.toString||o.toString==Object.prototype.toString)){
return o.NAME;
}
}
try{
var _74=(o+"");
}
catch(e){
return "["+typeof (o)+"]";
}
if(typeof (o)=="function"){
o=_74.replace(/^\s+/,"");
var idx=o.indexOf("{");
if(idx!=-1){
o=o.substr(0,idx)+"{...}";
}
}
return _74;
},reprArrayLike:function(o){
var m=MochiKit.Base;
return "["+m.map(m.repr,o).join(", ")+"]";
},reprString:function(o){
return ("\""+o.replace(/(["\\])/g,"\\$1")+"\"").replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r");
},reprNumber:function(o){
return o+"";
},registerJSON:function(_76,_77,_78,_79){
MochiKit.Base.jsonRegistry.register(_76,_77,_78,_79);
},evalJSON:function(){
return eval("("+arguments[0]+")");
},serializeJSON:function(o){
var _80=typeof (o);
if(_80=="undefined"){
return "undefined";
}else{
if(_80=="number"||_80=="boolean"){
return o+"";
}else{
if(o===null){
return "null";
}
}
}
var m=MochiKit.Base;
var _81=m.reprString;
if(_80=="string"){
return _81(o);
}
var me=arguments.callee;
var _82;
if(typeof (o.__json__)=="function"){
_82=o.__json__();
if(o!==_82){
return me(_82);
}
}
if(typeof (o.json)=="function"){
_82=o.json();
if(o!==_82){
return me(_82);
}
}
if(_80!="function"&&typeof (o.length)=="number"){
var res=[];
for(var i=0;i<o.length;i++){
var val=me(o[i]);
if(typeof (val)!="string"){
val="undefined";
}
res.push(val);
}
return "["+res.join(", ")+"]";
}
try{
_82=m.jsonRegistry.match(o);
return me(_82);
}
catch(e){
if(e!=m.NotFound){
throw e;
}
}
if(_80=="function"){
return null;
}
res=[];
for(var k in o){
var _84;
if(typeof (k)=="number"){
_84="\""+k+"\"";
}else{
if(typeof (k)=="string"){
_84=_81(k);
}else{
continue;
}
}
val=me(o[k]);
if(typeof (val)!="string"){
continue;
}
res.push(_84+":"+val);
}
return "{"+res.join(", ")+"}";
},objEqual:function(a,b){
return (MochiKit.Base.compare(a,b)==0);
},arrayEqual:function(_85,arr){
if(_85.length!=arr.length){
return false;
}
return (MochiKit.Base.compare(_85,arr)==0);
},concat:function(){
var _87=[];
var _88=MochiKit.Base.extend;
for(var i=0;i<arguments.length;i++){
_88(_87,arguments[i]);
}
return _87;
},keyComparator:function(key){
var m=MochiKit.Base;
var _90=m.compare;
if(arguments.length==1){
return function(a,b){
return _90(a[key],b[key]);
};
}
var _91=m.extend(null,arguments);
return function(a,b){
var _92=0;
for(var i=0;(_92==0)&&(i<_91.length);i++){
var key=_91[i];
_92=_90(a[key],b[key]);
}
return _92;
};
},reverseKeyComparator:function(key){
var _93=MochiKit.Base.keyComparator.apply(this,arguments);
return function(a,b){
return _93(b,a);
};
},partial:function(_94){
var m=MochiKit.Base;
return m.bind.apply(this,m.extend([_94,undefined],arguments,1));
},listMinMax:function(_95,lst){
if(lst.length==0){
return null;
}
var cur=lst[0];
var _97=MochiKit.Base.compare;
for(var i=1;i<lst.length;i++){
var o=lst[i];
if(_97(o,cur)==_95){
cur=o;
}
}
return cur;
},objMax:function(){
return MochiKit.Base.listMinMax(1,arguments);
},objMin:function(){
return MochiKit.Base.listMinMax(-1,arguments);
},findIdentical:function(lst,_98,_99,end){
if(typeof (end)=="undefined"||end==null){
end=lst.length;
}
for(var i=(_99||0);i<end;i++){
if(lst[i]===_98){
return i;
}
}
return -1;
},find:function(lst,_101,_102,end){
if(typeof (end)=="undefined"||end==null){
end=lst.length;
}
var cmp=MochiKit.Base.compare;
for(var i=(_102||0);i<end;i++){
if(cmp(lst[i],_101)==0){
return i;
}
}
return -1;
},nodeWalk:function(node,_104){
var _105=[node];
var _106=MochiKit.Base.extend;
while(_105.length){
var res=_104(_105.shift());
if(res){
_106(_105,res);
}
}
},nameFunctions:function(_107){
var base=_107.NAME;
if(typeof (base)=="undefined"){
base="";
}else{
base=base+".";
}
for(var name in _107){
var o=_107[name];
if(typeof (o)=="function"&&typeof (o.NAME)=="undefined"){
try{
o.NAME=base+name;
}
catch(e){
}
}
}
},queryString:function(_110,_111){
if(typeof (MochiKit.DOM)!="undefined"&&arguments.length==1&&(typeof (_110)=="string"||(typeof (_110.nodeType)!="undefined"&&_110.nodeType>0))){
var kv=MochiKit.DOM.formContents(_110);
_110=kv[0];
_111=kv[1];
}else{
if(arguments.length==1){
var o=_110;
_110=[];
_111=[];
for(var k in o){
var v=o[k];
if(typeof (v)!="function"){
_110.push(k);
_111.push(v);
}
}
}
}
var rval=[];
var len=Math.min(_110.length,_111.length);
var _115=MochiKit.Base.urlEncode;
for(var i=0;i<len;i++){
v=_111[i];
if(typeof (v)!="undefined"&&v!=null){
rval.push(_115(_110[i])+"="+_115(v));
}
}
return rval.join("&");
},parseQueryString:function(_116,_117){
var _118=_116.replace(/\+/g,"%20").split("&");
var o={};
var _119;
if(typeof (decodeURIComponent)!="undefined"){
_119=decodeURIComponent;
}else{
_119=unescape;
}
if(_117){
for(var i=0;i<_118.length;i++){
var pair=_118[i].split("=");
var name=_119(pair[0]);
var arr=o[name];
if(!(arr instanceof Array)){
arr=[];
o[name]=arr;
}
arr.push(_119(pair[1]));
}
}else{
for(i=0;i<_118.length;i++){
pair=_118[i].split("=");
o[_119(pair[0])]=_119(pair[1]);
}
}
return o;
}});
MochiKit.Base.AdapterRegistry=function(){
this.pairs=[];
};
MochiKit.Base.AdapterRegistry.prototype={register:function(name,_121,wrap,_123){
if(_123){
this.pairs.unshift([name,_121,wrap]);
}else{
this.pairs.push([name,_121,wrap]);
}
},match:function(){
for(var i=0;i<this.pairs.length;i++){
var pair=this.pairs[i];
if(pair[1].apply(this,arguments)){
return pair[2].apply(this,arguments);
}
}
throw MochiKit.Base.NotFound;
},unregister:function(name){
for(var i=0;i<this.pairs.length;i++){
var pair=this.pairs[i];
if(pair[0]==name){
this.pairs.splice(i,1);
return true;
}
}
return false;
}};
MochiKit.Base.EXPORT=["counter","clone","extend","update","updatetree","setdefault","keys","items","NamedError","operator","forward","itemgetter","typeMatcher","isCallable","isUndefined","isUndefinedOrNull","isNull","isNotEmpty","isArrayLike","isDateLike","xmap","map","xfilter","filter","bind","bindMethods","NotFound","AdapterRegistry","registerComparator","compare","registerRepr","repr","objEqual","arrayEqual","concat","keyComparator","reverseKeyComparator","partial","merge","listMinMax","listMax","listMin","objMax","objMin","nodeWalk","zip","urlEncode","queryString","serializeJSON","registerJSON","evalJSON","parseQueryString","find","findIdentical","flattenArguments"];
MochiKit.Base.EXPORT_OK=["nameFunctions","comparatorRegistry","reprRegistry","jsonRegistry","compareDateLike","compareArrayLike","reprArrayLike","reprString","reprNumber"];
MochiKit.Base._exportSymbols=function(_124,_125){
if(typeof (MochiKit.__export__)=="undefined"){
MochiKit.__export__=(MochiKit.__compat__||(typeof (JSAN)=="undefined"&&typeof (dojo)=="undefined"));
}
if(!MochiKit.__export__){
return;
}
var all=_125.EXPORT_TAGS[":all"];
for(var i=0;i<all.length;i++){
_124[all[i]]=_125[all[i]];
}
};
MochiKit.Base.__new__=function(){
var m=this;
if(typeof (encodeURIComponent)!="undefined"){
m.urlEncode=function(_127){
return encodeURIComponent(_127).replace(/\'/g,"%27");
};
}else{
m.urlEncode=function(_128){
return escape(_128).replace(/\+/g,"%2B").replace(/\"/g,"%22").rval.replace(/\'/g,"%27");
};
}
m.NamedError=function(name){
this.message=name;
this.name=name;
};
m.NamedError.prototype=new Error();
m.update(m.NamedError.prototype,{repr:function(){
if(this.message&&this.message!=this.name){
return this.name+"("+m.repr(this.message)+")";
}else{
return this.name+"()";
}
},toString:m.forward("repr")});
m.NotFound=new m.NamedError("MochiKit.Base.NotFound");
m.listMax=m.partial(m.listMinMax,1);
m.listMin=m.partial(m.listMinMax,-1);
m.isCallable=m.typeMatcher("function");
m.isUndefined=m.typeMatcher("undefined");
m.merge=m.partial(m.update,null);
m.zip=m.partial(m.map,null);
m.comparatorRegistry=new m.AdapterRegistry();
m.registerComparator("dateLike",m.isDateLike,m.compareDateLike);
m.registerComparator("arrayLike",m.isArrayLike,m.compareArrayLike);
m.reprRegistry=new m.AdapterRegistry();
m.registerRepr("arrayLike",m.isArrayLike,m.reprArrayLike);
m.registerRepr("string",m.typeMatcher("string"),m.reprString);
m.registerRepr("numbers",m.typeMatcher("number","boolean"),m.reprNumber);
m.jsonRegistry=new m.AdapterRegistry();
var all=m.concat(m.EXPORT,m.EXPORT_OK);
m.EXPORT_TAGS={":common":m.concat(m.EXPORT_OK),":all":all};
m.nameFunctions(this);
};
MochiKit.Base.__new__();
compare=MochiKit.Base.compare;
MochiKit.Base._exportSymbols(this,MochiKit.Base);
if(typeof (dojo)!="undefined"){
dojo.provide("MochiKit.Iter");
dojo.require("MochiKit.Base");
}
if(typeof (JSAN)!="undefined"){
JSAN.use("MochiKit.Base",[]);
}
try{
if(typeof (MochiKit.Base)=="undefined"){
throw "";
}
}
catch(e){
throw "MochiKit.Iter depends on MochiKit.Base!";
}
if(typeof (MochiKit.Iter)=="undefined"){
MochiKit.Iter={};
}
MochiKit.Iter.NAME="MochiKit.Iter";
MochiKit.Iter.VERSION="1.3";
MochiKit.Base.update(MochiKit.Iter,{__repr__:function(){
return "["+this.NAME+" "+this.VERSION+"]";
},toString:function(){
return this.__repr__();
},registerIteratorFactory:function(name,_129,_130,_131){
MochiKit.Iter.iteratorRegistry.register(name,_129,_130,_131);
},iter:function(_132,_133){
var self=MochiKit.Iter;
if(arguments.length==2){
return self.takewhile(function(a){
return a!=_133;
},_132);
}
if(typeof (_132.next)=="function"){
return _132;
}else{
if(typeof (_132.iter)=="function"){
return _132.iter();
}
}
try{
return self.iteratorRegistry.match(_132);
}
catch(e){
var m=MochiKit.Base;
if(e==m.NotFound){
e=new TypeError(typeof (_132)+": "+m.repr(_132)+" is not iterable");
}
throw e;
}
},count:function(n){
if(!n){
n=0;
}
var m=MochiKit.Base;
return {repr:function(){
return "count("+n+")";
},toString:m.forward("repr"),next:m.counter(n)};
},cycle:function(p){
var self=MochiKit.Iter;
var m=MochiKit.Base;
var lst=[];
var _136=self.iter(p);
return {repr:function(){
return "cycle(...)";
},toString:m.forward("repr"),next:function(){
try{
var rval=_136.next();
lst.push(rval);
return rval;
}
catch(e){
if(e!=self.StopIteration){
throw e;
}
if(lst.length==0){
this.next=function(){
throw self.StopIteration;
};
}else{
var i=-1;
this.next=function(){
i=(i+1)%lst.length;
return lst[i];
};
}
return this.next();
}
}};
},repeat:function(elem,n){
var m=MochiKit.Base;
if(typeof (n)=="undefined"){
return {repr:function(){
return "repeat("+m.repr(elem)+")";
},toString:m.forward("repr"),next:function(){
return elem;
}};
}
return {repr:function(){
return "repeat("+m.repr(elem)+", "+n+")";
},toString:m.forward("repr"),next:function(){
if(n<=0){
throw MochiKit.Iter.StopIteration;
}
n-=1;
return elem;
}};
},next:function(_138){
return _138.next();
},izip:function(p,q){
var m=MochiKit.Base;
var next=MochiKit.Iter.next;
var _141=m.map(iter,arguments);
return {repr:function(){
return "izip(...)";
},toString:m.forward("repr"),next:function(){
return m.map(next,_141);
}};
},ifilter:function(pred,seq){
var m=MochiKit.Base;
seq=MochiKit.Iter.iter(seq);
if(pred==null){
pred=m.operator.truth;
}
return {repr:function(){
return "ifilter(...)";
},toString:m.forward("repr"),next:function(){
while(true){
var rval=seq.next();
if(pred(rval)){
return rval;
}
}
return undefined;
}};
},ifilterfalse:function(pred,seq){
var m=MochiKit.Base;
seq=MochiKit.Iter.iter(seq);
if(pred==null){
pred=m.operator.truth;
}
return {repr:function(){
return "ifilterfalse(...)";
},toString:m.forward("repr"),next:function(){
while(true){
var rval=seq.next();
if(!pred(rval)){
return rval;
}
}
return undefined;
}};
},islice:function(seq){
var self=MochiKit.Iter;
var m=MochiKit.Base;
seq=self.iter(seq);
var _144=0;
var stop=0;
var step=1;
var i=-1;
if(arguments.length==2){
stop=arguments[1];
}else{
if(arguments.length==3){
_144=arguments[1];
stop=arguments[2];
}else{
_144=arguments[1];
stop=arguments[2];
step=arguments[3];
}
}
return {repr:function(){
return "islice("+["...",_144,stop,step].join(", ")+")";
},toString:m.forward("repr"),next:function(){
var rval;
while(i<_144){
rval=seq.next();
i++;
}
if(_144>=stop){
throw self.StopIteration;
}
_144+=step;
return rval;
}};
},imap:function(fun,p,q){
var m=MochiKit.Base;
var self=MochiKit.Iter;
var _148=m.map(self.iter,m.extend(null,arguments,1));
var map=m.map;
var next=self.next;
return {repr:function(){
return "imap(...)";
},toString:m.forward("repr"),next:function(){
return fun.apply(this,map(next,_148));
}};
},applymap:function(fun,seq,self){
seq=MochiKit.Iter.iter(seq);
var m=MochiKit.Base;
return {repr:function(){
return "applymap(...)";
},toString:m.forward("repr"),next:function(){
return fun.apply(self,seq.next());
}};
},chain:function(p,q){
var self=MochiKit.Iter;
var m=MochiKit.Base;
if(arguments.length==1){
return self.iter(arguments[0]);
}
var _150=m.map(self.iter,arguments);
return {repr:function(){
return "chain(...)";
},toString:m.forward("repr"),next:function(){
while(_150.length>1){
try{
return _150[0].next();
}
catch(e){
if(e!=self.StopIteration){
throw e;
}
_150.shift();
}
}
if(_150.length==1){
var arg=_150.shift();
this.next=m.bind("next",arg);
return this.next();
}
throw self.StopIteration;
}};
},takewhile:function(pred,seq){
var self=MochiKit.Iter;
seq=self.iter(seq);
return {repr:function(){
return "takewhile(...)";
},toString:MochiKit.Base.forward("repr"),next:function(){
var rval=seq.next();
if(!pred(rval)){
this.next=function(){
throw self.StopIteration;
};
this.next();
}
return rval;
}};
},dropwhile:function(pred,seq){
seq=MochiKit.Iter.iter(seq);
var m=MochiKit.Base;
var bind=m.bind;
return {"repr":function(){
return "dropwhile(...)";
},"toString":m.forward("repr"),"next":function(){
while(true){
var rval=seq.next();
if(!pred(rval)){
break;
}
}
this.next=bind("next",seq);
return rval;
}};
},_tee:function(_152,sync,_154){
sync.pos[_152]=-1;
var m=MochiKit.Base;
var _155=m.listMin;
return {repr:function(){
return "tee("+_152+", ...)";
},toString:m.forward("repr"),next:function(){
var rval;
var i=sync.pos[_152];
if(i==sync.max){
rval=_154.next();
sync.deque.push(rval);
sync.max+=1;
sync.pos[_152]+=1;
}else{
rval=sync.deque[i-sync.min];
sync.pos[_152]+=1;
if(i==sync.min&&_155(sync.pos)!=sync.min){
sync.min+=1;
sync.deque.shift();
}
}
return rval;
}};
},tee:function(_156,n){
var rval=[];
var sync={"pos":[],"deque":[],"max":-1,"min":-1};
if(arguments.length==1){
n=2;
}
var self=MochiKit.Iter;
_156=self.iter(_156);
var _tee=self._tee;
for(var i=0;i<n;i++){
rval.push(_tee(i,sync,_156));
}
return rval;
},list:function(_158){
var m=MochiKit.Base;
if(typeof (_158.slice)=="function"){
return _158.slice();
}else{
if(m.isArrayLike(_158)){
return m.concat(_158);
}
}
var self=MochiKit.Iter;
_158=self.iter(_158);
var rval=[];
try{
while(true){
rval.push(_158.next());
}
}
catch(e){
if(e!=self.StopIteration){
throw e;
}
return rval;
}
return undefined;
},reduce:function(fn,_159,_160){
var i=0;
var x=_160;
var self=MochiKit.Iter;
_159=self.iter(_159);
if(arguments.length<3){
try{
x=_159.next();
}
catch(e){
if(e==self.StopIteration){
e=new TypeError("reduce() of empty sequence with no initial value");
}
throw e;
}
i++;
}
try{
while(true){
x=fn(x,_159.next());
}
}
catch(e){
if(e!=self.StopIteration){
throw e;
}
}
return x;
},range:function(){
var _162=0;
var stop=0;
var step=1;
if(arguments.length==1){
stop=arguments[0];
}else{
if(arguments.length==2){
_162=arguments[0];
stop=arguments[1];
}else{
if(arguments.length==3){
_162=arguments[0];
stop=arguments[1];
step=arguments[2];
}else{
throw new TypeError("range() takes 1, 2, or 3 arguments!");
}
}
}
if(step==0){
throw new TypeError("range() step must not be 0");
}
return {next:function(){
if((step>0&&_162>=stop)||(step<0&&_162<=stop)){
throw MochiKit.Iter.StopIteration;
}
var rval=_162;
_162+=step;
return rval;
},repr:function(){
return "range("+[_162,stop,step].join(", ")+")";
},toString:MochiKit.Base.forward("repr")};
},sum:function(_163,_164){
var x=_164||0;
var self=MochiKit.Iter;
_163=self.iter(_163);
try{
while(true){
x+=_163.next();
}
}
catch(e){
if(e!=self.StopIteration){
throw e;
}
}
return x;
},exhaust:function(_165){
var self=MochiKit.Iter;
_165=self.iter(_165);
try{
while(true){
_165.next();
}
}
catch(e){
if(e!=self.StopIteration){
throw e;
}
}
},forEach:function(_166,func,self){
var m=MochiKit.Base;
if(arguments.length>2){
func=m.bind(func,self);
}
if(m.isArrayLike(_166)){
try{
for(var i=0;i<_166.length;i++){
func(_166[i]);
}
}
catch(e){
if(e!=MochiKit.Iter.StopIteration){
throw e;
}
}
}else{
self=MochiKit.Iter;
self.exhaust(self.imap(func,_166));
}
},every:function(_168,func){
var self=MochiKit.Iter;
try{
self.ifilterfalse(func,_168).next();
return false;
}
catch(e){
if(e!=self.StopIteration){
throw e;
}
return true;
}
},sorted:function(_169,cmp){
var rval=MochiKit.Iter.list(_169);
if(arguments.length==1){
cmp=MochiKit.Base.compare;
}
rval.sort(cmp);
return rval;
},reversed:function(_170){
var rval=MochiKit.Iter.list(_170);
rval.reverse();
return rval;
},some:function(_171,func){
var self=MochiKit.Iter;
try{
self.ifilter(func,_171).next();
return true;
}
catch(e){
if(e!=self.StopIteration){
throw e;
}
return false;
}
},iextend:function(lst,_172){
if(MochiKit.Base.isArrayLike(_172)){
for(var i=0;i<_172.length;i++){
lst.push(_172[i]);
}
}else{
var self=MochiKit.Iter;
_172=self.iter(_172);
try{
while(true){
lst.push(_172.next());
}
}
catch(e){
if(e!=self.StopIteration){
throw e;
}
}
}
return lst;
},groupby:function(_173,_174){
var m=MochiKit.Base;
var self=MochiKit.Iter;
if(arguments.length<2){
_174=m.operator.identity;
}
_173=self.iter(_173);
var pk=undefined;
var k=undefined;
var v;
function fetch(){
v=_173.next();
k=_174(v);
}
function eat(){
var ret=v;
v=undefined;
return ret;
}
var _177=true;
return {repr:function(){
return "groupby(...)";
},next:function(){
while(k==pk){
fetch();
if(_177){
_177=false;
break;
}
}
pk=k;
return [k,{next:function(){
if(v==undefined){
fetch();
}
if(k!=pk){
throw self.StopIteration;
}
return eat();
}}];
}};
},groupby_as_array:function(_178,_179){
var m=MochiKit.Base;
var self=MochiKit.Iter;
if(arguments.length<2){
_179=m.operator.identity;
}
_178=self.iter(_178);
var _180=[];
var _181=true;
var _182;
while(true){
try{
var _183=_178.next();
var key=_179(_183);
}
catch(e){
if(e==self.StopIteration){
break;
}
throw e;
}
if(_181||key!=_182){
var _184=[];
_180.push([key,_184]);
}
_184.push(_183);
_181=false;
_182=key;
}
return _180;
},arrayLikeIter:function(_185){
var i=0;
return {repr:function(){
return "arrayLikeIter(...)";
},toString:MochiKit.Base.forward("repr"),next:function(){
if(i>=_185.length){
throw MochiKit.Iter.StopIteration;
}
return _185[i++];
}};
},hasIterateNext:function(_186){
return (_186&&typeof (_186.iterateNext)=="function");
},iterateNextIter:function(_187){
return {repr:function(){
return "iterateNextIter(...)";
},toString:MochiKit.Base.forward("repr"),next:function(){
var rval=_187.iterateNext();
if(rval===null||rval===undefined){
throw MochiKit.Iter.StopIteration;
}
return rval;
}};
}});
MochiKit.Iter.EXPORT_OK=["iteratorRegistry","arrayLikeIter","hasIterateNext","iterateNextIter",];
MochiKit.Iter.EXPORT=["StopIteration","registerIteratorFactory","iter","count","cycle","repeat","next","izip","ifilter","ifilterfalse","islice","imap","applymap","chain","takewhile","dropwhile","tee","list","reduce","range","sum","exhaust","forEach","every","sorted","reversed","some","iextend","groupby","groupby_as_array"];
MochiKit.Iter.__new__=function(){
var m=MochiKit.Base;
this.StopIteration=new m.NamedError("StopIteration");
this.iteratorRegistry=new m.AdapterRegistry();
this.registerIteratorFactory("arrayLike",m.isArrayLike,this.arrayLikeIter);
this.registerIteratorFactory("iterateNext",this.hasIterateNext,this.iterateNextIter);
this.EXPORT_TAGS={":common":this.EXPORT,":all":m.concat(this.EXPORT,this.EXPORT_OK)};
m.nameFunctions(this);
};
MochiKit.Iter.__new__();
reduce=MochiKit.Iter.reduce;
MochiKit.Base._exportSymbols(this,MochiKit.Iter);
if(typeof (dojo)!="undefined"){
dojo.provide("MochiKit.Logging");
dojo.require("MochiKit.Base");
}
if(typeof (JSAN)!="undefined"){
JSAN.use("MochiKit.Base",[]);
}
try{
if(typeof (MochiKit.Base)=="undefined"){
throw "";
}
}
catch(e){
throw "MochiKit.Logging depends on MochiKit.Base!";
}
if(typeof (MochiKit.Logging)=="undefined"){
MochiKit.Logging={};
}
MochiKit.Logging.NAME="MochiKit.Logging";
MochiKit.Logging.VERSION="1.3";
MochiKit.Logging.__repr__=function(){
return "["+this.NAME+" "+this.VERSION+"]";
};
MochiKit.Logging.toString=function(){
return this.__repr__();
};
MochiKit.Logging.EXPORT=["LogLevel","LogMessage","Logger","alertListener","logger","log","logError","logDebug","logFatal","logWarning"];
MochiKit.Logging.EXPORT_OK=["logLevelAtLeast","isLogMessage","compareLogMessage"];
MochiKit.Logging.LogMessage=function(num,_189,info){
this.num=num;
this.level=_189;
this.info=info;
this.timestamp=new Date();
};
MochiKit.Logging.LogMessage.prototype={repr:function(){
var m=MochiKit.Base;
return "LogMessage("+m.map(m.repr,[this.num,this.level,this.info]).join(", ")+")";
},toString:MochiKit.Base.forward("repr")};
MochiKit.Base.update(MochiKit.Logging,{logLevelAtLeast:function(_191){
var self=MochiKit.Logging;
if(typeof (_191)=="string"){
_191=self.LogLevel[_191];
}
return function(msg){
var _193=msg.level;
if(typeof (_193)=="string"){
_193=self.LogLevel[_193];
}
return _193>=_191;
};
},isLogMessage:function(){
var _194=MochiKit.Logging.LogMessage;
for(var i=0;i<arguments.length;i++){
if(!(arguments[i] instanceof _194)){
return false;
}
}
return true;
},compareLogMessage:function(a,b){
return MochiKit.Base.compare([a.level,a.info],[b.level,b.info]);
},alertListener:function(msg){
alert("num: "+msg.num+"\nlevel: "+msg.level+"\ninfo: "+msg.info.join(" "));
}});
MochiKit.Logging.Logger=function(_195){
this.counter=0;
if(typeof (_195)=="undefined"||_195==null){
_195=-1;
}
this.maxSize=_195;
this._messages=[];
this.listeners={};
this.useNativeConsole=false;
};
MochiKit.Logging.Logger.prototype={clear:function(){
this._messages.splice(0,this._messages.length);
},logToConsole:function(msg){
if(typeof (window)!="undefined"&&window.console&&window.console.log){
window.console.log(msg);
}else{
if(typeof (opera)!="undefined"&&opera.postError){
opera.postError(msg);
}else{
if(typeof (printfire)=="function"){
printfire(msg);
}
}
}
},dispatchListeners:function(msg){
for(var k in this.listeners){
var pair=this.listeners[k];
if(pair.ident!=k||(pair[0]&&!pair[0](msg))){
continue;
}
pair[1](msg);
}
},addListener:function(_196,_197,_198){
if(typeof (_197)=="string"){
_197=MochiKit.Logging.logLevelAtLeast(_197);
}
var _199=[_197,_198];
_199.ident=_196;
this.listeners[_196]=_199;
},removeListener:function(_200){
delete this.listeners[_200];
},baseLog:function(_201,_202){
var msg=new MochiKit.Logging.LogMessage(this.counter,_201,MochiKit.Base.extend(null,arguments,1));
this._messages.push(msg);
this.dispatchListeners(msg);
if(this.useNativeConsole){
this.logToConsole(msg.level+": "+msg.info.join(" "));
}
this.counter+=1;
while(this.maxSize>=0&&this._messages.length>this.maxSize){
this._messages.shift();
}
},getMessages:function(_203){
var _204=0;
if(!(typeof (_203)=="undefined"||_203==null)){
_204=Math.max(0,this._messages.length-_203);
}
return this._messages.slice(_204);
},getMessageText:function(_205){
if(typeof (_205)=="undefined"||_205==null){
_205=30;
}
var _206=this.getMessages(_205);
if(_206.length){
var lst=map(function(m){
return "\n  ["+m.num+"] "+m.level+": "+m.info.join(" ");
},_206);
lst.unshift("LAST "+_206.length+" MESSAGES:");
return lst.join("");
}
return "";
},debuggingBookmarklet:function(_207){
if(typeof (MochiKit.LoggingPane)=="undefined"){
alert(this.getMessageText());
}else{
MochiKit.LoggingPane.createLoggingPane(_207||false);
}
}};
MochiKit.Logging.__new__=function(){
this.LogLevel={ERROR:40,FATAL:50,WARNING:30,INFO:20,DEBUG:10};
var m=MochiKit.Base;
m.registerComparator("LogMessage",this.isLogMessage,this.compareLogMessage);
var _208=m.partial;
var _209=this.Logger;
var _210=_209.prototype.baseLog;
m.update(this.Logger.prototype,{debug:_208(_210,"DEBUG"),log:_208(_210,"INFO"),error:_208(_210,"ERROR"),fatal:_208(_210,"FATAL"),warning:_208(_210,"WARNING")});
var self=this;
var _211=function(name){
return function(){
self.logger[name].apply(self.logger,arguments);
};
};
this.log=_211("log");
this.logError=_211("error");
this.logDebug=_211("debug");
this.logFatal=_211("fatal");
this.logWarning=_211("warning");
this.logger=new _209();
this.logger.useNativeConsole=true;
this.EXPORT_TAGS={":common":this.EXPORT,":all":m.concat(this.EXPORT,this.EXPORT_OK)};
m.nameFunctions(this);
};
if(typeof (printfire)=="undefined"&&typeof (document)!="undefined"&&document.createEvent){
function printfire(){
printfire.args=arguments;
var ev=document.createEvent("Events");
ev.initEvent("printfire",false,true);
dispatchEvent(ev);
}
}
MochiKit.Logging.__new__();
MochiKit.Base._exportSymbols(this,MochiKit.Logging);
if(typeof (dojo)!="undefined"){
dojo.provide("MochiKit.DateTime");
}
if(typeof (MochiKit)=="undefined"){
MochiKit={};
}
if(typeof (MochiKit.DateTime)=="undefined"){
MochiKit.DateTime={};
}
MochiKit.DateTime.NAME="MochiKit.DateTime";
MochiKit.DateTime.VERSION="1.3";
MochiKit.DateTime.__repr__=function(){
return "["+this.NAME+" "+this.VERSION+"]";
};
MochiKit.DateTime.toString=function(){
return this.__repr__();
};
MochiKit.DateTime.isoDate=function(str){
str=str+"";
if(typeof (str)!="string"||str.length==0){
return null;
}
var iso=str.split("-");
if(iso.length==0){
return null;
}
return new Date(iso[0],iso[1]-1,iso[2]);
};
MochiKit.DateTime._isoRegexp=/(\d{4,})(?:-(\d{1,2})(?:-(\d{1,2})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2})(?:\.(\d+))?)?(?:(Z)|([+-])(\d{1,2})(?::(\d{1,2}))?)?)?)?)?/;
MochiKit.DateTime.isoTimestamp=function(str){
str=str+"";
if(typeof (str)!="string"||str.length==0){
return null;
}
var res=str.match(MochiKit.DateTime._isoRegexp);
if(typeof (res)=="undefined"||res==null){
return null;
}
var year,month,day,hour,min,sec,msec;
year=parseInt(res[1],10);
if(typeof (res[2])=="undefined"||res[2]==""){
return new Date(year);
}
month=parseInt(res[2],10)-1;
day=parseInt(res[3],10);
if(typeof (res[4])=="undefined"||res[4]==""){
return new Date(year,month,day);
}
hour=parseInt(res[4],10);
min=parseInt(res[5],10);
sec=(typeof (res[6])!="undefined"&&res[6]!="")?parseInt(res[6],10):0;
if(typeof (res[7])!="undefined"&&res[7]!=""){
msec=Math.round(1000*parseFloat("0."+res[7]));
}else{
msec=0;
}
if((typeof (res[8])=="undefined"||res[8]=="")&&(typeof (res[9])=="undefined"||res[9]=="")){
return new Date(year,month,day,hour,min,sec,msec);
}
var ofs;
if(typeof (res[9])!="undefined"&&res[9]!=""){
ofs=parseInt(res[10],10)*3600000;
if(typeof (res[11])!="undefined"&&res[11]!=""){
ofs+=parseInt(res[11],10)*60000;
}
if(res[9]=="-"){
ofs=-ofs;
}
}else{
ofs=0;
}
return new Date(Date.UTC(year,month,day,hour,min,sec,msec)-ofs);
};
MochiKit.DateTime.toISOTime=function(date,_218){
if(typeof (date)=="undefined"||date==null){
return null;
}
var hh=date.getHours();
var mm=date.getMinutes();
var ss=date.getSeconds();
var lst=[((_218&&(hh<10))?"0"+hh:hh),((mm<10)?"0"+mm:mm),((ss<10)?"0"+ss:ss)];
return lst.join(":");
};
MochiKit.DateTime.toISOTimestamp=function(date,_222){
if(typeof (date)=="undefined"||date==null){
return null;
}
var sep=_222?"T":" ";
var foot=_222?"Z":"";
if(_222){
date=new Date(date.getTime()+(date.getTimezoneOffset()*60000));
}
return MochiKit.DateTime.toISODate(date)+sep+MochiKit.DateTime.toISOTime(date,_222)+foot;
};
MochiKit.DateTime.toISODate=function(date){
if(typeof (date)=="undefined"||date==null){
return null;
}
var _225=MochiKit.DateTime._padTwo;
return [date.getFullYear(),_225(date.getMonth()+1),_225(date.getDate())].join("-");
};
MochiKit.DateTime.americanDate=function(d){
d=d+"";
if(typeof (d)!="string"||d.length==0){
return null;
}
var a=d.split("/");
return new Date(a[2],a[0]-1,a[1]);
};
MochiKit.DateTime._padTwo=function(n){
return (n>9)?n:"0"+n;
};
MochiKit.DateTime.toPaddedAmericanDate=function(d){
if(typeof (d)=="undefined"||d==null){
return null;
}
var _227=MochiKit.DateTime._padTwo;
return [_227(d.getMonth()+1),_227(d.getDate()),d.getFullYear()].join("/");
};
MochiKit.DateTime.toAmericanDate=function(d){
if(typeof (d)=="undefined"||d==null){
return null;
}
return [d.getMonth()+1,d.getDate(),d.getFullYear()].join("/");
};
MochiKit.DateTime.EXPORT=["isoDate","isoTimestamp","toISOTime","toISOTimestamp","toISODate","americanDate","toPaddedAmericanDate","toAmericanDate"];
MochiKit.DateTime.EXPORT_OK=[];
MochiKit.DateTime.EXPORT_TAGS={":common":MochiKit.DateTime.EXPORT,":all":MochiKit.DateTime.EXPORT};
MochiKit.DateTime.__new__=function(){
var base=this.NAME+".";
for(var k in this){
var o=this[k];
if(typeof (o)=="function"&&typeof (o.NAME)=="undefined"){
try{
o.NAME=base+k;
}
catch(e){
}
}
}
};
MochiKit.DateTime.__new__();
if(typeof (MochiKit.Base)!="undefined"){
MochiKit.Base._exportSymbols(this,MochiKit.DateTime);
}else{
(function(_228,_229){
if((typeof (JSAN)=="undefined"&&typeof (dojo)=="undefined")||(typeof (MochiKit.__compat__)=="boolean"&&MochiKit.__compat__)){
var all=_229.EXPORT_TAGS[":all"];
for(var i=0;i<all.length;i++){
_228[all[i]]=_229[all[i]];
}
}
})(this,MochiKit.DateTime);
}
if(typeof (dojo)!="undefined"){
dojo.provide("MochiKit.Format");
}
if(typeof (MochiKit)=="undefined"){
MochiKit={};
}
if(typeof (MochiKit.Format)=="undefined"){
MochiKit.Format={};
}
MochiKit.Format.NAME="MochiKit.Format";
MochiKit.Format.VERSION="1.3";
MochiKit.Format.__repr__=function(){
return "["+this.NAME+" "+this.VERSION+"]";
};
MochiKit.Format.toString=function(){
return this.__repr__();
};
MochiKit.Format._numberFormatter=function(_230,_231,_232,_233,_234,_235,_236,_237,_238){
return function(num){
num=parseFloat(num);
if(typeof (num)=="undefined"||num==null||isNaN(num)){
return _230;
}
var _239=_231;
var _240=_232;
if(num<0){
num=-num;
}else{
_239=_239.replace(/-/,"");
}
var me=arguments.callee;
var fmt=MochiKit.Format.formatLocale(_233);
if(_234){
num=num*100;
_240=fmt.percent+_240;
}
num=MochiKit.Format.roundToFixed(num,_235);
var _242=num.split(/\./);
var _243=_242[0];
var frac=(_242.length==1)?"":_242[1];
var res="";
while(_243.length<_236){
_243="0"+_243;
}
if(_237){
while(_243.length>_237){
var i=_243.length-_237;
res=fmt.separator+_243.substring(i,_243.length)+res;
_243=_243.substring(0,i);
}
}
res=_243+res;
if(_235>0){
while(frac.length<_238){
frac=frac+"0";
}
res=res+fmt.decimal+frac;
}
return _239+res+_240;
};
};
MochiKit.Format.numberFormatter=function(_245,_246,_247){
if(typeof (_246)=="undefined"){
_246="";
}
var _248=_245.match(/((?:[0#]+,)?[0#]+)(?:\.([0#]+))?(%)?/);
if(!_248){
throw TypeError("Invalid pattern");
}
var _249=_245.substr(0,_248.index);
var _250=_245.substr(_248.index+_248[0].length);
if(_249.search(/-/)==-1){
_249=_249+"-";
}
var _251=_248[1];
var frac=(typeof (_248[2])=="string"&&_248[2]!="")?_248[2]:"";
var _252=(typeof (_248[3])=="string"&&_248[3]!="");
var tmp=_251.split(/,/);
var _254;
if(typeof (_247)=="undefined"){
_247="default";
}
if(tmp.length==1){
_254=null;
}else{
_254=tmp[1].length;
}
var _255=_251.length-_251.replace(/0/g,"").length;
var _256=frac.length-frac.replace(/0/g,"").length;
var _257=frac.length;
var rval=MochiKit.Format._numberFormatter(_246,_249,_250,_247,_252,_257,_255,_254,_256);
var m=MochiKit.Base;
if(m){
var fn=arguments.callee;
var args=m.concat(arguments);
rval.repr=function(){
return [self.NAME,"(",map(m.repr,args).join(", "),")"].join("");
};
}
return rval;
};
MochiKit.Format.formatLocale=function(_259){
if(typeof (_259)=="undefined"||_259==null){
_259="default";
}
if(typeof (_259)=="string"){
var rval=MochiKit.Format.LOCALE[_259];
if(typeof (rval)=="string"){
rval=arguments.callee(rval);
MochiKit.Format.LOCALE[_259]=rval;
}
return rval;
}else{
return _259;
}
};
MochiKit.Format.twoDigitAverage=function(_260,_261){
if(_261){
var res=_260/_261;
if(!isNaN(res)){
return MochiKit.Format.twoDigitFloat(_260/_261);
}
}
return "0";
};
MochiKit.Format.twoDigitFloat=function(_262){
var sign=(_262<0?"-":"");
var s=Math.floor(Math.abs(_262)*100).toString();
if(s=="0"){
return s;
}
if(s.length<3){
while(s.charAt(s.length-1)=="0"){
s=s.substring(0,s.length-1);
}
return sign+"0."+s;
}
var head=sign+s.substring(0,s.length-2);
var tail=s.substring(s.length-2,s.length);
if(tail=="00"){
return head;
}else{
if(tail.charAt(1)=="0"){
return head+"."+tail.charAt(0);
}else{
return head+"."+tail;
}
}
};
MochiKit.Format.lstrip=function(str,_267){
str=str+"";
if(typeof (str)!="string"){
return null;
}
if(!_267){
return str.replace(/^\s+/,"");
}else{
return str.replace(new RegExp("^["+_267+"]+"),"");
}
};
MochiKit.Format.rstrip=function(str,_268){
str=str+"";
if(typeof (str)!="string"){
return null;
}
if(!_268){
return str.replace(/\s+$/,"");
}else{
return str.replace(new RegExp("["+_268+"]+$"),"");
}
};
MochiKit.Format.strip=function(str,_269){
var self=MochiKit.Format;
return self.rstrip(self.lstrip(str,_269),_269);
};
MochiKit.Format.truncToFixed=function(_270,_271){
_270=Math.floor(_270*Math.pow(10,_271));
var res=(_270*Math.pow(10,-_271)).toFixed(_271);
if(res.charAt(0)=="."){
res="0"+res;
}
return res;
};
MochiKit.Format.roundToFixed=function(_272,_273){
return MochiKit.Format.truncToFixed(_272+0.5*Math.pow(10,-_273),_273);
};
MochiKit.Format.percentFormat=function(_274){
return MochiKit.Format.twoDigitFloat(100*_274)+"%";
};
MochiKit.Format.EXPORT=["truncToFixed","roundToFixed","numberFormatter","formatLocale","twoDigitAverage","twoDigitFloat","percentFormat","lstrip","rstrip","strip"];
MochiKit.Format.LOCALE={en_US:{separator:",",decimal:".",percent:"%"},de_DE:{separator:".",decimal:",",percent:"%"},fr_FR:{separator:" ",decimal:",",percent:"%"},"default":"en_US"};
MochiKit.Format.EXPORT_OK=[];
MochiKit.Format.EXPORT_TAGS={":all":MochiKit.Format.EXPORT,":common":MochiKit.Format.EXPORT};
MochiKit.Format.__new__=function(){
var base=this.NAME+".";
var k,v,o;
for(k in this.LOCALE){
o=this.LOCALE[k];
if(typeof (o)=="object"){
o.repr=function(){
return this.NAME;
};
o.NAME=base+"LOCALE."+k;
}
}
for(k in this){
o=this[k];
if(typeof (o)=="function"&&typeof (o.NAME)=="undefined"){
try{
o.NAME=base+k;
}
catch(e){
}
}
}
};
MochiKit.Format.__new__();
if(typeof (MochiKit.Base)!="undefined"){
MochiKit.Base._exportSymbols(this,MochiKit.Format);
}else{
(function(_275,_276){
if((typeof (JSAN)=="undefined"&&typeof (dojo)=="undefined")||(typeof (MochiKit.__compat__)=="boolean"&&MochiKit.__compat__)){
var all=_276.EXPORT_TAGS[":all"];
for(var i=0;i<all.length;i++){
_275[all[i]]=_276[all[i]];
}
}
})(this,MochiKit.Format);
}
if(typeof (dojo)!="undefined"){
dojo.provide("MochiKit.Async");
dojo.require("MochiKit.Base");
}
if(typeof (JSAN)!="undefined"){
JSAN.use("MochiKit.Base",[]);
}
try{
if(typeof (MochiKit.Base)=="undefined"){
throw "";
}
}
catch(e){
throw "MochiKit.Async depends on MochiKit.Base!";
}
if(typeof (MochiKit.Async)=="undefined"){
MochiKit.Async={};
}
MochiKit.Async.NAME="MochiKit.Async";
MochiKit.Async.VERSION="1.3";
MochiKit.Async.__repr__=function(){
return "["+this.NAME+" "+this.VERSION+"]";
};
MochiKit.Async.toString=function(){
return this.__repr__();
};
MochiKit.Async.Deferred=function(_277){
this.chain=[];
this.id=this._nextId();
this.fired=-1;
this.paused=0;
this.results=[null,null];
this.canceller=_277;
this.silentlyCancelled=false;
this.chained=false;
};
MochiKit.Async.Deferred.prototype={repr:function(){
var _278;
if(this.fired==-1){
_278="unfired";
}else{
if(this.fired==0){
_278="success";
}else{
_278="error";
}
}
return "Deferred("+this.id+", "+_278+")";
},toString:MochiKit.Base.forward("repr"),_nextId:MochiKit.Base.counter(),cancel:function(){
var self=MochiKit.Async;
if(this.fired==-1){
if(this.canceller){
this.canceller(this);
}else{
this.silentlyCancelled=true;
}
if(this.fired==-1){
this.errback(new self.CancelledError(this));
}
}else{
if((this.fired==0)&&(this.results[0] instanceof self.Deferred)){
this.results[0].cancel();
}
}
},_pause:function(){
this.paused++;
},_unpause:function(){
this.paused--;
if((this.paused==0)&&(this.fired>=0)){
this._fire();
}
},_continue:function(res){
this._resback(res);
this._unpause();
},_resback:function(res){
this.fired=((res instanceof Error)?1:0);
this.results[this.fired]=res;
this._fire();
},_check:function(){
if(this.fired!=-1){
if(!this.silentlyCancelled){
throw new MochiKit.Async.AlreadyCalledError(this);
}
this.silentlyCancelled=false;
return;
}
},callback:function(res){
this._check();
if(res instanceof MochiKit.Async.Deferred){
throw new Error("Deferred instances can only be chained if they are the result of a callback");
}
this._resback(res);
},errback:function(res){
this._check();
var self=MochiKit.Async;
if(res instanceof self.Deferred){
throw new Error("Deferred instances can only be chained if they are the result of a callback");
}
if(!(res instanceof Error)){
res=new self.GenericError(res);
}
this._resback(res);
},addBoth:function(fn){
if(arguments.length>1){
fn=MochiKit.Base.partial.apply(null,arguments);
}
return this.addCallbacks(fn,fn);
},addCallback:function(fn){
if(arguments.length>1){
fn=MochiKit.Base.partial.apply(null,arguments);
}
return this.addCallbacks(fn,null);
},addErrback:function(fn){
if(arguments.length>1){
fn=MochiKit.Base.partial.apply(null,arguments);
}
return this.addCallbacks(null,fn);
},addCallbacks:function(cb,eb){
if(this.chained){
throw new Error("Chained Deferreds can not be re-used");
}
this.chain.push([cb,eb]);
if(this.fired>=0){
this._fire();
}
return this;
},_fire:function(){
var _281=this.chain;
var _282=this.fired;
var res=this.results[_282];
var self=this;
var cb=null;
while(_281.length>0&&this.paused==0){
var pair=_281.shift();
var f=pair[_282];
if(f==null){
continue;
}
try{
res=f(res);
_282=((res instanceof Error)?1:0);
if(res instanceof MochiKit.Async.Deferred){
cb=function(res){
self._continue(res);
};
this._pause();
}
}
catch(err){
_282=1;
if(!(err instanceof Error)){
err=new MochiKit.Async.GenericError(err);
}
res=err;
}
}
this.fired=_282;
this.results[_282]=res;
if(cb&&this.paused){
res.addBoth(cb);
res.chained=true;
}
}};
MochiKit.Base.update(MochiKit.Async,{evalJSONRequest:function(){
return eval("("+arguments[0].responseText+")");
},succeed:function(_284){
var d=new MochiKit.Async.Deferred();
d.callback.apply(d,arguments);
return d;
},fail:function(_285){
var d=new MochiKit.Async.Deferred();
d.errback.apply(d,arguments);
return d;
},getXMLHttpRequest:function(){
var self=arguments.callee;
if(!self.XMLHttpRequest){
var _286=[function(){
return new XMLHttpRequest();
},function(){
return new ActiveXObject("Msxml2.XMLHTTP");
},function(){
return new ActiveXObject("Microsoft.XMLHTTP");
},function(){
return new ActiveXObject("Msxml2.XMLHTTP.4.0");
},function(){
throw new MochiKit.Async.BrowserComplianceError("Browser does not support XMLHttpRequest");
}];
for(var i=0;i<_286.length;i++){
var func=_286[i];
try{
self.XMLHttpRequest=func;
return func();
}
catch(e){
}
}
}
return self.XMLHttpRequest();
},sendXMLHttpRequest:function(req,_288){
if(_288==null){
_288="";
}
var _289=function(){
try{
req.onreadystatechange=null;
}
catch(e){
try{
req.onreadystatechange=function(){
};
}
catch(e){
}
}
req.abort();
};
var self=MochiKit.Async;
var d=new self.Deferred(_289);
var _290=function(){
if(req.readyState==4){
try{
req.onreadystatechange=null;
}
catch(e){
try{
req.onreadystatechange=function(){
};
}
catch(e){
}
}
var _291=null;
try{
_291=req.status;
if(!_291&&MochiKit.Base.isNotEmpty(req.responseText)){
_291=304;
}
}
catch(e){
}
if(_291==200||_291==304){
d.callback(req);
}else{
var err=new self.XMLHttpRequestError(req,"Request failed");
if(err.number){
d.errback(err);
}else{
d.errback(err);
}
}
}
};
try{
req.onreadystatechange=_290;
req.send(_288);
}
catch(e){
try{
req.onreadystatechange=null;
}
catch(ignore){
}
d.errback(e);
}
return d;
},doSimpleXMLHttpRequest:function(url){
var self=MochiKit.Async;
var req=self.getXMLHttpRequest();
if(arguments.length>1){
var m=MochiKit.Base;
var qs=m.queryString.apply(null,m.extend(null,arguments,1));
if(qs){
url+="?"+qs;
}
}
req.open("GET",url,true);
return self.sendXMLHttpRequest(req);
},loadJSONDoc:function(url){
var self=MochiKit.Async;
var d=self.doSimpleXMLHttpRequest.apply(self,arguments);
d=d.addCallback(self.evalJSONRequest);
return d;
},wait:function(_295,_296){
var d=new MochiKit.Async.Deferred();
var m=MochiKit.Base;
if(typeof (_296)!="undefined"){
d.addCallback(function(){
return _296;
});
}
var _297=setTimeout(m.bind("callback",d),Math.floor(_295*1000));
d.canceller=function(){
try{
clearTimeout(_297);
}
catch(e){
}
};
return d;
},callLater:function(_298,func){
var m=MochiKit.Base;
var _299=m.partial.apply(m,m.extend(null,arguments,1));
return MochiKit.Async.wait(_298).addCallback(function(res){
return _299();
});
}});
MochiKit.Async.DeferredLock=function(){
this.waiting=[];
this.locked=false;
this.id=this._nextId();
};
MochiKit.Async.DeferredLock.prototype={__class__:MochiKit.Async.DeferredLock,acquire:function(){
d=new MochiKit.Async.Deferred();
if(this.locked){
this.waiting.push(d);
}else{
this.locked=true;
d.callback(this);
}
return d;
},release:function(){
if(!this.locked){
throw TypeError("Tried to release an unlocked DeferredLock");
}
this.locked=false;
if(this.waiting.length>0){
this.locked=true;
this.waiting.shift().callback(this);
}
},_nextId:MochiKit.Base.counter(),repr:function(){
var _300;
if(this.locked){
_300="locked, "+this.waiting.length+" waiting";
}else{
_300="unlocked";
}
return "DeferredLock("+this.id+", "+_300+")";
},toString:MochiKit.Base.forward("repr")};
MochiKit.Async.DeferredList=function(list,_302,_303,_304,_305){
this.list=list;
this.resultList=new Array(this.list.length);
this.chain=[];
this.id=this._nextId();
this.fired=-1;
this.paused=0;
this.results=[null,null];
this.canceller=_305;
this.silentlyCancelled=false;
if(this.list.length==0&&!_302){
this.callback(this.resultList);
}
this.finishedCount=0;
this.fireOnOneCallback=_302;
this.fireOnOneErrback=_303;
this.consumeErrors=_304;
var _306=0;
MochiKit.Base.map(MochiKit.Base.bind(function(d){
d.addCallback(MochiKit.Base.bind(this._cbDeferred,this),_306,true);
d.addErrback(MochiKit.Base.bind(this._cbDeferred,this),_306,false);
_306+=1;
},this),this.list);
};
MochiKit.Base.update(MochiKit.Async.DeferredList.prototype,MochiKit.Async.Deferred.prototype);
MochiKit.Base.update(MochiKit.Async.DeferredList.prototype,{_cbDeferred:function(_307,_308,_309){
this.resultList[_307]=[_308,_309];
this.finishedCount+=1;
if(this.fired!=0){
if(_308&&this.fireOnOneCallback){
this.callback([_307,_309]);
}else{
if(!_308&&this.fireOnOneErrback){
this.errback(_309);
}else{
if(this.finishedCount==this.list.length){
this.callback(this.resultList);
}
}
}
}
if(!_308&&this.consumeErrors){
_309=null;
}
return _309;
}});
MochiKit.Async.gatherResults=function(_310){
var d=new MochiKit.Async.DeferredList(_310,false,true,false);
d.addCallback(function(_311){
var ret=[];
for(var i=0;i<_311.length;i++){
ret.push(_311[i][1]);
}
return ret;
});
return d;
};
MochiKit.Async.maybeDeferred=function(func){
var self=MochiKit.Async;
var _312;
try{
var r=func.apply(null,MochiKit.Base.extend([],arguments,1));
if(r instanceof self.Deferred){
_312=r;
}else{
if(r instanceof Error){
_312=self.fail(r);
}else{
_312=self.succeed(r);
}
}
}
catch(e){
_312=self.fail(e);
}
return _312;
};
MochiKit.Async.EXPORT=["AlreadyCalledError","CancelledError","BrowserComplianceError","GenericError","XMLHttpRequestError","Deferred","succeed","fail","getXMLHttpRequest","doSimpleXMLHttpRequest","loadJSONDoc","wait","callLater","sendXMLHttpRequest","DeferredLock","DeferredList","gatherResults","maybeDeferred"];
MochiKit.Async.EXPORT_OK=["evalJSONRequest"];
MochiKit.Async.__new__=function(){
var m=MochiKit.Base;
var ne=m.partial(m._newNamedError,this);
ne("AlreadyCalledError",function(_315){
this.deferred=_315;
});
ne("CancelledError",function(_316){
this.deferred=_316;
});
ne("BrowserComplianceError",function(msg){
this.message=msg;
});
ne("GenericError",function(msg){
this.message=msg;
});
ne("XMLHttpRequestError",function(req,msg){
this.req=req;
this.message=msg;
try{
this.number=req.status;
}
catch(e){
}
});
this.EXPORT_TAGS={":common":this.EXPORT,":all":m.concat(this.EXPORT,this.EXPORT_OK)};
m.nameFunctions(this);
};
MochiKit.Async.__new__();
MochiKit.Base._exportSymbols(this,MochiKit.Async);
if(typeof (dojo)!="undefined"){
dojo.provide("MochiKit.DOM");
dojo.require("MochiKit.Iter");
}
if(typeof (JSAN)!="undefined"){
JSAN.use("MochiKit.Iter",[]);
}
try{
if(typeof (MochiKit.Iter)=="undefined"){
throw "";
}
}
catch(e){
throw "MochiKit.DOM depends on MochiKit.Iter!";
}
if(typeof (MochiKit.DOM)=="undefined"){
MochiKit.DOM={};
}
MochiKit.DOM.NAME="MochiKit.DOM";
MochiKit.DOM.VERSION="1.3";
MochiKit.DOM.__repr__=function(){
return "["+this.NAME+" "+this.VERSION+"]";
};
MochiKit.DOM.toString=function(){
return this.__repr__();
};
MochiKit.DOM.EXPORT=["formContents","currentWindow","currentDocument","withWindow","withDocument","registerDOMConverter","coerceToDOM","createDOM","createDOMFunc","getNodeAttribute","setNodeAttribute","updateNodeAttributes","appendChildNodes","replaceChildNodes","removeElement","swapDOM","BUTTON","TT","PRE","H1","H2","H3","BR","CANVAS","HR","LABEL","TEXTAREA","FORM","STRONG","SELECT","OPTION","OPTGROUP","LEGEND","FIELDSET","P","UL","OL","LI","TD","TR","THEAD","TBODY","TFOOT","TABLE","TH","INPUT","SPAN","A","DIV","IMG","getElement","$","computedStyle","getElementsByTagAndClassName","addToCallStack","addLoadEvent","focusOnLoad","setElementClass","toggleElementClass","addElementClass","removeElementClass","swapElementClass","hasElementClass","escapeHTML","toHTML","emitHTML","setDisplayForElement","hideElement","showElement","scrapeText","elementDimensions","elementPosition","setElementDimensions","setElementPosition","getViewportDimensions","setOpacity"];
MochiKit.DOM.EXPORT_OK=["domConverters"];
MochiKit.DOM.Dimensions=function(w,h){
this.w=w;
this.h=h;
};
MochiKit.DOM.Dimensions.prototype.repr=function(){
var repr=MochiKit.Base.repr;
return "{w: "+repr(this.w)+", h: "+repr(this.h)+"}";
};
MochiKit.DOM.Coordinates=function(x,y){
this.x=x;
this.y=y;
};
MochiKit.DOM.Coordinates.prototype.repr=function(){
var repr=MochiKit.Base.repr;
return "{x: "+repr(this.x)+", y: "+repr(this.y)+"}";
};
MochiKit.DOM.Coordinates.prototype.toString=function(){
return this.repr();
};
MochiKit.Base.update(MochiKit.DOM,{setOpacity:function(elem,o){
elem=MochiKit.DOM.getElement(elem);
MochiKit.DOM.updateNodeAttributes(elem,{"style":{"opacity":o,"-moz-opacity":o,"-khtml-opacity":o,"filter":" alpha(opacity="+(o*100)+")"}});
},getViewportDimensions:function(){
var d=new MochiKit.DOM.Dimensions();
var w=MochiKit.DOM._window;
var b=MochiKit.DOM._document.body;
if(w.innerWidth){
d.w=w.innerWidth;
d.h=w.innerHeight;
}else{
if(b.parentElement.clientWidth){
d.w=b.parentElement.clientWidth;
d.h=b.parentElement.clientHeight;
}else{
if(b&&b.clientWidth){
d.w=b.clientWidth;
d.h=b.clientHeight;
}
}
}
return d;
},elementDimensions:function(elem){
var self=MochiKit.DOM;
if(typeof (elem.w)=="number"||typeof (elem.h)=="number"){
return new self.Dimensions(elem.w||0,elem.h||0);
}
elem=self.getElement(elem);
if(!elem){
return undefined;
}
if(self.computedStyle(elem,"display")!="none"){
return new self.Dimensions(elem.offsetWidth||0,elem.offsetHeight||0);
}
var s=elem.style;
var _321=s.visibility;
var _322=s.position;
s.visibility="hidden";
s.position="absolute";
s.display="";
var _323=elem.offsetWidth;
var _324=elem.offsetHeight;
s.display="none";
s.position=_322;
s.visibility=_321;
return new self.Dimensions(_323,_324);
},elementPosition:function(elem,_325){
var self=MochiKit.DOM;
elem=self.getElement(elem);
if(!elem){
return undefined;
}
var c=new self.Coordinates(0,0);
if(elem.x&&elem.y){
c.x+=elem.x||0;
c.y+=elem.y||0;
return c;
}else{
if(elem.parentNode===null||self.computedStyle(elem,"display")=="none"){
return undefined;
}
}
var box=null;
var _328=null;
var d=MochiKit.DOM._document;
var de=d.documentElement;
var b=d.body;
if(elem.getBoundingClientRect){
box=elem.getBoundingClientRect();
c.x+=box.left+(de.scrollLeft||b.scrollLeft)-(de.clientLeft||b.clientLeft);
c.y+=box.top+(de.scrollTop||b.scrollTop)-(de.clientTop||b.clientTop);
}else{
if(d.getBoxObjectFor){
box=d.getBoxObjectFor(elem);
c.x+=box.x;
c.y+=box.y;
}else{
if(elem.offsetParent){
c.x+=elem.offsetLeft;
c.y+=elem.offsetTop;
_328=elem.offsetParent;
if(_328!=elem){
while(_328){
c.x+=_328.offsetLeft;
c.y+=_328.offsetTop;
_328=_328.offsetParent;
}
}
var ua=navigator.userAgent.toLowerCase();
if(ua.indexOf("opera")!=-1||(ua.indexOf("safari")!=-1&&self.computedStyle(elem,"position")=="absolute")){
c.x-=b.offsetLeft;
c.y-=b.offsetTop;
}
}
}
}
if(typeof (_325)!="undefined"){
_325=arguments.callee(_325);
if(_325){
c.x-=(_325.x||0);
c.y-=(_325.y||0);
}
}
if(elem.parentNode){
_328=elem.parentNode;
}else{
_328=null;
}
while(_328&&_328.tagName!="BODY"&&_328.tagName!="HTML"){
c.x-=_328.scrollLeft;
c.y-=_328.scrollTop;
if(_328.parentNode){
_328=_328.parentNode;
}else{
_328=null;
}
}
return c;
},setElementDimensions:function(elem,_331,_332){
elem=MochiKit.DOM.getElement(elem);
if(typeof (_332)=="undefined"){
_332="px";
}
MochiKit.DOM.updateNodeAttributes(elem,{"style":{"width":_331.w+_332,"height":_331.h+_332}});
},setElementPosition:function(elem,_333,_334){
elem=MochiKit.DOM.getElement(elem);
if(typeof (_334)=="undefined"){
_334="px";
}
MochiKit.DOM.updateNodeAttributes(elem,{"style":{"left":_333.x+_334,"top":_333.y+_334}});
},currentWindow:function(){
return MochiKit.DOM._window;
},currentDocument:function(){
return MochiKit.DOM._document;
},withWindow:function(win,func){
var self=MochiKit.DOM;
var _336=self._document;
var _337=self._win;
var rval;
try{
self._window=win;
self._document=win.document;
rval=func();
}
catch(e){
self._window=_337;
self._document=_336;
throw e;
}
self._window=_337;
self._document=_336;
return rval;
},formContents:function(elem){
var _338=[];
var _339=[];
var m=MochiKit.Base;
var self=MochiKit.DOM;
if(typeof (elem)=="undefined"||elem===null){
elem=self._document;
}else{
elem=self.getElement(elem);
}
m.nodeWalk(elem,function(elem){
var name=elem.name;
if(m.isNotEmpty(name)){
var _340=elem.nodeName;
if(_340=="INPUT"&&(elem.type=="radio"||elem.type=="checkbox")&&!elem.checked){
return null;
}
if(_340=="SELECT"){
if(elem.selectedIndex>=0){
var opt=elem.options[elem.selectedIndex];
_338.push(name);
_339.push((opt.value)?opt.value:opt.text);
return null;
}
_338.push(name);
_339.push("");
return null;
}
if(_340=="FORM"||_340=="P"||_340=="SPAN"||_340=="DIV"){
return elem.childNodes;
}
_338.push(name);
_339.push(elem.value||"");
return null;
}
return elem.childNodes;
});
return [_338,_339];
},withDocument:function(doc,func){
var self=MochiKit.DOM;
var _343=self._document;
var rval;
try{
self._document=doc;
rval=func();
}
catch(e){
self._document=_343;
throw e;
}
self._document=_343;
return rval;
},registerDOMConverter:function(name,_344,wrap,_345){
MochiKit.DOM.domConverters.register(name,_344,wrap,_345);
},coerceToDOM:function(node,ctx){
var im=MochiKit.Iter;
var self=MochiKit.DOM;
var iter=im.iter;
var _349=im.repeat;
var imap=im.imap;
var _351=self.domConverters;
var _352=self.coerceToDOM;
var _353=MochiKit.Base.NotFound;
while(true){
if(typeof (node)=="undefined"||node===null){
return null;
}
if(typeof (node.nodeType)!="undefined"&&node.nodeType>0){
return node;
}
if(typeof (node)=="number"||typeof (node)=="bool"){
node=node.toString();
}
if(typeof (node)=="string"){
return self._document.createTextNode(node);
}
if(typeof (node.toDOM)=="function"){
node=node.toDOM(ctx);
continue;
}
if(typeof (node)=="function"){
node=node(ctx);
continue;
}
var _354=null;
try{
_354=iter(node);
}
catch(e){
}
if(_354){
return imap(_352,_354,_349(ctx));
}
try{
node=_351.match(node,ctx);
continue;
}
catch(e){
if(e!=_353){
throw e;
}
}
return self._document.createTextNode(node.toString());
}
return undefined;
},setNodeAttribute:function(node,attr,_356){
var o={};
o[attr]=_356;
try{
return MochiKit.DOM.updateNodeAttributes(node,o);
}
catch(e){
}
return null;
},getNodeAttribute:function(node,attr){
var self=MochiKit.DOM;
var _357=self.attributeArray.renames[attr];
node=self.getElement(node);
try{
if(_357){
return node[_357];
}
return node.getAttribute(attr);
}
catch(e){
}
return null;
},updateNodeAttributes:function(node,_358){
var elem=node;
var self=MochiKit.DOM;
if(typeof (node)=="string"){
elem=self.getElement(node);
}
if(_358){
var _359=MochiKit.Base.updatetree;
if(self.attributeArray.compliant){
for(var k in _358){
var v=_358[k];
if(typeof (v)=="object"&&typeof (elem[k])=="object"){
_359(elem[k],v);
}else{
if(k.substring(0,2)=="on"){
if(typeof (v)=="string"){
v=new Function(v);
}
elem[k]=v;
}else{
elem.setAttribute(k,v);
}
}
}
}else{
var _360=self.attributeArray.renames;
for(k in _358){
v=_358[k];
var _361=_360[k];
if(k=="style"&&typeof (v)=="string"){
elem.style.cssText=v;
}else{
if(typeof (_361)=="string"){
elem[_361]=v;
}else{
if(typeof (elem[k])=="object"&&typeof (v)=="object"){
_359(elem[k],v);
}else{
if(k.substring(0,2)=="on"){
if(typeof (v)=="string"){
v=new Function(v);
}
elem[k]=v;
}else{
elem.setAttribute(k,v);
}
}
}
}
}
}
}
return elem;
},appendChildNodes:function(node){
var elem=node;
var self=MochiKit.DOM;
if(typeof (node)=="string"){
elem=self.getElement(node);
}
var _362=[self.coerceToDOM(MochiKit.Base.extend(null,arguments,1),elem)];
var _363=MochiKit.Base.concat;
while(_362.length){
var n=_362.shift();
if(typeof (n)=="undefined"||n===null){
}else{
if(typeof (n.nodeType)=="number"){
elem.appendChild(n);
}else{
_362=_363(n,_362);
}
}
}
return elem;
},replaceChildNodes:function(node){
var elem=node;
var self=MochiKit.DOM;
if(typeof (node)=="string"){
elem=self.getElement(node);
arguments[0]=elem;
}
var _364;
while((_364=elem.firstChild)){
elem.removeChild(_364);
}
if(arguments.length<2){
return elem;
}else{
return self.appendChildNodes.apply(this,arguments);
}
},createDOM:function(name,_365){
var elem;
var self=MochiKit.DOM;
var m=MochiKit.Base;
if(typeof (_365)=="string"){
var args=m.extend([name,null],arguments,1);
return arguments.callee.apply(this,args);
}
if(typeof (name)=="string"){
if(_365&&"name" in _365&&!self.attributeArray.compliant){
name=("<"+name+" name=\""+self.escapeHTML(_365.name)+"\">");
}
elem=self._document.createElement(name);
}else{
elem=name;
}
if(_365){
self.updateNodeAttributes(elem,_365);
}
if(arguments.length<=2){
return elem;
}else{
var args=m.extend([elem],arguments,2);
return self.appendChildNodes.apply(this,args);
}
},createDOMFunc:function(){
var m=MochiKit.Base;
return m.partial.apply(this,m.extend([MochiKit.DOM.createDOM],arguments));
},swapDOM:function(dest,src){
var self=MochiKit.DOM;
dest=self.getElement(dest);
var _368=dest.parentNode;
if(src){
src=self.getElement(src);
_368.replaceChild(src,dest);
}else{
_368.removeChild(dest);
}
return src;
},getElement:function(id){
var self=MochiKit.DOM;
if(arguments.length==1){
return ((typeof (id)=="string")?self._document.getElementById(id):id);
}else{
return MochiKit.Base.map(self.getElement,arguments);
}
},computedStyle:function(_370,_371,_372){
if(arguments.length==2){
_372=_371;
}
var self=MochiKit.DOM;
var el=self.getElement(_370);
var _374=self._document;
if(!el||el==_374){
return undefined;
}
if(el.currentStyle){
return el.currentStyle[_371];
}
if(typeof (_374.defaultView)=="undefined"){
return undefined;
}
if(_374.defaultView===null){
return undefined;
}
var _375=_374.defaultView.getComputedStyle(el,null);
if(typeof (_375)=="undefined"||_375===null){
return undefined;
}
return _375.getPropertyValue(_372);
},getElementsByTagAndClassName:function(_376,_377,_378){
var self=MochiKit.DOM;
if(typeof (_376)=="undefined"||_376===null){
_376="*";
}
if(typeof (_378)=="undefined"||_378===null){
_378=self._document;
}
_378=self.getElement(_378);
var _379=(_378.getElementsByTagName(_376)||self._document.all);
if(typeof (_377)=="undefined"||_377===null){
return MochiKit.Base.extend(null,_379);
}
var _380=[];
for(var i=0;i<_379.length;i++){
var _381=_379[i];
var _382=_381.className.split(" ");
for(var j=0;j<_382.length;j++){
if(_382[j]==_377){
_380.push(_381);
break;
}
}
}
return _380;
},_newCallStack:function(path,once){
var rval=function(){
var _385=arguments.callee.callStack;
for(var i=0;i<_385.length;i++){
if(_385[i].apply(this,arguments)===false){
break;
}
}
if(once){
try{
this[path]=null;
}
catch(e){
}
}
};
rval.callStack=[];
return rval;
},addToCallStack:function(_386,path,func,once){
var self=MochiKit.DOM;
var _387=_386[path];
var _388=_387;
if(!(typeof (_387)=="function"&&typeof (_387.callStack)=="object"&&_387.callStack!==null)){
_388=self._newCallStack(path,once);
if(typeof (_387)=="function"){
_388.callStack.push(_387);
}
_386[path]=_388;
}
_388.callStack.push(func);
},addLoadEvent:function(func){
var self=MochiKit.DOM;
self.addToCallStack(self._window,"onload",func,true);
},focusOnLoad:function(_389){
var self=MochiKit.DOM;
self.addLoadEvent(function(){
_389=self.getElement(_389);
if(_389){
_389.focus();
}
});
},setElementClass:function(_390,_391){
var self=MochiKit.DOM;
var obj=self.getElement(_390);
if(self.attributeArray.compliant){
obj.setAttribute("class",_391);
}else{
obj.setAttribute("className",_391);
}
},toggleElementClass:function(_392){
var self=MochiKit.DOM;
for(var i=1;i<arguments.length;i++){
var obj=self.getElement(arguments[i]);
if(!self.addElementClass(obj,_392)){
self.removeElementClass(obj,_392);
}
}
},addElementClass:function(_393,_394){
var self=MochiKit.DOM;
var obj=self.getElement(_393);
var cls=obj.className;
if(cls.length===0){
self.setElementClass(obj,_394);
return true;
}
if(cls==_394){
return false;
}
var _396=obj.className.split(" ");
for(var i=0;i<_396.length;i++){
if(_396[i]==_394){
return false;
}
}
self.setElementClass(obj,cls+" "+_394);
return true;
},removeElementClass:function(_397,_398){
var self=MochiKit.DOM;
var obj=self.getElement(_397);
var cls=obj.className;
if(cls.length===0){
return false;
}
if(cls==_398){
self.setElementClass(obj,"");
return true;
}
var _399=obj.className.split(" ");
for(var i=0;i<_399.length;i++){
if(_399[i]==_398){
_399.splice(i,1);
self.setElementClass(obj,_399.join(" "));
return true;
}
}
return false;
},swapElementClass:function(_400,_401,_402){
var obj=MochiKit.DOM.getElement(_400);
var res=MochiKit.DOM.removeElementClass(obj,_401);
if(res){
MochiKit.DOM.addElementClass(obj,_402);
}
return res;
},hasElementClass:function(_403,_404){
var obj=MochiKit.DOM.getElement(_403);
var _405=obj.className.split(" ");
for(var i=1;i<arguments.length;i++){
var good=false;
for(var j=0;j<_405.length;j++){
if(_405[j]==arguments[i]){
good=true;
break;
}
}
if(!good){
return false;
}
}
return true;
},escapeHTML:function(s){
return s.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
},toHTML:function(dom){
return MochiKit.DOM.emitHTML(dom).join("");
},emitHTML:function(dom,lst){
if(typeof (lst)=="undefined"||lst===null){
lst=[];
}
var _408=[dom];
var self=MochiKit.DOM;
var _409=self.escapeHTML;
var _410=self.attributeArray;
while(_408.length){
dom=_408.pop();
if(typeof (dom)=="string"){
lst.push(dom);
}else{
if(dom.nodeType==1){
lst.push("<"+dom.nodeName.toLowerCase());
var _411=[];
var _412=_410(dom);
for(var i=0;i<_412.length;i++){
var a=_412[i];
_411.push([" ",a.name,"=\"",_409(a.value),"\""]);
}
_411.sort();
for(i=0;i<_411.length;i++){
var _413=_411[i];
for(var j=0;j<_413.length;j++){
lst.push(_413[j]);
}
}
if(dom.hasChildNodes()){
lst.push(">");
_408.push("</"+dom.nodeName.toLowerCase()+">");
var _414=dom.childNodes;
for(i=_414.length-1;i>=0;i--){
_408.push(_414[i]);
}
}else{
lst.push("/>");
}
}else{
if(dom.nodeType==3){
lst.push(_409(dom.nodeValue));
}
}
}
}
return lst;
},setDisplayForElement:function(_415,_416){
var m=MochiKit.Base;
var _417=m.extend(null,arguments,1);
MochiKit.Iter.forEach(m.filter(null,m.map(MochiKit.DOM.getElement,_417)),function(_416){
_416.style.display=_415;
});
},scrapeText:function(node,_418){
var rval=[];
(function(node){
var cn=node.childNodes;
if(cn){
for(var i=0;i<cn.length;i++){
arguments.callee.call(this,cn[i]);
}
}
var _420=node.nodeValue;
if(typeof (_420)=="string"){
rval.push(_420);
}
})(MochiKit.DOM.getElement(node));
if(_418){
return rval;
}else{
return rval.join("");
}
},__new__:function(win){
var m=MochiKit.Base;
this._document=document;
this._window=win;
this.domConverters=new m.AdapterRegistry();
var _421=this._document.createElement("span");
var _422;
if(_421&&_421.attributes&&_421.attributes.length>0){
var _423=m.filter;
_422=function(node){
return _423(_422.ignoreAttrFilter,node.attributes);
};
_422.ignoreAttr={};
MochiKit.Iter.forEach(_421.attributes,function(a){
_422.ignoreAttr[a.name]=a.value;
});
_422.ignoreAttrFilter=function(a){
return (_422.ignoreAttr[a.name]!=a.value);
};
_422.compliant=false;
_422.renames={"class":"className","checked":"defaultChecked","usemap":"useMap","for":"htmlFor"};
}else{
_422=function(node){
return node.attributes;
};
_422.compliant=true;
_422.renames={};
}
this.attributeArray=_422;
var _424=this.createDOMFunc;
this.UL=_424("ul");
this.OL=_424("ol");
this.LI=_424("li");
this.TD=_424("td");
this.TR=_424("tr");
this.TBODY=_424("tbody");
this.THEAD=_424("thead");
this.TFOOT=_424("tfoot");
this.TABLE=_424("table");
this.TH=_424("th");
this.INPUT=_424("input");
this.SPAN=_424("span");
this.A=_424("a");
this.DIV=_424("div");
this.IMG=_424("img");
this.BUTTON=_424("button");
this.TT=_424("tt");
this.PRE=_424("pre");
this.H1=_424("h1");
this.H2=_424("h2");
this.H3=_424("h3");
this.BR=_424("br");
this.HR=_424("hr");
this.LABEL=_424("label");
this.TEXTAREA=_424("textarea");
this.FORM=_424("form");
this.P=_424("p");
this.SELECT=_424("select");
this.OPTION=_424("option");
this.OPTGROUP=_424("optgroup");
this.LEGEND=_424("legend");
this.FIELDSET=_424("fieldset");
this.STRONG=_424("strong");
this.CANVAS=_424("canvas");
this.hideElement=m.partial(this.setDisplayForElement,"none");
this.showElement=m.partial(this.setDisplayForElement,"block");
this.removeElement=this.swapDOM;
this.$=this.getElement;
this.EXPORT_TAGS={":common":this.EXPORT,":all":m.concat(this.EXPORT,this.EXPORT_OK)};
m.nameFunctions(this);
}});
MochiKit.DOM.__new__(((typeof (window)=="undefined")?this:window));
withWindow=MochiKit.DOM.withWindow;
withDocument=MochiKit.DOM.withDocument;
MochiKit.Base._exportSymbols(this,MochiKit.DOM);
if(typeof (dojo)!="undefined"){
dojo.provide("MochiKit.LoggingPane");
dojo.require("MochiKit.Logging");
dojo.require("MochiKit.Base");
}
if(typeof (JSAN)!="undefined"){
JSAN.use("MochiKit.Logging",[]);
JSAN.use("MochiKit.Base",[]);
}
try{
if(typeof (MochiKit.Base)=="undefined"||typeof (MochiKit.Logging)=="undefined"){
throw "";
}
}
catch(e){
throw "MochiKit.LoggingPane depends on MochiKit.Base and MochiKit.Logging!";
}
if(typeof (MochiKit.LoggingPane)=="undefined"){
MochiKit.LoggingPane={};
}
MochiKit.LoggingPane.NAME="MochiKit.LoggingPane";
MochiKit.LoggingPane.VERSION="1.3";
MochiKit.LoggingPane.__repr__=function(){
return "["+this.NAME+" "+this.VERSION+"]";
};
MochiKit.LoggingPane.toString=function(){
return this.__repr__();
};
MochiKit.LoggingPane.createLoggingPane=function(_425){
var m=MochiKit.LoggingPane;
_425=!(!_425);
if(m._loggingPane&&m._loggingPane.inline!=_425){
m._loggingPane.closePane();
m._loggingPane=null;
}
if(!m._loggingPane||m._loggingPane.closed){
m._loggingPane=new m.LoggingPane(_425,MochiKit.Logging.logger);
}
return m._loggingPane;
};
MochiKit.LoggingPane.LoggingPane=function(_426,_427){
if(typeof (_427)=="undefined"||_427==null){
_427=MochiKit.Logging.logger;
}
this.logger=_427;
var _428=MochiKit.Base.update;
var _429=MochiKit.Base.updatetree;
var bind=MochiKit.Base.bind;
var _430=MochiKit.Base.clone;
var win=window;
var uid="_MochiKit_LoggingPane";
if(typeof (MochiKit.DOM)!="undefined"){
win=MochiKit.DOM.currentWindow();
}
if(!_426){
var url=win.location.href.split("?")[0].replace(/[:\/.><&]/g,"_");
var name=uid+"_"+url;
var nwin=win.open("",name,"dependent,resizable,height=200");
if(!nwin){
alert("Not able to open debugging window due to pop-up blocking.");
return undefined;
}
nwin.document.write("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\" "+"\"http://www.w3.org/TR/html4/loose.dtd\">"+"<html><head><title>[MochiKit.LoggingPane]</title></head>"+"<body></body></html>");
nwin.document.close();
nwin.document.title+=" "+win.document.title;
win=nwin;
}
var doc=win.document;
this.doc=doc;
var _433=doc.getElementById(uid);
var _434=!!_433;
if(_433&&typeof (_433.loggingPane)!="undefined"){
_433.loggingPane.logger=this.logger;
_433.loggingPane.buildAndApplyFilter();
return _433.loggingPane;
}
if(_434){
var _435;
while((_435=_433.firstChild)){
_433.removeChild(_435);
}
}else{
_433=doc.createElement("div");
_433.id=uid;
}
_433.loggingPane=this;
var _436=doc.createElement("input");
var _437=doc.createElement("input");
var _438=doc.createElement("button");
var _439=doc.createElement("button");
var _440=doc.createElement("button");
var _441=doc.createElement("button");
var _442=doc.createElement("div");
var _443=doc.createElement("div");
var _444=uid+"_Listener";
this.colorTable=_430(this.colorTable);
var _445=[];
var _446=null;
var _447=function(msg){
var _448=msg.level;
if(typeof (_448)=="number"){
_448=MochiKit.Logging.LogLevel[_448];
}
return _448;
};
var _449=function(msg){
return msg.info.join(" ");
};
var _450=bind(function(msg){
var _451=_447(msg);
var text=_449(msg);
var c=this.colorTable[_451];
var p=doc.createElement("span");
p.className="MochiKit-LogMessage MochiKit-LogLevel-"+_451;
p.style.cssText="margin: 0px; white-space: -moz-pre-wrap; white-space: -o-pre-wrap; white-space: pre-wrap; white-space: pre-line; word-wrap: break-word; wrap-option: emergency; color: "+c;
p.appendChild(doc.createTextNode(_451+": "+text));
_443.appendChild(p);
_443.appendChild(doc.createElement("br"));
if(_442.offsetHeight>_442.scrollHeight){
_442.scrollTop=0;
}else{
_442.scrollTop=_442.scrollHeight;
}
},this);
var _453=function(msg){
_445[_445.length]=msg;
_450(msg);
};
var _454=function(){
var _455,infore;
try{
_455=new RegExp(_436.value);
infore=new RegExp(_437.value);
}
catch(e){
logDebug("Error in filter regex: "+e.message);
return null;
}
return function(msg){
return (_455.test(_447(msg))&&infore.test(_449(msg)));
};
};
var _456=function(){
while(_443.firstChild){
_443.removeChild(_443.firstChild);
}
};
var _457=function(){
_445=[];
_456();
};
var _458=bind(function(){
if(this.closed){
return;
}
this.closed=true;
if(MochiKit.LoggingPane._loggingPane==this){
MochiKit.LoggingPane._loggingPane=null;
}
this.logger.removeListener(_444);
_433.loggingPane=null;
if(_426){
_433.parentNode.removeChild(_433);
}else{
this.win.close();
}
},this);
var _459=function(){
_456();
for(var i=0;i<_445.length;i++){
var msg=_445[i];
if(_446==null||_446(msg)){
_450(msg);
}
}
};
this.buildAndApplyFilter=function(){
_446=_454();
_459();
this.logger.removeListener(_444);
this.logger.addListener(_444,_446,_453);
};
var _460=bind(function(){
_445=this.logger.getMessages();
_459();
},this);
var _461=bind(function(_462){
_462=_462||window.event;
key=_462.which||_462.keyCode;
if(key==13){
this.buildAndApplyFilter();
}
},this);
var _463="display: block; left: 0px; bottom: 0px; position: fixed; width: 100%; background-color: white; font: "+this.logFont;
if(_426){
_463+="; height: 10em; border-top: 2px solid black";
}else{
_463+="; height: 100%;";
}
_433.style.cssText=_463;
if(!_434){
doc.body.appendChild(_433);
}
_463={"cssText":"width: 33%; display: inline; font: "+this.logFont};
_429(_436,{"value":"FATAL|ERROR|WARNING|INFO|DEBUG","onkeypress":_461,"style":_463});
_433.appendChild(_436);
_429(_437,{"value":".*","onkeypress":_461,"style":_463});
_433.appendChild(_437);
_463="width: 8%; display:inline; font: "+this.logFont;
_438.appendChild(doc.createTextNode("Filter"));
_438.onclick=bind("buildAndApplyFilter",this);
_438.style.cssText=_463;
_433.appendChild(_438);
_439.appendChild(doc.createTextNode("Load"));
_439.onclick=_460;
_439.style.cssText=_463;
_433.appendChild(_439);
_440.appendChild(doc.createTextNode("Clear"));
_440.onclick=_457;
_440.style.cssText=_463;
_433.appendChild(_440);
_441.appendChild(doc.createTextNode("Close"));
_441.onclick=_458;
_441.style.cssText=_463;
_433.appendChild(_441);
_442.style.cssText="overflow: auto; width: 100%";
_443.style.cssText="width: 100%; height: "+(_426?"8em":"100%");
_442.appendChild(_443);
_433.appendChild(_442);
this.buildAndApplyFilter();
_460();
if(_426){
this.win=undefined;
}else{
this.win=win;
}
this.inline=_426;
this.closePane=_458;
this.closed=false;
return this;
};
MochiKit.LoggingPane.LoggingPane.prototype={"logFont":"8pt Verdana,sans-serif","colorTable":{"ERROR":"red","FATAL":"darkred","WARNING":"blue","INFO":"black","DEBUG":"green"}};
MochiKit.LoggingPane.EXPORT_OK=["LoggingPane"];
MochiKit.LoggingPane.EXPORT=["createLoggingPane"];
MochiKit.LoggingPane.__new__=function(){
this.EXPORT_TAGS={":common":this.EXPORT,":all":MochiKit.Base.concat(this.EXPORT,this.EXPORT_OK)};
MochiKit.Base.nameFunctions(this);
MochiKit.LoggingPane._loggingPane=null;
};
MochiKit.LoggingPane.__new__();
MochiKit.Base._exportSymbols(this,MochiKit.LoggingPane);
if(typeof (dojo)!="undefined"){
dojo.provide("MochiKit.Color");
dojo.require("MochiKit.Base");
}
if(typeof (JSAN)!="undefined"){
JSAN.use("MochiKit.Base",[]);
}
try{
if(typeof (MochiKit.Base)=="undefined"){
throw "";
}
}
catch(e){
throw "MochiKit.Color depends on MochiKit.Base";
}
if(typeof (MochiKit.Color)=="undefined"){
MochiKit.Color={};
}
MochiKit.Color.NAME="MochiKit.Color";
MochiKit.Color.VERSION="1.3";
MochiKit.Color.__repr__=function(){
return "["+this.NAME+" "+this.VERSION+"]";
};
MochiKit.Color.toString=function(){
return this.__repr__();
};
MochiKit.Color.Color=function(red,_465,blue,_467){
if(typeof (_467)=="undefined"||_467==null){
_467=1;
}
this.rgb={r:red,g:_465,b:blue,a:_467};
};
MochiKit.Color.Color.prototype={__class__:MochiKit.Color.Color,colorWithAlpha:function(_468){
var rgb=this.rgb;
var m=MochiKit.Color;
return m.Color.fromRGB(rgb.r,rgb.g,rgb.b,_468);
},colorWithHue:function(hue){
var hsl=this.asHSL();
hsl.h=hue;
var m=MochiKit.Color;
return m.Color.fromHSL(hsl);
},colorWithSaturation:function(_472){
var hsl=this.asHSL();
hsl.s=_472;
var m=MochiKit.Color;
return m.Color.fromHSL(hsl);
},colorWithLightness:function(_473){
var hsl=this.asHSL();
hsl.l=_473;
var m=MochiKit.Color;
return m.Color.fromHSL(hsl);
},darkerColorWithLevel:function(_474){
var hsl=this.asHSL();
hsl.l=Math.max(hsl.l-_474,0);
var m=MochiKit.Color;
return m.Color.fromHSL(hsl);
},lighterColorWithLevel:function(_475){
var hsl=this.asHSL();
hsl.l=Math.min(hsl.l+_475,1);
var m=MochiKit.Color;
return m.Color.fromHSL(hsl);
},blendedColor:function(_476,_477){
if(typeof (_477)=="undefined"||_477==null){
_477=0.5;
}
var sf=1-_477;
var s=this.rgb;
var d=_476.rgb;
var df=_477;
return MochiKit.Color.Color.fromRGB((s.r*sf)+(d.r*df),(s.g*sf)+(d.g*df),(s.b*sf)+(d.b*df),(s.a*sf)+(d.a*df));
},compareRGB:function(_480){
var a=this.asRGB();
var b=_480.asRGB();
return MochiKit.Base.compare([a.r,a.g,a.b,a.a],[b.r,b.g,b.b,b.a]);
},isLight:function(){
return this.asHSL().b>0.5;
},isDark:function(){
return (!this.isLight());
},toHSLString:function(){
var c=this.asHSL();
var ccc=MochiKit.Color.clampColorComponent;
var rval=this._hslString;
if(!rval){
var mid=(ccc(c.h,360).toFixed(0)+","+ccc(c.s,100).toPrecision(4)+"%"+","+ccc(c.l,100).toPrecision(4)+"%");
var a=c.a;
if(a>=1){
a=1;
rval="hsl("+mid+")";
}else{
if(a<=0){
a=0;
}
rval="hsla("+mid+","+a+")";
}
this._hslString=rval;
}
return rval;
},toRGBString:function(){
var c=this.rgb;
var ccc=MochiKit.Color.clampColorComponent;
var rval=this._rgbString;
if(!rval){
var mid=(ccc(c.r,255).toFixed(0)+","+ccc(c.g,255).toFixed(0)+","+ccc(c.b,255).toFixed(0));
if(c.a!=1){
rval="rgba("+mid+","+c.a+")";
}else{
rval="rgb("+mid+")";
}
this._rgbString=rval;
}
return rval;
},asRGB:function(){
return MochiKit.Base.clone(this.rgb);
},toHexString:function(){
var m=MochiKit.Color;
var c=this.rgb;
var ccc=MochiKit.Color.clampColorComponent;
var rval=this._hexString;
if(!rval){
rval=("#"+m.toColorPart(ccc(c.r,255))+m.toColorPart(ccc(c.g,255))+m.toColorPart(ccc(c.b,255)));
this._hexString=rval;
}
return rval;
},asHSV:function(){
var hsv=this.hsv;
var c=this.rgb;
if(typeof (hsv)=="undefined"||hsv==null){
hsv=MochiKit.Color.rgbToHSV(this.rgb);
this.hsv=hsv;
}
return MochiKit.Base.clone(hsv);
},asHSL:function(){
var hsl=this.hsl;
var c=this.rgb;
if(typeof (hsl)=="undefined"||hsl==null){
hsl=MochiKit.Color.rgbToHSL(this.rgb);
this.hsl=hsl;
}
return MochiKit.Base.clone(hsl);
},toString:function(){
return this.toRGBString();
},repr:function(){
var c=this.rgb;
var col=[c.r,c.g,c.b,c.a];
return this.__class__.NAME+"("+col.join(", ")+")";
}};
MochiKit.Base.update(MochiKit.Color.Color,{fromRGB:function(red,_485,blue,_486){
var _487=MochiKit.Color.Color;
if(arguments.length==1){
var rgb=red;
red=rgb.r;
_485=rgb.g;
blue=rgb.b;
if(typeof (rgb.a)=="undefined"){
_486=undefined;
}else{
_486=rgb.a;
}
}
return new _487(red,_485,blue,_486);
},fromHSL:function(hue,_488,_489,_490){
var m=MochiKit.Color;
return m.Color.fromRGB(m.hslToRGB.apply(m,arguments));
},fromHSV:function(hue,_491,_492,_493){
var m=MochiKit.Color;
return m.Color.fromRGB(m.hsvToRGB.apply(m,arguments));
},fromName:function(name){
var _494=MochiKit.Color.Color;
if(name.charAt(0)=="\""){
name=name.substr(1,name.length-2);
}
var _495=_494._namedColors[name.toLowerCase()];
if(typeof (_495)=="string"){
return _494.fromHexString(_495);
}else{
if(name=="transparent"){
return _494.transparentColor();
}
}
return null;
},fromString:function(_496){
var self=MochiKit.Color.Color;
var _497=_496.substr(0,3);
if(_497=="rgb"){
return self.fromRGBString(_496);
}else{
if(_497=="hsl"){
return self.fromHSLString(_496);
}else{
if(_496.charAt(0)=="#"){
return self.fromHexString(_496);
}
}
}
return self.fromName(_496);
},fromHexString:function(_498){
if(_498.charAt(0)=="#"){
_498=_498.substring(1);
}
var _499=[];
var i,hex;
if(_498.length==3){
for(i=0;i<3;i++){
hex=_498.substr(i,1);
_499.push(parseInt(hex+hex,16)/255);
}
}else{
for(i=0;i<6;i+=2){
hex=_498.substr(i,2);
_499.push(parseInt(hex,16)/255);
}
}
var _500=MochiKit.Color.Color;
return _500.fromRGB.apply(_500,_499);
},_fromColorString:function(pre,_502,_503,_504){
if(_504.indexOf(pre)==0){
_504=_504.substring(_504.indexOf("(",3)+1,_504.length-1);
}
var _505=_504.split(/\s*,\s*/);
var _506=[];
for(var i=0;i<_505.length;i++){
var c=_505[i];
var val;
var _507=c.substring(c.length-3);
if(c.charAt(c.length-1)=="%"){
val=0.01*parseFloat(c.substring(0,c.length-1));
}else{
if(_507=="deg"){
val=parseFloat(c)/360;
}else{
if(_507=="rad"){
val=parseFloat(c)/(Math.PI*2);
}else{
val=_503[i]*parseFloat(c);
}
}
}
_506.push(val);
}
return this[_502].apply(this,_506);
},fromComputedStyle:function(elem,_508,_509){
var d=MochiKit.DOM;
var cls=MochiKit.Color.Color;
for(elem=d.getElement(elem);elem;elem=elem.parentNode){
var _510=d.computedStyle.apply(d,arguments);
if(!_510){
continue;
}
var _511=cls.fromString(_510);
if(!_511){
break;
}
if(_511.asRGB().a>0){
return _511;
}
}
return null;
},fromBackground:function(elem){
var cls=MochiKit.Color.Color;
return cls.fromComputedStyle(elem,"backgroundColor","background-color")||cls.whiteColor();
},fromText:function(elem){
var cls=MochiKit.Color.Color;
return cls.fromComputedStyle(elem,"color","color")||cls.blackColor();
},namedColors:function(){
return MochiKit.Base.clone(MochiKit.Color.Color._namedColors);
}});
MochiKit.Base.update(MochiKit.Color,{clampColorComponent:function(v,_512){
v*=_512;
if(v<0){
return 0;
}else{
if(v>_512){
return _512;
}else{
return v;
}
}
},_hslValue:function(n1,n2,hue){
if(hue>6){
hue-=6;
}else{
if(hue<0){
hue+=6;
}
}
var val;
if(hue<1){
val=n1+(n2-n1)*hue;
}else{
if(hue<3){
val=n2;
}else{
if(hue<4){
val=n1+(n2-n1)*(4-hue);
}else{
val=n1;
}
}
}
return val;
},hsvToRGB:function(hue,_515,_516,_517){
if(arguments.length==1){
var hsv=hue;
hue=hsv.h;
_515=hsv.s;
_516=hsv.v;
_517=hsv.a;
}
var red;
var _518;
var blue;
if(_515==0){
red=0;
_518=0;
blue=0;
}else{
var i=Math.floor(hue*6);
var f=(hue*6)-i;
var p=_516*(1-_515);
var q=_516*(1-(_515*f));
var t=_516*(1-(_515*(1-f)));
switch(i){
case 1:
red=q;
_518=_516;
blue=p;
break;
case 2:
red=p;
_518=_516;
blue=t;
break;
case 3:
red=p;
_518=q;
blue=_516;
break;
case 4:
red=t;
_518=p;
blue=_516;
break;
case 5:
red=_516;
_518=p;
blue=q;
break;
case 6:
case 0:
red=_516;
_518=t;
blue=p;
break;
}
}
return {r:red,g:_518,b:blue,a:_517};
},hslToRGB:function(hue,_520,_521,_522){
if(arguments.length==1){
var hsl=hue;
hue=hsl.h;
_520=hsl.s;
_521=hsl.l;
_522=hsl.a;
}
var red;
var _523;
var blue;
if(_520==0){
red=_521;
_523=_521;
blue=_521;
}else{
var m2;
if(_521<=0.5){
m2=_521*(1+_520);
}else{
m2=_521+_520-(_521*_520);
}
var m1=(2*_521)-m2;
var f=MochiKit.Color._hslValue;
var h6=hue*6;
red=f(m1,m2,h6+2);
_523=f(m1,m2,h6);
blue=f(m1,m2,h6-2);
}
return {r:red,g:_523,b:blue,a:_522};
},rgbToHSV:function(red,_527,blue,_528){
if(arguments.length==1){
var rgb=red;
red=rgb.r;
_527=rgb.g;
blue=rgb.b;
_528=rgb.a;
}
var max=Math.max(Math.max(red,_527),blue);
var min=Math.min(Math.min(red,_527),blue);
var hue;
var _531;
var _532=max;
if(min==max){
hue=0;
_531=0;
}else{
var _533=(max-min);
_531=_533/max;
if(red==max){
hue=(_527-blue)/_533;
}else{
if(_527==max){
hue=2+((blue-red)/_533);
}else{
hue=4+((red-_527)/_533);
}
}
hue/=6;
if(hue<0){
hue+=1;
}
if(hue>1){
hue-=1;
}
}
return {h:hue,s:_531,v:_532,a:_528};
},rgbToHSL:function(red,_534,blue,_535){
if(arguments.length==1){
var rgb=red;
red=rgb.r;
_534=rgb.g;
blue=rgb.b;
_535=rgb.a;
}
var max=Math.max(red,Math.max(_534,blue));
var min=Math.min(red,Math.min(_534,blue));
var hue;
var _536;
var _537=(max+min)/2;
var _538=max-min;
if(_538==0){
hue=0;
_536=0;
}else{
if(_537<=0.5){
_536=_538/(max+min);
}else{
_536=_538/(2-max-min);
}
if(red==max){
hue=(_534-blue)/_538;
}else{
if(_534==max){
hue=2+((blue-red)/_538);
}else{
hue=4+((red-_534)/_538);
}
}
hue/=6;
if(hue<0){
hue+=1;
}
if(hue>1){
hue-=1;
}
}
return {h:hue,s:_536,l:_537,a:_535};
},toColorPart:function(num){
num=Math.round(num);
var _539=num.toString(16);
if(num<16){
return "0"+_539;
}
return _539;
},__new__:function(){
var m=MochiKit.Base;
this.Color.fromRGBString=m.bind(this.Color._fromColorString,this.Color,"rgb","fromRGB",[1/255,1/255,1/255,1]);
this.Color.fromHSLString=m.bind(this.Color._fromColorString,this.Color,"hsl","fromHSL",[1/360,0.01,0.01,1]);
var _540=1/3;
var _541={black:[0,0,0],blue:[0,0,1],brown:[0.6,0.4,0.2],cyan:[0,1,1],darkGray:[_540,_540,_540],gray:[0.5,0.5,0.5],green:[0,1,0],lightGray:[2*_540,2*_540,2*_540],magenta:[1,0,1],orange:[1,0.5,0],purple:[0.5,0,0.5],red:[1,0,0],transparent:[0,0,0,0],white:[1,1,1],yellow:[1,1,0]};
var _542=function(name,r,g,b,a){
var rval=this.fromRGB(r,g,b,a);
this[name]=function(){
return rval;
};
return rval;
};
for(var k in _541){
var name=k+"Color";
var _544=m.concat([_542,this.Color,name],_541[k]);
this.Color[name]=m.bind.apply(null,_544);
}
var _545=function(){
for(var i=0;i<arguments.length;i++){
if(!(arguments[i] instanceof Color)){
return false;
}
}
return true;
};
var _546=function(a,b){
return a.compareRGB(b);
};
m.nameFunctions(this);
m.registerComparator(this.Color.NAME,_545,_546);
this.EXPORT_TAGS={":common":this.EXPORT,":all":m.concat(this.EXPORT,this.EXPORT_OK)};
}});
MochiKit.Color.EXPORT=["Color"];
MochiKit.Color.EXPORT_OK=["clampColorComponent","rgbToHSL","hslToRGB","rgbToHSV","hsvToRGB","toColorPart"];
MochiKit.Color.__new__();
MochiKit.Base._exportSymbols(this,MochiKit.Color);
MochiKit.Color.Color._namedColors={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"};
if(typeof (dojo)!="undefined"){
dojo.provide("MochiKit.Signal");
dojo.require("MochiKit.Base");
dojo.require("MochiKit.DOM");
}
if(typeof (JSAN)!="undefined"){
JSAN.use("MochiKit.Base",[]);
JSAN.use("MochiKit.DOM",[]);
}
try{
if(typeof (MochiKit.Base)=="undefined"){
throw "";
}
}
catch(e){
throw "MochiKit.Signal depends on MochiKit.Base!";
}
try{
if(typeof (MochiKit.DOM)=="undefined"){
throw "";
}
}
catch(e){
throw "MochiKit.Signal depends on MochiKit.DOM!";
}
if(typeof (MochiKit.Signal)=="undefined"){
MochiKit.Signal={};
}
MochiKit.Signal.NAME="MochiKit.Signal";
MochiKit.Signal.VERSION="1.3";
MochiKit.Signal._observers=[];
MochiKit.Signal.Event=function(e){
this._event=e||window.event;
};
MochiKit.Base.update(MochiKit.Signal.Event.prototype,{_fixPoint:function(_547){
if(typeof (_547)=="undefined"||_547<0){
return 0;
}
return _547;
},event:function(){
return this._event;
},type:function(){
return this._event.type||undefined;
},target:function(){
return this._event.target||this._event.srcElement;
},relatedTarget:function(){
if(this.type()=="mouseover"){
return (this._event.relatedTarget||this._event.fromElement);
}else{
if(this.type()=="mouseout"){
return (this._event.relatedTarget||this._event.toElement);
}
}
throw new Error("No related target");
},modifier:function(){
var m={};
m.alt=this._event.altKey;
m.ctrl=this._event.ctrlKey;
m.meta=this._event.metaKey||false;
m.shift=this._event.shiftKey;
return m;
},key:function(){
var k={};
if(this.type()&&this.type().indexOf("key")===0){
if(this.type()=="keydown"||this.type()=="keyup"){
k.code=this._event.keyCode;
k.string=(MochiKit.Signal._specialKeys[k.code]||"KEY_UNKNOWN");
return k;
}else{
if(this.type()=="keypress"){
k.code=0;
k.string="";
if(typeof (this._event.charCode)!="undefined"&&this._event.charCode!==0&&!MochiKit.Signal._specialMacKeys[this._event.charCode]){
k.code=this._event.charCode;
k.string=String.fromCharCode(k.code);
}else{
if(this._event.keyCode&&typeof (this._event.charCode)=="undefined"){
k.code=this._event.keyCode;
k.string=String.fromCharCode(k.code);
}
}
return k;
}
}
}
throw new Error("Signal cannot handle this type of key event");
},mouse:function(){
var m={};
if(this.type()&&(this.type().indexOf("mouse")===0||this.type().indexOf("click")!=-1||this.type()=="contextmenu")){
m.client=new MochiKit.DOM.Coordinates(0,0);
if(this._event.clientX||this._event.clientY){
m.client.x=this._fixPoint(this._event.clientX);
m.client.y=this._fixPoint(this._event.clientY);
}
m.page=new MochiKit.DOM.Coordinates(0,0);
if(this._event.pageX||this._event.pageY){
m.page.x=this._fixPoint(this._event.pageX);
m.page.y=this._fixPoint(this._event.pageY);
}else{
var de=MochiKit.DOM._document.documentElement;
var b=MochiKit.DOM._document.body;
m.page.x=this._event.clientX+(de.scrollLeft||b.scrollLeft)-(de.clientLeft||b.clientLeft);
m.page.y=this._event.clientY+(de.scrollTop||b.scrollTop)-(de.clientTop||b.clientTop);
}
if(this.type()!="mousemove"){
m.button={};
m.button.left=false;
m.button.right=false;
m.button.middle=false;
if(this._event.which){
m.button.left=(this._event.which==1);
m.button.middle=(this._event.which==2);
m.button.right=(this._event.which==3);
}else{
m.button.left=!!(this._event.button&1);
m.button.right=!!(this._event.button&2);
m.button.middle=!!(this._event.button&4);
}
}
return m;
}
throw new Error("This is not a mouse event");
},stop:function(){
this.stopPropagation();
this.preventDefault();
},stopPropagation:function(){
if(this._event.stopPropagation){
this._event.stopPropagation();
}else{
this._event.cancelBubble=true;
}
},preventDefault:function(){
if(this._event.preventDefault){
this._event.preventDefault();
}else{
this._event.returnValue=false;
}
},toString:function(){
return this.__repr__();
}});
MochiKit.Signal._specialMacKeys={63289:"KEY_NUM_PAD_CLEAR",63276:"KEY_PAGE_UP",63277:"KEY_PAGE_DOWN",63275:"KEY_END",63273:"KEY_HOME",63234:"KEY_ARROW_LEFT",63232:"KEY_ARROW_UP",63235:"KEY_ARROW_RIGHT",63233:"KEY_ARROW_DOWN",63302:"KEY_INSERT",63272:"KEY_DELETE"};
for(i=63236;i<=63242;i++){
MochiKit.Signal._specialMacKeys[i]="KEY_F"+(i-63236+1);
}
MochiKit.Signal._specialKeys={8:"KEY_BACKSPACE",9:"KEY_TAB",12:"KEY_NUM_PAD_CLEAR",13:"KEY_ENTER",16:"KEY_SHIFT",17:"KEY_CTRL",18:"KEY_ALT",19:"KEY_PAUSE",20:"KEY_CAPS_LOCK",27:"KEY_ESCAPE",32:"KEY_SPACEBAR",33:"KEY_PAGE_UP",34:"KEY_PAGE_DOWN",35:"KEY_END",36:"KEY_HOME",37:"KEY_ARROW_LEFT",38:"KEY_ARROW_UP",39:"KEY_ARROW_RIGHT",40:"KEY_ARROW_DOWN",44:"KEY_PRINT_SCREEN",45:"KEY_INSERT",46:"KEY_DELETE",59:"KEY_SEMICOLON",91:"KEY_WINDOWS_LEFT",92:"KEY_WINDOWS_RIGHT",93:"KEY_SELECT",106:"KEY_NUM_PAD_ASTERISK",107:"KEY_NUM_PAD_PLUS_SIGN",109:"KEY_NUM_PAD_HYPHEN-MINUS",110:"KEY_NUM_PAD_FULL_STOP",111:"KEY_NUM_PAD_SOLIDUS",144:"KEY_NUM_LOCK",145:"KEY_SCROLL_LOCK",186:"KEY_SEMICOLON",187:"KEY_EQUALS_SIGN",188:"KEY_COMMA",189:"KEY_HYPHEN-MINUS",190:"KEY_FULL_STOP",191:"KEY_SOLIDUS",192:"KEY_GRAVE_ACCENT",219:"KEY_LEFT_SQUARE_BRACKET",220:"KEY_REVERSE_SOLIDUS",221:"KEY_RIGHT_SQUARE_BRACKET",222:"KEY_APOSTROPHE"};
for(var i=48;i<=57;i++){
MochiKit.Signal._specialKeys[i]="KEY_"+(i-48);
}
for(i=65;i<=90;i++){
MochiKit.Signal._specialKeys[i]="KEY_"+String.fromCharCode(i);
}
for(i=96;i<=105;i++){
MochiKit.Signal._specialKeys[i]="KEY_NUM_PAD_"+(i-96);
}
for(i=112;i<=123;i++){
MochiKit.Signal._specialKeys[i]="KEY_F"+(i-112+1);
}
MochiKit.Base.update(MochiKit.Signal,{__repr__:function(){
return "["+this.NAME+" "+this.VERSION+"]";
},_getSlot:function(slot,func){
if(typeof (func)=="string"||typeof (func)=="function"){
if(typeof (func)=="string"&&typeof (slot[func])=="undefined"){
throw new Error("Invalid function slot");
}
slot=[slot,func];
}else{
if(!func&&typeof (slot)=="function"){
slot=[slot];
}else{
throw new Error("Invalid slot parameters");
}
}
return slot;
},_unloadCache:function(){
for(var i=0;i<MochiKit.Signal._observers.length;i++){
var src=MochiKit.Signal._observers[i][0];
var sig=MochiKit.Signal._observers[i][1];
var _550=MochiKit.Signal._observers[i][2];
try{
if(src.removeEventListener){
src.removeEventListener(sig.substr(2),_550,false);
}else{
if(src.detachEvent){
src.detachEvent(sig,_550);
}else{
delete (src._signals[sig]);
}
}
delete (src._listeners[sig]);
delete (src._listeners);
delete (src._signals);
}
catch(e){
}
}
MochiKit.Signal._observers=undefined;
try{
window.onload=undefined;
}
catch(e){
}
try{
window.onunload=undefined;
}
catch(e){
}
},connect:function(src,sig,slot,func){
if(typeof (src)=="string"){
src=MochiKit.DOM.getElement(src);
}
if(typeof (sig)!="string"){
throw new Error("'sig' must be a string");
}
slot=MochiKit.Signal._getSlot(slot,func);
if(!src._listeners){
src._listeners={};
}
if(!src._listeners[sig]){
var _551=function(_552){
var _553=new MochiKit.Signal.Event(_552);
MochiKit.Signal.signal(src,sig,_553);
return true;
};
MochiKit.Signal._observers.push([src,sig,_551]);
if(src.addEventListener){
src.addEventListener(sig.substr(2),_551,false);
}else{
if(src.attachEvent){
src.attachEvent(sig,_551);
}else{
src[sig]=_551;
}
}
src._listeners[sig]=_551;
}
if(!src._signals){
src._signals={};
}
if(!src._signals[sig]){
src._signals[sig]=[];
}
var _554=src._signals[sig];
for(var i=0;i<_554.length;i++){
var s=_554[i];
if(slot[0]===s[0]&&slot[1]===s[1]&&slot[2]===s[2]){
return;
}
}
_554.push(slot);
},disconnect:function(src,sig,slot,func){
if(typeof (src)=="string"){
src=MochiKit.DOM.getElement(src);
}
if(typeof (sig)!="string"){
throw new Error("'signal' must be a string");
}
slot=MochiKit.Signal._getSlot(slot,func);
if(src._signals&&src._signals[sig]){
var _555=src._signals[sig];
var _556=_555.length;
for(var i=0;i<_555.length;i++){
var s=_555[i];
if(s[0]===slot[0]&&s[1]===slot[1]&&s[2]===slot[2]){
_555.splice(i,1);
break;
}
}
}else{
throw new Error("Invalid signal to disconnect");
}
if(src.addEventListener||src.attachEvent||src._signals[sig]){
if(src._listeners&&src._listeners[sig]&&src._signals[sig].length===0){
var _557=src._listeners[sig];
if(src.removeEventListener){
src.removeEventListener(sig.substr(2),_557,false);
}else{
if(src.detachEvent){
src.detachEvent(sig,_557);
}else{
src._signals[sig]=undefined;
}
}
var _558=MochiKit.Signal._observers;
for(var i=0;i<_558.length;i++){
var o=_558[i];
if(o[0]===src&&o[1]===sig&&o[2]===_557){
_558.splice(i,1);
break;
}
}
src._listeners[sig]=undefined;
}
}
},signal:function(src,sig){
if(typeof (src)=="string"){
src=MochiKit.DOM.getElement(src);
}
if(typeof (sig)!="string"){
throw new Error("'signal' must be a string");
}
if(!src._signals||!src._signals[sig]){
if(src.addEventListener||src.attachEvent||src[sig]){
return;
}else{
throw new Error("No such signal '"+sig+"'");
}
}
var _559=src._signals[sig];
var args=MochiKit.Base.extend(null,arguments,2);
var slot;
var _560=[];
for(var i=0;i<_559.length;i++){
slot=_559[i];
try{
if(slot.length==1){
slot[0].apply(src,args);
}else{
if(typeof (slot[1])=="string"){
slot[0][slot[1]].apply(slot[0],args);
}else{
slot[1].apply(slot[0],args);
}
}
}
catch(e){
_560.push(e);
}
}
if(_560.length==1){
throw _560[0];
}else{
if(_560.length){
var e=new Error("There were errors in handling signal 'sig'.");
e.errors=_560;
throw e;
}
}
},toString:function(){
return this.__repr__();
}});
MochiKit.Signal.EXPORT_OK=[];
MochiKit.Signal.EXPORT=["connect","disconnect","signal"];
MochiKit.Signal.__new__=function(win){
var m=MochiKit.Base;
this._document=document;
this._window=win;
try{
this.connect(window,"onunload",this._unloadCache);
}
catch(e){
}
this.EXPORT_TAGS={":common":this.EXPORT,":all":m.concat(this.EXPORT,this.EXPORT_OK)};
m.nameFunctions(this);
};
MochiKit.Signal.__new__(this);
signal=MochiKit.Signal.signal;
connect=MochiKit.Signal.connect;
disconnect=MochiKit.Signal.disconnect;
MochiKit.Base._exportSymbols(this,MochiKit.Signal);
if(typeof (dojo)!="undefined"){
dojo.provide("MochiKit.Visual");
dojo.require("MochiKit.Base");
dojo.require("MochiKit.DOM");
dojo.require("MochiKit.Color");
}
if(typeof (JSAN)!="undefined"){
JSAN.use("MochiKit.Base",[]);
JSAN.use("MochiKit.DOM",[]);
JSAN.use("MochiKit.Color",[]);
}
try{
if(typeof (MochiKit.Base)=="undefined"||typeof (MochiKit.DOM)=="undefined"||typeof (MochiKit.Color)=="undefined"){
throw "";
}
}
catch(e){
throw "MochiKit.Visual depends on MochiKit.Base, MochiKit.DOM and MochiKit.Color!";
}
if(typeof (MochiKit.Visual)=="undefined"){
MochiKit.Visual={};
}
MochiKit.Visual.NAME="MochiKit.Visual";
MochiKit.Visual.VERSION="1.3";
MochiKit.Visual.__repr__=function(){
return "["+this.NAME+" "+this.VERSION+"]";
};
MochiKit.Visual.toString=function(){
return this.__repr__();
};
MochiKit.Visual._RoundCorners=function(e,_561){
e=MochiKit.DOM.getElement(e);
this._setOptions(_561);
if(this.options.__unstable__wrapElement){
e=this._doWrap(e);
}
var _562=this.options.color;
var C=MochiKit.Color.Color;
if(this.options.color=="fromElement"){
_562=C.fromBackground(e);
}else{
if(!(_562 instanceof C)){
_562=C.fromString(_562);
}
}
this.isTransparent=(_562.asRGB().a<=0);
var _564=this.options.bgColor;
if(this.options.bgColor=="fromParent"){
_564=C.fromBackground(e.offsetParent);
}else{
if(!(_564 instanceof C)){
_564=C.fromString(_564);
}
}
this._roundCornersImpl(e,_562,_564);
};
MochiKit.Visual._RoundCorners.prototype={_doWrap:function(e){
var _565=e.parentNode;
var doc=MochiKit.DOM.currentDocument();
if(typeof (doc.defaultView)=="undefined"||doc.defaultView==null){
return e;
}
var _566=doc.defaultView.getComputedStyle(e,null);
if(typeof (_566)=="undefined"||_566==null){
return e;
}
var _567=MochiKit.DOM.DIV({"style":{display:"block",marginTop:_566.getPropertyValue("padding-top"),marginRight:_566.getPropertyValue("padding-right"),marginBottom:_566.getPropertyValue("padding-bottom"),marginLeft:_566.getPropertyValue("padding-left"),padding:"0px"}});
_567.innerHTML=e.innerHTML;
e.innerHTML="";
e.appendChild(_567);
return e;
},_roundCornersImpl:function(e,_568,_569){
if(this.options.border){
this._renderBorder(e,_569);
}
if(this._isTopRounded()){
this._roundTopCorners(e,_568,_569);
}
if(this._isBottomRounded()){
this._roundBottomCorners(e,_568,_569);
}
},_renderBorder:function(el,_570){
var _571="1px solid "+this._borderColor(_570);
var _572="border-left: "+_571;
var _573="border-right: "+_571;
var _574="style='"+_572+";"+_573+"'";
el.innerHTML="<div "+_574+">"+el.innerHTML+"</div>";
},_roundTopCorners:function(el,_575,_576){
var _577=this._createCorner(_576);
for(var i=0;i<this.options.numSlices;i++){
_577.appendChild(this._createCornerSlice(_575,_576,i,"top"));
}
el.style.paddingTop=0;
el.insertBefore(_577,el.firstChild);
},_roundBottomCorners:function(el,_578,_579){
var _580=this._createCorner(_579);
for(var i=(this.options.numSlices-1);i>=0;i--){
_580.appendChild(this._createCornerSlice(_578,_579,i,"bottom"));
}
el.style.paddingBottom=0;
el.appendChild(_580);
},_createCorner:function(_581){
var dom=MochiKit.DOM;
return dom.DIV({style:{backgroundColor:_581.toString()}});
},_createCornerSlice:function(_582,_583,n,_584){
var _585=MochiKit.DOM.SPAN();
var _586=_585.style;
_586.backgroundColor=_582.toString();
_586.display="block";
_586.height="1px";
_586.overflow="hidden";
_586.fontSize="1px";
var _587=this._borderColor(_582,_583);
if(this.options.border&&n==0){
_586.borderTopStyle="solid";
_586.borderTopWidth="1px";
_586.borderLeftWidth="0px";
_586.borderRightWidth="0px";
_586.borderBottomWidth="0px";
_586.height="0px";
_586.borderColor=_587.toString();
}else{
if(_587){
_586.borderColor=_587.toString();
_586.borderStyle="solid";
_586.borderWidth="0px 1px";
}
}
if(!this.options.compact&&(n==(this.options.numSlices-1))){
_586.height="2px";
}
this._setMargin(_585,n,_584);
this._setBorder(_585,n,_584);
return _585;
},_setOptions:function(_588){
this.options={corners:"all",color:"fromElement",bgColor:"fromParent",blend:true,border:false,compact:false,__unstable__wrapElement:false};
MochiKit.Base.update(this.options,_588);
this.options.numSlices=(this.options.compact?2:4);
},_whichSideTop:function(){
var _589=this.options.corners;
if(this._hasString(_589,"all","top")){
return "";
}
var _590=(_589.indexOf("tl")!=-1);
var _591=(_589.indexOf("tr")!=-1);
if(_590&&_591){
return "";
}
if(_590){
return "left";
}
if(_591){
return "right";
}
return "";
},_whichSideBottom:function(){
var _592=this.options.corners;
if(this._hasString(_592,"all","bottom")){
return "";
}
var _593=(_592.indexOf("bl")!=-1);
var _594=(_592.indexOf("br")!=-1);
if(_593&&_594){
return "";
}
if(_593){
return "left";
}
if(_594){
return "right";
}
return "";
},_borderColor:function(_595,_596){
if(_595=="transparent"){
return _596;
}else{
if(this.options.border){
return this.options.border;
}else{
if(this.options.blend){
return _596.blendedColor(_595);
}
}
}
return "";
},_setMargin:function(el,n,_597){
var _598=this._marginSize(n)+"px";
var _599=(_597=="top"?this._whichSideTop():this._whichSideBottom());
var _600=el.style;
if(_599=="left"){
_600.marginLeft=_598;
_600.marginRight="0px";
}else{
if(_599=="right"){
_600.marginRight=_598;
_600.marginLeft="0px";
}else{
_600.marginLeft=_598;
_600.marginRight=_598;
}
}
},_setBorder:function(el,n,_601){
var _602=this._borderSize(n)+"px";
var _603=(_601=="top"?this._whichSideTop():this._whichSideBottom());
var _604=el.style;
if(_603=="left"){
_604.borderLeftWidth=_602;
_604.borderRightWidth="0px";
}else{
if(_603=="right"){
_604.borderRightWidth=_602;
_604.borderLeftWidth="0px";
}else{
_604.borderLeftWidth=_602;
_604.borderRightWidth=_602;
}
}
},_marginSize:function(n){
if(this.isTransparent){
return 0;
}
var o=this.options;
if(o.compact&&o.blend){
var _605=[1,0];
return _605[n];
}else{
if(o.compact){
var _606=[2,1];
return _606[n];
}else{
if(o.blend){
var _607=[3,2,1,0];
return _607[n];
}else{
var _608=[5,3,2,1];
return _608[n];
}
}
}
},_borderSize:function(n){
var o=this.options;
var _609;
if(o.compact&&(o.blend||this.isTransparent)){
return 1;
}else{
if(o.compact){
_609=[1,0];
}else{
if(o.blend){
_609=[2,1,1,1];
}else{
if(o.border){
_609=[0,2,0,0];
}else{
if(this.isTransparent){
_609=[5,3,2,1];
}else{
return 0;
}
}
}
}
}
return _609[n];
},_hasString:function(str){
for(var i=1;i<arguments.length;i++){
if(str.indexOf(arguments[i])!=-1){
return true;
}
}
return false;
},_isTopRounded:function(){
return this._hasString(this.options.corners,"all","top","tl","tr");
},_isBottomRounded:function(){
return this._hasString(this.options.corners,"all","bottom","bl","br");
},_hasSingleTextChild:function(el){
return (el.childNodes.length==1&&el.childNodes[0].nodeType==3);
}};
MochiKit.Visual.roundElement=function(e,_610){
new MochiKit.Visual._RoundCorners(e,_610);
};
MochiKit.Visual.roundClass=function(_611,_612,_613){
var _614=MochiKit.DOM.getElementsByTagAndClassName(_611,_612);
for(var i=0;i<_614.length;i++){
MochiKit.Visual.roundElement(_614[i],_613);
}
};
MochiKit.Visual.Color=MochiKit.Color.Color;
MochiKit.Visual.getElementsComputedStyle=MochiKit.DOM.computedStyle;
MochiKit.Visual.__new__=function(){
var m=MochiKit.Base;
m.nameFunctions(this);
this.EXPORT_TAGS={":common":this.EXPORT,":all":m.concat(this.EXPORT,this.EXPORT_OK)};
};
MochiKit.Visual.EXPORT=["roundElement","roundClass"];
MochiKit.Visual.EXPORT_OK=[];
MochiKit.Visual.__new__();
MochiKit.Base._exportSymbols(this,MochiKit.Visual);
if(typeof (MochiKit)=="undefined"){
MochiKit={};
}
if(typeof (MochiKit.MochiKit)=="undefined"){
MochiKit.MochiKit={};
}
MochiKit.MochiKit.NAME="MochiKit.MochiKit";
MochiKit.MochiKit.VERSION="1.3";
MochiKit.MochiKit.__repr__=function(){
return "["+this.NAME+" "+this.VERSION+"]";
};
MochiKit.MochiKit.toString=function(){
return this.__repr__();
};
MochiKit.MochiKit.SUBMODULES=["Base","Iter","Logging","DateTime","Format","Async","DOM","LoggingPane","Color","Signal","Visual"];
if(typeof (JSAN)!="undefined"||typeof (dojo)!="undefined"){
if(typeof (dojo)!="undefined"){
dojo.provide("MochiKit.MochiKit");
dojo.require("MochiKit.*");
}
if(typeof (JSAN)!="undefined"){
JSAN.use("MochiKit.Base",[]);
JSAN.use("MochiKit.Iter",[]);
JSAN.use("MochiKit.Logging",[]);
JSAN.use("MochiKit.DateTime",[]);
JSAN.use("MochiKit.Format",[]);
JSAN.use("MochiKit.Async",[]);
JSAN.use("MochiKit.DOM",[]);
JSAN.use("MochiKit.LoggingPane",[]);
JSAN.use("MochiKit.Color",[]);
JSAN.use("MochiKit.Signal",[]);
JSAN.use("MochiKit.Visual",[]);
}
(function(){
var _615=MochiKit.Base.extend;
var self=MochiKit.MochiKit;
var _616=self.SUBMODULES;
var _617=[];
var _618=[];
var _619={};
var i,k,m,all;
for(i=0;i<_616.length;i++){
m=MochiKit[_616[i]];
_615(_617,m.EXPORT);
_615(_618,m.EXPORT_OK);
for(k in m.EXPORT_TAGS){
_619[k]=_615(_619[k],m.EXPORT_TAGS[k]);
}
all=m.EXPORT_TAGS[":all"];
if(!all){
all=_615(null,m.EXPORT,m.EXPORT_OK);
}
var j;
for(j=0;j<all.length;j++){
k=all[j];
self[k]=m[k];
}
}
self.EXPORT=_617;
self.EXPORT_OK=_618;
self.EXPORT_TAGS=_619;
}());
}else{
if(typeof (MochiKit.__compat__)=="undefined"){
MochiKit.__compat__=true;
}
(function(){
var _620=document.getElementsByTagName("script");
var _621="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
var base=null;
var _622=null;
var _623={};
var i;
for(i=0;i<_620.length;i++){
var src=_620[i].getAttribute("src");
if(!src){
continue;
}
_623[src]=true;
if(src.match(/MochiKit.js$/)){
base=src.substring(0,src.lastIndexOf("MochiKit.js"));
_622=_620[i];
}
}
if(base==null){
return;
}
var _624=MochiKit.MochiKit.SUBMODULES;
for(var i=0;i<_624.length;i++){
if(MochiKit[_624[i]]){
continue;
}
var uri=base+_624[i]+".js";
if(uri in _623){
continue;
}
if(document.documentElement&&document.documentElement.namespaceURI==_621){
var s=document.createElementNS(_621,"script");
s.setAttribute("id","MochiKit_"+base+_624[i]);
s.setAttribute("src",uri);
s.setAttribute("type","application/x-javascript");
_622.parentNode.appendChild(s);
}else{
document.write("<script src=\""+uri+"\" type=\"text/javascript\"></script>");
}
}
})();
}


