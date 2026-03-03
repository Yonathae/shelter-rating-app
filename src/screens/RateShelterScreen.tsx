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
  Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { MapStackParamList } from '../types';
import { SUB_CATEGORIES, SubQuestion } from '../lib/subCategories';

type Props = {
  navigation: NativeStackNavigationProp<MapStackParamList, 'RateShelter'>;
  route: RouteProp<MapStackParamList, 'RateShelter'>;
};

const MAIN_CATEGORIES = [
  { key: 'friendly', label: 'Friendly', emoji: '😊', description: 'How welcoming and friendly is it?' },
  { key: 'safe', label: 'Safe', emoji: '🛡️', description: 'How safe does it feel?' },
  { key: 'clean', label: 'Clean', emoji: '✨', description: 'How clean and well-maintained?' },
  { key: 'happy', label: 'Happy', emoji: '😄', description: 'Overall positive feeling?' },
] as const;

type MainScores = { friendly: number; safe: number; clean: number; happy: number };

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

function ScalePicker({ question, value, onChange }: {
  question: Extract<SubQuestion, { type: 'scale' }>;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.subQuestion}>
      <Text style={styles.subQuestionLabel}>{question.label}</Text>
      <View style={styles.scaleRow}>
        <Text style={styles.scaleEdge}>{question.low}</Text>
        <View style={styles.scalePips}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => onChange(n)} style={[styles.pip, n <= value && styles.pipFilled]}>
              <Text style={[styles.pipText, n <= value && styles.pipTextFilled]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.scaleEdge}>{question.high}</Text>
      </View>
    </View>
  );
}

function BoolPicker({ question, value, onChange }: {
  question: Extract<SubQuestion, { type: 'bool' }>;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.subQuestion}>
      <View style={styles.boolRow}>
        <Text style={styles.subQuestionLabel}>{question.label}</Text>
        <Switch value={value} onValueChange={onChange} trackColor={{ true: '#4f6ef7' }} />
      </View>
    </View>
  );
}

export default function RateShelterScreen({ navigation, route }: Props) {
  const { shelter } = route.params;
  const { user } = useAuth();
  const [mainScores, setMainScores] = useState<MainScores>({ friendly: 0, safe: 0, clean: 0, happy: 0 });
  const [subRatings, setSubRatings] = useState<Record<string, number | boolean>>({});
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('ratings')
      .select('*')
      .eq('shelter_id', shelter.id)
      .eq('user_id', user!.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setExistingId(data.id);
          setMainScores({ friendly: data.friendly, safe: data.safe, clean: data.clean, happy: data.happy });
          setSubRatings(data.sub_ratings ?? {});
          setNote(data.note ?? '');
        }
      });
  }, [shelter.id, user?.id]);

  const setSubValue = (key: string, value: number | boolean) => {
    setSubRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (Object.values(mainScores).some((v) => v === 0)) {
      Alert.alert('Incomplete', 'Please rate all 4 main categories.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...mainScores,
        note: note.trim() || null,
        sub_ratings: Object.keys(subRatings).length > 0 ? subRatings : null,
      };
      if (existingId) {
        const { error } = await supabase.from('ratings').update(payload).eq('id', existingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ratings').insert({
          shelter_id: shelter.id,
          user_id: user!.id,
          ...payload,
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

      {/* Main categories */}
      <Text style={styles.sectionHeader}>General</Text>
      {MAIN_CATEGORIES.map(({ key, label, emoji, description }) => (
        <View key={key} style={styles.card}>
          <Text style={styles.cardLabel}>{emoji} {label}</Text>
          <Text style={styles.cardDesc}>{description}</Text>
          <StarPicker
            value={mainScores[key]}
            onChange={(v) => setMainScores((prev) => ({ ...prev, [key]: v }))}
          />
        </View>
      ))}

      {/* Sub-categories */}
      {SUB_CATEGORIES.map((cat) => (
        <View key={cat.key}>
          <Text style={styles.sectionHeader}>{cat.emoji} {cat.label}</Text>
          <View style={styles.card}>
            {cat.questions.map((q) => (
              q.type === 'scale' ? (
                <ScalePicker
                  key={q.key}
                  question={q}
                  value={(subRatings[q.key] as number) ?? 0}
                  onChange={(v) => setSubValue(q.key, v)}
                />
              ) : (
                <BoolPicker
                  key={q.key}
                  question={q}
                  value={(subRatings[q.key] as boolean) ?? false}
                  onChange={(v) => setSubValue(q.key, v)}
                />
              )
            ))}
          </View>
        </View>
      ))}

      {/* Note */}
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
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a2e' },
  shelterName: { fontSize: 14, color: '#888', marginBottom: 4 },
  sectionHeader: { fontSize: 17, fontWeight: '700', color: '#1a1a2e', marginTop: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  cardDesc: { fontSize: 12, color: '#aaa', marginTop: -8 },
  starRow: { flexDirection: 'row', gap: 8 },
  starBtn: { padding: 2 },
  star: { fontSize: 28, color: '#ddd' },
  starFilled: { color: '#f5a623' },

  subQuestion: { gap: 8 },
  subQuestionLabel: { fontSize: 14, color: '#333', fontWeight: '500', flex: 1 },
  scaleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scaleEdge: { fontSize: 10, color: '#aaa', flex: 1, textAlign: 'center' },
  scalePips: { flexDirection: 'row', gap: 6 },
  pip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipFilled: { backgroundColor: '#4f6ef7' },
  pipText: { fontSize: 13, fontWeight: '600', color: '#aaa' },
  pipTextFilled: { color: '#fff' },
  boolRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

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
