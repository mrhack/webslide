/*
 * debugger tools,
 * 
 */
(function(host){

	if(!host.console){
		var console = {
			log: function(msg){
				host.status = msg;
			}
		}
		host.console = console;
	}
})(window);

// extend function defined
(function($){
	var apply = function(t , o , ifCover){
			t = t || {};
			if(typeof o == "function")
				o = o.prototype;
			if(typeof o != "object")return t;
			for( var sName in o){
				if(t[sName] && !ifCover){
					continue;
				}
				t[sName] = o[sName];
			}
			return t;
		},
		extend = function(subclass, supclass , o){
			var f = function(){};
			f.prototype = supclass.prototype;
			subclass.prototype = new f();
			subclass.prototype.constructor = subclass;
			subclass.supclass = supclass;
			// apply the third arguments
			if(typeof o == "object")
				apply(subclass.prototype , o , true);
		};
	// export
	$.extendClass = extend;
	$.apply = apply;
})(jQuery);

// defined Observable class. Use observable pattern to decouple objects from each other and 
// make your code strong. What you need to do is just like browser event.
(function($){
	function Observable(){
		this._events = {};
		this.initialize();
	}
	Observable.prototype = {
		initialize: function(){
		},
		
		fireEvent: function(type){
			var ev = this._events[type.toLowerCase()];
			if(typeof ev == "object"){
				return ev.fire.apply(ev,Array.prototype.slice.call(arguments,1));
			}
			return true;
		},
		addListener: function(type ,fn , scope , o){
			if(typeof type == 'object'){
				o = type;
				for (var p in o){
					if(typeof o[p] == 'function'){
						this.addListener(p , o[p] ,o.scope , o);
					}else{
						this.addListener(p , o[p].fn , o[p].scope , o[p]);
					}
				}
				return;
			}
			type = type.toLowerCase();
			var ev = this._events[type] || false;
			if(!ev){
				ev = new Event(type,this);
				this._events[type] = ev;
			}
			ev.addListener(fn,scope,o);
		},
		removeListener: function(type , fn , scope){
			var ev = this._events[type.toLowerCase()];
			if(typeof(ev) == "object"){
				ev.removeListener(fn,scope);
			}
		}
	}

	function Event(type , obj){
		this.type = type;
		this.obj = obj;
		this.listeners = [];
	}
	Event.prototype = {
		addListener: function(fn , scope , o){
			scope = scope || this.obj;
			if(this.isListening(fn,scope)){
				return;
			}
			var listener = this.createListener(fn , scope , o);
			if(!this.firing)
				this.listeners.push(listener);
			else{
				this.listeners = this.listeners.slice(0);
				this.listeners.push(listener);
			}
		},
		createListener: function(fn,scope,o){
			o = o || {};
			scope = scope || this.obj;
			var listener = {
				fn: fn,
				scope: scope,
				options: o
			}
			return listener;
		},
		findListener: function(fn,scope){
			scope = scope || this.obj;
			var ls = this.listeners;
			for (var i = 0; i < ls.length; i++){
				var l = ls[i];
				if(l.fn == fn && l.scope == scope){
					return i;
				}
			}
			return -1;
		},
		isListening: function(fn , scope){
			this.findListener(fn , scope) != -1;
		},
		removeListener: function(fn,scope){
			var index = this.findListener(fn,scope);
			if(index !=-1){
				if(!this.firing){
					this.listeners.splice(index,1);
				}else{
					this.listeners = this.listeners.slice(0);
					this.listeners.splice(index,1);
				}
				return true;
			}
			return false;
		},
		clearListeners: function(){
			this.listener = [];
		},
		fire: function(){
			var ls = this.listeners , scope ,len = ls.length;
			if(len == 0){
				return true;
			}
			this.firing = true;
			var args = Array.prototype.slice.call(arguments,0);
			for (var i = 0; i < len; i++){
				var l = ls[i]
				try{
					if(l.fn.apply(l.scope || this.obj || window,args) === false){
						this.firing = false;
						return false;
					}
				}catch(error){
					// debug
				}
			}
			this.firing = false;
			return true;
		}
	}
	// export
	$.Observable = Observable;
})(jQuery);