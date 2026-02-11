/**
 * Minimal test layout to debug crash issues
 */

import { View, Text } from 'react-native';

export default function MinimalLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFF9E6', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Hello World!</Text>
      <Text style={{ marginTop: 16 }}>App is working ✅</Text>
    </View>
  );
}
