import { api } from '../helper/axiosConfig';

export interface AttachmentDownloadResponse {
  success: boolean;
  message: string;
  data: {
    download_url: string;
    file_name: string;
    mime_type: string;
    expires_in: number;
  };
}

export const getAttachmentDownloadUrl = async (
  attachmentId: string
): Promise<AttachmentDownloadResponse> => {
  return api.get<AttachmentDownloadResponse>(`/api/v1/attachments/${attachmentId}/download`);
};
