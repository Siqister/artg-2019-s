/* Record interaction with UI elements */
const dispatch = d3.dispatch('ui-event');

//Log UI interactions
dispatch.on('ui-event', (target, type, value) => {
	d3.select('#ui-output-1')
		.html(`A <code>${type}</code> event occurred on the ${target} element. The value of the UI element is <code>${value}</code>`);
});

//Button interactions
d3.selectAll('.btn').on('click', function(){
	dispatch.call(
		'ui-event',
		null,
		'button',
		d3.event.type,
		d3.event.value
	);
});

//Text <input> interactions
const textInputs = d3.selectAll('input').filter(function(){ return this.type === 'text' });
textInputs
	.on('change', function(){
		dispatch.call(
			'ui-event',
			null,
			'text input',
			d3.event.type,
			d3.event.value || this.value
		);
	});

//<select> interactions
d3.select('select')
	.on('change', function(){
		dispatch.call(
			'ui-event',
			null,
			'select',
			d3.event.type,
			d3.event.value || this.value
		);
	});

//checkbox interactions
const checkbox = d3.selectAll('input').filter(function(){ return this.type === 'checkbox' });
checkbox
	.on('change', function(){
		dispatch.call(
			'ui-event',
			null,
			'checkbox',
			d3.event.type,
			this.checked
		);
	});

//radio interactions
const radios = d3.selectAll('input')
	.filter(function(){ return this.type === 'radio' && this.name === 'exampleRadios'})
	.on('change', function(){
		dispatch.call(
			'ui-event',
			null,
			'radio',
			d3.event.type,
			this.value
		);
	});

/* Example for handling form submit 
 */
d3.select('.custom-form').on('submit', function(){
	d3.event.preventDefault();
	const formData = new FormData(this);
	console.group('Form submit event');
	console.log(formData.get('email'));
	console.log(formData.get('password'));
	console.log(formData.get('check'));
	console.groupEnd();
});

/* Example for a range slider implementation 
 * Range slider is implemented as a reusable, configurable module
 */

// Create an instance of the reusable and reconfigurable range slider
const slider1 = RangeSlider()
	.values([1990, 1995, 2000, 2005])
	.on('change', value => console.log(value));

// Call the module to create the slider
d3.select('.range-slider-container').call(slider1);

function RangeSlider(){

	let sliderValues = [0,0];
	const margin = {l:20, r:20};
	const drag = d3.drag();
	const internalDispatch = d3.dispatch('change');

	function exports(container){
		//Build DOM elements for the range slider
		//First, take/set pixel dimensions for 
		const W = container.node().clientWidth;
		const H = 100;
		container.style('height', `${H}px`);
		const w = W - margin.l - margin.r;

		//Create an axis generator function to generate ticks for the slider
		const scaleX = d3.scaleLinear().domain(d3.extent(sliderValues)).range([0,w]);
		const axisX = d3.axisBottom()
			.scale(scaleX)
			.tickValues(sliderValues)
			.tickFormat(d3.format('0'));

		//Set up drag behavior
		drag
			.on('start', onDragStart)
			.on('drag', onDrag)
			.on('end', onDragEnd);

		//Use enter/exit/update pattern to append DOM elements
		let svg = container.selectAll('svg')
			.data([1]);
		const svgEnter = svg.enter()
			.append('svg');
		let sliderInner = svgEnter.append('g')
			.attr('class', 'range-slider-inner');
		sliderInner.append('line').attr('class', 'track-outer');
		sliderInner.append('line').attr('class', 'track-inner');
		sliderInner.append('circle').attr('class', 'drag-handle');
		sliderInner.append('g').attr('class', 'axis');

		//Update DOM elements appearance
		svg = svgEnter.merge(svg)
			.attr('width', W)
			.attr('height', H);
		sliderInner = svg.select('.range-slider-inner')
			.attr('transform', `translate(${margin.l}, ${H/2})`);
		sliderInner.select('.track-outer')
			.attr('x1', w)
			.attr('stroke', '#666')
			.attr('stroke-width', '4px')
			.attr('stroke-linecap', 'round');
		sliderInner.select('.track-inner')
			.attr('x1', w)
			.attr('stroke', '#eee')
			.attr('stroke-width', '2px')
			.attr('stroke-linecap', 'round');
		const dragHandle = sliderInner.select('.drag-handle')
			.attr('r', 8)
			.attr('stroke', 'white')
			.attr('stroke-width', '3px')
			.attr('fill', '#666')
			.style('cursor', 'pointer')
			.call(drag);
		sliderInner.select('.axis')
			.attr('transform', `translate(0,4)`)
			.call(axisX)
			.select('.domain')
			.style('display', 'none');

		//Drag behavior
		function onDragStart(){
			dragHandle.transition().attr('r', 12);
		}

		function onDrag(){
			let currentX = d3.event.x;
			if(currentX < 0){
				currentX = 0;
			}else if(currentX > w){
				currentX = w;
			}

			dragHandle.attr('cx', currentX);
		}

		function onDragEnd(){
			dragHandle.transition().attr('r', 8);

			let currentX = d3.event.x;
			if(currentX < 0){
				currentX = 0;
			}else if(currentX > w){
				currentX = w;
			}

			//"Snap" value to one of the ticks
			let currentValue = scaleX.invert(currentX);
			const i = d3.bisectRight(sliderValues, currentValue);
			currentValue = sliderValues[i];
			currentX = scaleX(currentValue);

			dragHandle.attr('cx', currentX);

			internalDispatch.call('change', null, currentValue);
		}

	}

	//Getter/setter methods
	exports.values = function(_){
		sliderValues = _;
		return this;
	}

	exports.on = function(...arguments){
		internalDispatch.on(...arguments);
		return this;
	}

	return exports;

}

