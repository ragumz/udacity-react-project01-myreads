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

/**
 * @description Constant to represent main application state data initialization
 */
const INIT_SHELVES = {
  read: {
    id: Constants.SHELF_ID_READ,
    name: 'Read',
    bkgColor: '#60ac5d',
    books: new Map()},
  wantToRead: {
    id: Constants.SHELF_ID_WANTREAD,
    name: 'Want to Read',
    bkgColor: '#cccc00',
    books: new Map()},
  currentlyReading: {
    id: Constants.SHELF_ID_CURRREAD,
    name: 'Currently Reading',
    bkgColor: '#cc3300',
    books: new Map()},
};


/**
 * @description Main application component class declarations
 */
class App extends Component {
  /**
   * @description Initializes component states
   */
  state = {
    /**
     * @description All the shelves data representation
     */
    shelves: INIT_SHELVES,
    /**
      * @description Text messages to be shown to the user in modal dialog
      */
    message: null,
    /**
     * @description Flag to identify the need to show a loading overlay cursor
     */
    loading: true
  };

  /**
   * @description Calls the backend API to load all the books
   * and initialize the current shelves state books data.
   */
  onLoadAllBooks = () => {
    //set the loading flag and calls de REST web service
    this.setState({loading: true}, () => {  //after setting the state, call the web service
      BooksAPI.getAll()
        //when successful REST, process the books and put them to their shelves
        .then((books) => {
          try {
            this.handleLoadShelves(books);
          } finally {
            //when finalizing, set load state to false and hide the overlay cursor
            this.setState({loading: false});
          }
        })
        .catch((error) => {
          //when REST error, log it and present it to the user
          console.log(error.stack);
          this.setState(() => ({
            message: error.stack,
            loading: false
          }));
        });
    });
  };

  /**
   * @description Process all books from REST web service and put them
   * to their respective shelf state.
   *
   * @param {*} books Book array from REST
   */
  handleLoadShelves = (books) => {
    //loop over state shelves objects keys or unique identifiers
    for (const shelfId in this.state.shelves) {
      this.setState( (currState) => {
        //get the current shelf object from the key
        const currShelf = currState['shelves'][shelfId];
        //loop each book and add them to the shelf books' map
        books.forEach((book) => {
          if (book.shelf === shelfId) {
            currShelf.books.set(book.id, book);
          }
        });
        return currState;
      });
    }
  };

  /**
   * @description Update a book shelf calling the REST web service and sets the local
   * book shelf to avoid reloading again from the backend.
   *
   * @param {string} newShelfId New shelf unique identifier
   * @param {object} book Current selected book to change shelf
   * @param {function} handleCallback Callback function to receive messages and success flag
   * @param {function} handleStateFinish Callback function called after the book get the new shelf state
   *        in the near processing end.
   */
  handleUpdateShelf = (newShelfId, book, handleCallback, handleStateFinish) => {
    //do not start if the shelf is the same of the book or if its id is not defined
    if (Commons.isEmpty(newShelfId)
        || Commons.isNull(book)
        || (newShelfId === book['shelf']
          || (newShelfId === Constants.SHELF_ID_NONE && !book.hasOwnProperty('shelf'))) ) {
      //send a message to the caller with fail flag
      handleCallback(`Select a different shelf for book '${book.title}'.`, null);
      return;
    }
    //set the loading flag and calls de REST web service
    this.setState({loading: true}, () => {  //after setting the state, call the web service
      BooksAPI.update(book, newShelfId)
        //when successful REST and server database was updated, process the local book object
        .then( (data) => {
          try {
            this.handleBookUpdateCallback(data, newShelfId, book, handleCallback, handleStateFinish);
          } catch (error) {
            //when finalizing, set load state to false and hide the overlay cursor
            this.setState({loading: false});
            handleCallback(`An error occurred during update: ${error.stack}`, false);
            //force book reload because there is a risk that the local book object was not updated correctly
            this.onLoadAllBooks();
          }
        })
        .catch((error) => {
          //whe REST error, log it and present it to the user
          console.log(error.stack);
          handleCallback(error.stack, false);
          handleStateFinish(error);
          this.setState( {loading: false} );
        });
    });
  }

  /**
   * @description Processes each REST successful data and updates the current book exchanging it between
   *  selected shelves
   *
   * @param {object} apiData Result returned from REST web service
   * @param {string} newShelfId New shelf unique identifier
   * @param {object} book Current selected book to change shelf
   * @param {function} handleCallback Callback function to receive messages and success flag
   * @param {function} handleStateFinish Callback function called after the book get the new shelf state
   *        in the near processing end.
   */
  handleBookUpdateCallback = (apiData, newShelfId, book, handleCallback, handleStateFinish) => {
    //update the book shelf exchanging them between shelves.books state
    this.setState( (currState) => {
      //many state instructions to remove the book from the old shelf and putting it on the new one
      currState.loading = false;
      const oldShelfId = book['shelf'];
      const bookId = book['id'];
      let oldShelf = null;
      let message = null;
      let localBook = book;
      //remove book from old shelf if it exists and is not the 'none' shelf
      if (!Commons.isEmpty(oldShelfId) && Constants.SHELF_ID_NONE !== oldShelfId) {
        //get previous shelf object
        oldShelf = currState.shelves[oldShelfId];
        if (oldShelf.books.has(bookId)) {
          //refresh the book object pointer to be updated
          localBook = oldShelf.books.get(bookId);
          //if shelf contains the book, delete it
          oldShelf.books.delete(bookId);
        }
      }
      //add book to the new shelf if it exists and is not the 'none' shelf
      if (!Commons.isEmpty(newShelfId) && Constants.SHELF_ID_NONE !== newShelfId) {
        //update the book object shelf id
        localBook['shelf'] = newShelfId;
        //get the new shelf object
        const newShelf = currState.shelves[newShelfId];
        //add the book indexed by its id
        newShelf.books.set(bookId, localBook);
        message = `Succesfuly moved book ´${localBook.title}´ to shelf ${newShelf.name}.`;
      } else {

        //remove the book from the old shelf if it is the 'none' shelf
        if (localBook.hasOwnProperty('shelf')) {
          delete localBook['shelf'];
        }
        //initializes shelf data message variable
        let shelfMessage = '';
        if (!Commons.isNull(oldShelf)) {
          shelfMessage = ` from shelf ${oldShelf.name}`;
        }
        message = `Succesfuly removed book ´${book.title}´${shelfMessage}.`;
      }
      if (!Commons.isEmpty(message)) {
        if (handleCallback !== this.handleSetMessage) {
          //invoke callback function if it is not to set currState.message on the own app dialog
          handleCallback(message, true);
        } else {
          currState.message = message;
        }
      }
      //return the current updated shelves state
      return currState;
    },
      //executes the callback function to signals that the book update process has ended
      () => {
        if (!Commons.isNull(handleStateFinish)) {
          handleStateFinish(null, newShelfId, book);
        }
      }
    );
  }

  /**
   * @description Clear the text message of the modal dialog.
   */
  handleClearMessage = () => {
    this.handleSetMessage(null);
  };

  /**
   * @description Sets a new text message to the modal dialog.
   *
   * @param {string} message A text to be shown to the user
   */
  handleSetMessage = (message) => {
    this.setState(() => ({
      message
    }))
  };

  /**
   * @description React callback used to dispatch the process
   * to load all books into shelves from backend REST web service
   * after all component tree constructed and mounted on the UI.
   */
  componentDidMount() {
    this.onLoadAllBooks();
  }

  /**
   * @description Creates the component UI
   */
  render() {
    return (
      //loading overlay cursor componente shown by loading state flag
      <LoadingOverlay
        active={this.state.loading}
        spinner
        text='Processing...'>
        <div className="app">
          <div className="list-books">
            {/* Current shelves route definition and its props */}
            <Route exact path="/" render={(props) => (
                <Shelves
                  {...props}
                  shelves={this.state.shelves}
                  handleUpdateShelf={this.handleUpdateShelf}
                  handleSetMessage={this.handleSetMessage}/>
              )}
            />
            {/* Book search route definition and its props */}
            <Route path="/search" render={(props) => (
                <BookSearch
                  {...props}
                  shelves={this.state.shelves}
                  handleUpdateShelf={this.handleUpdateShelf}
                  handleSetMessage={this.handleSetMessage}/>
              )}
            />
            {/* Modal dialog to show text messages to user */}
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
