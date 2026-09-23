import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cartService';
import { useAuthStore } from '@/store/useAuthStore';

export const cartQueryKey = (userId?: string) => ['cart', userId] as const;

export function useCartQuery() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: cartQueryKey(userId),
    queryFn: cartService.getCart,
    enabled: Boolean(userId),
  });
}

function useCartMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey(userId) }),
  });
}

export const useAddToCart = () => useCartMutation(
  ({ productId, quantity, variantName }: { productId: number; quantity: number; variantName?: string }) =>
    cartService.add(productId, quantity, variantName),
);

export const useUpdateCart = () => useCartMutation(
  ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) => cartService.update(cartItemId, quantity),
);

export const useRemoveFromCart = () => useCartMutation(
  (cartItemId: number) => cartService.remove(cartItemId),
);

export const useClearCart = () => useCartMutation(() => cartService.clear());
