import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { View, Text } from 'react-native';

// Suppress console.error during test
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});
afterAll(() => {
    console.error = originalConsoleError;
});

const ErrorComponent = () => {
    throw new Error('Test Error');
};

const GoodComponent = () => (
    <View>
        <Text>Good Component</Text>
    </View>
);

describe('ErrorBoundary', () => {
    it('renders children when no error', () => {
        render(
            <ErrorBoundary>
                <GoodComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('Good Component')).toBeTruthy();
    });

    it('renders fallback UI when error occurs', () => {
        render(
            <ErrorBoundary>
                <ErrorComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('エラーが発生しました')).toBeTruthy();
        expect(screen.getByText('申し訳ございません。', { exact: false })).toBeTruthy();
    });
});
