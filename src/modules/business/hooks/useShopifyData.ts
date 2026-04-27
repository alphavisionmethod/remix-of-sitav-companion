// SITA OS — Shopify Data Hooks
import { useQuery } from "@tanstack/react-query";
import {
  storefrontApiRequest,
  STOREFRONT_PRODUCTS_QUERY,
  STOREFRONT_COLLECTIONS_QUERY,
  type ShopifyProduct,
} from "@/lib/shopify/config";

export function useShopifyProducts(first = 20, searchQuery?: string) {
  return useQuery({
    queryKey: ["shopify-products", first, searchQuery],
    queryFn: async () => {
      const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, {
        first,
        query: searchQuery || null,
      });
      return (data?.data?.products?.edges || []) as ShopifyProduct[];
    },
    staleTime: 60_000,
  });
}

interface ShopifyCollection {
  node: {
    id: string;
    title: string;
    handle: string;
    description: string;
    productsCount: number;
    image: { url: string; altText: string | null } | null;
  };
}

export function useShopifyCollections(first = 10) {
  return useQuery({
    queryKey: ["shopify-collections", first],
    queryFn: async () => {
      const data = await storefrontApiRequest(STOREFRONT_COLLECTIONS_QUERY, { first });
      return (data?.data?.collections?.edges || []) as ShopifyCollection[];
    },
    staleTime: 60_000,
  });
}
