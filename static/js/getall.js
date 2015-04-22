var data;
var tasks;

$(document).ready(function() {
	$.getJSON('/static/js/userparameters.json', function(data) {loadData(data);})
});

function loadData(d) {
	data = d;
	tasks = Object.keys(data[0]);
	index = tasks.indexOf('userid');
	tasks.splice(index, 1);
}

global = {
	'currentUser': 0,
	'currentTask': 0
};

var procuser = function ProcessUser() {

	if (global.currentTask >= tasks.length) {
		global.currentTask = 0;
		global.currentUser = global.currentUser + 1;
	}
	
	if (global.currentUser >= data.length) {
		console.log('no more users');
		return;
	}
	

	gettaskdata(data, global.currentUser, tasks[global.currentTask]);
	console.log('processed user ' + global.currentUser + ': ' + data[global.currentUser].userid);
	console.log('processed task ' + global.currentTask + ': ' + tasks[global.currentTask]);
	global.currentTask = global.currentTask + 1;
}

function gettaskdata(data, i, task) {
	info = new FormData();
	info.append('userid', i + '-' + data[i].userid);
	info.append('filename', task + '.wav');
	params = data[i][task];
	impulse(params, info);
}
