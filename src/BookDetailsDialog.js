import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from '@material-ui/core/TextField';
import PropTypes from "prop-types";
import * as Commons from './utils/Commons.js';

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
    return 'title,subtitle,authors,description,publisher,previewLink,infoLink,canonicalVolumeLink,imageLinks'.includes(fieldName);
  }

  doFormatValue = (fieldName) => {
    const value = this.props.book[fieldName];
    if (Commons.isNull(value))
      return '';
    if (Array.isArray(value))
      return value.toString();
    if (fieldName === 'readingModes')
      return `text=${value['text']} \n image=${value['image']}`;
    if (fieldName === 'panelizationSummary')
      return `containsEpubBubbles=${value['containsEpubBubbles']} \n containsImageBubbles=${value['containsImageBubbles']}`;
    if (fieldName === 'imageLinks')
      return `smallThumbnail=${value['smallThumbnail']} \n thumbnail=${value['thumbnail']}`;
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
            fullWidth="true"
            maxWidth="200px"
            scroll="paper"
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">Book Details</DialogTitle>
            <DialogContent>
              <div className="book-shelf-details">
                {Object.entries(this.props.book).map(([fieldName, attr]) => (
                  <TextField
                    id="standard-name"
                    key={fieldName}
                    label={fieldName}
                    value={this.doFormatValue(fieldName)}
                    multiline={'description,imageLinks,readingModes'.includes(fieldName)}
                    margin="normal"
                    fullWidth={this.isFullWidthField(fieldName)}
                    disabled="true"
                    variant="outlined"
                    style={{margin: "5px"}}
                  />
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