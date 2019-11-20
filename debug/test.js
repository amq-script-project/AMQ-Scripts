let AmqAwesomeplete = require('./amqAwesomeplete').AmqAwesomeplete;
let FilterManager = require('../gameplay/amqAutocomplete.user.js').FilterManager;
let animes = require('./animes.js').animes;
let awesomeplete = require('Awesomplete')

function noop() {}

global.document = {createElement: (a) => ({setAttribute: noop, addEventListener:noop})}
awesomeplete.$.create = () => ({addEventListener:noop})


function ms(t) {
	return (t[1] / 1000000) + 'ms';
}

function hrtime(arg) {
	return process.hrtime(arg);
}


(async function() {
	let longAnimeList = animes.concat(animes, animes, animes, animes);

	for (let list of [animes, longAnimeList]) {

		let t = hrtime()
		amq = new AmqAwesomeplete({setAttribute: noop, getAttribute: noop, addEventListener: noop, hasAttribute: noop}, {list: list, minChars: 1, maxItems: 25})
		console.info("amq setup " + ms(hrtime(t)))
		t = hrtime()
		filterManager = new FilterManager(list, amq.maxItems)
		console.info("my setup " + ms(hrtime(t)))

		let searches = ["shingeki", "art", "ouooouooou", "ōōōōō", "ooo"];

		console.log(list.length, amq.maxItems, filterManager.list.length)

	    for (let s of searches) {
			amq.input.value = '';
			for (let c of s.split('')) {
			    amq.input.value += c;
			    try {
			    	let t = hrtime()
			    	let results = await amq.evaluate()
			    	let t2 =  hrtime(t)
			    	let t3 = hrtime()
			    	let results2 = filterManager.filterBy(amq.input.value)
			    	let t4 =  hrtime(t3)
			    	console.info(amq.input.value + ' amq ' + ms(t2) + ' mine ' + ms(t4)) 

			    	if (results.length != results2.length && amq.input.value != 'ōō') console.log(results.length, results2.length, results, results2)	
				} catch (ex) {console.log(ex)}
			}
		}
	}
})()
