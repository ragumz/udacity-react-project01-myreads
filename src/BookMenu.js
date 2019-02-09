import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import * as Constants from './utils/Constants';
import * as Commons from './utils/Commons.js';

class BookMenu extends Component {
  static propTypes = {
    book: PropTypes.object.isRequired,
    shelfColor: PropTypes.string,
    handleUpdateShelf: PropTypes.func.isRequired,
    handleSetMessage: PropTypes.func.isRequired
  };

  handleUpdateShelf = (event) => {
    this.props.handleUpdateShelf(event.target.value, this.props.book, this.props.handleSetMessage);
  };

  render() {
    const defaultValue = !Commons.isEmpty(this.props.book.shelf) ? this.props.book.shelf : Constants.SHELF_ID_NONE;

    return (
      <div className="book-shelf-changer"
        style={{backgroundColor: (!Commons.isEmpty(this.props.shelfColor) ? this.props.shelfColor : "#848484")}}>
        <select
          onChange={ (event) => (this.handleUpdateShelf(event)) }
          defaultValue={defaultValue}>
          <option
            value="move"
            disabled>
            Move to...
          </option>
          <option
            value="currentlyReading">
            Currently Reading
          </option>
          <option
            value="wantToRead">
            Want to Read
          </option>
          <option
            value="read">
            Read
          </option>
          <option
            value="none">
            None
          </option>
        </select>
      </div>
    );
  }
}

export default BookMenu;
