import React, { Component } from 'react';
import MessageDialog from './MessageDialog';

/**
 * TODO: doc
 */
class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
  };

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
      return <MessageDialog title="ERROR" message={this.state.error.stack} />;
    }
    return this.props.children;
  };
}

export default ErrorBoundary