import httpx
from app.config import settings
from app.ecommerce.models import map_shopify_to_product
from app.schemas.chat import ProductCard

async def search_products(intent: dict):
    # Mock data for initial testing if no API key
    if not settings.SHOPIFY_STOREFRONT_ACCESS_TOKEN or settings.SHOPIFY_STORE_DOMAIN == "your-store.myshopify.com":
        return [
            ProductCard(
                id="gid://shopify/Product/1",
                title=f"Sample {intent.get('category', 'Product')}",
                price=99.99,
                image_url="https://via.placeholder.com/150"
            ),
            ProductCard(
                id="gid://shopify/Product/2",
                title=f"Another {intent.get('color', 'Cool')} Item",
                price=49.99,
                image_url="https://via.placeholder.com/150"
            )
        ]

    url = f"https://{settings.SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json"
    headers = {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": settings.SHOPIFY_STOREFRONT_ACCESS_TOKEN
    }
    
    query_str = intent.get("query") or intent.get("category") or ""
    
    query = f"""
    {{
      products(first: 5, query: "{query_str}") {{
        edges {{
          node {{
            id
            title
            handle
            description
            images(first: 1) {{ edges {{ node {{ url }} }} }}
            priceRange {{
              minVariantPrice {{ amount currencyCode }}
            }}
          }}
        }}
      }}
    }}
    """
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json={"query": query}, headers=headers)
        if response.status_code == 200:
            data = response.json()
            edges = data.get("data", {}).get("products", {}).get("edges", [])
            products = []
            for edge in edges:
                node = edge["node"]
                p = map_shopify_to_product(node)
                products.append(ProductCard(
                    id=p.id,
                    title=p.title,
                    price=p.price_min,
                    currency=p.currency,
                    image_url=p.image_url
                ))
            return products
        return []
