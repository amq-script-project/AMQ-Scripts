const {SocketWrapper, getToken, EVENTS} = require('../amq-api');

async function main() {
	let token = await getToken("juvian", "xxx", '../data.json');
	let socket = await new SocketWrapper().connect(token);

	let profile = await socket.social.profile.get('juvian');
	console.log(profile);

	profile = await socket.social.profile.get('`notExisting``');
	console.log(profile) 

	socket.disconnect();
}

main();
