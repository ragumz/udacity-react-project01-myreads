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
 *
 */
class Shelves extends Component {
  static propTypes = {
    shelves: PropTypes.object.isRequired,
    handleUpdateShelf: PropTypes.func.isRequired,
    handleSetMessage: PropTypes.func.isRequired,
  };

  state = {
    multiSelect: false,
    selectionBooks: new Set(),
    selectionSuccessCount: 0,
    selectionTotalCount: 0,
    selectedShelfId: null,
    selectedCallback: null
  }

  handleCheckboxChange = (event) => {
    const multiSelect = event.target.checked;
    this.setState(() => ({
      multiSelect,
      selectionBooks: new Set(),
      selectionSuccessCount: 0,
      selectionTotalCount: 0,
      selectedShelfId: null,
      selectedCallback: null
    }));
  };

  handleMultiSelectBookCheck = (isSelected, book) => {
    if (!Commons.isNull(isSelected)
      && !Commons.isNull(book))
      this.setState( (currState) => {
        if (isSelected === true)
          currState.selectionBooks.add(book);
        else if (currState.selectionBooks.has(book))
          currState.selectionBooks.delete(book);
        return currState;
      });
  };

  handleUpdateShelf = (newShelfId, changedBook, handleCallback, handleOnUpdateShelfFinish) => {
    if (this.state.multiSelect === false) {
      //single book shelf change action
      this.props.handleUpdateShelf(newShelfId, changedBook, handleCallback, handleOnUpdateShelfFinish);
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
      selectionTotalCount: 0
    }), () => {
      if (this.state.selectionBooks.size === 0) {
        handleCallback('Select one or more books to move them between shelves.');
        return;
      }
      let messages = '';
      this.state.selectionBooks.forEach((book) => {
        try {
          this.props.handleUpdateShelf(newShelfId, book, this.handleMultiSelectCallback);
        } catch (error) {
          messages = messages.concat(`Error ${error.message} occurred on processing book ${book.title}.\n`);
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
    if (this.state.selectionTotalCount === this.state.selectionBooks.size) {
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
        selectedCallback: null
      });
    }
  };

  render() {
    return (
      <div>
        <div className="list-books-title">
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
