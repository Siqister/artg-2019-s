// Import CSS
// Import order matters: later imports supercede earlier ones
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './style.css'

// Import d3 library
// Note this is a "global" import that imports all d3 functions
import * as d3 from 'd3'

// Import individual modules
import dataPromise from './data';
import layoutControls from './modules/layoutControls';
import colorControls from './modules/layoutControls';
import forceGraph from './modules/forceGraph';

// Create global dispatch object
// It is responsible for managing interaction and communication among modules
// It can even be passed into individual modules!
const globalDispatch = d3.dispatch(
		'layout:change', 
		'color:change'
	);

// Render layoutControls and colorControls modules
// These don't depend on "live" data so can be rendered first
layoutControls(
		d3.select('.layout-control').node(),
		['Swarm', 'Linear-x', 'Linear-y'],
		globalDispatch
	);

colorControls(
		d3.select('.color-control').node(),
		['Red', 'Blue', 'By Value'],
		globalDispatch
	);

// Inspect the content of dataPromise
dataPromise.then(data => console.log(data));

// Once "live" data has been imported via dataPromise, render other modules
dataPromise.then(data => {
	forceGraph(
			d3.select('.main-viz').node(),
			data
		);
});

