import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  VisitingCard,
  CreateVisitingCardPayload,
  validateVisitingCardPayload,
} from '../types/cardTypes';
import { ThreeDVisitingCard } from './ThreeDVisitingCard';

const { width } = Dimensions.get('window');

interface CardFormModalProps {
  visible: boolean;
  editingCard?: VisitingCard | null;
  onClose: () => void;
  onSubmit: (payload: CreateVisitingCardPayload) => Promise<void>;
  isLoading?: boolean;
}

const TEMPLATES = [
  {
    id: 1,
    name: 'Cyber Onyx',
    subtitle: 'Futuristic Dark Obsidian & Cyan Glow',
    badge: '#38BDF8',
    gradient: ['#0D1527', '#17243B'],
  },
  {
    id: 2,
    name: 'Royal Gold',
    subtitle: 'Champagne Gold Foil & Velvet Glass',
    badge: '#F7D070',
    gradient: ['#1E1629', '#2E1D38'],
  },
  {
    id: 3,
    name: 'Sapphire Exec',
    subtitle: 'Royal Navy & Platinum Silver Accent',
    badge: '#38BDF8',
    gradient: ['#0A192F', '#1E293B'],
  },
  {
    id: 4,
    name: 'Emerald Luxe',
    subtitle: 'Deep Emerald Green & Gold Frame',
    badge: '#34D399',
    gradient: ['#042F2E', '#064E3B'],
  },
  {
    id: 5,
    name: 'Titanium Steel',
    subtitle: 'Brushed Titanium Steel & Chrome Monochrome',
    badge: '#9CA3AF',
    gradient: ['#1F2937', '#374151'],
  },
];

export function CardFormModal({
  visible,
  editingCard,
  onClose,
  onSubmit,
  isLoading = false,
}: CardFormModalProps) {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Select Template, Step 2: Fill Details

  const [cardName, setCardName] = useState('');
  const [templateId, setTemplateId] = useState(1);
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [mobile, setMobile] = useState('');
  const [alternateMobile, setAlternateMobile] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [pincode, setPincode] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [instagram, setInstagram] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingCard) {
      setStep(2); // Directly open details step if editing
      setCardName(editingCard.card_name || '');
      setTemplateId(editingCard.template_id || 1);
      setFullName(editingCard.full_name || '');
      setJobTitle(editingCard.job_title || '');
      setCompanyName(editingCard.company_name || '');
      setCompanyLogoUrl(editingCard.company_logo_url || '');
      setProfilePhotoUrl(editingCard.profile_photo_url || '');
      setMobile(editingCard.mobile || '');
      setAlternateMobile(editingCard.alternate_mobile || '');
      setEmail(editingCard.email || '');
      setWebsite(editingCard.website || '');
      setBio(editingCard.bio || '');
      setStreet(editingCard.street || '');
      setCity(editingCard.city || '');
      setState(editingCard.state || '');
      setCountry(editingCard.country || '');
      setPincode(editingCard.pincode || '');
      setLinkedin(editingCard.social_links?.linkedin || '');
      setTwitter(editingCard.social_links?.twitter || '');
      setGithub(editingCard.social_links?.github || '');
      setInstagram(editingCard.social_links?.instagram || '');
      setIsActive(editingCard.is_active ?? true);
    } else {
      setStep(1); // Start at Step 1 (Template Selection) for new card
      resetForm();
    }
    setValidationErrors({});
  }, [editingCard, visible]);

  const resetForm = () => {
    setCardName('My Business Card');
    setTemplateId(1);
    setFullName('');
    setJobTitle('');
    setCompanyName('');
    setCompanyLogoUrl('');
    setProfilePhotoUrl('');
    setMobile('');
    setAlternateMobile('');
    setEmail('');
    setWebsite('');
    setBio('');
    setStreet('');
    setCity('');
    setState('');
    setCountry('');
    setPincode('');
    setLinkedin('');
    setTwitter('');
    setGithub('');
    setInstagram('');
    setIsActive(true);
  };

  const handlePickImage = async (target: 'profile' | 'logo') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Media library access is required to pick an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: target === 'profile' ? [1, 1] : [2, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      if (target === 'profile') setProfilePhotoUrl(uri);
      else setCompanyLogoUrl(uri);
    }
  };

  // Sample live card object for real-time 3D preview
  const livePreviewCard: VisitingCard = {
    id: editingCard?.id || 'preview',
    card_name: cardName || 'Card Name Preview',
    template_id: templateId,
    full_name: fullName || 'Keshab Gouda',
    job_title: jobTitle || 'Senior Software Engineer',
    company_name: companyName || 'Acme Corp',
    company_logo_url: companyLogoUrl || undefined,
    profile_photo_url: profilePhotoUrl || undefined,
    mobile: mobile || '+1 (555) 382-9102',
    email: email || 'keshabgouda04@gmail.com',
    website: website || undefined,
    bio: bio || undefined,
    street: street || undefined,
    city: city || undefined,
    state: state || undefined,
    country: country || undefined,
    pincode: pincode || undefined,
    social_links: {
      linkedin: linkedin || undefined,
      twitter: twitter || undefined,
      github: github || undefined,
      instagram: instagram || undefined,
    },
    is_active: isActive,
  };

  const handleSubmit = async () => {
    const payload: CreateVisitingCardPayload = {
      card_name: cardName,
      template_id: templateId,
      full_name: fullName,
      job_title: jobTitle,
      company_name: companyName || undefined,
      company_logo_url: companyLogoUrl || undefined,
      profile_photo_url: profilePhotoUrl || undefined,
      mobile: mobile,
      alternate_mobile: alternateMobile || undefined,
      email: email,
      website: website || undefined,
      bio: bio || undefined,
      street: street || undefined,
      city: city || undefined,
      state: state || undefined,
      country: country || undefined,
      pincode: pincode || undefined,
      social_links: {
        linkedin: linkedin || undefined,
        twitter: twitter || undefined,
        github: github || undefined,
        instagram: instagram || undefined,
      },
      is_active: isActive,
    };

    const errors = validateVisitingCardPayload(payload);
    if (errors.length > 0) {
      const errMap: Record<string, string> = {};
      errors.forEach((e) => (errMap[e.field] = e.message));
      setValidationErrors(errMap);
      Alert.alert('Validation Error', errors[0].message);
      return;
    }

    setValidationErrors({});
    await onSubmit(payload);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Wizard Header */}
        <View style={styles.headerBar}>
          {step === 2 && !editingCard ? (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Ionicons name="arrow-back" size={20} color="#4B65E4" />
              <Text style={styles.backBtnText}>Templates</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {editingCard
                ? 'Edit Visiting Card'
                : step === 1
                ? 'Step 1: Choose Template'
                : 'Step 2: Enter Details'}
            </Text>
            {!editingCard && (
              <View style={styles.stepIndicatorRow}>
                <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                <View style={styles.stepLine} />
                <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
              </View>
            )}
          </View>

          {step === 2 ? (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>{editingCard ? 'Update' : 'Create'}</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* STEP 1: Choose 3D Template */}
        {step === 1 ? (
          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionSubtitle}>
              Select one of the 5 premium design templates for your card:
            </Text>

            {/* Template Live Preview Hero */}
            <View style={styles.templatePreviewBox}>
              <ThreeDVisitingCard card={livePreviewCard} interactive={true} />
            </View>

            {/* Template Selector List */}
            <View style={styles.templateList}>
              {TEMPLATES.map((t) => {
                const isSelected = templateId === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    activeOpacity={0.85}
                    style={[styles.templateCardItem, isSelected && styles.templateCardItemActive]}
                    onPress={() => setTemplateId(t.id)}
                  >
                    <View style={styles.templateItemHeader}>
                      <View style={styles.templateBadgeRow}>
                        <View style={[styles.colorDot, { backgroundColor: t.badge }]} />
                        <Text style={styles.templateName}>{t.name}</Text>
                        <View style={styles.idTag}>
                          <Text style={styles.idTagText}>ID {t.id}</Text>
                        </View>
                      </View>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={24} color="#4B65E4" />
                      ) : (
                        <View style={styles.radioOutline} />
                      )}
                    </View>
                    <Text style={styles.templateDesc}>{t.subtitle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.continueStepBtn} onPress={() => setStep(2)}>
              <Text style={styles.continueStepBtnText}>Continue with Template {templateId}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        ) : (
          /* STEP 2: Fill Card Data */
          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* Live Preview */}
            <Text style={styles.sectionHeading}>Live Preview (Template {templateId})</Text>
            <View style={styles.previewContainer}>
              <ThreeDVisitingCard card={livePreviewCard} interactive={true} />
            </View>

            {/* Change Template Quick Bar */}
            <TouchableOpacity style={styles.changeTemplateBar} onPress={() => setStep(1)}>
              <Ionicons name="color-palette-outline" size={16} color="#4B65E4" />
              <Text style={styles.changeTemplateBarText}>
                Selected Template: <Text style={{ fontWeight: '800' }}>Template {templateId}</Text> (Tap to change)
              </Text>
            </TouchableOpacity>

            {/* Required Fields */}
            <Text style={styles.sectionHeading}>Required Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Name / Label (e.g. Personal, Corporate)*</Text>
              <TextInput
                style={[styles.input, validationErrors['card_name'] && styles.inputError]}
                placeholder="My Corporate Card"
                value={cardName}
                onChangeText={setCardName}
                maxLength={50}
              />
              {validationErrors['card_name'] && (
                <Text style={styles.errorText}>{validationErrors['card_name']}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name (Max 100)*</Text>
              <TextInput
                style={[styles.input, validationErrors['full_name'] && styles.inputError]}
                placeholder="Keshab Gouda"
                value={fullName}
                onChangeText={setFullName}
                maxLength={100}
              />
              {validationErrors['full_name'] && (
                <Text style={styles.errorText}>{validationErrors['full_name']}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Job Title (Max 100)*</Text>
              <TextInput
                style={[styles.input, validationErrors['job_title'] && styles.inputError]}
                placeholder="Senior Software Engineer"
                value={jobTitle}
                onChangeText={setJobTitle}
                maxLength={100}
              />
              {validationErrors['job_title'] && (
                <Text style={styles.errorText}>{validationErrors['job_title']}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number (Max 20)*</Text>
              <TextInput
                style={[styles.input, validationErrors['mobile'] && styles.inputError]}
                placeholder="+1234567890"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
                maxLength={20}
              />
              {validationErrors['mobile'] && (
                <Text style={styles.errorText}>{validationErrors['mobile']}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address*</Text>
              <TextInput
                style={[styles.input, validationErrors['email'] && styles.inputError]}
                placeholder="keshabgouda04@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                maxLength={100}
              />
              {validationErrors['email'] && (
                <Text style={styles.errorText}>{validationErrors['email']}</Text>
              )}
            </View>

            {/* Optional Fields */}
            <Text style={styles.sectionHeading}>Company & Bio (Optional)</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Company Name (Max 150)</Text>
              <TextInput
                style={styles.input}
                placeholder="Acme Corp"
                value={companyName}
                onChangeText={setCompanyName}
                maxLength={150}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio (Max 500)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Building scalable web applications..."
                multiline
                numberOfLines={3}
                value={bio}
                onChangeText={setBio}
                maxLength={500}
              />
            </View>

            {/* Photos */}
            <Text style={styles.sectionHeading}>Images (Optional)</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Profile Photo URL</Text>
              <View style={styles.mediaRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="https://example.com/profile.png"
                  value={profilePhotoUrl}
                  onChangeText={setProfilePhotoUrl}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.pickImgBtn} onPress={() => handlePickImage('profile')}>
                  <Ionicons name="image-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Company Logo URL</Text>
              <View style={styles.mediaRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="https://example.com/logo.png"
                  value={companyLogoUrl}
                  onChangeText={setCompanyLogoUrl}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.pickImgBtn} onPress={() => handlePickImage('logo')}>
                  <Ionicons name="image-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Address */}
            <Text style={styles.sectionHeading}>Address & Links (Optional)</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street (Max 200)</Text>
              <TextInput style={styles.input} placeholder="123 Tech Lane" value={street} onChangeText={setStreet} maxLength={200} />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput style={styles.input} placeholder="San Francisco" value={city} onChangeText={setCity} maxLength={100} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput style={styles.input} placeholder="CA" value={state} onChangeText={setState} maxLength={100} />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Country</Text>
                <TextInput style={styles.input} placeholder="USA" value={country} onChangeText={setCountry} maxLength={100} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Pincode</Text>
                <TextInput style={styles.input} placeholder="94105" value={pincode} onChangeText={setPincode} maxLength={20} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Website URL</Text>
              <TextInput style={styles.input} placeholder="https://keshabgouda.dev" value={website} onChangeText={setWebsite} autoCapitalize="none" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>LinkedIn URL</Text>
              <TextInput style={styles.input} placeholder="https://linkedin.com/in/keshabgouda" value={linkedin} onChangeText={setLinkedin} autoCapitalize="none" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Twitter URL</Text>
              <TextInput style={styles.input} placeholder="https://twitter.com/keshabgouda" value={twitter} onChangeText={setTwitter} autoCapitalize="none" />
            </View>

            {/* Active Toggle */}
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Card Active Status</Text>
                <Text style={styles.switchSubLabel}>Enable or temporarily hide this card</Text>
              </View>
              <Switch value={isActive} onValueChange={setIsActive} trackColor={{ false: '#CBD5E1', true: '#4B65E4' }} />
            </View>

            <TouchableOpacity style={styles.createFinalBtn} onPress={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.createFinalBtnText}>
                  {editingCard ? 'Update Visiting Card' : 'Save & Generate Card'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 50 }} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 20,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 14,
    color: '#4B65E4',
    fontWeight: '700',
  },
  cancelBtn: {
    padding: 4,
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#64748B',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  stepDotActive: {
    backgroundColor: '#4B65E4',
    width: 14,
  },
  stepLine: {
    width: 12,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4B65E4',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#4B65E4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
    textAlign: 'center',
  },
  templatePreviewBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  templateList: {
    gap: 12,
    marginBottom: 20,
  },
  templateCardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  templateCardItemActive: {
    borderColor: '#4B65E4',
    backgroundColor: '#F0F3FF',
  },
  templateItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  templateName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  idTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  radioOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  templateDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  continueStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4B65E4',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 10,
  },
  continueStepBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  changeTemplateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  changeTemplateBarText: {
    fontSize: 12,
    color: '#4B65E4',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 3,
    fontWeight: '600',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickImgBtn: {
    backgroundColor: '#4B65E4',
    borderRadius: 12,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  switchSubLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  createFinalBtn: {
    backgroundColor: '#4B65E4',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  createFinalBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
