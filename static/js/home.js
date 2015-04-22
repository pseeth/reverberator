var music = {playing:false, reverb:false};

var context;
var reverberator;
var sampleRate = 44100;
var buffers;
var audio;
var info;

function setupContext() {
	context = new AudioContext(2, sampleRate*10, sampleRate);
	reverberator = new Reverb(context);
}

$(document).ready(function() {
	audiofile = ["/static/audio/guitar.mp3"]
	setupContext();
	bufferloader = new BufferLoader (
		context,
		audiofile,
		finished
	);
	bufferloader.load()

	function finished(bufferlist) {
		buffers = bufferlist.slice(0);
		create_graph()
	}
});

function set_reverb(params, infos) {
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
}

function create_graph() {
	audio = createsource(buffers[0], false);
	audio.connect(reverberator.input);
	reverberator.connect(context.destination);
}

music.play = function(loop) {
	create_graph();
	if (!audio.start) {
		audio.noteOn(0);
	} else {
		audio.start(0);
	}
	console.log('playing');
}

music.stop = function() {
	if (!audio.stop) {
		audio.noteOff(0);
	} else {
		audio.stop(0);
	}
	console.log('stopped');
}

music.toggle = function(loop) {
	this.playing ? this.stop() : this.play(loop);
	this.playing = !this.playing;
}

function createsource(buffer, loop) {
	var source = context.createBufferSource();
	source.buffer = buffer;
	source.loop = loop;
	return source;
}
