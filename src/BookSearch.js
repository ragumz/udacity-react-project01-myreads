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

/**
 * Initialization state for BookSearch component
 */
const INIT_SEARCH = {
  books: new Map(),
  message: null,
  loading: false,
  newShelfId: null,
  changedBook: null,
  multiSelect: false,
  selectionBookIds: new Set(),
  selectionSuccessCount: 0,
  selectionTotalCount: 0,
  selectedShelfId: null,
  selectedCallback: null
};

/**
 * A component to search books,
 * allowing to change shelves for a single or multiple books
 */
class BookSearch extends Component {
  static propTypes = {
    shelves: PropTypes.object.isRequired,
    handleUpdateShelf: PropTypes.func,
    isMultiSelect: PropTypes.bool,
    handleMultiSelectCheck: PropTypes.func
  };

  state = INIT_SEARCH;

  /**
   * Executes a BookAPI search with a query on the WS REST
   * at backend server.
   *
   * @param {String} query Text singe or multipart Author or Title
   */
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
      books = new Map();
      resultBooks.forEach((book) => {
        books.set(book.id, book);
        Object.entries(this.props.shelves).forEach(([skey, shelf]) => {
          if (shelf.books.has(book['id']))
            book['shelf'] = shelf.id;
        });
      });
      /*books = resultBooks.reduce((map, book) => {
        //identify current shelf
        Object.entries(this.props.shelves).forEach(([skey, shelf]) => {
          if (shelf.books.has(book['id']))
            book['shelf'] = shelf.id;
        });
        map[book['id']] = book;
        return map;
      }, {});*/
    } else {
      books = new Map();
      message = `No book found with title or author using query '${query}'`;
    }
    this.setState(() => ({
      books,
      message,
      loading: false
    }));
  };

  handleOnUpdateShelfFinish = (error) => {
    if (Commons.isNull(error)) {
      this.setState((currState) => {
        if (this.state.multiSelect === false)
          currState.loading = false;
        if (!Commons.isNull(currState.changedBook)
            && currState.changedBook.hasOwnProperty('id')) {
              const currBook = currState.books.get(currState.changedBook.id);
              if (!Commons.isEmpty(currState.newShelfId)
                && Constants.SHELF_ID_NONE !== currState.newShelfId) {
                currBook['shelf'] = currState.newShelfId;
              } else {
                if (currBook.hasOwnProperty('shelf'))
                  delete currBook['shelf'];
              }
        }
        currState.newShelfId = null;
        currState.changedBook = null;
        return currState;
      });
    }
  };


  handleUpdateShelf = (newShelfId, changedBook, handleCallback) => {
    if (this.state.multiSelect === false) {
      //single book update
      this.setState(() => ({
        newShelfId,
        changedBook,
        loading: true
      }), () => {
        this.props.handleUpdateShelf(newShelfId, changedBook, handleCallback, this.handleOnUpdateShelfFinish);
      });
    } else {
      //multiple books update
      this.handleMultiBookUpdate(newShelfId, handleCallback);
    }
  };


  handleMultiBookUpdate = (newShelfId, handleCallback) => {
    //multiple books shelf change action
    this.setState(() => ({
      //setting
      selectedShelfId: newShelfId,
      selectedCallback: handleCallback,
      selectionSuccessCount: 0,
      selectionTotalCount: 0,
      loading: true
    }), () => {
      if (this.state.selectionBookIds.size === 0) {
        handleCallback('Select one or more books to move them between shelves.');
        return;
      }
      let messages = '';
      this.state.selectionBookIds.forEach((bookId) => {
        //get the actual state reference
        const localBook = this.state.books.get(bookId);
        try {
          //update book locator reference
          this.setState(() => ({
            newShelfId,
            changedBook: localBook
          }), () => {
            //dispatch book update after state finished update
            this.props.handleUpdateShelf(newShelfId, localBook, this.handleMultiSelectCallback, this.handleOnUpdateShelfFinish);
          });
        } catch (error) {
          messages = messages.concat(`Error ${error.message} occurred on processing book ${localBook.title}.\n`);
        }
      });
      if (!Commons.isEmpty(messages))
        handleCallback(messages);
      this.handleOnUpdateMultiSelectFinish();
    });
  };

  handleMultiSelectCallback = (message, isSuccess) => {
    if (isSuccess === true) {
      this.setState((currState) => ({
        selectionSuccessCount: currState.selectionSuccessCount+1,
        selectionTotalCount: currState.selectionTotalCount+1
      }), this.handleOnUpdateMultiSelectFinish);
    } else {
      this.setState((currState) => ({
        selectionTotalCount: currState.selectionTotalCount+1
      }), this.handleOnUpdateMultiSelectFinish);
    }
  };

  handleOnUpdateMultiSelectFinish = (error) => {
    if (this.state.selectionTotalCount === this.state.selectionBookIds.size) {
      if (!Commons.isNull(this.state.selectedCallback)) {
        let destination = '';
        if (!Commons.isEmpty(this.state.selectedShelfId)
              && this.state.selectedShelfId !== Constants.SHELF_ID_NONE)
          destination = ` moved to shelf ${this.props.shelves[this.state.selectedShelfId].name}`;
        else
          destination = ' removed from their shelves'
        if (this.state.selectionSuccessCount > 0) {
          if (this.state.selectionSuccessCount === this.state.selectionTotalCount)
            this.state.selectedCallback(`All ${this.state.selectionSuccessCount} of ${this.state.selectionTotalCount} selected books were succesfully  ${destination}.`);
          else
            this.state.selectedCallback(`Only ${this.state.selectionSuccessCount} of ${this.state.selectionTotalCount} selected books were succesfully ${destination}. \n${this.state.selectionTotalCount-this.state.selectionSuccessCount} of them already were at the shelf or errors ocurred.`);
        } else {
          this.state.selectedCallback(`None of ${this.state.selectionTotalCount} selected books were ${destination}. \n${this.state.selectionTotalCount-this.state.selectionSuccessCount} of them already were at the shelf or errors ocurred.`);
        }
      }
      //reset multi select state variables
      this.setState({
        multiSelect: false,
        selectionSuccessCount: 0,
        selectionTotalCount: 0,
        selectedShelfId: null,
        selectedCallback: null,
        loading: false
      });
    }
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
    const multiSelect = event.target.checked;
    this.setState(() => ({
      multiSelect,
      selectionBookIds: new Set(),
      selectionSuccessCount: 0,
      selectionTotalCount: 0,
      selectedShelfId: null,
      selectedCallback: null
    }));
  };

  handleMultiSelectBookCheck = (isSelected, book) => {
    this.setState( (currState) => {
      if (isSelected === true)
        currState.selectionBookIds.add(book.id);
      else if (currState.selectionBookIds.has(book.id))
        currState.selectionBookIds.delete(book.id);
      return currState;
    })
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
              { Array.from(this.state.books.values()).map((book) => (
                //Object.entries(this.state.books).map(([key, book]) => (
                  <Book
                    key={book.id}
                    book={book}
                    shelfColor={book.hasOwnProperty('shelf') && !Commons.isEmpty(book.shelf) ? this.props.shelves[book.shelf].bkgColor : undefined}
                    handleUpdateShelf={this.handleUpdateShelf}
                    handleSetMessage={this.handleSetMessage}
                    isMultiSelect={this.state.multiSelect}
                    handleMultiSelectCheck={this.handleMultiSelectBookCheck} />
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