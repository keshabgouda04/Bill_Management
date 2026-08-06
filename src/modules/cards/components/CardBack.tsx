import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Animated } from 'react-native';
import { VisitingCardProps } from '../types/cardProps';

interface CardBackProps {
  data: VisitingCardProps;
}

export const CardBack: React.FC<CardBackProps> = ({ data }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 8,
        tension: 20,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // OCR Field Filter: Only display non-empty fields!
  const fields = [
    { label: 'NAME', value: data.name },
    { label: 'DESIGNATION', value: data.designation },
    { label: 'COMPANY', value: data.company },
    { label: 'PHONE', value: data.phone },
    // { label: 'EMAIL', value: data.email },
    { label: 'WEBSITE', value: data.website },
    { label: 'ADDRESS', value: data.address },
  ].filter((f) => Boolean(f.value && f.value.trim() !== ''));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>CARD DETAILS</Text>

        {fields.map((field) => (
          <View key={field.label} style={styles.fieldBox}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <Text style={styles.fieldValue}>{field.value}</Text>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 4,
  },
  title: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  fieldBox: {
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  fieldValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
});
