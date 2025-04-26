import React from 'react';
import { AppSnackbar } from '../ui/AppSnackbar';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleClose = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <>
          <AppSnackbar
            open={true}
            type="error"
            message="Wystąpił nieoczekiwany błąd aplikacji"
            details={this.state.error.message}
            onClose={this.handleClose}
            autoHideDuration={8000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          />
          <div style={{ padding: 32, textAlign: 'center' }}>
            <h2>Coś poszło nie tak.</h2>
            <p>{this.state.error.message}</p>
            <button onClick={() => window.location.reload()}>Odśwież stronę</button>
          </div>
        </>
      );
    }
    return this.props.children;
  }
} 