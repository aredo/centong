var cluster = require('cluster'),
		numCPUs = require('os').cpus().length

if(cluster.isMaster) {
	var worker, i;

	for (i = 0; i < numCPUs; i++) {
		worker = cluster.fork();
		console.info('Workerer #'+ worker.id, 'with pid', worker.process.pid, 'is on')
	}

	cluster.on('exit', function(worker, code, signal) {
		console.info('Workerer #'+ worker.id, 'with pid', worker.process.pid, 'dir')
	})

}else {
	app = require('./app.js')
}