import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Shelf from './Shelf';
import * as Commons from './utils/Commons.js';
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
    selectionBooks: {},
    selectionSuccessCount: 0,
    selectionTotalCount: 0,
    selectedShelfId: null,
    selectedCallback: null
  }

  handleCheckboxChange = (event) => {
    const multiSelect = event.target.checked;
    this.setState(() => ({
      multiSelect,
      selectionBooks: {},
      selectionSuccessCount: 0,
      selectionTotalCount: 0,
      selectedShelfId: null,
      selectedCallback: null
    }));
  };

  handleMultiSelectBookCheck = (isSelected, book) => {
    this.setState( (currState) => {
      if (isSelected === true)
        currState.selectionBooks[book.id] = book;
      else if (currState.selectionBooks.hasOwnProperty(book.id))
        delete currState.selectionBooks[book.id];
      return currState;
    })
  }

  handleUpdateShelf = (newShelfId, changedBook, handleCallback, handleOnUpdateShelfFinish) => {
    if (this.state.multiSelect === false) {
      //single book shelf change action
      this.props.handleUpdateShelf(newShelfId, changedBook, handleCallback, handleOnUpdateShelfFinish);
    } else {
      //multiple books shelf change action
      this.setState(() => ({
        //setting
        selectedShelfId: newShelfId,
        selectedCallback: handleCallback,
        selectionSuccessCount: 0
      }), () => {
        if (this.state.selectionBooks.length === 0) {
          handleCallback('Select one or more books to move them between shelves.');
          return;
        }
        let messages = '';
        Object.values(this.state.selectionBooks).forEach((book) => {
          try {
            this.props.handleUpdateShelf(newShelfId, book, this.handleMultiSelectCallback);
          } catch (error) {
            messages = messages.concat(`Error ${error.message} occurred on processing book ${book.title}.\n`);
          }
        });
        if (!Commons.isEmpty(messages))
          handleCallback(messages);
        this.handleOnUpdateMultieSelectFinish();
      });
    }
  };

  handleMultiSelectCallback = (message, isSuccess) => {
    if (isSuccess === true) {
      this.setState((currState) => ({
        selectionSuccessCount: currState.selectionSuccessCount+1,
        selectionTotalCount: currState.selectionTotalCount+1
      }), this.handleOnUpdateMultieSelectFinish);
    } else {
      this.setState((currState) => ({
        selectionTotalCount: currState.selectionTotalCount+1
      }), this.handleOnUpdateMultieSelectFinish);
    }
  }

  handleOnUpdateMultieSelectFinish = (error) => {
    if (this.state.selectionTotalCount === Object.keys(this.state.selectionBooks).length) {
      if (!Commons.isNull(this.state.selectedCallback)) {
        if (this.state.selectionSuccessCount > 0) {
          if (this.state.selectionSuccessCount === this.state.selectionTotalCount)
            this.state.selectedCallback(`All ${this.state.selectionSuccessCount} of ${this.state.selectionTotalCount} selected books were succesfully moved to shelf ${this.props.shelves[this.state.selectedShelfId].name}.`);
          else
            this.state.selectedCallback(`Only ${this.state.selectionSuccessCount} of ${this.state.selectionTotalCount} selected books were succesfully moved to shelf ${this.props.shelves[this.state.selectedShelfId].name}. \nSome of them already were at the shelf or errors ocurred.`);
        } else {
          this.state.selectedCallback(`None of ${this.state.selectionTotalCount} selected books were moved to shelf ${this.props.shelves[this.state.selectedShelfId].name}. \nSome of them already were at the shelf or errors ocurred.`);
        }
      }
      //reset multi select state variables
      this.setState({
        selectionBooks: {},
        selectionSuccessCount: 0,
        selectionTotalCount: 0,
        selectedShelfId: null,
        selectedCallback: null
      });
    }
  }

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
