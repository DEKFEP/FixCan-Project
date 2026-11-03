import { Component, type ReactNode } from 'react';
import { DevSettings, Pressable, StyleSheet, Text, View } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Turns an invisible render crash (white screen) into a readable message.
 * Native errors during boot are otherwise hard to diagnose in Expo Go.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('[FixCan] render error:', error, info.componentStack);
  }

  private retry = () => {
    this.setState({ error: null });
    try {
      DevSettings.reload();
    } catch {
      // DevSettings is not available in production builds; the reset above is enough.
    }
  };

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <View style={styles.root}>
        <Text style={styles.title}>FixCan</Text>
        <Text style={styles.heading}>Something went wrong / Algo salió mal</Text>
        <Text style={styles.message}>{error.message}</Text>
        <Pressable accessibilityRole="button" onPress={this.retry} style={styles.button}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
        <Text style={styles.hint}>
          Si sigue fallando, cierra Expo Go y vuelve a abrir el proyecto.
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080A0B',
    justifyContent: 'center',
    paddingHorizontal: 26,
    gap: 12,
  },
  title: {
    color: '#C8F751',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heading: {
    color: '#F4F6EF',
    fontSize: 22,
    fontWeight: '600',
  },
  message: {
    color: '#A9B0A0',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#C8F751',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#0A0D08',
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    color: '#6F776C',
    fontSize: 12,
    lineHeight: 18,
  },
});
