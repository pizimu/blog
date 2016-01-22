seajs.use(['jquery','artDialog','bootstrap','jsviews','toastr','toastrCss','themeCss','layout','utils','search'],function(){
    var siteData,bindEvent;
	siteData = {
		siteList:[{
			siteName:'全部',
			siteId:0
		},{
			siteName:'中国站',
			siteId:1
		},{
			siteName:'美国站',
			siteId:2
		},{
			siteName:'英国站',
			siteId:3
		}]
	};
	$('#site-tab').html($.templates('#site-tab-tmpl').render(siteData));
    (function() {
        var afterRender = setInterval(function() {
            if ($('#site-tab>.nav-tabs').length) {
                bindEvent();
                clearInterval(afterRender);
            }
        }, 100);
    })();
	
    bindEvent = function(){
        var listId = [];
        $('#site-tab>.nav-tabs>li:first a').tab('show');
        $.search = new $.PageSearch({
            tabs: ['#site-tab>.nav-tabs'],
            url: '/hardcode/ebay.json',
            parseData:function(dataList){
                dataList.forEach(function(item){
                    listId.push(item.id);
                })
                return dataList;
            },
            callback: function () {            
                var $table = $.search.$activeTable();            
                $('.edit-keyword-container', $table).editKeyword({
                    url: '/SalePlat/EbayListingQuickEditField'
                });
                $.getRemark({
                    id:listId
                });
            }
        });
        window.currentSearch = $.search;
        $('.check-all').checkAllTableList();

       
        $('.bat-delete').batAction({
            filter:function($elm){
                var data = JSON.parse(unescape($elm.closest('tr').data('all')));
                return data.isCopy;
            },
            filterMsg:'只有复制记录的才可以被删除',
            action:function($checkboxs,btn){
                $.confirm({
                    content:'确认要删除这些记录吗？',
                    elm:btn,
                    callback:function(){
                        toastr.success('这里执行ajax请求，执行ID包括' + $.getCheckedValue($checkboxs,'id'),'成功');
                    }
                });
            }
        });

        $('.bat-copy-list').batAction({
            action: function ($checkboxs) {
                var dataList = [];
                $checkboxs.each(function() {
                    var itemData = JSON.parse(unescape($(this).closest('tr').data('all')));
                    dataList.push(itemData);
                });

                copyList({ dataList: dataList });
            }
        });
        $('.bat-describe-template').batAction({
            action: function ($checkboxs) {
                var error = false,
                    data = {
                        idList:[]
                    };
                $checkboxs.each(function (i) {
                    var itemData = JSON.parse(unescape($(this).closest('tr').data('all')));
                    data.idList.push(this.value);
                    if (i === 0) {
                        data.warehouseId = itemData.warehouseId;
                        data.siteId = itemData.siteId;
                    } else {
                        if (data.warehouseId !== itemData.warehouseId || data.siteId !== itemData.siteId) {
                            error = '批量设置描述需要同一仓库同一站点的Listing';
                            return false;
                        }
                    }
                });
                if (error) {
                    toastr.error(error, '错误');
                    return false;
                }
                setDescribe(data);                
            }
        });
        $('.bat-transport-module').batAction({
            action: function ($checkboxs) {
                var error = false,
                    data = {
                        idList:[]
                    };
                $checkboxs.each(function (i) {
                    var itemData = JSON.parse(unescape($(this).closest('tr').data('all')));
                    data.idList.push(this.value);
                    if (i === 0) {
                        data.warehouseId = itemData.warehouseId;
                        data.siteId = itemData.siteId;
                    } else {
                        if (data.warehouseId !== itemData.warehouseId || data.siteId !== itemData.siteId) {
                            error = '批量设置运输模块需要同一仓库同一站点的Listing';
                            return false;
                        }
                    }
                });
                if (error) {
                    toastr.error(error, '错误');
                    return false;
                }
                setTransport(data);
            }
        });
        $('.bat-publish').batAction({
            // filterMsg: '只有不在线,单品销售价格不为0,销售状态为正常或清仓,API操作状态不是正在处理,相同刊登类型的记录才可以批量刊登',
            // filter: function ($checkbox) {
            //     //1.只有不在线的记录才能刊登
            //     //2.销售价格不能为0(多属性不用判断)
            //     //3.销售状态：正常、清仓
            //     //4.API操作状态不等于正在处理
            //     //5勾选刊登时，拍买跟一口价不能同时勾选
            //     var itemData = JSON.parse(unescape($checkbox.closest('tr').data('all'))),
            //         $tr = $checkbox.closest('tr');
            //     return itemData.status !== 'Online' && (Number($('input[data-fieldname="price"]', $tr).val()) > 0 || itemData.itemType === 'VariationBundle') && itemData.apiOperationStatus !== 'Processing' && (itemData.saleStatus === 'OnShelf' || itemData.saleStatus === 'Clearance');
            // },
            action: function ($checkboxs) {
                var data={
                        idList:[]
                    },
                    error = false;
                $checkboxs.each(function (i) {
                    var itemData = JSON.parse(unescape($(this).closest('tr').data('all')));
                    data.idList.push(this.value);
                    if (i === 0) {
                        data.listingType = itemData.listingType;
                    } else {
                        if (data.listingType !== itemData.listingType) {
                            error = '批量刊登需要同一种刊登方式';
                            return false;
                        }
                    }
                });
                if (error) {
                    toastr.error(error, '错误');
                    return false;
                }
                setPublish(data);                
            }
        });
        $('.bat-match-data').batAction({ //批量匹配模块（描述模板，EBAY分类，店铺分类，运送模块，销售员等）
            action: function ($checkboxs,btn) {
                $.confirm({
                    content: 'Listing重新匹配所有规则（描述模板，EBAY分类，店铺分类，运送模块，销售员等）',
                    elm:btn,
                    callback: function() {
                         toastr.success('这里执行ajax请求，实时修改数据，无刷机关报页面','操作');
                         return;
                        $.ajax({
                            url: '/SalePlat/BatchMatchingEbayListingModule',
                            data: {
                                idList: $.getCheckedValue($checkboxs)
                            },
                            success: function (result) {
                                if (result.status === 'success') {
                                    $.each(result.data.dataList, function (i, item) {
                                        bindPageFeeData(item);
                                        $('idkey.prop-panel-' + item.listingId).each(function () {
                                            this.poaTr && this.poaTr.getData();
                                        });
                                    });
                                } else {
                                    $.publish('throwAjaxError', result.msg);
                                }
                            }
                        });
                    }

                });
                
            }
        });
        //更新Listing
        //只有在线的并且API操作状态不是处理中的记录才可以更新
        $('.bat-update-listing').batAction({
            // filterMsg:'只有在线的并且API操作状态不是处理中的记录才可以更新',
            // filter: function ($checkbox) {
            //     var itemData = JSON.parse(unescape($checkbox.closest('tr').data('all')));
            //     return itemData.status === 'Online' && itemData.apiOperationStatus !== 'Processing';
            // },
            action: function ($checkboxs, btn) {
                $.confirm({
                    content: '确定要 更新 所选项吗？',
                    elm: btn,
                    callback: function () {
                        toastr.success('这里执行ajax请求','操作');
                        return;
                        $.ajax({
                            url: '/SalePlat/BatchUpdateItemToEbay',
                            data: {
                                idList: $.getCheckedValue($checkboxs)
                            },
                            success: function (result) {
                                if (result.status === 'success') {
                                    $.publish('refreshDataList', window.currentSearch);
                                } else {
                                    $.publish('throwAjaxError', '错误');
                                }
                            }
                        });
                    }
                });
            }
        });
        //同步在线
        //可以同步的记录必须状态是在线的记录,并且API操作状态不能是处理中的。
        $('.bat-sync-online').batAction({
            // filterMsg:'可以同步的记录必须状态是在线的记录,并且API操作状态不能是处理中的',
            // filter: function ($checkbox) {
            //     var itemData = JSON.parse(unescape($checkbox.closest('tr').data('all')));
            //     return itemData.status === 'Online' && itemData.apiOperationStatus !== 'Processing';
            // },
            action: function ($checkboxs, btn) {
                $.confirm({
                    content: '确定要同步选择的Listing吗？',
                    elm: btn,
                    callback: function () {
                        toastr.success('这里执行ajax请求','操作');
                        return;
                        $.ajax({
                            url: '/SalePlat/BatchSyncEbayOnlineItemToListing',
                            data: {
                                idList: $.getCheckedValue($checkboxs)
                            },
                            success: function (result) {
                                if (result.status === 'success') {
                                    $.publish('refreshDataList', window.currentSearch);
                                } else {
                                    $.publish('throwAjaxError', result.msg);
                                }
                            }
                        });
                    }
                });
            }
        });
        //备注
        $('.bat-remark-btn').batAddRemark({
            source: 'Listing'
        });

        //结束刊登
        //只有在线的并且API操作状态不是处理中的记录才可以结束
        $('.bat-early-finish').batAction({
            filterMsg:'只有在线的并且API操作状态不是处理中的记录才可以结束',
            filter: function($checkbox) {
                var itemData = JSON.parse(unescape($checkbox.closest('tr').data('all')));
                return itemData.status === 'Online' && itemData.apiOperationStatus !== 'Processing';
            },
            action: function($checkboxs, btn) {
                $.confirm({
                    title: '确定要把所选项 提前结束 吗？',
                    elm: btn,
                    callback: function() {
                        $.ajax({
                            url: '/SalePlat/BatchEndListing',
                            data: {
                                idList: $.getCheckedValue($checkboxs)
                            },
                            success: function(result) {
                                if (result.status === 'success') {
                                    $.publish('refreshDataList', window.currentSearch);
                                } else {
                                    $.publish('throwAjaxError', result.msg);
                                }
                            }
                        });
                    }
                });
            }
        });

        $doc.on('click', '.item-mark-link', function () {
            $(this).addRemark({
                source: 'Listing'
            });
        });

        $('.export-sku').batAction({
            action:function($checkboxs,btn){
                $.exportListData({
                    field:'itemCode',
                    title:'导出SKU'
                },$checkboxs);
            }
        });
        $('.export-order-number').batAction({
            action:function($checkboxs,btn){
                $.exportListData({
                    field:'ebayItemId',
                    title:'导出订单号'
                },$checkboxs);
            }
        });

        $doc.on('click', '.copy-btn', function() { //复制listing
            var itemData = JSON.parse(unescape($(this).closest('tr').data('all')));
            copyList({ dataList: [itemData] });
        });
    };

    $doc.on('click', '.edit-title', function () {
        var me = this,
            fieldName = $(me).data('fieldname'),
            id = $(me).data('id');
        var value = $.trim($(this).text());
        dialog({
            content: '<textarea style="width:600px;">' + value + '</textarea><p class="text-right"><span class="input-length">' + value.length + '</span> / 80</p>',
            skin: 'edit-title-dialog',
            width: 600,
            height: '',
            align: 'top left',
            quickClose: true,
            onshow: function () {
                var d = this;
                $('textarea', this.node).focus().bind('modify',function() {
                    var newValue = $.trim($(this).val());
                    if (value === newValue || newValue === '') return;
                    if (newValue.length > 80) {
                        toastr.error('标题最多为<em><b>80</b></em>个字符，当前<em><b>' + newValue.length + '</b></em>个字符', '错误');
                        return false;
                    }
                    toastr.success('这里执行ajax请求','操作');
                    $(me).text(newValue);
                    
                }).keyup(function() {
                    var $len = $('.input-length', d.node),
                        length = $(this).val().length;
                    length > 80 ? $len.addClass('font-red') : $len.removeClass('font-red');
                    $len.text(length);

                });
            },
            onclose: function () {
                $('textarea', this.node).trigger('modify');
            }
        }).show(me);
    });
   
});


function copyList (data) {
    var html = $.templates('#copy-list-tmpl').render(data),
        _bindEvent = function () {
            var _dialog = this;
            $('input[name="title"]', this.node).each(function () {
                var me = this,
                    data = $(me).data();
                $(this).checkTitle({
                    equalToData: function () {
                        if ($.trim($(me).val()) === $.trim(data.default) && $('input[name^="listingType"]:checked', $(me).closest('tr')).val() === data.listingtype) {
                            return '相同刊登类型下的标题不能相同';
                        }
                        return false;
                    }
                });
            });

            $('input[name^="listingType"]', this.node).change(function () {
                $('input[name="title"]', $(this).closest('tr')).trigger('keyup');
            });
            $('.remove-tr', this.node).click(function () {
                if ($('>tr', $(this).closest('tbody')).length === 1) {
                    _dialog.close().remove();
                    return;
                }
                $(this).closest('tr').remove();
            });
        }, 
        save = function () {
            var _dialog = this,
                sourceList = [];
            if ($('.has-error').length) {
                toastr.error('提交复制的标题有误，请检查后再提交','错误');
                return;
            }
            $('.table-copy-list>tbody>tr', this.node).each(function () {
                sourceList.push({
                    sourceListingId: $(this).data('id'),
                    newListingType: $('input[name^="listingType"]:checked', this).val(),
                    newTitle: $('input[name="title"]', this).val()
                });
            });
            toastr.success('这里执行ajax请求,成功后刷新列表','操作');
            $.publish('refreshDataList', window.currentSearch);
            _dialog.close().remove();
            return;
            
        };
    dialog({
        title: '复制Listing',
        content: html,
        skin: 'scroll',
        onshow: function () {
            $(this.node).uniform();
            _bindEvent.call(this);
            $.disableScroll();
        },
        onclose: function () {
            $.enableScroll();
        },
        okValue: '保存',
        ok: function () {
            save.call(this);
            return false;
        },
        cancelValue: '取消',
        cancel: function () { },
    }).showModal();
};

function setDescribe(data){
    //根据仓库站点获取描述模版数据 
    var getDescTemplateData = function (warehouseId, siteId) {
            var key = warehouseId + '-' + siteId,
                dtd;
            $.page.descTemplateData = $.page.descTemplateData || {};            
            if ($.page.descTemplateData[key]) {
                return $.page.descTemplateData[key];
            }
            dtd = $.Deferred();

            $.ajax({
                url: '/hardcode/describe.json',
                data: {
                    warehouseId: warehouseId,
                    siteId: siteId
                },
                success: function (result) {
                    result = window.ajaxResult;
                    delete window.ajaxResult;
                    if (result.status === 'success') {
                        $.page.descTemplateData[key] = result.data;
                        dtd.resolve(result.data);
                    } else {
                        $.publish('throwAjaxError', '错误');
                        dtd.reject();
                    }
                }
            });
            return dtd.promise();
        },
        save = function () {
            var me = this,
                $checkbox = $('input[name="describe-template-id"]:checked'),
                descriptionTemplateId = $checkbox.val(),
                descTmplHtml = '<span class="label label-info label-sm margin-top-5 ellipsis" style="width:95px;" title="' + $checkbox.data('name') + '">模：' + $checkbox.data('name') + '</span>';
            toastr.success('这里执行ajax请求','成功');
            me.close().remove();
            return;
            $.ajax({
                url: '/SalePlat/BatchSetEbayListingDescriptionTemplate',
                data: {
                    descriptionTemplateId: descriptionTemplateId,
                    idList: data.idList
                },
                success: function (result) {
                    if (result.status === 'success') {
                        $.each(idList, function (i, item) {
                            $('idkey.descriptionTemplateName-' + item).html(descTmplHtml);
                        });
                        me.close().remove();
                    } else {
                        $.publish('throwAjaxError', result.msg);
                    }
                }
            });
        };
    $.when(getDescTemplateData(data.warehouseId, data.siteId)).then(function (descTemplateData) {
        if (descTemplateData.dataList.length === 0) {
            toastr.error('当前仓库站点未设置描述模版', '错误');
            delete $.page.descTemplateData[warehouseId + '-' + siteId];
            return;
        }
        dialog({
            title: '批量设置描述模版',
            content: $.templates('#describe-template-tmpl').render(descTemplateData),
            width: 550,
            height: 350,
            skin: 'scroll',
            onshow: function () {
                $(this.node)
                    .uniform();
                $.disableScroll();
            },

            okValue: '保存',
            ok: function () {
                save.call(this);
                return false;
            },
            cancelValue: '取消',
            cancel: true,
        }).showModal();
    });
};

function setTransport(data){
    //根据仓库站点获取运送模块数据 
    var getTransportModuleData = function (warehouseId, siteId) {
            $.page.transportModuleData = $.page.transportModuleData || {};
            var key = warehouseId + '-' + siteId;
            if ($.page.transportModuleData[key]) {
                return $.page.transportModuleData[key];
            }
            var dtd = $.Deferred();
            $.ajax({
                url: '/hardcode/transport.json',
                data: {
                    warehouseId: warehouseId,
                    siteId: siteId
                },
                success: function (result) {
                    result = window.ajaxResult;
                    delete window.ajaxResult;
                    if (result.status === 'success') {
                        $.page.transportModuleData[key] = result.data;
                        dtd.resolve(result.data);
                    } else {
                        $.publish('throwAjaxError', '错误');
                        dtd.reject();
                    }
                }
            });
            return dtd.promise();
        },
        save = function () {
            var me = this,
                deliveryModuleId = $('input[name="transport-module-id"]:checked').val();
            toastr.success('这里执行ajax请求','成功');
            me.close().remove();
            return;
            $.ajax({
                url: '',
                data: {
                    deliveryModuleId: deliveryModuleId,
                    idList:data.idList
                },
                success: function(result) {
                    if (result.status === 'success') {
                        $.each(result.data.dataList, function (i, item) {
                            bindPageFeeData(item);
                        });
                        me.close().remove();
                    } else {
                        $.publish('throwAjaxError', result.msg);
                    }
                }
            });
        };
    $.when(getTransportModuleData(data.warehouseId, data.siteId)).then(function (transportModuleData) {
        if (transportModuleData.dataList.length === 0) {
            toastr.error('当前仓库站点未设置运输模块', '错误');
            delete $.page.transportModuleData[warehouseId + '-' + siteId];
            return;
        }
        dialog({
            title: '批量设置运输模块',
            content: $.templates('#transport-module-tmpl').render(transportModuleData),
            width: 550,
            height: 350,
            skin: 'scroll',
            onshow: function () {
                $(this.node)
                    .uniform();
                $.disableScroll();
            },

            okValue: '保存',
            ok: function () {
                save.call(this);
                return false;
            },
            cancelValue: '取消',
            cancel: true,
        }).showModal();
    });
};

function setPublish(data){
    dialog({
        title: '刊登',
        content: $.templates('#publish-tmpl').render(data),
        width: 550,
        height: 350,
        skin: 'scroll',
        onshow: function () {
            $(this.node).uniform();
            // $('form', this.node).validate({
            //     rules: {
            //         listingDuration: 'required',
            //         listingQuantity: {
            //             digits: true,
            //             min: 1
            //         }
            //     },
            //     messages: {
            //         listingDuration: '请选择刊登天数',
            //         listingQuantity: {
            //             digits: '刊登数量不正确',
            //             min: '刊登数量不正确'
            //         }
            //     }
            // });
            $.disableScroll();
        },
        okValue: '保存',
        ok: function () {
            var me = this;
            toastr.success('这里执行ajax请求','成功');
            me.close().remove();
            return;
            if ($('form', this.node).valid()) {
                $.ajax({
                    url: '/SalePlat/BatchPublishItemToEbay',
                    data: {
                        idList: idList,
                        listingQuantity: $('input[name="listingQuantity"]', me.node).val(),
                        listingDuration: $('select[name="listingDuration"]',me.node).val()
                    },
                    success: function(result) {
                        if (result.status === 'success') {
                            $.publish('refreshDataList', window.currentSearch);
                            me.close().remove();
                        } else {
                            $.publish('throwAjaxError', result.msg);
                        }
                    }
                });
            }
            return false;
        },
        cancelValue: '取消',
        cancel: true,
    }).showModal();
};