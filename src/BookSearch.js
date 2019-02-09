import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Book from './Book';
import * as BooksAPI from './utils/BooksAPI';
import SearchInput from './SearchInput';
import MessageDialog from './utils/MessageDialog';
import * as Constants from './utils/Constants';
import LoadingOverlay from 'react-loading-overlay';

/**
 *
 */
class BookSearch extends Component {
  static propTypes = {
    shelves: PropTypes.object.isRequired,
    handleUpdateShelf: PropTypes.func
  };

  state = {
    books: {},
    message: null,
    loading: false,
    newShelfId: null,
    changedBook: null
  };

  handleSearchBooks = (query) => {
    this.setState( {loading: true}, () => {
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
      });
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
      message,
      loading: false
    }));
  }

  handleOnUpdateShelfFinish = (error) => {
    if (error === undefined) {
      this.setState( (currState) => {
        currState.loading = false;
        if (currState.changedBook !== undefined
            && currState.changedBook !== null
            && currState.changedBook.hasOwnProperty('id')) {
              const currBook = currState.books[currState.changedBook.id];
              if (currState.newShelfId !== null && Constants.SHELF_ID_NONE !== currState.newShelfId)
                currBook['shelf'] = currState.newShelfId;
              else if (currBook.hasOwnProperty('shelf'))
                delete currBook['shelf'];
        }
        currState.newShelfId = null;
        currState.changedBook = null;
        return currState;
      });
    }
  };

  handleUpdateShelf = (newShelfId, changedBook, handleCallback) => {
    this.setState( () => ({
      newShelfId,
      changedBook,
      loading: true
    }), () => {
      this.props.handleUpdateShelf(newShelfId, changedBook, handleCallback, this.handleOnUpdateShelfFinish);
    });
  };

  handleClearBooks = () => {
    this.setState( () => ({
      books: [],
      newShelfId: null,
      changedBook: null,
      loading: false
    }));
  };

  handleClearMessage = () => {
    this.handleSetMessage(null);
  };

  handleSetMessage = (message) => {
    this.setState(() => ({
      message,
      loading: false
    }))
  };

  render() {
    return(
      <LoadingOverlay
        active={this.state.loading}
        spinner
        text='Processing...'>
        <div className="search-books">
          <div className="search-books-bar">
            <Link className="close-search" to="/">
              Close
            </Link>
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
                    shelfColor={book.shelf !== undefined && book.shelf !== null ? this.props.shelves[book.shelf].bkgColor : undefined}
                    handleUpdateShelf={this.handleUpdateShelf}
                    handleSetMessage={this.handleSetMessage}
                  />
                ))
              }
            </ol>
          </div>
          <MessageDialog
            title="INFORMATION"
            message={this.state.message}
            buttons={ [{text: 'OK', handleClick: this.handleClearMessage}] }
          />
        </div>
      </LoadingOverlay>
    )
  }
}

export default BookSearch;