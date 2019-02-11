import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import * as Constants from './utils/Constants';
import * as Commons from './utils/Commons.js';
import BookDetailsDialog from './BookDetailsDialog';

const ACTION_MOVE = 'move';
const ACTION_DETAILS = 'details';
const ACTION_PREVIEW = 'preview';
const ACTION_INFO = 'info';

class BookMenu extends Component {
  static propTypes = {
    book: PropTypes.object.isRequired,
    shelfColor: PropTypes.string,
    handleUpdateShelf: PropTypes.func.isRequired,
    handleSetMessage: PropTypes.func.isRequired,
  };

  state = {
    showDetails: false
  }

  handleOptionChange = (event) => {
    switch (event.target.value) {
      case ACTION_DETAILS:
        //book details sheet dialog
        this.handleShowDetails(true);
        break;

      case ACTION_PREVIEW:
        //book preview
        window.open(this.props.book.previewLink, '_blank').focus();
        break;

      case ACTION_INFO:
        //book information
        window.open(this.props.book.infoLink, '_blank').focus();
        break;

      default:
        //Shelf update parent functions
        this.props.handleUpdateShelf(event.target.value, this.props.book, this.props.handleSetMessage);
    }
  };

  handleShowDetails = (showDetails) => {
    if (Commons.isNull(showDetails))
      showDetails = false;
    this.setState({showDetails});
  }

  render() {
    const defaultValue = !Commons.isEmpty(this.props.book.shelf) ? this.props.book.shelf : Constants.SHELF_ID_NONE;

    return (
      <div className="book-shelf-changer"
        style={{backgroundColor: (!Commons.isEmpty(this.props.shelfColor) ? this.props.shelfColor : "#848484")}}>
        <select
          onChange={ (event) => (this.handleOptionChange(event)) }
          defaultValue={defaultValue}>
          <option
            value={ACTION_MOVE}
            disabled>
            Move to...
          </option>
          <option
            value={Constants.SHELF_ID_CURRREAD}>
            Currently Reading
          </option>
          <option
            value={Constants.SHELF_ID_WANTREAD}>
            Want to Read
          </option>
          <option
            value={Constants.SHELF_ID_READ}>
            Read
          </option>
          <option
            value={Constants.SHELF_ID_NONE}>
            None
          </option>
          <option
            value="-"
            disabled>
            —————————
          </option>
          <option
            value={ACTION_DETAILS}>
            Book Details Sheet
          </option>
          <option
            value={ACTION_PREVIEW}>
            Preview Content
          </option>
          <option
            value={ACTION_INFO}>
            Information
          </option>
        </select>
        <BookDetailsDialog show={this.state.showDetails} book={this.props.book} handleClose={this.handleShowDetails} />
      </div>
    );
  }
}

export default BookMenu;
