var Plugin = require('../plugin'),
    os = require('os')
;

// default config
var load_threshold_default = 2;
var poll_time_default = 10000; // ms

var Cpu = module.exports = function(options) {
    Plugin.apply(this, arguments);
    this.load_threshold = options.load_threshold || load_threshold_default;
    this.poll_time = options.poll_time || poll_time_default;
    this.alert_config = {
        email: {
            subject: "node-monitor(CPU): Load Average Exceeded",
            body: "Load average for "+os.hostname()+" has exceeeded "+this.load_threshold
        }
    };
    this.alerts = 0;
};

Cpu.prototype.__proto__ = Plugin.prototype;

Cpu.prototype.monitor = function() {
    var self = this;
    setInterval(function() {
        if (os.loadavg()[0] > self.load_threshold) {
            self.alert(self.alert_config);
            self.alerts++;
        }
    }, this.poll_time);
};

Cpu.prototype.data = function() {
    return {alerts: this.alerts};
};