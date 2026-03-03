import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { MapStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<MapStackParamList, 'RateShelter'>;
  route: RouteProp<MapStackParamList, 'RateShelter'>;
};

const CATEGORIES = [
  { key: 'friendly', label: 'Friendly', emoji: '😊', description: 'How welcoming and friendly is it?' },
  { key: 'safe', label: 'Safe', emoji: '🛡️', description: 'How safe does it feel?' },
  { key: 'clean', label: 'Clean', emoji: '✨', description: 'How clean and well-maintained?' },
  { key: 'happy', label: 'Happy', emoji: '😄', description: 'Overall positive feeling?' },
] as const;

type Scores = { friendly: number; safe: number; clean: number; happy: number };

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} style={styles.starBtn}>
          <Text style={[styles.star, n <= value && styles.starFilled]}>{n <= value ? '★' : '☆'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function RateShelterScreen({ navigation, route }: Props) {
  const { shelter } = route.params;
  const { user } = useAuth();
  const [scores, setScores] = useState<Scores>({ friendly: 0, safe: 0, clean: 0, happy: 0 });
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    // Load existing rating if any
    supabase
      .from('ratings')
      .select('*')
      .eq('shelter_id', shelter.id)
      .eq('user_id', user!.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setExistingId(data.id);
          setScores({ friendly: data.friendly, safe: data.safe, clean: data.clean, happy: data.happy });
          setNote(data.note ?? '');
        }
      });
  }, [shelter.id, user?.id]);

  const handleSubmit = async () => {
    if (Object.values(scores).some((v) => v === 0)) {
      Alert.alert('Incomplete', 'Please rate all 4 categories.');
      return;
    }
    setLoading(true);
    try {
      if (existingId) {
        const { error } = await supabase
          .from('ratings')
          .update({ ...scores, note: note.trim() || null })
          .eq('id', existingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ratings').insert({
          shelter_id: shelter.id,
          user_id: user!.id,
          ...scores,
          note: note.trim() || null,
        });
        if (error) throw error;
      }
      Alert.alert('Thanks!', 'Your rating has been saved.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Rate this shelter</Text>
      <Text style={styles.shelterName}>{shelter.name}</Text>

      {CATEGORIES.map(({ key, label, emoji, description }) => (
        <View key={key} style={styles.category}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryLabel}>{emoji} {label}</Text>
            <Text style={styles.categoryDesc}>{description}</Text>
          </View>
          <StarPicker
            value={scores[key]}
            onChange={(v) => setScores((prev) => ({ ...prev, [key]: v }))}
          />
        </View>
      ))}

      <View style={styles.noteSection}>
        <Text style={styles.noteLabel}>Add a note (optional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Share your experience..."
          placeholderTextColor="#bbb"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{existingId ? 'Update Rating' : 'Submit Rating'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  content: { padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a2e' },
  shelterName: { fontSize: 15, color: '#888', marginBottom: 8 },
  category: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  categoryHeader: { gap: 2 },
  categoryLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  categoryDesc: { fontSize: 12, color: '#aaa' },
  starRow: { flexDirection: 'row', gap: 8 },
  starBtn: { padding: 4 },
  star: { fontSize: 30, color: '#ddd' },
  starFilled: { color: '#f5a623' },
  noteSection: { gap: 6 },
  noteLabel: { fontSize: 14, fontWeight: '600', color: '#444' },
  noteInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4f6ef7',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
