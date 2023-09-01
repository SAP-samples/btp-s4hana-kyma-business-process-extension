const httpclientaxios = require("./httpclientaxios");

module.exports = {
	main: async function (event, context) {
		let msg;
		try {
			msg = JSON.parse(event.data);
		} catch (e) {
			if (event.data) {
				msg = event.data
			} else {
				return "Looks like there is some issue with the data format. Expected data format: JSON/String";
			}
		}
		const response = await httpclientaxios.postImage(context, msg, event);
		return "hello";
	}
}
