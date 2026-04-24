import { PageShell } from "@/components/sita/PageShell";
import { motion } from "framer-motion";
import { Store, Package, ShoppingCart, TrendingDown, Star, Layers, Tag, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSites } from "@/hooks/use-digital-presence";
import { useShopifyProducts, useShopifyCollections } from "@/hooks/useShopifyData";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const PRODUCTS: any[] = [];

export default function EcommerceOffice() {
  const { data: liveData, isLoading } = useSites();
  const { data: shopifyProducts, isLoading: productsLoading } = useShopifyProducts(20);
  const { data: shopifyCollections, isLoading: collectionsLoading } = useShopifyCollections(10);

  const hasShopifyProducts = shopifyProducts && shopifyProducts.length > 0;
  const hasShopifyCollections = shopifyCollections && shopifyCollections.length > 0;

  return (
    <PageShell width="wide">
      <DPOSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Ecommerce / Merchandising Office</h1>
        <p className="text-sm text-muted-foreground">Products, collections, cart recovery, merchandising & promotion planning</p>
      </motion.div>

      {/* Product Table — Shopify live or demo fallback */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" /> Products
            {hasShopifyProducts && <Badge variant="default" className="text-[10px] ml-2">Live</Badge>}
            {!hasShopifyProducts && !productsLoading && <Badge variant="secondary" className="text-[10px] ml-2">Demo</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading Shopify products…
            </div>
          ) : hasShopifyProducts ? (
            <div className="space-y-2">
              {shopifyProducts.map(p => {
                const price = p.node.priceRange.minVariantPrice;
                const variant = p.node.variants.edges[0]?.node;
                return (
                  <div key={p.node.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {p.node.images.edges[0] && (
                        <img
                          src={p.node.images.edges[0].node.url}
                          alt={p.node.images.edges[0].node.altText || p.node.title}
                          className="w-10 h-10 rounded object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-foreground truncate block">{p.node.title}</span>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{price.currencyCode} {parseFloat(price.amount).toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">{p.node.variants.edges.length} variant(s)</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={variant?.availableForSale ? "default" : "secondary"} className="text-[10px]">
                      {variant?.availableForSale ? "active" : "unavailable"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {([] as never[]).map(p => (
                <div key={p.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">{p.name}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{p.price}</span>
                      <span className="text-xs text-muted-foreground">{p.stock} in stock</span>
                      <span className="text-xs text-muted-foreground">{p.views} views</span>
                      <span className="text-xs text-muted-foreground">{p.conversion} CVR</span>
                      <span className="text-xs text-amber-400 flex items-center gap-0.5"><Star className="w-3 h-3" />{p.rating}</span>
                    </div>
                  </div>
                  <Badge variant={p.status === "active" ? "default" : p.status === "low-stock" ? "destructive" : "secondary"} className="text-[10px]">{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Collections — Shopify live or demo */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Collections
              {hasShopifyCollections && <Badge variant="default" className="text-[10px] ml-2">Live</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {collectionsLoading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
              </div>
            ) : hasShopifyCollections ? (
              shopifyCollections.map(c => (
                <div key={c.node.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-foreground">{c.node.title}</span>
                    <span className="text-xs text-muted-foreground ml-2">{c.node.productsCount} products</span>
                  </div>
                </div>
              ))
            ) : (
              ([] as never[]).map(c => (
                <div key={c.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{c.products} products</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{c.revenue}</span>
                    {c.featured && <Badge variant="default" className="text-[10px]">Featured</Badge>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Cart Diagnostics */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-red-400" /> Cart Abandonment Diagnostics</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([] as never[]).map(c => (
              <div key={c.issue} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={c.severity === "critical" ? "destructive" : c.severity === "opportunity" ? "default" : "secondary"} className="text-[10px]">{c.severity}</Badge>
                </div>
                <p className="text-xs font-medium text-foreground">{c.issue}</p>
                <p className="text-[10px] text-muted-foreground">{c.impact}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Merchandising Suggestions */}
        <Card className="bg-card/50 border-border/50 lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-400" /> AI Merchandising Suggestions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {([] as never[]).map(m => (
                <div key={m.action} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={m.type === "opportunity" ? "default" : "secondary"} className="text-[10px]">{m.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{m.confidence}% confidence</span>
                  </div>
                  <p className="text-xs text-foreground">{m.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
