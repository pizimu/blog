define(['jquery'],function(require,exports,module){
	$(function(){
		$('.sidebar-toggler').click(function(){
			//$(this).closest('.page-sidebar').toggleClass('page-sidebar-menu-closed');
			$('body').toggleClass('page-sidebar-closed');
		});
		$(document).on('click','.filter-value',function(){
			$(this).addClass('selected')
				   .siblings().removeClass('selected');
		}).on('click','label.checker>input[type="checkbox"],label.radio>input[type="radio"]',function(){
			if(this.disabled){return;}			
			$(this).parent()[this.checked ? 'addClass' : 'removeClass']('checked');
			if(this.type==='radio'){
				$('label.radio>input[type="radio"][name="' + this.name + '"]:not(:disabled)').not(this).parent().removeClass('checked');
			}
		}).on('click','.panel .panel-heading .tools .collapse',function(){
			$(this)
				.find('i').toggleClass('glyphicon-chevron-up glyphicon-chevron-down').end()
				.closest('.panel').find('.panel-body').slideToggle();

		});

		$('.check-all').checkAllTableList();
	});
});