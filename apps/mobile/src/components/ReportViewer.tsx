import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { IdeaReport } from '../types';

interface ReportViewerProps {
  reportMd: string;
  reportJson: IdeaReport | null;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ reportMd, reportJson }) => {
  const [viewMode, setViewMode] = useState<'markdown' | 'structured'>('markdown');

  if (!reportMd && !reportJson) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No report available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'markdown' && styles.toggleButtonActive]}
          onPress={() => setViewMode('markdown')}
        >
          <Text style={[styles.toggleText, viewMode === 'markdown' && styles.toggleTextActive]}>
            Markdown
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'structured' && styles.toggleButtonActive]}
          onPress={() => setViewMode('structured')}
        >
          <Text style={[styles.toggleText, viewMode === 'structured' && styles.toggleTextActive]}>
            Structured
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {viewMode === 'markdown' ? (
          <Markdown style={markdownStyles}>{reportMd}</Markdown>
        ) : (
          <StructuredView report={reportJson} />
        )}
      </ScrollView>
    </View>
  );
};

const StructuredView: React.FC<{ report: IdeaReport | null }> = ({ report }) => {
  if (!report) {
    return <Text style={styles.emptyText}>No structured report available</Text>;
  }

  return (
    <View style={styles.structuredContainer}>
      <Section title="Pitch">
        <Text style={styles.label}>Title:</Text>
        <Text style={styles.value}>{report.pitch.title}</Text>
        <Text style={styles.label}>One-liner:</Text>
        <Text style={styles.value}>{report.pitch.oneLiner}</Text>
      </Section>

      <Section title="Problem">
        <Text style={styles.label}>Statement:</Text>
        <Text style={styles.value}>{report.problem.statement}</Text>
        <Text style={styles.label}>Why Now:</Text>
        <Text style={styles.value}>{report.problem.whyNow}</Text>
      </Section>

      <Section title="Audience">
        {report.audience.personas.map((persona, idx) => (
          <View key={idx} style={styles.personaContainer}>
            <Text style={styles.personaName}>{persona.name}</Text>
            <Text style={styles.value}>{persona.description}</Text>
            <Text style={styles.label}>Pain Points:</Text>
            {persona.painPoints.map((point, pIdx) => (
              <Text key={pIdx} style={styles.bulletPoint}>• {point}</Text>
            ))}
          </View>
        ))}
      </Section>

      <Section title="Solution">
        <Text style={styles.value}>{report.solution.description}</Text>
        <Text style={styles.label}>Differentiators:</Text>
        {report.solution.differentiators.map((diff, idx) => (
          <Text key={idx} style={styles.bulletPoint}>• {diff}</Text>
        ))}
      </Section>

      <Section title="Features">
        <Text style={styles.label}>MVP:</Text>
        {report.features.mvp.map((feature, idx) => (
          <Text key={idx} style={styles.bulletPoint}>• {feature}</Text>
        ))}
        <Text style={styles.label}>Later:</Text>
        {report.features.later.map((feature, idx) => (
          <Text key={idx} style={styles.bulletPoint}>• {feature}</Text>
        ))}
      </Section>

      <Section title="Architecture">
        <Text style={styles.value}>{report.architecture.overview}</Text>
        <Text style={styles.label}>Components:</Text>
        {report.architecture.components.map((component, idx) => (
          <Text key={idx} style={styles.bulletPoint}>• {component}</Text>
        ))}
      </Section>

      <Section title="Roadmap">
        {report.roadmap.phases.map((phase, idx) => (
          <View key={idx} style={styles.phaseContainer}>
            <Text style={styles.phaseName}>{phase.name} ({phase.duration})</Text>
            {phase.deliverables.map((deliverable, dIdx) => (
              <Text key={dIdx} style={styles.bulletPoint}>• {deliverable}</Text>
            ))}
          </View>
        ))}
      </Section>

      <Section title="Risks">
        {report.risks.items.map((risk, idx) => (
          <View key={idx} style={styles.riskContainer}>
            <Text style={styles.label}>Risk:</Text>
            <Text style={styles.value}>{risk.risk}</Text>
            <Text style={styles.label}>Mitigation:</Text>
            <Text style={styles.value}>{risk.mitigation}</Text>
          </View>
        ))}
      </Section>
    </View>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  structuredContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
    paddingBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginTop: 8,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
    marginLeft: 8,
    marginBottom: 4,
  },
  personaContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  personaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  phaseContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  riskContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
});

const markdownStyles = {
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: '#212121',
  },
  heading1: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#212121',
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#212121',
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
    color: '#212121',
  },
  paragraph: {
    marginBottom: 8,
  },
  listItem: {
    marginBottom: 4,
  },
};
