import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface Policy {
  id: string;
  title: string;
  summary: string;
  benefit_tags: string[];
  view_count: number;
}

// 트렌딩 정책을 가져오는 API
const fetchTrendingPolicies = async (): Promise<Policy[]> => {
  const { data } = await axios.get("/api/policies/trending");
  return data.data || [];
};

export const useTrendingPolicies = () => {
  return useQuery({
    queryKey: ["trendingPolicies"],
    queryFn: fetchTrendingPolicies,
  });
};
