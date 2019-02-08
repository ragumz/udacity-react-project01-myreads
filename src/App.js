import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import './App.css'
import * as BooksAPI from './utils/BooksAPI'
import Shelves from './Shelves'
import BookSearch from './BookSearch'
import MessageDialog from './utils/MessageDialog'

const INIT_SHELVES = {
              read: {id: 'read', name: 'Read', bkgColor: '#60ac5d', books: {}},
        wantToRead: {id: 'wantToRead', name: 'Want to Read', bkgColor: '#cc3300', books: {}},
  currentlyReading: {id: 'currentlyReading', name: 'Currently Reading',  bkgColor: '#cccc00', books: {}},
};

const SHELF_ID_NONE = 'none';

/**
 * TODO:
 */
class App extends Component {
  state = {
    shelves: INIT_SHELVES,
    message: null,
    error: null
  };

  /**
   * Loading all the books from BooksAPI and initialize state data
   */
  onLoadAllBooks = () => {
    BooksAPI.getAll()
      .then( (books) => {
        for (const shelfId in this.state.shelves) {
          this.setState( (currState) => {
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
        console.log(error.stack);
        this.setState( () => ({
          message: error.stack
        }))
      });
  };


  handleUpdateShelf = (newShelfId, book, handleCallback, handleStateFinish) => {
    if (newShelfId === undefined
        || book === undefined
        || newShelfId === book['shelf']) {
      handleCallback(`Select a different shelf for book '${book.title}'.`);
      return;
    }
    BooksAPI.update(book, newShelfId)
      .then( (data) => {
        this.setState( (currState) => {
          const oldShelfId = book['shelf'];
          //remover da prateleira antiga
          if (oldShelfId !== undefined && SHELF_ID_NONE !== oldShelfId)
            delete currState.shelves[oldShelfId].books[book['id']];
          //adicionar a nova prateleira
          if (SHELF_ID_NONE !== newShelfId)
            currState.shelves[newShelfId].books[book['id']] = book;
          handleCallback(`Succesfuly moved book ´${book.title}´ to shelf ${newShelfId}.`);
          return currState;
        }, handleStateFinish);
      })
      .catch((error) => {
        console.log(error.stack);
        handleCallback(error.stack);
        handleStateFinish(error);
      });
  }

  handleClearError = () => {
    this.setState({ message: null });
  }

  componentDidMount() {
    this.onLoadAllBooks();
  }

  render() {
    return (
      <div className="app">
        <div className="list-books">
          <Route exact path="/" render={ (props) => (
              <Shelves
                {...props}
                shelves={this.state.shelves}
                handleUpdateShelf={this.handleUpdateShelf} />
            )}
          />
          {/*render={ ({ history}) }*/}
          <Route path="/search" render={ (props) => (
              <BookSearch
                {...props}
                shelves={this.state.shelves}
                handleUpdateShelf={this.handleUpdateShelf} />
            )}
          />
          {(this.state.message !== null) &&
            <MessageDialog
              title='ERROR'
              message={this.state.error.stack}
              buttons={ [{text: 'OK', handleClick: this.handleClearError}] } /> }
        </div>
      </div>
    )
  }
}

export default App;
