import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface SyncResult {
  success: boolean;
  message: string;
  summary: {
    source: string;
    status: string;
    value: any;
  }[];
}

// 정책을 동기화하는 API
const syncPolicies = async (): Promise<SyncResult> => {
  const { data } = await axios.get("/api/batch/sync-policies");
  return data;
};

// 정책 동기화 Hook
export const useSyncPolicies = () => {
  return useMutation({
    mutationFn: syncPolicies,
  });
};
