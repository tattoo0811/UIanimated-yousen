import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { monitoring } from '@/src/lib/monitoring';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }



    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        monitoring.recordError(error, { componentStack: errorInfo.componentStack || '(no stack trace)' });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.emoji}>😵</Text>
                    <Text style={styles.title}>エラーが発生しました</Text>
                    <Text style={styles.message}>
                        申し訳ございません。{'\n'}
                        アプリを再起動してください。
                    </Text>

                    {__DEV__ && this.state.error && (
                        <View style={styles.errorDetails}>
                            <Text style={styles.errorText}>
                                {this.state.error.toString()}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={this.handleReset}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>再試行</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9E6',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#333',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    errorDetails: {
        backgroundColor: '#fee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        maxWidth: '100%',
    },
    errorText: {
        fontSize: 12,
        color: '#c00',
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: '#FB7185',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 3,
        borderColor: '#333',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
