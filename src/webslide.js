(function($){
	var host = this,
		// canvas draw class
		// help to draw line on mask canvas
		CanvasDraw = function(dom){
			this.canvas = dom;
			this.context = dom.getContext("2d");
			this.constructor.supclass.call(this);
		};

	$.extendClass(CanvasDraw , $.Observable, {
		initialize: function(){
			this.width = this.canvas.width;
			this.height = this.canvas.height;
			this.context.lineCap = "round";
			this.context.lineJoin = "round";
			this.setStyle(); 
			// get pos
			var offset = $(this.canvas).offset();
			this.x = offset.left;
			this.y = offset.top;
			this.initEvent();
		},
		fillStyle: "black",
		strokeStyle: "red",
		setStyle: function(fillStyle,strokeStyle){
			var ctx = this.context;
			ctx.fillStyle = this.fillStyle = fillStyle || this.fillStyle;
			ctx.strokeStyle = this.strokeStyle = strokeStyle || this.strokeStyle;
		},
		initEvent: function(){
			var me = this , 
				mousemoveFn = function(ev){
					me.drawPointer(ev.clientX,ev.clientY);
					return false;
				};
			
			$(this.canvas).mousedown(function(ev){
				me.context.moveTo(ev.clientX,ev.clientY);
				me.context.beginPath();
				$(this).mousemove(mousemoveFn);
				return false;
			});
			
			$(this.canvas).mouseup(function(ev){
				me.context.closePath();
				$(this).unbind("mousemove",mousemoveFn);
			});
		},
		drawPointer: function(x, y){
			var ctx = this.context;
			ctx.lineTo(x - this.x, y - this.y);
			ctx.stroke();
		},
		clear: function(){
			this.context.clearRect(0,0,this.width,this.height);
		}
	});
			
			
	/*
	 * WebSlide Class constructor. Main class of Webppt
	 * 
	 */
	var WebSlide = function(dom){
		this.wrap = dom;
		this.pages = [];
		
		this.status = false;
		this.index = -1;

		// get page width and height
		var w = $(host);
		this.pageWidth = w.width();
		this.pageHeight = w.height();
		this.pageMargin = 40;
		this.pageStartCss = {
			zIndex: 0,
			left: 0,
			top:0,
			right: 0,
			margin: 0,
			position: "absolute",
			height: this.pageHeight + "px",
			width: this.pageWidth + "px"
		};
		this.pageStopCss = {
			margin: this.pageMargin + "px",
			position:"relative",
			height: this.pageHeight - this.pageMargin*2 + "px",
			width: this.pageWidth - this.pageMargin*2 + "px"
		};
		
		// the two config set every page enter action and leave action. You can find this config 
		// from Webslide.pageAction. 
		this.pageLeaveAction = "";
		this.pageEnterAction = "";
		this.constructor.supclass.call(this);
	};

	// This object collect all action configs, just as jQuery easing plugin. So you can choose 
	// config from this object's attribute or create your config and add it to this object. 
	// This is to be a plugin for WebSlide. To distinguish from page enter action to page leave
	// action , it is better to add "enter" or "leave" prefix . 
	WebSlide.pageAction = {
		"fromRight": function(){
			return {
				origin: {left: this.pageWidth + 100 + "px"},
				target: {left: -this.pageWidth -100 + "px"},
				time: 1000
			}
		},
		// from right
		"enterFromRight": function(){
			return {
				origin: {left: this.pageWidth + "px"},
				time: 1000
			}
		},
		"leaveFromLeft" : function(){
			return {
				target: {left: -this.pageWidth + "px"},
				time: 1000
			}
		},
		// from left
		"enterFromLeft": function(){
			return {
				origin: {left: -this.pageWidth + "px"},
				time: 1000
			}
		},
		"leaveFromRight" : function(){
			return {
				target: {left: this.pageWidth + "px"},
				time: 1000
			}
		},
		// from top
		"enterFromTop" : function(){
			return {
				origin: {top: -this.pageHeight + "px"},
				time: 1000
			}
		},
		"leaveFromTop": function(){
			return {
				target: {top: this.pageHeight + "px"},
				time: 1000
			}
		},
		// from bottom
		"enterFromBottom" : function(){
			return {
				origin: {top: this.pageHeight + "px"},
				time: 1000
			}
		},
		"leaveFromBottom": function(){
			return {
				target: {top: -this.pageHeight + "px"},
				time: 1000
			}
		},
		
		"leaveCss3Action": function(){
			return {
				target: {
					"-webkit-transform-origin": "bottom left",
					"-webkit-transform": "rotate(-90deg)",
					"-webkit-transition-property": "-webkit-transform",
					"-webkit-transition-duration":"1s"
				},
				css3: true,
				time: 1000
			}
		},
		"leaveFromCenter": function(){
			return {
				target: {
					width:0 ,
					height:0 ,
					zIndex: 2000,
					left: this.pageWidth/2 + "px",
					top: this.pageHeight/2 + "px"
				},
				time: 1000
			}
		},
		"leaveFromCenterAndRotate": function(){
			return {
				target: {
					width:0 ,
					height:0 ,
					zIndex: 2000,
					left: this.pageWidth/2 + "px",
					top: this.pageHeight/2 + "px",
					"-webkit-transform": "rotate(-270deg)",
					"-webkit-transition-property": "-webkit-transform,width,height,left,top",
					"-webkit-transition-duration":"1s"
				},
				css3: true,
				time: 1000
			}
		},
		"enterFromCenter": function(){
			return {
				origin:{
					width:0 ,
					height:0 ,
					zIndex: 2000,
					left: this.pageWidth/2 + "px",
					top: this.pageHeight/2 + "px"
				},
				time:1000
			}
		},
		"leaveAfterOneSecond": function(){
			return {
				target:{zIndex:0},
				time: 1000
			}
		}
	}
	// every page has its own event
	$.extendClass(WebSlide , $.Observable ,{
		events:[
			// 跳转到第几页面的事件
			"gopage",
			// 开始之前触事件
			"beforestart",
			// 开始之后触事件
			"afterstart",
			// 结束之前触事件
			"beforestop",
			// 结束之后触事件
			"afterstop",
			// 初始化整个页面
			"initialize"
		],
		initialize: function(){
			var that = this;
			// set origin style
			this.wrap.css({
				width: this.pageWidth + "px",
				height: this.pageHeight + "px",
				overflowY:"auto"
			}).children().each(function(i,dom){
				that.pages.push(new Page(dom , that));
			}).css(this.pageStopCss);
			// events
			this.initEvents();
			this.fireEvent("initialize",this);
		},

		initEvents: function(){
			var that = this;

			// TODO ======= if move these event to Page class
			// mousewheel event , 
			$(document).bind('mousewheel',function(event){
				if(!that.status) return;
				that[event.wheelDelta < 0? "next" : "prev"]();
			});

			// 'esc' keyevent, 'right','left','up','down' keyevent
			$(document).keyup(function(event){
				if(!that.status) return;
				switch(event.keyCode){

					case 27: // 'esc'
						that.stop();
						break;

					case 39: // 'right'
					case 40: // 'down'
						that.next();
						break;

					case 38: // 'up'
					case 37: // 'left'
						that.prev();
						break; 
				}
			});
			
			// judge if there is all right to go page num
			this.addListener("gopage",function(slide,num){
				
			})
			// for initialize for others
			// e.g add info dom, tab dom ,here we init help board
			this.addListener("initialize",function(slide){
				var innerHTML = '<dl><dt>help</dt><dd><em>dblclick</em><span>to start slide show</span></dd><dd><em>mousewheel</em><span>to move around</span></dd><dd><em>→</em><em>↓</em><em>←</em><em>↑</em><span>to move around</span></dd><dd><em>Esc</em><span>to stop slide show</span></dd><dd><em>h</em><span>to toggle help board</span></dd><dd><em>c</em><span>to toggle control board</span></dd></dl>';
				that.helpBoardClass = "webslide-help";
				var board = that.helpBoard = $("<div></div>");
				board.html(innerHTML).appendTo(document.body).addClass(that.helpBoardClass).height(that.pageHeight);
				board.show = false;
				var orignLeft = board.offset().left;
				$(document).keyup(function(event){
					switch(event.keyCode){
						case 72: //"h"	
							board.stop(true,false);
							board.animate({left:!board.show?0:orignLeft+"px"},400,"swing");
							board.show = !board.show;
							break;
					}
				});
			});

			// reset pages
			this.addListener("initialize",function(slide){
				$(window).resize(function(){
					slide.resize();
				});
			});
			
			// show control board
			this.addListener("initialize",function(slide){
				var innerHTML = '<dt></dt><dd class="p-left"></dd><dd class="p-pen"></dd><dd class="p-right"></dd><dd class="p-num"></dd>';
				var board = that.controlBoard = $("<dl></dl>");
				that.controlBoardClass = "webslide-control";
				board.html(innerHTML).appendTo(document.body).addClass(that.controlBoardClass);
				board.show = false;
				
				var orignBottom = 20;

				// when go page , refresh page info
				that.addListener("gopage",function(obj,num){
					board.find(".p-num").html((num+1)+"/"+obj.pages.length);
				});
				$(document).keyup(function(event){
					if(!that.status) return;
					switch(event.keyCode){
						case 67: //"c"
							board.stop(true,false);
							// if no start do nothing
							board.animate({bottom:board.show ?"-100px":orignBottom+"px"},400,"swing");
							board.show = !board.show;
							break;
					}
				});

				// add listener for stop slide show , move out of controlBoard
				that.addListener("afterend", function(){
					board.stop(true,false);
					board.animate({bottom:"-100px"},400,"swing");
					if(that.drawCanvas){
						that.drawCanvas.hide();
					}
				});
				// add listener for stop slide show , move out of controlBoard
				that.addListener("afterend", function(){
					board.stop(true,false);
					board.animate({bottom:"-100px"},400,"swing");
					if(that.drawCanvas){
						that.drawCanvas.hide();
					}
				});

				// to left
				board.find(".p-left").click(function(event){
					that.prev();
				});
				// to right
				board.find(".p-right").click(function(event){
					that.next();
				});

				// to use pen draw 
				board.find(".p-pen").click(function(event){
					if(!that.drawCanvas){
						that.drawCanvas = $("<canvas class='webslide-draw'></canvas>").appendTo(document.body)
							.attr("width",that.pageWidth)
							.attr("height",that.pageHeight).click(function(e){
								return false;
							}).bind("contextmenu",function(e){
								$(this).hide();
								cd.clear();
								return false;
							});
						// draw event bind
						var cd = new CanvasDraw(that.drawCanvas[0]);
					}
					that.drawCanvas.show();
				});
			});
		},
		resize: function(){
			// use css3 scale
			/*
			this.wrap.children().css({
				"-webkit-transform-origin": "top center",
				"-webkit-transform": "scale("+$(window).height()/this.pageHeight1+")"
			});
			*/
			this.pageHeight = $(window).height();
			this.pageWidth = $(window).width();
			// reset start and stop status
			this.pageStartCss.height = this.pageHeight+"px";
			this.pageStartCss.width = this.pageWidth+"px";

			this.pageStopCss.height = this.pageHeight - this.pageMargin*2 + "px";
			this.pageStopCss.width = this.pageWidth- this.pageMargin*2 +"px";

			this.wrap.css({height:this.pageHeight+"px",width:this.pageWidth + "px"}).children().css({
				height: this[this.status?"pageStartCss":"pageStopCss"].height,
				width: this[this.status?"pageStartCss":"pageStopCss"].width,
			});

			// resize help board
			this.helpBoard.css({height:this.pageHeight+"px"});
		},
		setPageStepActions: function(selector,animation){
			$.each(this.pages,function(i,page){
				page.obj.find(selector).each(function(i,dom){
					animation.obj = dom;
					page.addStep(animation);
				});
			});
		},
		/*
		 * next step of current page
		 */
		next: function(){
			var page = this.pages[this.index];
			page.nextStep();
		},

		/*
		 * previous step of current page
		 */
		prev: function(){
			var page = this.pages[this.index];
			page.prevStep();
		},
		/*
		 * next page , when current page end, the WebSlide will go to next page, 
		 * it include ending current page, and starting next page
		 */
		nextPage: function(){
			if(this.index == this.pages.length-1){
				//alert("you can not go next page!");
				this.stop();
				return false;
			}
			this.goPage(this.index+1);
		},

		/*
		 * go to the page, leave current page and enter the page. This will execute
		 * needed steps to enter the page
		 * @parame index {Num} go to the current page index step
		 */
		goPage: function(num,index){
			if(this.fireEvent("gopage",this,num) === false) return;
			var lastpage = this.pages[this.index];
			var currpage = this.pages[num];
			if(lastpage && lastpage != currpage)
				lastpage.leavePage();
			this.index = num;

			currpage.enterPage(index || -1);
		},

		/*
		 * previous page, if current page is the first page, then return width do nothing.
		 * This method include ending current page, and starting previous page
		 */
		prevPage: function(){
			if(this.index == 0){
				return false;
			}
			var prevPage = this.pages[this.index-1];
			this.goPage(this.index-1,prevPage.steps.length-1);
		},

		/*
		 * begin to show ppt form num, hide all the page and then show current page
		 */
		start: function(num){
			if(this.fireEvent("beforestart",this) === false) return;
			this.status = true;
			// set style resize page size
			this.wrap.children().css(this.pageStartCss);
			// hide all the pages
			$.each(this.pages,function(i,page){
				page.hide();
			});
			this.goPage(num);
			if(this.fireEvent("afterstart",this) === false) return;
		},

		/*
		 * stop to show ppt,because other pages are at the status of end . so
		 * we need to set current page step to target status. To avoid to scroll 
		 * to top, we need to set the scroll top value.
		 */
		stop: function(){
			if(this.fireEvent("beforeend",this) === false) return;
			this.status = false;
			$.each(this.pages,function(i, page){
				page.show();
			});
			// reset current page steps to target status
			$.each(this.pages[this.index].steps,function(i,steps){
				$.each(steps,function(i,step){
					step.setToTargetStatus();
				});
			});
			// set scroll top value
			this.wrap.children().css(this.pageStopCss);
			this.wrap.scrollTop(this.index * this.pageHeight - this.index*this.pageMargin);
			this.index = -1;
			if(this.fireEvent("afterend",this) === false) return;
		}
	});
	
	
	/*
	 * every step constructor of a page.
	 * 
	 */
	var pagePrevClass = "web-ppt-page-",
		time = (+ new Date()),
		Page = function(obj , webslide){
			this.className = pagePrevClass+time,
			this.obj = $(obj);
			this.webslide = webslide;
			// current steps
			this.stepIndex = -1;
			this.leaveZIndex = 1000;
			this.enterZIndex = 1001;
			// save steps
			this.steps = [];
			this.objs = [];

			this.constructor.supclass.call(this);
		};
		
	$.extendClass(Page , $.Observable ,{
		initialize: function(){

			this.obj.addClass(this.className);

			this.addListener("pageStep",function(){
				page.nextStep();
			});

			this.initEvent();
		},
		initEvent: function(){
			var that = this;
			// dbclick event to start to show ppt with current page
			this.obj.dblclick(function(event){
				// get current page
				var index = 0, 
					pages = that.webslide.pages;
				// if not started
				if(that.webslide.status == false){
					for (var i = 0; i < pages.length; i++){
						if(pages[i].obj[0] == this){
							index = i;
							break;
						}
					}
					that.webslide.start(index);
				}else{ // aready started
					alert("aready started!");
				}
				return false;
			});
		},
		events: [
			/*
			 * when all steps end,fire this event;
			 * 
			 */
			"pageEnd",

			/*
			 * before enter a page
			 */
			"beforeEnterPage",

			/*
			 * after enter a page
			 */
			"afterEnterPage",

			/*
			 * before leave a page
			 */
			"beforeLeavePage",

			/*
			 * after leave a page
			 */
			"afterLeavePage",
			
			/*
			 * when run the step of current page
			 */
			"pageStep"
		],
		
		/*
		 * every step animation, it refers an dom object ,the first status of obj, the last status of obj
		 * and other options the animation need. The first options can be a number , it refres to add this 
		 * animation to the step.
		 */
		addStep: function(index, obj/*HtmlElement*/, orign/*object*/ , target/*object*/ , time , easing , cb){
			// send arguments as object
			if($.isPlainObject(index)){
				var o = index,
					index = o.index || this.steps.length;
				return this.addStep(index, o.obj, o.originStatus, o.targetStatus, o.duration, o.easing, o.callback);
			}else if(typeof index == "object"){
				return this.addStep(this.steps.length, index, obj, orign, target, time, easing);
			}
			var step = this.steps[index],
				currStep = new Step({
					obj: obj,
					originStatus: orign,
					targetStatus: target,
					duration: time,
					easing: easing,
					callback: cb
				});
			// not exist
			if(!step){
				this.steps[index] = [currStep];
			}else if($.isArray(step)){ // if is array
				step.push(currStep);
			//}else if($.isPlainObject(step)){ // if is a object
			//	this.steps[index] = [step,currStep];
			}else{// failed
				console.log("add step to page failed!");
				return false;
			}
			this.objs.push(obj);
			return true;
		},
		
		/*
		 * reset current steps, and judge if go prev page
		 */
		prevStep: function(){
			var index = this.stepIndex,
				steps = this.steps[index] || [] ;
			
			// if current index is -1, means you need to go prev page
			if(index == -1){
				//go prev page
				
				this.webslide.prevPage();
				return;
			}
			// reset current steps
			$.each(steps,function(i,step){
				step.end();
				step.reset();
			});
			this.stepIndex--;
		},
		nextStep: function(){
			var len = this.steps.length, index = this.stepIndex,
				steps = this.steps[index] || [] , that = this , allEnd = true;
			if(index != -1){
				// judge if last steps are end, and set end status first
				// set last steps to end
				$.each(steps,function(i,step){
					if(!step.isEnd){
						step.end(true);
						allEnd = false;
					}
				});
				
				if(allEnd && index >= len - 1){
					this.webslide.nextPage();
					return;
				}
				if(!allEnd){
					return;
				}
			}else{
				// if no steps
				if(len == 0){
					this.webslide.nextPage();
					return false;
				}
			}
			
			// set this steps to run
			index = ++this.stepIndex;
			steps = this.steps[index] || [];
			$.each(steps,function(i,step){
				step.run();
			});
			return true;
		},
		enterPage: function(index){
			this.fireEvent("beforeEnterPage",this,index);
			this.stepIndex = index;

			//reset all the step
			// set all these obj to target status
			var tempArr = []; // if there has same dom to reset , keep every dom is reseted once
			$.each(this.steps,function(i,steps){
				// set orign status
				if(i <= index){
					$.each(steps,function(i,step){
						//step.end();
					});
				}else{
					$.each(steps,function(i,step){
						if($.inArray(step.obj[0],tempArr)>=0){
							return;
						}
						tempArr.push(step.obj[0]);
						step.reset();
					});
				}
			});
			
			var me = this , slideEnterActionConfig = WebSlide.pageAction[this.webslide.pageEnterAction],
				config = (this.enterActionConfig || slideEnterActionConfig || this.defaultEnterActionConfig).call(this.webslide);

			// if hide animation is not finished , you should to stop animation

			this.show();
			// css animation and normal animation
			if(!config.css3){
				this.obj.css({zIndex: config.origin.zIndex || this.enterZIndex}).css(config.origin || {})
				.animate(this.webslide.pageStartCss , config.time || 0 , config.easing || "" , function(){
					me.fireEvent("afterEnterPage",this);
				});
			}else{
				//var duration = 
				this.obj.css(config.origin || {});
				setTimeout(function(){
					me.obj[0].style.cssText = "";
					me.obj.css(me.webslide.pageStartCss);
				},config.time || 3000);
			}
		},
		stopCss3Animation: function(){
			this.obj.css({
				"-webkit-animation-play-state":"paused"
			});
		},
		/*
		 * set page to origin status, and set to target origin
		 */
		setEnterActionConfig: function(origin,time,easing){
			this.enterActionConfig = function(){
				return {
					origin: origin,
					time: time,
					easing: easing
				}
			}
		},
		defaultEnterActionConfig: function(){
			return {
				origin: {},
				time: 0
			};
		},
		setLeaveActionConfig: function(target,time,easing){
			this.leaveActionConfig = function(){
				return {
					target: target,
					time: time,
					easing: easing
				}
			}
		},
		defaultLeaveActionConfig: function(){
			return {
				target: {},
				time: 0
			};
		},
		leavePage: function(){
			//this.setLeaveAction({left:-this.webslide.pageWidth+"px"},1000);
			this.fireEvent("beforeLeavePage",this);

			// get leave action config
			var me = this, slideLeaveActionConfig = WebSlide.pageAction[this.webslide.pageLeaveAction],
				// get page leave config
				config = (this.leaveActionConfig || slideLeaveActionConfig || this.defaultLeaveActionConfig).call(this.webslide);

			// set zIndex, some times we need to determine leave page and enter page which is top one.
			// you can decide this by WebSlide.pageAction config.
			this.obj.css({zIndex: config.target.zIndex || this.leaveZIndex});

			// when use css3 to show animation. config must contain css3 attribute. we use this tag
			// to design if use animation or css3 animation. Just as animation, css3 animation must
			// contain time config. So we can set page to origin style after css3 animation.
			if(!config.css3){
				this.obj.animate(config.target || {},config.time || 0,config.easing || "",function(){
					me.hide();
					me.obj.css(me.webslide.pageStartCss);
					me.fireEvent("afterLeavePage",this);
				});
			}else{// only set css only for css3, after css3 animation finished , set page style to origin
				this.obj.css(config.target || {});
				this._t = setTimeout(function(){
					me.obj[0].style.cssText = "";
					me.hide();
					me.obj.css(me.webslide.pageStartCss);
				},config.time || 3000);
			}
		},
		hide: function(){
			this.obj.hide();
		},
		
		show: function(){
			this.obj.show();
		}
	});
	
	var Step = function(o){
		this.obj = $(o.obj);
		this.options = o;
		this.isEnd = false;

		this.constructor.supclass.call(this);
	}
	$.extendClass(Step , $.Observable ,{
		initialize: function(){
			var target = this.options.targetStatus , obj = this.obj;
			this.orign = {};
			for( var sName in target){
				this.orign[sName] = obj.css(sName);
			}
			
			// this is all the orign status
			this.orign = $.apply(this.orign,this.options.originStatus,true);
			this.target = $.apply(this.options.targetStatus,this.options.originStatus,false);
			// set obj to the target status
			this.setToTargetStatus();
		},
		// call animation ,set status first
		run: function(){
			var op = this.options , that = this ,
				temp = $.extend({},op.targetStatus);
			// fix style like as position, if there is no number in value , then delete this prototype
			for( var sName in temp){
				if(!(""+temp[sName]).match(/\d/))
					temp[sName] = undefined;
			}
			// run animate
			$(this.obj).animate(temp, op.duration , op.easing ,function(){
				// if current step is aready end, do not call callback function
				if(that.isEnd) return;
				that.isEnd = true;
				(op.callback || $.noop).apply(this,arguments);
			});
		},
		// if end width callback, set attribute isEnd later, or set isEnd first.
		// if you scroll next step twice, this will need to call callback function, or if 
		// you scroll prev step when an animation is running, this will not call
		// callback function
		end: function(endWidthCallback){
			// don't clear queue set animation to end status
			if(!endWidthCallback)
				this.isEnd = true;
			$(this.obj).stop(false,true);
			this.isEnd = true;
		},
		reset: function(){
			//  clear targetStatus and set obj to orign css 
			this.obj.css(this.orign);
			this.isEnd = false;
		},
		setToTargetStatus: function(){
			this.isEnd = true;
			this.obj.css(this.target);
		}
	});
	// export
	host.WebSlide = WebSlide;
})(jQuery);

/* log 2011/8/2
 1.缺少统一控制功能，每一个页面都需要给相关的元素添加相关功能，有些重复。
	改进：可以统一给所有页面都添加相关的控制，例如：可以通过查看当前页面是否有需要执行动画的元素

 2.给页面切换添加动画特效，例如左右浮动，需要考虑特效的耦合方式。尽量减少耦合，达到可以轻松变换特效。


 3.可以添加动画组合函数，StepGroup  XXX

 4.==需要有提示信息，例如提示：双击，开始播放ppt，各种快捷键等

 5.在演示的时候需要让作者知道目前是第几页

 6.==做好全局查看模式

 7.模板扩展思路

 8.==画笔

 9.文字自适应大小

 10.======》 可视化编辑

*/

/*
2011/8/5  日志记录

#1.在canvas绘制时，移动鼠标，图标变成笔状 fixed

2.文字的放大缩小

*/

/*
2011/8/7 日志记录

1.在进入页面和离开页面时使用动画 如果同时使用enter和leave动画 有可能出现问题， 元素直接被display:none 不显示了

*/