import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import * as Constants from './utils/Constants';

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
    const defaultValue = this.props.book.shelf !== undefined ? this.props.book.shelf : Constants.SHELF_ID_NONE;

    return (
      <div className="book-shelf-changer"
        style={{backgroundColor: (this.props.shelfColor !== undefined ? this.props.shelfColor : "#848484")}}>
        <select
          onChange={ (event) => (this.handleUpdateShelf(event)) }
          defaultValue={defaultValue} >
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
