const migrationDataPromise = d3.csv('../data/un-migration/Table 1-Table 1.csv', parseMigrationData)
	.then(data => data.reduce((acc,v) => acc.concat(v), []));
const countryCodePromise = d3.csv('../data/un-migration/ANNEX-Table 1.csv', parseCountryCode)
	.then(data => new Map(data));
const metadataPromise = d3.csv('../data/country-metadata.csv', parseMetadata);

// Configuration variables
const W = 280;
const H = 208;
const margin = {t:48, r:32, b:64, l:64};

Promise.all([
		migrationDataPromise,
		countryCodePromise,
		metadataPromise
	]).then(([migration, countryCode, metadata]) => {

		// Data transformation
		// Join migration with countryCode
		let data = migration.map(d => {
			d.origin_code = countryCode.get(d.origin_name);
			d.dest_code = countryCode.get(d.dest_name);
			return d;
		});

		// Convert metadata to a map
		let tmpMetadata = metadata.map(d => {
			return [d.iso_num, d]
		});
		const metadataMap = new Map(tmpMetadata);

		// Finally, join migration data to subregion
		data = data.map(d => {
			d.origin_subregion = metadataMap.get(d.origin_code)?metadataMap.get(d.origin_code).subregion:undefined;
			d.dest_subregion = metadataMap.get(d.dest_code)?metadataMap.get(d.dest_code).subregion:undefined;
			return d;
		});

		// Migration by origin subregion, by year
		const migrationByOriginSubregion = d3.nest()
			.key(d => d.origin_subregion)
			.key(d => d.year)
			.rollup(xs => d3.sum(xs, d => d.value))
			.entries(data);

		const migrationByDestSubregion = d3.nest()
			.key(d => d.dest_subregion)
			.key(d => d.year)
			.rollup(xs => d3.sum(xs, d => d.value))
			.entries(data);

		console.log(migrationByDestSubregion);

		// Draw / representation
		d3.select('.main')
			.selectAll('.module')
			.data(migrationByDestSubregion)
			.enter()
			.append('div')
			.attr('class', 'module')
			.style('width', `${W}px`)
			.style('height', `${H}px`)
			.each(function(d){
				renderLineChart(this, d.values, d.key);
			});

	});

function renderLineChart(rootDom, data, key){
	
	const w = W - margin.l - margin.r;
	const h = H - margin.t - margin.b;

	const scaleX = d3.scaleLinear().domain([1985,2020]).range([0, w]);
	const scaleY = d3.scaleLinear().domain([0, 20000000]).range([h,0]);

	const lineGenerator = d3.line()
		.x(d => scaleX(+d.key))
		.y(d => scaleY(d.value));
	const areaGenerator = d3.area()
		.x(d => scaleX(+d.key))
		.y0(h)
		.y1(d => scaleY(d.value));
	const axisXGenerator = d3.axisBottom()
		.scale(scaleX)
		.tickValues([1990, 2000, 2010, 2017])
		.tickFormat(d => "'" + String(d).slice(-2))
	const axisYGenerator = d3.axisLeft()
		.scale(scaleY)
		.tickSize(-w)
		.ticks(4)
		.tickFormat(d => d/1000 + 'k')

	// Drawing
	const plot = d3.select(rootDom)
		.append('svg')
		.attr('width', W)
		.attr('height', H)
		.append('g')
		.attr('transform', `translate(${margin.l}, ${margin.t})`);
	//Line and area <path> elements
	plot.append('path').attr('class','area')
		.datum(data)
		.attr('d', areaGenerator)
		.attr('fill-opacity', 0.05);
	plot.append('path').attr('class','line')
		.datum(data)
		.attr('d', lineGenerator)
		.attr('fill', 'none')
		.attr('stroke', '#333')
		.attr('stroke-width', '2px');
	//Axes
	plot.append('g').attr('class','axis axis-bottom')
		.attr('transform', `translate(0, ${h})`)
		.call(axisXGenerator);
	plot.append('g').attr('class','axis axis-left')
		.call(axisYGenerator);
	//Label
	d3.select(rootDom)
		.append('p').attr('class', 'label')
		.html(key)

}



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
		d.Code
	]
}

function parseMigrationData(d){
	if(+d.Code >= 900) return;

	const migrationFlows = [];
	const dest_name = d['Major area, region, country or area of destination'];
	if(!dest_name) return [];
	const year = +d.Year
	
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