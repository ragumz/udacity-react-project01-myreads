import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'
import Book from './Book'
import * as BooksAPI from './utils/BooksAPI'
import SearchInput from './SearchInput'
import MessageDialog from './utils/MessageDialog'

/**
 *
 */
class BookSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      books: [],
      message: null,
    };

    this.oldShelfId = null;  //TODO resolver com atributo local ou state??
    this.newShelfId = null;
    this.changedBook = null;
  }

  handleSearchBooks = (query) => {
    BooksAPI.search(query)
      .then( (resultBooks) => {
        let books;
        let message = null;
        if (Array.isArray(resultBooks)) {
          books = [...resultBooks];
        } else {
          books = [];
          message = `No book found with title or author using query '${query}'`;
        }
        this.setState( () => ({
          books,
          message
        }));
      })
      .catch((error) => {
        this.setState( () => ({
          message: error.stack
        }));
        console.log(error.stack);
      })
  };

  handleOnUpdateShelfFinish = (error) => {
    if (error === undefined && this.changedBook !== undefined) {
      this.setState( (currState) => {
        currState.books[this.changedBook.id].shelf = this.newShelfId;
        return currState;
      });
    }
    this.oldShelfId = null;
    this.newShelfId = null;
    this.changedBook = null;
  };

  handleUpdateShelf = (newShelfId, book, handleCallback) => {
    this.oldShelfId = book.shelf;
    this.newShelfId = newShelfId;
    this.changedBook = book;
    this.props.handleUpdateShelf(newShelfId, book, handleCallback, this.handleOnUpdateShelfFinish);
  };

  handleClearBooks = () => {
    this.setState( () => ({
      books: []
    }));
  };

  render() {
    return(
      <div className="search-books">
        <div className="search-books-bar">
          <Link className="close-search" to="/">Close</Link>
          <SearchInput
            handleSearchBooks={this.handleSearchBooks}
            handleClearBooks={this.handleClearBooks}
          />
        </div>
        <div className="search-books-results">
          <ol className="books-grid">
            { this.state.books.map( (book) => (
                <Book
                  key={book.id}
                  book={book}
                  shelfColor={ book.shelf !== undefined ? this.props.shelves[book.shelf].bkgColor : undefined }
                  handleUpdateShelf={this.handleUpdateShelf}
                />
              ))
            }
          </ol>
        </div>
        { (this.state.message !== null) &&
            <MessageDialog
              title="INFORMATION"
              message={this.state.message}
              buttons={ [{text: 'OK', handleClick: this.handleClearMessage}] } />
        }
      </div>
    )
  }
}

BookSearch.propTypes = {
  shelves: PropTypes.object.isRequired,
  handleUpdateShelf: PropTypes.func
};

export default BookSearch;