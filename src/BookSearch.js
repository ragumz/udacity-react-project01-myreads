import React, { Component } from "react";
import "./App.css";
import PropTypes from "prop-types";
import { Link } from 'react-router-dom'
import Book from './Book'
import * as BooksAPI from './utils/BooksAPI'
import SearchInput from './SearchInput'
import MessageDialog from './utils/MessageDialog'

/**
 *
 */
class BookSearch extends Component {
  state = {
    books: []
  };

  handleSearchBooks = (query) => {
    BooksAPI.search(query)
      .then( (resultBooks) => {
        let books;
        if (Array.isArray(resultBooks))
          books = [...resultBooks];
        else
          books = [];
        this.setState( () => ({
          books
        }))
      })
      .catch((error) => {
        //this.setState(() => ({ error }))
        console.log(error.stack);
      })
  };

  render() {
    return(
      <div className="search-books">
        <div className="search-books-bar">
          <Link className="close-search" to="/">Close</Link>
          <SearchInput handleSearchBooks={this.handleSearchBooks} />
          <MessageDialog title='AVISO' message='Type search query!' />
        </div>
        <div className="search-books-results">
          <ol className="books-grid">
            { this.state.books.map( (book) => (
                <Book key={book.id} book={book} />
              ))
            }
          </ol>
        </div>
      </div>
    )
  }
}

BookSearch.propTypes = {
  handleUpdateShelf: PropTypes.func
};

export default BookSearch;