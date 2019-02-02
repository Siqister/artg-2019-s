import * as d3 from 'd3';

function lineChart(data, key, rootDOM){

	const W = 240;
	const H = 196;
	const margin = {t:32, r:32, b:64, l:64};
	const innerWidth = W - margin.l - margin.r;
	const innerHeight = H - margin.t - margin.b;

	const scaleX = d3.scaleLinear().domain([1985,2020]).range([0, innerWidth]);
	const scaleY = d3.scaleLinear().domain([0, 250000]).range([innerHeight, 0]);

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

}

export default lineChart;
