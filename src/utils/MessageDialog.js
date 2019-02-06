import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import PropTypes from "prop-types";

/**
 * TODO: doc
 */
function MessageDialog(props) {
  const [open, setOpen] = useState(false)

  /**
   * TODO: doc
   */
  function handleClickOpen() {
    setOpen(true)
  }

  /**
   * TODO: doc
   */
  function handleClose() {
    setOpen(false)
  }

  /**
   * TODO: doc
   */
  function handleCustom(handleClick) {
    handleClick();
    handleClose();
  }

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open alert dialog
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {(!props.buttons || props.buttons.length === 0) && (
            <Button onClick={handleClose} color="primary" autoFocus>
              OK
            </Button>
          )}
          {(props.buttons && props.buttons.length > 0) &&
            (props.buttons.map(button => {
              return (
                <Button
                  onClick={handleCustom.bind(this, button.handleClick)}
                  color={button.color ? button.color : "primary"}
                >
                  {Button.text}
                </Button>
              )
            }))}
        </DialogActions>
      </Dialog>
    </div>
  )
}

MessageDialog.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  buttons: PropTypes.array
}

export default MessageDialog