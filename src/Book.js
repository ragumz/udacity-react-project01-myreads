import React, { Component } from "react";
import "./App.css";
//import { Link } from "react-router-dom";
import PropTypes from "prop-types";

class Book extends Component {
  render() {
    const { title, authors } = this.props.book;
    const { thumbnail } = this.props.book.imageLinks;

    return (
      <li>
        <div className="book">
          <div className="book-top">
            <div
              className="book-cover"
              style={{
                width: 128,
                height: 193,
                backgroundImage: `url("${thumbnail}")`
              }}
            />
            <div className="book-shelf-changer">
              <select>
                <option value="move" disabled>Move to...</option>
                <option value="currentlyReading">Currently Reading</option>
                <option value="wantToRead">Want to Read</option>
                <option value="read">Read</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
          <div className="book-title">{title}</div>
          <div className="book-authors">
              { Array.isArray(authors)
                  ? authors.map( (author) => author)
                  : '[No author found]' }
          </div>
        </div>
      </li>
    );
  }
}

Book.propTypes = {
  book: PropTypes.object.isRequired,
  handleUpdateShelf: PropTypes.func
};

export default Book;