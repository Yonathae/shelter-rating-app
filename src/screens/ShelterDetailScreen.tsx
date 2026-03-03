import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Shelter, Rating, MapStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<MapStackParamList, 'ShelterDetail'>;
  route: RouteProp<MapStackParamList, 'ShelterDetail'>;
};

const CATEGORIES = [
  { key: 'friendly', label: 'Friendly', emoji: '😊' },
  { key: 'safe', label: 'Safe', emoji: '🛡️' },
  { key: 'clean', label: 'Clean', emoji: '✨' },
  { key: 'happy', label: 'Happy', emoji: '😄' },
] as const;

function Stars({ value }: { value: number }) {
  return (
    <Text style={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (i < Math.round(value) ? '★' : '☆')).join('')}
    </Text>
  );
}

export default function ShelterDetailScreen({ navigation, route }: Props) {
  const { shelter } = route.params;
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [myRating, setMyRating] = useState<Rating | null>(null);
  const [shelterData, setShelterData] = useState<Shelter>(shelter);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [ratingsRes, shelterRes] = await Promise.all([
      supabase.from('ratings').select('*').eq('shelter_id', shelter.id).order('created_at', { ascending: false }),
      supabase.rpc('shelters_with_ratings').eq('id', shelter.id).single(),
    ]);
    if (ratingsRes.data) {
      setRatings(ratingsRes.data);
      const mine = ratingsRes.data.find((r: Rating) => r.user_id === user?.id) ?? null;
      setMyRating(mine);
    }
    if (shelterRes.data) setShelterData(shelterRes.data);
    setLoading(false);
  }, [shelter.id, user?.id]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleDelete = () => {
    Alert.alert('Delete shelter', 'Are you sure? This will remove the shelter and all its ratings.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await supabase.from('shelters').delete().eq('id', shelter.id);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4f6ef7" /></View>;
  }

  const isOwner = user?.id === shelter.added_by;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.name}>{shelterData.name}</Text>
        <Text style={styles.address}>{shelterData.address}</Text>
        {isOwner && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>Delete Shelter</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.sectionTitle}>Average Ratings</Text>
        {shelterData.rating_count ? (
          <>
            {CATEGORIES.map(({ key, label, emoji }) => {
              const val = shelterData[`avg_${key}` as keyof Shelter] as number | undefined;
              return (
                <View key={key} style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>{emoji} {label}</Text>
                  <Stars value={val ?? 0} />
                  <Text style={styles.scoreNum}>{val ? val.toFixed(1) : '—'}</Text>
                </View>
              );
            })}
            <Text style={styles.ratingCount}>{shelterData.rating_count} rating{shelterData.rating_count !== 1 ? 's' : ''}</Text>
          </>
        ) : (
          <Text style={styles.noRating}>No ratings yet. Be the first!</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.rateBtn, myRating ? styles.rateBtnSecondary : styles.rateBtnPrimary]}
        onPress={() => navigation.navigate('RateShelter', { shelter: shelterData })}
      >
        <Text style={styles.rateBtnText}>{myRating ? 'Edit My Rating' : 'Rate This Shelter'}</Text>
      </TouchableOpacity>

      {ratings.length > 0 && (
        <View style={styles.reviews}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {ratings.map((r) => (
            <View key={r.id} style={styles.review}>
              <View style={styles.reviewScores}>
                {CATEGORIES.map(({ key, emoji }) => (
                  <Text key={key} style={styles.reviewScore}>
                    {emoji} {r[key as keyof Rating]}
                  </Text>
                ))}
              </View>
              {r.note ? <Text style={styles.reviewNote}>{r.note}</Text> : null}
              <Text style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString()}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  content: { padding: 20, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { gap: 4 },
  name: { fontSize: 24, fontWeight: '700', color: '#1a1a2e' },
  address: { fontSize: 14, color: '#888' },
  deleteBtn: { marginTop: 8, alignSelf: 'flex-start' },
  deleteBtnText: { color: '#e74c3c', fontSize: 13 },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreLabel: { flex: 1, fontSize: 15, color: '#444' },
  stars: { fontSize: 16, color: '#f5a623', letterSpacing: 2 },
  scoreNum: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', width: 32, textAlign: 'right' },
  ratingCount: { fontSize: 12, color: '#aaa', textAlign: 'right', marginTop: 4 },
  noRating: { fontSize: 14, color: '#bbb', fontStyle: 'italic' },
  rateBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rateBtnPrimary: { backgroundColor: '#4f6ef7' },
  rateBtnSecondary: { backgroundColor: '#e8eaf0' },
  rateBtnText: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  reviews: { gap: 10 },
  review: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewScores: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  reviewScore: { fontSize: 13, color: '#555' },
  reviewNote: { fontSize: 14, color: '#333', marginTop: 2 },
  reviewDate: { fontSize: 11, color: '#ccc', textAlign: 'right' },
});
