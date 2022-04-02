import { Deposit, Withdraw } from '../../generated/LiquidityGauge/LiquidityGauge'
import { getOrCreateAirdropee } from "../entities/swap"
import { BigInt } from "@graphprotocol/graph-ts"

export function handleDeposit(event: Deposit): void {
  // Tuesday, March 29, 2022 12:00:00 PM
  if (event.block.timestamp < BigInt.fromI32(1648555200)) {
    let airdropee = getOrCreateAirdropee(event.address, event.block, event.transaction)
    airdropee.count = airdropee.count.plus(BigInt.fromI32(1))

    let transactions = airdropee.transactions
    transactions.push('farm_deposit')
    airdropee.transactions = transactions

    airdropee.updated = event.block.timestamp
    airdropee.updatedAtBlock = event.block.number
    airdropee.updatedAtTransaction = event.transaction.hash
    airdropee.save()
  }
}

export function handleWithdraw(event: Withdraw): void {
  // Tuesday, March 29, 2022 12:00:00 PM
  if (event.block.timestamp < BigInt.fromI32(1648555200)) {
    let airdropee = getOrCreateAirdropee(event.address, event.block, event.transaction)
    airdropee.count = airdropee.count.plus(BigInt.fromI32(1))

    let transactions = airdropee.transactions
    transactions.push('farm_withdraw')
    airdropee.transactions = transactions

    airdropee.updated = event.block.timestamp
    airdropee.updatedAtBlock = event.block.number
    airdropee.updatedAtTransaction = event.transaction.hash
    airdropee.save()
  }
}
