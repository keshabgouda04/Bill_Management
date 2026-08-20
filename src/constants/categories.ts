export interface Category {
  id: string;
  name: string;
  label: string;
  emoji: string;
  color?: string;
}

export type FilterTab = Category;

export const CATEGORIES: Category[] = [
  { id: '3b2426c1-6703-4474-8fc3-8d121f8d7b51', name: 'Groceries', label: 'Groceries', emoji: '🛒', color: '#ECFDF5' },
  { id: 'd8d78fca-e55b-47ba-8887-942a3d8ae842', name: 'Dining', label: 'Dining', emoji: '🍽️', color: '#FFF7ED' },
  { id: 'e9f90e70-d423-4742-ba4f-8747b5f62fe4', name: 'Utilities', label: 'Utilities', emoji: '💡', color: '#EFF6FF' },
  { id: '8018a859-527b-4e22-8969-9ea4bcb630d0', name: 'Transportation', label: 'Transportation', emoji: '🚌', color: '#FAF5FF' },
  { id: '71281598-dd0d-4020-b4ed-b2d2a8d037a1', name: 'Entertainment', label: 'Entertainment', emoji: '🎬', color: '#FEF2F2' },
  { id: '7f7bf7e7-ae6e-4d7b-83a0-e28411d1f12a', name: 'Electronics', label: 'Electronics', emoji: '💻', color: '#EEF2FF' },
  { id: '278364b7-e154-4bf2-9dda-49a523422931', name: 'Shopping', label: 'Shopping', emoji: '🛍️', color: '#FFF7ED' },
  { id: '488fa1bb-ba80-4ca5-9f8a-20a5ff0fda66', name: 'Healthcare', label: 'Healthcare', emoji: '🏥', color: '#FDF2F8' },
  { id: '2a719887-812f-40b9-8936-b6b7d969d497', name: 'Education', label: 'Education', emoji: '🎓', color: '#F0FDFA' },
  { id: 'fcb85985-b994-4323-b3c9-ef94661c2b05', name: 'Travel', label: 'Travel', emoji: '✈️', color: '#ECFEFF' },
  { id: 'd33f5dd6-e8e6-45ef-a753-767bf3b1258b', name: 'Home & Furniture', label: 'Home & Furniture', emoji: '🛋️', color: '#FEF3C7' },
  { id: 'b14171bc-eb98-40a6-bf27-d764be2095f6', name: 'Fashion', label: 'Fashion', emoji: '👕', color: '#FCE7F3' },
  { id: 'cb03674f-9737-490b-a576-00c1ee3f8e05', name: 'Insurance', label: 'Insurance', emoji: '🛡️', color: '#F3F4F6' },
  { id: '6b94abb0-747a-40a6-bc77-5f6e494fcd76', name: 'Business', label: 'Business', emoji: '💼', color: '#EEF2FF' },
  { id: 'd928b1fb-70da-426e-bca6-898a4b72b035', name: 'Subscription', label: 'Subscription', emoji: '🔄', color: '#F5F3FF' },
  { id: 'a76cfcaa-74ba-4d49-935b-36c90c607626', name: 'Pet Care', label: 'Pet Care', emoji: '🐾', color: '#F1F8E9' },
  { id: '14eb6343-8096-49f5-9c72-8658bd20b261', name: 'Gifts', label: 'Gifts', emoji: '🎁', color: '#FFF5F5' },
  { id: 'f136f232-b755-48b3-8239-bfaf2568aa4d', name: 'Taxes', label: 'Taxes', emoji: '💵', color: '#ECEFF1' },
  { id: '63991342-398b-476c-abe6-d2a90f603493', name: 'Others', label: 'Others', emoji: '📦', color: '#F9FAFB' },
];

export const CATEGORY_TABS: Category[] = [
  { id: 'all', name: 'All', label: 'All', emoji: '📋' },
  ...CATEGORIES,
];

export const DEFAULT_CATEGORY_ID = '63991342-398b-476c-abe6-d2a90f603493'; // Others

export const getCategoryById = (id?: string | null): Category | undefined => {
  if (!id) return undefined;
  return CATEGORIES.find((cat) => cat.id.toLowerCase() === id.toLowerCase());
};

export const getCategoryByName = (name?: string | null): Category | undefined => {
  if (!name) return undefined;
  const lower = name.toLowerCase().trim();
  return CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === lower || cat.label.toLowerCase() === lower
  );
};
