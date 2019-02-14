import React, { Component } from "react";
import "./App.css";
import PropTypes from "prop-types";
import TextField from '@material-ui/core/TextField';

/**
 * @description React component to enter search query text values
 */
class SearchInput extends Component {
  /**
   * @description Define props' arguments' types
   */
  static propTypes = {
    handleSearchBooks: PropTypes.func.isRequired,
    handleClearBooks: PropTypes.func.isRequired
  };

  /**
   * @description Initializes component states
   */
  state = {
    /**
     * @description Text with the query of book author or title applied to the search REST web service operation
     */
    query: ''
  };

  /**
   * @description Handle the query text from DOM input
   *
   * @param {object} event The event object of the DOM UI component
   */
  handleQueryState = (event) => {
    //get the text value from input
    const query = event.target.value;
    this.setState({ query }, () => {
      //after sets the state, call the proper clean function callback if empty
      if (query.trim() === '') {
        this.props.handleClearBooks();
      }
    });
  };

  /**
   * @description Handle the form input submit sent with and ENTER
   *
   * @param {object} event The event object of the DOM UI component
   */
  handleSubmit = (event) => {
    //avoid the submit default behavior
    event.preventDefault();
    //invoke the parent function to call the REST web service and fetch the books found by text query
    this.props.handleSearchBooks(this.state.query);
  };

  /**
   * @description Creates the component UI
   */
  render() {
    return (
      <div className="search-books-input-wrapper">
        {/*
              NOTES: The search from BooksAPI is limited to a particular set of search terms.
              You can find these search terms here:
              https://github.com/udacity/reactnd-project-myreads-starter/blob/master/SEARCH_TERMS.md

              However, remember that the BooksAPI.search method DOES search by title or author. So, don't worry if
              you don't find a specific author or title. Every search is limited by search terms.
          */}
        <form onSubmit={this.handleSubmit}>
          <TextField
              autoFocus
              className="search-books-bar-input"
              id="query"
              key="query"
              label="Type the title or author to search and press <ENTER>"
              value={this.state.query}
              onChange={event => this.handleQueryState(event)}
              multiline={false}
              margin="none"
              fullWidth={true}/>
        </form>
      </div>
    );
  }
}

export default SearchInput;
