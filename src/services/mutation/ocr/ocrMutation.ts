import { API_URL } from '../../../constants/apiEndpoints';
import { api } from '../../../helper/axiosConfig';
import { useMutation } from '@tanstack/react-query';

export interface OcrStructuredData {
  purchase_location?: string;
  invoice_number?: string;
  purchase_date?: string; // e.g. YYYY-MM-DD or DD/MM/YYYY
  total_amount?: number;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  category_id?: string;
  category?: string;
  payment_method?: string;
  warranty_until?: string;
  bill_items?: Array<{
    item_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    tax_amount?: number;
  }>;
  [key: string]: any;
}

export interface OcrScanResultData {
  documentId: string;
  structured?: OcrStructuredData;
  rawText?: string;
  confidence?: number;
  [key: string]: any;
}

export interface OcrScanResponse {
  success: boolean;
  message?: string;
  data: OcrScanResultData;
}

export interface OcrFileInput {
  uri: string;
  fileName?: string;
  fileType?: string;
}

export const postScanOcrDocument = async (fileInput: OcrFileInput): Promise<OcrScanResponse> => {
  const formData = new FormData();

  const fileToUpload: any = {
    uri: fileInput.uri,
    name: fileInput.fileName || 'scanned_bill.jpg',
    type: fileInput.fileType || 'image/jpeg',
  };

  formData.append('file', fileToUpload);

  const response: any = await api.post(API_URL.OCR.SCAN, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response;
};

export const useScanOcrDocument = () => {
  return useMutation({
    mutationFn: postScanOcrDocument,
  });
};
