const {SocketWrapper, getToken, EVENTS, sleep} = require('../amq-api');

async function main() {
	let token = await getToken("juvian", "xxx", '../data.json');
	let socket = await new SocketWrapper().connect(token);

	socket.on(EVENTS.PLAYER_COUNT, (data) => {
		console.log("Player count updated!", data);
	});

	await sleep(30000);

	socket.disconnect();
}

main();
