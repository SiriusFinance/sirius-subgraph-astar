import { Minted } from '../../generated/Minter/Minter'
import { getOrCreateAirdropee } from "../entities/swap"
import { BigInt } from "@graphprotocol/graph-ts"

export function handleMinted(event: Minted): void {
  // Tuesday, March 29, 2022 12:00:00 PM
  if (event.block.timestamp < BigInt.fromI32(1648555200)) {
    let airdropee = getOrCreateAirdropee(event.address, event.block, event.transaction)
    airdropee.count = airdropee.count.plus(BigInt.fromI32(1))
    airdropee.farmClaimCount = airdropee.farmClaimCount.plus(BigInt.fromI32(1))

    airdropee.updated = event.block.timestamp
    airdropee.updatedAtBlock = event.block.number
    airdropee.updatedAtTransaction = event.transaction.hash
    airdropee.save()
  }
}
