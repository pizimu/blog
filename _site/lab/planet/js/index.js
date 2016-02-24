var data = {
	stockList:[[{
		name:'平安银行',
		stockCode:'000001',
		linkTo:['运输','哈哈哈','看，灰机','我不想说','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'中国银行',
		stockCode:'000002',
		linkTo:['运输','哈哈哈'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'深圳银行',
		stockCode:'000003',
		linkTo:['哈哈哈','看，灰机','我不想说','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'发展银行',
		stockCode:'000004',
		linkTo:['运输','哈哈哈','我不想说','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'苏格拉底银行',
		stockCode:'000005',
		linkTo:['运输','哈哈哈','我不想说','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'不知道银行',
		stockCode:'000006',
		linkTo:['运输','看，灰机','我不想说','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'浦发银行',
		stockCode:'000007',
		linkTo:['运输','哈哈哈','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'不是银行',
		stockCode:'000008',
		linkTo:['运输','我不想说','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	}],[{
		name:'大银行',
		stockCode:'000009',
		linkTo:['运输','哈哈哈','看，灰机','我不想说'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'小银行',
		stockCode:'0000010',
		linkTo:['运输','哈哈哈','看，灰机','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'招商银行',
		stockCode:'0000011',
		linkTo:['运输','哈哈哈','看，灰机a','我不想说','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'建设银行',
		stockCode:'0000012',
		linkTo:['运输','哈哈哈','看，灰机','我不想说','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'招商建设银行',
		stockCode:'0000013',
		linkTo:['运输','哈哈哈','看，灰机','我不想说','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'不想打字银行',
		stockCode:'0000014',
		linkTo:['运输','哈哈哈','看，灰机','我不想说','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'累了银行',
		stockCode:'0000015',
		linkTo:['运输','哈哈哈','看，灰机','我不想说','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	},
	{
		name:'完了银行',
		stockCode:'0000016',
		linkTo:['运输','哈哈哈','看，灰机','我不想说','这个代码屌'],
		describe:'我的代码是000001，目前排在第一位'
	}]],
	conceptList:[[{
		code:'运输1',
		name:'运输1',
		linkTo:['000001','000003','000010','000015'],
		describe:'我也不知道我放什么内容，晚点再告诉你们'
	},
	{
		code:'哈哈哈1',
		name:'哈哈哈1',
		linkTo:['000002','000004','00009','000010'],
		describe:'我也不知道我放什么内容，晚点再告诉你们'
	},
	{
		code:'看，灰机1',
		name:'看，灰机1',
		linkTo:['000003','000006','00008','00009'],
		describe:'我也不知道我放什么内容，晚点再告诉你们'
	},
	{
		code:'我不想说1',
		name:'我不想说1',
		linkTo:['000004','000005','000010','000011'],
		describe:'我也不知道我放什么内容，晚点再告诉你们'
	},
	{
		code:'这个代码屌1',
		name:'这个代码屌1',
		linkTo:['000001','000003','000010','000015'],
		describe:'我也不知道我放什么内容，晚点再告诉你们'
	}],
	[{
		code:'运输',
		name:'运输',
		linkTo:['000001','000003','000010','000015'],
		describe:'我也不知道我放什么内容，晚点再告诉你们'
	},
	{
		code:'哈哈哈',
		name:'哈哈哈',
		linkTo:['000002','000004','00009','000010'],
		describe:'我也不知道我放什么内容，晚点再告诉你们'
	},
	{
		code:'看，灰机',
		name:'看，灰机',
		linkTo:['000003','000006','00008','00009'],
		describe:'我也不知道我放什么内容，晚点再告诉你们'
	},
	{
		code:'我不想说',
		name:'我不想说',
		linkTo:['000004','000005','000010','000011'],
		describe:'我也不知道我放什么内容，晚点再告诉你们'
	},
	{
		code:'这个代码屌',
		name:'这个代码屌',
		linkTo:['000001','000003','000010','000015'],
		describe:'我也不知道我放什么内容，晚点再告诉你们'
	}]]
};
(function($){
	function stopPropagation(e){
		if(e.stopPropagation){
			e.stopPropagation();
		}else if(e.cancelBubble){
			e.cancelBubble = true;
		}
	}	
	function Planet(){
		this.init();
	};
	$.extend(Planet.prototype,{
		init:function(){
			var me = this;
			
			//setTimeout(function(){
				me.bindEvent();
			//},100);
		},
		getDimension:function(){
			var winWidth = $(window).width(),
				winHeight = $(window).height(),
				mSize = Math.min(winWidth,winHeight), 
				planetSize = mSize * 0.85;
			$('#dimensions').css({
				width:planetSize,
				height:planetSize,
				marginLeft:planetSize / -2,
				marginTop:planetSize / -2
			});

			return {
				planet:{
					size:planetSize
				},
				star:{
					size:mSize * 0.1
				},
				starList:{
					size:mSize * 0.1
				},
				aclock:{
					size:mSize * 0.025,
					length:mSize * 0.20, //Galaxy length
					radius:mSize * 0.12
				},
				clock:{
					size:mSize * 0.03,
					length:mSize * 0.35, //Galaxy length
					radius:mSize * 0.25
				}
			};
		},		
		starPos:function(){// positioning for star
			var me = this,
				dimension = me.dimension,
				starSize = dimension.star.size;
			$('#star').css({
				width:starSize,
				height:starSize,
				marginLeft:starSize / -2,
				marginTop:starSize / -2
			});
		},
		aclockPos:function(){ //positioning for planet inside	
			var me = this,
				opts = me.dimension.aclock,
				radius = opts.radius;
				duration = 60,
				$rotation = $('#dimensions>.aclockRotation'),
				rotationLen = $rotation.length;
				radiusSetup = (opts.length - rotationLen * opts.size) / (rotationLen + 1),
				planetSize = this.dimension.planet.size;
			$rotation.each(function(){	
				radius += radiusSetup;
				me.round({
					radius:radius,
					elm:this,
					rotationSize:opts.size
				});
				duration += 20;
				$(this).css({
					'-webkit-animation-duration': duration + 's',
				    '-moz-animation-duration': duration + 's',
				    '-o-animation-duration': duration + 's',
				    '-ms-animation-duration': duration + 's',
					'animation-duration':duration + 's'
				});
				$('.orbit',this).css({
					width:radius * 2 / planetSize * 100 + '%',
					height:radius * 2 / planetSize * 100 + '%',
					marginLeft:radius * -1 / planetSize * 100 + '%',
					marginTop:radius * -1 / planetSize * 100 + '%'
				});
			});
		},
		clockPos:function(){ //positioning for planet outside	
			var me = this,
				opts = me.dimension.clock,
				radius = opts.radius;
				duration = 70,
				$rotation = $('#dimensions>.clockRotation'),
				rotationLen = $rotation.length;
				radiusSetup = (opts.length - rotationLen * opts.size) / (rotationLen + 1),
				planetSize = this.dimension.planet.size;
			$rotation.each(function(){	
				radius += radiusSetup;
				me.round({
					radius:radius,
					elm:this,
					rotationSize:opts.size
				});
				duration += 20;
				$(this).css({
					'-webkit-animation-duration': duration + 's',
				    '-moz-animation-duration': duration + 's',
				    '-o-animation-duration': duration + 's',
				    '-ms-animation-duration': duration + 's',
					'animation-duration':duration + 's'
				});
				$('.orbit',this).css({
					width:radius * 2 / planetSize * 100 + '%',
					height:radius * 2 / planetSize * 100 + '%',
					marginLeft:radius * -1 / planetSize * 100 + '%',
					marginTop:radius * -1 / planetSize * 100 + '%'
				});
			});
		},
		starListPos:function(){
			$('#star-list>.star').each(function(){
				var size = $(this).width();
				$(this).css({
					height:size,
					marginLeft:size / -2,
					marginTop:size / -2
				});
			});

			//	因为恒星大小不一样，这段代码无法使用喽
			// var $stars = $('#star-list .star'),
			// 	height = $(window).height() / 2 - $stars.first().height(),
			// 	radius = $('#star-list').width(),//恒星圆半径
			// 	starRadian,
			// 	radian,
			// 	starLen = $stars.length,
			// 	size = this.dimension.starList.size,
			// 	starListHeight = $('#star-list').height();
			// height = radius > height ? height : radius;
			// starRadian = Math.asin(height / radius);//恒星所占的弧度 如果要转化为角度，再 / (Math.PI / 180)
			// radian = starRadian / (starLen - 1); //每个恒星的弧度
			// $stars.each(function(i){
			// 	var _radian = radian * (starLen - i - 1),
			// 		offset;//偏移

			// 	$(this).css({
			// 		left:(radius - radius * Math.cos(_radian).toFixed(6)) / radius * 100 + 4 * (starLen - i - 1) + '%',
			// 		top:(starListHeight - radius * Math.sin(_radian).toFixed(6)) / starListHeight * 100 + '%',
			// 		width:size,
			// 		height:size,
			// 		marginTop:size / -2,
			// 		marginLeft:size / -2
			// 	});
			// });
		},
		starListPlanetPos:function(){
			var me = this,
				$planetContainers = $('#star-list .planet-container');
			$planetContainers.each(function(){
				var $planet = $('.star-planet',this),
					planetLen = $planet.length,
					beginAngular = (8 - planetLen + 1) * 45 / 2, //第一个行星的角度，行星之间角度为45度

					radius = $(this).width() / 2,
					planetSize = $(this).closest('.planet-container').width() * 0.25;
				$planet.each(function(i){
					var _angular = beginAngular + 45 * i,
						cssObj,					
						radian = Math.PI / 180 * _angular,
						size = planetSize * (1 - i * 0.1);
					switch(true){				
						case _angular <= 90 || _angular >=270:
							cssObj = {
								left:(radius - radius * Math.cos(radian).toFixed(6)) / (radius * 2) * 100 + '%',
								top:(radius - radius * Math.sin(radian).toFixed(6)) / (radius * 2) * 100 + '%'
							};
							break;
						case _angular < 270:
							cssObj = {
								left:(radius - radius * Math.cos(radian).toFixed(6)) / (radius * 2) * 100 + '%',
								top:(radius - radius * Math.sin(radian).toFixed(6)) / (radius * 2) * 100 + '%'
							};
							break;
					} 
					$(this).css($.extend({
						width:size,
						height:size,
						marginLeft:size / -2 ,
						marginTop:size / -2 
					},cssObj)).data({
						angular:_angular,
						radius:radius
					});
				});

			});
		},
		round:function(opts){
			var $planet = $('>.planet',opts.elm),
				angular = 360 / $planet.length,
				radius = opts.radius,
				dimRds = $(opts.elm).width() / 2,
				planetSize = this.dimension.planet.size,
				beginAngular = 360 * Math.random();
			$planet.each(function(i){
				var _angular = beginAngular + angular * i + angular * Math.random() / 2,
					cssObj,					
					radian;
				_angular = _angular > 360 ? _angular - 360 : _angular;
				switch(true){				
					case _angular <= 90 || _angular >= 270:
						radian = Math.PI / 180 * _angular;
						cssObj = {
							left:(dimRds - radius * Math.cos(radian).toFixed(6)) / planetSize * 100 + '%',
							top:(dimRds - radius * Math.sin(radian).toFixed(6)) / planetSize * 100 + '%'
						};
						break;					
					case _angular < 270:
						radian = Math.PI / 180 * _angular;
						cssObj = {
							left:(dimRds - radius * Math.cos(radian).toFixed(6)) / planetSize * 100 + '%',
							top:(dimRds - radius * Math.sin(radian).toFixed(6)) / planetSize * 100 + '%'
						};
						break;					
				} 
				$(this).css($.extend({
					width:opts.rotationSize / planetSize * 100 + '%',
					height:opts.rotationSize / planetSize * 100 + '%',
					marginLeft:opts.rotationSize / -2 / planetSize * 100 + '%',
					marginTop:opts.rotationSize / -2 / planetSize * 100 + '%'
				},cssObj)).data({
					angular:_angular,
					raduisScale:radius / planetSize //半径相对于容器div宽度的百分比
				});			
			});
		},
		reRenderSize:function(){
			var me = this,
				oldSize = me.dimension.planet.size,
				planetSize,scale,
				starSize;

			me.dimension = me.getDimension();
			planetSize = me.dimension.planet.size;
			starSize = me.dimension.star.size;
			scale = me.dimension.planet.size / oldSize;
			starListSize = me.dimension.starList.size;
			$('#dimensions').css({ //修改行星图片大小
				width:planetSize,
				height:planetSize,
				marginLeft:planetSize / -2,
				marginTop:planetSize / -2
			});
			$('#star').css({ //修改中心恒星大小
				width:starSize,
				height:starSize,
				marginLeft:starSize / -2,
				marginTop:starSize / -2
			});
			$('#star-list>.star').each(function(){
				var size = $(this).width();
				$(this).css({
					height:size,
					marginLeft:size / -2,
					marginTop:size / -2
				});
			});
			// $('#star-list>.star').css({ //修改恒星列表中恒星大小
			// 	width:starListSize,
			// 	height:starListSize,
			// 	marginLeft:starListSize / -2,
			// 	marginTop:starListSize / -2
			// });
			$('#star-list .star-planet').each(function(i){ //修改恒星列表中的行星大小
				var size = $(this).closest('.planet-container').width() * 0.25 * (1 - i * 0.1);
				$(this).css({
					width:size,
					height:size,
					marginLeft:size / -2,
					marginTop:size / -2
				});
			});
			$('.ray').each(function(){ //修改行星射线大小
				$(this).css({
					width:$(this).width() * scale
				});
			});

			me.drawStarRay(); //重绘恒星射线
		},
		drawRay:function(){
			$('.dimension:has(.selected)').each(function(){
				var $div = $('<div />'),
					conWidth = $(this).width(),
					that = this;
				$('.planet.selected',this).each(function(){
					if($('.ray',that).length){return true;}
					var data = $(this).data(),
						$line = $('<div class="ray" />').css({
							transform:'rotate(' + (data.angular + 180) + 'deg)',
							width:conWidth * data.raduisScale
						});
					$div.append($line);
				});
				setTimeout(function(){
					$(that).append($div.html());
				},200);
			});
		},
		drawStarRay:function(){
			$('.star-ray').remove();
			var $from = $('#star-list .active:last');
			if(!$from.length){return;}
			if($from.find('.planet-container').length){return;}
			var	fromSize = $from.width(),
				from = $from.offset(),
				$to = $('#star'),
				toSize = $to.width(),
				to = $to.offset(),
				horizSize = (to.left + toSize / 2) - (from.left + fromSize / 2),
				verticalSize = (to.top + toSize / 2) - (from.top + fromSize / 2),
				rayWidth = Math.sqrt(Math.pow(horizSize,2) + Math.pow(verticalSize,2)),
				angular =  Math.asin(verticalSize / rayWidth) / (Math.PI / 180),
				rayCss = {
					left:from.left + fromSize / 2,
					top:from.top + fromSize / 2,
					width:rayWidth,
					transform:'rotate(' + angular + 'deg)'
				};
			var $div = $('<div class="star-ray" />').appendTo('body');	
			setTimeout(function(){
				$div.css(rayCss);
			},0);
		},
		showPlanetTitle:function(elm){
			if(!$(elm).length) {return;}
			var offset = $(elm).offset(),
				left = offset.left,
				top = offset.top,
				size = $(elm).width(),
				winWidth = $(window).width(),
				_float = $(window).width() / 2 > left ? 'left' : 'right',
				cssObj = {
					top:top + (size - 12) / 2
				},
				$title;
			if(_float === 'left'){
				cssObj.right = $(window).width() - left;
			}else{
				cssObj.left = left + size;
			}
			$title = $($.templates('#planet-title-tmpl').render({
				float:_float,
				title:$(elm).data('title')
			})).appendTo('body').css(cssObj);
		},
		chooseRelatePlanet:function(elm){
			var me = this,
				data = JSON.parse(unescape($(elm).data('all'))),
				isStock = $(elm).closest('.dimension').hasClass('clockRotation'),
				showInfoObj = {dataList:[data]},
				listObj = {list:[]},
				$relate;
			showInfoObj.dataList[0].type = isStock ? 'stock' : 'concept';
			listObj.type = isStock ? 'conceptList' : 'stockList';
			data.linkTo.forEach(function(item){
				$relate = $('.planet[data-id="' + (isStock ? 'concept-' : 'stock-') + item + '"]').addClass('selected');
				if($relate.length){
					me.showPlanetTitle($relate[0]);
					listObj.list.push(JSON.parse(unescape($relate.data('all'))));
				}
			});
			listObj.list.length && showInfoObj.dataList.push(listObj);
			$('.planet:not(.selected)').css('opacity',0.2);
			$('.planet.selected').css('opacity',1);
			me.drawRay();
			me.showPlanetRelateInfo(showInfoObj);
			$('.dialog-planet').addClass('active');	
		},
		showPlanetRelateInfo:function(data){
			$('.dialog-planet .dialog-container').html($.templates('#dialog-planet-tmpl').render(data)).addClass('active');
		},
		showSinglePlanetInfo:function(elm){
			var isStock = $(elm).closest('.dimension').hasClass('clockRotation'),
				data = {
					dataList:[$.extend(JSON.parse(unescape($(elm).data('all'))),{
						type:isStock ? 'stock' : 'concept'
					})]
				};

			$('.dialog-planet .planet-container:eq(1)').replaceWith($.templates('#dialog-planet-tmpl').render(data));

		},
		getData:function(){
			var me = this,
				getData = function(){
					return data;
				};
			$.when(getData()).then(function(data){
				me.render(data);
			});
		},
		dataFormat:function(data,dataType){
			var newData = {stockList:[],conceptList:[]},
				stockList = [],
				conceptList = [],
				cutArray = function(array,len){
					var count = Math.ceil(array.length / len),
						newList = [],
						cut = function(){
							var arr = array.splice(0,count);
							newList.push(arr);
							if(array.length){
								cut();
							}
						};
					cut();
					return newList;
				};

			switch(dataType){
				case 'star-lhb':
					data.dataList.forEach(function(item){
						stockList.push({
							name:item.StockName,
							stockCode:item.StockCode,
							linkTo:[]
						});
					});
					newData.stockList = cutArray(stockList,3);
					break;
				case 'star-fof':
					var stockObj = {};
					data.dataList.forEach(function(item){
						var conObj = {
							name:item.FundName,
							code:item.FundCode,							
							linkTo:[]
						};
						item.Stocks.forEach(function(obj){
							conObj.linkTo.push(obj.StockCode);
							if(stockObj[obj.StockCode]){
								if(stockObj[obj.StockCode].linkTo.indexOf(item.FundCode) === -1){
									stockObj[obj.StockCode].linkTo.push(item.FundCode);
								}
							}else{
								stockObj[obj.StockCode] = {
									stockCode:obj.StockCode,
									name:obj.StockName,
									linkTo:[item.FundCode]
								};
							}
						});
						conceptList.push(conObj);
					});
					for(var key in stockObj){
						stockList.push(stockObj[key]);
					}
					newData.stockList = cutArray(stockList,4);
					newData.conceptList = cutArray(conceptList,2);
					break;
				case 'star-idea':
					var stockObj = {};
					data.dataList.forEach(function(item){
						var conObj = {
							name:item.ConceptName,
							code:item.ConceptId,
							describe:item.ChanceTips,
							label:item.Lebel,
							news:item.DrivingEvent,						
							linkTo:[]
						};
						item.ConceptStocks.forEach(function(obj){
							conObj.linkTo.push(obj.StockCode);
							if(stockObj[obj.StockCode]){
								if(stockObj[obj.StockCode].linkTo.indexOf(item.ConceptId) === -1){
									stockObj[obj.StockCode].linkTo.push(item.ConceptId);
								}
							}else{
								stockObj[obj.StockCode] = {
									stockCode:obj.StockCode,
									name:obj.StockName,
									linkTo:[item.ConceptId]
								};
							}
						});
						conceptList.push(conObj);
					});
					for(var key in stockObj){
						stockList.push(stockObj[key]);
					}
					newData.stockList = cutArray(stockList,3);
					newData.conceptList = cutArray(conceptList,2);
					break;
				default:
					data.dataList.forEach(function(item){
						stockList.push({
							name:item.StockName,
							stockCode:item.StockCode,
							linkTo:[]
						});
					});
					newData.stockList = cutArray(stockList,3);
					break;
			}
			return newData;

		},
		render:function(data){
			var me = this;
			$('#dimensions').fadeOut(200,function(){
				$(this).html($.templates('#dimentsion-tmpl').render(data)).fadeIn(200,function(){
					me.dimension = me.getDimension();			
					me.aclockPos();
					me.clockPos();
				});
			});
			
			
		},
		bindEvent:function(){
			var me = this,				
				renderSize;
			me.dimension = me.getDimension();
			renderSize = me.dimension.planet.size;
			me.starPos();
			me.starListPos();
			me.starListPlanetPos();
			$(window).resize(function(){
				$('.star-ray').remove();
				$('.planet-title').remove();
				if(this.renderTimer){clearTimeout(renderTimer);}
				this.renderTimer = setTimeout(function(){
					me.reRenderSize();
				},100);
			});

			$(document).on('mouseenter','.planet',function(){
				var $dimension = $(this).closest('.dimension');
				$dimension.addClass('pauseAnimation');
				$('.planet-title').remove();
				me.showPlanetTitle(this);
				if($(this).hasClass('selected') && !$(this).hasClass('checked')){
					me.showSinglePlanetInfo(this);
				}
			}).on('mouseleave','.planet',function(){
				var $dimension = $(this).closest('.dimension');
				$('.planet-title').remove();
				if($('#star-system').hasClass('pause')) {return;}
				$dimension.removeClass('pauseAnimation');
				
			}).on('click','.planet',function(){
				var that = this;				
				$('.ray').remove();
				$('.planet').removeClass('checked selected');
				$(this).addClass('checked selected')
					   .css('opacity',1);
				$('.planet').not($(this)).css('opacity',0.2);
				$('.dimension').addClass('pauseAnimation').find('.orbit').hide();
				$('#star-system').addClass('pause');
				//分层次显示
				setTimeout(function(){
					me.drawRay();
				},100);
				setTimeout(function(){
					me.chooseRelatePlanet(that);
				},500);
				return false;
			}).on('click',function(){				
				$('.planet.checked').removeClass('checked');
				$('.dimension').removeClass('pauseAnimation');
				$('.planet').removeClass('selected').css('opacity',1);
				$('#star-system').removeClass('pause');
				$('.ray').remove();
				$('.planet-title').remove();
				$('#star-2').hide();
				$('.dimension .orbit').show();
				$('.dialog-describe').addClass('none');
				$('.dialog-planet').removeClass('active');	
			});
		
			$('.star,.star-planet','#star-list').click(function(){
				if($(this).hasClass('active')){return;}
				$('.active','#star-list').removeClass('active');
				$(this).addClass('active')
					   .closest('.star').addClass('active');
				me.drawStarRay();
				if($(this).data('url')){
					me.getData();
				}
			});

			
			$('#star').click(function(){
				var e = window.event || arguments.callee.caller.arguments[0];
				$('#star-2').show();
				$('.dimension').addClass('pauseAnimation');

				var $planet = $('.planet','#dimensions');
				if($('.planet.checked','#dimensions').length){
					$planet = $('.planet.selected','#dimensions')
				}
				$('.planet-title').remove();
				$planet.each(function(){
					me.showPlanetTitle(this);
				});
				stopPropagation(e);
			});
			$('.describe').click(function(){
				var e = window.event || arguments.callee.caller.arguments[0];
				$('.dialog-describe').toggleClass('none');
				stopPropagation(e);
			});
			$('.dialog-describe,.dialog-planet').click(function(){
				var e = window.event || arguments.callee.caller.arguments[0];
				stopPropagation(e);
			});
			$('#star-idea').trigger('click');
		}
	});
	new Planet();
	
})(jQuery);

