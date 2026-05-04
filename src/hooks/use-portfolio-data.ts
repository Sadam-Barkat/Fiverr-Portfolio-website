import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  createProject,
  createUseCase,
  deleteCategory,
  deleteProject,
  deleteUseCase,
  fetchAdminCategories,
  fetchAdminProjects,
  fetchAdminSession,
  fetchAdminUseCases,
  updateCategory,
  updateProject,
  updateUseCase,
} from "@/lib/portfolio-api";

export function usePortfolioData() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["admin-session"],
    queryFn: fetchAdminSession,
    retry: false,
  });

  const projectsQuery = useQuery({
    queryKey: ["admin-projects"],
    queryFn: fetchAdminProjects,
    enabled: sessionQuery.data?.authenticated ?? false,
  });

  const useCasesQuery = useQuery({
    queryKey: ["admin-use-cases"],
    queryFn: fetchAdminUseCases,
    enabled: sessionQuery.data?.authenticated ?? false,
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: fetchAdminCategories,
    enabled: sessionQuery.data?.authenticated ?? false,
  });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-use-cases"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] }),
      queryClient.invalidateQueries({ queryKey: ["public-projects"] }),
      queryClient.invalidateQueries({ queryKey: ["public-use-cases"] }),
      queryClient.invalidateQueries({ queryKey: ["public-categories"] }),
      queryClient.invalidateQueries({ queryKey: ["project"] }),
    ]);
  };

  const projectMutation = useMutation({
    mutationFn: async (action: { mode: "create"; payload: Parameters<typeof createProject>[0] } | { mode: "update"; id: string; payload: Parameters<typeof updateProject>[1] } | { mode: "delete"; id: string }) => {
      if (action.mode === "create") {
        return createProject(action.payload);
      }
      if (action.mode === "update") {
        return updateProject(action.id, action.payload);
      }
      await deleteProject(action.id);
      return null;
    },
    onSuccess: refresh,
  });

  const useCaseMutation = useMutation({
    mutationFn: async (action: { mode: "create"; payload: Parameters<typeof createUseCase>[0] } | { mode: "update"; id: string; payload: Parameters<typeof updateUseCase>[1] } | { mode: "delete"; id: string }) => {
      if (action.mode === "create") {
        return createUseCase(action.payload);
      }
      if (action.mode === "update") {
        return updateUseCase(action.id, action.payload);
      }
      await deleteUseCase(action.id);
      return null;
    },
    onSuccess: refresh,
  });

  const categoryMutation = useMutation({
    mutationFn: async (action: { mode: "create"; payload: { name: string } } | { mode: "update"; id: string; payload: { name: string } } | { mode: "delete"; id: string }) => {
      if (action.mode === "create") {
        return createCategory(action.payload);
      }
      if (action.mode === "update") {
        return updateCategory(action.id, action.payload);
      }
      await deleteCategory(action.id);
      return null;
    },
    onSuccess: refresh,
  });

  return {
    projects: projectsQuery.data ?? [],
    useCases: useCasesQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    isAuthenticated: sessionQuery.data?.authenticated ?? false,
    isLoading: sessionQuery.isLoading || projectsQuery.isLoading || useCasesQuery.isLoading || categoriesQuery.isLoading,
    addProject: (payload: Parameters<typeof createProject>[0]) => projectMutation.mutateAsync({ mode: "create", payload }),
    updateProject: (id: string, payload: Parameters<typeof updateProject>[1]) => projectMutation.mutateAsync({ mode: "update", id, payload }),
    deleteProject: (id: string) => projectMutation.mutateAsync({ mode: "delete", id }),
    addUseCase: (payload: Parameters<typeof createUseCase>[0]) => useCaseMutation.mutateAsync({ mode: "create", payload }),
    updateUseCase: (id: string, payload: Parameters<typeof updateUseCase>[1]) => useCaseMutation.mutateAsync({ mode: "update", id, payload }),
    deleteUseCase: (id: string) => useCaseMutation.mutateAsync({ mode: "delete", id }),
    addCategory: (payload: { name: string }) => categoryMutation.mutateAsync({ mode: "create", payload }),
    updateCategory: (id: string, payload: { name: string }) => categoryMutation.mutateAsync({ mode: "update", id, payload }),
    deleteCategory: (id: string) => categoryMutation.mutateAsync({ mode: "delete", id }),
  };
}
