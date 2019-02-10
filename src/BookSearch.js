import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Book from './Book';
import * as BooksAPI from './utils/BooksAPI';
import SearchInput from './SearchInput';
import MessageDialog from './utils/MessageDialog';
import * as Constants from './utils/Constants';
import * as Commons from './utils/Commons.js';
import LoadingOverlay from 'react-loading-overlay';
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from '@material-ui/core/FormControlLabel';

const INIT_SEARCH = {
  books: {},
  message: null,
  loading: false,
  newShelfId: null,
  changedBook: null,
  multiSelect: false
};

/**
 *
 */
class BookSearch extends Component {
  static propTypes = {
    shelves: PropTypes.object.isRequired,
    handleUpdateShelf: PropTypes.func
  };

  state = INIT_SEARCH;

  handleSearchBooks = (query) => {
    this.setState( {loading: true}, () => {
      BooksAPI.search(query)
        .then((resultBooks) => {
          this.handleSearchBooksCallback(resultBooks, query);
        })
        .catch((error) => {
          this.setState(() => ({
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
      books = resultBooks.reduce((map, book) => {
        //identify current shelf
        Object.entries(this.props.shelves).forEach(([skey, shelf]) => {
          if (shelf.books.hasOwnProperty(book['id']))
            book['shelf'] = shelf.id;
        });
        map[book['id']] = book;
        return map;
      }, {});
    } else {
      books = {};
      message = `No book found with title or author using query '${query}'`;
    }
    this.setState(() => ({
      books,
      message,
      loading: false
    }));
  }

  handleOnUpdateShelfFinish = (error) => {
    if (error === undefined) {
      this.setState((currState) => {
        currState.loading = false;
        if (!Commons.isNull(currState.changedBook)
            && currState.changedBook.hasOwnProperty('id')) {
              const currBook = currState.books[currState.changedBook.id];
              if (!Commons.isEmpty(currState.newShelfId)
                && Constants.SHELF_ID_NONE !== currState.newShelfId)
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
    this.setState(() => ({
      newShelfId,
      changedBook,
      loading: true
    }), () => {
      this.props.handleUpdateShelf(newShelfId, changedBook, handleCallback, this.handleOnUpdateShelfFinish);
    });
  };

  handleClearBooks = () => {
    this.setState(INIT_SEARCH);
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

  handleCheckboxChange = (event) => {
    this.setState({ multiSelect: event.target.checked });
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
              handleClearBooks={this.handleClearBooks}/>
            <FormControlLabel style={{ top: "0", right: "0", float: "right" }}
              control={
                <Checkbox
                  checked={this.state.multiSelect}
                  onChange={(event) => { this.handleCheckboxChange(event) }}
                  value="false"
                  color="primary">
                  Enable Multiple Selection
              </Checkbox>
              }
              label="Multi Selection"
            />
          </div>
          <div className="search-books-results">
            <ol className="books-grid">
              { Object.entries(this.state.books).map(([key, book]) => (
                  <Book
                    key={key}
                    book={book}
                    shelfColor={book.hasOwnProperty('shelf') && !Commons.isEmpty(book.shelf) ? this.props.shelves[book.shelf].bkgColor : undefined}
                    handleUpdateShelf={this.handleUpdateShelf}
                    handleSetMessage={this.handleSetMessage}
                    isMultiSelect={this.state.multiSelect} />
                ))
              }
            </ol>
          </div>
          <MessageDialog
            title="INFORMATION"
            message={this.state.message}
            buttons={[{text: 'OK', handleClick: this.handleClearMessage}]}/>
        </div>
      </LoadingOverlay>
    )
  }
}

export default BookSearch;