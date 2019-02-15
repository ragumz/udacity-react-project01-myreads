# MyReads Project of Rafael Araujo Gumz

This is MyReads web application project, developed for the final assessment project for Udacity's React Fundamentals course.
The project web page contents were built with React, JSX, JS and CSS. They are dynamic and use all the static CSS and design suggested from the example project to save time.

## Building and Deploying

It was developed and manullay tested in a NodeJS static server.
To start using the web application right away:
* Install all project dependencies with `npm install`.
* Start the development server with `npm start`.

## Project Files Structure
```bash
├── README.md - This file.
├── SEARCH_TERMS.md # The whitelisted short collection of available search terms to use with the app.
├── package.json # npm package manager file. Some new dependecies were added.
├── public
│   ├── favicon.ico # React Icon wast not changed.
│   └── index.html # Not modifind from the static example project.
└── src
    ├── icons # Helpful images for the app copied from the static example project.
    │   ├── add.svg
    │   ├── arrow-back.svg
    │   └── arrow-drop-down.svg
    ├── utils
    │   ├── BooksAPI.js # A JavaScript API for the provided Udacity backend.
    │   ├── Commons.js # Some common functions to help solve common problems.
    │   ├── Constants.js # The constant values to use along the application
    │   ├── ErrorBoundary.js # React component to catch global React and JavaScript errors, log them into console and show a dialog.
    │   └── MessageDialog.js # React component to show/hide a modal dialog window with a title, a message and buttons.
    ├── App.css # Styles of the app copied from static example project. Some classes were customized.
    ├── App.js # This is the root of the app. It contains the starters UI React components and the main books' shelves' data state.
    ├── App.test.js # It was not used at this project stage, but will stay to future improvements.
    ├── Book.js # React component to Render and manage a single book.
    ├── BookDetailsDialog.js # React component to show a data sheet dialog window presenting the Book object field names and values.
    ├── BookMenu.js # React component with a menu of actions to apply on each Book.
    ├── BookSearch.js # React component to present fetched Books using a query on a REST web service operation from Udacity backend.
    ├── index.css # Global styles of the app copied from static example project. Nothin was changed here.
    ├── index.js # App component was nested into ErrorBoundary and BrowserRouter components.
    ├── SearchInput.js # React component to manage the search query input.
    ├── Shelf.js # React component to manage all the Books from a single Shelf.
    └── Shelves.js # React component to manage all the Shelves and its Books.
```

## Libraries and Dependencies

The following libraries where added to this project through [npm install --save](https://docs.npmjs.com/cli/install):
* [prop-types](https://www.npmjs.com/package/prop-types) - As instructed on the React Fundamentals course.
* [react-router-dom](https://www.npmjs.com/package/react-router-dom) - Needed to route creation as a project requirement.
* [@material-ui/core](https://www.npmjs.com/package/@material-ui/core) - Used some UI components like TextField, Button, Checkbox, Dialog etc.
* [react-loading-overlay](https://www.npmjs.com/package/react-loading-overlay) - An UI overlay to wait for asynch process to end.
* [react-star-ratings](https://www.npmjs.com/package/react-star-ratings) - An UI component to show stars from the Books' object 'averageRating' field.

## Main Page

The main page ('\') contains some other features besides the ones from the project requirements.
By default it presents the books on their shelves, allowing to move those books between any shelf.
Moving to shelf "None" will remove the book from the source shelf, however it may be added again on any shelf from Search page.
If <F5> key is pressed, the page contents of books on their shelves are not lost, but it relies on the "localStorage.token" from BookAPI.
On the main page that the REST web service to load books is invoked, among with the book shelf update, passed as props callback function to child components.

The new features added are:
* A "Multiple Selection" checkbox on the right upper corner of the page, to allow for batch update of many books, from and to any shelf. By checking it, a checkbox will be draw on the left upper corner of each Book component. Allowing to select all the books wanted and open any book menu to see the options, even the ones not selected. It manages to put each book on the right shelf, even it is the same or the "None" one. At the end a message will be presented with the result and counts of the batch shelf book moving.
* Each shelf has an specific menu color to made it easy to find their books visually: "Read" is Green | "Want to Read" is Yellow | "Currently Reading" is Red | "None" is Gray.
* A star rating component to show the readers average ratings, whether the Book object has the value, and the amount of ratings are placed bellow the authors label.
* The "Move this Book to Shelf..." menu presents the current book shelf selection with a bold font.
* A menu option to show every field value from Book object on 'Data Sheet' option.
* A menu option to open the Book information page on another browser tab.
* A menu option to open the Book preview content page on another browser tab.
* The LoadingOverlay component is the parent component that is shown or hidden through its "loading" state when backend services are executed.
* The MessageDialog is a component to present text messages, shown only when there is a message.
* Tried to document and comment almost every source code part.

## Search Page

The search page ('\search') contains almost the same new features explained on the Main Page section, besides the required features asked for the project. When cleaning the query text all the search book result will be clear, just as asked. Books without thumbnail images or authors are carefully treated.
On the search page that the REST web service to search books by author or title is called and passed as props callback to child components.

Some new features added are:
* To create a more performatic search executed on REST web service at the Udacity backend, it was decided to type the query and then press <ENTER> to start the asynchronous search. If it is a required feature, it may be replaced by onChange events of the text input UI component, but in my humble opinion, it is better this way.
* All the new features reported for 'Main Page' applies to 'Search Page'. Besides that, the book update operations occurs over the book objects from each page and on the backend.
* When a query does not return books from the REST web service backend search, a message dialog is shown to explain it.

## Caveats

Some caveats that could be improved on future releases:
* All React components of this project were created trying to follow the DO ONE THING principle and all good practices taught during the course, however due to React development unexperience, they may have grown more than expected.
* The Shelves.js and BookSearch.js have their own book object Map collection. Following the DOT and separting concerns, the search result books are segregated from the main shelves' books. It means that some objects are shared during the update process or just signaled to be on a "virtual" shelf on search page, duplicating in different book instances. However, they are kept persistent on each component books collection. This way the "Main Page" do not need to load the books from backend every time, only once actually, and it applies because is a single user system.
* The multiple selection and batch update was added after the single book update worked, so, its source code became repetitive on Shelves and BookSearch components, mainly due to different books' Map collection.
* No ordering algorithm were applied to any Array, Map or Set content.
* Should be added a menu and menu itens using Material UI components, to enrich the UX.
* Should be improved the CSS.

## Create React App

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

## Backend Server

To simplify the development process, Udacity provided a backend server to develop against. The provided file [`BooksAPI.js`](src/utils/BooksAPI.js) contains the methods to perform necessary operations on the backend:

* [`getAll`](#getall)
* [`update`](#update)
* [`search`](#search)

## Important from Udacity

The backend API uses a fixed set of cached search results and is limited to a particular set of search terms, which can be found in [SEARCH_TERMS.md](SEARCH_TERMS.md). That list of terms are the _only_ terms that will work with the backend, so don't be surprised the searches for Basket Weaving or Bubble Wrap don't come back with any results.

## Final Notes

* This repository contains a particular React project code for Udacity instructors evaluation only.
* Students are encouraged to try developing this exercise by themselves and "NOT TO COPY" the source codes.
* All the text, comments and documentation was made in English, to practice and foreseeing future Udacity courses.
* The Git commit messages were short and clean.
* All the source code were produced between 20 and 00:30 hours after a long day of 9 hours of architecture and programming and on weekends, when my 1 year old daughter allowed. That is student life!