//数字格式化过滤器
Vue.filter('numeral', function (value, format) {
    if (value == undefined || value == null || isNaN(value)) { return value; }
    return numeral(value).format(format);
});

//时间格式化过滤器
Vue.filter('moment', function (value, f) {
    if (value == undefined || value == null) { return value; }
    try {
        return moment(value).format(f);
    } catch (e) {
        return value;
    }
});

//验证textbox是否有效
Vue.directive('uz-valid', function (el, binding) {
    var ctl = $(el);
    var text = ctl.text();
    ctl.toggleClass('bg-black', !text || text.indexOf('undefined') >= 0);
});

//<img v-uz-query-attr="{attr:'src',query:'src'}" alt="Alternate Text" />
Vue.directive('uz-query-attr', {
    inserted: function (el, binding) {
        if (binding.value && binding.value.attr && binding.value.query) {
            $(el).attr(binding.value.attr, uzone.helper.getQueryValue(binding.value.query));
        }
    }
});

Vue.directive('uz-device-name', {
    inserted: function (el) {
        var name = uzone.helper.getQueryValue('device');
        if (name) {
            $(el).text(name);
        }
    }
});

//报警栏
Vue.component('uz-alarm-box', {
    template: '\
        <a href="{{link}}" class="label" :class="{\'blink bg-red\':blink&&count>0}" v-if="count">\
            {{count}} <i class="glyphicon glyphicon-bell"></i>\
        </a>\
    ',
    props: {
        link: String,
        count: Number,
        blink: Boolean,
    },
});

//头组件
Vue.component('uz-header', {
    //template: '#headTemplate',
    template: '\
        <nav class="navbar navbar-default navbar-fixed-top box-navbar" role="navigation">\
            <div class="navbar-inner bg-navbar">\
                <div class="container-fluid">\
                    <a class="brand pull-left" href="#"><img height="32" src="/Content/logo-hit.png" /> HIT RTG RCMS</a>\
                    <ul class="nav navbar-nav user-menu pull-right">\
                        <li><uz-alarm-box blink="true" link="link" :count="count"></uz-alarm-box></li>\
                        <li class="divider-vertical hidden-sm hidden-xs"></li>\
                        <li><a v-uz-device-name href="#"></a></li>\
                    </ul>\
                </div>\
        </nav>\
    ',
    props: {
        link: String,
        count: Number,
    },
});

//左边栏
Vue.component('uz-left-panel', {
    //template: '#leftPanelTemplate',
    template: '\
        <div class="list-group">\
            <a class="list-group-item menu-level-1 menu-hover cursor" href="/Main.html">\
                <i class="glyphicon glyphicon-home"></i>\
                Main\
            </a>\
            <div class="list-group-item menu-level-1 menu-hover cursor" @click="active=(active==\'data\')?\'\':\'data\'">\
                <i class="glyphicon glyphicon-th"></i>\
                Data\
            </div>\
            <div class="list-group menu-level-2" v-show="active==\'data\'">\
                <a class="list-group-item bg-grey-1 menu-hover cursor" href="/Alarm.html">Alarm</a>\
                <a class="list-group-item bg-grey-1 menu-hover cursor" href="/HistoryAlarm.html">History Alarm</a>\
                <a class="list-group-item bg-grey-1 menu-hover cursor" href="/HistoryData.html">History Data</a>\
            </div>\
            <div class="list-group-item menu-level-1 menu-hover cursor" @click="active=(active==\'list\')?\'\':\'list\'">\
                <i class="glyphicon glyphicon-list"></i>\
                RTGCs\
            </div>\
            <div class="list-group menu-level-3" v-show="active==\'list\'">\
                <form class="input-group input-group-sm">\
                    <input type="text" class="form-control" v-model="filter">\
                    <span class="input-group-addon btn-default" @click="filter=\'\'">\
                        <span class="glyphicon glyphicon-remove">\
                        </span>\
                    </span>\
                    <span class="input-group-addon btn-default">\
                        <span class="glyphicon glyphicon-search">\
                        </span>\
                    </span>\
                </form>\
                <div v-for="(a,k) in devices">\
                    <div class="list-group-item bg-grey-1 menu-hover cursor menu-padding-3 " v-show="a.length>0" @click="group=(group==k)?\'\':k">\
                        <i class="glyphicon" :class="{\'glyphicon-folder-open\':(group==k||group==\'*\'),\'glyphicon-folder-close\':(group!=k&&group!=\'*\')}"></i>\
                        {{k}}\
                    </div>\
                    <div class="list-group menu-level-4" v-show="group==k||group==\'*\'">\
                        <a class="list-group-item bg-grey-1 menu-hover cursor menu-padding-4" :href="rtg.defaultUrl" v-for="rtg in a">{{rtg.name}}</a>\
                    </div>\
                </div>\
            </div>\
        </div>\
    ',
    data: function () {
        return {
            source: null,
            devices: null,
            active: 'list',
            group: null,
            filter: null,
            timer: null,
        }
    },
    mounted: function () {
        var component = this;
        $.getJSON("/devices.json", function (json) {
            var result = {};
            for (var i = 0; i < json.length; i++) {
                var list = result[json[i].group];
                if (!list) {
                    list = [];
                    result[json[i].group] = list;
                }
                list.push({ name: json[i].name, defaultUrl: json[i].defaultUrl });
            }
            component.source = result;
            component.devices = result;
        });
    },
    watch: {
        filter: function (val, oldVal) {
            clearTimeout(this.timer);
            this.timer = setTimeout(this.doFilter, 512);
        }
    },
    methods: {
        doFilter: function () {
            if (this.filter) {
                var result = {};
                var filter = this.filter.toLowerCase();
                for (var group in this.source) {
                    var list = [];
                    var g = this.source[group];
                    for (var i = 0; i < g.length; i++) {
                        if (g[i].name.toLowerCase().indexOf(filter) >= 0) {
                            list.push(g[i]);
                        }
                    }
                    if (list.length > 0) {
                        result[group] = list;
                    }
                    this.devices = result;
                }
            } else {
                this.devices = this.source;
            }
            this.group = '*';
        }
    }
});

//灯
Vue.component('uz-lamp', {
    template: '\
        <div class="lamp" :class="getClass()" :title="tooltip"></div>\
    ',
    props: {
        v: Boolean,
        on: {
            type: String,
            default: 'bg-lightgreen',
        },
        off: {
            type: String,
            default: 'bg-lightgrey',
        },
        invalid: {
            type: String,
            default: 'bg-black',
        },
        baseClass: String,
        tooltip: String,
    },
    methods: {
        getClass: function () {
            if (this.v == undefined) {
                return this.baseClass ? this.baseClass + ' ' + this.invalid : this.invalid;
            } else {
                var c = this.v ? this.on : this.off;
                return this.baseClass ? this.baseClass + ' ' + c : c;
            }
        },
    },
});

//回放控制器
Vue.component('uz-rtdb-control', {
    //template: '#controltemplate',
    template: '\
        <div class="input-group input-group-sm">\
            <div class="btn-group btn-group-sm">\
                <button class="btn btn-default" type="button" :class="{\'btn-primary\':realtime}" @click="realtime=!realtime">\
                    <span class="glyphicon glyphicon-record">\
                    </span>\
                </button>\
                <button class="btn btn-default btn-sm" type="button" :class="{\'btn-primary\':play}" @click="play=!play">\
                    <span class="glyphicon glyphicon-play" v-show="play">\
                    </span>\
                    <span class="glyphicon glyphicon-stop" v-show="!play">\
                    </span>\
                </button>\
                <button class="btn btn-default btn-sm" type="button" :class="{\'btn-primary\':play && reverse}" v-show="!realtime" @click="onDirectClick(true)">\
                    <span class="glyphicon glyphicon-backward">\
                    </span>\
                </button>\
                <button class="btn btn-default btn-sm" type="button" :class="{\'btn-primary\':play && !reverse}" v-show="!realtime" @click="onDirectClick(false)">\
                    <span class="glyphicon glyphicon-forward">\
                    </span>\
                </button>\
                <div class="btn-group btn-group-sm">\
                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">\
                        {{stepName}}\
                        <span class="caret"></span>\
                    </button>\
                    <ul class="dropdown-menu" role="menu">\
                        <li :class="{\'active\':step==500}" @click="step=500,stepName=\'500 Milliseconds\'"><a>500 Milliseconds</a></li>\
                        <li :class="{\'active\':step==1000}" @click="step=1000,stepName=\'1 Second\'"><a>1 Second</a></li>\
                        <li :class="{\'active\':step==10000}" @click="step=10000,stepName=\'10 Seconds\'"><a>10 Seconds</a></li>\
                        <li :class="{\'active\':step==30000}" @click="step=30000,stepName=\'30 Seconds\'"><a>30 Seconds</a></li>\
                        <li :class="{\'active\':step==60000}" @click="step=60000,stepName=\'1 Minute\'"><a>1 Minute</a></li>\
                        <li :class="{\'active\':step==600000}" @click="step=600000,stepName=\'10 Minutes\'"><a>10 Minutes</a></li>\
                    </ul>\
                </div>\
                <input type="button" class="btn btn-sm btn-default" :disabled="realtime ? true : false" />\
            </div>\
        </div>\
    ',
    data: function () {
        return {
            isChanging: false,
            picker: null,
            realtime: true,
            stamp: new moment(),
            play: true,
            reverse: false,
            step: 1000,
            stepName: '1 Second',
            timer: null,
        }
    },
    mounted: function () {
        var component = this;
        var element = $(this.$el.children[0].children[5]);
        element.datetimepicker({
            format: 'YYYY-MM-DD HH:mm:ss',
            showClose: true,
        }).on("dp.hide", function (e) {
            if (e.date) {
                if (!component.ischanging) {
                    component.ischanging = true;
                    component.stamp = e.date;
                    component.ischanging = false;
                }
            }
        });
        this.picker = element.data("DateTimePicker");
        this.update();
    },
    watch: {
        "play": function (val, oldVal) { this.update(); },
        "step": function (val, oldVal) { this.update(); },
        "stamp": function (val, oldVal) {
            this.setPicker(val);
        },
    },
    methods: {
        setPicker: function (val) {
            if (!this.ischanging) {
                this.ischanging = true;
                this.picker.date(val);
                this.ischanging = false;
            }
            this.$emit('changed', this.realtime ? null : val);
        },
        onDirectClick: function (reverse) {
            if (this.play) {
                this.reverse = reverse;
            } else {
                var step = reverse ? -this.step : this.step;
                this.stamp.add(step, 'ms');
                this.setPicker(this.stamp);
            }
        },
        update: function () {
            if (this.timer) { clearInterval(this.timer); }
            if (this.play) {
                var component = this;
                var step = component.realtime ? component.step : 1000;

                this.timer = setInterval(function () {
                    if (component.realtime) {
                        component.stamp = new moment();
                    } else {
                        var step = component.reverse ? -component.step : component.step;
                        component.stamp.add(step, 'ms');
                        component.setPicker(component.stamp);
                    }
                }, step);
            }
        }
    },
});

Vue.component('uz-active-alarm', {
    template: '\
                 <table class="tablesorter">\
                <thead>\
                    <tr>\
                        <th>ID</th>\
                        <th>Device</th>\
                        <th>Name</th>\
                        <th>Desc</th>\
                    </tr>\
                </thead>\
                <tbody>\
                    <tr v-for="a in alarms">\
                        <td>{{a.id}}</td>\
                        <td>{{a.device}}</td>\
                        <td>{{a.name}}</td>\
                        <td>{{a.desc}}</td>\
                    </tr>\
                </tbody>\
            </table>\
    ',
    props: {
        alarms: Array,
    },
    update: function () {
        var a = this.alarms;
    }
});

//仪表组件
Vue.component('uz-gauge', {
    template: '<div></div>',
    props: {
        v: Object,
        additional: null,
    },
    data: {
        chart: null,
        option: null,
    },
    watch: {
        v: function (val, oldVal) {
            this.option.series[0].data[0].value = val;
            this.chart.setOption(this.option, true);
        }
    },
    mounted: function () {
        var defaultOption = {
            backgroundColor: 'transparent',
            tooltip: {
                formatter: "{a} <br />{c} {b}"
            },
            series: [
                 {
                     name: 'speed',
                     type: 'gauge',
                     min: -100,
                     max: 100,
                     splitNumber: 8,
                     radius: '95%',
                     axisLine: {
                         lineStyle: {
                             color: [[1, 'green']],
                             width: 3,
                             shadowBlur: 10
                         }
                     },
                     axisTick: {
                         lineStyle: {
                             color: 'auto',
                         }
                     },
                     splitLine: {
                         length: 12,
                         lineStyle: {
                             width: 3,
                             color: 'auto',
                         }
                     },
                     title: {
                         textStyle: {
                             fontSize: 9,
                             fontWeight: 'bolder',
                         }
                     },
                     detail: {
                         formatter: '{value}rpm',
                         offsetCenter: [0, '65%'],
                         textStyle: {
                             fontSize: 2,
                             fontWeight: 'bolder',
                             color: 'black'
                         }
                     },
                     data: [{ value: 0, name: 'rpm' }]
                 },
            ]
        }
        this.chart = echarts.init(this.$el);
        this.option = this.additional ? $.extend(true, defaultOption, this.additional) : defaultOption;
        this.chart.setOption(this.option, true);
    },
});