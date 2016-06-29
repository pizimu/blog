(function(){
	var _count = 0,
		_expando = new Date() * 1,
		_isIE6 = !('minWidth' in $('html')[0].style),
		_isFixed = !_isIE6;

	var dialog_config = {
		autofocus: true,
		backdropBackground: '#000',
		backdropOpacity: 0.55,
		content: '<span class="dialog-loading">Loading...</span>',
		title: '',
		statusbar: '',
		button: null,
		ok: null,
		cancel: null,
		okValue: 'ok',
		cancelValue: 'cancel',
		cancelDisplay: true,
		width: '',
		height: '',
		padding: '',
		skin: '',
		align: 'bottom',
		quickClose: false,
		cssUri: '',
		className:'ZSdialog',
		innerHTML: 
			'<div i="dialog" class="zs-dialog">' +
	           	'<div class="zs-dialog-arrow-a"></div>' +
	          	'<div class="zs-dialog-arrow-b"></div>' +
	           	'<table class="zs-dialog-grid">' +
	               	'<tr>' +
	                   	'<td i="header" class="zs-dialog-header">' +
	                       	'<button i="close" class="zs-dialog-close">&#215;</button>' +
	                       	'<div i="title" class="zs-dialog-title"></div>' +
	                   	'</td>' +
	               	'</tr>' +
	               	'<tr>' +
	                   	'<td i="body" class="zs-dialog-body">' +
	                       	'<div i="content" class="zs-dialog-content"></div>' +
	                   	'</td>' +
	               	'</tr>' +
	               	'<tr>' +
	                   	'<td i="footer" class="zs-dialog-footer">' +
	                       	'<div i="statusbar" class="zs-dialog-statusbar"></div>' +
	                       	'<div i="button" class="zs-dialog-button"></div>' +
	                   	'</td>' +
	               	'</tr>' +
	           	'</table>' +
	    	'</div>'
	};
	function dialog(options, ok, cancel){
		options = $.extend(true, {}, dialog.defaults, options);
		var id = options.id = options.id || _expando + '-' + _count,
			api = dialog.get(id);

		// 如果存在同名的对话框，直接返回
		if(api){
			return api.focus();
		}

		// 主流移动设备支付fixed不友好，禁用此特性
		if(!_isFixed){
			options.fixed = false;
		}

		// 按钮组
		if(!$.isArray(options.button)){
			options.button = [];
		}

		// 取消按钮
		if(cancel !== undefined){
			options.cancel = cancel;
		}
		if(options.cancel){
			options.button.push({
				id: 'cancel',
				value: options.cancelValue,
				callback: options.cancel,
				display: options.cancelDisplay
			});
		}

		// 确定按钮
		if(ok !== undefined){
			options.ok = ok;
		}
		if(options.ok){
			options.button.push({
				id: 'ok',
				value: options.okValue,
				callback: options.ok,
				autofocus: true
			});
		}

		return dialog.current = dialog.list[id] = new dialog.create(options);
	}
	dialog.create = function(options){
		var me = this;

		// 更新 zIndex 全局配置
		if (options.zIndex) {
			dialog.zIndex  = options.zIndex;
		}

		// 弹窗内容

		this.node = this._node = $('<div />')
		.css({
			display: 'none',
			outline: 0,
			zIndex: dialog.zIndex
		})
		.attr('tabindex', '-1')
		.html(options.innerHTML)
		.appendTo('body');



		// 遮罩层
		this.__backdrop = $('<div />')
				.css({
					opacity: options.backdropOpacity,
					background: options.backdropBackground
				});
		
		if (options.quickClose) {
			this.modal = true;
			this.__backdrop.css('opacity', 0);
		}

		this.options = options;

		$.each(options, function (name, value) {
			if (typeof me[name] === 'function') {
				me[name](value);
			} else {
				me[name] = value;
			}
		});
		// 点击任意空白处关闭对话框
	    if (options.quickClose) {
	        this.__backdrop
	        .on(
	            'onmousedown' in document ? 'mousedown' : 'click',
	            function () {
	            me._trigger('cancel');
	            return false;// 阻止抢夺焦点
	        });
	    }

	    // ESC 快捷键关闭对话框
	    this._esc = function (event) {
	        var target = event.target;
	        var nodeName = target.nodeName;
	        var rinput = /^input|textarea$/i;
	        var isTop = dialog.current === me;
	        var keyCode = event.keyCode;

	        // 避免输入状态中 ESC 误操作关闭
	        if (!isTop || rinput.test(nodeName) && target.type !== 'button') {
	            return;
	        }
	        
	        if (keyCode === 27) {
	            me._trigger('cancel');
	        }
	    };
	    $(document).on('keydown', this._esc);


		// 关闭按钮
		this._$('close')
			.css('display', this.cancel === false ? 'none' : '')
			.attr('title', this.cancelValue)
			.on('click', function(event){
				me._trigger('cancel');
				event.preventDefault();
			});

		// 添加视觉参数
	    options.skin && this._$('dialog').addClass(options.skin);
	    options.padding && this._$('body').css('padding', options.padding);

		_count++;

		return this;
	};
	dialog.create.prototype = dialog.prototype;

	$.extend(dialog.prototype,{
		destroyed: false,
		_$: function(i){
			return this._node.find('[i=' + i + ']');
		},
		show: function(anchor){
			if(this.destoryed){
				return this;
			}

			var me = this,
				_node = this._node,
				options = this.options;

			this.__activeElement = this.__getActive();

			this.open = true;
			this.follow = anchor || this.follow;

			// 初始化 show 方法
			if (!this.__ready){
				if(this.modal){
					var backdropCss = {
							position: 'fixed',
						    left: 0,
						    top: 0,
						    width: '100%',
						    height: '100%',
						    overflow: 'hidden',
						    userSelect: 'none',
					    	zIndex: this.zIndex || dialog.zIndex
						};
					this.node.addClass(this.className + '-modal');

					if(!_isFixed){
						$.extend(backdropCss, {
							position: 'absolute',
							width:$(window).width(),
							height:$(document).height()
						});
					}

					this.__backdrop
						.css(backdropCss)
						.addClass(this.className + '-backdrop')
						.insertBefore(this.node);

				}
				if (!_isIE6){
					$(window).on('resize', $.proxy(this.reset, this));
				}
				this._node
					.addClass(this.className)
					.css('position', this.fixed ? 'fixed' : 'absolute');
				this.__ready = true;
			}
			
			this._node
				
				.show()
				.addClass(this.className + '-show')
				;

			this.__backdrop.show();

			this.__dispatchEvent('show');

			this.reset().focus();
			return this;
		},
		showModal: function(anchor){
			this.modal = true;
			return this.show.apply(this, arguments);
		},
		close: function(){
			if(!this.destoryed && this.open){
				this._node.hide()
					.removeClass(this.className + '-show');
				this.__backdrop.hide();
				this.open = false;		
				this.__dispatchEvent('close');
			}

			return this;
			
		},
		remove: function(){
			if (this.destoryed) {
				return this;
			}

			this._node.remove();
			this.__backdrop.remove();
			this.destroyed = true;

			delete dialog.list[this.id];
			
			if (dialog.current === this){
				dialog.current = null;
			}

			if(!_isIE6){
				$(window).off('resize', this.reset);
			}

			this.__dispatchEvent('remove');

			for(var i in this){
				delete this[i];
			}

			return this;
		},
		reset: function(){
			var elm = this.follow;
			if (elm) {
				this.__follow(elm);
			} else {
				this.__center();
			}		
			this.__dispatchEvent('reset');
			return this;
		},

		// 赋值
		// 标题
		title: function(text){
			this._$('title').text(text);
			this._$('header')[text ? 'show' : 'hide']();
			return this;
		},

		// 内容
		content: function(html){
			this._$('content').html(html);
			return this;
		},

		// 宽度
		width: function(value){
			this._$('content').width(value);
			return this.reset();
		},

		// 高度
		height: function(value){
			this._$('content').height(value);
			return this.reset();
		},

		// 按钮
		/**
	     * 设置按钮组
	     * @param   {Array, String}
	     * Options: value, callback, autofocus, disabled 
	     */
		button: function(args){
			args = args || [];
			var me = this,
				html = '',
				number = 0;
			this.callbacks = {};
			if (typeof args === 'string') {
				html = args;
				number++;
			} else {
				$.each(args, function(i, val){
					var id = val.id = val.id || val.value,
						style = '';
					me.callbacks[id] = val.callback;

					if(val.display === false){
						style = ' style="display:none"';
					}else{
						number++;
					}
					html += 
						'<button type="button" ' + 
						'	i-id="' + id + '"' + 
							style + 
							(val.disabled ? ' disabled' : '') + 
							(val.autofocus ? ' autofocus class="zs-dialog-autofocus"' : '') + 
						'>' + 
						val.value +
						'</button>';
					me._$('button')
					  	.on('click', '[i-id=' + id + ']', function(event){
					  		var $this = $(this);
					  		if (!$this.attr('disabled')) {
					  			me._trigger(id);
					  		}
					  		event.preventDefault();
					  	});
				});
			}

			this._$('button').html(html);
			this._$('footer')[number ? 'show' : 'hide']();
			return this;
		},

		// 让浮层获得焦点
		focus: function(){
			var node = this.node,
				current = dialog.current,
				index = this.zIndex = dialog.zIndex++;
			
			if (current && current !== this) {
	            current.blur(false);
	        }

	        // 检查焦点是否在浮层里面
	        if (!$.contains(node, this.__getActive())) {
	            var autofocus = node.find('[autofocus]')[0];

	            if (!this._autofocus && autofocus) {
	                this._autofocus = true;
	            } else {
	                autofocus = node;
	            }

	            this.__focus(autofocus);
	        }

	        // 设置叠加高度
	        node.css('zIndex', index)
	        	.addClass(this.className + '-focus');

			dialog.current = this;
	        this.__dispatchEvent('focus');

	        return this;

		},

		/** 让浮层失去焦点。将焦点退还给之前的元素，照顾视力障碍用户 */
		blur: function () {

		    var activeElement = this.__activeElement,
		    	isBlur = arguments[0];


		    if (isBlur !== false) {
		        this.__focus(activeElement);
		    }

		    this._autofocus = false;
		    this._node.removeClass(this.className + '-focus');
		    this.__dispatchEvent('blur');

		    return this;
		},

		// 派发事件
		__dispatchEvent:function(type){
			if(this['on' + type]){
				this['on' + type]();
			}
		},

		// 触发按钮回调事件
		_trigger: function(id){
			var fn = this.callbacks[id];

			return typeof fn !== 'function'  || fn.call(this) !== false ? this.close().remove() : this;
		},

		// 指定位置
		__follow: function(anchor){
			var $elm = anchor.parentNode && $(anchor),
				node = this._node;
			if (this.__followSkin){
				node.removeClass(this.__followSkin);
			}

			// 隐藏元素不可用
			if ($elm) {
				var o = $elm.offset();
				if (o.left * o.top < 0) {
					return this.__center();
				}
			}

			var me = this,
				fixed = this.fixed,

				$win = $(window),
				$doc = $(document),
				winWidth = $win.width(),
				winHeight = $win.height(),
				docLeft = $doc.scrollLeft(),
				docTop = $doc.scrollTop(),

				nodeWidth = node.width(),
				nodeHeight = node.height(),
				width = $elm ? $elm.outerWidth() : 0,
				height = $elm ? $elm.outerHeight() : 0,
				offset = this.__offset(anchor),
				x = offset.left,
				y = offset.top,
				left = fixed ? x - docLeft : x,
				top = fixed ? y - docTop : y,

				minLeft = fixed ? 0 : docLeft,
				minTop = fixed ? 0 : docTop,
				maxLeft = minLeft + winWidth - nodeWidth,
				maxTop = minTop + winHeight - nodeHeight,

				css = {},
				align = this.align.split(' '),
				className = this.className + '-',
				reverse = {top: 'bottom', bottom: 'top', left: 'right', right: 'left'},
				name = {top: 'top', bottom: 'top', left: 'left', right: 'left'},

				temp = [{
		            top: top - nodeHeight,
		            bottom: top + height,
		            left: left - nodeWidth,
		            right: left + width
		        }, {
		            top: top,
		            bottom: top - nodeHeight + height,
		            left: left,
		            right: left - nodeWidth + width
		        }],

		        center = {
		            left: left + width / 2 - nodeWidth / 2,
		            top: top + height / 2 - nodeHeight / 2
		        },

		        range = {
		            left: [minLeft, maxLeft],
		            top: [minTop, maxTop]
		        };

	        // 超出可视区域重新适应位置
	        $.each(align, function (i, val) {

	            // 超出右或下边界：使用左或者上边对齐
	            if (temp[i][val] > range[name[val]][1]) {
	                val = align[i] = reverse[val];
	            }

	            // 超出左或右边界：使用右或者下边对齐
	            if (temp[i][val] < range[name[val]][0]) {
	                align[i] = reverse[val];
	            }

	        });


	        // 一个参数的情况
	        if (!align[1]) {
	            name[align[1]] = name[align[0]] === 'left' ? 'top' : 'left';
	            temp[1][align[1]] = center[name[align[1]]];
	        }


	        //添加follow的css, 为了给css使用
	        className += align.join('-') + ' '+ this.className+ '-follow';
	        
	        me.__followSkin = className;


	        if ($elm) {
	            node.addClass(className);
	        }

	        
	        css[name[align[0]]] = parseInt(temp[0][align[0]]);
	        css[name[align[1]]] = parseInt(temp[1][align[1]]);
	        node.css(css);
		},

		// 居中
		__center: function(){
			var _node = this._node,
				$win = $(window),
				$doc = $(document),
				fixed = this.fixed,
				width = _node.width(),
				height = _node.height(),
				winWidth = $win.width(),
				winHeight = $win.height(),
				docLeft = fixed ? 0 : $doc.scrollLeft(),
				docTop = fixed ? 0 : $doc.scrollTop(),
				cssObj = {
					left: (winWidth - width) / 2 + docLeft,
					top: (winHeight - height) * 382 / 1000 + docTop // 黄金比例
				};
			_node.css(cssObj);

		},

		// 获取元素相当于页面上的位置
		__offset: function(anchor){
			var isNode = anchor.parentNode,
				offset = isNode ? $(anchor).offset() : {
					left: anchor.pageX,
					top: anchor.pageY
				};
			return offset;
		},

		// 对元素安全聚焦
	    __focus: function (elem) {
	        // 防止 iframe 跨域无权限报错
	        // 防止 IE 不可见元素报错
	        try {
	            // ie11 bug: iframe 页面点击会跳到顶部
	            if (this.options.autofocus && !/^iframe$/i.test(elem.nodeName)) {
	                elem.focus();
	            }
	        } catch (e) {}
	    },


	    // 获取当前焦点的元素
	    __getActive: function () {
	        try {// try: ie8~9, iframe #26
	            var activeElement = document.activeElement;
	            var contentDocument = activeElement.contentDocument;
	            var elem = contentDocument && contentDocument.activeElement || activeElement;
	            return elem;
	        } catch (e) {}
	    }
	});
	dialog.get = function(id){
		return dialog.list[id];
	};
	dialog.getCurrent = function(id){
		return dialog.current;
	};
	dialog.defaults = $.extend({}, dialog.config || {}, dialog_config);
	dialog.list = {};
	dialog.current = null;
	dialog.zIndex = 1024;

	window.ZSdialog = dialog;

})();