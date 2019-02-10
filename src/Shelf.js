import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import Book from './Book';

/**
 * TODO: doc
 */
class Shelf extends Component {
  static propTypes = {
    shelf: PropTypes.object.isRequired,
    handleUpdateShelf: PropTypes.func.isRequired,
    handleSetMessage: PropTypes.func.isRequired,
    isMultiSelect: PropTypes.bool,
    handleMultiSelectCheck: PropTypes.func
  };

  state = {
    multiSelectBooks: {}
  }

  render() {
    return (
      <div className="bookshelf">
        <h2 className="bookshelf-title">{this.props.shelf.name}</h2>
        <div className="bookshelf-books">
          <ol className="books-grid">
            { Object.entries(this.props.shelf.books).map(([key, book]) => (
                <Book
                  key={key}
                  book={book}
                  shelfColor={this.props.shelf.bkgColor}
                  handleUpdateShelf={this.props.handleUpdateShelf}
                  handleSetMessage={this.props.handleSetMessage}
                  isMultiSelect={this.props.isMultiSelect}
                  handleMultiSelectCheck={this.props.handleMultiSelectCheck} />
              ))
            }
          </ol>
        </div>
      </div>
    );
  }
}

export default Shelf;