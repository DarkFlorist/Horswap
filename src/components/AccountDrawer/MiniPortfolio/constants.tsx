import { t } from '@lingui/macro'
import { TransactionType } from 'state/transactions/types'
import { TransactionStatus } from 'types/types-and-hooks'

const TransactionTitleTable: { [key in TransactionType]: { [state in TransactionStatus]: string } } = {
  [TransactionType.SWAP]: {
    [TransactionStatus.Pending]: t`Swapping`,
    [TransactionStatus.Confirmed]: t`Swapped`,
    [TransactionStatus.Failed]: t`Swap failed`,
  },
  [TransactionType.WRAP]: {
    [TransactionStatus.Pending]: t`Wrapping`,
    [TransactionStatus.Confirmed]: t`Wrapped`,
    [TransactionStatus.Failed]: t`Wrap failed`,
  },
  [TransactionType.ADD_LIQUIDITY_V3_POOL]: {
    [TransactionStatus.Pending]: t`Adding liquidity`,
    [TransactionStatus.Confirmed]: t`Added liquidity`,
    [TransactionStatus.Failed]: t`Add liquidity failed`,
  },
  [TransactionType.REMOVE_LIQUIDITY_V3]: {
    [TransactionStatus.Pending]: t`Removing liquidity`,
    [TransactionStatus.Confirmed]: t`Removed liquidity`,
    [TransactionStatus.Failed]: t`Remove liquidity failed`,
  },
  [TransactionType.CREATE_V3_POOL]: {
    [TransactionStatus.Pending]: t`Creating pool`,
    [TransactionStatus.Confirmed]: t`Created pool`,
    [TransactionStatus.Failed]: t`Create pool failed`,
  },
  [TransactionType.COLLECT_FEES]: {
    [TransactionStatus.Pending]: t`Collecting fees`,
    [TransactionStatus.Confirmed]: t`Collected fees`,
    [TransactionStatus.Failed]: t`Collect fees failed`,
  },
  [TransactionType.APPROVAL]: {
    [TransactionStatus.Pending]: t`Approving`,
    [TransactionStatus.Confirmed]: t`Approved`,
    [TransactionStatus.Failed]: t`Approval failed`,
  },
  [TransactionType.CLAIM]: {
    [TransactionStatus.Pending]: t`Claiming`,
    [TransactionStatus.Confirmed]: t`Claimed`,
    [TransactionStatus.Failed]: t`Claim failed`,
  },
  [TransactionType.BUY]: {
    [TransactionStatus.Pending]: t`Buying`,
    [TransactionStatus.Confirmed]: t`Bought`,
    [TransactionStatus.Failed]: t`Buy failed`,
  },
  [TransactionType.SEND]: {
    [TransactionStatus.Pending]: t`Sending`,
    [TransactionStatus.Confirmed]: t`Sent`,
    [TransactionStatus.Failed]: t`Send failed`,
  },
  [TransactionType.RECEIVE]: {
    [TransactionStatus.Pending]: t`Receiving`,
    [TransactionStatus.Confirmed]: t`Received`,
    [TransactionStatus.Failed]: t`Receive failed`,
  },
  [TransactionType.MINT]: {
    [TransactionStatus.Pending]: t`Minting`,
    [TransactionStatus.Confirmed]: t`Minted`,
    [TransactionStatus.Failed]: t`Mint failed`,
  },
  [TransactionType.BURN]: {
    [TransactionStatus.Pending]: t`Burning`,
    [TransactionStatus.Confirmed]: t`Burned`,
    [TransactionStatus.Failed]: t`Burn failed`,
  },
  [TransactionType.BORROW]: {
    [TransactionStatus.Pending]: t`Borrowing`,
    [TransactionStatus.Confirmed]: t`Borrowed`,
    [TransactionStatus.Failed]: t`Borrow failed`,
  },
  [TransactionType.REPAY]: {
    [TransactionStatus.Pending]: t`Repaying`,
    [TransactionStatus.Confirmed]: t`Repaid`,
    [TransactionStatus.Failed]: t`Repay failed`,
  },
  [TransactionType.DEPLOY]: {
    [TransactionStatus.Pending]: t`Deploying`,
    [TransactionStatus.Confirmed]: t`Deployed`,
    [TransactionStatus.Failed]: t`Deploy failed`,
  },
  [TransactionType.CANCEL]: {
    [TransactionStatus.Pending]: t`Cancelling`,
    [TransactionStatus.Confirmed]: t`Cancelled`,
    [TransactionStatus.Failed]: t`Cancel failed`,
  },
  [TransactionType.DEPOSIT_LIQUIDITY_STAKING]: {
    [TransactionStatus.Pending]: t`Depositing`,
    [TransactionStatus.Confirmed]: t`Deposited`,
    [TransactionStatus.Failed]: t`Deposit failed`,
  },
  [TransactionType.WITHDRAW_LIQUIDITY_STAKING]: {
    [TransactionStatus.Pending]: t`Withdrawing`,
    [TransactionStatus.Confirmed]: t`Withdrew`,
    [TransactionStatus.Failed]: t`Withdraw failed`,
  },
  [TransactionType.ADD_LIQUIDITY_V2_POOL]: {
    [TransactionStatus.Pending]: t`Adding V2 liquidity`,
    [TransactionStatus.Confirmed]: t`Added V2 liquidity`,
    [TransactionStatus.Failed]: t`Add V2 liquidity failed`,
  },
  [TransactionType.MIGRATE_LIQUIDITY_V3]: {
    [TransactionStatus.Pending]: t`Migrating liquidity`,
    [TransactionStatus.Confirmed]: t`Migrated liquidity`,
    [TransactionStatus.Failed]: t`Migrate liquidity failed`,
  },
}

export const CancelledTransactionTitleTable: { [key in TransactionType]: string } = {
  [TransactionType.SWAP]: t`Swap cancelled`,
  [TransactionType.WRAP]: t`Wrap cancelled`,
  [TransactionType.ADD_LIQUIDITY_V3_POOL]: t`Add liquidity cancelled`,
  [TransactionType.REMOVE_LIQUIDITY_V3]: t`Remove liquidity cancelled`,
  [TransactionType.CREATE_V3_POOL]: t`Create pool cancelled`,
  [TransactionType.COLLECT_FEES]: t`Collect fees cancelled`,
  [TransactionType.APPROVAL]: t`Approval cancelled`,
  [TransactionType.CLAIM]: t`Claim cancelled`,
  [TransactionType.BUY]: t`Buy cancelled`,
  [TransactionType.SEND]: t`Send cancelled`,
  [TransactionType.RECEIVE]: t`Receive cancelled`,
  [TransactionType.MINT]: t`Mint cancelled`,
  [TransactionType.BURN]: t`Burn cancelled`,
  [TransactionType.BORROW]: t`Borrow cancelled`,
  [TransactionType.REPAY]: t`Repay cancelled`,
  [TransactionType.DEPLOY]: t`Deploy cancelled`,
  [TransactionType.CANCEL]: t`Cancellation cancelled`,
  [TransactionType.DEPOSIT_LIQUIDITY_STAKING]: t`Deposit cancelled`,
  [TransactionType.WITHDRAW_LIQUIDITY_STAKING]: t`Withdrawal cancelled`,
  [TransactionType.ADD_LIQUIDITY_V2_POOL]: t`Add V2 liquidity cancelled`,
  [TransactionType.MIGRATE_LIQUIDITY_V3]: t`Migrate liquidity cancelled`,
}

const AlternateTransactionTitleTable: { [key in TransactionType]?: { [state in TransactionStatus]: string } } = {
  [TransactionType.WRAP]: {
    [TransactionStatus.Pending]: t`Unwrapping`,
    [TransactionStatus.Confirmed]: t`Unwrapped`,
    [TransactionStatus.Failed]: t`Unwrap failed`,
  },
  [TransactionType.APPROVAL]: {
    [TransactionStatus.Pending]: t`Revoking approval`,
    [TransactionStatus.Confirmed]: t`Revoked approval`,
    [TransactionStatus.Failed]: t`Revoke approval failed`,
  },
}

export function getActivityTitle(type: TransactionType, status: TransactionStatus, alternate?: boolean) {
  if (alternate) {
    const alternateTitle = AlternateTransactionTitleTable[type]
    if (alternateTitle !== undefined) return alternateTitle[status]
  }
  return TransactionTitleTable[type][status]
}
