import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Shelter } from '../types';

type Props = {
  shelters: Shelter[];
  onShelterPress: (shelter: Shelter) => void;
};

const TEL_AVIV_REGION = {
  latitude: 32.0853,
  longitude: 34.7818,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function ShelterMap({ shelters, onShelterPress }: Props) {
  return (
    <MapView style={styles.map} initialRegion={TEL_AVIV_REGION}>
      {shelters.map((shelter) => (
        <Marker
          key={shelter.id}
          coordinate={{ latitude: shelter.lat, longitude: shelter.lng }}
          pinColor="#4f6ef7"
        >
          <Callout onPress={() => onShelterPress(shelter)}>
            <View style={styles.callout}>
              <Text style={styles.calloutName}>{shelter.name}</Text>
              <Text style={styles.calloutAddress} numberOfLines={1}>{shelter.address}</Text>
              {shelter.overall_score ? (
                <Text style={styles.calloutScore}>⭐ {shelter.overall_score.toFixed(1)} / 5</Text>
              ) : (
                <Text style={styles.calloutScore}>No ratings yet</Text>
              )}
              <Text style={styles.calloutTap}>Tap for details →</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  callout: { width: 180, padding: 4 },
  calloutName: { fontWeight: '700', fontSize: 14, color: '#1a1a2e', marginBottom: 2 },
  calloutAddress: { fontSize: 12, color: '#666', marginBottom: 4 },
  calloutScore: { fontSize: 13, color: '#4f6ef7', fontWeight: '600' },
  calloutTap: { fontSize: 11, color: '#aaa', marginTop: 4 },
});
