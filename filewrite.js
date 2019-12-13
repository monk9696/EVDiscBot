const fs = require('fs');

class fileWrite{

	constructor(){
	}

	//out put the object in data to the file listed at file
	output(data,file){
		let output = JSON.stringify(data, null, 2);
		fs.writeFile(file, output, (err) => {
			if(err) throw err;
		})
	}
}

module.exports = fileWrite;