import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import PropTypes from "prop-types";
import * as Commons from './Commons';

/**
 * @description An utility class to display modal dialogs with messages and buttons.
 */
class MessageDialog extends Component {
  /**
   * @description Define props' arguments' types
   */
  static propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    buttons: PropTypes.array
  };

  /**
   * @description Initializes component states
   */
  state = {
    open: false
  };

  /**
   * @description Set the dialog to show
   */
  handleOpen = () => {
    this.setState({ open: true });
  };

  /**
   *  @description Set the dialog to hide
   */
  handleClose = () => {
    this.setState({ open: false });
  };

  /**
   * @description Callback function to handle custom buttons' clicks.
   */
  handleCustom = (handleClick) => {
    if (handleClick)
      handleClick();
    this.handleClose();
  };

  /**
   * @description React callback invoked when new props are to be received
   *
   * @param {object} nextProps The new props that will replace this.props
   */
  componentWillReceiveProps(nextProps) {
    //shows the dialog if there is any message text.
    if (!Commons.isEmpty(nextProps.message)
        && nextProps.message !== this.props.message) {
      this.handleOpen();
    }
  };

  /**
   * @description Creates the component UI
   */
  render() {
    return (
      <div>
        <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {this.props.message}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              {//if no custom array buttons are received, show the default OK one
                (!this.props.buttons || this.props.buttons.length === 0) && (
                <Button
                  autoFocus
                  onClick={this.handleClose}
                  color="primary">
                  OK
                </Button>
              )}
              {//if custom array buttons are received, mount all of them
                this.props.buttons &&
                this.props.buttons.length > 0 &&
                this.props.buttons.map(button => {
                  return (
                    <Button
                      key={button.text}
                      onClick={this.handleCustom.bind(this, button.handleClick)}
                      color={button.color ? button.color : "primary"}
                    >
                      {button.text}
                    </Button>
                  );
                })}
            </DialogActions>
          </Dialog>
      </div>
    );
  }
}

export default MessageDialog;