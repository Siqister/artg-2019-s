import './style.css';
import 'bootstrap/dist/css/bootstrap.css';

import {
	mergedMigrationPromise,
	countryCodePromise,
	metadataPromise
} from './data';
import {
	filterAndNest
} from './utils';
import LineChart from './modules/LineChart';

import {nest, sum, select, event, max, dispatch} from 'd3';

//Initiate modules
//Menu module
const menu = select('.nav')
	.append('select')
	.attr('class', 'form-control form-control-sm');
//Title module
const title = select('.country-view')
	.insert('h1', '.chart-container');
//line chart mdule
const lineChart = LineChart();
lineChart
	.on('select:year', year => globalDispatch.call('update:year', null, year))	
	.on('mouseleave', () => lineChart.unHighlight());

//Global event dispatch
const globalDispatch = dispatch(
	'update:countryList',
	'update:country',
	'update:data',
	'update:year',
);
globalDispatch.on('update:countryList', updateMenu);
globalDispatch.on('update:country', updateTitle);
globalDispatch.on('update:data', updateCharts);
globalDispatch.on('update:year', year => {
	lineChart.highlightYear(year);
});

Promise.all([
		mergedMigrationPromise,
		countryCodePromise,
		metadataPromise
	]).then(([migration, countryCodeMap, metadataMap]) => {

		//DATA MANIPULATION
		//-- Merge migration data with the "subregion" attribute in metadata
		const migrationAugmented = migration.map(d => {
			//Take the 3-digit code, get metadata record
			const origin_metadata = metadataMap.get(d.origin_code);
			const dest_metadata = metadataMap.get(d.dest_code);

			if(origin_metadata){
				d.origin_subregion = origin_metadata.subregion;
			}
			if(dest_metadata){
				d.dest_subregion = dest_metadata.subregion;
			}

			return d;
		});
		//-- Filter and nest
		const data = filterAndNest(
				migrationAugmented,
				d => true,
				d => d.dest_subregion,
				d => d.year
			);
		//-- Unique list of countries
		const countries = Array.from(countryCodeMap.entries());

		//Emit events
		globalDispatch.call('update:countryList', null, countries);
		globalDispatch.call('update:country', null, 'World');
		globalDispatch.call('update:data', null, data);

		//EVENTS
		menu.on('change', function(){

			const idx = this.selectedIndex;
			const countryCode = this.value;
			const countryName = this.options[idx].innerHTML;
			const data = filterAndNest(
					migrationAugmented,
					d => d.origin_code  === countryCode,
					d => d.dest_subregion,
					d => d.year
				);

			globalDispatch.call('update:country', null, countryName);
			globalDispatch.call('update:data', null, data);

		});

	});

function updateMenu(data){
	const options = menu.selectAll('option')
		.data(data, d => d[1]);
	const optionsEnter = options.enter()
		.append('option');
	options.merge(optionsEnter)
		.attr('value', d => d[1])
		.html(d => d[0]);
}

function updateTitle(data){
	title.html(data);
}

function updateCharts(data){
	//Last bit of data discovery: find rangeY from data
	const maxY = max(data.map(subregion => max(subregion.values, d => d.value)));

	//Reconfigure line chart
	lineChart.rangeY([0, maxY]);

	const charts = select('.chart-container')
		.selectAll('.chart')
		.data(data, d => d.key);
	const chartsEnter = charts.enter()
		.append('div')
		.attr('class','chart');
	charts.merge(chartsEnter)
		.each(function(d,idx){
			lineChart(
				d.values,
				d.key,
				idx,
				this
			);
		});
	charts.exit().remove();

}