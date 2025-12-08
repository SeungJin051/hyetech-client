import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface SyncResponse {
  success: boolean;
  message: string;
  error?: string;
}

// 정책을 동기화하는 API
const syncPolicies = async (): Promise<SyncResponse> => {
  const { data } = await axios.get("/api/batch/sync-policies");
  return data;
};

// 정책 동기화 Hook
export const useSyncPolicies = () => {
  return useMutation({
    mutationFn: syncPolicies,
  });
};
