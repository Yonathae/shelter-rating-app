import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { Shelter, Rating, MapStackParamList } from '../types';
import { computeCumulativeScore } from '../lib/scoring';

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

const SCORE_COLOR = (score: number) =>
  score >= 4 ? '#27ae60' : score >= 3 ? '#f5a623' : '#e74c3c';

export default function TopSheltersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MapStackParamList>>();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTop = useCallback(async () => {
    setLoading(true);
    const [sheltersRes, ratingsRes] = await Promise.all([
      supabase.from('shelters').select('*'),
      supabase.from('ratings').select('*'),
    ]);
    const allShelters: Shelter[] = sheltersRes.data ?? [];
    const allRatings: Rating[] = ratingsRes.data ?? [];

    const avg = (rs: Rating[], key: keyof Rating) => {
      const vals = rs.map((r) => r[key] as number).filter(Boolean);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : undefined;
    };

    const scored = allShelters
      .map((s) => {
        const rs = allRatings.filter((r) => r.shelter_id === s.id);
        if (!rs.length) return null;
        const enriched: Shelter = {
          ...s,
          avg_friendly: avg(rs, 'friendly'),
          avg_safe: avg(rs, 'safe'),
          avg_clean: avg(rs, 'clean'),
          avg_happy: avg(rs, 'happy'),
          rating_count: rs.length,
        };
        return { ...enriched, overall_score: computeCumulativeScore(enriched, rs) };
      })
      .filter(Boolean)
      .filter((s) => s!.overall_score != null)
      .sort((a, b) => (b!.overall_score ?? 0) - (a!.overall_score ?? 0))
      .slice(0, 5) as Shelter[];

    setShelters(scored);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { fetchTop(); }, [fetchTop]));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4f6ef7" /></View>;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={shelters}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTop} />}
      ListHeaderComponent={
        <Text style={styles.title}>Top 5 Shelters in Tel Aviv</Text>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>No rated shelters yet. Be the first to rate one!</Text>
      }
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ShelterDetail', { shelter: item })}
        >
          <Text style={styles.medal}>{MEDALS[index]}</Text>
          <View style={styles.cardBody}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardAddress}>{item.address}</Text>
            <View style={styles.subScores}>
              {[
                { emoji: '😊', val: item.avg_friendly },
                { emoji: '🛡️', val: item.avg_safe },
                { emoji: '✨', val: item.avg_clean },
                { emoji: '😄', val: item.avg_happy },
              ].map(({ emoji, val }) => (
                <View key={emoji} style={styles.subScore}>
                  <Text style={styles.subEmoji}>{emoji}</Text>
                  <Text style={styles.subVal}>{val?.toFixed(1) ?? '—'}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.ratingCount}>
              {item.rating_count} rating{item.rating_count !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: SCORE_COLOR(item.overall_score!) }]}>
            <Text style={styles.scoreNum}>{item.overall_score!.toFixed(1)}</Text>
            <Text style={styles.scoreLabel}>/ 5</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medal: { fontSize: 28 },
  cardBody: { flex: 1, gap: 4 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  cardAddress: { fontSize: 12, color: '#aaa' },
  subScores: { flexDirection: 'row', gap: 10, marginTop: 4 },
  subScore: { alignItems: 'center' },
  subEmoji: { fontSize: 13 },
  subVal: { fontSize: 11, fontWeight: '600', color: '#555' },
  ratingCount: { fontSize: 11, color: '#ccc', marginTop: 2 },
  scoreBadge: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { color: '#fff', fontSize: 18, fontWeight: '800', lineHeight: 20 },
  scoreLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
});
