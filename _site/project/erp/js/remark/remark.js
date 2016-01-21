seajs.use(['jquery','artDialog','bootstrap','jsviews','toastr','toastrCss','themeCss','layout','utils','scroll'],function(){
	var hash = $.queryToObject($.hash()),
		id = hash.id,
		container = hash.container,
		tmpl = hash.tmpl;
	$.ajax({
		url:'/hardcode/remarkList.json',
		data:{
			id:id
		},
		success:function(result){
			result = window.ajaxResult;
			delete window.ajaxResult;
			if(result.status === 'success'){
				var html = $.templates('#list-tmpl').render(result.data);
				$('.scroller').html(html);
			}else{
				$.publish('throwAjaxError',result.msg);
			}
		}
	});

	$('.slimScrollDiv').slimScroll({
		height:$(window).height() - 80
	});

	$doc.on('click','.remove-mark',function(){
		var me = this,
			itemData = JSON.parse(unescape($(this).data('all')));
		$.confirm({
			content:'确定要删除此备注吗？',
			elm:me,
			callback:function(){
				console.log('remove this remark');
				$(me).closest('.list').remove();
			}
		});
	});

	$('#btn-save').click(function(){
		var $content = $('input[name="mark-content"]'),
			value = $.trim($content.val()),
			d = window.parent.dialog.get('item-remark-dialog'),
			dialogData = dialog.data || {},
			getRemarkCallback = window.parent.$.getRemarkCallback;
			if(!value){
				window.top.toastr.error('请输入备注的内容','错误');
				return ;
			}
			$.addRemark($.extend(dialogData,{
				content:value,
				id:id,
				callback:function(){
					window.parent.$.getRemark({
						id:id,
						field:dialogData.field,
						container:container,
						tmpl:tmpl,
						selectorTag:dialogData.selectorTag || 'checkbox',
						callback:function(){
							getRemarkCallback && getRemarkCallback(id);
						}
					});
					d.close().remove();
				}
			}))
	});
});