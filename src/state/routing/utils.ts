import type { JsonRpcProvider } from '@ethersproject/providers'
import { MixedRouteSDK } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { Pair, Route as V2Route } from '@uniswap/v2-sdk'
import { FeeAmount, Pool, Route as V3Route } from '@uniswap/v3-sdk'
import { isAvalanche, isBsc, isGnosis, isMatic, nativeOnChain } from 'constants/tokens'

import { getApproveInfo } from './gas'
import {
  ClassicQuoteData,
  ClassicTrade,
  GetQuickQuoteArgs,
  GetQuoteArgs,
  InterfaceTrade,
  isClassicQuoteResponse,
  PoolType,
  PreviewTrade,
  QuoteMethod,
  QuoteState,
  SubmittableTrade,
  SwapRouterNativeAssets,
  TradeFillType,
  TradeResult,
  URAQuoteResponse,
  URAQuoteType,
  V2PoolInRoute,
  V3PoolInRoute,
} from './types'

interface RouteResult {
  routev3: V3Route<Currency, Currency> | null
  routev2: V2Route<Currency, Currency> | null
  mixedRoute: MixedRouteSDK<Currency, Currency> | null
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
}

/**
 * Transforms a Routing API quote into an array of routes that can be used to
 * create a `Trade`.
 */
export function computeRoutes(
  currencyIn: Currency,
  currencyOut: Currency,
  routes: ClassicQuoteData['route']
): RouteResult[] | undefined {
  if (routes.length === 0) return []

  const tokenIn = routes[0]?.[0]?.tokenIn
  const tokenOut = routes[0]?.[routes[0]?.length - 1]?.tokenOut
  if (!tokenIn || !tokenOut) throw new Error('Expected both tokenIn and tokenOut to be present')

  try {
    return routes.map((route) => {
      if (route.length === 0) {
        throw new Error('Expected route to have at least one pair or pool')
      }
      const rawAmountIn = route[0].amountIn
      const rawAmountOut = route[route.length - 1].amountOut

      if (!rawAmountIn || !rawAmountOut) {
        throw new Error('Expected both amountIn and amountOut to be present')
      }

      const isOnlyV2 = isVersionedRoute<V2PoolInRoute>(PoolType.V2Pool, route)
      const isOnlyV3 = isVersionedRoute<V3PoolInRoute>(PoolType.V3Pool, route)

      return {
        routev3: isOnlyV3 ? new V3Route(route.map(parsePool), currencyIn, currencyOut) : null,
        routev2: isOnlyV2 ? new V2Route(route.map(parsePair), currencyIn, currencyOut) : null,
        mixedRoute:
          !isOnlyV3 && !isOnlyV2 ? new MixedRouteSDK(route.map(parsePoolOrPair), currencyIn, currencyOut) : null,
        inputAmount: CurrencyAmount.fromRawAmount(currencyIn, rawAmountIn),
        outputAmount: CurrencyAmount.fromRawAmount(currencyOut, rawAmountOut),
      }
    })
  } catch (e) {
    console.error('Error computing routes', e)
    return
  }
}

const parsePoolOrPair = (pool: V3PoolInRoute | V2PoolInRoute): Pool | Pair => {
  return pool.type === PoolType.V3Pool ? parsePool(pool) : parsePair(pool)
}

function isVersionedRoute<T extends V2PoolInRoute | V3PoolInRoute>(
  type: T['type'],
  route: (V3PoolInRoute | V2PoolInRoute)[]
): route is T[] {
  return route.every((pool) => pool.type === type)
}

function getTradeCurrencies(args: GetQuoteArgs | GetQuickQuoteArgs): [Currency, Currency] {
  const {
    tokenInAddress,
    tokenInChainId,
    tokenInDecimals,
    tokenInSymbol,
    tokenOutAddress,
    tokenOutChainId,
    tokenOutDecimals,
    tokenOutSymbol,
  } = args

  const tokenInIsNative = Object.values(SwapRouterNativeAssets).includes(tokenInAddress as SwapRouterNativeAssets)
  const tokenOutIsNative = Object.values(SwapRouterNativeAssets).includes(tokenOutAddress as SwapRouterNativeAssets)

  const currencyIn = tokenInIsNative
    ? nativeOnChain(tokenInChainId)
    : parseToken({ address: tokenInAddress, chainId: tokenInChainId, decimals: tokenInDecimals, symbol: tokenInSymbol })
  const currencyOut = tokenOutIsNative
    ? nativeOnChain(tokenOutChainId)
    : parseToken({
        address: tokenOutAddress,
        chainId: tokenOutChainId,
        decimals: tokenOutDecimals,
        symbol: tokenOutSymbol,
      })
  return [currencyIn, currencyOut]
}

function getClassicTradeDetails(
  currencyIn: Currency,
  currencyOut: Currency,
  data: URAQuoteResponse
): {
  gasUseEstimate?: number
  gasUseEstimateUSD?: number
  blockNumber?: string
  routes?: RouteResult[]
} {
  const classicQuote =
    data.routing === URAQuoteType.CLASSIC ? data.quote : data.allQuotes.find(isClassicQuoteResponse)?.quote
  return {
    gasUseEstimate: classicQuote?.gasUseEstimate ? parseFloat(classicQuote.gasUseEstimate) : undefined,
    gasUseEstimateUSD: classicQuote?.gasUseEstimateUSD ? parseFloat(classicQuote.gasUseEstimateUSD) : undefined,
    blockNumber: classicQuote?.blockNumber,
    routes: classicQuote ? computeRoutes(currencyIn, currencyOut, classicQuote.route) : undefined,
  }
}

export async function transformRoutesToTrade(
  args: GetQuoteArgs,
  data: URAQuoteResponse,
  quoteMethod: QuoteMethod,
  provider: JsonRpcProvider
): Promise<TradeResult> {
  const { tradeType, account, amount, inputTax, outputTax } = args

  const [currencyIn, currencyOut] = getTradeCurrencies(args)
  const { gasUseEstimateUSD, blockNumber, routes, gasUseEstimate } = getClassicTradeDetails(
    currencyIn,
    currencyOut,
    data
  )

  // Some sus javascript float math but it's ok because its just an estimate for display purposes
  const usdCostPerGas = gasUseEstimateUSD && gasUseEstimate ? gasUseEstimateUSD / gasUseEstimate : undefined

  const approveInfo = await getApproveInfo(account, currencyIn, amount, provider, usdCostPerGas)

  const classicTrade = new ClassicTrade({
    v2Routes:
      routes
        ?.filter((r): r is RouteResult & { routev2: NonNullable<RouteResult['routev2']> } => r.routev2 !== null)
        .map(({ routev2, inputAmount, outputAmount }) => ({
          routev2,
          inputAmount,
          outputAmount,
        })) ?? [],
    v3Routes:
      routes
        ?.filter((r): r is RouteResult & { routev3: NonNullable<RouteResult['routev3']> } => r.routev3 !== null)
        .map(({ routev3, inputAmount, outputAmount }) => ({
          routev3,
          inputAmount,
          outputAmount,
        })) ?? [],
    mixedRoutes:
      routes
        ?.filter(
          (r): r is RouteResult & { mixedRoute: NonNullable<RouteResult['mixedRoute']> } => r.mixedRoute !== null
        )
        .map(({ mixedRoute, inputAmount, outputAmount }) => ({
          mixedRoute,
          inputAmount,
          outputAmount,
        })) ?? [],
    tradeType,
    gasUseEstimateUSD,
    approveInfo,
    blockNumber,
    requestId: data.quote.requestId,
    quoteMethod,
    inputTax,
    outputTax,
  })

  return { state: QuoteState.SUCCESS, trade: classicTrade }
}

function parseToken({ address, chainId, decimals, symbol }: ClassicQuoteData['route'][0][0]['tokenIn']): Token {
  return new Token(chainId, address, parseInt(decimals.toString()), symbol)
}

function parsePool({ fee, sqrtRatioX96, liquidity, tickCurrent, tokenIn, tokenOut }: V3PoolInRoute): Pool {
  return new Pool(
    parseToken(tokenIn),
    parseToken(tokenOut),
    parseInt(fee) as FeeAmount,
    sqrtRatioX96,
    liquidity,
    parseInt(tickCurrent)
  )
}

const parsePair = ({ reserve0, reserve1 }: V2PoolInRoute): Pair =>
  new Pair(
    CurrencyAmount.fromRawAmount(parseToken(reserve0.token), reserve0.quotient),
    CurrencyAmount.fromRawAmount(parseToken(reserve1.token), reserve1.quotient)
  )

export function currencyAddressForSwapQuote(currency: Currency): string {
  if (currency.isNative) {
    if (isMatic(currency.chainId)) return SwapRouterNativeAssets.MATIC
    if (isBsc(currency.chainId)) return SwapRouterNativeAssets.BNB
    if (isAvalanche(currency.chainId)) return SwapRouterNativeAssets.AVAX
    if (isGnosis(currency.chainId)) return SwapRouterNativeAssets.XDAI
    return SwapRouterNativeAssets.ETH
  }

  return currency.address
}

export function isClassicTrade(trade?: InterfaceTrade): trade is ClassicTrade {
  return trade?.fillType === TradeFillType.Classic
}

export function isPreviewTrade(trade?: InterfaceTrade): trade is PreviewTrade {
  return trade?.fillType === TradeFillType.None
}

export function isSubmittableTrade(trade?: InterfaceTrade): trade is SubmittableTrade {
  return trade?.fillType === TradeFillType.Classic
}
