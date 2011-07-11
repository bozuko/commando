/*
 *  This is the plugin for the Uncomplicated (Ubuntu) Firewall
 */

var Plugin = require('../plugin'),
    os = require('os'),
    exec = require('child_process').exec
;

var defaults = {
    poll_time: 10000 // ms
};

var Ufw = module.exports = function(options) {
    Plugin.apply(this, arguments);
    this.poll_time = options.poll_time || defaults.poll_time;
    this.rules = [];
};

Ufw.prototype.__proto__ = Plugin.prototype;


Ufw.prototype.monitor = function() {
    var self = this;
    setInterval(function() {
        exec('ufw status verbose', function(err, stdout, stderr) {
            if (stderr.length != 0) console.error(stderr);
            if (err) {
                self.status = error;
                console.error(err);
            }
            self.parseStatus(stdout);
         //   self.checkStatus();
        });
    }, this.poll_time);

};

Ufw.prototype.parseStatus = function(stdout) {
    var lines = stdout.split('\n');
    var self = this;
    lines.forEach(function(line) {
        var arr = lines[0].split(': ');
        if (arr.length === 2) {
            switch (arr[0]) {
                case 'Status':
                    self.status = arr[1];
                    break;
                case 'Logging':
                    self.logging = arr[1];
                    break;
                case 'Default':
                    var defarr = arr[1].split(' ');
                    self.default_rule = defarr[0];
                    break;
                default:
                    break;
            }
        } else {
            arr = line.split(/\s*/);
            if (arr.length === 3 && (arr[0] != 'To' && arr[0] != '--')) {
                self.rules.push({
                    to: arr[0],
                    action: arr[1] +' '+ arr[2],
                    from: arr[3]
                });
            }
        }
    });
};

Ufw.prototype.data = function() {
    return {
        status: this.status,
        logging: this.logging,
        default_rule: this.default_rule,
        rules: this.rules
    };
};