import './style.css';
import 'bootstrap/dist/css/bootstrap.css';

import {
	mergedMigrationPromise,
	countryCodePromise,
	metadataPromise
} from './data';
import lineChart from './modules/LineChart';

import {nest, sum, select, event} from 'd3';

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

		//-- Filter by country of origin
		let data = migrationAugmented;

		//-- Nest by subregion of destination
		data = nest()
			.key(d => d.dest_subregion)
			.key(d => d.year)
			.rollup(values => sum(values, d => d.value))
			.entries(data);

		//-- Unique list of countries
		const countries = Array.from(countryCodeMap.entries());

		//HYDRATE VIEW MODULES WITH DATA
		//-- <select> element
		const menu = select('.nav')
			.append('select')
			.attr('class', 'form-control form-control-md');
		menu.selectAll('option')
			.data(countries)
			.enter()
			.append('option')
			.attr('value', d => d[1])
			.html(d => d[0]);

		//-- title <h1>
		const title = select('.country-view')
			.insert('h1', '.chart-container')
			.html('World');

		//-- line charts
		updateCharts(data);

		//EVENTS
		menu.on('change', function(){

			const idx = this.selectedIndex;
			const countryCode = this.value;

			//Update title
			title.html(this.options[idx].innerHTML);

			//Perform data filtering and nesting operation again
			data = migrationAugmented.filter(d => d.origin_code === countryCode);
			data = nest()
				.key(d => d.dest_subregion)
				.key(d => d.year)
				.rollup(values => sum(values, d => d.value))
				.entries(data);

			updateCharts(data);

		})

	});

function updateCharts(data){

		const charts = select('.chart-container')
			.selectAll('.chart')
			.data(data, d => d.key);
		const chartsEnter = charts.enter()
			.append('div')
			.attr('class','chart');
		charts.merge(chartsEnter)
			.each(function(d){
				lineChart(
					d.values,
					d.key,
					this
				);
			});
		charts.exit().remove();

}