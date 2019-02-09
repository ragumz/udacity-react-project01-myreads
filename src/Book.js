import React, { Component } from 'react';
import './App.css';
//import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import BookMenu from './BookMenu';

class Book extends Component {
  static propTypes = {
    book: PropTypes.object.isRequired,
    shelfColor: PropTypes.string,
    handleUpdateShelf: PropTypes.func.isRequired,
    handleSetMessage: PropTypes.func.isRequired
  };

  render() {
    let { title, authors } = this.props.book;
    if (authors === undefined || authors === null)
      authors = ['[No author found]'];
    let thumbnail = '';
    if (this.props.book.imageLinks !== undefined)
      thumbnail = this.props.book.imageLinks.thumbnail;

    return (
      <li>
        <div className="book">
          <div className="book-top">
            <div className="book-cover-container">
              <div
                className="book-cover"
                style={{
                  width: 128,
                  height: 193,
                  backgroundImage: `url("${thumbnail}")`
                }}
              />
              { (thumbnail === undefined || thumbnail === '') &&
                  (<div className="book-cover-text-centered">No Image</div>)
              }
            </div>
            <BookMenu
              book={this.props.book}
              shelfColor={this.props.shelfColor}
              handleUpdateShelf={this.props.handleUpdateShelf}
              handleSetMessage={this.props.handleSetMessage}
            />
          </div>
          <div className="book-title">{title}</div>
          <div className="book-authors">
            { authors.map( (author) => author ) }
          </div>
        </div>
      </li>
    );
  }
}

export default Book;