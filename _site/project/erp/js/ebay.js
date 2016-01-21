$(function () {
    //$('#custom-list-field').switchPanel();
    // hard code modify status.


    $.views.tags({
        formatVeriation: function(veriation) {
            veriation = $.trim(veriation);
            if (!veriation) return '';
            var html = '';
            veriation.split(',').forEach(function(item) {
                var prop = item.split(':');
                prop.length === 2 && (html += '<span class="label label-sm bg-grey-steel">' + prop[0] + ':' + prop[1] + '</span> ');
            });
            return html;
        },
        customNum: function(prefix) {
            return prefix + Math.random();
        }
    });
    
    //获取仓库站点关联数据(所有站点，仓库站点关联)
    $.getWarehouseSiteData = function () {
        $.page.siteData = {
                sites:[{
                    siteId:1,
                    siteName:'中国站',
                    siteCode:'CN'
                },{
                    siteId:2,
                    siteName:'美国站',
                    siteCode:'US'
                },{
                    siteId:3,
                    siteName:'英国站',
                    siteCode:'UK'
                }],
                warehouseSalesSites:[{warehouseId:1,warehouseName:'美国仓'},{warehouseId:2,warehouseName:'英国仓'},{warehouseId:3,warehouseName:'德国仓'}]
            };
        if ($.page.siteData) return $.page.siteData;
        var dtd = $.Deferred();
        $.ajax({
            url: '/SalePlat/GetWarehouseSiteData',
            success: function (result) {
                if (result.status === 'success') {
                    $.page.siteData = result.data;
                    dtd.resolve(result.data);
                } else {
                    $.publish('throwAjaxError', [result.msg]);
                    dtd.reject();
                }
            }
        });
        return dtd.promise();
    };

    //获取竞争对手数据
    //id:itemId
    //update:是否更新数据
    $.getCptrData = function(id,update) {
        $.page.cptrData = $.page.cptrData || {};
        if ($.page.cptrData[id] && !update) return $.page.cptrData[id];
        var dtd = $.Deferred();
        $.ajax({
            url: '/SalePlat/GetListingAllCompetitor',
            data: {
                listingId: id
            },
            success: function(result) {
                if (result.status === 'success') {
                    $.page.cptrData[id] = $.extend(result.data, {listingId:id});
                    dtd.resolve(result.data);
                } else {
                    $.publish('throwAjaxError', result.msg);
                    dtd.reject();
                }
            }
        });
        return dtd.promise();
    };

    //获取多属性子SKU竞争对手数据
    //id:itemId
    //update:是否更新数据
    $.getPoaCptrData = function (id, update) {
        $.page.poaCptrData = $.page.poaCptrData || {};
        if ($.page.poaCptrData[id] && !update) return $.page.poaCptrData[id];
        var dtd = $.Deferred();
        $.ajax({
            url: '/SalePlat/GetListingDetailAllCompetitor',
            data: {
                listingDetailId: id
            },
            success: function (result) {
                if (result.status === 'success') {
                    $.page.poaCptrData[id] = $.extend(result.data, { listingId: id });
                    dtd.resolve(result.data);
                } else {
                    $.publish('throwAjaxError', result.msg);
                    dtd.reject();
                }
            }
        });
        return dtd.promise();
    };


    //添加竞争对手
    $.addCptr = function (options) {
        options = $.extend({
            listingId: '',
            competitorEbayItemId: '',
            elm: '', //页面编辑input
            pageEdit: false,//是否页面编辑
            isPoa:false,//是否多属性的子SKU
            callback: null
        }, options);
        var listingId = options.listingId,
            competitorEbayItemId = options.competitorEbayItemId,
            pageEditError = function() {
                if (options.pageEdit) {
                    $(options.elm).val(options.elm.oldValue);
                }
            },
            addCptr = function (cptrData, d) {
                var url = options.isPoa ? '/SalePlat/SetListingDetailCompetitor' : '/SalePlat/SetListingCompetitor',
                    data = {
                        competitorEbayItem: cptrData,
                        isPrimary: options.pageEdit
                    };
                data[options.isPoa ? 'listingDetailId' : 'listingId'] = listingId;
                $.ajax({
                    url: url,
                    data: data,
                    success: function(result) {
                        if (result.status === 'success') {
                            if (!options.isPoa) {
                                if ($.page.cptrData && $.page.cptrData[listingId]) {
                                    $.when($.getCptrData(listingId, true)).then(function(data) {
                                        $.templates('#cptr-tmpl').link($('.cptr-container-' + listingId), data).handleUniform();
                                    });
                                }
                            } else {
                                if ($.page.poaCptrData && $.page.poaCptrData[listingId]) {
                                    $.when($.getPoaCptrData(listingId, true)).then(function (data) {
                                        $.templates('#cptr-tmpl').link($('.cptr-container-' + listingId), data).handleUniform();
                                    });
                                }
                              
                            }
                            options.callback && options.callback(cptrData);
                            d && d.open && d.close().remove();
                        } else {
                            pageEditError();
                            $.publish('throwAjaxError', result.msg);
                        }
                    }
                });
            },
            chooseCptr = function(data) {
                dialog({
                    title: '选择竞争对手',
                    content: $.templates('#choose-cptr-tmpl').render(data),
                    height: 500,
                    onshow: function() {
                        $.disableScroll();
                        $(this.node).handleUniform();
                    },
                    skin: 'scroll',
                    okValue: '确定',
                    ok: function() {
                        var $radio = $('input[name="cptr-id"]:checked', this.node);
                        if (!$radio.length) {
                            toastr.error('请选择一个竞争对手。', '错误');
                        } else {
                            addCptr(JSON.parse(unescape($radio.data('all'))), this);
                        }
                        return false;
                    },
                    cancelValue: '取消',
                    cancel: function() {
                        pageEditError();
                    }
                }).showModal();
            };
        $.ajax({
            url: '/SalePlat/GetCompetitorEbayItem',
            data: {
                competitorEbayItemId: competitorEbayItemId
            },
            success: function (result) {
                if (result.status === 'success') {
                    if (result.data.dataList.length === 1) {
                        addCptr(result.data.dataList[0]);
                    } else {
                        chooseCptr(result.data);
                    }
                } else {
                    pageEditError();
                    $.publish('throwAjaxError', result.msg);
                }
            }
        });
    };

    var idList = [];

    $.when($.getWarehouseSiteData())
        .then(function(data) {
            $('#site-tab').html($.templates('#page-container-tmpl').render({ siteList: data.sites }));
            (function() {
                var afterRender = setInterval(function() {
                    if ($('#site-tab>.nav-tabs').length) {
                        bindEvent();
                        clearInterval(afterRender);
                    }
                }, 100);
            })();
        });
    var renderSearchWarehouse = function(data) {
        var html = '<span class="filter-name">仓库：</span>';
        for (var i = 0; i < data.warehouseSalesSites.length; i++) {
            var item = data.warehouseSalesSites[i];
            html += '<span class="filter-value" data-name="仓库" data-filter="warehouseId" data-text="' + item.warehouseName + '" data-value="' + item.warehouseId + '">' + item.warehouseName + '<span class="fa fa-check selected-sign"></span></span>';
        }
        $('.filter-warehouseId').html(html);

    };

    var bindPageFeeData = function(item) {
        for (var key in item) {
            if (key !== 'listingId') {
                var $key = $('idkey.' + key + '-' + item.listingId),
                    value = item[key];
                switch ($key.data('format')) {
                    //case 'digits': case 'number':
                    //    break;
                    case 'weight':
                        value = $.toFixed(value, 3);
                        break;
                    case 'size':case 'price':
                        value = $.toFixed(value, 2);
                        break;
                    case 'precent':
                        value = $.toFixed(value, 2) + '%';
                        break;
                }
                $key.text(value);
            }
            //switch (key) {
            //    case 'listingId':
            //        break;
            //    case 'itemWeight':
            //        $('idkey.' + key + '-' + item.listingId).text($.toFixed(item[key], 3));
            //        break;
            //    case 'domesticProfitMargin':
            //        $('idkey.' + key + '-' + item.listingId).text($.toFixed(item[key], 2) + '%');
            //        break;
            //    default:
            //        $('idkey.' + key + '-' + item.listingId).text($.toFixed(item[key]));
            //}
        }
    };
    var getFeeBySecondLoad = function (idList) {
        $.ajax({
            url: '/SalePlat/GetListingComputeData',
            data: {
                idList: idList
            },
            success: function(result) {
                if (result.status === 'success') {
                    $.each(result.data.dataList, function(i,item) {
                        bindPageFeeData(item);
                    });
                } else {
                    $.publish('throwAjaxError', result.msg);
                }
            }
        });
    };

    var getSiteRecordCount = function () {

        $('span[id^="dataCount"]').text('');
        var parseData = function (data) {
            data = $.extend({}, data, true);
            var conditionData = { conditions: []};
            for (var key in data) {
                var value = unescape(data[key]);
                var patt = /^\d{4}-\d{1,2}-\d{1,2}(\s?-\s?\d{4}-\d{1,2}-\d{1,2})?$/;
                if (key === 'keyword') data[key] = unescape(data[key]);
                if (patt.test(value) && key !== 'keyword') {
                    var aDate = value.match(/\d{4}-\d{1,2}-\d{1,2}/g);
                    conditionData.conditions.push({
                        name: key + 'Begin',
                        value: aDate[0]
                    });
                    aDate[1] && conditionData.conditions.push({
                        name: key + 'End',
                        value: aDate[1]
                    });
                    delete data[key];
                } else {
                    switch (key) {
                        case 'pageIndex': case 'pageSize': case 'orderBy': case 'siteId':
                            break;
                        default:
                            conditionData.conditions.push({
                                name: key,
                                value: value
                            });
                    }
                }

            }
            return conditionData;
        };      

    };

    var copyList = function (data) {
        var html = $.templates('#copy-list-tmpl').render(data);
        var _bindEvent = function () {
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
        };
        var save = function () {
            var _dialog = this,
                sourceList = [];
            if ($('.has-error').length) {
                return;
            }
            $('.table-copy-list>tbody>tr', this.node).each(function () {
                sourceList.push({
                    sourceListingId: $(this).data('id'),
                    newListingType: $('input[name^="listingType"]:checked', this).val(),
                    newTitle: $('input[name="title"]', this).val()
                });
            });
            $.ajax({
                url: '/SalePlat/EbayListingBulkCopy',
                data: {
                    sourceList: sourceList
                },
                success: function (result) {
                    if (result.status === 'success') {
                        $.publish('refreshDataList', window.currentSearch);
                        _dialog.close().remove();
                    } else {
                        $.publish('throwAjaxError', result.msg);
                    }
                }
            });

        };
        dialog({
            title: '复制Listing',
            content: html,
            skin: 'scroll',
            onshow: function () {
                $(this.node).handleUniform();
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

   

    $.pageEdit({//价格 //国内运费
        url: '/SalePlat/EbayListingQuickEditField',
        selector: ['.list-tr input[data-fieldname="price"]', '.list-tr input[data-fieldname="domesticShippingFee"]'],
        callback: function (opts) {
            bindPageFeeData(opts.data);
        }
    });

    $.pageEdit({//国外运费 //补量
        url: '/SalePlat/EbayListingQuickEditField',
        selector: ['.list-tr input[data-fieldname="internationalShippingFee"]', '.list-tr input[data-fieldname="listingQuantity"]']
    });

    $.pageEdit({//多属性子属性  价格 //补量 //关键词
        url: '/SalePlat/EbayListingDetailQuickEditField',
        selector: ['.poa-tr input[data-fieldname="listingQuantity"]', '.poa-tr input[data-fieldname="price"]', '.poa-tr input[data-fieldname="keywords"]'],
        callback: function (opts) {
            var data = opts.data || {},
                elm = opts.elm,
                $tr = $(elm).closest('tr'),
                value = $(elm).val(),
                itemData = JSON.parse(unescape($tr.data('all'))),
                trIndex = $('.poa-tr', $tr.parent()).index($tr),
                parseData = $.extend(itemData, data, { trIndex: trIndex });
            parseData[$(elm).data('fieldname')] = value;
            var trHtml = $.templates('#poa-tr-tmpl').render(parseData);
            $tr.replaceWith($('<div />').html(trHtml).find('tr:first'));
        }
    });

  

    $.fn.fixTableWidth = function () {
        return this.each(function () {
            var width = 0;
            $('> thead > tr > th', this).each(function () { width += parseInt(this.width); });
            $(this).width(width);
        });
    };

    $.fn.tableSorting();


    function bindEvent() {
        $('.checkAll').checkAllTableList();
        renderSearchWarehouse($.page.siteData);

        var siteId = $.queryToObject($.hash()).siteId || '';
        var $li = $('#site-tab').find('>.nav-tabs>li[data-value="' + siteId + '"]');
        if (!$li.length) $li = $('#site-tab').find('>.nav-tabs>li:first');
        $('a', $li).trigger('click');


        $.search = new $.PageSearch({
            tabs: ['#site-tab>.nav-tabs'],
            conditionData: { siteId: siteId },
            url: '/hardcode/ebay.json',
          
            parseData: function (data) {
                for (var i = 0, j = data.length; i < j; i++) {
                    idList.push(data[i].id);
                }
                return data;
            },
            beforeSearch: function () {
                var i;
                var warehouseId = $.queryToObject($.hash()).warehouseId || false,
                    siteList = [];
                if (warehouseId) {
                    for (i = 0; i < $.page.siteData.warehouseSalesSites.length; i++) {
                        if ($.page.siteData.warehouseSalesSites[i].warehouseId === warehouseId) {
                            siteList = $.page.siteData.warehouseSalesSites[i].sites;
                            break;
                        }
                    }
                    if (siteList.length) {
                        $('#site-tab>.nav-tabs>li').hide();
                        for (i = 0; i < siteList.length; i++) {
                            $('#site-tab>.nav-tabs>li[data-value="' + siteList[i].siteId + '"]').show();
                        }
                        $('#site-tab>.nav-tabs>li[data-value="').show();
                    }
                    if (!$('li.active:visible', '#site-tab>.nav-tabs').length) {
                        $('li:visible:first a', '#site-tab>.nav-tabs').trigger('click');
                    }
                }
                setTimeout(function () {
                    getSiteRecordCount();
                }, 1000);
            },
            callback: function () {
                
                var $table = $.search.$activeTable();
                $('.edit-keyword-container', $table).editKeyword({
                    url: '/SalePlat/EbayListingQuickEditField'
                });



                $('table[id^="table-listing-"]:visible').fixThead();


            }
        });
        window.currentSearch = $.search;
           

        //结束刊登
        //只有在线的并且API操作状态不是处理中的记录才可以结束
        $('.bat-early-finish').batAction({
            filterMsg:'只有在线的并且API操作状态不是处理中的记录才可以结束',
            filter: function($checkbox) {
                var itemData = JSON.parse(unescape($checkbox.data('all')));
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

        //更新Listing
        //只有在线的并且API操作状态不是处理中的记录才可以更新
        $('.bat-update-listing').batAction({
            // filterMsg:'只有在线的并且API操作状态不是处理中的记录才可以更新',
            // filter: function ($checkbox) {
            //     var itemData = JSON.parse(unescape($checkbox.data('all')));
            //     return itemData.status === 'Online' && itemData.apiOperationStatus !== 'Processing';
            // },
            action: function ($checkboxs, btn) {
                $.confirm({
                    title: '确定要 更新 所选项吗？',
                    elm: btn,
                    callback: function () {
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
        //导出ITEM
        $('.bat-export-itemNo').batAction({
            action: function ($checkboxs, btn) {
                $.exportListData({
                    field: 'ebayItemId'
            }, $checkboxs);
            }
        });
        $('.bat-export-sku').batAction({
            action: function ($checkboxs, btn) {
                $.exportListData({
                    field: 'itemCode'
                }, $checkboxs);
            }
        });

        $('.bat-describe-template').batAction({
            action: function ($checkboxs) {
                var warehouseId = '',
                    siteId = '',
                    idList = [],
                    error = false;
                $checkboxs.each(function (i) {
                    var itemData = JSON.parse(unescape($(this).data('all')));
                    idList.push($(this).val());
                    if (i === 0) {
                        warehouseId = itemData.warehouseId;
                        siteId = itemData.siteId;
                    } else {
                        if (warehouseId !== itemData.warehouseId || siteId !== itemData.siteId) {
                            error = '批量设置描述需要同一仓库同一站点的Listing';
                            return false;
                        }
                    }
                });
                if (error) {
                    toastr.error(error, '错误');
                    return false;
                }

                var save = function () {
                    var me = this,
                        $checkbox = $('input[name="describe-template-id"]:checked'),
                        descriptionTemplateId = $checkbox.val(),
                        descTmplHtml = '<span class="label label-info label-sm margin-top-5 ellipsis" style="width:95px;" title="' + $checkbox.data('name') + '">模：' + $checkbox.data('name') + '</span>';
                    $.ajax({
                        url: '/SalePlat/BatchSetEbayListingDescriptionTemplate',
                        data: {
                            descriptionTemplateId: descriptionTemplateId,
                            idList: idList
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
                $.when($.getDescTemplateData(warehouseId, siteId)).then(function (descTemplateData) {
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
                                .handleUniform();
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
            }
        });

        $('.bat-remark-btn').batAddRemark({
            system: '',
            step: '',
            source: 'Listing',
            container: '.remark-container',
            tmpl: '#remark-tmpl'
        });
        $doc.on('click', '.item-mark-link', function () {
            $(this).addRemark({
                system: '',
                step: '',
                source: 'Listing',
                container: '.remark-container',
                tmpl: '#remark-tmpl'
            });
        });
        

        $('.bat-copy-list').batAction({
            action: function ($checkboxs) {
                var dataList = [];
                $checkboxs.each(function() {
                    var itemData = JSON.parse(unescape($(this).data('all')));
                    dataList.push(itemData);
                });
                copyList({ dataList: dataList });
            }
        });

        $('.bat-delete').batAction({
            action: function ($checkboxs, btn) {
                $.confirm({
                    title: '确定要删除选中的项吗(复制的且不在线可以删除)？',
                    elm: btn,
                    callback: function () {
                        console.log($checkboxs);
                    }
                });
            }
        });

        $('.bat-timing-publish').batAction({
            action: function ($checkboxs) {
                var html = $.templates('#timing-publish-tmpl').render({});
                dialog({
                    title: '定时刊登',
                    content: html,
                    skin: 'scroll',
                    width: 600,
                    height: 300,
                    onshow: function () {
                        $(this.node).handleUniform();
                        $.disableScroll();
                    },
                    onclose: function () {
                        $.enableScroll();
                    },
                    okValue: '保存',
                    ok: function () {
                        this.title('保存中...');
                        return false;
                    },
                    cancelValue: '取消',
                    cancel: true,
                }).showModal();
            }
        });

        $('.bat-del-timing').batAction({
            action: function ($checkboxs, btn) {
                $.confirm({
                    title: '确定要移除所选项的 定时刊登 吗？',
                    elm: $(btn).closest('.btn-group')[0],
                    callback: function () {
                        toastr['success']('已执行', '成功');
                    }
                });
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
            //     var itemData = JSON.parse(unescape($checkbox.data('all'))),
            //         $tr = $checkbox.closest('tr');
            //     return itemData.status !== 'Online' && (Number($('input[data-fieldname="price"]', $tr).val()) > 0 || itemData.itemType === 'VariationBundle') && itemData.apiOperationStatus !== 'Processing' && (itemData.saleStatus === 'OnShelf' || itemData.saleStatus === 'Clearance');
            // },
            action: function ($checkboxs) {
                var listingType = '',
                    idList = [],
                    error = false;
                $checkboxs.each(function (i) {
                    var itemData = JSON.parse(unescape($(this).data('all')));
                    idList.push($(this).val());
                    if (i === 0) {
                        listingType = itemData.listingType;
                    } else {
                        if (listingType !== itemData.listingType) {
                            error = '批量刊登需要同一种刊登方式';
                            return false;
                        }
                    }
                });
                if (error) {
                    toastr.error(error, '错误');
                    return false;
                }
                dialog({
                    title: '刊登',
                    content: $.templates('#publish-tmpl').render({ listingType: listingType }),
                    width: 550,
                    height: 350,
                    skin: 'scroll',
                    onshow: function () {
                        $(this.node).handleUniform();
                        $('form', this.node).validate({
                            rules: {
                                listingDuration: 'required',
                                listingQuantity: {
                                    digits: true,
                                    min: 1
                                }
                            },
                            messages: {
                                listingDuration: '请选择刊登天数',
                                listingQuantity: {
                                    digits: '刊登数量不正确',
                                    min: '刊登数量不正确'
                                }
                            }
                        });
                        $.disableScroll();
                    },
                    okValue: '保存',
                    ok: function () {
                        var me = this;
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
            }
        });

        $('.bat-transport-module').batAction({
            action: function ($checkboxs) {
                var warehouseId = '',
                    siteId = '',
                    idList = [],
                    error = false;
                $checkboxs.each(function (i) {
                    var itemData = JSON.parse(unescape($(this).data('all')));
                    idList.push($(this).val());
                    if (i === 0) {
                        warehouseId = itemData.warehouseId;
                        siteId = itemData.siteId;
                    } else {
                        if (warehouseId !== itemData.warehouseId || siteId !== itemData.siteId) {
                            error = '批量设置运输模块需要同一仓库同一站点的Listing';
                            return false;
                        }
                    }
                });
                if (error) {
                    toastr.error(error, '错误');
                    return false;
                }

                var save = function () {
                    var me = this;
                    var deliveryModuleId = $('input[name="transport-module-id"]:checked').val();
                    $.ajax({
                        url: '/SalePlat/BatchSetEbayListingDeliveryModule',
                        data: {
                            deliveryModuleId: deliveryModuleId,
                            idList:idList
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
                $.when($.getTransportModuleData(warehouseId, siteId)).then(function (transportModuleData) {
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
                                .handleUniform();
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
            }
        });

        $('.bat-match-data').batAction({ //批量匹配模块（描述模板，EBAY分类，店铺分类，运送模块，销售员等）
            action: function ($checkboxs,btn) {
                $.confirm({
                    title: 'Listing重新匹配所有规则（描述模板，EBAY分类，店铺分类，运送模块，销售员等）',
                    elm:btn,
                    callback: function() {
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

        //同步在线
        //可以同步的记录必须状态是在线的记录,并且API操作状态不能是处理中的。
        $('.bat-sync-online').batAction({
            filterMsg:'可以同步的记录必须状态是在线的记录,并且API操作状态不能是处理中的',
            filter: function ($checkbox) {
                var itemData = JSON.parse(unescape($checkbox.data('all')));
                return itemData.status === 'Online' && itemData.apiOperationStatus !== 'Processing';
            },
            action: function ($checkboxs, btn) {
                $.confirm({
                    title: '确定要同步选择的Listing吗？',
                    elm: btn,
                    callback: function () {
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
    };


    $doc.on('click', '.item-mark-link', function() { //添加备注
        $(this).addRemark({
            system: '',
            step: '',
            source: 'Listing',
            container: '.remark-container',
            tmpl: '#remark-tmpl'
        });
    }).on('click', '.prop-edit-panel', function() { //展示隐藏多属性子SKU
        var listingId = $(this).data('id');
        if (this.poaTr) {
            this.poaTr.isShown ? this.poaTr.close() : this.poaTr.show();
        } else {
            var $tr = $(this).parents('tr');
            this.poaTr = new POATr({
                handler: $(this),
                prevTr: $tr,
                trTmpl: $('#poa-template'),
                url: '/SalePlat/GetListingDetails',
                data: {
                    listingId: listingId
                },
                afterRender: function() {
                    $('.batch-setting-poa', $tr.next()).data('listingId', listingId);
                }
            });
        }
    }).on('click', '.batch-setting-poa', function () { //批量修改多属性子SKU数量及价格
        var html = $.templates('#batch-setting-poa-tmpl').render({}),
            $table = $(this).next('table'),
            me = this,
            listingId = $(me).data('listingId');
        dialog({
            title: '批量修改数量及价格',
            content: html,
            width: 200,
            height: 60,
            align: 'left',
            okValue: '保存',
            ok: function() {
                var count = $.trim($('input[name="count"]', this.node).val()),
                    price = $.trim($('input[name="price"]', this.node).val()),
                    d = this;
                if (!/^\d*$/.test(count) || !/^(\d+(.\d{1,2})?)?$/.test(price)) {
                    toastr.error('请输入正确的可售数量或价格', '错误');
                    return false;
                }
                if (count === '' && price === '') {
                    d.close().remove();
                    return;
                }
                $.ajax({
                    url: '/SalePlat/BatchSetEbayListingDetailPriceQuantity',
                    data: {
                        listingId: listingId,
                        price: price,
                        quantity: count
                    },
                    success: function(result) {
                        if (result.status === 'success') {
                            $('>tbody>tr', $table).each(function() {
                                if ($(this).hasClass('extend-tr')) return true;
                                $('input[name="count"]', this).val(count);
                                $('input[name="price"]', this).val(price);
                            });
                            $('idkey.prop-panel-' + listingId).each(function() {
                                this.poaTr && this.poaTr.getData();
                            });
                            d.close().remove();
                        } else {
                            $.publish('throwAjaxError', result.msg);
                        }
                    }
                });

                return false;
            },
            cancelValue: '取消',
            cancel: true,
        }).showModal(this);
    }).on('click', '.copy-btn', function() { //复制listing
        var itemData = JSON.parse(unescape($('input[type="checkbox"]:first', $(this).closest('tr')).data('all')));
        copyList({ dataList: [itemData] });
    }).on('click', '.eBay-category-search', function () { //选择eBay分类',
        var itemData = JSON.parse(unescape($(this).parents('tr').find('input[type="checkbox"]:first').data('all')));
        var url = '/SalePlat/eBayCategoriesPage?selectorId=' + this.id + '&siteId=' + itemData.siteId + '&keyword=' + itemData.Keyword;
        dialog({
            title: '选择eBay分类',
            url: url,
            id: 'eBay-category-dialog',
            fixed: true,
            onshow: function() {
                $.disableScroll();
            },
            onclose: function() {
                $.enableScroll();
            }
        }).showModal();
    }).on('click', '.store-category-search', function () { //选择店铺分类
        var itemData = JSON.parse(unescape($(this).parents('tr').find('input[type="checkbox"]:first').data('all')));
        var url = '/SalePlat/storeCategoriesPage?selectorId=' + this.id + '&AccountId=' + itemData.accountId;
        dialog({
            title: '选择店铺分类',
            url: url,
            id: 'store-category-dialog'
        }).showModal();
    }).on('click', '.show-item-cptr-btn', function() { //显示列表竞争对手
        var data = $(this).data();
        $.when($.getCptrData(data.id)).then(function () {
            //if ($.page.cptrData[data.id].dataList.length === 0) return;
            $.templates('#cptr-tmpl').link('.cptr-container-' + data.id, $.page.cptrData[data.id]).handleUniform().toggle();
        });
    }).on('change', '.is-default-cptr', function() { //设为主竞争对手
        var $tr = $(this).closest('tr'),
            listingId = $tr.data('listingid'),
            view = $.view($(this)),
            competitorId = view.data.competitorId,
            isPoa = $(this).closest('div.poa-cptr').length > 0, //是否多属性子SKU
            url = isPoa ? '/SalePlat/SetListingDetailPrimaryCompetitor' : '/SalePlat/SetListingPrimaryCompetitor',
            data = { competitorId: competitorId };
        data[isPoa ? 'listingDetailId' : 'listingId'] = listingId;

        $.ajax({
            url: url,
            data: data,
            success: function(result) {
                if (result.status === 'success') {
                    $('input.competitorEbayItemId-' + listingId).val(view.data.ebayItemId);
                    $('idkey.competitorBM-' + listingId).text(view.data.bm);
                    (isPoa ? $.page.poaCptrData[listingId] : $.page.cptrData[listingId]).dataList.forEach(function (item) {
                        if (item.competitorId === competitorId) {
                            $.observable(item).setProperty({
                                isPrimary: true
                            });
                        } else {
                            item.isPrimary && $.observable(item).setProperty({
                                isPrimary: false
                            });
                        }
                        
                    });
                    $('.cptr-container-' + listingId).handleUniform();
                } else {
                    $.publish('throwAjaxError', result.msg);
                }
            }
        });
    }).on('click', '.btn-refresh-cptr', function () { //刷新竞争对手
        var view = $.view($(this).closest('tr')),
            index = view.getIndex(),
            parentView = view.parent,
            competitorId = view.data.competitorId;
        $.ajax({
            url: '/SalePlat/SyncCompetitorEbayItem',
            data: { competitorId: competitorId },
            success: function (result) {
                if (result.status === 'success') {
                    var data = $.extend(view.data, result.data);
                    $.observable(parentView.data).remove(index);
                    $.observable(parentView.data).insert(index, data);
                    $(view.parentElem).handleUniform();
                } else {
                    $.publish('throwAjaxError', result.msg);
                }
            }
        });
    }).on('click', '.add-cptr-btn', function () { //添加竞争对手
        var me = this,
            listingId = $(this).data('listingid'),
            isPoa = $(this).closest('div.poa-cptr').length > 0;//是否多属性子SKU
        dialog({
            title: '添加eBay竞争对手',
            content: '<input type="text" class="cptr-itemno-input form-control" placeholder="请输入eBay Item No." />',
            skin: 'add-cptr-itemno-dialog',
            align: 'top',
            width: 200,
            height: '',
            quickClose: true,
            onshow: function () {
                var d = this;
                var $input = $('.cptr-itemno-input', this.node);
                $input.focus();
                $input.blur(function () {
                    var value = $.trim(this.value);
                    if (value && /^\d{8,}$/.test(value)) {
                        $.addCptr({
                            listingId: listingId,
                            competitorEbayItemId: value,
                            isPoa:isPoa
                        });
                    } else if (value) {
                        toastr.error('请输入正确的eBay Item No.', '错误');
                    }
                });
            }
        }).show(me);
    }).on('focus', 'input[data-field="competitorEbayItemId"]', function() { //主竞争对手编辑
        this.oldValue = $.trim(this.value);
    }).on('blur', 'input[data-field="competitorEbayItemId"]', function () {
        var value = $.trim(this.value),
            oldValue = this.oldValue,
            me = this,
            listingId = $(me).data('id'),
            isPoa = $(this).hasClass('poa-competitorEbayItemId');//是否多属性子SKU
        if (value === oldValue || value === '') {
            $(me).val(oldValue);
            return false;
        }
        $.addCptr({
            listingId: listingId,
            competitorEbayItemId: value,
            elm: me,
            pageEdit: true,
            isPoa:isPoa,
            callback: function (cptrData) {
                $('input.competitorEbayItemId-' + listingId).val(cptrData.ebayItemId);
                $('idkey.competitorBM-' + listingId).text(cptrData.bm);
            }
        });
    }).on('click', '.remove-cptr-btn', function() { //删除竞争对手
        var me = this,
            listingId = $(me).data('listingid'),
            view = $.view($(this)),
            isPoa = $(this).closest('div.poa-cptr').length > 0;//是否多属性子SKU
        $.confirm({
            title: '确定要删除此竞争对手吗',
            elm: this,
            callback: function() {
                $.ajax({
                    url: '/SalePlat/DeleteListingCompetitor',
                    data: {
                        listingCompetitorId: $(me).data('id')
                    },
                    success: function(result) {
                        if (result.status === 'success') {
                            if (view.data.isPrimary) {
                                $('input.competitorEbayItemId-' + listingId).val('');
                                $('idkey.competitorBM-' + listingId).text('');
                            }
                            $.observable(isPoa ? $.page.poaCptrData[listingId].dataList : $.page.cptrData[listingId].dataList).remove(view.getIndex());
                           
                        } else {
                            $.publish('throwAjaxError', result.msg);
                        }
                    }
                });
            }
        });
    }).on('click', '.show-poa-cptr-btn', function () { //显示多属性子SKU的竞争对手
        var data = $(this).data();
        $.when($.getPoaCptrData(data.id)).then(function () {
            $.templates('#cptr-tmpl').link($('.cptr-container-' + data.id), $.page.poaCptrData[data.id]).handleUniform().toggle();
        });
    }).on('focus', 'input[data-field="poa-competitorEbayItemId"]', function () { //多属性子SKU竞争对手编辑
        this.oldValue = $.trim(this.value);
    }).on('blur', 'input[data-field="poa-competitorEbayItemId"]', function () {
        var value = $.trim(this.value),
            oldValue = this.oldValue,
            me = this,
            listingId = $(me).data('id');
        if (value === oldValue || value === '') {
            $(me).val(oldValue);
            return false;
        }
        $.addCptr({
            listingId: listingId,
            competitorEbayItemId: value,
            elm: me,
            pageEdit: true,
            isPoa:true,
            callback: function (cptrData) {
                $('input.poa-competitorEbayItemId-' + listingId).val(cptrData.ebayItemId);
            }
        });
    });



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
                $('textarea', this.node).focus().blur(function() {
                    var newValue = $.trim($(this).val());
                    if (value === newValue || newValue === '') return;
                    if (newValue.length > 80) {
                        toastr.error('标题最多为<em><b>80</b></em>个字符，当前<em><b>' + newValue.length + '</b></em>个字符', '错误');
                        return false;
                    }
                    $.ajax({
                        url: '/SalePlat/EbayListingQuickEditField',
                        data: {
                            fieldName: fieldName,
                            id: id,
                            value: newValue
                        },
                        success: function(result) {
                            if (result.status === 'success') {
                                $(me).text(newValue);
                            } else {
                                $.publish('throwAjaxError', result.msg);
                            }
                        }
                    });
                }).keyup(function() {
                    var $len = $('.input-length', d.node),
                        length = $(this).val().length;
                    length > 80 ? $len.addClass('font-red') : $len.removeClass('font-red');
                    $len.text(length);

                });
            },
            onclose: function () {
                $('textarea', this.node).trigger('blur');
            }
        }).show(me);
    }).on('click', '.show-shippingfee-btn', function() { 
        var data = $(this).data();
        var html = $('#shippingfee-tmpl').render();
        $('#shippingfee-' + data.id).html(html).toggle();
    }).on('click', '.show-cptr-btn', function () {
        var data = $(this).data();
         var html = $('#cptr-tmpl').render();
         $('#cptr-container-' + data.id).html(html).toggle();

        $(this).closest('tr').next('.extend-tr').find('.cptr-container').toggle();
    }).on('click', '.btn-add-count', function() {
        //var itemData = JSON.parse(unescape($('input[type="checkbox"]:first', $(this).closest('tr.list-tr')).data('all')));
        var id = $(this).data('id'),
            url = '/SalePlat/SetEbayItemAutoReplenishQuantity',
            data = {
                listingId: id
            };
        if ($(this).hasClass('listing-detail')) {
            url = '/SalePlat/SetListingDetailAutoReplenishQuantity',
            data = {
                listingDetailId:id
            }
        }
        dialog({
            title: '是否自动补量',
            content: $('#add-count-tmpl').render({}),
            width: 150,
            height: 40,
            quickclose:true,
            onshow: function() {
                var me = this;
                $(this.node).on('click', '.btn', function () {
                    var autoReplenish = $(this).hasClass('add-count');
                    data.autoReplenish = autoReplenish;
                    $.ajax({
                        url: url,
                        data: data,
                        success: function(result) {
                            if (result.status === 'success') {
                                $('idkey.add-count-container-' + id).html(autoReplenish ? '<button class="btn btn-xs blue btn-add-count" title="自动补量" data-id="' + id + '">补</button>' : '<span class="btn btn-xs default text-through btn-add-count" title="非自动补量" data-id="' + id + '">补</span>');
                                me.close().remove();
                            } else {
                                $.publish('throwAjaxError', result.msg);
                            }
                        }
                    });
                   
                    
                });
            }

        }).showModal(this);
    }).on('change', '.is-default-cptr', function() {
        var me = this,
            itemData = $(this).data(),
            itemNo = $('.eBay-itemNo', $(this).closest('tr')).val();
        if (this.checked) {
            $('input[data-id="' + itemData.id + '"]').val(itemNo);
        }
    }).on('mouseenter', '.ebay-account-container', function () {
        var me = this;
        this.hideTimer && clearTimeout(this.hideTimer);
        this.showTimer = setTimeout(function () {
            $('.info-btn', me).fadeIn();
        }, 200);
    }).on('mouseleave', '.ebay-account-container', function () {
        var me = this;
        this.showTimer && clearTimeout(this.showTimer);
        this.hideTimer = setTimeout(function () {
            $('.info-btn', me).fadeOut();
        }, 500);
    }).on('click', '.ebay-account-container .info-btn', function() {
        dialog({
            content: $.templates('#ebay-account-detail-tmpl').render(),
            width:500,
            height: 350,
            skin:'scroll',
            quickClose: true,
        }).show($(this).parent()[0]);
        return false;
    });

});
