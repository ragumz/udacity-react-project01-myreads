import React, { Component } from 'react'
import './App.css'
import * as BooksAPI from './utils/BooksAPI'
import Shelves from './Shelves'
import BookSearch from './BookSearch'
import { Route } from 'react-router-dom'

const INIT_SHELVES = {
  read: {id: 'read', name: 'Read', show: true, books: {}},
  wantToRead: {id: 'wantToRead', name: 'Want to Read', show: true, books: {}},
  currentlyReading: {id: 'currentlyReading', name: 'Currently Reading', show: true, books: {}},
}

/**
 * TODO:
 */
class App extends Component {
  state = {
    shelves: INIT_SHELVES,
    error: null
  };

  /**
   * Loading all the books from BooksAPI and initialize state data
   */
  onLoadAllBooks = () => {
    BooksAPI.getAll()
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
        //this.setState(() => ({ error }))
        console.log(error.stack);
      });
  }

  componentDidMount() {
    this.onLoadAllBooks();
  }

  render() {
    return (
      <div className="app">
          <div className="list-books">
            <Route exact path='/' render={ (props) => (
                <Shelves {...props} shelves={this.state.shelves} />
              )}
            />
            {/*render={ ({ history}) }*/}
            <Route path='/search' render={ (props) => (
                <BookSearch {...props} />
              )}
            />
          </div>
      </div>
    )
  }
}

export default App
