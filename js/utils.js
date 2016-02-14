(function($){
	window.doc = window.document;
	$doc = $(doc);
	$.queryToObject = function(/*String*/str){
		var dec = decodeURIComponent,
			qp = str.split('&'),//query parameters
			ret = {}, // return
			name,
			val;
		qp.forEach(function(item){
			if(!item.length) return;
			var s = item.indexOf('=');
			if(s === -1){
				name = dec(item);
				val = '';
			}else{
				name = dec(item.slice(0,s));
				val = dec(item.slice(s + 1));
			}
			if(typeof ret[name] === 'string'){
				ret[name] = [ret[name]];
			}
			Array.isArray(ret[name]) ? ret[name].push(val) : (ret[name] = val);
		});
		return ret;
	};
	$.hash = function(){
		var action = {
			set:function(){
				var hashObj = $.queryToObject($.hash());
				if(arguments.length === 1){
					var myObj = arguments[0];
					typeof myObj === 'object' && $.extend(hashObj,myObj);
				}else{
					hashObj[arguments[0]] = arguments[1];
				}
				$.hash(hashObj);
			},
			get:function(key){
				return $.queryToObject($.hash())[key];
			},
			remove:function(key){
				var hashObj = $.queryToObject($.hash());
				delete hashObj[key];
				$.hash(hashObj);
			}
		};
		switch(arguments.length){
			case 0:
				return window.location.hash.replace(/^[^#]*#?(.*)$/,'$1');
			case 1:
				var hash = arguments[0];
				if(typeof hash === 'string'){
					window.location.hash = (hash[0] === '#' ? '' : '#') + hash;
				}
				if(typeof hash === 'object'){
					window.location.hash = '#' + $.param(hash);
				}
			case 2:
				return action[arguments[0]](arguments[1]);
			case 3:
				return action[arguments[0]](arguments[1],arguments[2]);
		}
	};
})(jQuery);