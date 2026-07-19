import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

const PROFILE_PHOTO_KEY = '@finance_app_profile_photo';

export default function ProfileScreen() {
  const [photoUri, setPhotoUri] = useState(null);

  useEffect(() => {
    loadPhoto();
  }, []);

  async function loadPhoto() {
    try {
      const savedUri = await AsyncStorage.getItem(PROFILE_PHOTO_KEY);
      setPhotoUri(savedUri);
    } catch {
      Alert.alert('Profile error', 'Could not load your saved profile photo.');
    }
  }

  async function choosePhoto() {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Photo picker failed.');
      }

      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      await AsyncStorage.setItem(PROFILE_PHOTO_KEY, uri);
      setPhotoUri(uri);
    } catch {
      Alert.alert('Photo error', 'Could not select this photo. Please try again.');
    }
  }

  function confirmRemovePhoto() {
    Alert.alert('Remove profile photo?', 'Your default avatar will be shown again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem(PROFILE_PHOTO_KEY);
          setPhotoUri(null);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.content}>
        <TouchableOpacity style={styles.avatar} onPress={choosePhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <Text style={styles.avatarText}>+</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.name}>My Finance App</Text>
        <Text style={styles.subtitle}>Local profile</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={choosePhoto}>
          <Text style={styles.primaryButtonText}>
            {photoUri ? 'Change Photo' : 'Choose Photo'}
          </Text>
        </TouchableOpacity>

        {photoUri && (
          <TouchableOpacity style={styles.removeButton} onPress={confirmRemovePhoto}>
            <Text style={styles.removeButtonText}>Remove Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '700' },
  content: { alignItems: 'center', marginTop: 48 },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 70,
    height: 140,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 140,
  },
  photo: { height: '100%', width: '100%' },
  avatarText: { color: '#64748b', fontSize: 48, fontWeight: '300' },
  name: { fontSize: 22, fontWeight: '700', marginTop: 20 },
  subtitle: { color: '#64748b', marginTop: 6 },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    marginTop: 28,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  removeButton: { marginTop: 16, padding: 12 },
  removeButtonText: { color: '#dc2626', fontWeight: '700' },
});