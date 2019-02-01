import {
	parseMetadata, 
	parseCountryCode, 
	parseMigrationData
} from './utils';

import {csv} from 'd3';

const migrationDataPromise = csv('./data/un-migration/Table 1-Table 1.csv', parseMigrationData)
	.then(data => data.reduce((acc,v) => acc.concat(v), []));

const countryCodePromise = csv('./data/un-migration/ANNEX-Table 1.csv', parseCountryCode)
	.then(data => new Map(data));

const metadataPromise = csv('./data/country-metadata.csv', parseMetadata)
	.then(metadata => {

		const metadata_tmp = metadata.map(a => {
			return [a.iso_num, a]
		});
		const metadataMap = new Map(metadata_tmp);	

		return metadataMap;

	});

//Merge migrationData and countryCode before exporting
const mergedMigrationPromise = Promise.all([
		migrationDataPromise,
		countryCodePromise
	]).then(([migration, countryCode]) => {

		const migrationAugmented = migration.map(d => {

			const origin_code = countryCode.get(d.origin_name);
			const dest_code = countryCode.get(d.dest_name);

			d.origin_code = origin_code;
			d.dest_code = dest_code;

			return d;

		});

		return migrationAugmented;

	});

export {mergedMigrationPromise, countryCodePromise, metadataPromise}
