var data;
var words;

$(document).ready(function() {
	$.getJSON('/static/js/eq_word_parameters.json', function(data) {loadData(data);})
});

function loadData(d) {
	data = d;
}

current_word = 0;

var procword = function process_word() {
	if (current_word >= data.length) {
		console.log('all done');
		return;
	}
	info = new FormData();
	info.append('userid', '');
	info.append('filename', data[current_word]['word'] + '.wav');
	params = data[current_word]['settings'];
	apply_eq(params, info);
	console.log(data[current_word]['word']);
	console.log(current_word);
	current_word++;
}
