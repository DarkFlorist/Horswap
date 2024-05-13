import { MixedRouteSDK, ONE, Trade } from '@uniswap/router-sdk'
import { ChainId, Currency, CurrencyAmount, Fraction, Percent, Price, Token, TradeType } from '@uniswap/sdk-core'
import { Route as V2Route } from '@uniswap/v2-sdk'
import { Route as V3Route } from '@uniswap/v3-sdk'

export enum TradeState {
  LOADING = 'loading',
  INVALID = 'invalid',
  STALE = 'stale',
  NO_ROUTE_FOUND = 'no_route_found',
  VALID = 'valid',
}

export enum QuoteMethod {
  ROUTING_API = 'ROUTING_API',
  QUICK_ROUTE = 'QUICK_ROUTE',
  CLIENT_SIDE = 'CLIENT_SIDE',
  CLIENT_SIDE_FALLBACK = 'CLIENT_SIDE_FALLBACK', // If client-side was used after the routing-api call failed.
}

// This is excluded from `RouterPreference` enum because it's only used
// internally for token -> USDC trades to get a USD value.
export const INTERNAL_ROUTER_PREFERENCE_PRICE = 'price' as const

export enum RouterPreference {
  CLIENT = 'client',
}

export interface GetQuoteArgs {
  tokenInAddress: string
  tokenInChainId: ChainId
  tokenInDecimals: number
  tokenInSymbol?: string
  tokenOutAddress: string
  tokenOutChainId: ChainId
  tokenOutDecimals: number
  tokenOutSymbol?: string
  amount: string
  account?: string
  routerPreference: RouterPreference | typeof INTERNAL_ROUTER_PREFERENCE_PRICE
  tradeType: TradeType
  inputTax: Percent
  outputTax: Percent
}

export type GetQuickQuoteArgs = {
  amount: string
  tokenInAddress: string
  tokenInChainId: ChainId
  tokenInDecimals: number
  tokenInSymbol?: string
  tokenOutAddress: string
  tokenOutChainId: ChainId
  tokenOutDecimals: number
  tokenOutSymbol?: string
  tradeType: TradeType
  inputTax: Percent
  outputTax: Percent
}
// from https://github.com/Uniswap/routing-api/blob/main/lib/handlers/schema.ts

type TokenInRoute = Pick<Token, 'address' | 'chainId' | 'symbol' | 'decimals'>

export type V3PoolInRoute = {
  type: 'v3-pool'
  tokenIn: TokenInRoute
  tokenOut: TokenInRoute
  sqrtRatioX96: string
  liquidity: string
  tickCurrent: string
  fee: string
  amountIn?: string
  amountOut?: string

  // not used in the interface
  address?: string
}

type V2Reserve = {
  token: TokenInRoute
  quotient: string
}

export type V2PoolInRoute = {
  type: 'v2-pool'
  tokenIn: TokenInRoute
  tokenOut: TokenInRoute
  reserve0: V2Reserve
  reserve1: V2Reserve
  amountIn?: string
  amountOut?: string

  // not used in the interface
  // avoid returning it from the client-side smart-order-router
  address?: string
}

export interface ClassicQuoteData {
  quoteId?: string
  requestId?: string
  blockNumber: string
  amount: string
  amountDecimals: string
  gasPriceWei: string
  gasUseEstimate: string
  gasUseEstimateQuote: string
  gasUseEstimateQuoteDecimals: string
  gasUseEstimateUSD: string
  methodParameters?: { calldata: string; value: string }
  quote: string
  quoteDecimals: string
  quoteGasAdjusted: string
  quoteGasAdjustedDecimals: string
  route: Array<(V3PoolInRoute | V2PoolInRoute)[]>
  routeString: string
}

type URAClassicQuoteResponse = {
  routing: URAQuoteType.CLASSIC
  quote: ClassicQuoteData
  allQuotes: Array<URAQuoteResponse>
}
export type URAQuoteResponse = URAClassicQuoteResponse

export function isClassicQuoteResponse(data: URAQuoteResponse): data is URAClassicQuoteResponse {
  return data.routing === URAQuoteType.CLASSIC
}

export enum TradeFillType {
  Classic = 'classic', // Uniswap V1, V2, and V3 trades with on-chain routes
  None = 'none', // for preview trades, cant be used for submission
}

export type ApproveInfo = { needsApprove: true; approveGasEstimateUSD: number } | { needsApprove: false }

export class ClassicTrade extends Trade<Currency, Currency, TradeType> {
  public readonly fillType = TradeFillType.Classic
  approveInfo: ApproveInfo
  gasUseEstimateUSD?: number // gas estimate for swaps
  blockNumber: string | null | undefined
  requestId: string | undefined
  quoteMethod: QuoteMethod
  inputTax: Percent
  outputTax: Percent

  constructor({
    gasUseEstimateUSD,
    blockNumber,
    requestId,
    quoteMethod,
    approveInfo,
    inputTax,
    outputTax,
    ...routes
  }: {
    gasUseEstimateUSD?: number
    totalGasUseEstimateUSD?: number
    blockNumber?: string | null
    requestId?: string
    quoteMethod: QuoteMethod
    approveInfo: ApproveInfo
    inputTax: Percent
    outputTax: Percent
    v2Routes: {
      routev2: V2Route<Currency, Currency>
      inputAmount: CurrencyAmount<Currency>
      outputAmount: CurrencyAmount<Currency>
    }[]
    v3Routes: {
      routev3: V3Route<Currency, Currency>
      inputAmount: CurrencyAmount<Currency>
      outputAmount: CurrencyAmount<Currency>
    }[]
    tradeType: TradeType
    mixedRoutes?: {
      mixedRoute: MixedRouteSDK<Currency, Currency>
      inputAmount: CurrencyAmount<Currency>
      outputAmount: CurrencyAmount<Currency>
    }[]
  }) {
    super(routes)
    this.blockNumber = blockNumber
    this.gasUseEstimateUSD = gasUseEstimateUSD
    this.requestId = requestId
    this.quoteMethod = quoteMethod
    this.approveInfo = approveInfo
    this.inputTax = inputTax
    this.outputTax = outputTax
  }

  public get totalTaxRate(): Percent {
    return this.inputTax.add(this.outputTax)
  }

  public get postTaxOutputAmount() {
    // Ideally we should calculate the final output amount by ammending the inputAmount based on the input tax and then applying the output tax,
    // but this isn't currently possible because V2Trade reconstructs the total inputAmount based on the swap routes
    // TODO(WEB-2761): Amend V2Trade objects in the v2-sdk to have a separate field for post-input tax routes
    return this.outputAmount.multiply(new Fraction(ONE).subtract(this.totalTaxRate))
  }

  public minimumAmountOut(slippageTolerance: Percent, amountOut = this.outputAmount): CurrencyAmount<Currency> {
    // Since universal-router-sdk reconstructs V2Trade objects, overriding this method does not actually change the minimumAmountOut that gets submitted on-chain
    // Our current workaround is to add tax rate to slippage tolerance before we submit the trade to universal-router-sdk in useUniversalRouter.ts
    // So the purpose of this override is so the UI displays the same minimum amount out as what is submitted on-chain
    return super.minimumAmountOut(slippageTolerance.add(this.totalTaxRate), amountOut)
  }

  // gas estimate for maybe approve + swap
  public get totalGasUseEstimateUSD(): number | undefined {
    if (this.approveInfo.needsApprove && this.gasUseEstimateUSD) {
      return this.approveInfo.approveGasEstimateUSD + this.gasUseEstimateUSD
    }

    return this.gasUseEstimateUSD
  }
}

export class PreviewTrade {
  public readonly fillType = TradeFillType.None
  public readonly quoteMethod = QuoteMethod.QUICK_ROUTE
  public readonly tradeType: TradeType
  public readonly inputAmount: CurrencyAmount<Currency>
  public readonly outputAmount: CurrencyAmount<Currency>
  inputTax: Percent
  outputTax: Percent

  constructor({
    inputAmount,
    outputAmount,
    tradeType,
    inputTax,
    outputTax,
  }: {
    inputAmount: CurrencyAmount<Currency>
    outputAmount: CurrencyAmount<Currency>
    tradeType: TradeType
    inputTax: Percent
    outputTax: Percent
  }) {
    this.inputAmount = inputAmount
    this.outputAmount = outputAmount
    this.tradeType = tradeType
    this.inputTax = inputTax
    this.outputTax = outputTax
  }

  public get totalTaxRate(): Percent {
    return this.inputTax.add(this.outputTax)
  }

  public get postTaxOutputAmount() {
    // Ideally we should calculate the final output amount by ammending the inputAmount based on the input tax and then applying the output tax,
    // but this isn't currently possible because V2Trade reconstructs the total inputAmount based on the swap routes
    // TODO(WEB-2761): Amend V2Trade objects in the v2-sdk to have a separate field for post-input tax routes
    return this.outputAmount.multiply(new Fraction(ONE).subtract(this.totalTaxRate))
  }

  // below methods are copied from router-sdk
  // Trade https://github.com/Uniswap/router-sdk/blob/main/src/entities/trade.ts#L10
  public minimumAmountOut(slippageTolerance: Percent, amountOut = this.outputAmount): CurrencyAmount<Currency> {
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return amountOut
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE)
        .add(slippageTolerance)
        .invert()
        .multiply(amountOut.quotient).quotient
      return CurrencyAmount.fromRawAmount(amountOut.currency, slippageAdjustedAmountOut)
    }
  }

  public maximumAmountIn(slippageTolerance: Percent, amountIn = this.inputAmount): CurrencyAmount<Currency> {
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return amountIn
    } else {
      const slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(amountIn.quotient).quotient
      return CurrencyAmount.fromRawAmount(amountIn.currency, slippageAdjustedAmountIn)
    }
  }

  private _executionPrice: Price<Currency, Currency> | undefined
  /**
   * The price expressed in terms of output amount/input amount.
   */
  public get executionPrice(): Price<Currency, Currency> {
    return (
      this._executionPrice ??
      (this._executionPrice = new Price(
        this.inputAmount.currency,
        this.outputAmount.currency,
        this.inputAmount.quotient,
        this.outputAmount.quotient
      ))
    )
  }

  public worstExecutionPrice(slippageTolerance: Percent): Price<Currency, Currency> {
    return new Price(
      this.inputAmount.currency,
      this.outputAmount.currency,
      this.maximumAmountIn(slippageTolerance).quotient,
      this.minimumAmountOut(slippageTolerance).quotient
    )
  }
}

export type SubmittableTrade = ClassicTrade
export type InterfaceTrade = SubmittableTrade | PreviewTrade

export enum QuoteState {
  SUCCESS = 'Success',
  NOT_FOUND = 'Not found',
}

export type QuoteResult =
  | {
      state: QuoteState.NOT_FOUND
      data?: undefined
    }
  | {
      state: QuoteState.SUCCESS
      data: URAQuoteResponse
    }

export type TradeResult =
  | {
      state: QuoteState.NOT_FOUND
      trade?: undefined
      latencyMs?: number
    }
  | {
      state: QuoteState.SUCCESS
      trade: SubmittableTrade
      latencyMs?: number
    }

export enum PoolType {
  V2Pool = 'v2-pool',
  V3Pool = 'v3-pool',
}

// swap router API special cases these strings to represent native currencies
// all chains except for bnb chain and polygon
// have "ETH" as native currency symbol
export enum SwapRouterNativeAssets {
  MATIC = 'MATIC',
  BNB = 'BNB',
  AVAX = 'AVAX',
  ETH = 'ETH',
  XDAI = 'xDAI',
}

export enum URAQuoteType {
  CLASSIC = 'CLASSIC',
}
