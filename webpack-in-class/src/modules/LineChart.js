import * as d3 from 'd3';

function LineChart(){

	//Internal module variables
	let W = 240;
	let H = 196;
	let rangeY = [0, 250000];
	const bisect = d3.bisector(d => d.key).right;
	const internalDispatch = d3.dispatch('select:year','highlight:year', 'mouseleave', 'unHighlight');

	function exports(data, key, idx, rootDOM){
		const margin = {t:32, r:32, b:64, l:64};
		const innerWidth = W - margin.l - margin.r;
		const innerHeight = H - margin.t - margin.b;

		const scaleX = d3.scaleLinear().domain([1985,2020]).range([0, innerWidth]);
		const scaleY = d3.scaleLinear().domain(rangeY).range([innerHeight, 0]);

		//Generator functions
		//take array of xy values, and produce a shape attribute for <path> element
		const lineGenerator = d3.line()
			.x(d => scaleX(+d.key))
			.y(d => scaleY(d.value)); //function
		const areaGenerator = d3.area()
			.x(d => scaleX(+d.key))
			.y0(innerHeight)
			.y1(d => scaleY(d.value));

		const axisX = d3.axisBottom()
			.scale(scaleX)
			.tickFormat(function(value){ return "'"+String(value).slice(-2)})
		const axisY = d3.axisLeft()
			.scale(scaleY)
			.tickSize(-innerWidth)
			.ticks(3)

		//Build and update DOM
		const container = d3.select(rootDOM)
			.style('width', `${W}px`)
			.style('height', `${H}px`)
			.style('float', 'left')
			.style('position', 'relative')
			.classed('line-chart',true);

		//Create / update label
		const label = container.selectAll('h3')
			.data([key]);
		const labelEnter = label.enter().append('h3');
		label.merge(labelEnter)
			.html(key)
			.style('left',`${margin.l}px`)
			.style('top', '16px')
			.style('position','absolute');

		//Create / update svg
		const svg = d3.select(rootDOM).selectAll('svg').data([1]);
		const svgEnter = svg.enter().append('svg');

		//Under svgEnter, append all the necessary DOM elements, only once
		const plotEnter = svgEnter.append('g')
			.attr('class','plot');
		plotEnter.append('path').attr('class','line');
		plotEnter.append('path').attr('class','area');
		plotEnter.append('g').attr('class', 'axis axis-x');
		plotEnter.append('g').attr('class', 'axis axis-y');
		const tooltipEnter = plotEnter.append('g').attr('class','tool-tip')
			.style('opacity',0);
		tooltipEnter.append('circle')
			.attr('r', 3);
		tooltipEnter.append('text')
			.attr('text-anchor', 'middle')
			.attr('y', -12);
		tooltipEnter.append('line');
		const mouseTargetEnter = plotEnter.append('rect').attr('class', 'mouse-target');

		//Update visual attributes
		//Here we don't append, simply update
		svg.merge(svgEnter)
			.attr('width', W)
			.attr('height', H);

		const plot = svg.merge(svgEnter)
			.select('.plot')
			.attr('transform', `translate(${margin.l}, ${margin.t})`);

		plot.select('.line')
			.datum(data)
			.style('fill','none')
			.style('stroke','#333')
			.style('stroke-width','2px')
			.transition()
			.attr('d', data => lineGenerator(data));

		plot.select('.area')
			.datum(data)
			.style('fill-opacity',0.03)
			.transition()
			.attr('d', data => areaGenerator(data));

		plot.select('.axis-x')
			.attr('transform',`translate(0, ${innerHeight})`)
			.transition()
			.call(axisX)

		plot.select('.axis-y')
			.transition()
			.call(axisY);

		plot.select('.mouse-target')
			.attr('width', innerWidth)
			.attr('height', innerHeight)
			.style('fill-opacity', 0.01);

		// Dealing with events
		mouseTargetEnter.on('mousemove', function(){
			const mouse = d3.mouse(this);
			const year = scaleX.invert(mouse[0]);
			const idx = bisect(data, year);
			const dataPoint = data[idx];

			//dispatch event externally
			if(dataPoint){
				internalDispatch.call('select:year', null, dataPoint.key);
			}

		});
		mouseTargetEnter.on('mouseleave', function(){

			internalDispatch.call('mouseleave', null);
		});

		internalDispatch.on('highlight:year.'+idx, year => {
			const idx = bisect(data, year);
			const dataPoint = data[idx];

			if(dataPoint){
				const x = scaleX(dataPoint.key);
				const y = scaleY(dataPoint.value);

				plot.select('.tool-tip')
					.attr('transform', `translate(${x}, ${y})`)
					.style('opacity',1);
				plot.select('.tool-tip').select('text').text(dataPoint.value);
				plot.select('.tool-tip').select('line').attr('y1', innerHeight - y);
			}
		});

		internalDispatch.on('unHighlight.'+idx, () => {
			plot.select('.tool-tip')
				.style('opacity',0);
		});
	}

	exports.rangeY = function(_){
		rangeY = _;
		return this;
	}

	exports.width = function(_){
		width = _;
		return this;
	}

	exports.height = function(_){
		height = _;
		return this;
	}

	exports.on = function(eventName, callback){
		internalDispatch.on(eventName, callback);
		return this;
	}

	exports.highlightYear = function(year){
		internalDispatch.call('highlight:year', null, year);
		return this;
	}

	exports.unHighlight = function(){
		internalDispatch.call('unHighlight');
		return this;
	}

	return exports;
}

export default LineChart;
