import useSWR from "swr";
import { useLocalStorage } from "usehooks-ts";
import axios from "axios";

interface Project {
  id: string;
  projectName: string;  // Changed from 'name' to match backend
  githubUrl: string;
  status: "loading" | "ready" | "error";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// hooks/use-project.ts
export default function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>(
    "/api/getProjects",
    fetcher,
    {
      // refreshInterval: 3000,
      // dedupingInterval: 1000,
      revalidateOnFocus: true,
      onErrorRetry: (error) => {
        if (error.status === 404) return;
      }
    }
  );

  const [projectId, setSelectedProjectId] = useLocalStorage("projectId", "");

  return {
    allProjects: data || [],
    loadingProjects: data?.filter(p => p.status === "loading") || [],
    errorProjects: data?.filter(p => p.status === "error") || [],
    project: data?.find(p => p.id === projectId),
    projectId,
    setSelectedProjectId,
    isLoading,
    error,
    mutate
  };
}