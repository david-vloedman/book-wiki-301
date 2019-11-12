'using strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const Book = require('./api_modules/book.js');

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');


app.get('/', newSearch);

function newSearch(request, response) {
  response.render('pages/index');
}

app.post('/searches', createSearch);

app.get('*', (request, response) => response.status(404).send('This route does not exist'));

function showError(request, response) {
  response.render('pages/error');
}



function createSearch(request, response) {
  let url = `https://www.googleapis.com/books/v1/volumes?q=`;
  
  if (request.body.search[1] === 'title') url += `+intitle:${request.body.search[0]}`;
  if (request.body.search[1] === 'author') url += `+inauthor:${request.body.search[0]}`;  
  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(book => new Book(book.volumeInfo)))
    .then(results => response.render('pages/show', { searchResults: results }));  
}

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
