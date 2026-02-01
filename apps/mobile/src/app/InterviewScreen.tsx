import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ChatMessage, Idea } from '../types';
import { ChatBubble } from '../components/ChatBubble';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ChatMessageRepository } from '../db/repositories/ChatMessageRepository';
import { IdeaRepository } from '../db/repositories/IdeaRepository';
import { AIClient } from '../ai/client';
import { InterviewOrchestrator, InterviewState } from '../ai/interview';
import { getCurrentISOString } from '../utils/date';

type RootStackParamList = {
  IdeasList: undefined;
  IdeaDetail: { ideaId: string };
  Interview: { ideaId?: string };
};

type InterviewScreenRouteProp = RouteProp<RootStackParamList, 'Interview'>;
type InterviewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Interview'>;

export const InterviewScreen: React.FC = () => {
  const route = useRoute<InterviewScreenRouteProp>();
  const navigation = useNavigation<InterviewScreenNavigationProp>();
  const { ideaId: existingIdeaId } = route.params || {};
  const [ideaId, setIdeaId] = useState<string>(existingIdeaId || '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const chatRepository = new ChatMessageRepository();
  const ideaRepository = new IdeaRepository();

  // Initialize AI client
  const aiClient = new AIClient({
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    model: 'gpt-4',
  });

  const orchestrator = new InterviewOrchestrator(aiClient);

  // Load existing messages if ideaId exists
  useFocusEffect(
    useCallback(() => {
      async function loadMessages() {
        if (existingIdeaId) {
          try {
            const existingMessages = await chatRepository.findByIdeaId(existingIdeaId);
            setMessages(existingMessages);
            setIdeaId(existingIdeaId);
            setInterviewState({
              ideaId: existingIdeaId,
              messages: existingMessages,
              isComplete: false,
            });
          } catch (err) {
            console.error('Error loading messages:', err);
          }
        } else {
          // Create new idea
          try {
            const newIdea = await ideaRepository.create({
              title: 'New Idea',
              tags: [],
              status: 'draft',
              summary: '',
              reportMd: '',
              reportJson: null,
              syncedAt: null,
            });
            setIdeaId(newIdea.id);
            setInterviewState({
              ideaId: newIdea.id,
              messages: [],
              isComplete: false,
            });
          } catch (err) {
            console.error('Error creating idea:', err);
            Alert.alert('Error', 'Failed to create new idea');
          }
        }
      }
      loadMessages();
    }, [existingIdeaId])
  );

  const handleSend = async () => {
    if (!inputText.trim() || !interviewState) return;

    const userMessageText = inputText.trim();
    setInputText('');
    setLoading(true);

    try {
      // Process message with AI
      const result = await orchestrator.processMessage(interviewState, userMessageText);

      // Save messages to database
      const userMessage: ChatMessage = {
        id: generateUUID(),
        ideaId: result.state.ideaId,
        role: 'user',
        content: userMessageText,
        timestamp: getCurrentISOString(),
      };

      const aiMessage: ChatMessage = {
        id: generateUUID(),
        ideaId: result.state.ideaId,
        role: 'assistant',
        content: result.response,
        timestamp: getCurrentISOString(),
      };

      await chatRepository.create(userMessage);
      await chatRepository.create(aiMessage);

      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);
      setInterviewState(result.state);

      // Update idea title if this is the first message
      if (messages.length === 0) {
        const title = userMessageText.length > 50 
          ? userMessageText.substring(0, 50) + '...' 
          : userMessageText;
        await ideaRepository.update(result.state.ideaId, { title });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send message. Please check your API key configuration.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleEndInterview = async () => {
    if (!interviewState || messages.length === 0) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      'End Interview',
      'Generate the final report? This will create a structured report based on your conversation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate Report',
          onPress: async () => {
            setGeneratingReport(true);
            try {
              const report = await orchestrator.generateReport(interviewState);
              const reportMd = await aiClient.generateReport(
                interviewState.messages.map((msg) => ({
                  role: msg.role,
                  content: msg.content,
                }))
              );

              // Update idea with report
              await ideaRepository.update(ideaId, {
                status: 'refined',
                reportJson: report,
                reportMd: reportMd.reportMd,
                summary: report.pitch.oneLiner,
              });

              // Mark interview as complete
              setInterviewState({
                ...interviewState,
                isComplete: true,
              });

              Alert.alert('Success', 'Report generated successfully!', [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.navigate('IdeaDetail', { ideaId });
                  },
                },
              ]);
            } catch (error) {
              console.error('Error generating report:', error);
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to generate report. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setGeneratingReport(false);
            }
          },
        },
        {
          text: 'Save Without Report',
          style: 'default',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (generatingReport) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
        <Text style={styles.generatingText}>Generating report...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Interview</Text>
        <TouchableOpacity onPress={handleEndInterview}>
          <Text style={styles.endButton}>End</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Start the conversation</Text>
            <Text style={styles.emptySubtext}>Share your idea and the AI will ask clarifying questions</Text>
          </View>
        }
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#9E9E9E"
          multiline
          editable={!loading && !generatingReport}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || loading || generatingReport) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || loading || generatingReport}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  endButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
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
  loadingContainer: {
    padding: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
  },
  generatingText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#212121',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
