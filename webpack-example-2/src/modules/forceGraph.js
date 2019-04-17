import * as d3 from 'd3';

function ForceGraph(){

	// factory function internal variables
	const simulation = d3.forceSimulation();
	let w = 600; // default value, will be overriden
	let h = 300; // default value, will be overriden
	let nodes;

	function exports(rootDom, data){

		w = rootDom.clientWidth;
		h = rootDom.clientHeight;

		// Set up force simulation with a default mix of forces
		const forceX = d3.forceX().x(d => w/2);
		const forceY = d3.forceY().y(d => h/2);
		const forceCollide = d3.forceCollide().radius(d => d.value + 3);
		simulation
			.force('x', forceX)
			.force('y', forceY)
			.force('collide', forceCollide);

		// Set up DOM structure
		const svg = d3.select(rootDom).append('svg')
			.attr('width', w)
			.attr('height', h);
		nodes = svg.selectAll('.node')
			.data(data);
		let nodesEnter = nodes.enter()
			.append('g')
			.attr('class','node');
		nodesEnter.append('circle')
			.attr('r', d => d.value);
		nodes = nodesEnter.merge(nodes);

		// Set up logic for updating the force layout on tick
		simulation.on('tick', () => {
				nodes.attr('transform', d => `translate(${d.x}, ${d.y})`);
			})
			.nodes(data);
	}

	exports.updateLayout = function(layoutOption){

		console.group('forceGraph:updateLayout');
		console.log(layoutOption);
		console.groupEnd();

		const forceX = d3.forceX().x(d => w/2);
		const forceY = d3.forceY().y(d => h/2);
		const forceCollide = d3.forceCollide().radius(d => d.value + 3);

		// If layoutOption is set externally, adjust the composition of the simulation
		// "switch" statement is similar to a series of if...then
		switch(layoutOption){
			case 'Linear-x':
				simulation
					.force('x', forceX)
					.force('y', null) // removes 'y' force
					.force('collide', forceCollide);
				break;
			case 'Linear-y':
				simulation
					.force('x', null) // removes 'x' force
					.force('y', forceY)
					.force('collide', forceCollide);
				break;
			case 'Swarm':
			default:
				simulation
					.force('x', forceX)
					.force('y', forceY)
					.force('collide', forceCollide);
		}

		// After simulation has been re-configured, start it up again
		simulation
			.alpha(1) // this will "re-energize" the simulation
			.restart();
	}

	exports.updateColor = function(colorOption){

		console.group('forceGraph:updateColor');
		console.log(colorOption);
		console.groupEnd();

		const colorScale = d3.scaleLinear().domain([0,3,6]).range(['red','white','blue']);

		switch(colorOption){
			case 'Red':
				nodes.select('circle').transition().style('fill','red');
				break;
			case 'Blue':
				nodes.select('circle').transition().style('fill','blue');
				break;
			case 'By Value':
			default:
				nodes.select('circle').transition().style('fill', d => colorScale(d.value));
		}
	
	}

	exports.updateRange = function(value){

		nodes
			.select('circle')
			.style('stroke', 'none') // reset all the stroke to none
		  .filter(d => d.value <= value) // filter for only those nodes with matching values
			.style('stroke', '#666')
			.style('stroke-width', '2px');

	}

	return exports;

}

export default ForceGraph;