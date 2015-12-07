var context;
var reverberator;
var sampleRate = 44100;
var buffers;
var audio;
var tasks = ['task1a', 'task2a', 'task3a', 'task1b', 'task2b', 'task3b'];
var info;

function setupContext() {
	context = new OfflineAudioContext(2, sampleRate*10, sampleRate);
	curve = []
	for (i = 0; i < 40; i++) {
		curve.push(0);
	}
	equalizer = new Equalizer(context, {'curve': curve, 'range': 1});
	context.oncomplete = function (e) {
		outBuffer = e.renderedBuffer;
		var worker = new Worker('/static/js/recorderWorker.js');
		worker.postMessage({
			command: 'init',
			config: {
				sampleRate: context.sampleRate
			}
		});

		worker.postMessage({
			command: 'record',
			buffer: [outBuffer.getChannelData(0),
					outBuffer.getChannelData(1)]
		});

		worker.postMessage({
			command: 'exportWAV',
			type: 'audio/wav'
		});

		worker.onmessage = function(e) {
			post(e);
		}
		audio.stop(0);
	};

}

$(document).ready(function() {
	audiofile = ["/static/audio/wideimpulse.wav"]
	setupContext();
	bufferloader = new BufferLoader (
		context,
		audiofile,
		finished
	);
	bufferloader.load()

	function finished(bufferlist) {
		buffers = bufferlist.slice(0);
	}
});

function apply_eq(params, infos) {
	info = infos;
	console.log(params);
	setupContext();
	equalizer.curve = params;
	render();
}

function render() {
	audio = createsource(buffers[0], false)
	audio.connect(equalizer.input)
	equalizer.connect(context.destination)
	audio.start(0);
	context.startRendering();
}

function createsource(buffer, loop) {
	var source = context.createBufferSource();
	source.buffer = buffer;
	source.loop = loop;
	return source;
}

function post(e) {
	console.log(info);
	info.append('blob', e.data);
	xhr('/upload', info, function() {console.log('done')});
	
	function xhr(url, data, callback) {
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				callback();
			}
		};
		request.open('POST', url);
		request.send(data);
	}
}
