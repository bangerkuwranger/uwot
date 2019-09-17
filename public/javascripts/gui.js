'use strict';

class UwotGui {
	constructor() {
		uwotInteractive = true;
		jQuery('#uwotoutput .output-container').html('<div id="uwotguioutput" class="gui">');
		this.frame = jQuery('#uwotguioutput');
	}
	destroy() {
		uwotInteractive = false;
		jQuery('#uwotoutput .output-container').html('');
	}
	update(content) {
		this.frame.html(content);
	}
}

// class contains instance methods for opening, closing, and maintaining gui environment in the user interface

function uwotGuiGoto(url) {

	console.log(url);
	return;

}
