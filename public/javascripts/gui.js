'use strict';
/* global jQuery, uwotInteractive, getCliLinksHtml */

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
			var cliLinks = this.frame.find('a');
			this.frame.append(getCliLinksHtml());
			cliLinks.each((idx, el) => {
				let linkNo = jQuery(el).attr('data-link-num');
				let linkHref = jQuery(el).attr('href');
				let linkTarget = jQuery(el).attr('target');
				linkTarget = 'string' === typeof linkTarget && '_blank' === linkTarget ? linkTarget : '_self';
				let linkTxt = jQuery(el).text();
				jQuery('#uwotBrowseLinks .uwot-browse-modal-content').append('<div class="uwot-browse-modal-content-line" data-link-href="' + linkHref + '" data-link-num="' + linkNo + '" data-link-target="' + linkTarget + '"><span class="uwot-browse-modal-link-num">' + linkNo + '</span>&nbsp;<span class="uwot-browse-modal-link-name">' + linkTxt + '</span></div>');
			});
	}
}

// class contains instance methods for opening, closing, and maintaining gui environment in the user interface

function uwotGuiGoto(url) {

	console.log(url);
	return;

}
