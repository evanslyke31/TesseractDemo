const express = require('express')
const app = express()
const port = 3002

app.get('/', (req, res) => {
	res.sendfile('index.html');
})

app.get('/landing.js', (req, res) => {
	res.sendfile('landing.js');
})

app.get('/two.js', (req, res) => {
	res.sendfile('two.js');
})

app.get('/upload.js', (req, res) => {
	res.sendfile('upload.js');
})

app.listen(port, () => {
	console.log(`listening at http://localhost:${port}`);
})
