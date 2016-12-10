
;(function () {
	$.compressImg = function (options, elm) {
		options = $.extend({
			$thumb: false, // 显示缩略图的元素，无就设置为空或false
			scale: 0.92, // 图片压缩比例
			limitSize: 2048, // 限止图片大小（KB），如果图片过大，会比例减小scale值，来确保图片大小符合要求
			imgWidth: 900, // 图片尺寸 为false值则表示自动等比缩放
			imgHeight: 0, // 图片尺寸
			lowBrowser: $.noop, // 低版本浏览器方案（IE9及以下）
			callback: $.noop, // 回调函数，参数：压缩后的图片路径
		}, options);

		var file,
			fd,
			canvasHtml = '<canvas id="_canvas-drawImg" style="display:none"></canvas>';

		var draw = function (options) {			
			$('#_canvas-drawImg').remove();
			$(canvasHtml).appendTo('body');
			var img = new Image();
			img.src = options.imgUrl;
			img.onload = function () {
				var canvas = document.getElementById('_canvas-drawImg'),
					ctx,
					imgSize,
					imgUrl,
					canvasSize = {};
				// 计算画布尺寸
				options.imgWidth && (canvasSize.width = this.width < options.imgWidth ? this.width: options.imgWidth);
				options.imgHeight && (canvasSize.height = this.height < options.imgHeight ? this.height: options.imgHeight);
				!canvasSize.width && (canvasSize.width = canvasSize.height * this.width / this.height);
				!canvasSize.height && (canvasSize.height = canvasSize.width * this.height / this.width);
				
				canvas.width = canvasSize.width || this.width;
				canvas.height = canvasSize.height || this.height;
			
				ctx = canvas.getContext('2d');
				ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
				
				imgUrl = canvas.toDataURL('image/jpeg', options.scale);

				// 计算压缩后图片的大致尺寸 (0.6-0.8之间)
				imgSize = imgUrl.length / 1024 * 0.8;

				// 通过压缩后图片大小调整canvas压缩比例(0-1之间) 参数不合法时，默认值为0.92
				if (options.limitSize) {
					options.limitSize = options.limitSize;
					if (imgSize > options.limitSize) {
						options.scale = options.limitSize / imgSize * options.scale;
						imgUrl = canvas.toDataURL('image/jpeg', options.scale);
					}
				}
				
				options.$thumb && options.$thumb.attr('src', imgUrl);
				options.callback && options.callback(imgUrl);
				console.log(imgUrl.length / 1024 * 0.8);
			};
		};

		if (window.FileReader) {
			file = elm.files[0];
			options.fileSize = file.size;
			fd = new FileReader();
			fd.readAsDataURL(file);
			fd.onload = function (e) {
				options.imgUrl = this.result;
				draw(options);
			};
		} else {
			options.lowBrowser && options.lowBrowser(options);
		}
	};
	$.fn.compressImg = function (options) {
		return this.each(function () {
			$(this).change(function () {
				if (this.value === '') {
					return;
				}
				$.compressImg(options, this);
			});
		});
	};
})();