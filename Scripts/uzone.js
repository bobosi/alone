if (window['uzone'] == undefined) { uzone = {}; }
//实时数据
uzone.rtdb = {
    //实时数据链接，页面指定
    readtimeUrl: '',
    //历史数据链接，页面指定
    historyUrl: '',
    //创建新的实时数据库实例
    createNew: function () {
        return {
            //数据
            data: null,
            //名称
            keys: {},
            //数据的时间戳
            stamp: null,
            //更新数据，若date为空则查询当前数据，否则查询由date指定的历史数据
            update: function (date) {
                ////测试代码////
                if (date) {
                    //查询历史
                    this.stamp = date;
                } else {
                    //查询实时
                    this.stamp = new moment();
                }
                this.data = {
                    var01: { "value": Math.random() > 0.5, "quality": 192, "stamp": "2016-10-10T10:01:34.9945307+08:00", "dataType": 3 },
                    var02: { "value": Math.random() > 0.5, "quality": 192, "stamp": "2016-10-10T10:01:34.9945307+08:00", "dataType": 3 },
                    var03: { "value": Math.round(Math.random() * 100), "quality": 192, "stamp": "2016-10-10T10:01:32.8819007+08:00", "dataType": 11 },
                    var04: { "value": new Date() },
                    var05: { "value": new Date().toString() },
                    TRCMD_CMS: { "value": Math.random() > 0.5, },
                    TPOS_CMS: { "value": Math.round(Math.random() * 1000), "quality": 192, "stamp": "2016-10-10T10:01:32.8819007+08:00", "dataType": 11 },
                };
                ////测试代码////

                //todo,加入和后台交互的代码
                var list = [];
                for (var key in this.keys) {
                    list.push(key);
                }
            },

            //获取data内指定名称变量的值，若无此变量或quality异常则返回undefine
            getValue: function (name) {
                try {
                    var v = this.data[name];
                    if (v) { this.keys[name] = null; }
                    if (v != undefined && (v.quality == undefined || v.quality > 0)) { return v.value; }
                    return undefined;
                }
                catch (e) { return undefined; }
            },
            //设置指定名称的数据值
            setValue: function (name, value) {
                //todo,加入和后台交互的代码
            },
        };
    }
};

//报警
uzone.alarm = {
    //获取实时故障
    getActiveAlarms: function (url) {
        var result = [];
        for (var i = 0; i < 100; i++) {
            result.push({ name: 'Alarm' + i, id: 100 - i, device: 'RTG' + i, desc: new Date() })
        }
        return result;
    },
    //获取历史故障
    getHistoryAlarms: function (url, startTime, endTime, filter) {
    }
};

//辅助方法集合
uzone.helper = {
    //根据名称获取查询字
    getQueryValue: function (name, url) {
        if (!url) { url = window.location.href; }
        name = name.replace(/[\[\]]/g, "\\$&");
        var results = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)").exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
};