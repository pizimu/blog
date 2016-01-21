define(['jquery'],function(require,exports,module){
	$.page = $.page || {};
	window.doc = window.document;
	window.$doc = $(doc);

	$.extend(Array.prototype, {
        max: function() {
            return Math.max.apply({}, this);
        },
        min: function() {
            return Math.min.apply({}, this);
        },
        sum: function () {
            var pow = 0,
                total = 0;
            this.forEach(function(num) {
                var array = num.toString().split('.');
                array[1] && (pow = array[1].length > pow ? array[1].length : pow);
            });
            pow = Math.pow(10, pow);
            this.forEach(function (num) {
                total += num * pow;
            });
            return Math.round(total) / pow;
        }
    });

    $.log = function () {
        if (!window.console) {
            window.console = {};
            console.log = function () { /* do something */ };
        }
        console.log.apply(console, arguments);
    };

    $.insertText = function (textValue, $elm) {
        //Get textArea HTML control
        $elm.each(function () {
            var txtArea = this;
            //IE
            if (document.selection) {
                txtArea.focus();
                var sel = document.selection.createRange();
                sel.text = textValue;
                return;
            }
                //Firefox, chrome, mozilla
            else if (txtArea.selectionStart || txtArea.selectionStart == '0') {
                var startPos = txtArea.selectionStart;
                var endPos = txtArea.selectionEnd;
                var scrollTop = txtArea.scrollTop;
                txtArea.value = txtArea.value.substring(0, startPos) + textValue + txtArea.value.substring(endPos, txtArea.value.length);
                txtArea.focus();
                txtArea.selectionStart = startPos + textValue.length;
                txtArea.selectionEnd = startPos + textValue.length;
            }
            else {
                txtArea.value += textArea.value;
                txtArea.focus();
            }
        });
    };

    /*格式化数字格式
     * value: Number || String 
     * preciseFigures: Number
     * default: Number || String 
     */
    $.toFixed = function (value, preciseFigures, def) {
        if (value === '') {
            return '';
        }
        if (value === null || value === undefined) {
            return def === undefined ? '--' : '';
        }
        value = Number(value);
        preciseFigures = /^\d?$/.test(preciseFigures) ? preciseFigures : 2;
        if (isNaN(value)) {
            return def === undefined ? '--' : '';
        }
        return value.toFixed(preciseFigures);
    };

    $.hash = function () {
        var action = {
            "set": function () {
                var hashObj = $.queryToObject($.hash());
                if (arguments.length === 1) {
                    var myObj = arguments[0];
                    if (typeof myObj === 'object') {
                        hashObj = $.extend(hashObj, myObj);
                    }
                } else {
                    var key = arguments[0], val = arguments[1];
                    hashObj[key] = val;
                }
                $.hash(hashObj);
            },
            "get": function (key) {
                var hashObj = $.queryToObject($.hash());
                return hashObj[key];
            },
            "remove": function (key) {
                var hashObj = $.queryToObject($.hash());
                delete hashObj[key];
                $.hash(hashObj);
            }
        };
        switch (arguments.length) {
            case 0:
                return window.location.hash.replace(/^[^#]*#?(.*)$/, '$1');
            case 1:
                var hash = arguments[0];
                if (typeof hash == 'string') {
                    hash.charAt(0) == '#' ? window.location.hash = hash : window.location.hash = '#' + hash;
                }
                if (typeof hash == 'object') {
                    window.location.hash = '#' + $.param(hash);
                }
                break;
            case 2:
                return action[arguments[0]](arguments[1]);
            case 3:
                action[arguments[0]](arguments[1], arguments[2]);
                break;
            default:
                break;
        }
    };

    $.queryToObject = function ( /*String*/str) {
        var dec = decodeURIComponent, qp = str.split("&"), ret = {}, name, val;
        for (var i = 0, l = qp.length, item; i < l; ++i) {
            item = qp[i];
            if (item.length) {
                var s = item.indexOf("=");
                if (s < 0) {
                    name = dec(item);
                    val = "";
                } else {
                    name = dec(item.slice(0, s));
                    try {
                        val = dec(item.slice(s + 1));
                        if (name === 'searchKeyword') {
                            val = escape(decodeURIComponent(val));
                        }
                    } catch (e) {
                        val = item.slice(s + 1);
                    }
                }

                if (typeof ret[name] == "string") { // inline'd type check
                    ret[name] = [ret[name]];
                }

                if ($.isArray(ret[name])) {
                    ret[name].push(val);
                } else {
                    ret[name] = val;
                }
            }
        }
        return ret; // Object
    };

    /*
       字符串双编码与双解码
       参数：1 string
   */
    $.doubleEncode = function (string) {
        return escape(encodeURIComponent(string));
    };
    $.doubleDecode = function (string) {
        return decodeURIComponent(unescape(string));
    };
	
    //remove duplicate items in the array
    $.getUniqueArray = function(array){
        var newArray = [];
        array.forEach(function(item){
            newArray.indexOf(item) === -1 && newArray.push(item);
        });
        return newArray;
    };

    $.addRemark = function(opts){
        opts = $.extend({
            url:'', //interface url
            callback:null,
            id:[],
            source:'',//the place of remark
            content:'' //remark content
        },opts);
        opts.id = [].concat(opts.id);//id must be Array

        console.log('save remark and callback');
        opts.callback && opts.callback();
        return;

        $.ajax({
            url:opts.url,
            data:{
                id:opts.id,
                source:opts.source,
                content:opts.content
            },
            success:function(result){
                if(result.status === 'success'){
                    opts.callback && opts.callback();
                }else{
                    $.publish('throwAjaxError',result.msg);
                }
            }
        });
    }; 

    /*options:{
        id: string || array

        field:string || undefined
        tmpl:string || undefined,
        container:selector prefix (class || id || other) add '-id' with it,
        selectorTag:tr || checkbox
    }*/
    $.getRemark = function(opts){
        opts = $.extend({
            selectorTag:'checkbox'
        },opts);
        opts.id = [].concat(opts.id);//id must be Array
        var renderTr = function(item){
                return '<tr class="remark-tr remark-' + item.id + '">' + 
                       '    <td colspan="99"></td>' + 
                       '</tr>';
            },
            renderTmpl = function(item){
                return '<div class="remark-info">' +
                       '    <span class="label label-xs label-danger">注：</span>' + 
                       '    <span class="list-item-remark">' + 
                       '        <code><strong>' + item.source + '[' + item.notesCount + ']' + '</strong></code>' + 
                       '        <a href="javascript:;" class="item-mark-link" data-id="' + item.id + '">' + item.content + '</a>' + 
                       '        <i>' + item.creatorName + '&nbsp;' + item.createDate + '</i>' + 
                       '    </span>' +
                       '</div>';
            },
            render = function(data){
                data.dataList.forEach(function(item){
                    var trHtml = renderTr(item),
                        remarkHtml = opts.tmpl ? $.templates(opts.tmpl).remder(item) : renderTmpl(item),
                        $remarkTr,
                        $tr,//the main record tr
                        $firstTd,
                        rowspan;
                    if(opts.container){
                        $(opts.container + '-' + item.id).each(function(){
                            var $info = $('.remark-info',this).length;
                            if($info.length > 0){
                                $(remarkHtml).replaceAll($('.remark-info',this));
                            }else{
                                $(this).append(remarkHtml);
                            }
                        });                        
                    }else{
                        $remarkTr = $('tr.remark-' + item.id);
                        if($remarkTr.length){
                            $(remarkHtml).replaceAll($('.remark-info',$remarkTr));
                        }else{
                            switch(opts.selectorTag){
                                case 'tr':
                                    $tr = $('tr.tr-' + item.id);
                                    break;
                                case 'checkbox':
                                    if(opts.field){
                                        $tr = $('input[type="checkbox"][data-' + opts.field.toLowerCase() + '="' + item.id + '"]').closest('tr');
                                    }else{
                                        $tr = $('input[type="checkbox"][value="' + item.id + '"]').closest('tr');
                                    }
                                    break;
                            }
                            $firstTd = $tr.find('td.first');
                            rowspan = $firstTd.attr('rowspan') ? (Number($firstTd.attr('rowspan')) + 1) : 2;
                            $firstTd.attr('rowspan',rowspan);
                            if(rowspan > 2){
                                $tr.nextAll().eq(rowspan-3).after($remarkTr);
                            }else{
                                $tr.after($remarkTr);
                            }
                        }
                        $remarkTr.show();
                    }
                });
                opts.callback && opts.callback();
            };
        $.ajax({
            url:'/hardcode/remark.json',
            data:{
                id:opts.id
            },
            success:function(result){
                if(result.status === 'success'){
                    render(result.data);
                }else{
                    $.publish('throwAjaxError',result.msg);
                }
            }
        });
    };

	/***************************************************************  $.publish $.subscribe  **************************************************************/
    /*
     * https://github.com/cowboy/jquery-tiny-pubsub
     * 
     */
    (function () {
        var o = $({});

        $.subscribe = function () {
            o.on.apply(o, arguments);
        };

        $.unsubscribe = function () {
            o.off.apply(o, arguments);
        };

        $.publish = function () {
            o.trigger.apply(o, arguments);
        };
    })();

    $.subscribe('refreshDataList', function (_, search) {
        if (search) {
            if (search === window.top.$.search || search === window.top.currentSearch) {
                search.getCondition();
            } else {
                var $tab = $(search.options.container);
                var $subTabs = $('.nav-tabs > li[data-filter]', $tab);
                $('a[href="' + search.options.container + '"]').closest('li')[0].needRefresh = true;
                if ($subTabs.length) {
                    var $currTab = $subTabs.filter('[data-value="' + $('.nav-tabs > li.active[data-filter]', window.top.currentSearch.options.container).data('value') + '"]');
                    $currTab[0].needRefresh = true;
                }
            }
        }
    });
    $.refreshDataList = function () {
        $.publish('refreshDataList', [$.search || window.currentSearch]);
    };

    $.subscribe('throwAjaxError', function (_, obj, callback) {
        var objError = function () {
            switch (Number(this.errCode)) {
                case 1:
                case 2:
                case 3:
                    window.top.$.login(this);
                    break;
                default:
                    window.top.toastr.error('未指定错误：' + JSON.sringify(this), '错误');
            }
        };
        switch ($.type(obj)) {
            case 'object':
                objError.call(obj);
                break;
            default:
                window.top.toastr['error'](obj, '错误');
        }
        callback && callback();
    });

    var loading = function () {
        var count = 0;
        return function (status) {
            //var loadingHtml = '<div class="background-mask" id="background-mask"></div><div id="loading-animation"><div id="loading-center"><div id="loading-center-absolute"><div class="object" id="object_four"></div><div class="object" id="object_three"></div><div class="object" id="object_two"></div><div class="object" id="object_one"></div></div></div></div>';
            var loadingHtml = '<div class="background-mask" id="background-mask"></div><div class="page-spinner-bar" id="loading-animation"> <div class="bounce1"></div>      <div class="bounce2"></div>      <div class="bounce3"></div>    </div>';
            if (window.top.$('#loading-animation').length === 0) {
                window.top.$('body').append(loadingHtml);
            }
            status ? count++ : count--;
            if (count < 0) count = 0;
            if (!count) {
                window.top.$('#loading-animation, #background-mask').hide();
                //window.top.$('.page-container,.page-header').removeClass('super-blur');
            } else {
                window.top.$('#loading-animation, #background-mask').show();
                //window.top.$('.page-container,.page-header').addClass('super-blur');
            }
        };
    };
    $.loading = loading();
    $.subscribe('loading', function (_, status) {
        return $.loading(status);
    });

    $.subscribe('syncListItem', function (_, selector, options) {
        options = $.extend({
            extendData: {},
            tmpl: '#list-tr',
            callback: false
        }, options);

        var $tr = selector.tagName === 'TR' ? $(selector) : $(selector).closest('tr'),
            $checkbox = $('input[type="checkbox"],input[type="radio"]', $tr).eq(0),
            listData = $.extend(JSON.parse(unescape($checkbox.data('all'))), options.extendData),
            checked = $checkbox[0].checked,
            $tmpl = $('<div />').html($.templates(options.tmpl).render({ dataList: [listData] })),
            $newTr = $tmpl.find('> tr:first')
                .find('input[type="checkbox"]:first')
                .prop('checked', checked).end()
                .handleUniform();
        $('>td:first', $newTr).attr('rowspan', $('>td:first', $tr).attr('rowspan'));
        $tr.replaceWith($newTr);
        options.callback && options.callback();
    });

    /******************* $.comfirm *********************************/
    $.confirm = function(options) {
        var dialogOption = {//reference the options of artDialog
            title: '请确认：',
            content: options.content, //msg
            width: options.width || 200, //dialog width
            height: options.height || '', //dialog height
            onshow: function() {}, // init default event
            ok: function() { // do something when click button ok
                if (options.callback) options.callback();
            },
            okValue: '确认', //the title of buttton ok
            cancel: function() {}, //init default event
            cancelValue: '取消' //the title of button cancel
        };
        options.align && (dialogOption.align = options.align); //the dialog show position
        var confirmDialog = dialog(dialogOption);
        if (options.elm) {
            confirmDialog.showModal(options.elm);
        } else {
            confirmDialog.showModal();
        }
    };

    /*************  获取选中有项的字段。field为空，直接拿取checkboxs的value的数组,否则，返回field字段值的数组*********************/
    $.getCheckedValue = function($checkboxs,field){
        var arrValue = [];
        [].forEach.call($checkboxs,function(elm){
            arrValue.push(field ? JSON.parse(unescape($(elm).data('all') || $(elm).closest('tr').data('all')))[field] : elm.value);
        });
        return arrValue;
    };

    //export list field,like sku,spu,item#  use batAction.$checkboxs。Remove the duplicate
    $.exportListData = function(opts,$checkboxs){
        // opts = $.extend({
        //     field:fn || string // fn:return field value array, string:field key
        // },opts);
        var data = [];
        $.each($checkboxs,function(){
            var itemData = JSON.parse(unescape($(this).data('all') || $(this).closest('tr').data('all')));
            switch(typeof opts.field){
                case 'string':
                    data.push(itemData[opts.field]);
                    break;
                case 'function':
                    data = data.concat(opts.field(itemData));
                    break;
            }
        });
        data = $.getUniqueArray(data); // remove duplicate
        data.forEach(function(item,i){ // remove empty
            (item === '' || item === undefined || item === null) && data.splice(i,1);
        });
        dialog({
            title:opts.title || '导出',
            content:'<textarea style="width:100%;" rows="15">' + data.join() + '</textarea>',
            width:500,
            height:320,
            cancelValue:'关闭',
            cancel:true
        }).showModal();

    };

    //建立一個可存取到該file的url
    $.getObjectURL = function (file) {
        try {
            var url = null;
            if (window.createObjectURL != undefined) { // basic
                url = window.createObjectURL(file);
            } else if (window.URL != undefined) { // mozilla(firefox)
                url = window.URL.createObjectURL(file);
            } else if (window.webkitURL != undefined) { // webkit or chrome
                url = window.webkitURL.createObjectURL(file);
            }
            return url;
        } catch (e) {
            return '';
        }
    }

    $.getScrollbarWidth = function () {
        var oP = document.createElement('p'),
            styles = {
                width: '100px',
                height: '100px',
                overflowY: 'scroll'
            },
            i,
            scrollbarWidth;
        for (i in styles) oP.style[i] = styles[i];
        document.body.appendChild(oP);
        scrollbarWidth = oP.offsetWidth - oP.clientWidth;
        oP.remove();
        return scrollbarWidth;
    };

    $.disableScroll = function () {
        if (!$('#window-lock-style').length) {
            $("<style type='text/css' id='window-lock-style'>.window-lock{margin-right:" + $.getScrollbarWidth() + "px;}</style>").appendTo("head");
        }
        if ($(window).scrollTop() == 0) {
            return;
        }
        $('html').addClass('window-lock');
        return;
        if (window.addEventListener) {
            window.addEventListener('DOMMouseScroll', wheel, false);
        }
        window.onmousewheel = document.onmousewheel = wheel;
        document.onkeydown = keydown;
    };

    $.enableScroll = function () {
        $('html').removeClass('window-lock');
        return;
        if (window.removeEventListener) {
            window.removeEventListener('DOMMouseScroll', wheel, false);
        }
        window.onmousewheel = document.onmousewheel = document.onkeydown = null;
    };

    /***************************** toastr default option ***********************************/
    window.toastr && (toastr.options = {
        "closeButton": true,
        "debug": false,
        "positionClass": "toast-top-center",
        "onclick": null,
        "showDuration": "1000",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    });

    //针对后端返回的 /Date(47513233)/ 格式日期做的转换
    $.parseDate = function (str, formatStr) {
        var date = false;
        try {
            date = new Date(Number(str.match(/\d+/)[0]));
        }
        catch (e) {
            console.log(e);
        }
        return date ? date.Format(formatStr) : '';
    };
    Date.prototype.Format = function (formatStr) {
        var str = formatStr;
        var week = ['日', '一', '二', '三', '四', '五', '六'];
        str = str.replace(/yyyy|YYYY/, this.getFullYear());
        str = str.replace(/yy|YY/, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));
        str = str.replace(/MM/, (this.getMonth() + 1) > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
        str = str.replace(/M/g, (this.getMonth() + 1));
        str = str.replace(/w|W/g, week[this.getDay()]);
        str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
        str = str.replace(/d|D/g, this.getDate());
        str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
        str = str.replace(/h|H/g, this.getHours());
        str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
        str = str.replace(/m/g, this.getMinutes());
        str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
        str = str.replace(/s|S/g, this.getSeconds());
        return str;
    }


    /*
     * 
     * 设置 ajax loading 效果， 如果ajax能在 500 毫秒内快速完成，则不显示loading， 否则显示loading效果。
     */

    $.ajaxSetup({
        global: true,
        //type: 'POST',
        type: 'get',
        dataType: 'json',
        processData: false,
        contentType: 'application/json',
        timeout: 1800000,
        //timeout: 6000,
        error: function (xhr, textStatus, errorThrown) {
            if (this.loadingTimer) {
                clearTimeout(this.loadingTimer);
            }
            this.loading && $.publish('loading', 0);
            if (xhr.readyState == 0) {
                return;
            }
            switch (textStatus) {
                case 'abort':
                    break;
                case 'parsererror':
                    window.top.toastr.error('parsererror：' + errorThrown, '错误');
                    break;
                default:
                    window.top.toastr.error(textStatus + '：' + (xhr.responseText || errorThrown), '错误');
            }
        },
        beforeSend: function () {
            var me = this;
            this.url = '/project/erp' + this.url;
            this.data = JSON.stringify(this.data);
            this.loadingTimer = setTimeout(function () {
                me.loading = function () {
                    $.publish('loading', 1);
                };
                me.loading();
            }, 50);
        },
        complete: function () {
            if (this.loadingTimer) {
                clearTimeout(this.loadingTimer);
            }
            this.loading && $.publish('loading', 0);
        }
    });

    /***************************** toastr default option ***********************************/
    window.toastr && (toastr.options = {
        "closeButton": true,
        "debug": false,
        "positionClass": "toast-top-center",
        "onclick": null,
        "showDuration": "1000",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    });

    /*********************** $.views *************************************/
    $.views && $.views.tags({
        stringify:function(data){
            return escape(JSON.stringify(data));
        },
        listThumb: function (thumbUrl) {
            if ($.trim(thumbUrl) !== '') {
                return ' background-image: url(' + thumbUrl + '); background-color:#f6f6f6;';
            } else {
                return '';
            }
        }
    });

    /************************ dialog default *************************************************/
    $(function(){
        dialog &&  $.extend(dialog.defaults, {
            width: $(window).width() * .9,
            height: $(window).height() * .8 - 54,
            onshow: function () {
                $.disableScroll();
            },
            onclose: function () {
                $.enableScroll();
            }
        });
    });


    /*
     * 响应式弹出对话框或是做 ajax请求。默认页面已经绑定[data-ajax] [data-dialog]
     * 如需确认框，则给调用元素添加 [data-confirm='{"content": "title content"}']
     * 
     * 用法： <a href="javascript:;" data-ajax="/Products/SettingSkuPrice" data-confirm='{"content":"确定要删除吗？"}'>删除</a>
     *        <a href="javascript:;" data-dialog="/Products/SettingSkuPrice" data-width="465" data-height="300" data-title="降价" data-modal="true">降价</a>
     * 
     */
     (function(){
        var ajaxAction = function(data){
                var confirmData,
                    active = function(){
                        window.top.toastr.success('已执行');
                        return;
                        $.ajax({
                            url:data.ajax,
                            data:data.postdata || {},
                            success:function(result){
                                if(result.status === 'success'){
                                    opts.callback && Function('!' + opts.callback + '()')();
                                }else{
                                    $.publish('throwAjaxError',result.msg);
                                }

                            }
                        });
                    }
                if(data.postdata){
                    try{
                        data.postdata = JSON.parse(data.postdata)
                    }catch(e){
                        throw new SyntaxError('字符串格式不正确：' + e);
                    }
                }
                if(data.confirm){
                    confirmData = typeof data.confirm === 'string' ? JSON.parse(data.confirm) : data.confirm;
                    $.confirm({
                        content:confirmData.content,
                        callback:function(){
                            active(data);
                        }
                    });
                }else{
                    active(data);
                }
            },

            dialogAction = function(data){
                data = $.extend({
                    width:0.9,
                    height:0.8,
                    modal:true
                },data);
                if(data.containerId){
                    data.content = $('#' + data.containerId).html();
                }else{
                    data.url = data.dialog;
                }
                data.title.length > 60 && (data.title.substr(0,60) + '...');
                if(data.scroll){
                    data.skin = 'scroll';
                }
                //when width or height is decimals,format it to be px;
                if (data.width && /^(0?\.)\d*$/.test(data.width)) {
                    data.width = $(data.align ? window : window.top).width() * data.width;
                }
                if (data.height && /^(0?\.)\d*$/.test(data.height)) {
                    data.height = $(data.align ? window : window.top).height() * data.height;
                }
                if(data.align){
                    data.modal ? dialog(data).showModal(data.trigger) : dialog(data).show(data.trigger);
                }else{
                    data.modal ? window.top.dialog(data).showModal() : window.top.dialog(data).show();
                }
            };
            $doc.on('click','[data-ajax]',function(){
                var data = $(this).data();
                //if(data.ajax === ''){return;}
                //data.trigger = this;
                ajaxAction(data);
            }).on('click','[data-dialog]',function(){
                var data = $(this).data();
                data.trigger = this;
                dialogAction(data);
            });

     })();

    $.extend($.fn,{
        //edit ebaylisting keyword
        editKeyword: function (options) {
            $doc.on('mouseenter', this.selector, function () {
                this.timer && clearTimeout(this.timer);
                $(this).find('.edit-keyword').fadeIn();
            }).on('mouseleave', this.selector, function () {
                var me = this;
                this.timer = setTimeout(function () {
                    $(me).find('.edit-keyword').fadeOut();
                }, 500);
            });
            return this.each(function () {
                var me = this,
                    data = $(this).data();
                $('.edit-keyword', this).click(function () {
                    var value = [], d;
                    $('.keyword-list>a', me).each(function () {
                        value.push($.trim($(this).text()));
                    });
                    value = value.join(',');
                    d = dialog({
                        content: '<textarea>' + value + '</textarea>',
                        skin: 'edit-keyword-dialog',
                        width: '',
                        height: '',
                        align: 'bottom left',
                        quickClose: true,
                        onshow: function () {
                            $('textarea', this.node).focus()
                                .blur(function () {
                                    d.open && d.close().remove();
                                });
                        },
                        onclose: function () {
                            var newValue = $.trim($('textarea', this.node).val());
                            if (value === newValue) return;
                            toastr.success('这里执行ajax请求','操作');
                            var arrKeyword = newValue.split(',');
                            var html = '';
                            for (var i = 0, j = arrKeyword.length; i < j; i++) {
                                html += '<a href="javascript:;" target="_blank">' + arrKeyword[i] + '</a>&nbsp;';
                            }
                            $('.keyword-list', '.keyword-container-' + data.id).html(html);
                           
                        }
                    }).show(me);
                });
            });
        },
        //checkbox,radio format style
        uniform:function(){
            return this.each(function(){
                var $checkbox = $('input[type="checkbox"],input[type="radio"]',this);
                $checkbox.each(function(){
                    var label = this.parentNode;
                    if(label.tagName !== 'LABEL'){
                        $(this).wrap('<label class="' + (this.type === 'radio' ? 'radio' : 'checker') + '" />');
                    }
                    label.classList.add(this.type === 'radio' ? 'radio' : 'checker');
                    label = this.parentNode;
                    label.classList[this.checked ? 'add' : 'remove']('checked');
                    label.classList[this.disabled ? 'add' : 'remove']('disabled');
                });
            });
        },
        //check all checkbox
        checkAllTableList: function (opts) {
            opts = $.extend({
                container: 'table'
            }, opts);
            $(this).bind('click', function () {
                var $container = $.type(opts.container) === 'object' ? opts.container : $(this).closest(opts.container),
                    $label = $container.find('tbody>tr>td:nth-child(1) .checker');
                if ($container[0].tagName === 'TABLE') {
                    $label = $('>tbody > tr > td:nth-child(1) .checker', $container);
                }

                $label = $label.filter(function() { return !$('input[type="checkbox"]', this).is(':disabled'); });
                if (this.checked) {
                    $label.addClass('checked').find('input[type="checkbox"]').prop('checked', true);
                } else {
                    $label.removeClass('checked').find('input[type="checkbox"]').prop('checked', false);
                }

            });
        },
        batAction:function(opts){
            var batErr;
            opts = $.extend({
                //container:'table'/*selector or String*/, // the container for checkboxs
                filterMsg:''/*String*/,// when operating records all do not conform to execute,throw this msg 
                filter:false/*Function($elm)*/, // selected in accoradance records
                field:'' /*String*/ // the field whitch pass to after-end
            },opts);
            $(this).click(function(){
                var me = this,
                    $container = $.type(opts.container) === 'object' ? opts.container : $(this).closest(opts.container),
                    table,
                    $checkboxs,
                    $unchkedboxs,
                    batErr;
                if($container.length){
                    table = $container[0];
                }else{
                    switch(true){
                        case $(me).parents('td').length > 0:
                            table = $('table',$(me).closest('td'));
                            break;
                        case $(me).parents('.tab-pane').length > 0:
                            table = $('table',$(me).closest('.tab-pane'))[0];
                            break;
                        default:
                            table = $('table',$(me).closest('.page-content'))[0];
                    }
                }
                $checkboxs = $('>tbody>tr>td:first-child .checker input[type="checkbox"]:checked',table);
                if(!$checkboxs.length){
                    batErr = toastr.error('请至少选择一项进行操作。','错误');
                    return;
                }
                $('>tbody>tr>td:first-child .warning',table).remove();
                if(opts.filter){
                    $unchkedboxs = $checkboxs.filter(function(){
                        var $this = $(this),
                            $warning = $('.warning',$this.closest('td'));
                        if(!opts.filter($this)){
                            if(!$warning.length){
                                $warning = $('<div class="text-warning warning" title="该记录不符合执行 ' + $(me).text() + ' 操作"><i class="glyphicon glyphicon-warning-sign"></i></div>');
                                $this.closest('td').append($warning);
                            }
                            setTimeout(function () {
                                $warning.remove();
                            }, 10000);
                            return true;
                        }else{
                            return false;
                        }
                    });
                    if($unchkedboxs.length){
                        batErr = toastr.error(opts.filterMsg || '所选项中有不符合当前操作的记录项。','错误');
                        return;
                    }
                }
                batErr && $(batErr).remove();
                opts.action && opts.action($checkboxs,this);
            });
        },
        checkTitle: function (options) {
            options = $.extend({
                required: true,
                equalToData: false //string 与data()相比较的原始值 example:<input data-default='old value' />
            }, options);
            return this.each(function () {
                $(this).keyup(function () {
                    var $group = $(this).closest('.input-group'),
                        $container = $group.parent(),
                        $errMsg = $('.help-block-error', $container),                        
                        $max = $('.max-length', $group),
                        value = $.trim(this.value),
                        $length = $('.input-length', $group).text(value.length),
                        errMsg = false;
                    switch (true) {
                        case options.required && value === '':
                            errMsg = '标题不能为空';
                            break;
                        case Number($length.text()) > Number($max.text()):
                            errMsg = '标题长度超过最大限度';
                            break;
                        case options.equalToData !== false:
                            if (typeof options.equalToData === 'string') {
                                if (value === $.trim($(this).data()[options.equalToData])) {
                                    errMsg = '新的标题不能与原始标题相同';
                                }
                            } else if(typeof options.equalToData === 'function'){
                                errMsg = options.equalToData();
                            }else{
                            }
                            break;
                    }
                    if (errMsg) {
                        $container.addClass('has-error');
                        if ($errMsg.length) {
                            $errMsg.html(errMsg).show();
                        } else {
                            $container.append('<div class="help-block help-block-error">' + errMsg + '</div>');
                        }
                    } else {
                        $container.removeClass('has-error');
                        $('.help-block-error', $container).html('').hide();
                    }
                }).trigger('keyup');
            });
        },
        batAddRemark:function(opts){
            opts = $.extend({
                content:'',
                field:undefined, // related field for remark to save record
                container:undefined,
                tmpl:undefined, //the tmpl for show remark
                batAction:undefined // options in $.fn.batAction
            },opts);
            var html = '<div class="chat-form bat-remark-container">' + 
                       '    <div class="input-content">' + 
                       '        <textarea rows="3" class="form-control remark-content" placeholder="请输入备注..."></textarea>' + 
                       '    </div>' + 
                       '</div>';
            return this.each(function(){
                $(this).batAction($.extend({
                    action:function($checkboxs,btn){
                        dialog({
                            title:'备注',
                            content:html,
                            width:500,
                            height:130,
                            okValue:'确定',
                            ok:function(){
                                var d = this,
                                    textContent = $.trim($('textarea',d.node).val()),
                                    idList;
                                if(textContent === ''){
                                    toastr.error('请填写备注','错误');
                                    return false;
                                }
                                idList = $.getCheckedValue($checkboxs,opts.filed);
                                $.addRemark({
                                    source:opts.source,
                                    content:textContent,
                                    id:idList,
                                    callback:function(){
                                        $.getRemark({
                                            id:idList,
                                            field:opts.field,
                                            container:opts.container,
                                            tmpl:opts.tmpl
                                        });
                                        d.close().remove();
                                    }
                                });
                            },
                            cancelValue:'取消',
                            cancel:true
                        }).showModal(btn);
                    }
                },opts.batAction || {}));
            });
        },
        addRemark:function(opts){
            opts = $.extend({
                container:undefined,
                tmpl:undefined,
                width:483,
                height:400
            },opts);
            return this.each(function(){
                var data = $(this).data(),
                    dialogOpts = {
                        title:'备注',
                        //url:'/view/remark/remark.html#id=' + data.id,
                        url:'view/remark/remark.html#id=' + data.id,
                        width:opts.width,
                        height:opts.height,
                        id:'item-remark-dialog',
                        align:'right'
                    },
                    d;
                if(opts.container){dialogOpts.url += opts.container;}
                if(opts.tmpl){dialog.url += '&tmpl=' + opts.tmpl.replace(/#/g,'%23');}
                if($(this).width() > 400) {delete dialogOpts.align;}
                d = dialog(dialogOpts)
                        .show($(this).closest('ul').hasClass('dropdown-menu') ? $(this).closest('ul').parent()[0] : this);
                d.data = opts;
            });
        }
    });

});