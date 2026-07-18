import { API_URL } from '../constants/apiEndpoints';
import { api } from '../helper/axiosConfig';

export interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface Attachment {
  id: string;
  file_name: string;
  bill_id: string | null;
}

export interface AttachmentResponse {
  attachment: Attachment;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Validates the selected image file.
 */
export const validateImage = (file?: SelectedFile | null): void => {
  if (!file) {
    throw new Error('No image file selected.');
  }
  if (!file.uri || !file.name || !file.type) {
    throw new Error('Selected image is missing required metadata (URI, name, or MIME type).');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Unsupported image format. Please select a valid image.');
  }
  if (file.size && file.size > MAX_FILE_SIZE) {
    throw new Error('Image file size exceeds the 10MB limit.');
  }
};

/**
 * Validates the selected PDF file.
 */
export const validatePdf = (file?: SelectedFile | null): void => {
  if (!file) {
    throw new Error('No document file selected.');
  }
  if (!file.uri || !file.name || !file.type) {
    throw new Error('Selected document is missing required metadata (URI, name, or MIME type).');
  }
  if (file.type !== 'application/pdf') {
    throw new Error('Unsupported document format. Only PDF files are allowed.');
  }
  if (file.size && file.size > MAX_FILE_SIZE) {
    throw new Error('PDF file size exceeds the 10MB limit.');
  }
};

/**
 * Uploads a selected file to the backend attachments endpoint.
 * Handles both images and PDFs.
 * 
 * @param file Selected file descriptor
 * @returns Uploaded attachment details
 */
export const uploadAttachment = async (file: SelectedFile): Promise<Attachment> => {
  // 1. Perform validation depending on file MIME type
  if (file.type === 'application/pdf') {
    validatePdf(file);
  } else if (file.type.startsWith('image/')) {
    validateImage(file);
  } else {
    throw new Error('Unsupported file type. Only PDFs and images are allowed.');
  }

  // 2. Prepare multipart Form Data
  const formData = new FormData();
  
  // React Native FormData expects an object with uri, name, and type for files
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  try {
    // 3. POST to backend /api/v1/attachments
    const response = await api.post<AttachmentResponse>(
      API_URL.ATTACHMENTS.CREATE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response || !response.attachment || !response.attachment.id) {
      throw new Error('Invalid upload response from backend.');
    }

    return response.attachment;
  } catch (error: any) {
    console.error('Attachment upload failed:', error);
    throw new Error(error.message || 'File upload failed. Please try again.');
  }
};
