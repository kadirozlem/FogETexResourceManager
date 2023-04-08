var os = require("os");
var config=require("./Config");
const microtime = require("microtime");


class ResourceInfo {
    constructor(previous) {
        this.timestamp = microtime.nowDouble();
        this.cpu_times = this.cpuInfo();
        this.cpu_percentage = this.cpuPercentage(previous)
        this.freemem = os.freemem();
        this.totalmem = os.totalmem();
        this.system_uptime = os.uptime();
        this.process_uptime = process.uptime();
    }

    cpuInfo() {
        var cpu = os.cpus();
        var cpuList = [];
        cpu.forEach(function (item) {
            cpuList.push(item.times);
        });
        return cpuList;
    }

    cpuPercentage(previous) {
        var total_idle = 0;
        var total_time = 0;
        var diffence = {
            total: null,
            cores: []
        };
        if (previous && previous.length != this.cpu_times.length) {
            for (var cpu in this.cpu_times) {
                var user = this.cpu_times[cpu].user - previous.cpu_times[cpu].user;
                var nice = this.cpu_times[cpu].nice - previous.cpu_times[cpu].nice;
                var sys = this.cpu_times[cpu].sys - previous.cpu_times[cpu].sys;
                var irq = this.cpu_times[cpu].irq - previous.cpu_times[cpu].irq;
                var idle = this.cpu_times[cpu].idle - previous.cpu_times[cpu].idle;
                var total = user + nice + sys + irq + idle;
                diffence.cores.push({idle: idle, total: total, usage:(1-idle/total)*100});
                total_idle += idle;
                total_time += total;
            }

        } else {
            for (var cpu in this.cpu_times) {
                var user = this.cpu_times[cpu].user;
                var nice = this.cpu_times[cpu].nice;
                var sys = this.cpu_times[cpu].sys;
                var irq = this.cpu_times[cpu].irq;
                var idle = this.cpu_times[cpu].idle;
                var total = user + nice + sys + irq + idle;
                diffence.cores.push({idle: idle, total: total, usage:(1-idle/total)*100});
                total_idle += idle;
                total_time += total;

            }
        }
        diffence.total = {idle: total_idle, total: total_time, usage:(1-total_idle/total_time)*100};
        //console.log("Idle: "+diffence.total.idle+ " - Total" +diffence.total.total+" - Usage:" +diffence.total.usage)

        return diffence;
    }
}


class Resources {
    constructor(io) {
        this.io = io;
        this.resourcesInfos=[];
        this.previous=null;
        this.tick();
        var t = this;
        this.timer=setInterval(function(){t.tick()},config.ResourceManagerSamplingPeriod);
    }

    tick(){
        var resourceInfo=new ResourceInfo(this.previous);
        this.previous=resourceInfo;
        this.io.SendResourceInfo(resourceInfo);
    }

}
module.exports=Resources;
