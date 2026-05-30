from app.schemas.product import Product, ProductVariant

def map_shopify_to_product(node: dict) -> Product:
    # Handle price range
    price_info = node.get("priceRange", {}).get("minVariantPrice", {})
    price = float(price_info.get("amount", 0.0))
    currency = price_info.get("currencyCode", "USD")
    
    # Handle images
    image_url = None
    images = node.get("images", {}).get("edges", [])
    if images:
        image_url = images[0].get("node", {}).get("url")
        
    return Product(
        id=node.get("id"),
        title=node.get("title"),
        description=node.get("description"),
        image_url=image_url,
        price_min=price,
        currency=currency,
        handle=node.get("handle", "")
    )
