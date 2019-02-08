import React, { Component } from 'react'
import MessageDialog from './MessageDialog'

/**
 * TODO: doc
 */
class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
  };

  /*logError = (error) => {
    if (error === undefined || error === null)
      return;
    let msg;
    if (typeof error === Error)
      msg = error.stack;
    else
      msg = error;
    console.error(msg);
    return msg;
  }*/

  handleEventError = (msg, url, line, col, error) => {
    this.setState({ hasError: true, error })
  };

  componentDidMount() {
    window.onerror = this.handleEventError.bind(this)
  };

  componentDidCatch(error, info) {
    this.setState({ hasError: true, error })
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <MessageDialog title="ERROR" message={this.state.error.stack} />;
    }
    return this.props.children;
  };
}

export default ErrorBoundary