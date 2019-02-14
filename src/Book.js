import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import BookMenu from './BookMenu';
import * as Commons from './utils/Commons.js';
import Checkbox from "@material-ui/core/Checkbox";
import StarRatings from 'react-star-ratings';

/**
 * @description React component to present one book on a shelf
 */
class Book extends Component {
  /**
   * @description Define props' arguments' types
   */
  static propTypes = {
    book: PropTypes.object.isRequired,
    shelfColor: PropTypes.string,
    handleUpdateShelf: PropTypes.func.isRequired,
    handleSetMessage: PropTypes.func.isRequired,
    isMultiSelect: PropTypes.bool,
    handleMultiSelectCheck: PropTypes.func,
  };

  /**
   * @description Initializes component states
   */
  state = {
    /**
     * @description Flag to control multiple selection checkbox value
     */
    selected: false
  };

  /**
   * @description Handle the checkbox to invoke parent controls to multiple selection actions
   *
   * @param {object} event The event object of the DOM UI component
   */
  handleCheckboxChange = (event) => {
    const selected = event.target.checked
    //set the new check state
    this.setState({ selected }, () => {
      //after state set, invoke parent function callback to add the book to the multiple selection Set
      if (this.props.handleMultiSelectCheck)
        this.props.handleMultiSelectCheck(selected, this.props.book);
    });
  };

  /**
   * @description Clears the checkbox checked state
   */
  handleClearSelection = () => {
    this.setState({ selected: false });
  };

  /**
   * @description React callback invoked when new props are to be received
   *
   * @param {object} nextProps The new props that will replace this.props
   */
  componentWillReceiveProps(nextProps) {
    //deselect book from multi selection change
    if (nextProps.isMultiSelect === false
        && this.props.isMultiSelect === true
        && this.state.selected === true)
      this.setState({selected: false});
  }

  /**
   * @description Creates the component UI
   */
  render() {
    //fetch book data from props attributes
    let { title, authors } = this.props.book;
    //check authors data
    if (Commons.isEmpty(authors)) {
      authors = ['[No author found]'];
    }
    let thumbnail = '';
    //check thumbnail data
    if (!Commons.isEmpty(this.props.book.imageLinks)) {
      thumbnail = this.props.book.imageLinks.thumbnail;
    }

    return (
      <li>
        <div className="book">
          <div className="book-top">
            <div className="book-cover-container">
              { /* Shows the multiple selection checkbox control */
                this.props.isMultiSelect &&
                (<Checkbox style={{marginLeft: "-15px", marginTop: "-33px", top: "0", left: "0", float: "left"}}
                  checked={this.state.selected}
                  onChange={(event) => { this.handleCheckboxChange(event) }}
                  value="true"
                  color="primary"
                />)
              }
              <div
                className="book-cover"
                style={{
                  width: 128,
                  height: 193,
                  backgroundImage: `url("${thumbnail}")`
                }}
              />
              { /* Shows a message over an empty thumbnail image space */
                Commons.isEmpty(thumbnail) &&
                  (<div className="book-cover-text-centered">No Image</div>)
              }
            </div>
            <BookMenu
              book={this.props.book}
              shelfColor={this.props.shelfColor}
              handleUpdateShelf={this.props.handleUpdateShelf}
              handleSetMessage={this.props.handleSetMessage}
              isMultiSelect={this.props.isMultiSelect}
            />
          </div>
          <div className="book-title">
            {title}
          </div>
          <div className="book-authors">
            { authors.map((author) => author ) }
          </div>
          { /* Shows the star ratings component if found any value */
            !Commons.isNull(this.props.book.averageRating) &&
            (<div>
              <StarRatings
                rating={this.props.book.averageRating}
                starRatedColor="blue"
                numberOfStars={5}
                name="averageRating"
                isSelectable={false}
                isAggregateRating={true}
                starDimension="20px"
                starSpacing="1px" />
              <div className="book-authors">
                of {this.props.book.ratingsCount} rating(s)
              </div>
            </div>)
          }
        </div>
      </li>
    );
  }
}

export default Book;