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
  useUploadCardPhoto,
  useDeleteCardPhoto,
  useUploadCardLogo,
  useDeleteCardLogo,
} from '../../../services/mutation/cards/cards';
import { VisitingCard, CreateVisitingCardPayload } from '../types/cardTypes';
import { ThreeDVisitingCard } from '../components/ThreeDVisitingCard';
import { CardFormModal, CardFormSubmitData } from '../components/CardFormModal';
import { QRCodeModal } from '../components/QRCodeModal';
import { CardDivider } from '../components/CardDivider';

export function CardsScreen() {
  const { data: cards = [], isLoading, isRefetching, refetch } = useGetVisitingCards();
  const createMutation = useCreateVisitingCard();
  const updateMutation = useUpdateVisitingCard();
  const deleteMutation = useDeleteVisitingCard();

  const uploadPhotoMutation = useUploadCardPhoto();
  const deletePhotoMutation = useDeleteCardPhoto();
  const uploadLogoMutation = useUploadCardLogo();
  const deleteLogoMutation = useDeleteCardLogo();

  const [formModalVisible, setFormModalVisible] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<VisitingCard | null>(null);
  const [selectedQRCard, setSelectedQRCard] = React.useState<VisitingCard | null>(null);
  const [qrModalVisible, setQrModalVisible] = React.useState(false);

  // Auto-fetch API list when focused
  useFocusEffect(
    useCallback(() => {
      console.log('🔍 [CardsScreen] Focused - Triggering refetch() for visiting cards...');
      refetch();
    }, [refetch])
  );

  React.useEffect(() => {
    console.log('📱 [CardsScreen VISITING CARDS LIST DATA]:', JSON.stringify(cards, null, 2));
  }, [cards]);

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

  const handleFormSubmit = async ({
    payload,
    localPhoto,
    localLogo,
    shouldDeletePhoto,
    shouldDeleteLogo,
  }: CardFormSubmitData) => {
    try {
      let cardId = editingCard?.id;

      // Step 1: Create or Update text details (without local file:/// paths in JSON)
      if (editingCard && cardId) {
        await updateMutation.mutateAsync({ id: cardId, payload });
      } else {
        const createdCard = await createMutation.mutateAsync(payload);
        cardId = createdCard?.id;
      }

      if (!cardId) {
        throw new Error('Failed to retrieve card ID.');
      }

      // Step 2: Upload or Delete Profile Photo to Cloudflare R2
      if (localPhoto && localPhoto.uri) {
        console.log('📤 [R2 UPLOAD] Uploading profile photo for card ID:', cardId);
        await uploadPhotoMutation.mutateAsync({ id: cardId, file: localPhoto });
      } else if (shouldDeletePhoto && editingCard) {
        console.log('🗑️ [R2 DELETE] Removing profile photo for card ID:', cardId);
        await deletePhotoMutation.mutateAsync(cardId);
      }

      // Step 3: Upload or Delete Company Logo to Cloudflare R2
      if (localLogo && localLogo.uri) {
        console.log('📤 [R2 UPLOAD] Uploading company logo for card ID:', cardId);
        await uploadLogoMutation.mutateAsync({ id: cardId, file: localLogo });
      } else if (shouldDeleteLogo && editingCard) {
        console.log('🗑️ [R2 DELETE] Removing company logo for card ID:', cardId);
        await deleteLogoMutation.mutateAsync(cardId);
      }

      Alert.alert('Success', editingCard ? 'Visiting card updated successfully!' : 'Visiting card created successfully!');
      setFormModalVisible(false);
      setEditingCard(null);
    } catch (e: any) {
      console.error('Failed to save visiting card:', e);
      Alert.alert('Error', e?.message || 'Failed to save visiting card.');
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
              {cards.map((cardItem, index) => (
                <React.Fragment key={cardItem.id}>
                  <View style={styles.cardWrapper}>
                    <ThreeDVisitingCard
                      card={cardItem}
                      autoIntroPeek={index === 0}
                      onEdit={handleOpenEdit}
                      onDelete={handleDeleteCard}
                      onShowQR={handleShowQR}
                      interactive={true}
                    />
                  </View>
                  {index < cards.length - 1 && (
                    <CardDivider
                      index={index}
                      categoryName={cards[index + 1].card_name}
                      jobTitle={cards[index + 1].job_title}
                      companyName={cards[index + 1].company_name}
                    />
                  )}
                </React.Fragment>
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
    gap: 8,
  },
  cardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
});
