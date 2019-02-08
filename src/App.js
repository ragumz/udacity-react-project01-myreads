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
    message: null
  };

  /**
   * Loading all the books from BooksAPI and initialize state data
   */
  onLoadAllBooks = () => {
    BooksAPI.getAll()
      .then( (books) => {
        this.handleLoadShelves(books);
      })
      .catch((error) => {
        console.log(error.stack);
        this.setState( () => ({
          message: error.stack
        }))
      });
  };

  handleLoadShelves(books) {
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
  }


  handleUpdateShelf = (newShelfId, book, handleCallback, handleStateFinish) => {
    if (newShelfId === undefined
        || book === undefined
        || newShelfId === book['shelf']) {
      handleCallback(`Select a different shelf for book '${book.title}'.`);
      return;
    }
    BooksAPI.update(book, newShelfId)
      .then( (data) => {
        try {
          this.handleBookUpdateCallback(data, newShelfId, book, handleCallback, handleStateFinish);
        } catch (error) {
          handleCallback('An error ');
          this.onLoadAllBooks();
        }
      })
      .catch((error) => {
        console.log(error.stack);
        handleCallback(error.stack);
        handleStateFinish(error);
      });
  }

  handleBookUpdateCallback(apiData, newShelfId, book, handleCallback, handleStateFinish) {
    this.setState( (currState) => {
      const oldShelfId = book['shelf'];
      const bookId = book['id'];
      let oldShelf = null;
      let message = null;
      //remove from old shelf
      if (oldShelfId !== undefined && SHELF_ID_NONE !== oldShelfId) {
        oldShelf = currState.shelves[oldShelfId];
        book = oldShelf.books[bookId];
        delete oldShelf.books[bookId];
      }
      //add to new shelf
      if (newShelfId !== undefined && SHELF_ID_NONE !== newShelfId) {
        const newShelf = currState.shelves[newShelfId];
        newShelf.books[bookId] = book;
        book['shelf'] = newShelfId;
        message = `Succesfuly moved book ´${book.title}´ to shelf ${newShelf.name}.`;
      } else {
        //remove from old shelf
        let shelfName = '';
        if (oldShelf !== null)
          shelfName = ` from shelf ${oldShelf.name}`;
        delete book['shelf'];
        message = `Succesfuly removed book ´${book.title}´${shelfName}.`;
      }
      if (message !== null) {
        if (handleCallback !== this.handleSetMessage)
          handleCallback(message);
        else
          currState.message = message;
      }
      return currState;
    }, handleStateFinish);
  }

  handleClearMessage = () => {
    this.handleSetMessage(null);
  };

  handleSetMessage = (message) => {
    this.setState(() => ({
      message
    }))
  };

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
                handleUpdateShelf={this.handleUpdateShelf}
                handleSetMessage={this.handleSetMessage} />
            )}
          />
          {/*render={ ({ history}) }*/}
          <Route path="/search" render={ (props) => (
              <BookSearch
                {...props}
                shelves={this.state.shelves}
                handleUpdateShelf={this.handleUpdateShelf}
                handleSetMessage={this.handleSetMessage} />
            )}
          />
          { this.state.message !== null &&
            (<MessageDialog
              title='ERROR'
              message={this.state.message}
            buttons={ [{text: 'OK', handleClick: this.handleClearMessage}] } />)
          }
        </div>
      </div>
    )
  }
}

export default App;
