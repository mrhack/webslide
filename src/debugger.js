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