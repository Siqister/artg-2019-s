import {select} from 'd3';

export default function layoutControls(rootDom, layoutOptions, dispatch){

	// render buttons under rootDom, based on layoutOptions
	// use enter-exit-update pattern
	let options = select(rootDom).selectAll('.option')
		.data(layoutOptions);
	options.exit().remove();
	options = options.enter()
		.append('button')
		.attr('class', 'option btn btn-light')
		.html(d => d)
		.merge(options);

	// implement event listening on layout option buttons
	// events will be broadcasted to the "dispatch" argument, 
	// which happens to be the globalDispatch object in index.js
	options.on('click', d => {
		dispatch.call('layout:change', null, d)
	});

}