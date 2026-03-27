import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export type AppRole = "admin" | "coach" | "player" | "guest";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<AppRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor || !identity) return "guest";
      try {
        const role = await actor.getCallerUserRole();
        // Map backend roles to app roles
        const roleStr = String(role);
        if (roleStr === "admin") return "admin";
        if (roleStr === "user") return "coach";
        return "player";
      } catch {
        return "guest";
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return async (profile: UserProfile) => {
    if (!actor) throw new Error("No actor");
    await actor.saveCallerUserProfile(profile);
    queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
  };
}
