var context;
var reverberator;
var sampleRate = 44100;
var buffers;
var audio;
var tasks = ['task1a', 'task2a', 'task3a', 'task1b', 'task2b', 'task3b'];
var info;

function setupContext() {
	context = new OfflineAudioContext(2, sampleRate*10, sampleRate);
	reverberator = new Reverb(context);
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
	audiofile = ["/static/audio/impulse.wav"]
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

function impulse(params, infos) {
	info = infos;
	setupContext();
	/*
		Sets reverberator to given parameters:
			d: delay of comb filters
			g: gain of comb filters
			m: delay between channels
			f: frequency cutoff
			E: effect gain
			wetdry: wet/dry mix
		input: a dictionary with each parameter as a key
		output: impulse response as a wav file
	*/
	reverberator.d = params.d;
	reverberator.g = params.g;
	reverberator.m = params.m;
	reverberator.f = params.f;
	reverberator.E = params.E;
	reverberator.wetdry = params.wetdry;
	render();
}

function render() {
	audio = createsource(buffers[0], false)
	audio.connect(reverberator.input)
	reverberator.connect(context.destination)
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
