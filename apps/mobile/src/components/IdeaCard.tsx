import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Idea } from '../types';
import { TagPill } from './TagPill';
import { formatDate } from '../utils/date';

interface IdeaCardProps {
  idea: Idea;
  onPress: () => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{idea.title}</Text>
        <View style={[styles.statusBadge, styles[`status${idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}`]]}>
          <Text style={styles.statusText}>{idea.status}</Text>
        </View>
      </View>
      {idea.summary ? (
        <Text style={styles.summary} numberOfLines={2}>
          {idea.summary}
        </Text>
      ) : null}
      {idea.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {idea.tags.slice(0, 3).map((tag, index) => (
            <TagPill key={index} tag={tag} />
          ))}
          {idea.tags.length > 3 && (
            <Text style={styles.moreTags}>+{idea.tags.length - 3}</Text>
          )}
        </View>
      )}
      <Text style={styles.date}>{formatDate(idea.createdAt)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontSize: 10,
    fontWeight: '600',
    color: '#424242',
    textTransform: 'uppercase',
  },
  summary: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    alignItems: 'center',
  },
  moreTags: {
    fontSize: 12,
    color: '#757575',
  },
  date: {
    fontSize: 12,
    color: '#9E9E9E',
  },
});
