import { Token } from 'graphql/thegraph/__generated__/types-and-hooks'

export const validParams = { poolAddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640', chainName: 'ethereum' }

export const validPoolToken0 = {
  id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: '6',
  derivedETH: '0.0006240873011635544626425964678706127',
  __typename: 'Token',
} as Token

export const validPoolToken1 = {
  id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  symbol: 'WETH',
  name: 'Wrapped Ether',
  decimals: '18',
  derivedETH: '1',
  __typename: 'Token',
} as Token

export const validPoolDataResponse = {
  data: {
    id: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
    feeTier: 500,
    liquidity: parseFloat('26414803986874770777'),
    sqrtPrice: parseFloat('1977320351696380862605029898750440'),
    tick: 202508,
    token0: validPoolToken0,
    token1: validPoolToken1,
    token0Price: 1605.481,
    token1Price: 0.000622,
    volumeUSD: 233379442.64648438,
    volumeToken0: '397309311915.656392',
    volumeToken1: '192461624.767400825529358443',
    txCount: '5456494',
    totalValueLockedToken0: '190258041.714605',
    totalValueLockedToken1: '130641.89297715763283183',
    totalValueLockedUSD: '399590762.8476702153638342035105795',
    __typename: 'Pool',
    address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
    volumeUSDChange: -17.753809465717136,
    volumeUSDWeek: 1359911419.265625,
    tvlUSD: 223166198.4690675,
    tvlUSDChange: -0.3657085465786977,
    tvlToken0: 90930713.7356909,
    tvlToken1: 82526.48678530742,
  },
  loading: false,
  error: false,
}
