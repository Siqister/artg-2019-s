import * as d3 from 'd3';

function forceGraph(rootDom, data){

	const w = rootDom.clientWidth;
	const h = rootDom.clientHeight;

	// Set up force simulation
	const simulation = d3.forceSimulation();
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
	let nodes = svg.selectAll('.node')
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

export default forceGraph;