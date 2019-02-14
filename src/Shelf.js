import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import Book from './Book';

/**
 * @description React component to books on one shelf
 */
class Shelf extends Component {
  /**
   * @description Define props' arguments' types
   */
  static propTypes = {
    shelf: PropTypes.object.isRequired,
    handleUpdateShelf: PropTypes.func.isRequired,
    handleSetMessage: PropTypes.func.isRequired,
    isMultiSelect: PropTypes.bool,
    handleMultiSelectCheck: PropTypes.func
  };

  /**
   * @description Creates the component UI
   */
  render() {
    return (
      <div className="bookshelf">
        {/* Shelf title with a line separtor */}
        <h2 className="bookshelf-title">{this.props.shelf.name}</h2>
        <div className="bookshelf-books">
          <ol className="books-grid">
            { /* Loop over all books on the shelf and create a book component */
              Array.from(this.props.shelf.books.values()).map((book) => (
                <Book
                  key={book.id}
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