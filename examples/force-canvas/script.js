const dataPromise = generateData(1000);
const plot = d3.select('.plot').node();

dataPromise.then(data => console.log(data));
dataPromise.then(data => forceGraphCanvas(data, plot));
dataPromise.then(data => forceGraphSvg(data, plot));


// Render force layout in <svg> space
function forceGraphSvg(data, root){

	const w = root.clientWidth;
	const h = root.clientHeight;

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
	const svg = d3.select(root).append('svg')
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

// Render force layout in <canvas> space
function forceGraphCanvas(data, root){

	const w = root.clientWidth;
	const h = root.clientHeight;

	// Set up force simulation
	const simulation = d3.forceSimulation();
	const forceX = d3.forceX().x(d => w/2);
	const forceY = d3.forceY().y(d => h/2);
	const forceCollide = d3.forceCollide().radius(d => d.value + 1);
	simulation
		.force('x', forceX)
		.force('y', forceY)
		.force('collide', forceCollide);

	// Set up DOM structure
	const canvas = d3.select(root).append('canvas')
		.attr('width', w)
		.attr('height', h)
		.style('position', 'absolute')
		.style('left', 0)
		.style('top', 0)
		.style('z-index', -999)
		.node();
	const canvasCtx = canvas.getContext('2d');

	// Set up logic for updating the force layout on tick
	simulation.on('tick', () => {
			updateCanvas();
		})
		.nodes(data);

	function updateCanvas(){
		canvasCtx.clearRect(0, 0, w, h);
		canvasCtx.fillStyle = 'rgb(255,0,0)';

		data.forEach(d => {
			canvasCtx.beginPath();
			canvasCtx.moveTo(d.x, d.y);
			canvasCtx.arc(d.x, d.y, d.value+2, 0, Math.PI*2);
			canvasCtx.closePath();
			canvasCtx.fill();
		});
	}

}


// Function that generates a Promise that returns an array of random values of length n
// Not important how it's implemented
function generateData(n){
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const arr = Array.from({length:n}).map((d,i) => ({
				value: Math.random()*2+1
			}));
			resolve(arr);
		}, 1000);
	});
}