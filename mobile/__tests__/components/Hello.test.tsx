import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

const Hello = () => (
    <View>
        <Text>Hello, Jest!</Text>
    </View>
);

describe('Hello Component', () => {
    it('renders correctly', () => {
        render(<Hello />);
        expect(screen.getByText('Hello, Jest!')).toBeTruthy();
    });
});
