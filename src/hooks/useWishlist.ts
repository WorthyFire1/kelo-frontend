import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/wishlistService';
import { useAuthStore } from '@/store/useAuthStore';

export const wishlistQueryKey = (userId?: string) => ['wishlist', userId] as const;

export function useWishlistQuery() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: wishlistQueryKey(userId),
    queryFn: wishlistService.getWishlist,
    enabled: Boolean(userId),
  });
}

function useWishlistMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistQueryKey(userId) }),
  });
}

export const useAddToWishlist = () => useWishlistMutation(
  (productId: number) => wishlistService.add(productId),
);

export const useRemoveFromWishlist = () => useWishlistMutation(
  (productId: number) => wishlistService.remove(productId),
);

export const useClearWishlist = () => useWishlistMutation(() => wishlistService.clear());
