import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Bounding box for Tel Aviv municipality (roughly)
const TEL_AVIV_BOUNDS = { minLat: 32.03, maxLat: 32.14, minLng: 34.74, maxLng: 34.83 };

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const encoded = encodeURIComponent(`${address}, Tel Aviv, Israel`);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ShelterRaterApp/1.0' },
  });
  const json = await res.json();
  if (json.length > 0) {
    const lat = parseFloat(json[0].lat);
    const lng = parseFloat(json[0].lon);
    const inTelAviv =
      lat >= TEL_AVIV_BOUNDS.minLat && lat <= TEL_AVIV_BOUNDS.maxLat &&
      lng >= TEL_AVIV_BOUNDS.minLng && lng <= TEL_AVIV_BOUNDS.maxLng;
    if (!inTelAviv) return null;
    return { lat, lng };
  }
  return null;
}

export default function AddShelterScreen() {
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please provide an address.');
      return;
    }
    setLoading(true);
    try {
      const coords = await geocodeAddress(address.trim());
      if (!coords) {
        Alert.alert('Address not found', 'Could not locate this address in Tel Aviv. Only Tel Aviv addresses are supported.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.from('shelters').insert({
        name: address.trim(),
        address: address.trim(),
        lat: coords.lat,
        lng: coords.lng,
        added_by: user!.id,
      });
      if (error) throw error;
      Alert.alert('Added!', 'Shelter has been added to the map.');
      setAddress('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add a Shelter</Text>
        <Text style={styles.subtitle}>
          Know a shelter in Tel Aviv? Enter its address and we'll place it on the map.
        </Text>

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Rothschild Blvd 50, Tel Aviv"
          placeholderTextColor="#bbb"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.hint}>
          We'll automatically place the shelter on the map using the address you provide.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add Shelter</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  content: { padding: 24, gap: 8 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 16, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  hint: { fontSize: 12, color: '#bbb', marginTop: 4, lineHeight: 18 },
  button: {
    backgroundColor: '#4f6ef7',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
