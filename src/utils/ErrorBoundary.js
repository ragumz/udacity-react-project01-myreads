import React, { Component } from 'react';
import MessageDialog from './MessageDialog';

/**
 * @description Class to encapsulate all React and JS errors
 * of the current application.
 * It tryies to catch the erros and present to the user
 * in a form of a Message Dialog and logs to the browser console.
 */
class ErrorBoundary extends Component {
   /**
    * @description Initializes component states
    */
  state = {
    hasError: false,
    error: null,
  };

  /**
   * @description Updates the erros state of the component
   */
  handleEventError = (msg, url, line, col, error) => {
    this.setState({ hasError: true, error })
  };

  /**
   * @description React callback invoked after component mount
   */
  componentDidMount() {
    window.onerror = this.handleEventError.bind(this)
  };

  /**
   * @description React callback that is invoked when in any child component tree
   * an error occurs.
   */
  componentDidCatch(error, info) {
    console.log(`ErrorBoundary has captured an error: \n${error.stack}`)
    this.setState({ hasError: true, error })
  };

  /**
   * @description Creates the component UI
   */
  render() {
    if (this.state.hasError) {
      //if contains an error state, show modal dialog with its stack trace
      return <MessageDialog title="ERROR" message={this.state.error.stack} />;
    }
    return this.props.children;
  };
}

export default ErrorBoundary