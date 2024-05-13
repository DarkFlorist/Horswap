type Maybe<T> = T
/** All built-in and custom scalars, mapped to their actual values */
type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /**
   * The `AWSJSON` scalar type provided by AWS AppSync, represents a JSON string that
   * complies with [RFC 8259](https://tools.ietf.org/html/rfc8259).  Maps like
   * "**{\\"upvotes\\": 10}**", lists like "**[1,2,3]**", and scalar values like
   * "**\\"AWSJSON example string\\"**", "**1**", and "**true**" are accepted as
   * valid JSON and will automatically be parsed and loaded in the resolver mapping
   * templates as Maps, Lists, or Scalar values rather than as the literal input
   * strings.  Invalid JSON strings like "**{a: 1}**", "**{'a': 1}**" and "**Unquoted
   * string**" will throw GraphQL validation errors.
   */
  AWSJSON: any
}

/**
 *  Types, unions, and inputs (alphabetized):
 * These are colocated to highlight the relationship between some types and their inputs.
 */

type Amount = IAmount & {
  readonly __typename?: 'Amount'
  readonly currency?: Maybe<Currency>
  readonly id: Scalars['ID']
  readonly value: Scalars['Float']
}

type DescriptionTranslations = {
  readonly __typename?: 'DescriptionTranslations'
  readonly descriptionEnUs?: Maybe<Scalars['String']>
  readonly descriptionEs419?: Maybe<Scalars['String']>
  readonly descriptionEsEs?: Maybe<Scalars['String']>
  readonly descriptionEsUs?: Maybe<Scalars['String']>
  readonly descriptionFrFr?: Maybe<Scalars['String']>
  readonly descriptionHiIn?: Maybe<Scalars['String']>
  readonly descriptionIdId?: Maybe<Scalars['String']>
  readonly descriptionJaJp?: Maybe<Scalars['String']>
  readonly descriptionMsMy?: Maybe<Scalars['String']>
  readonly descriptionNlNl?: Maybe<Scalars['String']>
  readonly descriptionPtPt?: Maybe<Scalars['String']>
  readonly descriptionRuRu?: Maybe<Scalars['String']>
  readonly descriptionThTh?: Maybe<Scalars['String']>
  readonly descriptionTrTr?: Maybe<Scalars['String']>
  readonly descriptionUkUa?: Maybe<Scalars['String']>
  readonly descriptionUrPk?: Maybe<Scalars['String']>
  readonly descriptionViVn?: Maybe<Scalars['String']>
  readonly descriptionZhHans?: Maybe<Scalars['String']>
  readonly descriptionZhHant?: Maybe<Scalars['String']>
  readonly id: Scalars['ID']
}

type Dimensions = {
  readonly __typename?: 'Dimensions'
  readonly height?: Maybe<Scalars['Float']>
  readonly id: Scalars['ID']
  readonly width?: Maybe<Scalars['Float']>
}

/**   Interfaces (alphabetized): */
type IAmount = {
  readonly currency?: Maybe<Currency>
  readonly value: Scalars['Float']
}

type IContract = {
  readonly address?: Maybe<Scalars['String']>
  readonly chain: Chain
}

type Image = {
  readonly __typename?: 'Image'
  readonly dimensions?: Maybe<Dimensions>
  readonly id: Scalars['ID']
  readonly url: Scalars['String']
}

enum PriceSource {
  SubgraphV2 = 'SUBGRAPH_V2',
  SubgraphV3 = 'SUBGRAPH_V3',
}

enum SafetyLevel {
  Blocked = 'BLOCKED',
  MediumWarning = 'MEDIUM_WARNING',
  StrongWarning = 'STRONG_WARNING',
  Verified = 'VERIFIED',
}

type TimestampedAmount = IAmount & {
  readonly __typename?: 'TimestampedAmount'
  readonly currency?: Maybe<Currency>
  readonly id: Scalars['ID']
  readonly timestamp: Scalars['Int']
  readonly value: Scalars['Float']
}

type TokenMarket = {
  readonly __typename?: 'TokenMarket'
  readonly fullyDilutedValuation?: Maybe<Amount>
  /**
   *  historicalVolume returns different granularities of data depending on the requested duration
   * - if duration === HOUR  , return 5min volume
   * - if duration === DAY   , return hourly volume
   * - if duration === WEEK  , return 6hr volume
   * - if duration === MONTH , return daily volume
   * - if duration === YEAR  , return weekly volume
   * - if duration === MAX   , return monthly volume
   */
  readonly historicalVolume?: Maybe<ReadonlyArray<Maybe<TimestampedAmount>>>
  readonly id: Scalars['ID']
  readonly price?: Maybe<Amount>
  readonly priceHighLow?: Maybe<Amount>
  readonly priceHistory?: Maybe<ReadonlyArray<Maybe<TimestampedAmount>>>
  readonly pricePercentChange?: Maybe<Amount>
  readonly priceSource: PriceSource
  readonly token: Token
  readonly totalValueLocked?: Maybe<Amount>
  readonly volume?: Maybe<Amount>
}

type TokenProject = {
  readonly __typename?: 'TokenProject'
  readonly description?: Maybe<Scalars['String']>
  readonly descriptionTranslations?: Maybe<DescriptionTranslations>
  readonly homepageUrl?: Maybe<Scalars['String']>
  readonly id: Scalars['ID']
  readonly isSpam?: Maybe<Scalars['Boolean']>
  readonly logo?: Maybe<Image>
  /** @deprecated use logo */
  readonly logoUrl?: Maybe<Scalars['String']>
  readonly markets?: Maybe<ReadonlyArray<Maybe<TokenProjectMarket>>>
  readonly name?: Maybe<Scalars['String']>
  readonly safetyLevel?: Maybe<SafetyLevel>
  /** @deprecated use logo */
  readonly smallLogo?: Maybe<Image>
  readonly spamCode?: Maybe<Scalars['Int']>
  readonly tokens: ReadonlyArray<Token>
  readonly twitterName?: Maybe<Scalars['String']>
}

type TokenProjectMarket = {
  readonly __typename?: 'TokenProjectMarket'
  readonly currency: Currency
  readonly fullyDilutedValuation?: Maybe<Amount>
  readonly id: Scalars['ID']
  readonly marketCap?: Maybe<Amount>
  readonly price?: Maybe<Amount>
  readonly priceHigh52w?: Maybe<Amount>
  readonly priceHighLow?: Maybe<Amount>
  readonly priceHistory?: Maybe<ReadonlyArray<Maybe<TimestampedAmount>>>
  readonly priceLow52w?: Maybe<Amount>
  readonly pricePercentChange?: Maybe<Amount>
  readonly pricePercentChange24h?: Maybe<Amount>
  readonly tokenProject: TokenProject
}

export enum TokenStandard {
  Erc20 = 'ERC20',
  Native = 'NATIVE',
}

export enum TransactionStatus {
  Confirmed = 'CONFIRMED',
  Failed = 'FAILED',
  Pending = 'PENDING',
}

export enum Currency {
  Eth = 'ETH',
  Matic = 'MATIC',
  Usd = 'USD',
}

export enum Chain {
  Arbitrum = 'ARBITRUM',
  Avalanche = 'AVALANCHE',
  Base = 'BASE',
  Bnb = 'BNB',
  Celo = 'CELO',
  Ethereum = 'ETHEREUM',
  EthereumGoerli = 'ETHEREUM_GOERLI',
  EthereumSepolia = 'ETHEREUM_SEPOLIA',
  Optimism = 'OPTIMISM',
  Polygon = 'POLYGON',
  Gnosis = 'GNOSIS',
  UnknownChain = 'UNKNOWN_CHAIN',
}

export type Token = IContract & {
  readonly __typename?: 'Token'
  readonly address?: Maybe<Scalars['String']>
  readonly chain: Chain
  readonly decimals?: Maybe<Scalars['Int']>
  readonly id: Scalars['ID']
  readonly market?: Maybe<TokenMarket>
  readonly name?: Maybe<Scalars['String']>
  readonly project?: Maybe<TokenProject>
  readonly standard?: Maybe<TokenStandard>
  readonly symbol?: Maybe<Scalars['String']>
}

export type TokenBalance = {
  readonly __typename?: 'TokenBalance'
  readonly blockNumber?: Maybe<Scalars['Int']>
  readonly blockTimestamp?: Maybe<Scalars['Int']>
  readonly denominatedValue?: Maybe<Amount>
  readonly id: Scalars['ID']
  readonly isHidden?: Maybe<Scalars['Boolean']>
  readonly ownerAddress: Scalars['String']
  readonly quantity?: Maybe<Scalars['Float']>
  readonly token?: Maybe<Token>
  readonly tokenProjectMarket?: Maybe<TokenProjectMarket>
}
