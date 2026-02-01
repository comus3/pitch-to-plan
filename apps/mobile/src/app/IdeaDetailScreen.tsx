import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Idea } from '../types';
import { IdeaRepository } from '../db/repositories/IdeaRepository';
import { ChatMessageRepository } from '../db/repositories/ChatMessageRepository';
import { ReportViewer } from '../components/ReportViewer';
import { TagPill } from '../components/TagPill';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate } from '../utils/date';
import { exportIdeaAsMarkdown, exportIdeaAsJSON } from '../utils/export';

type RootStackParamList = {
  IdeasList: undefined;
  IdeaDetail: { ideaId: string };
  Interview: { ideaId?: string };
};

type IdeaDetailScreenRouteProp = RouteProp<RootStackParamList, 'IdeaDetail'>;
type IdeaDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'IdeaDetail'>;

export const IdeaDetailScreen: React.FC = () => {
  const route = useRoute<IdeaDetailScreenRouteProp>();
  const navigation = useNavigation<IdeaDetailScreenNavigationProp>();
  const { ideaId } = route.params;
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ideaRepository = new IdeaRepository();
  const chatRepository = new ChatMessageRepository();

  const loadIdea = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedIdea = await ideaRepository.findById(ideaId);
      if (!loadedIdea) {
        setError('Idea not found');
        return;
      }
      setIdea(loadedIdea);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load idea');
      console.error('Error loading idea:', err);
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  useFocusEffect(
    useCallback(() => {
      loadIdea();
    }, [loadIdea])
  );

  const handleDelete = () => {
    Alert.alert(
      'Delete Idea',
      'Are you sure you want to delete this idea? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ideaRepository.delete(ideaId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete idea');
              console.error('Error deleting idea:', err);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    // For v0.1, we'll just show an alert
    // In v0.2+, this could navigate to an edit screen
    Alert.alert('Edit', 'Edit functionality will be available in a future version');
  };

  const handleExport = () => {
    if (!idea) return;

    Alert.alert(
      'Export Idea',
      'Choose export format',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Markdown',
          onPress: async () => {
            try {
              await exportIdeaAsMarkdown(idea);
            } catch (err) {
              Alert.alert('Error', 'Failed to export idea as Markdown');
              console.error('Export error:', err);
            }
          },
        },
        {
          text: 'JSON',
          onPress: async () => {
            try {
              await exportIdeaAsJSON(idea);
            } catch (err) {
              Alert.alert('Error', 'Failed to export idea as JSON');
              console.error('Export error:', err);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !idea) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Idea not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadIdea}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{idea.title}</Text>
        <View style={[styles.statusBadge, styles[`status${idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}`]]}>
          <Text style={styles.statusText}>{idea.status}</Text>
        </View>
      </View>

      <View style={styles.metaContainer}>
        <Text style={styles.metaText}>Created: {formatDate(idea.createdAt)}</Text>
        <Text style={styles.metaText}>Updated: {formatDate(idea.updatedAt)}</Text>
      </View>

      {idea.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {idea.tags.map((tag, index) => (
            <TagPill key={index} tag={tag} />
          ))}
        </View>
      )}

      {idea.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summaryText}>{idea.summary}</Text>
        </View>
      )}

      {(idea.reportMd || idea.reportJson) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report</Text>
          <ReportViewer reportMd={idea.reportMd} reportJson={idea.reportJson} />
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDraft: {
    backgroundColor: '#FFF3E0',
  },
  statusRefined: {
    backgroundColor: '#E8F5E9',
  },
  statusArchived: {
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
    textTransform: 'uppercase',
  },
  metaContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  metaText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
