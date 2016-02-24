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

	window.dialog && $.extend(dialog.defaults, {
        width: $(window).width() * .9,
        height: $(window).height() * .8 - 54,
        skin:'scroll'
    });

    $.confirm = function (opts) {
        var dialogOption = {
            title: '请确认：',
            content: opts.title,
            width: opts.width || 200,
            height: opts.height || '',
            onshow: function () { },
            ok: function () {
                if (opts.callback) opts.callback();
            },
            okValue: '确认',
            cancel: function () { },
            cancelValue: '取消'
        };
        opts.align && (dialogOption.align = opts.align);
        var confirmDialog = dialog(dialogOption);
        if (opts.elm) {
            confirmDialog.showModal(opts.elm);
        } else {
            confirmDialog.showModal();
        }
        return false;
    };
      //建立一個可存取到該file的url
    $.getObjectURL = function (file) {
        try {
            var url = null;
            if (window.createObjectURL != undefined) { // basic
                url = window.createObjectURL(file);
            } else if (window.URL != undefined) { // mozilla(firefox)
                url = window.URL.createObjectURL(file);
            } else if (window.webkitURL != undefined) { // webkit or chrome
                url = window.webkitURL.createObjectURL(file);
            }
            return url;
        } catch (e) {
            return '';
        }

    };

    //$.views.tags
    $.views && $.views.tags({
        stringify: function (data) {
            return escape(JSON.stringify(data));
        }
    });
})(jQuery);