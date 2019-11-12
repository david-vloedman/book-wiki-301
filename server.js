'using strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

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

// Search

function createSearch(request, response) {
  let url = `https://www.googleapis.com/books/v1/volumes?q=`;
  
  if (request.body.search[1] === 'title') url += `+intitle:${request.body.search[0]}`;
  if (request.body.search[1] === 'author') url += `+inauthor:${request.body.search[0]}`;
  console.log(url);
  // superagent.get(url)
  //   .then(results => results.body.items.forEach(book => console.log(book.volumeInfo)));
    

  
}

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
