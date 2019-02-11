import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import './App.css';
import * as BooksAPI from './utils/BooksAPI';
import Shelves from './Shelves';
import BookSearch from './BookSearch';
import MessageDialog from './utils/MessageDialog';
import * as Constants from './utils/Constants';
import * as Commons from './utils/Commons.js';
import LoadingOverlay from 'react-loading-overlay';

const INIT_SHELVES = {
              read: {id: Constants.SHELF_ID_READ, name: 'Read', bkgColor: '#60ac5d', books: new Map()},
        wantToRead: {id: Constants.SHELF_ID_WANTREAD, name: 'Want to Read', bkgColor: '#cccc00', books: new Map()},
  currentlyReading: {id: Constants.SHELF_ID_CURRREAD, name: 'Currently Reading',  bkgColor: '#cc3300', books: new Map()},
};

/**
 * TODO:
 */
class App extends Component {
  state = {
    shelves: INIT_SHELVES,
    message: null,
    loading: true
  };

  /**
   * Loading all the books from BooksAPI and initialize state data
   */
  onLoadAllBooks = () => {
    this.setState( {loading: true}, () => {
      BooksAPI.getAll()
        .then( (books) => {
          this.handleLoadShelves(books);
        })
        .catch((error) => {
          console.log(error.stack);
          this.setState( () => ({
            message: error.stack,
            loading: false
          }))
        });
    });
  };

  handleLoadShelves(books) {
    for (const shelfId in this.state.shelves) {
      this.setState( (currState) => {
        currState.loading = false;
        let currShelf = currState['shelves'][shelfId];
        books.filter((book) => {
          if (book.shelf === shelfId) {
            currShelf.books.set(book.id, book);
            return true;
          }
          return false;
        });
        //convert the API books array into a books' Map to each shelf
        /*currShelf['books'] = books.filter( (book) => {
          return book.shelf === shelfId;
        }).reduce( (map, obj) => {
          map[obj['id']] = obj;
          return map;
        }, {});*/
        return currState;
      })
    }
  }


  handleUpdateShelf = (newShelfId, book, handleCallback, handleStateFinish) => {
    if (Commons.isEmpty(newShelfId)
        || Commons.isNull(book)
        || newShelfId === book['shelf']) {
      handleCallback(`Select a different shelf for book '${book.title}'.`, false);
      return;
    }
    this.setState( {loading: true}, () => {
      BooksAPI.update(book, newShelfId)
        .then( (data) => {
          try {
            this.handleBookUpdateCallback(data, newShelfId, book, handleCallback, handleStateFinish);
          } catch (error) {
            this.setState( {loading: false} );
            handleCallback(`An error occurred during update: ${error.stack}`, false);
            this.onLoadAllBooks();
          }
        })
        .catch((error) => {
          console.log(error.stack);
          handleCallback(error.stack, false);
          handleStateFinish(error);
          this.setState( {loading: false} );
        });
    });
  }

  handleBookUpdateCallback(apiData, newShelfId, book, handleCallback, handleStateFinish) {
    //update book shelf on shelves.books state
    this.setState( (currState) => {
      currState.loading = false;
      const oldShelfId = book['shelf'];
      const bookId = book['id'];
      let oldShelf = null;
      let message = null;
      //remove from old shelf
      if (!Commons.isEmpty(oldShelfId) && Constants.SHELF_ID_NONE !== oldShelfId) {
        oldShelf = currState.shelves[oldShelfId];
        if (oldShelf.books.has(bookId)) {
          book = oldShelf.books.get(bookId);
          oldShelf.books.delete(bookId);
        }
      }
      //add to new shelf
      if (!Commons.isEmpty(newShelfId) && Constants.SHELF_ID_NONE !== newShelfId) {
        const newShelf = currState.shelves[newShelfId];
        newShelf.books.set(bookId, book);
        book['shelf'] = newShelfId;
        message = `Succesfuly moved book ´${book.title}´ to shelf ${newShelf.name}.`;
      } else {
        //remove from old shelf
        if (book.hasOwnProperty('shelf'))
          delete book['shelf'];
        let shelfName = '';
        if (!Commons.isNull(oldShelf))
          shelfName = ` from shelf ${oldShelf.name}`;
        message = `Succesfuly removed book ´${book.title}´${shelfName}.`;
      }
      if (!Commons.isEmpty(message)) {
        //invoke callback function if it is not to set currState.message
        if (handleCallback !== this.handleSetMessage)
          handleCallback(message, true);
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
      <LoadingOverlay
        active={this.state.loading}
        spinner
        text='Processing...'>
        <div className="app">
          <div className="list-books">
            <Route exact path="/" render={ (props) => (
                <Shelves
                  {...props}
                  shelves={this.state.shelves}
                  handleUpdateShelf={this.handleUpdateShelf}
                  handleSetMessage={this.handleSetMessage}/>
              )}
            />
            <Route path="/search" render={ (props) => (
                <BookSearch
                  {...props}
                  shelves={this.state.shelves}
                  handleUpdateShelf={this.handleUpdateShelf}
                  handleSetMessage={this.handleSetMessage}/>
              )}
            />
            <MessageDialog
              title='INFORMATION'
              message={this.state.message}
              buttons={[{text: 'OK', handleClick: this.handleClearMessage}]}/>
          </div>
        </div>
      </LoadingOverlay>
    )
  }
}

export default App;
