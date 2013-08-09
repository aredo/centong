var cluster = require('cluster'),
		numCPUs = require('os').cpus().length

if(cluster.isMaster) {
	var worker, i = 0;

	while(i < numCPUs) {
		cluster.fork()
		i++
	}
	cluster.on('fork', function(worker){
		console.log('forked worker  '+ worker.process.pid)
	})

	cluster.on('listneing', function(worker, address){
		console.log('worker '+ worker.process.pid + " is now connected to " + address.address + ":" + address.port)
	});

	cluster.on('exit', function(worker, code, signal) {
		console.info('Worker '+ worker.process.pid + 'died')
	})

}else {
	require('./app.js').base(cluster)
}