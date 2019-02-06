import React, { Component } from "react";
import "./App.css";
import PropTypes from "prop-types";
import Book from './Book';

/**
 * TODO: doc
 */
class Shelf extends Component {
  render() {
    return (
      <div className="bookshelf">
        <h2 className="bookshelf-title">{this.props.shelf.name}</h2>
        <div className="bookshelf-books">
          <ol className="books-grid">
            { Object.entries(this.props.shelf.books).map( ([key, object]) => (
                <Book key={key} book={object} handleUpdateShelf={this.props.handleUpdateShelf} />
              ))
            }
          </ol>
        </div>
      </div>
    );
  }
}

Shelf.propTypes = {
  shelf: PropTypes.object.isRequired,
  handleUpdateShelf: PropTypes.func
};

export default Shelf;