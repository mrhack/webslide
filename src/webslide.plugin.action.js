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