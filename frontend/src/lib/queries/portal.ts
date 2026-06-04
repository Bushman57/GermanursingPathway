import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deletePortalAvatar,
  fetchPortalDocuments,
  fetchPortalNotifications,
  fetchPortalProfile,
  updatePortalProfile,
  uploadPortalAvatar,
  uploadPortalDocument,
} from "@/lib/api/portal";
import { queryKeys } from "./keys";

export function usePortalProfileQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.portal.profile,
    queryFn: fetchPortalProfile,
    enabled,
  });
}

export function usePortalDocumentsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.portal.documents,
    queryFn: fetchPortalDocuments,
    enabled,
  });
}

export function usePortalNotificationsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.portal.notifications,
    queryFn: fetchPortalNotifications,
    enabled,
  });
}

export function useUpdatePortalProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePortalProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.portal.profile });
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useUploadPortalAvatarMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadPortalAvatar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.portal.profile });
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useDeletePortalAvatarMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePortalAvatar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.portal.profile });
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useUploadPortalDocumentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docType, file }: { docType: string; file: File }) =>
      uploadPortalDocument(docType, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.portal.documents });
      qc.invalidateQueries({ queryKey: queryKeys.portal.notifications });
    },
  });
}
