import { Deposit } from '../../generated/VotingEscrow/VotingEscrow'
import { Lock, LockSystemInfo } from '../../generated/schema'
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"

export function handleDeposit(event: Deposit): void {
  let endTime = event.params.locktime
  let beginTime = event.params.ts
  if (endTime != BigInt.fromI32(0) && endTime > beginTime) {
    let lockInfo = getLockInfo(event.block, event.transaction)
    let oldCount = lockInfo.lockCount
    let oldAverage = lockInfo.averageLockTime
    let oldTotal = oldCount.times(oldAverage)

    let lockDuration = endTime.minus(beginTime)
    let newTotal = oldTotal.plus(lockDuration)
    let newCount = oldCount.plus(BigInt.fromI32(1))
    let newAverage = newTotal.div(newCount)
    lockInfo.lockCount = newCount
    lockInfo.averageLockTime = newAverage
    lockInfo.save()
  }

  let lock = getOrCreateLock(event.params.provider) 
  lock.amount = lock.amount.plus(event.params.value)
  lock.end = endTime
  lock.save()
}

export function getLockInfo(
  block: ethereum.Block,
  tx: ethereum.Transaction,
): LockSystemInfo {
  let state = LockSystemInfo.load("current")

  if (state == null) {
    state = new LockSystemInfo("current")

    state.lockCount = BigInt.fromI32(0)
    state.averageLockTime = BigInt.fromI32(0)
  }

  state.updated = block.timestamp
  state.updatedAtBlock = block.number
  state.updatedAtTransaction = tx.hash

  return state as LockSystemInfo
}

export function getOrCreateLock(
  address: Address
): Lock {
  let lock = Lock.load(address.toHexString())

  if (lock == null) {
    lock = new Lock(address.toHex())
    lock.address = address
    lock.amount = BigInt.fromI32(0)
    lock.end = BigInt.fromI32(0)
    lock.save()
  }

  return lock as Lock
}
