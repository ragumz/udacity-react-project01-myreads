import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Shelf from './Shelf';
import * as Commons from './utils/Commons.js';
import * as Constants from './utils/Constants.js';
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from '@material-ui/core/FormControlLabel';

/**
 * @description React component to manage all the book shelves
 */
class Shelves extends Component {

  /**
   * @description Define props' arguments' types
   */
  static propTypes = {
    shelves: PropTypes.object.isRequired,
    handleUpdateShelf: PropTypes.func.isRequired,
    handleSetMessage: PropTypes.func.isRequired,
  };

  /**
   * @description Initializes component states
   */
  state = {
    multiSelect: false,
    selectionBooks: new Set(),
    selectionResult: {
      successCount: 0,
      stayedCount: 0,
      errorCount: 0,
      totalCount: 0,
    },
    selectedShelfId: null,
    selectedCallback: null
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
      selectionBooks: new Set(),
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
   * @description Callback to child components to manage multiple books selection state
   *
   * @param {bool} isSelected Flag to determine if it is checked or not
   * @param {object} book The full book object
   */
  handleMultiSelectBookCheck = (isSelected, book) => {
    //if all arguments are valid change the state
    if (!Commons.isNull(isSelected)
      && !Commons.isNull(book))
      this.setState((currState) => {
        if (isSelected === true)
          //add a book to the multiple selection set
          currState.selectionBooks.add(book);
        else if (currState.selectionBooks.has(book))
          //remove a book from the multiple selection set
          currState.selectionBooks.delete(book);
        return currState;
      });
  };

  /**
   * @description Function to override and call the parent props.handleUpdateShelf() function.
   *    Its objective is to call the REST web service on parent component to a single book action
   *    or to handle multiple selected books.
   *
   * @param {bool} isSelected Flag to determine if it is checked or not
   * @param {object} book The full book object
   */
  handleUpdateShelf = (newShelfId, changedBook, handleCallback, handleOnUpdateShelfFinish) => {
    if (this.state.multiSelect === false) {
      //single book shelf change action
      this.props.handleUpdateShelf(newShelfId, changedBook, handleCallback, handleOnUpdateShelfFinish);
    } else {
      //update multiple selected books
      this.handleMultiBookUpdate(newShelfId, handleCallback);
    }
  };

  /**
   * @description Function to override and call the parent props.handleUpdateShelf() function.
   *    Its objective is to call the REST web service on parent component to a single book action
   *    or to handle multiple selected books.
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
      }
    }), () => { //after setting the state, process the books and update them
      if (this.state.selectionBooks.size === 0) {
        //no book is selected
        handleCallback('Select one or more books to move them between shelves.');
        return;
      }
      let messages = '';
      //loop over the selected books
      this.state.selectionBooks.forEach((book) => {
        try {
          //update their shelves on the parent function
          this.props.handleUpdateShelf(newShelfId, book, this.handleMultiSelectCallback);
        } catch (error) {
          //in case of unknown error, keep a message to show
          messages = messages.concat(`Error ${error.message} occurred on processing book ${book.title}.\n`);
        }
      });
      if (!Commons.isEmpty(messages)) {
        //send a message to the child component in case of errors
        handleCallback(messages);
      }
      //executes the last function callback to calculate the update books and present a message to the user
//      this.handleOnUpdateMultiSelectFinish();
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
    if (this.state.selectionResult.totalCount === this.state.selectionBooks.size) {
      //it may exists a child callback function to show the result messages
      if (!Commons.isNull(this.state.selectedCallback)) {
        let destination = '';
        //select the proper message regarding the shelf exchange
        if (!Commons.isEmpty(this.state.selectedShelfId)
              && this.state.selectedShelfId !== Constants.SHELF_ID_NONE) {
          destination = `moved to shelf ${this.props.shelves[this.state.selectedShelfId].name}`;
        } else {
          destination = 'removed from their shelves'
        }
        //if there are any successful book updates
        if (this.state.selectionResult.successCount > 0) {
          if (this.state.selectionResult.successCount === this.state.selectionResult.totalCount) {
            //totally successful and all books updated
            this.state.selectedCallback(`All ${this.state.selectionResult.successCount} selected books were succesfully ${destination}.`);
          } else {
            //parcial successful because a book already were at the shelf or an error caused its failure
            this.state.selectedCallback(`Only ${this.state.selectionResult.successCount} of ${this.state.selectionResult.totalCount} selected books were succesfully ${destination}. \n${this.state.selectionResult.stayedCount} of them already were at the shelf. ${this.state.selectionResult.errorCount === 0 ? 'No' : this.state.selectionResult.errorCount } errors ocurred.`);
          }
        } else {
          //Partial success of complete failure because a book already were at the shelf or an error caused its failure
          this.state.selectedCallback(`None of ${this.state.selectionResult.totalCount} selected books were ${destination}. \n${this.state.selectionResult.stayedCount} of them already were at the shelf. ${this.state.selectionResult.errorCount === 0 ? 'No' : this.state.selectionResult.errorCount } errors ocurred.`);
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

  render() {
    return (
      <div>
        <div className="list-books-title">
          {/*  */}
          <h1>MyReads</h1>
          <FormControlLabel style={{top: "0", right: "0", float: "right"}}
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
        <div className="list-books-content">
          {Object.entries(this.props.shelves).map(([key, shelf]) => (
            <Shelf
              key={key}
              shelf={shelf}
              handleUpdateShelf={this.handleUpdateShelf}
              handleSetMessage={this.props.handleSetMessage}
              isMultiSelect={this.state.multiSelect}
              handleMultiSelectCheck={this.handleMultiSelectBookCheck} />
          ))}
        </div>
        <Link className="open-search" to="/search">Add a book</Link>
      </div>
    );
  }
}

export default Shelves;
