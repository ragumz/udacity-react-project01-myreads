import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Shelf from './Shelf';

/**
 *
 */
class Shelves extends Component {
  static propTypes = {
    shelves: PropTypes.object.isRequired,
    handleUpdateShelf: PropTypes.func.isRequired,
    handleSetMessage: PropTypes.func.isRequired
  };

  render() {
    return (
      <div>
        <div className="list-books-title">
          <h1>MyReads</h1>
        </div>
        <div className="list-books-content">
          {Object.entries(this.props.shelves).map(([key, shelf]) => (
            <Shelf
              key={key}
              shelf={shelf}
              handleUpdateShelf={this.props.handleUpdateShelf}
              handleSetMessage={this.props.handleSetMessage} />
          ))}
        </div>
        <Link className="open-search" to="/search">Add a book</Link>
      </div>
    );
  }
}

export default Shelves;
