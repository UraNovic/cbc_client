/**
 * cbccharts - v0.0.1 - 2015-03-10
 * http://cbc.com
 *
 * Copyright (c) 2015 cbc Labs, Inc.
 * Licensed ISC <>
 */
var API="https://api.cbccharts.com/api";var DOMAIN="http://cbccharts.com";var PRICECHART_CSS=".priceChart{position:relative;display:inline-block;width:100%;clear:both}.priceChart .background{pointer-events:all;fill:none;stroke:#999;stroke-width:1;shape-rendering:crispEdges}.priceChart .loader{position:absolute;top:50%;left:50%;width:40px;margin-top:-20px;margin-left:-20px}.priceChart .axis{fill:#999;shape-rendering:crispEdges}.priceChart .axis .title{stroke-width:1;stroke:#bbb;fill:#bbb}.priceChart .axis path,.priceChart .axis line{fill:none;stroke:#999;stroke-width:1}.priceChart .axis text{font-size:10px}.priceChart .axis.price text,.priceChart .axis.volume text{font-size:12px}.priceChart path{fill:none;stroke:#3369a8;stroke-width:2;stroke-linejoin:round}.priceChart line{stroke:#999;shape-rendering:crispEdges}.priceChart .status{position:absolute;top:30%;width:100%;color:#aaa;text-align:center}.priceChart .hover{stroke:#999;stroke-width:1}.priceChart .focus{fill:rgba(255,255,255,0.5);stroke:#999}.priceChart .focus.dark{fill:#555;stroke:none}.candlesticks rect{fill:#fff;stroke:#a22;stroke-width:1}.candlesticks line{stroke:#a22}.candlesticks .filled rect{fill:#a22}.candlesticks .up rect{stroke:#3a3}.candlesticks .up line{stroke:#3a3}.candlesticks .up.filled rect{fill:#3a3}.candlesticks line{stroke-width:1}.candlesticks line.extent{stroke-width:1}.priceChart .volumeBars rect{fill:#ddd;stroke:#bbb}.priceChart .title{font-size:15px}.priceChart .chartDetails{position:absolute;padding:1px 5px;font-size:14px;color:#333;text-align:right;background:rgba(255,255,255,0.5);border-bottom:1px solid rgba(150,150,150,0.2)}.priceChart .chartDetails span{display:inline-block;margin:0 .25em;font-size:12px;color:#999}.priceChart .chartDetails b{margin:0 .25em}.priceChart .chartDetails .date{margin-right:20px;text-align:right}.priceChart .chartDetails .high{color:#090}.priceChart .chartDetails .low{color:#900}.priceChart .chartDetails .vwap{color:#86b}.priceChart .chartDetails .volume{color:#369}.dark .priceChart .background,.dark .priceChart .hover,.dark .priceChart .axis path,.dark .priceChart .axis line{stroke:#404040}.dark .priceChart .axis text{fill:#666;stroke:#666}.dark .priceChart .volumeBars rect{opacity:.4;stroke:#888}.dark .priceChart .status{color:#666}.dark .candlesticks line{stroke-width:1;stroke:#a00}.dark .candlesticks .filled rect{fill:#a00}.dark .candlesticks .up line{stroke:#393}.dark .candlesticks .up rect{stroke:#393}.dark .candlesticks .filled.up rect{fill:#393;stroke:#393}.dark .candlesticks rect{fill:#000;stroke-width:1;stroke:#a00}.dark .priceChart .chartDetails{background:rgba(255,255,255,0.1)}.dark{color:#999;background:#000}.light{background:#fff}@keyframes rotating{from{-webkit-transform:rotate(0deg);-moz-transform:rotate(0deg);-ms-transform:rotate(0deg);-o-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);-moz-transform:rotate(360deg);-ms-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes rotating{from{-webkit-transform:rotate(0deg);-moz-transform:rotate(0deg);-ms-transform:rotate(0deg);-o-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);-moz-transform:rotate(360deg);-ms-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}.loader{-webkit-animation:rotating 1s linear infinite;-moz-animation:rotating 1s linear infinite;-ms-animation:rotating 1s linear infinite;-o-animation:rotating 1s linear infinite;animation:rotating 1s linear infinite}";var LOADER_PNG="iVBORw0KGgoAAAANSUhEUgAAAC8AAAAyCAYAAADMb4LpAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAoBJREFUeNrsmb1uwjAQgCHK1uyww072ssPePAAPwEBZYOABYKEd0p2xAw8Q9rCHPex0JzM9VxcpWM6vL3GixpIVifz4u8P36+7j8eg0dehlfHT/se/DxYTZj/zsw/SW78s71TpdSs0DNAOewRwlPHaCeQAhbrWBB/A5XN4yPh7AtEEARzk8gK/hMinw6k5GAI0A3CoIzsYK3h8qgYeFDdzjMmOuSvNTmC+S3xgV1b4s/JjIUU1VwI+I4JVoXun41/BBk+E9Ig5PBbxLBO9UDo+h/UcS/Fw0SaMw2K2kzdjKvA1oje3XXUHwhUxqTJkSs2i7zpgusK22AXC/TsVIHxOt14THvgD6WLtKKiLEN1x6ZYKXGWFFgAEleJnwIiP0qRfRc2wFMwTL4CHMmLzdoOwe6ClVkoU5+4C7F2B0ddBVRu8NE/LzuSguwDtTXMfkvNUVo68jElposDnd3ikS3kNvk/TeBW3ijnm8FWPcfEw4ggCHRHjUwqqmWfAJBNgKDRY1XldwNibYZnmGxz2+bkANMkElPxmsRdAJ6HDGdkS3OSbqNISDtVtcXbaCT0hzN9FiA7TFjPqTSIAB82paZMv0COEdQfbpx0TeosPUZFoPcW4NQN2Sy0Y2jDLSA78qyw3h74Tf9CqFx/1I1ca4pVRdZMmfVkInIA3wSrWOJtt+EITvtIyTwuP8dRw07i89S3YCDhnbJbLat0XFyFbiw3aOTsBGwsZ24ToapxXmdRY5BQg6Oc+WcPFFAQGe1oktwCHqzjLkO1LHkhjZWf6fdqZ1wXW8XN0DzOCGOA0MQgzWpThLjbRMwkrK4DyXG9ff6Tb5+L49GWnhW/gWvprxK8AA17MEbNrj+u8AAAAASUVORK5CYII=";!function(){function a(a){var b=a.__resizeTriggers__,c=b.firstElementChild,d=b.lastElementChild,e=c.firstElementChild;d.scrollLeft=d.scrollWidth,d.scrollTop=d.scrollHeight,e.style.width=c.offsetWidth+1+"px",e.style.height=c.offsetHeight+1+"px",c.scrollLeft=c.scrollWidth,c.scrollTop=c.scrollHeight}function b(a){return a.offsetWidth!=a.__resizeLast__.width||a.offsetHeight!=a.__resizeLast__.height}function c(c){var d=this;a(this),this.__resizeRAF__&&h(this.__resizeRAF__),this.__resizeRAF__=g(function(){b(d)&&(d.__resizeLast__.width=d.offsetWidth,d.__resizeLast__.height=d.offsetHeight,d.__resizeListeners__.forEach(function(a){a.call(d,c)}))})}function d(){if(!f){var a=(s?s:"")+".resize-triggers { "+(t?t:"")+'visibility: hidden; opacity: 0; } .resize-triggers, .resize-triggers > div, .contract-trigger:before { content: " "; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }',b=document.head||document.getElementsByTagName("head")[0],c=document.createElement("style");c.type="text/css",c.styleSheet?c.styleSheet.cssText=a:c.appendChild(document.createTextNode(a)),b.appendChild(c),f=!0}}var e=document.attachEvent,f=!1;if(!e){var g=function(){var a=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||function(a){return window.setTimeout(a,20)};return function(b){return a(b)}}(),h=function(){var a=window.cancelAnimationFrame||window.mozCancelAnimationFrame||window.webkitCancelAnimationFrame||window.clearTimeout;return function(b){return a(b)}}(),i=!1,j="animation",k="",l="animationstart",m="Webkit Moz O ms".split(" "),n="webkitAnimationStart animationstart oAnimationStart MSAnimationStart".split(" "),o="",p=document.createElement("fakeelement");if(void 0!==p.style.animationName&&(i=!0),i===!1)for(var q=0;q<m.length;q++)if(void 0!==p.style[m[q]+"AnimationName"]){o=m[q],j=o+"Animation",k="-"+o.toLowerCase()+"-",l=n[q],i=!0;break}var r="resizeanim",s="@"+k+"keyframes "+r+" { from { opacity: 0; } to { opacity: 0; } } ",t=k+"animation: 1ms "+r+"; "}window.addResizeListener=function(b,f){e?b.attachEvent("onresize",f):(b.__resizeTriggers__||("static"==getComputedStyle(b).position&&(b.style.position="relative"),d(),b.__resizeLast__={},b.__resizeListeners__=[],(b.__resizeTriggers__=document.createElement("div")).className="resize-triggers",b.__resizeTriggers__.innerHTML='<div class="expand-trigger"><div></div></div><div class="contract-trigger"></div>',b.appendChild(b.__resizeTriggers__),a(b),b.addEventListener("scroll",c,!0),l&&b.__resizeTriggers__.addEventListener(l,function(c){c.animationName==r&&a(b)})),b.__resizeListeners__.push(f))},window.removeResizeListener=function(a,b){e?a.detachEvent("onresize",b):(a.__resizeListeners__.splice(a.__resizeListeners__.indexOf(b),1),a.__resizeListeners__.length||(a.removeEventListener("scroll",c),a.__resizeTriggers__=!a.removeChild(a.__resizeTriggers__)))}}(),ApiHandler=function(a){function b(a){var b=d3.xhr(d.url+"/"+a);return b.header("Content-Type","application/json"),b}function c(a,b,c){return a.post(JSON.stringify(b)).on("load",function(a){var b=JSON.parse(a.response);c(null,b)}).on("error",function(a){c({status:a.status,text:a.statusText,message:a.response})}),a}var d=this;d.url=a,this.offersExercised=function(a,c,d){var e=b("offersExercised");return e.post(JSON.stringify(a)).on("load",function(b){var d=JSON.parse(b.response),e=[];if(d.length>1)if(a.reduce===!1){d.shift(),e=d.map(function(a){return{time:moment.utc(a[0]),price:a[1],amount:a[2],amount2:a[3],tx:a[4],id:a[5],type:""}});for(var f=null,g=e.length;g>-1;g--)f&&f.price>e[g].price?e[g].type="bid":f&&f.price<e[g].price&&(e[g].type="ask"),f=e[g]}else d.splice(0,1),1!=d.length||d[0][1]||d.shift(),e=d.map(function(a){return{startTime:moment.utc(a[0]),baseVolume:a[1],counterVolume:a[2],count:a[3],open:a[4],high:a[5],low:a[6],close:a[7],vwap:a[8],openTime:a[9],closeTime:a[10],partial:a[11]}});c(e)}).on("error",function(a){d&&d({status:a.status,text:a.statusText,message:a.response})}),e},this.valueSent=function(a,d,e){var f=b("valueSent");return c(f,a,function(a,b){a?e(a):d(b)})},this.issuerCapitalization=function(a,d,e){var f=b("issuerCapitalization");return c(f,a,function(a,b){a?e(a):d(b)})},this.getTotalAccounts=function(a,c){var d=b("accountsCreated");return a=a||new Date,d.post(JSON.stringify({startTime:a,endTime:d3.time.year.offset(a,-10),timeIncrement:"all"})).on("load",function(a){data=JSON.parse(a.response),num=data[1]&&data[1][1]?data[1][1]:0,c(null,num)}).on("error",function(a){c({status:a.status,text:a.statusText,message:a.response})}),d},this.accountsCreated=function(a,d){var e=b("accountsCreated");return c(e,a,d)},this.getTopMarkets=function(a,d){var e=b("topMarkets");return c(e,{exchange:a},d)},this.getVolume24Hours=function(a,d){var e=b("totalValueSent");return c(e,{exchange:a},d)},this.getVolume30Days=function(a,d){var e=b("totalValueSent");return c(e,{endTime:moment.utc(),startTime:moment.utc().subtract(30,"days"),exchange:a},d)},this.historicalMetrics=function(a,c,d,e,f,g,h){var i=b("historicalMetrics");return e=e||new Date,json={startTime:e,endTime:f,timeIncrement:g,metric:a},"cbc"!==c&&(json.exchange={currency:c,issuer:d}),i.post(JSON.stringify(json)).on("load",function(a){data=JSON.parse(a.response),h(null,data)}).on("error",function(a){h({status:a.status,text:a.statusText,message:a.response})}),i},this.accountsCreated=function(a,d){var e=b("accountsCreated");return c(e,a,d)},this.getTopMarkets=function(a,d){var e=b("topMarkets");return c(e,{exchange:a},d)},this.getVolume24Hours=function(a,d){var e=b("totalValueSent");return c(e,{exchange:a},d)},this.getVolume30Days=function(a,d){var e=b("totalValueSent");return c(e,{endTime:moment.utc(),startTime:moment.utc().subtract(30,"days"),exchange:a},d)},this.getNetworkValue=function(a,d){var e=b("totalNetworkValue");return c(e,{exchange:a},d)},this.exchangeRates=function(a,d){var e=b("exchangeRates");return c(e,a,d)},this.marketTraders=function(a,d){var e=b("marketTraders");return c(e,a,d)}},LOADER_PNG="undefined"==typeof LOADER_PNG?"assets/images/cbcThrobber.png":"data:image/png;base64,"+LOADER_PNG,PriceChart=function(b){function c(){z.html(""),D=z.selectAll("svg").data([0]),E=D.enter().append("svg").attr("width",b.width+b.margin.left+b.margin.right).attr("height",b.height+b.margin.top+b.margin.bottom),D.append("defs").append("clipPath").attr("id","clip").append("rect"),D.select("rect").attr("width",b.width).attr("height",b.height),F=D.append("g").attr("transform","translate("+b.margin.left+","+b.margin.top+")"),F.append("rect").attr("class","background").attr("width",b.width).attr("height",b.height),F.append("g").attr("class","volumeBars").attr("clip-path","url(#clip)"),F.append("g").attr("class","candlesticks").attr("clip-path","url(#clip)"),F.append("path").attr("class","line"),F.append("g").attr("class","x axis"),F.append("g").attr("class","volume axis").append("text").text("Volume").attr("class","title").attr("transform","rotate(-90)").attr("y",15).attr("x",-110),F.append("g").attr("class","price axis").attr("transform","translate("+b.width+", 0)").append("text").text("Price").attr("class","title").attr("transform","rotate(-90)").attr("y",-10).attr("x",-100),G=D.append("svg:defs").append("svg:linearGradient").attr("id","gradient").attr("x1","0%").attr("y1","0%").attr("x2","0%").attr("y2","100%").attr("spreadMethod","pad"),G.append("svg:stop").attr("offset","0%").attr("stop-color","#ccc").attr("stop-opacity",.5),G.append("svg:stop").attr("offset","100%").attr("stop-color","#ddd").attr("stop-opacity",.5),H=F.append("line").attr("class","hover").attr("y2",b.height),I=F.append("line").attr("class","hover"),J=F.append("circle").attr("class","focus dark").attr("r",3),K=z.append("h4").attr("class","status"),L=z.append("div").attr("class","chartDetails").style("left",b.margin.left+"px").style("right",b.margin.right+"px").style("top",b.margin.top-1+"px").style("opacity",0),M=z.append("img").attr("class","loader").attr("src",LOADER_PNG).style("opacity",0),p&&(D.style("opacity",.5),M.style("opacity",1))}function d(){var a=b.width,c=b.height,d=parseInt(y.style("width"),10),e=parseInt(y.style("height"),10);d&&e&&(b.width=d-b.margin.left-b.margin.right,b.height=e-b.margin.top-b.margin.bottom,b.height<150&&(b.height=150),(a!=b.width||c!=b.height)&&(D.attr("width",b.width+b.margin.left+b.margin.right).attr("height",b.height+b.margin.top+b.margin.bottom),D.select("rect").attr("width",b.width).attr("height",b.height),D.select("rect.background").attr("width",b.width).attr("height",b.height),h(!0)))}function e(a){K.html(a).style("opacity",1),a&&M.transition().duration(10).style("opacity",0)}function f(){var a,b={startTime:V,baseVolume:0,counterVolume:0,count:0,open:0,high:0,low:0,close:0,vwap:0,openTime:null,closeTime:null};a="se"==S?"second":"mi"==S?"minute":"ho"==S?"hour":"da"==S?"day":"we"==S?"week":"mo"==S?"month":"ye"==S?"year":S;var c={base:N,counter:O,timeIncrement:a,timeMultiple:U,incompleteApiRow:b};o?o.updateViewOpts(c):o=new OffersExercisedListener(c,g)}function g(a){var b=W.length?W[0]:null,c=W.length?W[W.length-1]:null,d=a;d.startTime=moment.utc(d.startTime),d.live=!0,c&&c.startTime.unix()===d.startTime.unix()?W[W.length-1]=d:(d.baseVolume&&W.push(d),P.add(T,"seconds"),Q.add(T,"seconds"),b&&b.startTime.unix()<P.unix()&&W.shift()),W.length&&h()}function h(a){e(p||W&&W.length?"":"No Data for this Period");var c=a?0:250,d=(moment(Q).unix()-moment(P).unix())/T,f=b.width/(1.5*d);3>f?f=1:4>f&&(f=2);var g=n(N.currency),h=n(O.currency);F.select(".axis.price").select("text").text("Price ("+h+")"),F.select(".axis.volume").select("text").text("Volume ("+g+")"),D.datum(W,function(a){return a.startTime}).on("mousemove",i).on("touchmove",i).on("touchstart",i).on("touchend",i),r.domain([P,Q]).range([0,b.width]),t.domain([0,2*d3.max(W,function(a){return a.baseVolume})]).range([b.height,0]),"line"==R?(F.select(".line").style("opacity",1),F.select(".candlesticks").style("opacity",0),s.domain([.975*d3.min(W,function(a){return Math.min(a.close)}),1.025*d3.max(W,function(a){return Math.max(a.close)})]).range([b.height,0])):(F.select(".line").style("opacity",0),F.select(".candlesticks").style("opacity",1),s.domain([.975*d3.min(W,function(a){return Math.min(a.open,a.close,a.high,a.low)}),1.025*d3.max(W,function(a){return Math.max(a.open,a.close,a.high,a.low)})]).range([b.height,0]));var j=d3.svg.line().x(function(a){return r(a.startTime)}).y(function(a){return s(a.close)});F.select(".line").datum(W,function(a){return a.startTime}).transition().duration(c).attr("d",j);var k=F.select(".candlesticks").selectAll("g").data(W,function(a){return a.startTime}),l=k.enter().append("g").attr("transform",function(a){return"translate("+r(a.startTime)+")"});l.append("line").attr("class","extent"),l.append("line").attr("class","high"),l.append("line").attr("class","low"),l.append("rect");var m=k.classed("up",function(a,b){if(b>0){var c=W[b-1];return c.close<=a.close}return a.open<=a.close}).classed("filled",function(a){return a.close<=a.open}).transition().duration(c).attr("transform",function(a){return"translate("+r(a.startTime)+")"});m.select(".extent").attr("y1",function(a){return s(a.low)}).attr("y2",function(a){return s(a.high)}),m.select("rect").attr("x",-f/2).attr("width",f).attr("y",function(a){return s(Math.max(a.open,a.close))}).attr("height",function(a){return Math.abs(s(a.open)-s(a.close))+.5}),m.select(".high").attr("x1",-f/4).attr("x2",f/4).attr("y1",function(a){return s(a.high)}).attr("y2",function(a){return s(a.high)}),m.select(".low").attr("x1",-f/4).attr("x2",f/4).attr("y1",function(a){return s(a.low)}).attr("y2",function(a){return s(a.low)}),d3.transition(k.exit()).attr("transform",function(a){return"translate("+r(a.startTime)+")"}).style("opacity",1e-6).remove();var o=F.select(".volumeBars").selectAll("rect").data(W,function(a){return a.startTime});o.enter().append("rect"),o.data(W,function(a){return a.startTime}).transition().duration(c).attr("x",function(a){return r(a.startTime)-f/3}).attr("y",function(a){return t(a.baseVolume)}).attr("width",f/1.2).attr("height",function(a){return b.height-t(a.baseVolume)}).style("fill","url(#gradient)"),o.exit().remove(),F.select(".x.axis").attr("transform","translate(0,"+s.range()[0]+")").transition().duration(c).call(u),F.select(".price.axis").attr("transform","translate("+r.range()[1]+", 0)").transition().duration(c).call(w),F.select(".volume.axis").transition().duration(c).call(v),p||(D.transition().duration(c).style("opacity",1),M.transition().duration(c).style("opacity",0))}function i(){var c,d,e,f,g,h=y.style("zoom")||1,i=d3.mouse(this)[0]/h,j=Math.max(0,Math.min(b.width+b.margin.left,i)),l=d3.bisect(W.map(function(a){return a.startTime}),r.invert(j-b.margin.left)),o=W[l];if(o){m?(c=m(o.open,O.currency),d=m(o.high,O.currency),e=m(o.low,O.currency),f=m(o.close,O.currency),a=m(o.vwap,O.currency),g=m(o.baseVolume,N.currency)):(c=o.open.toFixed(4),d=o.high.toFixed(4),e=o.low.toFixed(4),f=o.close.toFixed(4),f=o.vwap.toFixed(4),g=o.baseVolume.toFixed(2));var p=n(N.currency),q=z.select(".chartDetails");q.html("<span class='date'>"+k(o.startTime.local(),S)+"</span><span><small>O:</small><b>"+c+"</b></span><span class='high'><small>H:</small><b>"+d+"</b></span><span class='low'><small>L:</small><b>"+e+"</b></span><span><small>C:</small><b>"+f+"</b></span><span class='vwap'><small>VWAP:</small><b>"+a+"</b></span><span class='volume'><small>Vol:</small><b>"+g+" "+p+"</b></span>").style("opacity",1),H.transition().duration(50).attr("transform","translate("+r(o.startTime)+")"),J.transition().duration(50).attr("transform","translate("+r(o.startTime)+","+s(o.close)+")"),I.transition().duration(50).attr("x1",r(o.startTime)).attr("x2",b.width).attr("y1",s(o.close)).attr("y2",s(o.close)),H.style("opacity",1),I.style("opacity",1),J.style("opacity",1)}}function j(a){var b;if(a||(a=moment().utc()),a.subtract("milliseconds",a.milliseconds()),"se"==S)b=a.subtract("seconds",a.seconds()%U);else if("mi"==S)b=a.subtract({seconds:a.seconds(),minutes:a.minutes()%U});else if("ho"==S)b=a.subtract({seconds:a.seconds(),minutes:a.minutes(),hours:a.hours()%U});else if("da"==S){var c,d;1===U?c=0:(d=a.diff(moment.utc([2013,0,1]),"hours")/24,c=0>d?U-(0-Math.floor(d))%U:Math.floor(d)%U),b=a.subtract({seconds:a.seconds(),minutes:a.minutes(),hours:a.hours(),days:c})}else"we"==S?b=a.subtract({seconds:a.seconds(),minutes:a.minutes(),hours:a.hours(),days:a.day(),weeks:a.isoWeek()%U}):"mo"==S&&(b=a.subtract({seconds:a.seconds(),minutes:a.minutes(),hours:a.hours(),days:a.date()-1,months:a.months()%U}));return b}function k(a,b){return"mi"==b?a.format("MMMM D")+" &middot "+a.format("hh:mm A")+" "+l(a):"ho"==b?a.format("MMMM D")+" &middot "+a.format("hh:mm A")+" "+l(a):"da"==b?a.utc().format("MMMM D")+" <small>("+a.utc().format("hh:mm A")+" UTC)</small>":"mo"==b?a.utc().format("MMMM YYYY")+"<small>UTC</small>":"ye"==b?a.utc().format("YYYY"):a.format("MMMM D")+" &middot "+a.format("hh:mm:ss A")+" "+l(a)}function l(a){var b=a.toDate()||new Date,c=b+"",d=c.match(/\(([^\)]+)\)$/)||c.match(/([A-Z]+) [\d]{4}$/);return d&&(d=d[1].match(/[A-Z]/g).join("")),!d&&/(GMT\W*\d{4})/.test(c)?RegExp.$1:d}function m(a,b,c){return"undefined"!=typeof cbc&&cbc.Amount?(c||(c=6),cbc.Amount.from_human(a+" "+b).to_human({max_sig_digits:6})):a}function n(a){return"undefined"!=typeof cbc&&cbc.Currency?cbc.Currency.from_json(N.currency).to_human():a}var o,p,q=this,r=d3.time.scale(),s=d3.scale.linear(),t=d3.scale.linear(),u=d3.svg.axis().scale(r),v=d3.svg.axis().scale(t).orient("left").tickFormat(d3.format("s")),w=d3.svg.axis().scale(s).orient("right"),x=new ApiHandler(b.url);q.onStateChange=null;var y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W=[];if(R=b.type?b.type:"line",y=b.id?d3.select("#"+b.id):d3.select("body").append("div"),A=parseInt(y.style("height"),10)||0,B=parseInt(y.style("width"),10)||0,z=y.append("div").attr("class","priceChart"),y.classed("priceChartWrap"),b.margin||(b.margin={top:2,right:60,bottom:20,left:60}),b.width||(b.width=B-b.margin.left-b.margin.right),b.height?b.height-b.margin.top-b.margin.bottom:b.height=A?A-b.margin.top-b.margin.bottom:window.innerHeight-b.margin.top-b.margin.bottom,b.height<150&&(b.height=150),b.width<0&&(b.width=0),c(),b.resize)addResizeListener(y.node(),d);else{var X=parseInt(L.style("padding-left"),10)+parseInt(L.style("padding-right"),10);L.style("width",b.width-X+"px").style("right","auto"),z.style("width",b.width+b.margin.left+b.margin.right+"px"),z.style("height",(b.height||C)+b.margin.top+b.margin.bottom+"px")}this.resizeChart=function(){d()},this.fadeOut=function(){z.selectAll("svg").transition().duration(100).style("opacity",.5),D.on("mousemove",null).on("touchmove",null),L.style("opacity",0),K.style("opacity",0),z.selectAll(".hover").style("opacity",0),z.selectAll(".focus").style("opacity",0),M.transition().duration(100).style("opacity",1)},this.setType=function(a){R=a,W.length&&h()},this.getRawData=function(){return W},this.load=function(a,c,d){if(!a)return e("Base currency is required.");if(!c)return e("Counter currency is required.");if(!d||!d.interval)return e("Interval is required.");if(S=d.interval.slice(0,2),"se"==S)T=1;else if("mi"==S)T=60;else if("ho"==S)T=3600;else if("da"==S)T=86400;else if("we"==S)T=604800;else{if("mo"!=S)return e("Invalid Interval");T=2635200}q.onStateChange&&q.onStateChange("loading"),q.fadeOut(),N=a,O=c,U=d.multiple||1,W=[],p=!0,T*=U,V=j(d.end?moment.utc(d.end):null),Q=moment.utc(V).add("seconds",T),P=d.start?j(moment.utc(d.start)):moment.utc(d.offset(Q)),o&&o.stopListener(),b.live&&d.live&&f(),q.request&&q.request.abort(),q.request=x.offersExercised({startTime:P.toDate(),endTime:Q.toDate(),timeIncrement:d.interval,timeMultiple:d.multiple,descending:!1,base:N,counter:O},function(a){if(W.length&&a.length){var c=W.shift(),e=a[a.length-1],f=e.baseVolume+c.baseVolume;e.high>c.high&&(e.high=c.high),e.low<c.low&&(e.low=c.low),e.vwap=(e.vwap*e.baseVolume+c.vwap*c.baseVolume)/f,e.baseVolume=f,e.close=c.close,e.closeTime=c.closeTime,a[a.length-1]=e}b.live&&d.live&&o.resetStored(a[a.length-1]),W=a.concat(W),p=!1,q.onStateChange&&q.onStateChange("loaded"),h()},function(a){q.onStateChange&&q.onStateChange("error"),p=!1,console.log(a),e(a.text?a.text:"Unable to load data")})},this.suspend=function(){o&&o.stopListener()}};var PriceChartWidget=function(a){var b,c,d,e=this;if(a||(a={}),!a.customCSS&&"undefined"!=typeof PRICECHART_CSS){var f=document.createElement("style");f.innerHTML=PRICECHART_CSS,document.getElementsByTagName("head")[0].appendChild(f)}a.id?b=d3.select("#"+a.id):(a.id="pc"+Math.random().toString(36).substring(5),b=d3.select("body").append("div").attr("id",a.id)),c=a.bodyTheme?d3.select("body"):b,d=null;var g=new PriceChart({url:a.apiURL||API,id:a.id,margin:a.margin,width:a.width,height:a.height,resize:a.resize||!1});return this.load=function(a){a||(a={});var b={start:a.start,end:a.end,interval:a.interval,multiple:a.multiple,offset:a.offset};if(!b.start&&!b.offset&&b.interval){var e=b.interval.slice(0,2),f=b.multiple||1;"se"==e?b.offset=function(a){return function(b){return d3.time.minute.offset(b,-2*a)}}(f):"mi"==e?b.offset=function(a){return function(b){return d3.time.hour.offset(b,-2*a)}}(f):"ho"==e?b.offset=function(a){return function(b){return d3.time.day.offset(b,-5*a)}}(f):"da"==e?b.offset=function(a){return function(b){return d3.time.day.offset(b,-120*a)}}(f):"we"==e?b.offset=function(a){return function(b){return d3.time.year.offset(b,-2*a)}}(f):"mo"==e&&(b.offset=function(){return function(a){return d3.time.year.offset(a,-10)}}(f))}d&&a.theme&&a.theme!=d&&c.classed(d,!1),a.theme&&(c.classed(a.theme,!0),d=a.theme),g.setType(a.type),g.load(a.base,a.counter,b)},this.loadFromQS=function(){function a(a,b,c){var d=200*c,e=b?b.slice(0,2):null;return e||(e=null),"mi"===e?moment.utc().subtract(d,"minutes"):"ho"===e?moment.utc().subtract(d,"hours"):"da"===e?moment.utc().subtract(d,"days"):"we"===e?moment.utc().subtract(d,"weeks"):"mo"===e?moment.utc().subtract(d,"months"):"ye"===e?moment.utc().subtract(d,"years"):moment.utc().subtract(1,"days")}function b(){for(var a={},b=window.location.search.substring(1),c=b?b.split("&"):[],d=0;d<c.length;d++){var e=c[d].split("="),f=decodeURIComponent(e[0]),g=decodeURIComponent(e[1]);try{a[f]=JSON.parse(g)}catch(h){a[f]=g}}return a}var c=b();if(c.base||(c.base={currency:"cbc",issuer:""}),c.counter||(c.counter={currency:"USD",issuer:"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"}),c.type||(c.type="line"),c.theme||(c.theme="light"),c.multiple||(c.multiple=1),c.end=c.end?moment.utc(c.end):moment.utc(),c.start=c.start?moment.utc(c.start):a(c.end,c.interval,c.multiple),!c.interval){var d=Math.abs(c.start.diff(c.end,"days"));if(d>365)c.interval="months",c.multiple=1;else if(d>120)c.interval="days",c.multiple=3;else if(d>30)c.interval="days",c.multiple=1;else if(d>5)c.interval="hours",c.multiple=4;else if(d>3)c.interval="hours",c.multiple=1;else{var f=Math.abs(c.start.diff(c.end,"hours"));f>12?(c.interval="minutes",c.multiple=15):f>2?(c.interval="minutes",c.multiple=5):(c.interval="minutes",c.multiple=1)}}e.load(c)},this.resize=g.resizeChart,this.suspend=g.suspend(),this};
