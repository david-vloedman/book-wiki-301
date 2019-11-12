'using strict';

function Book(book) {
  this.title = book.title || 'No Title'
  this.author = book.author || 'No Author'
  this.image_url = book.image_url || 'No Image'
  this.description = book.description || 'No description';
}