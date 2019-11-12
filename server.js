'using strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const path = require('path');
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/pages'));

app.get('/', (request, response) => {
  response.render('index');
});



app.listen(PORT, () => console.log(`Listening on ${PORT}`));
