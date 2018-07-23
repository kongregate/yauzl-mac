'use strict';

// Modules
const yauzl = require('./lib/');
const fs = require('fs');

const path = `${__dirname}/test files/test.zip`,
	pathOut = `${__dirname}/test files/unzip/`,
	uncompress = false;

yauzl.open(path, {lazyEntries: true, autoClose: false, supportMacArchiveUtility: true}, (err, zip) => {
	if (err) throw err;

	zip.readEntry();

	console.log('zip:', cleanZip(zip));

	zip.on('entry', entry => {
		console.log('entry before:', entry);
		//console.log('zip after entry:', cleanZip(zip));

		if (!uncompress) return zip.readEntry();

		const filePath = `${pathOut}${entry.fileName}`;

		if (entry.fileName.slice(-1) == '/') {
			fs.mkdir(filePath, (err) => {
				if (err) throw err;
				zip.readEntry();
			});
			return;
		}

		zip.openReadStream(entry, (err, readStream) => {
			if (err) throw err;
			const writeStream = fs.createWriteStream(filePath);
			writeStream.on('close', () => {
				console.log('entry after:', entry);
				zip.readEntry();
			});
			readStream.pipe(writeStream);
		});
	});

	zip.on('end', () => {
		console.log('end');
		console.log('zip end:', cleanZip(zip));

		zip.close();
	});

	zip.on('close', () => {
		console.log('close');
	});

	zip.on('error', err => {
		console.log('zip end:', cleanZip(zip));
		throw err;
	});
});

function cleanZip(zip) {
	const out = {};
	for (let key in zip) {
		if (zip.hasOwnProperty(key) && ['domain', '_events', '_eventsCount', '_maxListeners', 'reader', '_interceptors'].indexOf(key) == -1) out[key] = zip[key];
	}
	return out;
}
