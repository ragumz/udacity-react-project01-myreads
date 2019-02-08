import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import MessageDialog from './utils/MessageDialog'

class BookMenu extends Component {
  state = {
    message: null
  }

  handleUpdateShelf = (event) => {
    this.props.handleUpdateShelf(event.target.value, this.props.book, this.handleSetMessage);
  }

  handleClearMessage = () => {
    this.handleSetMessage(null);
  }

  handleSetMessage = (message) => {
    this.setState(() => ({
      message
    }));
  }

  render() {
    const defaultValue = this.props.book.shelf !== undefined ? this.props.book.shelf : 'none';

    return (
      <div className="book-shelf-changer"
        style={{backgroundColor: (this.props.shelfColor !== undefined ? this.props.shelfColor : "#848484")}}>
        <select
          onChange={event => this.handleUpdateShelf(event)}
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
        { (this.state.message !== null) &&
            <MessageDialog
              title="INFORMATION"
              message={this.state.message}
              buttons={ [{text: 'OK', handleClick: this.handleClearMessage}] } />
        }
      </div>
    );
  }
}

BookMenu.propTypes = {
  book: PropTypes.object.isRequired,
  shelfColor: PropTypes.string,
  handleUpdateShelf: PropTypes.func.isRequired
};

export default BookMenu;
