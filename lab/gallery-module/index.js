$(function(){
	function GridPic(opts){
		this.opts = $.extend({
			autoPlay:false, //自动播放
			delay:5 //延迟时间
		},opts);
		this.main();
	};
	$.extend(GridPic.prototype,{
		main:function(){
			$.views.tags({
				showTypeClass:function(showType){
					return ['prev-next','image','button'][showType];
				}
			});	
			$.views.helpers({
				showTag:function(tag,tagUrl,tagColor){
					var html = '';
					tag = $.trim(tag);
					tagUrl = $.trim(tagUrl);
					if(tag === ''){
					}else{
						html = '<span class="tag ' + tagColor + '">' + tag + '</span>';
						if(tagUrl !== ''){
							html = '<a href="' + tagUrl + '" target="_blank">' + html + '</a>';
						}
					}
					return html;
				}
			});
			this.currentImgPlace = null;
			this.domAndEvent();
		},
		chooseTile:function(){
			var me = this;
			dialog({
				title:'选择图集类型',
				content:$.templates('#tiles-tmpl').render(),
				skin:'scroll dialog-tiles',
				width:650,
				height:400,
				onshow:function(){
					var d = this;
					$(this.node).on('click','.container',function(){
						$('.container-box').html($(this).html()).show();
						$('.container-box .tile').each(function(){
							$(this).append('<div class="choose-img">选择图片</div>');
						});						
						d.close();
					});
				}
			}).showModal();
		},
		chooseImg:function(elm){
			var me = this;
			var data = $.extend({
				count:1,
				showType:0,
				tag:'',
				tagClass:'red',
				tagUrl:'',
				dataList:[{
					img:'http://js.touzibaomu.com/images/soft/v20150909/no-pic.gif',
					title:'这个是标题，哈哈哈',
					url:'javascript:;',
					intro:'简洁，简介，谢谢'					
				}]
			},$(me.currentImgPlace).closest('.tile').data() || {});
			var bindImgEvent = function(container){
				$(container).on('change','input[name="img-count"]',function(){
					var value = Number(this.value),
						i,j;
					if(value > this.max || value < this.min){
						value = this.value = Number(this.min);
					}
					if( data.dataList.length > value){
						for(i = value,j=data.dataList.length;i<j;i++){
							$.observable(data.dataList).remove();
						}
					}
					if(data.dataList.length < value){
						for(i = data.dataList.length,j=value;i<j;i++){
							$.observable(data.dataList).insert({
								img:'http://js.touzibaomu.com/images/soft/v20150909/no-pic.gif',
								title:'',
								url:'javascript:;',
								intro:''
							});
						}
					}
					
				}).on('change','.file-input',function(){
					var objUrl = $.getObjectURL(this.files[0]);
					if(objUrl === null){
						objUrl = 'http://js.touzibaomu.com/images/soft/v20150909/no-pic.gif';
					}
					if(objUrl){
						$('.thumb-preview',$(this).closest('.item')).attr('src',objUrl);
					}
				}).on('click','.remove-item',function(){
					var index = $.view(this).index;
					if(data.dataList.length === 1){return ;} //剩下一条不能删除
					$.confirm({
						title:'要删除此图片吗？',
						elm:this,
						callback:function(){
							$.observable(data.dataList).remove(index);
							$.observable(data).setProperty({
								count:data.dataList.length
							});
						}
					})
					
				});
				
			};
			dialog({
				title:'添加图片',
				content:'<div id="img-container"></div>',
				skin:'scroll dialog-img',
				width:650,
				height:$(window).height() * 0.8,
				onshow:function(){
					$.templates('#img-tmpl').link('#img-container',data);
					bindImgEvent(this.node);
				},
				okValue:'保存',
				ok:function(){
					data.dataList.forEach(function(item,i){
						item.img = 'img/' + (i+1) + '.jpg';
					});
					$(me.currentImgPlace).data(data);
					me.renderImgPlace(data);
					
				},
				cancelValue:'取消',
				cancel:true
			}).showModal();
		},
		renderImgPlace :function(data){
			var me = this,
				$imgPlace,
				effect = me.effect();
			$('.img-wrapper',me.currentImgPlace).html($.templates('#img-place-tmpl').render(data));
			$imgPlace = $('.img-place',me.currentImgPlace);
			switch(true){
				case $imgPlace.hasClass('prev-next'):
					effect.prevNext($imgPlace);
					break;
				case $imgPlace.hasClass('image') || $imgPlace.hasClass('button'):
					effect.imageAndButton($imgPlace);
					break;				
			}
		},
		effect:function(){
			var me = this;
			return {
				prevNext:function($elm){
					return $elm.each(function(i,elm){
						var $list = $('.list',this),
							$lis = $list.children(),
							imgLen = $lis.length, //首尾添加两张clone图
							width = $list.parent().width();
						$lis.first().clone(true).addClass('clone').appendTo($list);
						$lis.last().clone(true).addClass('clone').prependTo($list);
						$list.css('marginLeft','-' + width + 'px');
						$(this).on('click','.prev,.next',function(){
							var index = isNaN(Number(elm.index)) ? 1 : elm.index;
							if($list.is(':animated')){return;}
							if($(this).hasClass('next')){
								index += 1;
							}else{
								index -= 1;
							}
							$list.animate({marginLeft:width * index * -1 + 'px'},200,function(){
								if(index === 0){
									index += imgLen;
								}
								if(index === imgLen + 1){
									index -= imgLen;
								}
								$list.css('marginLeft',width * index * -1 + 'px');
								elm.index = index;
							});
						});
						if(me.opts.autoPlay){
							$(this).hover(function(){
								this.timer && clearInterval(this.timer);
							},function(){
								this.timer = setInterval(function(){
									$('.next',elm).trigger('click');
								},me.opts.delay * 1000);
							}).trigger('mouseleave');
						}
					});
				},
				imageAndButton:function($elm){
					return $elm.each(function(i,elm){
						$(this).on('click','.button-list .button',function(){
							var index = $(this).index(),
								$li = $('.list>li',elm).eq(index);
							$(this).addClass('active')
								   .siblings().removeClass('active');
							$li.fadeIn(200)
							   .siblings(':visible').fadeOut(500);							
							
						});
						$('.list>li:gt(0)',elm).hide();
						$('.button-list .button',elm).eq(0).addClass('active');
						if(me.opts.autoPlay){
							$(this).hover(function(){
								this.timer && clearInterval(this.timer);
							},function(){
								this.timer = setInterval(function(){
									var $btn = $('.button-list .button.active',elm).next();
									if(!$btn.length){
										$btn = $('.button-list .button:first',elm);
									}
									$btn.trigger('click');
								},me.opts.delay * 1000);
							}).trigger('mouseleave');
						}
					});
				}
			}
		},
		domAndEvent:function(){
			var me = this;
			$('.choose-tile').click(function(){
				me.chooseTile();
			});
			$doc.on('click','.choose-img',function(){
				me.currentImgPlace = $(this).parent();
				me.chooseImg(this);
			});

		}
	});

	
	
	new GridPic();

});