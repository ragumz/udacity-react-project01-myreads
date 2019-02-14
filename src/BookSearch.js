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
  /**
   * @description Map with search REST web service fetched result from backend
   */
  books: new Map(),
  /**
   * @description Text messages to be shown to the user in modal dialog
   */
  message: null,
  /**
   * @description Flag to identify the need to show a loading overlay cursor
   */
  loading: false,
  /**
   * @description Flag to show or hide Book component checkbox for multiple selection for batch update
   */
  multiSelect: false,
  /**
   * @description A collection of all selected books for batch update
   */
  selectionBookIds: new Set(),
  /**
   * @description Objet to group book batch update processing counts
   */
  selectionResult: {
    successCount: 0,
    stayedCount: 0,
    errorCount: 0,
    totalCount: 0,
  },
  /**
   * @description A text with the new selected Shelf identification for book batch update
   */
  selectedShelfId: null,
  /**
   * @description A callback function from the child to present messages to user
   */
  selectedCallback: null
};


/**
 * @description A component to search books, allowing to change shelves
 * for a single or multiple selected books.
 */
class BookSearch extends Component {

  /**
   * @description Define props' arguments' types
   */
  static propTypes = {
    shelves: PropTypes.object.isRequired,
    handleUpdateShelf: PropTypes.func,
    isMultiSelect: PropTypes.bool,
    handleMultiSelectCheck: PropTypes.func
  };

  /**
   * @description Initializes component states
   */
  state = INIT_SEARCH;

  /**
   * @description Executes a BookAPI search with a query on the WS REST
   * at backend server.
   *
   * @param {String} query Text singe or multipart Author or Title
   */
  handleSearchBooks = (query) => {
    //set the loading flag and calls de REST web service
    this.setState({ loading: true }, () => { //after setting the state, call the web service
      BooksAPI.search(query)
        //when successful REST, process the books
        .then((resultBooks) => {
          this.handleSearchBooksCallback(resultBooks, query);
        })
        //when REST error, log it and present it to the user
        .catch((error) => {
          this.setState(() => ({
            message: error.stack
          }));
          console.log(error.stack);
        })
      });
  };

  /**
   * @description Process the REST web service result searched Books array
   * into the books state Map
   *
   * @param {array} resultBooks Array with the books fetched
   * @param {string} query The text of the searched query
   */
  handleSearchBooksCallback = (resultBooks, query) => {
    let books = new Map();
    let message = null;
    try {
      if (Array.isArray(resultBooks)) {
        resultBooks.forEach((book) => {
          books.set(book.id, book);
          //for each book found locate its identifier on every shelf
          Object.entries(this.props.shelves).forEach(([skey, shelf]) => {
            if (shelf.books.has(book['id'])) {
              book['shelf'] = shelf.id;
            }
          });
        });
      } else {
        message = `No book found with title or author using query '${query}'`;
      }
    } finally {
      //assure the states in any case
      this.setState(() => ({
        books,
        message,
        loading: false
      }));
    }
  };

  /**
   * @description After invoke parent REST update function, sets the local
   * Books' object instances to avoid reloading again from the backend.
   *
   * @param {objet} error An Error object instance
   */
  handleOnUpdateShelfFinish = (error, newShelfId, book) => {
    if (!Commons.isNull(error)) {
      //if an error exists, do nothing with the book state
      return;
    }
    this.setState((currState) => {
      if (this.state.multiSelect === false) {
        //single book update, stop loading overlay
        currState.loading = false;
      }
      try {
        //only process if exists Books instance and it has and identifier
        if (!Commons.isNull(book)
          && book.hasOwnProperty('id')) {
            //get the Map object
            let currBook = currState.books.get(book.id);
            if (!Commons.isEmpty(newShelfId)
              && Constants.SHELF_ID_NONE !== newShelfId) {
              //update to a new shelf identifier
              currBook['shelf'] = newShelfId;
            } else {
              //removed from any shelf
              if (currBook.hasOwnProperty('shelf')) {
                delete currBook['shelf'];
              }
            }
        }
      } finally {
        //update the action states
        return currState;
      }
    });
  };

  /**
   * @description Invoke the parent callback to update a Book object with the REST web service operation.
   *
   * @param {string} newShelfId New shelf unique identifier
   * @param {object} book Current selected book to change shelf
   * @param {function} handleCallback Callback function to receive messages and success flag
   */
  handleUpdateShelf = (newShelfId, book, handleCallback) => {
    if (this.state.multiSelect !== true) {
      //single book update
      this.setState(() => ({
        loading: true
      }), () => {
        this.props.handleUpdateShelf(newShelfId, book, handleCallback, this.handleOnUpdateShelfFinish);
      });
    } else {
      //multiple books batch update
      this.handleMultiBookUpdate(newShelfId, handleCallback);
    }
  };

  /**
   * @description Loops over the selected books Set and invoke the the parent callback to update
   * each one with the REST web service operation.
   *
   * @param {string} newShelfId New shelf unique identifier
   * @param {function} handleCallback Callback function to receive messages and success flag
   */
  handleMultiBookUpdate = (newShelfId, handleCallback) => {
    //multiple books shelf change action
    this.setState(() => ({
      //setting correct state to start mutliple book update
      selectedShelfId: newShelfId,
      selectedCallback: handleCallback,
      selectionResult: {
        successCount: 0,
        stayedCount: 0,
        errorCount: 0,
        totalCount: 0,
      },
      loading: true
    }), () => { //after setting the state, process the books and update them
      if (this.state.selectionBookIds.size === 0) {
        handleCallback('Select one or more books to move them between shelves.');
        return;
      }
      let messages = '';
      //get each selected Book
      this.state.selectionBookIds.forEach((bookId) => {
        //get the actual state reference
        const localBook = this.state.books.get(bookId);
        try {
          //dispatch book update after state finished update
          this.props.handleUpdateShelf(newShelfId, localBook, this.handleMultiSelectCallback, this.handleOnUpdateShelfFinish);
        } catch (error) {
          console.log(`An error occurred while updating book ${localBook.title}: \n${error.stack}`);
          //keep and error message in case of erros
          messages = messages.concat(`Error ${error.message} occurred on processing book ${localBook.title}.\n`);
        }
      });
      if (!Commons.isEmpty(messages)) {
        //send a message to the child component in case of errors
        handleCallback(messages);
      }
    });
  };

  /**
   * @description Callback function to be invoked by the parent book update process to identify the
   * processing state of a book.
   *
   * @param {string} message Any text message destinated to the user, however on multiple selection
   *    the individual messages are discarded, replaced by a final global result message.
   * @param {bool} isSuccess Flag with true identifies if the book was successfully updated, false an error occured and
   *                null or undefined the book already was on the shelf.
   */
  handleMultiSelectCallback = (message, isSuccess) => {
    this.setState((currState) => ({
      selectionResult: {
        //always update total book count state
        totalCount: currState.selectionResult.totalCount+1,
        //update the successful count state
        successCount: isSuccess === true ? currState.selectionResult.successCount+1 : currState.selectionResult.successCount,
        //update the non moved book state
        stayedCount: Commons.isNull(isSuccess) ? currState.selectionResult.stayedCount+1 : currState.selectionResult.stayedCount,
        //update the error count state
        errorCount: isSuccess === false ? currState.selectionResult.errorCount+1 : currState.selectionResult.errorCount
      }
    }), this.handleOnUpdateMultiSelectFinish);  //invoke the final callback to determine the end of the process
  };

  /**
   * @description Callback function to be invoked by the end of this component multiple selection processing state
   * to identify the end of the book batch update and present the result to the user as a message on a modal dialog.
   */
  handleOnUpdateMultiSelectFinish = () => {
    //while the total count is different from book selection size the batch update is in course
    if (this.state.selectionResult.totalCount === this.state.selectionBookIds.size) {
      //it may exists a child callback function to show the result messages
      if (!Commons.isNull(this.state.selectedCallback)) {
        let destination = '';
        //select the proper message regarding the shelf exchange
        if (!Commons.isEmpty(this.state.selectedShelfId)
              && this.state.selectedShelfId !== Constants.SHELF_ID_NONE) {
          destination = `moved to shelf ${this.props.shelves[this.state.selectedShelfId].name}.`;
        } else {
          destination = 'removed from their shelves.';
        }
        let errorMessages = '';
        if (this.state.selectionResult.errorCount > 0) {
           errorMessages = `${this.state.selectionResult.errorCount} error(s) occurred.`;
        }
        //if there are any successful book updates
        if (this.state.selectionResult.successCount > 0) {
          if (this.state.selectionResult.successCount === this.state.selectionResult.totalCount) {
            //totally successful and all books updated
            this.state.selectedCallback(`All ${this.state.selectionResult.successCount} selected books were succesfully ${destination}`);
          } else {
            //parcial successful because a book already were at the shelf or an error caused its failure
            this.state.selectedCallback(`Only ${this.state.selectionResult.successCount} of ${this.state.selectionResult.totalCount} selected books were succesfully ${destination} \n${this.state.selectionResult.stayedCount} of them already were at the shelf. ${errorMessages}`);
          }
        } else {
          //Partial success of complete failure because a book already were at the shelf or an error caused its failure
          this.state.selectedCallback(`None of ${this.state.selectionResult.totalCount} selected books were ${destination} \n${this.state.selectionResult.stayedCount} of them already were at the shelf. ${errorMessages}`);
        }
      }
      //reset multi select state variables
      this.setState({
        multiSelect: false,
        selectionResult: {
          successCount: 0,
          stayedCount: 0,
          errorCount: 0,
          totalCount: 0,
        },
        selectedShelfId: null,
        selectedCallback: null
      });
    }
  };

  /**
   * @description Clears the book search state
   */
  handleClearBooks = () => {
    this.setState(INIT_SEARCH);
  };

  /**
   * @description Clear the text message of the modal dialog.
   */
  handleClearMessage = () => {
    this.handleSetMessage(null);
  };

  /**
   * @description Sets a new text message to the modal dialog.
   *
   * @param {string} message A text to be shown to the user
   */
  handleSetMessage = (message) => {
    this.setState(() => ({
      message,
      loading: false
    }))
  };

  /**
   * @description Handle multiple books selection checkbox value and state
   *
   * @param {object} event The event object of the DOM UI component
   */
  handleCheckboxChange = (event) => {
    const multiSelect = event.target.checked;
    this.setState(() => ({
      multiSelect,
      selectionBookIds: new Set(),
      selectionResult: {
        successCount: 0,
        stayedCount: 0,
        errorCount: 0,
        totalCount: 0,
      },
      selectedShelfId: null,
      selectedCallback: null
    }));
  };

  /**
   * @description Handle callback to a child component add multiple selected Book identifiers to
   * be batch updated.
   *
   * @param {object} isSelected Flag to control the Book identifier add or remove from the multiple selection Set
   * @param {object} book The selected book instance
   */
  handleMultiSelectBookCheck = (isSelected, book) => {
    if (Commons.isNull(isSelected)
      || Commons.isNull(book)) {
      return;
    }
    //update the book identifier Set, adding or removin the selected book
    this.setState((currState) => {
      if (isSelected === true) {
        currState.selectionBookIds.add(book.id);
      } else if (currState.selectionBookIds.has(book.id)) {
        currState.selectionBookIds.delete(book.id);
      }
      return currState;
    });
  };

  /**
   * @description Creates the component UI
   */
  render() {
    return(
      //loading overlay cursor componente shown by loading state flag
      <LoadingOverlay
        active={this.state.loading}
        spinner
        text='Processing...'>
        <div className="search-books">
          <div className="search-books-bar">
            { /* A link to go back to the shelves main URL */ }
            <Link className="close-search" to="/">
              Close
            </Link>
            { /* A component to treat input queries and dispatch the REST search */ }
            <SearchInput
              handleSearchBooks={this.handleSearchBooks}
              handleClearBooks={this.handleClearBooks}/>
            { /* The multiple book selection checkbox and its label */ }
            <FormControlLabel style={{ top: "0", right: "0", float: "right" }}
              control={
                <Checkbox
                  checked={this.state.multiSelect}
                  onChange={(event) => { this.handleCheckboxChange(event) }}
                  value="false"
                  color="primary">
              </Checkbox>
              }
              label="Multi Selection"
            />
          </div>
          <div className="search-books-results">
            <ol className="books-grid">
              { /* Loop over all search book values and present them on the Book component */
                Array.from(this.state.books.values()).map((book) => (
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
          {/* Modal dialog to show text messages to user */}
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