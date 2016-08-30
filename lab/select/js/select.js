// $.fn.select

(function () {
	function Select(options){
		this.options = options;
		this.$select = $(this.options.elm);
		this.main();
	}

	$.extend(Select.prototype, {
		main: function () {
			var $select = this.$select;
			this.id = new Date() * 1 + '' + Math.ceil(Math.random()*100000);			
			this.renderNode();

			$select.after(this.node)
				   .hide();

			this.setValue();

			this.bindEvent();

			this.dispatchEvent('rendered');

			this.autoPosition();
		},
		dispatchEvent:function(type){
			if(this.options['on' + type]){
				this.options['on' + type].call(this);
			}
		},
		bindEvent: function () {
			var me = this;
			this.node.on('click', function (event) {
				var $container = $('#select-container-' + me.id);
				if (me.open) {
					me.close();					
				} else {
					me.open = true;
					me.showOptions().reset();
					me.optsNode.find('.select-search-field').focus();
				}
				me.node[me.open ? 'addClass' : 'removeClass']('select-container-open');
				event.stopPropagation();
			}).on('click', '.select-selection-clear', function () {
				me.$select.val('');
				me.setValue();
				me.dispatchEvent('clear');
			});

			$(document).on('click', function () {
				me.close();
			});	
		},
		bindOptsEvent: function () {
			var me = this;
			this.optsNode.on('click', function (event) {
				event.stopPropagation();
			}).on('keyup', '.select-search-field', function () {
				var value = $.trim(this.value);
				$('.select-results .select-results-option[role="treeitem"]', me.optsNode).each(function () {
					var val = $(this).data('value') || '',
						text = $(this).text(),
						$ul = $(this).parent();
					if (val.indexOf(value) === -1 && text.indexOf(value) === -1) {
						$(this).hide();
						if ($ul.children(':visible').length === 0 && $ul.hasClass('select-results-options-nested')) {
							
								$ul.parent().hide();
						}
					} else {
						$(this).show();
						$ul.show();
						if ($ul.hasClass('select-results-options-nested')) {
								$ul.parent().show();
							}
					}
				});
				me.showMsg();
				me.reset();
			}).on('click', '.select-results-option[role="treeitem"]', function () {
				var value = $(this).data('value');					
				me.$select.val(value);
				me.setValue();
				me.dispatchEvent('change');
				me.close();
			});
		},
		placeholder: function () {
			if (this.options.placeholder) {
				$('.select-selection-rendered', this.node).html('<span class="select-selection-placeholder">' + this.options.placeholder + '</span>');				
			}
		},
		setValue: function () {
			var me = this,
				value = this.$select.val(),
				text = this.$select.find('option:selected').text();
			this.data = {
				text: text,
				value: value
			};
			if (value) {
				$('#select-' + me.id + '-container').html(text);
				this.allowClear();
				if (this.options.callback) {
					this.options.callback.call(this);
				}
			} else {
				this.placeholder();
			}
			return me;
		},
		allowClear: function () {
			if (this.options.allowClear) {
				$('.select-selection-rendered', this.node).append('<span class="select-selection-clear">×</span>');
			}
		},
		autoPosition: function () {
			var me = this;
			$(window).scroll(function () {
				me.reset();
			}).resize(function () {
				me.reset();
			});
		},
		showMsg: function () {
			var $ul = $('#select-' + this.id + '-results');
			$ul.children('.select-results-message').remove();

			if (!$('[role="treeitem"]:visible', $ul).length){
				$('<li role="treeitem"class="select-results-option select-results-message">' + this.options.notFound + '</li>').appendTo($ul);
			}
		},
		getIconClass: function () {
			var iconObj = {
				0: 'select-selection-arrow-triangle',
				1: 'select-selection-arrow-line'
			};
			return iconObj[this.options.icon] || iconObj[0];
		},
		renderOptions: function (){
			var optsHtml = '';
			$.each(this.options.data, function () {
				var optHtml = '',
					getOptHtml = function () {
						return '<li class="select-results-option" role="treeitem" data-value="' + this.value + '">' + this.text + '</li>';
					};
				if (this.type === 'optgroup') {
					optHtml += '<li class="select-results-option" role="group">';
					optHtml += '	<strong class="select-results-group">' + this.text + '</strong>';
					optHtml += '	<ul class="select-results-options select-results-options-nested">';
					$.each(this.children, function () {
						optHtml += getOptHtml.call(this);
					});
					optHtml += '	</ul>';
					optHtml += '</li>';
				} else {
					optHtml = getOptHtml.call(this);
				}
				optsHtml += optHtml;
			});
			this.optsNode = $(this.tmpl);
			this.optsNode.find('.select-results-options').attr('id', 'select-' + this.id + '-results').append(optsHtml);
			if (this.options.allowSearch) {
				this.optsNode.find('.select-dropdown').prepend('<div class="select-search">' +
					'			<input type="text" class="select-search-field" autocomplete="off">' +
					'		</div>');
			}

			this.bindOptsEvent();
		},

		renderNode: function () {
			var nodeHtml = 
					'<div class="select-container select-container-default">' +
					'	<div class="selection">' +
					'		<div class="select-selection select-selection-single">' +
					'			<span class="select-selection-rendered" id="select-' + this.id + '-container" title=""></span>' +
					'			<span class="select-selection-arrow">' +
					'				<b></b>' +
					'			</span>' +
					'		</div>' +
					'	</div>' +
					'</div>';
			this.node = $(nodeHtml).attr('id', 'select-container-' + this.id)
			this.node.find('.select-selection-arrow').addClass(this.getIconClass());			
			return this;
		},

		showOptions: function () {
			var me = this,
				value = this.$select.val();
			!this.optsNode && this.renderOptions();
			$('[data-value="' + value + '"]', this.optsNode).addClass('active');
			this.optsNode.appendTo('body');
			return me;
		},
		reset: function () {
			if (!this.optsNode) {
				return;
			}
			var width = this.node.outerWidth(),
				height = this.node.outerHeight(),
				offset = this.node.offset(),
				winHeight = $(window).height(),
				scrollTop = $('body').scrollTop(),
				optsHeight = this.optsNode.children().outerHeight(),
				left = offset.left,
				top = offset.top + height,
				className = 'below';
			if (winHeight + scrollTop - height - offset.top < optsHeight && offset.top - scrollTop > optsHeight) {
				top = offset.top - optsHeight;
				className = 'above';
			}
			this.optsNode.css({
				left: left,
				top: top,
				position: 'absolute',
				width: width
			}).find('.select-dropdown')
					.removeClass('select-dropdown-above select-dropdown-below')
			  		.addClass('select-dropdown-' + className);
			this.node
				.removeClass('select-container-above select-container-below')
			  	.addClass('select-container-' + className);
			return this;
		},
		close: function () {
			if (this.optsNode) {
				this.optsNode.hide().remove();
				this.optsNode = null;
				this.open = false;
				this.node.removeClass('select-container-open');
			}
		},
		tmpl: 
			'<div class="select-container select-container-open">' +
			'	<div class="select-dropdown">' +

			'		<div class="select-results">' +
			'			<ul class="select-results-options" role="tree" id="">' +
			
			'			</ul>' +
			'		</div>' +
			'	</div>' +
			'</div>'
	});

	$.fn.select = function (options) {
		options = $.extend({
			placeholder: '', 	// 为空时显示默认值
			allowSearch: true, 	// 显示搜索文本框
			allowClear: false, 	// 显示删除按钮
			icon: 0,  			// 右侧小图标按钮 0:▲,1:∧
			notFound: 'No results found', // 搜索无果时显示

			onrendered: $.noop, // 渲染后事件
			onchange: $.noop,	// 值发生改变后事件，当值为空时，触发onclear事件，不会触发此事件
			onclear: $.noop	// 清空值后事件
		}, options);
		return this.each(function () {
			var data = [];

			$(this).children().each(function () {

				var item = {},
					getOptData = function () {
						var data = {
							type: 'option',
							text: this.text,
							value: this.value === undefined ? this.text : this.value,
							isSelected: this.selected
						};
						return data.value ? data : {};
					};
				if (this.tagName === 'OPTGROUP') {
					item.type = 'optgroup';
					item.text = this.label;
					item.children = [];
					$(this).children().each(function () {
						!$.isEmptyObject(item) && item.children.push(getOptData.call(this));
					});
				} else {
					item = getOptData.call(this);
				}
				!$.isEmptyObject(item) && data.push(item);
			});
			new Select($.extend({}, options, {
				data: data,
				elm: this
			}));
		});
	};
})();
