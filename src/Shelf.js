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
    handleSetMessage: PropTypes.func.isRequired
  };

  render() {
    return (
      <div className="bookshelf">
        <h2 className="bookshelf-title">{this.props.shelf.name}</h2>
        <div className="bookshelf-books">
          <ol className="books-grid">
            { Object.entries(this.props.shelf.books).map(([key, object]) => (
                <Book
                  key={key}
                  book={object}
                  shelfColor={this.props.shelf.bkgColor}
                  handleUpdateShelf={this.props.handleUpdateShelf}
                  handleSetMessage={this.props.handleSetMessage} />
              ))
            }
          </ol>
        </div>
      </div>
    );
  }
}

export default Shelf;