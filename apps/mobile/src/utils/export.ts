// Export utilities for ideas

import { Idea } from '../types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export async function exportIdeaAsMarkdown(idea: Idea): Promise<void> {
  try {
    const content = `# ${idea.title}\n\n` +
      `**Status:** ${idea.status}\n` +
      `**Created:** ${idea.createdAt}\n` +
      `**Updated:** ${idea.updatedAt}\n\n` +
      (idea.tags.length > 0 ? `**Tags:** ${idea.tags.join(', ')}\n\n` : '') +
      (idea.summary ? `## Summary\n\n${idea.summary}\n\n` : '') +
      (idea.reportMd ? `## Report\n\n${idea.reportMd}\n` : '');

    const fileName = `${idea.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.md`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, content);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/markdown',
        dialogTitle: 'Export Idea',
      });
    } else {
      Alert.alert('Export', `File saved to: ${fileUri}`);
    }
  } catch (error) {
    console.error('Error exporting idea:', error);
    throw new Error('Failed to export idea');
  }
}

export async function exportIdeaAsJSON(idea: Idea): Promise<void> {
  try {
    const content = JSON.stringify(idea, null, 2);
    const fileName = `${idea.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, content);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Idea',
      });
    } else {
      Alert.alert('Export', `File saved to: ${fileUri}`);
    }
  } catch (error) {
    console.error('Error exporting idea:', error);
    throw new Error('Failed to export idea');
  }
}
