import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import ShelterMap from '../components/ShelterMap';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { Shelter, MapStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<MapStackParamList, 'MapHome'>;
};


function ScoreBadge({ score }: { score: number }) {
  const color = score >= 4 ? '#27ae60' : score >= 3 ? '#f5a623' : '#e74c3c';
  return (
    <View style={[styles.scoreBadge, { backgroundColor: color }]}>
      <Text style={styles.scoreBadgeText}>{score.toFixed(1)}</Text>
    </View>
  );
}

export default function MapScreen({ navigation }: Props) {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'map' | 'list'>('map');

  const fetchShelters = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('shelters_with_ratings');
    if (!error && data) setShelters(data);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { fetchShelters(); }, [fetchShelters]));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4f6ef7" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'map' && styles.toggleActive]}
          onPress={() => setView('map')}
        >
          <Text style={[styles.toggleText, view === 'map' && styles.toggleTextActive]}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'list' && styles.toggleActive]}
          onPress={() => setView('list')}
        >
          <Text style={[styles.toggleText, view === 'list' && styles.toggleTextActive]}>List</Text>
        </TouchableOpacity>
      </View>

      {view === 'map' ? (
        <ShelterMap
          shelters={shelters}
          onShelterPress={(shelter) => navigation.navigate('ShelterDetail', { shelter })}
        />
      ) : (
        <FlatList
          data={shelters}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchShelters} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No shelters yet. Add the first one!</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ShelterDetail', { shelter: item })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitles}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardAddress}>{item.address}</Text>
                </View>
                {item.overall_score ? (
                  <ScoreBadge score={item.overall_score} />
                ) : null}
              </View>

              {item.rating_count ? (
                <View style={styles.cardMeta}>
                  <View style={styles.subScores}>
                    {[
                      { label: '😊', val: item.avg_friendly },
                      { label: '🛡️', val: item.avg_safe },
                      { label: '✨', val: item.avg_clean },
                      { label: '😄', val: item.avg_happy },
                    ].map(({ label, val }) => (
                      <View key={label} style={styles.subScore}>
                        <Text style={styles.subScoreEmoji}>{label}</Text>
                        <Text style={styles.subScoreVal}>{val?.toFixed(1) ?? '—'}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.ratingCount}>
                    {item.rating_count} rating{item.rating_count !== 1 ? 's' : ''}
                  </Text>
                </View>
              ) : (
                <Text style={styles.noRating}>No ratings yet</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  toggle: {
    flexDirection: 'row',
    margin: 12,
    backgroundColor: '#e8eaf0',
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  toggleActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 14, color: '#666', fontWeight: '500' },
  toggleTextActive: { color: '#1a1a2e', fontWeight: '700' },
  map: { flex: 1 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardTitles: { flex: 1 },
  cardName: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  cardAddress: { fontSize: 13, color: '#888', marginTop: 2 },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  cardMeta: { gap: 6 },
  subScores: { flexDirection: 'row', gap: 12 },
  subScore: { alignItems: 'center', gap: 2 },
  subScoreEmoji: { fontSize: 14 },
  subScoreVal: { fontSize: 12, fontWeight: '600', color: '#555' },
  ratingCount: { fontSize: 12, color: '#aaa' },
  noRating: { fontSize: 13, color: '#bbb', fontStyle: 'italic' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
});
