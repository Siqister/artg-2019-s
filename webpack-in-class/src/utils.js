import {nest, sum} from 'd3';

//Utility functions for parsing metadata, migration data, and country code
function parseMetadata(d){
	return {
		iso_a3: d.ISO_A3,
		iso_num: d.ISO_num,
		developed_or_developing: d.developed_or_developing,
		region: d.region,
		subregion: d.subregion,
		name_formal: d.name_formal,
		name_display: d.name_display,
		lngLat: [+d.lng, +d.lat]
	}
}

function parseCountryCode(d){
	return [
		d['Region, subregion, country or area'],
		d.Code.padStart(3, '0')
	]
}

function parseMigrationData(d){

	const migrationFlows = [];
	const dest_name = d['Major area, region, country or area of destination'];
	const year = +d.Year

	if(+d.Code >= 900 || dest_name === '') return;
	
	delete d.Year;
	delete d['Sort order'];
	delete d['Major area, region, country or area of destination'];
	delete d.Notes;
	delete d.Code;
	delete d['Type of data (a)'];
	delete d.Total;

	for(let key in d){
		const origin_name = key;
		const value = d[key];

		if(value !== '..'){
			migrationFlows.push({
				origin_name,
				dest_name,
				year,
				value: +value.replace(/,/g, '')
			})
		}
	}

	return migrationFlows;
}

function filterAndNest(data, filterBy, ...nestBy){
	//filter data
	let _data = data.filter(filterBy);

	//Create nesting function
	let nestFunc = nest();
	nestBy.forEach(n => {
		nestFunc = nestFunc.key(n);
	});
	nestFunc = nestFunc.rollup(values => sum(values, d => d.value));

	return nestFunc.entries(_data);
}

export {parseMetadata, parseCountryCode, parseMigrationData, filterAndNest}