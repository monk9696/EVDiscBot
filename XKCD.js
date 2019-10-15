const fetch = require('node-fetch');
const fs = require('fs');

class xkcd{

	constructor(){
	}

	getKCD(){
		console.log("Starting to get XKCD");

		fetch("https://xkcd.com/rss.xml")
		.catch(e=> console.log(e))
		.then((body) => body.text())
		.then((data) => {
			//console.log(data)

			let temp = this.parseXML(data);
			console.log(temp);
			/*
			fs.writeFile('xkcd.txt', data, (err) =>{
				if(err) throw err;
			})*/

		});
	}
	

	parseXML(data){
		let items = [];
		let posa = data.indexOf("<item>", 0);
		let posb = data.indexOf("</item>", posa);
		while(posa != -1){
			posa + 6;
			let temp = data.slice(posa, posb);
			//console.log(temp);
			let desc = temp.slice(temp.indexOf("<description>") + 13,temp.indexOf("</description>"));
			let item = {
				title: temp.slice(temp.indexOf("<title>") + 7,temp.indexOf("</title>")),
				link:  temp.slice(temp.indexOf("<link>") + 6,temp.indexOf("</link>")),
				img: desc.slice(desc.indexOf('src="') + 5, desc.indexOf('" title')),
				hover: desc.slice(desc.indexOf("title=") + 7, desc.indexOf('" alt="')),
				pubDate: temp.slice(temp.indexOf("<pubDate>") + 9,temp.indexOf("</pubDate>")),
				guid: temp.slice(temp.indexOf("<guid>") + 6,temp.indexOf("</guid>")),
			}


			items.push(item);
			posa = data.indexOf("<item>", posb);
			posb = data.indexOf("</item>", posa);

		}
		return items;
	}
}
	


module.exports = xkcd;