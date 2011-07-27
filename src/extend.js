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