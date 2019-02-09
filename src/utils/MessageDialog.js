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
 * TODO: doc
 */
class MessageDialog extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    buttons: PropTypes.array
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
    this.setState({ open: false });
  };

  /**
   * TODO: doc
   */
  handleCustom = (handleClick) => {
    if (handleClick)
      handleClick();
    this.handleClose();
  };

  componentWillReceiveProps(nextProps) {
    if (!Commons.isEmpty(nextProps.message)
        && nextProps.message !== this.props.message)
      this.handleOpen();
  }

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
              {(!this.props.buttons || this.props.buttons.length === 0) && (
                <Button
                  autoFocus
                  onClick={this.handleClose}
                  color="primary">
                  OK
                </Button>
              )}
              {this.props.buttons &&
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