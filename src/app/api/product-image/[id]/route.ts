import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    console.log("Fetching image for product:", productId);

    // Call Convex query to get full product with image
    const product = await convex.query(api.products.getById, {
      id: productId as any,
    });

    console.log("Product found:", !!product);

    if (!product || !product.image) {
      return new Response(JSON.stringify({ error: "Image not found" }), {
        status: 404,
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600" // Cache 404s for 1 hour
        },
      });
    }

    return new Response(JSON.stringify({ image: product.image }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400, immutable" // Cache for 24 hours, immutable
      },
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch image",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate" // Don't cache errors
        },
      }
    );
  }
}
