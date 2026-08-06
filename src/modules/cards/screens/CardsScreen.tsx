import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useGetVisitingCards } from '../../../services/query/cards/cards';
import {
  useCreateVisitingCard,
  useUpdateVisitingCard,
  useDeleteVisitingCard,
} from '../../../services/mutation/cards/cards';
import { VisitingCard, CreateVisitingCardPayload } from '../types/cardTypes';
import { ThreeDVisitingCard } from '../components/ThreeDVisitingCard';
import { CardFormModal } from '../components/CardFormModal';
import { QRCodeModal } from '../components/QRCodeModal';

export function CardsScreen() {
  const { data: cards = [], isLoading, isRefetching, refetch } = useGetVisitingCards();
  const createMutation = useCreateVisitingCard();
  const updateMutation = useUpdateVisitingCard();
  const deleteMutation = useDeleteVisitingCard();

  const [formModalVisible, setFormModalVisible] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<VisitingCard | null>(null);
  const [selectedQRCard, setSelectedQRCard] = React.useState<VisitingCard | null>(null);
  const [qrModalVisible, setQrModalVisible] = React.useState(false);

  // Auto-fetch API list when focused
  useFocusEffect(
    useCallback(() => {
      console.log('[DEBUG CardsScreen] Screen gained focus - calling refetch() for visiting cards API');
      refetch();
    }, [refetch])
  );

  const handleOpenCreate = () => {
    setEditingCard(null);
    setFormModalVisible(true);
  };

  const handleOpenEdit = (card: VisitingCard) => {
    setEditingCard(card);
    setFormModalVisible(true);
  };

  const handleShowQR = (card: VisitingCard) => {
    setSelectedQRCard(card);
    setQrModalVisible(true);
  };

  const handleDeleteCard = (card: VisitingCard) => {
    Alert.alert(
      'Delete Visiting Card',
      `Are you sure you want to delete "${card.card_name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(card.id);
              Alert.alert('Deleted', 'Visiting card permanently deleted.');
            } catch (e) {
              Alert.alert('Error', 'Could not delete visiting card.');
            }
          },
        },
      ]
    );
  };

  const handleFormSubmit = async (payload: CreateVisitingCardPayload) => {
    try {
      if (editingCard) {
        await updateMutation.mutateAsync({ id: editingCard.id, payload });
        Alert.alert('Success', 'Visiting card updated successfully!');
      } else {
        await createMutation.mutateAsync(payload);
        Alert.alert('Success', 'Visiting card created successfully!');
      }
      setFormModalVisible(false);
      setEditingCard(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to save visiting card.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.container}>
        {/* Top Header Banner with Status Bar Clearance */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Visiting Cards</Text>
            <Text style={styles.headerSubtitle}>
              {cards.length} {cards.length === 1 ? 'Card' : 'Cards'} Available
            </Text>
          </View>

          <TouchableOpacity style={styles.createHeaderBtn} onPress={handleOpenCreate}>
            <LinearGradient
              colors={['#4B65E4', '#6366F1']}
              style={styles.createBtnGradient}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.createHeaderBtnText}>New Card</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Main Cards List */}
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#4B65E4"
            />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4B65E4" />
              <Text style={styles.loadingText}>Loading Visiting Cards...</Text>
            </View>
          ) : cards.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="card-outline" size={48} color="#4B65E4" />
              </View>
              <Text style={styles.emptyTitle}>No Visiting Cards Found</Text>
              <Text style={styles.emptySubtitle}>
                Create your first digital visiting card for personal or corporate use.
              </Text>

              <TouchableOpacity style={styles.emptyCreateBtn} onPress={handleOpenCreate}>
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.emptyCreateBtnText}>Create Card Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardsFeed}>
              {cards.map((cardItem) => (
                <View key={cardItem.id} style={styles.cardWrapper}>
                  <ThreeDVisitingCard
                    card={cardItem}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteCard}
                    onShowQR={handleShowQR}
                    interactive={true}
                  />
                </View>
              ))}
            </View>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Form Modal */}
        <CardFormModal
          visible={formModalVisible}
          editingCard={editingCard}
          onClose={() => setFormModalVisible(false)}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        {/* QR Code Modal */}
        <QRCodeModal
          visible={qrModalVisible}
          card={selectedQRCard}
          onClose={() => setQrModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 20,
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  badgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B65E4',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  createHeaderBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  createHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 12,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4B65E4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyCreateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  cardsFeed: {
    alignItems: 'center',
    gap: 20,
  },
  cardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
});
