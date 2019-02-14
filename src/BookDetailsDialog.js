import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from '@material-ui/core/TextField';
import PropTypes from "prop-types";
import * as Commons from './utils/Commons.js';
import StarRatings from 'react-star-ratings';

/**
 * @description A text Comma Separated Values field names which input must fill dialog width
 */
const FULL_WIDTH_FIELD_NAMES_CSV = 'title,subtitle,authors,description,industryIdentifiers,publisher,previewLink,infoLink,canonicalVolumeLink,imageLinks';

/**
 * @description React component to show all Book object fields' values in a modal dialog
 */
class BookDetailsDialog extends Component {
  /**
   * @description Define props' arguments' types
   */
  static propTypes = {
    handleClose: PropTypes.func.isRequired,
    book: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired
  };

  /**
   * @description Initializes component states
   */
  state = {
    /**
     * @description Flag to show or hide the modal dialog window
     */
    open: false
  };

  /**
   * @description Show the modal dialog window
   */
  handleOpen = () => {
    this.setState({ open: true });
  };

  /**
   * @description Hide the modal dialog window
   */
  handleClose = () => {
    //close the dialog and invokes parent callback function
    this.setState({ open: false }, this.props.handleClose());
  };


  /**
   * @description Check if the field name represents an input that fills all the dialog width
   *
   * @param {string} fieldName Name of the current processed Book object field
   * @return true if the DOM input must fill all the dialog width
   */
  isFullWidthField = (fieldName) => {
    return FULL_WIDTH_FIELD_NAMES_CSV.includes(fieldName);
  };

  /**
   * @description Get the proper text representation of the Book field value
   *
   * @param {string} fieldName Name of the current processed Book object field
   * @return A text representation of the field value
   */
  doFormatValue = (fieldName) => {
    const value = this.props.book[fieldName];
    if (Commons.isEmpty(value))
      return '';
    if (fieldName === 'readingModes')
      return `text=${value['text']} \n image=${value['image']}`;
    if (fieldName === 'panelizationSummary')
      return `containsEpubBubbles=${value['containsEpubBubbles']} \n containsImageBubbles=${value['containsImageBubbles']}`;
    if (fieldName === 'imageLinks')
      return `smallThumbnail=${value['smallThumbnail']} \n thumbnail=${value['thumbnail']}`;
    if (fieldName === 'industryIdentifiers') {
      let text = '';
      for (let isbn of value)
        text = text.concat(`${isbn['type']}=${isbn['identifier']}; `);
      return text;
    }
    if (Array.isArray(value))
      return value.toString();
    return value;
  };

  /**
   * @description React callback invoked when new props are to be received
   *
   * @param {object} nextProps The new props that will replace this.props
   */
  componentWillReceiveProps(nextProps) {
    //when the received prop is different from the current show flag
    if (nextProps.show !== this.props.show) {
      if (nextProps.show) {
        //show the Book details dialog
        this.handleOpen();
      } else {
        //hide the Book details dialog
        this.handleClose();
      }
    }
  }

  /**
   * @description Creates the component UI
   */
  render() {
    return (
      <div>
        <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            fullWidth={true}
            maxWidth="lg"
            scroll="paper"
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">Book Data Sheet</DialogTitle>
            <DialogContent>
              <div className="book-shelf-details">
                {Object.entries(this.props.book).map(([fieldName, attr]) => (
                  //common text fields
                 (fieldName !== 'averageRating' &&
                  (<TextField
                    id={fieldName}
                    key={fieldName}
                    label={Commons.separateFromUpperChar(Commons.capitalize(fieldName))}
                    value={this.doFormatValue(fieldName)}
                    multiline={'description,imageLinks,readingModes'.includes(fieldName)}
                    margin="normal"
                    fullWidth={this.isFullWidthField(fieldName)}
                    disabled={false}
                    readOnly={true}
                    variant="outlined"
                    style={{margin: "5px"}}/>
                  ))
                  ||
                  //ratings field
                  (fieldName === 'averageRating' &&
                  (<StarRatings
                    key={fieldName}
                    rating={attr}
                    starRatedColor="blue"
                    numberOfStars={5}
                    name={fieldName}
                    isSelectable={false}
                    isAggregateRating={true}/>
                  ))
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                autoFocus
                onClick={this.handleClose}
                color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
      </div>
    );
  }
}

export default BookDetailsDialog;