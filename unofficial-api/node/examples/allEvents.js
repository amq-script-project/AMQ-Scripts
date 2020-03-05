const {SocketWrapper, getToken, EVENTS, sleep} = require('../amq-api');

async function main() {
	let token = await getToken("juvian", "xxx", '../data.json');
	let socket = new SocketWrapper()

	let listener = socket.on(EVENTS.ALL, (data, listener, fullData) => {
		console.log(data);
	});

	await socket.connect(token);

	listener.destroy();

	await sleep(1000);

	socket.disconnect();
}

main();
