var app = new Vue({
    el: '#app',
    data: {
        rtdb: uzone.rtdb.createNew(),
    },
    methods: {
        ontimer: function (val) {
            this.rtdb.update(val);
        },
    }
});