import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '../components/firebase/firebase';
import { BlurView } from 'expo-blur';

interface FeedbackProps {
  items: Array<{
    name: string;
    id: string;
  }>;
  isVisible: boolean;
  onClose: () => void;
  orderId: string;
}

const OrderFeedback: React.FC<FeedbackProps> = ({ items, isVisible, onClose, orderId }) => {
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [submitted, setSubmitted] = useState(false);

  // Reset state when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      setRatings({});
      setSubmitted(false);
    }
  }, [isVisible]);

  const handleRating = (itemId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [itemId]: rating
    }));
  };

  const submitFeedback = async () => {
    try {
      // Update ratings for each item
      for (const itemId in ratings) {
        const itemRef = doc(firestore, 'items', itemId);
        const itemDoc = await getDoc(itemRef);
        
        if (itemDoc.exists()) {
          const currentData = itemDoc.data();
          const currentRatings = currentData.ratings || [];
          
          await updateDoc(itemRef, {
            ratings: arrayUnion(ratings[itemId]),
            averageRating: currentRatings.length > 0 
              ? (currentRatings.reduce((a: number, b: number) => a + b, 0) + ratings[itemId]) / (currentRatings.length + 1)
              : ratings[itemId]
          });
        }
      }

      // Store feedback submission status in the order document
      const orderRef = doc(firestore, 'orders', orderId);
      await updateDoc(orderRef, {
        feedbackSubmitted: true
      });

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const renderStars = (itemId: string) => {
    const rating = ratings[itemId] || 0;
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRating(itemId, star)}
            style={styles.starButton}
          >
            <MaterialIcons
              name={star <= rating ? 'star' : 'star-border'}
              size={32}
              color={star <= rating ? '#FFD700' : '#CBD5E1'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={90} style={styles.modalContainer}>
        <ThemedView style={styles.modalContent}>
          {!submitted ? (
            <>
              <ThemedText style={styles.modalTitle}>How's Your Food?</ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                While your order is being prepared, let us know about your previous experience with these items
              </ThemedText>
              
              {items.map((item) => (
                <View key={item.id} style={styles.itemContainer}>
                  <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                  {renderStars(item.id)}
                </View>
              ))}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={submitFeedback}
                  disabled={Object.keys(ratings).length === 0}
                >
                  <ThemedText style={styles.buttonText}>Submit Feedback</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.skipButton]}
                  onPress={onClose}
                >
                  <ThemedText style={styles.skipButtonText}>Maybe Later</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <MaterialIcons name="check-circle" size={64} color="#48c479" />
              <ThemedText style={styles.successText}>Thank you for your feedback!</ThemedText>
            </View>
          )}
        </ThemedView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  itemContainer: {
    marginBottom: 24,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 4,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  submitButton: {
    backgroundColor: '#FC8019',
  },
  skipButton: {
    backgroundColor: '#f1f5f9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    padding: 24,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default OrderFeedback;