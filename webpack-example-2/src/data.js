function generateData(n){
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const arr = Array.from({length:n}).map((d,i) => ({
				value: Math.random()*5+1
			}));
			resolve(arr);
		}, 1000);
	});
}

const dataPromise = generateData(500);

export default dataPromise;