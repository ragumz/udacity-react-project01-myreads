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
 * TODO: doc
 */
class BookDetailsDialog extends Component {
  static propTypes = {
    handleClose: PropTypes.func.isRequired,
    book: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired
  };

  state = {
    open: false
  };

  /**
   * TODO: doc
   */
  handleOpen = () => {
    this.setState({ open: true });
  };

  /**
   * TODO: doc
   */
  handleClose = () => {
    this.setState({ open: false },
        this.props.handleClose());
  };

  isFullWidthField = (fieldName) => {
    return 'title,subtitle,authors,description,industryIdentifiers,publisher,previewLink,infoLink,canonicalVolumeLink,imageLinks'.includes(fieldName);
  }

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
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.props.show) {
      if (nextProps.show)
        this.handleOpen();
      else
        this.handleClose();
    }
  }

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
            <DialogTitle id="alert-dialog-title">Book Details</DialogTitle>
            <DialogContent>
              <div className="book-shelf-details">
                {Object.entries(this.props.book).map(([fieldName, attr]) => (
                  //common text fields
                 (fieldName !== 'averageRating' &&
                  (<TextField
                    id="standard-name"
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