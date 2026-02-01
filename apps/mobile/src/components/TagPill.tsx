import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TagPillProps {
  tag: string;
}

export const TagPill: React.FC<TagPillProps> = ({ tag }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{tag}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  text: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
});
