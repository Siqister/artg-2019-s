import {select} from 'd3';

export default function colorControls(rootDom, colorOptions, dispatch){

	// render buttons under rootDom, based on colorOptions
	// use enter-exit-update pattern
	let options = select(rootDom).selectAll('.option')
		.data(colorOptions);
	options.exit().remove();
	options = options.enter()
		.append('button')
		.attr('class', 'option btn btn-dark')
		.html(d => d)
		.merge(options);

	// implement event listening on layout option buttons
	// events will be broadcasted to the "dispatch" argument, 
	// which happens to be the globalDispatch object in index.js
	options.on('click', d => {
		dispatch.call('color:change', null, d)
	});

}