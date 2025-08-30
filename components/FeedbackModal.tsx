import React, { useState } from "react";
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Button } from "./Button";
import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/utils/supabase";

export type FeedbackModalProps = {
  visible: boolean;
  onClose: () => void;
};

type FeedbackType = "bug" | "feature" | "improvement" | "general";

const feedbackTypes: { value: FeedbackType; label: string; description: string }[] = [
  { value: "bug", label: "🐛 Bug Report", description: "Something isn't working correctly" },
  { value: "feature", label: "✨ Feature Request", description: "I'd like to see a new feature" },
  { value: "improvement", label: "🚀 Improvement", description: "Make something better" },
  { value: "general", label: "💬 General Feedback", description: "Other thoughts or comments" },
];

export function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const [selectedType, setSelectedType] = useState<FeedbackType>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#E5E5E5', dark: '#333' }, 'border');
  const cardColor = useThemeColor({ light: '#F8F9FA', dark: '#1C1C1E' }, 'card');

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Missing Information", "Please fill in both subject and message fields.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id || null,
          feedback_type: selectedType,
          subject: subject.trim(),
          message: message.trim(),
          email: email.trim() || null,
        });

      if (error) {
        console.error('Error submitting feedback:', error);
        Alert.alert("Error", "Failed to submit feedback. Please try again.");
        return;
      }

      Alert.alert(
        "Thank You!",
        "Your feedback has been submitted successfully. We appreciate you taking the time to help improve FitVibez!",
        [{ text: "OK", onPress: handleClose }]
      );
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedType("general");
    setSubject("");
    setMessage("");
    setEmail("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ThemedView style={[styles.container, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Send Feedback
            </ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <ThemedText style={styles.closeText}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Feedback Type Selection */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                What type of feedback would you like to share?
              </ThemedText>
              
              <View style={styles.typeGrid}>
                {feedbackTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeCard,
                      { 
                        backgroundColor: cardColor,
                        borderColor: selectedType === type.value ? '#FF6B6B' : borderColor,
                        borderWidth: selectedType === type.value ? 2 : 1,
                      }
                    ]}
                    onPress={() => setSelectedType(type.value)}
                  >
                    <ThemedText type="defaultSemiBold" style={styles.typeLabel}>
                      {type.label}
                    </ThemedText>
                    <ThemedText style={[styles.typeDescription, { color: textColor + '80' }]}>
                      {type.description}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Subject */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Subject *
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                placeholder="Brief summary of your feedback"
                placeholderTextColor={textColor + '60'}
                value={subject}
                onChangeText={setSubject}
                maxLength={100}
              />
            </View>

            {/* Message */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Message *
              </ThemedText>
              <TextInput
                style={[styles.textArea, { borderColor, color: textColor }]}
                placeholder="Please provide details about your feedback..."
                placeholderTextColor={textColor + '60'}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={1000}
              />
              <ThemedText style={[styles.charCount, { color: textColor + '60' }]}>
                {message.length}/1000
              </ThemedText>
            </View>

            {/* Optional Email */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Email (Optional)
              </ThemedText>
              <ThemedText style={[styles.sectionDescription, { color: textColor + '80' }]}>
                Leave your email if you'd like us to follow up with you
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                placeholder="your.email@example.com"
                placeholderTextColor={textColor + '60'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <Button
              title={isSubmitting ? "Submitting..." : "Send Feedback"}
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={!subject.trim() || !message.trim()}
              style={styles.submitButton}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 16,
  },
  sectionDescription: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  typeGrid: {
    gap: 12,
  },
  typeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeLabel: {
    marginBottom: 4,
    fontSize: 16,
  },
  typeDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 120,
  },
  charCount: {
    textAlign: 'right',
    marginTop: 4,
    fontSize: 12,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  submitButton: {
    width: '100%',
  },
});