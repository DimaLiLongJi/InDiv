parcelRequire=function(e,r,n,t){function i(n,t){function o(e){return i(o.resolve(e))}function c(r){return e[n][1][r]||r}if(!r[n]){if(!e[n]){var l="function"==typeof parcelRequire&&parcelRequire;if(!t&&l)return l(n,!0);if(u)return u(n,!0);if(f&&"string"==typeof n)return f(n);var p=new Error("Cannot find module '"+n+"'");throw p.code="MODULE_NOT_FOUND",p}o.resolve=c;var a=r[n]=new i.Module(n);e[n][0].call(a.exports,o,a,a.exports,this)}return r[n].exports}function o(e){this.id=e,this.bundle=i,this.exports={}}var u="function"==typeof parcelRequire&&parcelRequire,f="function"==typeof require&&require;i.isParcelRequire=!0,i.Module=o,i.modules=e,i.cache=r,i.parent=u;for(var c=0;c<n.length;c++)i(n[c]);if(n.length){var l=i(n[n.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):t&&(this[t]=l)}return i}({10:[function(require,module,exports) {
var define;
var e;parcelRequire=function(n,t,r,o){function i(e,r){function o(e){return i(o.resolve(e))}if(!t[e]){if(!n[e]){var a="function"==typeof parcelRequire&&parcelRequire;if(!r&&a)return a(e,!0);if(u)return u(e,!0);if(f&&"string"==typeof e)return f(e);var c=new Error("Cannot find module '"+e+"'");throw c.code="MODULE_NOT_FOUND",c}o.resolve=function(t){return n[e][1][t]||t};var p=t[e]=new i.Module(e);n[e][0].call(p.exports,o,p,p.exports,this)}return t[e].exports}var u="function"==typeof parcelRequire&&parcelRequire,f="function"==typeof require&&require;i.isParcelRequire=!0,i.Module=function(e){this.id=e,this.bundle=i,this.exports={}},i.modules=n,i.cache=t,i.parent=u;for(var a=0;a<r.length;a++)i(r[a]);if(r.length){var c=i(r[r.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof e&&e.amd&&e(function(){return c})}return i}({1:[function(e,n,t){var r={set:function(e,n){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},r="",o="",i="";if(t.expires){var u=new Date;u.setDate(u.getDate()+t.expires),r=";expires="+u.toGMTString()}t.path&&(o=";path="+t.path),t.domain&&(i=";domain="+t.domain),document.cookie=encodeURIComponent(e)+"="+encodeURIComponent(JSON.stringify(n))+r+o+i},get:function(e){if(!e)return null;for(var n=document.cookie.split("; "),t=0;t<n.length;t++){var r=n[t].split("=");if(r[0]===encodeURIComponent(e)){var o=JSON.parse(decodeURIComponent(r[1]));return""===o?null:o}}return null},remove:function(e){this.set(e,"",-1)}};n.exports=r},{}]},{},[1]);
},{}],3:[function(require,module,exports) {
var t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}();function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var r=require("easier-cookie"),o=function(){function o(){n(this,o),this.toString=Object.prototype.toString,this.setCookie=r.set,this.getCookie=r.get,this.removeCookie=r.remove}return e(o,[{key:"buildQuery",value:function(t){if(!(t&&t instanceof Object))return"";var e="?";for(var n in t)t[n]instanceof Object?e+=n+"="+JSON.stringify(t[n])+"&":e+=n+"="+t[n].toString()+"&";return e.slice(0,e.length-1)}},{key:"getQuery",value:function(t){for(var e=window.location.search.replace("?","").split("&"),n={},r=0,o=e.length;r<o;r++){var i=e[r].split("=");n[i[0]]=i[1]}return n[t]?n[t]:""}},{key:"isFunction",value:function(t){return"[object Function]"===this.toString.call(t)}},{key:"isEqual",value:function(e,n,r,o){if(e===n)return 0!==e||1/e==1/n;if(null==e||null==n)return!1;if(e!=e)return n!=n;var i=void 0===e?"undefined":t(e);return("function"===i||"object"===i||"object"===(void 0===n?"undefined":t(n)))&&this.deepIsEqual(e,n,r,o)}},{key:"deepIsEqual",value:function(e,n,r,o){var i=this.toString.call(e);if(i!==this.toString.call(n))return!1;switch(i){case"[object RegExp]":case"[object String]":return""+e==""+n;case"[object Number]":return+e!=+e?+n!=+n:0==+e?1/+e==1/n:+e==+n;case"[object Date]":case"[object Boolean]":return+e==+n}var u="[object Array]"===i;if(!u){if("object"!==(void 0===e?"undefined":t(e))||"object"!==(void 0===n?"undefined":t(n)))return!1;var c=e.constructor,a=n.constructor;if(c!==a&&!(this.isFunction(c)&&c instanceof c&&this.isFunction(a)&&a instanceof a)&&"constructor"in e&&"constructor"in n)return!1}r=r||[],o=o||[];for(var s=r.length;s--;)if(r[s]===e)return o[s]===n;if(r.push(e),o.push(n),u){if((s=e.length)!==n.length)return!1;for(;s--;)if(!this.isEqual(e[s],n[s],r,o))return!1}else{var f=Object.keys(e),l=void 0;if(s=f.length,Object.keys(n).length!==s)return!1;for(;s--;)if(l=f[s],!n.hasOwnProperty(l)||!this.isEqual(e[l],n[l],r,o))return!1}return r.pop(),o.pop(),!0}}]),o}();module.exports=o;
},{"easier-cookie":10}],2:[function(require,module,exports) {
var t=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}();function e(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var n=require("./Utils"),i=function(){function i(){e(this,i),this.state={},this.utils=new n,this.$location={state:this.$getLocationState.bind(this),go:this.$locationGo.bind(this)}}return t(i,[{key:"$declare",value:function(){this.$fatherDom=null,this.$template="",this.$components={}}},{key:"$onInit",value:function(){}},{key:"$beforeMount",value:function(){}},{key:"$afterMount",value:function(){}},{key:"$onDestory",value:function(){}},{key:"$hasRender",value:function(){}},{key:"$watchState",value:function(t,e){}},{key:"$getLocationState",value:function(){return{path:window._esRouteObject.path,query:window._esRouteObject.query,params:window._esRouteObject.params}}},{key:"$locationGo",value:function(t,e,n){window._esRouteObject={path:t,query:e,params:n},"state"===window._esRouteMode&&history.pushState({path:t,query:e,params:n},null,""+t+this.utils.buildQuery(e)),"hash"===window._esRouteMode&&history.pushState({path:t,query:e,params:n},null,"#"+t+this.utils.buildQuery(e))}},{key:"setState",value:function(t){if(t&&this.utils.isFunction(t)){var e=t();if(e&&e instanceof Object)for(var n in e)this.state.hasOwnProperty(n)&&this.state[n]!==e[n]&&(this.state[n]=e[n])}if(t&&t instanceof Object)for(var i in t)this.state.hasOwnProperty(i)&&this.state[i]!==t[i]&&(this.state[i]=t[i])}}]),i}();module.exports=i;
},{"./Utils":3}],4:[function(require,module,exports) {
var t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}();function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var r=require("./Utils"),o=function(){function o(t,e,a){n(this,o),this.data=t,this.watcher=e,this.render=a,this.watchData(this.data),this.utils=new r}return e(o,[{key:"watchData",value:function(e){if(e&&"object"===(void 0===e?"undefined":t(e))){var n=this,r=function(t){var r=e[t];n.watchData(r),Object.defineProperty(e,t,{configurable:!0,enumerable:!1,get:function(){return r},set:function(e){if(!n.utils.isEqual(e,r)){var o={};o[t]=r;var a={};a[t]=e,r=e,n.watchData(r),n.watcher&&n.watcher(o,a),n.render&&n.render()}}})};for(var o in e)r(o)}}}]),o}();module.exports=o;
},{"./Utils":3}],5:[function(require,module,exports) {
var t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}();function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var o=require("./Utils"),r=function(){function r(t,e,i){n(this,r),this.data=t,this.watcher=i,this.key=e,this.watchData(this.data,this.key),this.utils=new o}return e(r,[{key:"watchData",value:function(e,n){if(e&&"object"===(void 0===e?"undefined":t(e))&&e[n]){var o=this,r=e[n];Object.defineProperty(e,n,{configurable:!0,enumerable:!1,get:function(){return r},set:function(t){if(!o.utils.isEqual(t,r)&&t!==r){var e={};e[n]=r;var i={};i[n]=t,r=t,o.watcher&&o.watcher(e,i)}}})}}}]),r}();module.exports=r;
},{"./Utils":3}],6:[function(require,module,exports) {
var e=function(){function e(e,t){for(var n=0;n<t.length;n++){var a=t[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(t,n,a){return n&&e(t.prototype,n),a&&e(t,a),t}}();function t(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var n=function(){function n(e){t(this,n),this.$fragment=e}return e(n,[{key:"_getVMVal",value:function(e,t){var n=e;return t.replace("()","").split(".").forEach(function(e){"this"!==e&&(n=n[e])}),n}},{key:"_getVMRepeatVal",value:function(e,t,n){var a=void 0;return t.replace("()","").split(".").forEach(function(t){a=t!==n?a[t]:e}),a}},{key:"bind",value:function(e,t,n,a,i,r,s,l){var u=void 0;u=0===i.indexOf(n)||0===i.indexOf(n+".")?this._getVMRepeatVal(t,i,n):this._getVMVal(s,i);var o=this._getVMVal(s,l);this.templateUpdater(e,t,n,s);var c=this[a+"Updater"];switch(a){case"model":c&&c.call(this,e,u,i,n,r,o,l,s);break;default:c&&c.call(this,e,u)}}},{key:"templateUpdater",value:function(e,t,n,a){var i=e.textContent;if(/\{\{(.*)\}\}/g.test(i)){var r=RegExp.$1,s=void 0;s=0===r.indexOf(n)||0===r.indexOf(n+".")?this._getVMRepeatVal(t,r,n):this._getVMVal(a,r),e.textContent=e.textContent.replace(/(\{\{.*\}\})/g,s)}}},{key:"textUpdater",value:function(e,t){e.textContent=void 0===t?"":t}},{key:"htmlUpdater",value:function(e,t){e.innerHTML=void 0===t?"":t}},{key:"ifUpdater",value:function(e,t){t&&this.$fragment.appendChild(e)}},{key:"classUpdater",value:function(e,t,n){var a=e.className,i=(a=a.replace(n,"").replace(/\s$/,""))&&String(t)?" ":"";e.className=a+i+t}},{key:"modelUpdater",value:function(e,t,n,a,i,r,s,l){e.value=void 0===t?"":t;var u=n.replace(a+".","");e.addEventListener("change",function(e){e.preventDefault(),e.target.value!==r[i][u]&&(r[i][u]=e.target.value)},!1)}},{key:"eventHandler",value:function(e,t,n,a,i,r){var s=this,l=a.split(":")[1],u=n.replace(/\(.*\)/,"").split("."),o=n.match(/\((.*)\)/)[1].replace(/ /g,"").split(","),c=t;u.forEach(function(e){"this"!==e&&(c=c[e])});l&&c&&e.addEventListener(l,function(e){var n=[];o.forEach(function(a){if(""===a)return!1;"$event"===a&&n.push(e),(/(this.).*/g.test(a)||/(this.state.).*/g.test(a)||/(this.props.).*/g.test(a))&&n.push(s._getVMVal(t,a)),/\'.*\'/g.test(a)&&n.push(a.match(/\'(.*)\'/)[1]),!/\'.*\'/g.test(a)&&/^[0-9]*$/g.test(a)&&n.push(Number(a)),"true"!==a&&"false"!==a||n.push("true"===a),0!==a.indexOf(i)&&0!==a.indexOf(i+".")||n.push(s._getVMRepeatVal(r,a,i))}),c.apply(t,n)},!1)}}]),n}(),a=function(){function a(e){t(this,a),this.$fragment=e}return e(a,[{key:"_getVMVal",value:function(e,t){var n=e;return t.replace("()","").split(".").forEach(function(e){"this"!==e&&(n=n[e])}),n}},{key:"_getVMRepeatVal",value:function(e,t){var n=t.split(" ");return this._getVMVal(e,n[3])}},{key:"_setVMVal",value:function(e,t,n){var a=e;(t=t.split(".")).forEach(function(e,i){i<t.length-1?a=a[e]:a[e]=n})}},{key:"bind",value:function(e,t,n,a){var i=this[a+"Updater"];if(this.isRepeatNode(e))switch(a){case"repeat":i&&i.call(this,e,this._getVMRepeatVal(t,n),n,t)}else switch(a){case"model":i&&i.call(this,e,this._getVMVal(t,n),n,t);break;case"text":i&&i.call(this,e,this._getVMVal(t,n));break;case"if":i&&i.call(this,e,this._getVMVal(t,n),n,t);break;default:i&&i.call(this,e,this._getVMVal(t,n))}}},{key:"templateUpdater",value:function(e,t,n){e.textContent=e.textContent.replace(/(\{\{.*\}\})/g,this._getVMVal(t,n))}},{key:"textUpdater",value:function(e,t){e.textContent=void 0===t?"":t}},{key:"htmlUpdater",value:function(e,t){e.innerHTML=void 0===t?"":t}},{key:"ifUpdater",value:function(e,t){!t&&this.$fragment.contains(e)?this.$fragment.removeChild(e):this.$fragment.appendChild(e)}},{key:"classUpdater",value:function(e,t,n){var a=e.className,i=(a=a.replace(n,"").replace(/\s$/,""))&&String(t)?" ":"";e.className=a+i+t}},{key:"modelUpdater",value:function(e,t,n,a){e.value=void 0===t?"":t;var i=n.replace(/(this.state.)|(this.props)/,"");e.addEventListener("change",function(e){e.preventDefault(),/(this.state.).*/.test(n)&&(a.state[i]=e.target.value),/(this.props.).*/.test(n)&&(a.props[i]=e.target.value)},!1)}},{key:"repeatUpdater",value:function(e,t,a,i){var r=this,s=a.split(" ")[1],l=a.split(" ")[3];t.forEach(function(t,a){var u=e.cloneNode(!0),o=u.attributes,c=u.textContent;/\{\{(.*)\}\}/g.test(c)&&c.indexOf("{{"+s)>=0&&new n(r.$fragment).templateUpdater(u,t,s,i),o&&Array.from(o).forEach(function(e){var o=e.name;if(r.isDirective(o)&&"es-repeat"!==o){var c=o.substring(3),f=e.value;r.isEventDirective(c)?new n(r.$fragment).eventHandler(u,i,f,c,s,t):new n(r.$fragment).bind(u,t,s,c,f,a,i,l)}}),r.isIfNode(e)||r.$fragment.appendChild(u)})}},{key:"isDirective",value:function(e){return 0===e.indexOf("es-")}},{key:"isEventDirective",value:function(e){return 0===e.indexOf("on")}},{key:"isElementNode",value:function(e){return 1===e.nodeType}},{key:"isRepeatNode",value:function(e){var t=e.attributes,n=!1;return t&&Array.from(t).forEach(function(e){"es-repeat"===e.name&&(n=!0)}),n}},{key:"isIfNode",value:function(e){var t=e.attributes,n=!1;return t&&Array.from(t).forEach(function(e){"es-if"===e.name&&(n=!0)}),n}}]),a}(),i=function(){function n(e,a){t(this,n),this.$vm=a,this.$el=this.isElementNode(e)?e:document.querySelector(e),this.$el&&(this.$fragment=this.node2Fragment(this.$el),this.init(),this.$el.appendChild(this.$fragment))}return e(n,[{key:"init",value:function(){this.compileElement(this.$fragment)}},{key:"compileElement",value:function(e){var t=document.createElement("div");t.innerHTML=this.$vm.$template;var n=t.childNodes;this.domRecursion(n,e)}},{key:"domRecursion",value:function(e,t){var n=this;Array.from(e).forEach(function(e){e.hasChildNodes()&&n.domRecursion(e.childNodes,e);var a=e.textContent;if(n.isElementNode(e)){if(/\{\{(.*)\}\}/g.test(a)){var i=RegExp.$1;/(.*\{\{(this.state.).*\}\}.*)|(.*\{\{(this.props.).*\}\}.*)/g.test(a)&&n.compileText(e,i)}n.compile(e,t)}n.isRepeatNode(e)&&t.contains(e)?t.removeChild(e):n.isIfNode(e)||t.appendChild(e)})}},{key:"compile",value:function(e,t){var n=this,i=e.attributes;i&&Array.from(i).forEach(function(i){var r=i.name;if(n.isDirective(r)){var s=r.substring(3),l=i.value;n.isEventDirective(s)?n.eventHandler(e,n.$vm,l,s):new a(t).bind(e,n.$vm,l,s)}})}},{key:"node2Fragment",value:function(e){for(var t=document.createDocumentFragment();void 0===e.firstChild;)t.appendChild(void 0);return t}},{key:"compileText",value:function(e,t){new a(this.$fragment).templateUpdater(e,this.$vm,t)}},{key:"eventHandler",value:function(e,t,n,i){var r=new a,s=i.split(":")[1],l=n.replace(/\(.*\)/,"").split("."),u=n.match(/\((.*)\)/)[1].replace(/\s+/g,"").split(","),o=t;l.forEach(function(e){"this"!==e&&(o=o[e])});s&&o&&e.addEventListener(s,function(e){var n=[];u.forEach(function(a){if(""===a)return!1;"$event"===a&&n.push(e),(/(this.).*/g.test(a)||/(this.state.).*/g.test(a)||/(this.props.).*/g.test(a))&&n.push(r._getVMVal(t,a)),/\'.*\'/g.test(a)&&n.push(a.match(/\'(.*)\'/)[1]),!/\'.*\'/g.test(a)&&/^[0-9]*$/g.test(a)&&n.push(Number(a)),"true"!==a&&"false"!==a||n.push("true"===a)}),o.apply(t,n)},!1)}},{key:"isDirective",value:function(e){return 0===e.indexOf("es-")}},{key:"isEventDirective",value:function(e){return 0===e.indexOf("on")}},{key:"isElementNode",value:function(e){return 1===e.nodeType}},{key:"isRepeatNode",value:function(e){var t=e.attributes,n=!1;return t&&Array.from(t).forEach(function(e){"es-repeat"===e.name&&(n=!0)}),n}},{key:"isIfNode",value:function(e){var t=e.attributes,n=!1;return t&&Array.from(t).forEach(function(e){"es-if"===e.name&&(n=!0)}),n}},{key:"isTextNode",value:function(e){return 3===e.nodeType}}]),n}();module.exports=i;
},{}],7:[function(require,module,exports) {
var e=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}();function t(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var i=require("./Lifecycle"),r=require("./Compile"),s=require("./Watcher"),h=function(h){function a(e,o){t(this,a);var i=n(this,(a.__proto__||Object.getPrototypeOf(a)).call(this));return e&&(i.$templateName=e),o&&(i.props=o),i.state={},i}return o(a,i),e(a,[{key:"$beforeInit",value:function(){this.$declare&&this.$declare(),this.props&&(this.propsWatcher=new s(this.props,this.$watchState.bind(this),this.$reRender.bind(this))),this.stateWatcher=new s(this.state,this.$watchState.bind(this),this.$reRender.bind(this))}},{key:"$mountComponent",value:function(e){for(var t in this.$declare&&this.$declare(),this.$components)this.$components[t].$fatherDom=e,this.$components[t].$beforeInit&&this.$components[t].$beforeInit(),this.$components[t].$onInit&&this.$components[t].$onInit(),this.$components[t].$beforeMount&&this.$components[t].$beforeMount()}},{key:"$render",value:function(){var e=this.$fatherDom.getElementsByTagName(this.$templateName)[0];if(e&&e.hasChildNodes())for(var t=e.childNodes,n=t.length-1;n>=0;n--)e.removeChild(t.item(n));if(this.$mountComponent(e),this.compile=new r(e,this),this.$components)for(var o in this.$components)this.$components[o].$render&&this.$components[o].$render(),this.$components[o].$afterMount&&this.$components[o].$afterMount();this.$hasRender&&this.$hasRender()}},{key:"$reRender",value:function(){var e=this.$fatherDom.getElementsByTagName(this.$templateName)[0];if(e&&e.hasChildNodes())for(var t=e.childNodes,n=t.length-1;n>=0;n--)e.removeChild(t.item(n));if(this.$mountComponent(e),this.$onDestory&&this.$onDestory(),this.compile=new r(e,this),this.$components)for(var o in this.$components)this.$components[o].$render&&this.$components[o].$reRender(),this.$components[o].$afterMount&&this.$components[o].$afterMount();this.$hasRender&&this.$hasRender()}},{key:"setProps",value:function(e){if(e&&this.utils.isFunction(e)){var t=e();if(t&&t instanceof Object)for(var n in t)this.props.hasOwnProperty(n)&&this.props[n]!==t[n]&&(this.props[n]=t[n])}if(e&&e instanceof Object)for(var o in e)this.props.hasOwnProperty(o)&&this.props[o]!==e[o]&&(this.props[o]=e[o])}}]),a}();module.exports=h;
},{"./Lifecycle":2,"./Compile":6,"./Watcher":4}],8:[function(require,module,exports) {
var e=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}();function t(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var r=require("./Lifecycle"),i=require("./Watcher"),s=require("./Compile"),h=function(h){function c(){t(this,c);var e=n(this,(c.__proto__||Object.getPrototypeOf(c)).call(this));return e.state={},e}return o(c,r),e(c,[{key:"$beforeInit",value:function(){this.$declare&&this.$declare(),this.stateWatcher=new i(this.state,this.$watchState.bind(this),this.$reRender.bind(this))}},{key:"$mountComponent",value:function(e){for(var t in this.$declare&&this.$declare(),this.$components)this.$components[t].$fatherDom=e,this.$components[t].$beforeInit&&this.$components[t].$beforeInit(),this.$components[t].$onInit&&this.$components[t].$onInit(),this.$components[t].$beforeMount&&this.$components[t].$beforeMount()}},{key:"$render",value:function(){var e=document.getElementById("root");if(e.hasChildNodes())for(var t=e.childNodes,n=t.length-1;n>=0;n--)e.removeChild(t.item(n));if(this.$mountComponent(e),this.compile=new s(e,this),this.$components)for(var o in this.$components)this.$components[o].$render&&this.$components[o].$render(),this.$components[o].$afterMount&&this.$components[o].$afterMount();this.$hasRender&&this.$hasRender()}},{key:"$reRender",value:function(){var e=document.getElementById("root");if(e.hasChildNodes()){for(var t=e.childNodes,n=t.length-1;n>=0;n--)e.removeChild(t.item(n));this.$onDestory&&this.$onDestory()}if(this.$mountComponent(e),this.compile=new s(e,this),this.$components)for(var o in this.$components)this.$components[o].$reRender&&this.$components[o].$reRender(),this.$components[o].$afterMount&&this.$components[o].$afterMount();this.$hasRender&&this.$hasRender()}}]),c}();module.exports=h;
},{"./Lifecycle":2,"./Watcher":4,"./Compile":6}],9:[function(require,module,exports) {
var e=function(){function e(e,t){for(var r=0;r<t.length;r++){var o=t[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,r,o){return r&&e(t.prototype,r),o&&e(t,o),t}}();function t(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var r=require("./Utils"),o=require("./KeyWatcher"),n=function(){function n(){var e=this;t(this,n),this.routes={},this.currentUrl="",this.lastRoute=null,this.rootDom=null,this.utils=new r,window.addEventListener("load",this.refresh.bind(this),!1),window.addEventListener("popstate",function(t){window._esRouteObject={path:location.pathname||"/",query:{},params:{}},e.refresh()},!1)}return e(n,[{key:"$routeChange",value:function(e,t){}},{key:"init",value:function(e){var t=this;if(window._esRouteMode="state",e&&e instanceof Array){e.forEach(function(e){if(!(e.path&&e.controller&&t.utils.isFunction(e.controller)))return console.error("need path or controller"),!1;t.route(e.path,e.controller)});var r=document.querySelector("#root");this.rootDom=r||null}else console.error("no routes exit")}},{key:"route",value:function(e,t){this.routes[e]=t||function(){}}},{key:"refresh",value:function(){var e=this;if(window._esRouteObject&&this.watcher||(window._esRouteObject={path:location.pathname||"/",query:{},params:{}},this.watcher=new o(window,"_esRouteObject",function(t,r){e.refresh()})),this.currentUrl=window._esRouteObject.path||"/",this.routes[this.currentUrl]){window.routerController&&(window.routerController.$onDestory&&window.routerController.$onDestory(),delete window.routerController);var t=new this.routes[this.currentUrl];window.routerController=t,t.$beforeInit&&t.$beforeInit(),t.$onInit&&t.$onInit(),this.renderController(t).then(function(){e.$routeChange(e.lastRoute,e.currentUrl),e.lastRoute=e.currentUrl}).catch(function(){console.error("route change failed")})}}},{key:"renderController",value:function(e){var t=e.$template;return t&&"string"==typeof t&&this.rootDom?(e.$beforeMount&&e.$beforeMount(),this.replaceDom(e).then(function(){e.$afterMount&&e.$afterMount()}),Promise.resolve()):(console.error("renderController failed: template or rootDom is not exit"),Promise.reject())}},{key:"replaceDom",value:function(e){return e.$render&&e.$render(),Promise.resolve()}}]),n}(),i=function(){function n(){var e=this;t(this,n),this.routes={},this.currentUrl="",this.lastRoute=null,this.rootDom=null,this.utils=new r,window.addEventListener("load",this.refresh.bind(this),!1),window.addEventListener("hashchange",this.refresh.bind(this),!1),window.addEventListener("popstate",function(t){window._esRouteObject={path:location.hash.split("?")[0].slice(1)||"/",query:{},params:{}},e.refresh()},!1)}return e(n,[{key:"$routeChange",value:function(e,t){}},{key:"init",value:function(e){var t=this;if(window._esRouteMode="hash",e&&e instanceof Array){e.forEach(function(e){if(!(e.path&&e.controller&&t.utils.isFunction(e.controller)))return console.error("need path or controller"),!1;t.route(e.path,e.controller)});var r=document.querySelector("#root");this.rootDom=r||null}else console.error("no routes exit")}},{key:"route",value:function(e,t){this.routes[e]=t||function(){}}},{key:"refresh",value:function(){var e=this;if(window._esRouteObject&&this.watcher||(window._esRouteObject={path:location.hash.split("?")[0].slice(1)||"/",query:{},params:{}},this.watcher=new o(window,"_esRouteObject",function(t,r){e.refresh()})),this.currentUrl=window._esRouteObject.path||"/",this.routes[this.currentUrl]){window.routerController&&(window.routerController.$onDestory&&window.routerController.$onDestory(),delete window.routerController);var t=new this.routes[this.currentUrl];window.routerController=t,t.$beforeInit&&t.$beforeInit(),t.$onInit&&t.$onInit(),this.renderController(t).then(function(){e.$routeChange(e.lastRoute,e.currentUrl),e.lastRoute=e.currentUrl}).catch(function(){console.error("route change failed")})}}},{key:"renderController",value:function(e){var t=e.$template;return t&&"string"==typeof t&&this.rootDom?(e.$beforeMount&&e.$beforeMount(),this.replaceDom(e).then(function(){e.$afterMount&&e.$afterMount()}),Promise.resolve()):(console.error("renderController failed: template or rootDom is not exit"),Promise.reject())}},{key:"replaceDom",value:function(e){return e.$render&&e.$render(),Promise.resolve()}}]),n}();module.exports={Router:n,RouterHash:i};
},{"./Utils":3,"./KeyWatcher":5}],1:[function(require,module,exports) {
var e=require("./Utils"),r=require("./Lifecycle"),o=require("./Watcher"),t=require("./KeyWatcher"),u=require("./Compile"),i=require("./Component"),l=require("./Controller"),q=require("./Router").Router,c=require("./Router").RouterHash;module.exports={Utils:e,Lifecycle:r,Watcher:o,KeyWatcher:t,Compile:u,Component:i,Controller:l,Router:q,RouterHash:c};
},{"./Utils":3,"./Lifecycle":2,"./Watcher":4,"./KeyWatcher":5,"./Compile":6,"./Component":7,"./Controller":8,"./Router":9}]},{},[1], null)
//# sourceMappingURL=/index.map