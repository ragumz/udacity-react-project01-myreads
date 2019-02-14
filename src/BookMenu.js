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

/**
 * @description React component to give each book a menu of actions
 */
class BookMenu extends Component {
  /**
   * @description Define props' arguments' types
   */
  static propTypes = {
    book: PropTypes.object.isRequired,
    shelfColor: PropTypes.string,
    handleUpdateShelf: PropTypes.func.isRequired,
    handleSetMessage: PropTypes.func.isRequired,
  };

  /**
   * @description Initializes component states
   */
  state = {
    /**
     * @description Flag to show or hide BookDetailsDialog component
     */
    showDetails: false
  };

  /**
   * @description Handle the select option change event to invoke parent controls to each chosen action
   *
   * @param {object} event The event object of the DOM UI component
   */
  handleOptionChange = (event) => {
    switch (event.target.value) {
      case ACTION_DETAILS:
        //book details sheet dialog
        this.handleShowDetails(true);
        break;

      case ACTION_PREVIEW:
        //book preview link opened on another browser tab
        window.open(this.props.book.previewLink, '_blank').focus();
        break;

      case ACTION_INFO:
        //book information link opened on another browser tab
        window.open(this.props.book.infoLink, '_blank').focus();
        break;

      default:
        //book's shelf update parent function to move them between shelves
        this.props.handleUpdateShelf(event.target.value, this.props.book, this.props.handleSetMessage);
    }
  };

  /**
   * @description Handle state flag to show BookDetailsDialog
   *
   * @param {bool} showDetails The flag value to show or hide the book details component dialog
   */
  handleShowDetails = (showDetails) => {
    if (Commons.isNull(showDetails)) {
      showDetails = false;
    }
    this.setState({showDetails});
  };

  /**
   * @description Creates the component UI
   */
  render() {
    //identify the correct shelf name to change its color
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
            value={ACTION_PREVIEW}
            disabled={Commons.isEmpty(this.props.book.previewLink)}>
            Preview Content
          </option>
          <option
            value={ACTION_INFO}
            disabled={Commons.isEmpty(this.props.book.infoLink)}>
            Information
          </option>
        </select>
        { /* Component to show a modal dialog window with all Book object field values */ }
        <BookDetailsDialog
          show={this.state.showDetails}
          book={this.props.book}
          handleClose={this.handleShowDetails} />
      </div>
    );
  }
}

export default BookMenu;
