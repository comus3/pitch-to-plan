import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Idea, IdeaStatus } from '../types';
import { IdeaRepository } from '../db/repositories/IdeaRepository';
import { IdeaCard } from '../components/IdeaCard';
import { SearchBar } from '../components/SearchBar';
import { LoadingSpinner } from '../components/LoadingSpinner';

type RootStackParamList = {
  IdeasList: undefined;
  IdeaDetail: { ideaId: string };
  Interview: { ideaId?: string };
};

type IdeasListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'IdeasList'>;

export const IdeasListScreen: React.FC = () => {
  const navigation = useNavigation<IdeasListScreenNavigationProp>();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const repository = new IdeaRepository();

  const loadIdeas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allIdeas = await repository.findAll();
      setIdeas(allIdeas);
      setFilteredIdeas(allIdeas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ideas');
      console.error('Error loading ideas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadIdeas();
    }, [loadIdeas])
  );

  useEffect(() => {
    let filtered = ideas;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((idea) => idea.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const searchResults = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idea.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredIdeas(searchResults);
    } else {
      setFilteredIdeas(filtered);
    }
  }, [searchQuery, statusFilter, ideas]);

  const handleCreateNew = () => {
    navigation.navigate('Interview');
  };

  const handleIdeaPress = (ideaId: string) => {
    navigation.navigate('IdeaDetail', { ideaId });
  };

  const handleFilterPress = () => {
    Alert.alert(
      'Filter by Status',
      'Select a status to filter ideas',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'All', onPress: () => setStatusFilter('all') },
        { text: 'Draft', onPress: () => setStatusFilter('draft') },
        { text: 'Refined', onPress: () => setStatusFilter('refined') },
        { text: 'Archived', onPress: () => setStatusFilter('archived') },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadIdeas}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <Text style={styles.filterButtonText}>
            {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredIdeas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IdeaCard idea={item} onPress={() => handleIdeaPress(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No ideas yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to create your first idea</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.fab} onPress={handleCreateNew}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginLeft: 8,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
