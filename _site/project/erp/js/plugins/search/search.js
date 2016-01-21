define(['jquery','utils'],function(require,exports,module){
	function Search(opts){
		this.opts = $.extend({
			container:'.search-result-container',
			beforeSearch:function(){
				console.log('Search beforeSearch');
			},
			beforeRender:function(){
				console.log('Search beforeRender');
			},
			afterRender:function(){
				console.log('Search afterRender');
			},
			formatData:function(){
				console.log('Search formatData');
			},
			callback:function(){
				console.log('Search callback');
			}
		});
		this.main();
	};
	$.extend(Search.prototype,{
		main:function(){
			this.opts.beforeSearch && this.opts.beforeSearch();
		},
		getCondition:function(){
			this.getData();
		},
		getData:function(){
			this.opts.formatData && this.opts.formatData();
		},
		go:function(){
			this.getCondition();
		},
		render:function(){
			this.opts.beforeRender && this.opts.beforeRender();

			this.domAndEvent();
		},
		domAndEvent:function(){
			this.opts.callback && this.opts.callback();
		}
	});

	function Condition(opts){
		this.opts = $.extend({
			tabs:[]
		},opts);
		this.data = this.opts.data || {};
		this.conditionLoaded = {};
		this.domAndEvent();
	};
	$.extend(Condition.prototype,{
		domAndEvent:function(){
			var me = this,
				$filter = $(''),
				hashObj = $.queryToObject($.hash()) || {};
			this.$container = $(me.opts.search.opts.container);
			this.$leftSide = $('.page-sidebar-menu');
			this.$searchBox = $('.search-box',this.container);
			this.$searchTitle = this.$searchBox.find('.panel-heading');

			//bind search-options click event;
			this.$searchBox.on('click','.filter-value',function(){
				$(this).toggleClass('selected')
			   		   .siblings().removeClass('selected');
			   	if(!$(this).hasClass('selected')){
			   		var opts = {
			   			data:$(this).data(),
			   			type:'remove',
			   			$elm:$(this),
			   			from:'searchBox'
			   		};
			   		delete me.data[opts.data.filter];
			   		$('.search-box-' + opts.data.filter,me.$searchBox).remove();
			   		//if has no condition, remove clear-all-label
                    if(!$('.filter-label',me.$searchTitle).length){
                        $('.clear-all-filter-label',me.$searchTitle).remove();
                    }
			   	}
			});
			//merge conditionData && hashData
			$.extend(this.data,hashObj);

			if($.isEmptyObject(this.data)){
				this.updateCondition({});
			}else{
				$.each(this.data,function(key,value){
					var $elm,
						from,
						data,
						value = unescape(value);
					switch(true){ //find condition 's element
						case ($elm = $('[data-filter="' + key + '"][data-value="' + value + '"]','.page-sidebar-menu')).length > 0:
							break;
						case key === 'orderBy'://unfinished
							$elm = $('.sorting[data-name="' + value.name + '"]',me.$container);
							break;
						default:
							$elm = $('[data-filter="' + key + '"][data-value="' + value + '"]',me.$container);
					}
					from = key ==='orderBy' ? 'orderBy' : $elm.parents('.page-sidebar-menu').length ? 'left' : $elm.parents('.nav-tabs').length ? 'tab' : 'searchBox';
					data = {
						data:{filter:key,value:value,$elm:$elm},
						$elm:$elm,
						type:'add',
						from:from
					};

					switch(from){
						case 'tab':
							var $tab = $($elm.find('>a').attr('href'));
							//update tab status
							$elm.addClass('active').siblings('.active').removeClass('active');
							$tab.addClass('active').siblings('.active').removeClass('active');

							$elm[0].conditionLoaded = true;
							data.data = $elm.data();
							break;
						case 'left':
							//unfinished;
							break;
						case 'searchBox':
							$elm = $('[data-filter="' + key + '"]',me.$searchBox);
							if($elm.length){
								data.data.name = $elm.data().name;
								$elm.val(value); //Assignment to the form elements
								switch($elm[0].tagName.toLowerCase()){ // get element tagName 
									case 'select':
										data.data.text = $elm.find('option[value="' + value + '"]').text();
										break;
									case 'input':
										if($elm[0].type === 'hidden'){
											data.data.text = '';
										}else{
											data.data.text = value;
										}
										break;
									default:
										if($elm.hasClass('filter-value')){
											data.data.text = $elm.removeClass('selected').filter('[data-value="' + value + '"]').addClass('selected').text();
										}else{
											data.data.text = value;
											$elm.text(value);
										}
										break;
								}
							}
							break;
						case 'orderBy':
							data = {from:'orderBy',value:value};
							break;
					}
					me.updateCondition(data);
				});
			}
			this.$searchBox.on('click','.filter-label .remove',function(){
				var data = $(this).closest('.filter-label').data(),
					$elm,
					from = $(this).data('from'),					
					opts;
				$elm = $('[data-filter="' + data.filter + '"]');
				if(data.from === 'orderBy'){
					//update sorting field status
				}
				if(data.filter === 'searchType' || data.filter === 'keyword'){
					$('.search-box-searchType,.search-box-keyword',me.$searchBox).each(function(){
						var data = $(this).data();
						me.updateCondition({
							data:data,
							type:'remove',
							$elm:$('.remove',this),
							from:'searchBox'
						});
					});
				}else{
					me.updateCondition({
						data:data,
						type:'remove',
						$elm:$elm,
						from:from
					});
				}
				

				//reducing status
				switch($elm[0].tagName.toLowerCase()){
					case 'select':
						$('option:first',$elm).prop('selected',true);
						break;
					case 'input':
						//unfinished hidden;
						$elm.val('');
						break;
					default:
						if($elm.hasClass('filter-value')){
							$elm.filter('[data-value="' + data.value + '"]').removeClass('selected');
						}else{
							$elm.text('');
						}
				}
			}).on('click','.clear-all-filter-label',function(){
				me.$searchTitle.find('.filter-label').each(function(){
				 	$('.remove',this).trigger('click');
				});
				$(this).remove();		
			});

			//
			$.each(this.opts.tabs,function(i,item){
				var $tab = $(me.opts.search.opts.container).find(item);
				$tab.find('>li.active')[0].conditionLoaded = true;
				$tab.on('click','>li',function(){
					var shadowObj = {},
						data = {
							data:$(this).data(),
							type:'add',
							$elm:$(this),
							from:'tab'
						};
					if(data.data.value !== ''){
						shadowObj[data.data.filter] = data.data.value;
					}else{
						delete me.data[data.data.filter];
					}
					if(me.conditionLoaded[JSON.stringify($.extend({},me.data,shadowObj))] && !this.needRefresh){
						$.hash($.extend(me.data,shadowObj));
						return;
					}
					this.needRefresh = false;
					me.updateCondition(data);
				});
			});

			//to do get search data
			this.$searchBox.find('.search-btn').click(function(){
				me.getSearchBoxCondition();
			});

			// page event
			$(this.opts.search.opts.container).on('click','.pagination',function(e){
				var elm = (e || event).target;
				if(elm.tagName.toLowerCase() === 'a'){
					var	pageIndex = $(elm).data('value'), //page Number ,begin 1 . NOT INDEX
						currPage = Number($.hash('get','pageIndex')) || 1,
						data = {
							filter:'pageIndex',
							name:'页码',
							value:pageIndex,
							text:pageIndex
						};
					currPage = currPage < 1 ? 1 : currPage;
					if(pageIndex === currPage) return;
					me.updateCondition({
						data:data,
						$elm:$(elm),
						from:'page',
						type:'add'
					});
				}

			});
		},
		getSearchBoxCondition:function(){ // get condition. add && remove
			var me = this,
				$fields = this.$searchBox.find('input[type="text"],input[type="hidden"],select,span.date,.selected');
				removeData = me.$searchTitle.find('.search-box-pageIndex').data();
			if(removeData){ //remove page
				this.updateSearchBoxConditionUI({data:removeData,type:'remove',from:'page'});
				delete this.data.pageIndex;
			}
			$fields.each(function(){
				var data = $(this).data();
				if(!data.filter) return;
				if(!$(this).hasClass('filter-value')){
					data.value = $.trim(this.value);
					if(this.tagName.toLowerCase() === 'span'){
						data.value = $.trim($(this).text());
					}
				}
				//if this condition has no value ,remove it
				if(me.data[data.filter]){
					me.updateCondition({
						data:data,
						$elm:$(this),
						from:'searchBox',
						type:'remove'
					});
				}

				if(data.value === '') return;
				var _data = {
					data:data,
					$elm:$(this),
					from:'searchBox',
					type:'add'
				};
				switch(this.tagName.toLowerCase()){
					case 'input':

						if(data.filter === 'keyword'){ // escape keyword
							data.value = escape(data.value);
						}
						if(this.type !== 'hidden'){
							data.text = $.trim(this.value);
						}
						break;
					case 'select':
						data.text = $.trim($(':selected',this).text());
						//when no keyword , no searchType
						if($(this).data().filter === 'searchType' && $.trim($('[data-filter="keyword"]', me.searchbox).val()) === ''){
							_data.type='remove';
						}
						break;
					case 'span':
						data.text = $.trim($(this).text());
						data.value = escape(data.value);
						break;
				}
				me.updateCondition(_data);

			});
		},
		updateCondition:function(opts){
			var me = this,
				$allLabel = this.$searchTitle.find('.clear-all-filter-label');
			if(this.getSearchDataTimer){
				clearTimeout(this.getSearchDataTimer);
			}
			switch(opts.from){ // update view UI 
				case 'orderBy':
					this.updateOrderByConditionUI(opts);
					break;
				case 'page':
					this.updatePageConditionUI(opts);
					break;
				default:
					this.updateSearchBoxConditionUI(opts);
			}
			switch(opts.type){
				case 'add':
					if(opts.data.value !== '' && opts.data.value !== undefined){
						this.data[opts.data.filter] = opts.data.value;
					}else{
						delete this.data[opts.data.filter];
					}
					break;
				case 'remove':
					delete this.data[opts.data.filter];
					break;
			}

			this.getSearchDataTimer = setTimeout(function(){
				me.opts.search && me.opts.search.getData(me.data);
			},300);

			if(me.$searchTitle.find('.filter-label').length){
				if(!$allLabel.length){
					$allLabel = $('<span class="label label-xs label-danger margin-left-5 clear-all-filter-label pointer" >清除全部</span>');
				}
				$allLabel.appendTo(me.$searchTitle.find('.caption'));
			}else{
				$allLabel.remove();
			}

			$.hash(this.data);
		},
		updateOrderByConditionUI:function(){

		},
		updatePageConditionUI:function(opts){
			opts.type !== 'remove' && this.updateSearchBoxConditionUI({data:opts.data,type:'remove',from:'page'});
			this.updateSearchBoxConditionUI(opts);
			this.data.pageIndex = opts.data.value;
		},
		updateLeftZtreeConditionUI:function(){},
		updateSearchBoxConditionUI:function(opts){
			var me = this;
			switch(opts.type){
				case 'add':

					if(opts.from === 'tab' || !opts.data.name) return;
					var showText = opts.data.text,
						showTitle = '';
					if(opts.data.filter === 'keyword' && showText.length > 15){
						showTitle = opts.data.text;
						showText = showText.slice(0,15) + '...';
					}
					$('<span class="label label-xs label-warning filter-label margin-left-5 search-box-' + (opts.data.filter) + '"><b>' + opts.data.name + ':</b>' + showText + '<i class="glyphicon glyphicon-remove pointer margin-left-5 remove" data-from="' + opts.from + '"></i></span>').data(opts.data).appendTo(this.$searchTitle.find('.caption'));
					break;
				case 'remove':
					$('.search-box-' + opts.data.filter, this.searchbox).remove();
					// if(opts.data.filter === 'keyword' || opts.data.filter === 'searchType'){
					// 	$('.search-box-keyword,.search-box-searchType', this.searchbox).remove();
					// }
					break;
			}
			this.conditionLoaded = {};
		}
	});


	function Pagination(opts){
		this.init(opts);
	};
	$.extend(Pagination.prototype,{
		init:function(opts){
			opts = $.extend({
				items:0, // total count
				itemsOnPage:0, // list count of page
				pages:0, // total pages
				displayedPages:5, // show pages number
				currentPage:0, //
				prevText:'&laquo;',
				nextText:'&raquo;',
				ellipsisText:'&hellip;',
				cssStyle:'',
				edges:2,
				useStartEdge:true,
				useEndEdge:true,
				container:'.pagination'
			},opts);
			opts.pages = Number(opts.pages) ? Number(opts.pages) : (Math.ceil(opts.items / opts.itemsOnPage) || 1);
			opts.currentPage = Number(opts.currentPage) || 0;
			opts.halfDisplayed = opts.displayedPages / 2;
			this.$container = $(opts.container);
			this.$container.addClass(opts.cssStyle).html('');
			this.opts = opts;
			this.graw();
		},
		graw:function(){
			var me = this,
				opts = this.opts,
				interval = this.getInterval();
			opts.prevText && this.appendItem(opts.currentPage - 1,{text:opts.prevText,type:'prev'}); //prev
			if(opts.edges > 0 && opts.useStartEdge){ //prev edge
				for(var i = 0 ,j = Math.min(opts.edges,interval.start);i < j; i++ ){
					this.appendItem(i);
				}
			}
			if(opts.edges < interval.start && interval.start - opts.edges !== 1){ // add ellipsis
				this.$container.append('<li class="disabled"><span>' + opts.ellipsisText + '</span></li>');
			}else if(interval.start - opts.edges === 1){
				this.appendItem(opts.edges);
			}

			for(var i = interval.start;i < interval.end;i++){
				this.appendItem(i);
			}

			if(opts.pages - opts.edges > interval.end && opts.pages - opts.edge - interval.end !== 1){
				this.$container.append('<li class="disabled"><span>' + opts.ellipsisText + '</span></li>');
			}else if(opts.pages - opts.edges - interval.end === 1){
				this.appendItem(interval.end);
			}

			if(opts.edges > 0 && opts.useEndEdge){
				for(var i = Math.max(opts.pages - opts.edges,interval.end); i < opts.pages; i++){
					this.appendItem(i);
				}
			}
			opts.nextText && this.appendItem(opts.currentPage + 1,{text:opts.nextText,type:'next'});

		},
		getInterval:function(){
			var opts = this.opts;
			return {
				start:Math.ceil(opts.currentPage > opts.halfDisplayed ? Math.max(Math.min(opts.currentPage - opts.halfDisplayed,opts.pages - opts.displayedPages),0) : 0),
				end:Math.ceil(opts.currentPage > opts.halfDisplayed ? Math.min(opts.currentPage + opts.halfDisplayed,opts.pages) : Math.min(opts.displayedPages,opts.pages))
			};
		},
		appendItem:function(pageIndex,opts){
			var me =  this,
				$linkWrapper = $('<li></li>'),
				$link;
			pageIndex = pageIndex < 0 ? 0 : pageIndex < this.opts.pages ? pageIndex : this.opts.pages - 1;
			opts = $.extend({
				text:pageIndex + 1,
				type:''
			},opts);
			if(pageIndex === this.opts.currentPage && opts.type === ''){
				$linkWrapper.addClass('active');
			}
			$link = $('<a href="javascript:;" data-value="' + (pageIndex + 1) + '" data-filter="pageIndex">' + opts.text + '</a>');
			this.$container.append($linkWrapper.append($link));
		}
	});
	$.fn.pagination = function(opts){
		return this.each(function(){
			new Pagination($.extend({
				container:this
			},opts));
		});
	};
	
	function PageSearch(opts){
		this.opts = $.extend({
			conditionData:{},
			container:'.page-content',
			tabs:['.nav-tabs:first'],
			renderTmpl:'#list-tr',
			url:'',
			table:'',
			afterRender:null,
			showPage:true,
			callback:null
		},opts);
		this.condition = new Condition({
			search:this,
			pager:$(this.opts.container).find('.pagination'),
			data:this.opts.conditionData,
			tabs:this.opts.tabs
		});
		this.main();
	};
	$.extend(PageSearch.prototype,Search.prototype,{
		getData:function(){
			var me = this,
				getListData = new $.Deferred(),
				parseConditionData = function(data){ //request data format
					return data;
				};
			$.publish('loading',1);
			if(this.opts.url === ''){
				toastr.error('Page search config error, url is required','错误');
				return;
			}
			$.ajax({
				//url:this.opts.url,
				url:this.opts.url + '?' + $.param(parseConditionData(this.condition.data)),
				//data:parseConditionData(this.condition.data),
				type:'get'
			}).done(function(result){
				 getListData.resolve(result);
				 return;
				//here need to check result data
				if(result.status === 'success'){
					getListData.resolve(result.data);
				}else{
					$.publish('loading',0);
					getListData.reject(result.msg);
				}
			}).fail(function(){
				$.publish('loading',0);
			});
			$.when(getListData).done(function(data){
				me.data = data;
				me.domAndEvent();
				me.condition.conditionLoaded[JSON.stringify(me.condition.data)] = true;
				setTimeout(function(){me.render();},0);
			}).fail(function(msg){
				$.publish('throwAjaxError',msg);
			});

		},
		render:function(){
			var me = this,
				$activeTbody = this.$activeTbody(),
				renderHtml;
			this.opts.beforeRender && this.opts.beforeRender();
			if(!$activeTbody.length){
				throw new Error('Page search config error, table is not define');
				return;
			}

			//data format
			this.opts.parseData && (this.data.dataList = this.opts.parseData(this.data.dataList));
			//add list index, when sync updata data, the index is keeped
			this.data.dataList.forEach(function(item,i,array){
				array[i].trIndex = i;
			});

			renderHtml = this.data.dataList.length ? $.templates(this.opts.renderTmpl).render(this.data) : '<tr><td class="text-center" colspan="99">无数据</td></tr>';
			$activeTbody.html(renderHtml);

			//render pagination
			this.pageRender();

			setTimeout(function(){
				$.publish('loading',0);
			});

			//after render
			this.opts.afterRender && this.opts.afterRender();
		},
		domAndEvent:function(){
			var me = this,
				timer;
			this.$tab = function(){
				return $(me.opts.container).find(me.opts.tabs[0]);
			};
			this.$activeTabTitle = function(){
				return me.$tab().find('>li.active');
			};
			this.$activeTabContent = function(){
				return me.$tab().parent().find('.tab-content > .tab-pane.active');
			};
			this.$activeTable = function(){
				switch(true){
					case me.$activeTabContent().length > 0:
						return me.$activeTabContent().find('>table:first');
					case $(me.opts.table).length > 0:
						return $(me.opts.table).eq(0);
					default:
						return $(me.opts.container).find('>table:first');
				}
			};
			this.$activeTbody = function(){
				return me.$activeTable().find('>tbody');
			};
			//when list data is rendered, callback interface
			timer = setInterval(function(){
				if($('>tr',me.$activeTbody()).length){
					clearInterval(timer);
					$doc.scrollTop(0);
					me.$activeTable().uniform();
					me.opts.callback && me.opts.callback();
				}
			},100);
		},
		pageRender:function(){
			var me = this,
				$activeTable = me.$activeTable(),
				pageTmpl = me.pageTmpl,
				showPage = function(){
					var abovePageHtml = $.templates(pageTmpl.aboveTmpl).render(me.data.dataMeta),
						belowPageHtml = $.templates(pageTmpl.belowTmpl).render(me.data.dataMeta),
						$pageInfo = $activeTable.prev('.page-infomation'),
						$pageNumber = $activeTable.next('.page-number');
					$pageInfo.length ? $pageInfo.replaceWith(abovePageHtml) : $activeTable.before(abovePageHtml);
					$pageNumber.length ? $pageNumber.replaceWith(belowPageHtml) : $activeTable.after(belowPageHtml);
					$('.pagination',me.opts.container).pagination({
						pages:me.data.dataMeta.pages,
						currentPage: me.data.dataMeta.pageIndex - 1 || 0
					});

					var $caption = $('.caption',me.condition.$searchTitle);
					if (me.data.dataMeta.pageIndex > 1 && !$('.search-box-pageIndex', $caption).length) {
                        var $filter = $('<span class="label label-xs label-warning filter-label margin-left-5 search-box-pageIndex"><b>页码：</b>' + me.data.dataMeta.pageIndex + '<i class="glyphicon glyphicon-remove pointer margin-left-5 remove" data-from="page"></i></span>').data({ text: me.data.dataMeta.pageIndex, value: me.data.dataMeta.pageIndex, name: '页码', filter: 'pageIndex' });

                        if ($('.filter-label', $caption).length) {
                            $('.filter-label:last', $caption).after($filter);
                        } else {
                            $filter.appendTo($caption);
                        }
                        !$('.clear-all-filter-label', $caption).length && $('<span class="label label-xs label-danger margin-left-5 clear-all-filter-label pointer" >清除全部</span>').appendTo($caption);
                    }
				},
				showSimplePage = function(){
					var simplePageHtml = $.templates(pageTmpl.simpleTmpl).render(me.data.dateMeta),
						$pageInfo = $activeTable.prev('.page-infomation');
					$pageInfo.length ? $pageInfo.replaceWidth(simplePageHtml) : $activeTable.before(simplePageHtml);
				};
			switch(me.opts.showPage){
				case true:
					showPage();
					break;
				case 'simplePage':
					showSimplePage();
					break;
			}
		},
		pageTmpl: {
			aboveTmpl: '<h6 class="pull-right margin-top-10 page-infomation"> 第 <span class="text-info">{{:pageIndex}}/{{:pages || 1}}</span> 页 &nbsp;&nbsp;&nbsp;&nbsp;  共 <span class="text-danger">{{: totalCount}}</span> 项结果&nbsp;&nbsp;&nbsp;&nbsp; {{:pageSize}} 项/页 </h6>',
            belowTmpl: '<div class="row-flow margin-top-10 page-number">' +
                '<h6 class="pull-right margin-top-0 page-infomation"> 第 <span class="text-info">{{:pageIndex}}/{{:pages || 1}}</span> 页 &nbsp;&nbsp;&nbsp;&nbsp;  共 <span class="text-danger">{{: totalCount}}</span> 项结果&nbsp;&nbsp;&nbsp;&nbsp; {{:pageSize}} 项/页 </h6>' +
                '   <ul class="pagination pagination-sm">' +
                '   </ul>' +
                '</div>',
            simpleTmpl: '<h6 class="pull-right margin-top-0 page-infomation">共 <span class="text-danger total-result">{{:totalCount}}</span> 项结果</h6>'
        }
	});
	$.PageSearch = PageSearch;
});