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
  state = {
    books: {},
    message: null,
    newShelfId: null,
    changedBook: null
  };

  handleSearchBooks = (query) => {
    BooksAPI.search(query)
      .then( (resultBooks) => {
        this.handleSearchBooksCallback(resultBooks, query);
      })
      .catch((error) => {
        this.setState( () => ({
          message: error.stack
        }));
        console.log(error.stack);
      })
  };

  handleSearchBooksCallback = (resultBooks, query) => {
    let books;
    let message = null;
    if (Array.isArray(resultBooks)) {
      books = resultBooks.reduce( (map, book) => {
        //identify current shelf
        Object.entries(this.props.shelves).forEach( ([skey, shelf]) => {
          if (shelf.books[book['id']])
            book['shelf'] = shelf.id;
        });
        map[book['id']] = book;
        return map;
      }, {});
    } else {
      books = {};
      message = `No book found with title or author using query '${query}'`;
    }
    this.setState( () => ({
      books,
      message
    }));
  }

  handleOnUpdateShelfFinish = (error) => {
    if (error === undefined) {
      this.setState( (currState) => {
        if (currState.changedBook !== undefined
            && currState.changedBook.hasOwnProperty('id')) {
          currState.books[currState.changedBook.id]['shelf'] = currState.newShelfId;
        }
        currState.newShelfId = null;
        currState.changedBook = null;
        return currState;
      });
    }
  };

  handleUpdateShelf = (newShelfId, book, handleCallback) => {
    this.setState( () => ({
      newShelfId,
      changedBook: book
    }));
    this.props.handleUpdateShelf(newShelfId, book, handleCallback, this.handleOnUpdateShelfFinish);
  };

  handleClearBooks = () => {
    this.setState( () => ({
      books: [],
      newShelfId: null,
      changedBook: null
    }));
  };

  handleClearMessage = () => {
    this.handleSetMessage(null);
  };

  handleSetMessage = (message) => {
    this.setState(() => ({
      message
    }))
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
            { Object.entries(this.state.books).map( ([key, book]) => (
                <Book
                  key={key}
                  book={book}
                  shelfColor={book.shelf !== undefined ? this.props.shelves[book.shelf].bkgColor : undefined}
                  handleUpdateShelf={this.handleUpdateShelf}
                  handleSetMessage={this.handleSetMessage}
                />
              ))
            }
          </ol>
        </div>
        { this.state.message !== null &&
            (<MessageDialog
              title="INFORMATION"
              message={this.state.message}
              buttons={ [{text: 'OK', handleClick: this.handleClearMessage}] } />)
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