'using strict';

function Book(book) {
  this.title = book.title || 'No Title';
  this.authors = book.authors || 'No Author';
  this.image_url = book.imageLinks.thumbnail || 'No Image';
  this.description = book.description || 'No description';
}

module.exports = Book;