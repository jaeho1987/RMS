#!/usr/bin/env node
const express = require('express');
const app = express();
const mode = process.argv[2];
const open = require('open');
const port = 3000;

// dev. mode
// this code block is unnecessary for normal usage of the component
if (mode) {
	//enable cors
	app.use(require('cors')())
	//redirects
	const redirects = require("./redirects.json");
	app.use((req, res, next) => {
		const newUrl = redirects[req.url];
		if (newUrl) res.redirect(newUrl);
		else next();
	});
	// server static samples
	app.use(express.static("./"));
}





require("./common")(app, express);
require("./saverename")(app, express);

app.listen(port, () => console.log(`run on port ${port}`));




// dev. mode
// this code block is unnecessary for normal usage of the component
if (mode && mode !== "site"){
	// open samples in browser
	(async () => {
		await open(`http://localhost:${port}/${process.argv[2]}`);
	})();
}
