(function($){
	var host = this,

		/*
		 * Webppt Class constructor. Main class of Webppt
		 * 
		 */
		Webppt = function(dom){
			this.wrap = dom;
			this.pages = [];

			this.status = false;
			this.index = 0;

			// get page width and height
			var w = $(host);
			this.pageWidth = w.width();
			this.pageHeight = w.height();

			this.constructor.supclass.call(this);
		};
	// every page has its own event
	//
	$.extendClass(Webppt , $.Observable ,{

		initialize: function(){
			var that = this;
			this.wrap.css({
				height: this.pageHeight + "px",
				overflowY:"auto"
			}).children().each(function(i,dom){
				that.pages.push(new Page(dom , that));
			}).css({
				height: this.pageHeight + "px"
			});
			this.initEvents();
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
		 * next page , when current page end, the webppt will go to next page, 
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
		 */
		goPage: function(num){
			var lastpage = this.pages[this.index];
			lastpage.end();
			this.index = num;
			var currpage = this.pages[this.index];
			currpage.start();
		},

		/*
		 * previous page, if current page is the first page, then return width do nothing.
		 * This method include ending current page, and starting previous page
		 */
		prevPage: function(){
			if(this.index == 0){
				return false;
			}
			var currPage = this.pages[this.index];
			this.goPage(this.index-1);
		},

		/*
		 * begin to show ppt form num, hide all the page and then show current page
		 */
		start: function(num){
			this.status = true;
			// hide all the pages
			$.each(this.pages,function(i,page){
				page.hide();
			});
			this.goPage(num);
		},

		/*
		 * stop to show ppt,because other pages are at the status of end . so
		 * we need to set current page step to target status. To avoid to scroll 
		 * to top, we need to set the scroll top value.
		 */
		stop: function(){
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
			// set scroll top value to avoid change
			this.wrap.scrollTop(this.index * this.pageHeight);
		}
	});
	 
		
	/*
	 * every step constructor of a page.
	 * 
	 */
	var pagePrevClass = "web-ppt-page-",
		time = (+ new Date()),
		Page = function(obj , webppt){
			this.className = pagePrevClass+time,
			this.dom = obj;
			this.webppt = webppt;
			// current steps
			this.stepIndex = -1;
			// save steps
			this.steps = [];
			this.objs = [];

			this.constructor.supclass.call(this);
		};
		
	$.extendClass(Page , $.Observable ,{
		initialize: function(){
			var that = this;

			$(this.dom).addClass(this.className).css({position:'relative'});
			this.addListener("enterPage",function(page){
				this.stepIndex = -1;
				console.log("enter page :" + that.webppt.index);
				page.show();
				//reset all the step
				// set all these obj to target status
				$.each(page.steps,function(i,steps){
					// set orign status
					$.each(steps,function(i,step){
						step.reset();
					});
				});
			});
			// what would id do , when leave page
			this.addListener("leavePage",function(page){
				console.log("leave page :" + that.webppt.index);
				page.hide();
			});

			this.addListener("pageStep",function(){
				page.nextStep();
			});

			this.initEvent();
		},
		initEvent: function(){
			var that = this;
			// dbclick event to start to show ppt with current page
			$(this.dom).dblclick(function(event){
				// get current page
				var index = 0, 
					pages = that.webppt.pages;
				// if not started
				if(that.webppt.status == false){
					for (var i = 0; i < pages.length; i++){
						if(pages[i].dom == this){
							index = i;
							break;
						}
					}
					that.webppt.start(index);
					// set before call start
					//that.start();
				}else{ // aready started
					alert("aready started!");
				}
			});
		},
		events: [
			/*
			 * when all steps end,fire this event;
			 * 
			 */
			"pageEnd",

			/*
			 * when enter a page
			 */
			"enterPage",

			/*
			 * when leave a page
			 */
			"leavePage",
			
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
				var o = index;
				o.index = o.index || this.steps.length;
				return this.addStep(o.index, o.obj, o.orignStatus, o.targetStatus, o.duration, o.easing, o.callback);
			}else if(typeof index == "object"){
				return this.addStep(this.steps.length, index, obj, orign, target, time, easing);
			}
			var step = this.steps[index],
				currStep = new Step({
					obj: obj,
					orignStatus: orign,
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
				
				this.webppt.prevPage();
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
					this.webppt.nextPage();
					return;
				}
				if(!allEnd){
					return;
				}
			}else{
				// if no steps
				if(len == 0){
					this.webppt.nextPage();
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
		start: function(){
			this.fireEvent("enterPage",this);
		},
		
		end: function(){
			// what can i do
			this.fireEvent("leavePage",this);
		},
		hide: function(){
			$(this.dom).hide();
			// hide all the other objects of current page
			$.each(this.objs,function(i,obj){
				$(obj).hide();
			});
		},
		
		show: function(){
			$(this.dom).show();
			$.each(this.objs,function(i,obj){
				$(obj).show();
			});
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
			this.orign = $.apply(this.orign,this.options.orignStatus,true);
			this.target = $.apply(this.options.targetStatus,this.options.orignStatus,false);
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
			this.obj.css(this.target);
		}
	});
	// export
	host.Webppt = Webppt;
})(jQuery);