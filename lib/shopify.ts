// Intégration avec Shopify Storefront API

interface ShopifyProduct {
  id: string
  title: string
  description: string
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  images: {
    edges: Array<{
      node: {
        url: string
        altText: string | null
      }
    }>
  }
  variants: {
    edges: Array<{
      node: {
        id: string
        title: string
        priceV2: {
          amount: string
          currencyCode: string
        }
      }
    }>
  }
}

interface CartLine {
  merchandiseId: string
  quantity: number
}

interface ShopifyCartResponse {
  cartCreate: {
    cart: {
      id: string
      checkoutUrl: string
    }
    userErrors: Array<{
      field: string[]
      message: string
    }>
  }
}

export class ShopifyStorefrontClient {
  private domain: string
  private accessToken: string
  private apiVersion: string = '2024-01'

  constructor(domain: string, accessToken: string) {
    this.domain = domain
    this.accessToken = accessToken
  }

  private async query<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const endpoint = `https://${this.domain}/api/${this.apiVersion}/graphql.json`

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': this.accessToken,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
      }

      const json = await response.json()

      if (json.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`)
      }

      return json.data as T
    } catch (error) {
      console.error('Erreur lors de la requête Shopify:', error)
      throw error
    }
  }

  async createCart(lines: CartLine[]): Promise<{ cartId: string; checkoutUrl: string }> {
    const mutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        lines: lines.map(line => ({
          merchandiseId: line.merchandiseId,
          quantity: line.quantity,
        })),
      },
    }

    const data = await this.query<ShopifyCartResponse>(mutation, variables)

    if (data.cartCreate.userErrors.length > 0) {
      throw new Error(
        `Erreurs lors de la création du panier: ${JSON.stringify(data.cartCreate.userErrors)}`
      )
    }

    return {
      cartId: data.cartCreate.cart.id,
      checkoutUrl: data.cartCreate.cart.checkoutUrl,
    }
  }

  async getProducts(first: number = 10): Promise<ShopifyProduct[]> {
    const query = `
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              description
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await this.query<{
      products: {
        edges: Array<{ node: ShopifyProduct }>
      }
    }>(query, { first })

    return data.products.edges.map(edge => edge.node)
  }

  async getProductById(id: string): Promise<ShopifyProduct | null> {
    const query = `
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                priceV2 {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `

    const data = await this.query<{ product: ShopifyProduct | null }>(query, { id })
    return data.product
  }
}

export function createShopifyClient(domain: string, accessToken: string): ShopifyStorefrontClient {
  return new ShopifyStorefrontClient(domain, accessToken)
}
