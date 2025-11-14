import React from 'react';
import { Alert } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 [ErrorBoundary] Caught error:', error);
    console.error('🔴 [ErrorBoundary] Error info:', errorInfo);
    console.error('🔴 [ErrorBoundary] Component stack:', errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="danger">
          <Alert.Heading>Si è verificato un errore</Alert.Heading>
          <p><strong>Errore:</strong> {this.state.error?.toString()}</p>
          <hr />
          <details>
            <summary>Dettagli tecnici</summary>
            <pre style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <hr />
          <button 
            className="btn btn-primary" 
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
          >
            Ricarica pagina
          </button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
