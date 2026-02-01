import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/db/database';
import { runMigrations } from './src/db/migrations';
import { LoadingSpinner } from './src/components/LoadingSpinner';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        await initDatabase();
        await runMigrations();
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize app');
      }
    }

    initialize();
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to initialize app</Text>
        <Text style={styles.errorDetails}>{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
});
