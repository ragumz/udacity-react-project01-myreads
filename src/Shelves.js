import React, { Component } from "react";
import "./App.css";
import PropTypes from "prop-types";
import { Link } from 'react-router-dom'
import Shelf from './Shelf'

/**
 *
 */
class Shelves extends Component {
  render() {
    return (
      <div>
        <div className="list-books-title">
          <h1>MyReads</h1>
        </div>
        <div className="list-books-content">
          {Object.entries(this.props.shelves).map(([key, object]) => (
            <Shelf key={key} shelf={object} handleUpdateShelf={this.props.handleUpdateShelf} />
          ))}
        </div>
        <Link className="open-search" to="/search">Add a book</Link>
      </div>
    );
  }
}

Shelves.propTypes = {
  shelves: PropTypes.object.isRequired,
  handleUpdateShelf: PropTypes.func
};

export default Shelves;
