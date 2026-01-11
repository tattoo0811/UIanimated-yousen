import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

const TERMS_ACCEPTED_KEY = 'terms_accepted';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    checkTerms();
  }, []);

  const checkTerms = async () => {
    const value = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);
    setTermsAccepted(value === 'true');
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF9E6', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FB7185" />
      </View>
    );
  }

  return <Redirect href={termsAccepted ? '/(tabs)' : '/terms'} />;
}
