import React, { Component } from 'react'
import './App.css'
import * as BooksAPI from './utils/BooksAPI'
import Shelf from './Shelf'
//import { Route } from 'react-router-dom'

const INIT_SHELVES = {
  read: {id: 'read', name: 'Read', show: true, books: {}},
  wantToRead: {id: 'wantToRead', name: 'Want to Read', show: true, books: {}},
  currentlyReading: {id: 'currentlyReading', name: 'Currently Reading', show: true, books: {}},
  //TODO: none: {id: 'none', name: 'None', show: false, books: {}}
}


/**
 * TODO:
 */
class App extends Component {
  state = {
    /**
    * TODO: Instead of using this state variable to keep track of which page
    * we're on, use the URL in the browser's address bar. This will ensure that
    * users can use the browser's back and forward buttons to navigate between
    * pages, as well as provide a good URL they can bookmark and share.
    */
    showSearchPage: false,

    shelves: INIT_SHELVES,

    error: null
  };

  /**
   * Loading all the books from BooksAPI and initialize state data
   */
  onLoadAllBooks = () => {
    BooksAPI.getAll()//.bind(this)  // =========== BIND
      .then( (books) => {
        for (const shelfId in this.state.shelves) {
          this.setState((currState) => {
            let currShelf = currState['shelves'][shelfId];
            //convert the API books array into a books' dictionary to each shelf
            currShelf['books'] = books.filter( (book) => {
              return book.shelf === shelfId;
            }).reduce( (map, obj) => {
              map[obj['id']] = obj;
              return map;
            }, {});
            return currState;
          })
        }
      })
      .catch((error) => {
        this.setState(() => ({ error }))
      });
  }

  componentDidMount() {
    this.onLoadAllBooks();
  }

  render() {
    return (
      <div className="app">
        {this.state.showSearchPage ? (
          <div className="search-books">
            <div className="search-books-bar">
              <button className="close-search" onClick={() => this.setState({ showSearchPage: false })}>Close</button>
              <div className="search-books-input-wrapper">
                {/*
                  NOTES: The search from BooksAPI is limited to a particular set of search terms.
                  You can find these search terms here:
                  https://github.com/udacity/reactnd-project-myreads-starter/blob/master/SEARCH_TERMS.md

                  However, remember that the BooksAPI.search method DOES search by title or author. So, don't worry if
                  you don't find a specific author or title. Every search is limited by search terms.
                */}
                <input type="text" placeholder="Search by title or author"/>
              </div>
            </div>
            <div className="search-books-results">
              <ol className="books-grid"></ol>
            </div>
          </div>
        ) : (
          <div className="list-books">
            <div className="list-books-title">
              <h1>MyReads</h1>
            </div>
            <div className="list-books-content">
              { Object.entries(this.state.shelves).map( (val, index) => {
                return <Shelf key={index} shelf={val[1]} />
              })}
            </div>
            <div className="open-search">
              <button onClick={() => this.setState({ showSearchPage: true })}>Add a book</button>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default App
