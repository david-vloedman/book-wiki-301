'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();
const methodOverride = require('method-override');



// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Setup methodOverride
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    // look in urlencoded POST bodies and delete it
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}));
// Setup DB
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');


// API Routes
app.get('/', getBooks); //define route to get all books
app.get('/searches/new', newSearch);
app.post('/searches', createSearch);
app.post('/books', createBook)
app.get('/books/:id', getOneBook);



app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// HELPER FUNCTIONS
function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';

  // If every image path is changed to HTTPS, every image doesn't display.
  let httpRegex = /^(http:\/\/)/g

  this.title = info.title ? info.title : 'No title available';
  this.author = info.authors ? info.authors[0] : 'No author available';
  this.isbn = info.industryIdentifiers ? `ISBN_13 ${info.industryIdentifiers[0].identifier}` : 'No ISBN available';
  this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail : placeholderImage;
  this.description = info.description ? info.description : 'No description available';
  this.id = info.industryIdentifiers ? `${info.industryIdentifiers[0].identifier}` : '';
}

function newSearch(request, response) {
  response.render('pages/searches/new');
}

function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchResults: results }))
    .catch(err => handleError(err, response));
}

function getBooks(request, response) {
  let SQL = `SELECT * FROM BOOKS`;  
  client.query(SQL).then(results => {
    const bookCount = results.rowCount;
    const books = results.rows.map(book => new Book(book));
    response.render('pages/index', { savedBooks: books, bookCount: bookCount });
  });
}

function createBook(request, response) {
  
  const { author, title, isbn, image_url, description, bookshelf } = request.body;
  
  //create a SQL statement to insert book
  //return id of book back to calling function
  let SQL = `INSERT INTO books (author, title, isbn, image_url, description, book_shelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
  const values = [author, title, isbn, image_url, description, bookshelf];
  
  return client.query(SQL, values)
    .then(result => {
      response.redirect(`/books/${result.rows[0].id}`);
      // response.render(`books/${}`);
    });
}

function getOneBook(request,response){
  getBookShelves()
    .then(shelves => {
      let SQL = 'SELECT * FROM books WHERE id=$1';
      let values = [request.params.id];
      return client.query(SQL, values)
        .then(result => response.render('pages/books/book_detail', {book: result.rows[0], shelves: shelves.rows}))
    })
    .catch(handleError);
}
function getBookShelves() {
  let SQL = 'SELECT DISTINCT book_shelf FROM books ORDER BY book_shelf';
  return client.query(SQL);
}


function handleError(error, response) {
  response.render('pages/error', { error: error });
}
