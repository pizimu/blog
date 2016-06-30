// $.loading(status)
// stauts: Boolean. open or cloas the loading
// 	 	true||undefined: open; 
// 	 	false: close;
(function () {
	var count = 0;
	var loading = function () {
		return function (status) {
			if(status === undefined || status){
				count ++;
			} else {
				count --;
			}
			if (count < 0) {
				count = 0;
			}
			var $loading = $('#loading');
			if (count > 0) {
				if (!$loading.length) {
					$('<div id="loading"><div class="loading-con"></div></div>').appendTo('body');
				}
			} else {
				$loading.remove();
			}

		};
	};
	$.loading = loading();
})();

// $.fn.loading(onoff, cls)
// onoff: Boolean. open or class the loading
// 		true || undefined: open
// 		false: close 
// cls: String. the class of the loading
// 		'big': the big loading pic
// 		'mini': the small pic
(function () {
	$.fn.loading = function (onoff/*true|flase :open or close the loading*/, cls/*big,mini :the class of the loading.default: mini*/) {
		return this.each(function () {
			var $loading = $(this).find('.loading'),
				pos = $(this).css('position'),
				borderRadius = $(this).css('border-radius'),
				loadingCss = {
					width: $(this).outerWidth(),
					height: $(this).outerHeight(),
					marginLeft: '-' + $(this).css('border-left-width'),
					marginTop: '-' + $(this).css('border-top-width')
				};
			cls = cls || '';
			onoff = typeof onoff === 'undefined' ? true : onoff;

			if(borderRadius){
				loadingCss['border-radius'] = borderRadius;
			}
			if (onoff) {
				if(!$loading.length){
					$('<div class="loading"></div>')
						.addClass(cls)
						.css(loadingCss)
						.bind('click', function() {
							return false;
						})
						.appendTo(this);
				}
			} else {
				$loading.remove();
			}
			if(!{fixed:true,absolute:true,relative:true}[pos]){
				$(this).css('position', 'relative');
			}
		});
	};
})();

