import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts"

import { Airdropee, Swap } from "../../generated/schema"
import { SwapNormal } from "../../generated/SiriusUSDPool/SwapNormal"
import { getOrCreateToken } from "./token"
import { getSystemInfo } from "./system"
import { MetaSwap } from "../../generated/SiriusUSDSMetaPool/MetaSwap"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

class SwapInfo {
  tokens: Address[]
  allTokens: Address[] // tokens + basePool Tokens (metaSwap)
  balances: BigInt[]
  A: BigInt
  swapFee: BigInt
  adminFee: BigInt
  virtualPrice: BigInt
  owner: Address
  lpToken: Address
}

export function getOrCreateSwap(
  address: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction,
): Swap {
  let swap = Swap.load(address.toHexString())

  if (swap == null) {
    let info = getSwapInfo(address)

    swap = new Swap(address.toHexString())
    swap.address = address
    swap.numTokens = info.tokens.length
    swap.tokens = registerTokens(info.tokens, block, tx)
    swap.allTokens = registerTokens(info.allTokens, block, tx)
    swap.balances = info.balances
    swap.lpToken = info.lpToken

    swap.A = info.A

    swap.swapFee = info.swapFee
    swap.adminFee = info.adminFee

    swap.virtualPrice = info.virtualPrice

    swap.owner = info.owner

    swap.TVL = BigDecimal.fromString("0")
    swap.APY = BigDecimal.fromString("0")

    swap.save()

    let system = getSystemInfo(block, tx)
    system.swapCount = system.swapCount.plus(BigInt.fromI32(1))
    system.save()
  }

  return swap as Swap
}

// Gets poll info from swap contract
export function getSwapInfo(swap: Address): SwapInfo {
  let swapContract = SwapNormal.bind(swap)

  let tokens: Address[] = []
  let balances: BigInt[] = []

  let t: ethereum.CallResult<Address>
  let b: ethereum.CallResult<BigInt>

  let i = 0

  do {
    t = swapContract.try_getToken(i)
    b = swapContract.try_getTokenBalance(i)

    if (!t.reverted && t.value.toHexString() != ZERO_ADDRESS) {
      tokens.push(t.value)
    }

    if (!b.reverted) {
      balances.push(b.value)
    }

    i++
  } while (!t.reverted && !b.reverted)

  return {
    tokens,
    allTokens: tokens,
    balances,
    A: swapContract.getA(),
    swapFee: swapContract.swapStorage().value4,
    adminFee: swapContract.swapStorage().value5,
    virtualPrice: swapContract.getVirtualPrice(),
    owner: swapContract.owner(),
    lpToken: swapContract.swapStorage().value6,
  }
}

export function getBalances(swap: Address, N_COINS: number): BigInt[] {
  let swapContract = SwapNormal.bind(swap)
  let balances = new Array<BigInt>(<i32>N_COINS)

  for (let i = 0; i < N_COINS; ++i) {
    balances[i] = swapContract.getTokenBalance(i)
  }

  return balances
}

export function getOrCreateMetaSwap(
  address: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction,
): Swap {
  let swap = Swap.load(address.toHexString())

  if (swap == null) {
    let info = getMetaSwapInfo(address)

    swap = new Swap(address.toHexString())
    swap.address = address
    swap.numTokens = info.tokens.length
    swap.tokens = registerTokens(info.tokens, block, tx)
    swap.allTokens = registerTokens(info.allTokens, block, tx)
    swap.balances = info.balances
    swap.lpToken = info.lpToken

    swap.A = info.A

    swap.swapFee = info.swapFee
    swap.adminFee = info.adminFee


    swap.virtualPrice = info.virtualPrice

    swap.owner = info.owner

    swap.TVL = BigDecimal.fromString("0")
    swap.APY = BigDecimal.fromString("0")

    swap.save()

    let system = getSystemInfo(block, tx)
    system.swapCount = system.swapCount.plus(BigInt.fromI32(1))
    system.save()
  }

  return swap as Swap
}

// Gets poll info from swap contract
export function getMetaSwapInfo(swap: Address): SwapInfo {
  let swapContract = MetaSwap.bind(swap)

  let tokens: Address[] = []
  let baseTokens: Address[] = []
  let balances: BigInt[] = []
  let allTokens: Address[] = []

  // get metapool tokens
  let t: ethereum.CallResult<Address>
  let b: ethereum.CallResult<BigInt>

  let i = 0

  do {
    t = swapContract.try_getToken(i)
    b = swapContract.try_getTokenBalance(i)

    if (!t.reverted && t.value.toHexString() != ZERO_ADDRESS) {
      tokens.push(t.value)
    }

    if (!b.reverted) {
      balances.push(b.value)
    }

    i++
  } while (!t.reverted && !b.reverted)

  // get the lp token bounded basepool tokens
  let baseSwapAddress = swapContract.metaSwapStorage().value0
  let baseSwapContract = Swap.bind(baseSwapAddress)

  let t2: ethereum.CallResult<Address>

  let j = 0

  do {
    t2 = baseSwapContract.try_getToken(j)

    if (!t2.reverted && t2.value.toHexString() != ZERO_ADDRESS) {
      baseTokens.push(t2.value)
    }

    j++
  } while (!t2.reverted)

  // combine metapool tokens and basepool tokens to get all tokens
  for (let i = 0; i < tokens.length - 1; i++) {
    allTokens.push(tokens[i])
  }
  for (let i = 0; i < baseTokens.length; i++) {
    allTokens.push(baseTokens[i])
  }

  return {
    tokens,
    allTokens,
    balances,
    A: swapContract.getA(),
    swapFee: swapContract.swapStorage().value4,
    adminFee: swapContract.swapStorage().value5,
    virtualPrice: swapContract.getVirtualPrice(),
    owner: swapContract.owner(),
    lpToken: swapContract.swapStorage().value6,
  }
}

export function getBalancesMetaSwap(swap: Address, N_COINS: number): BigInt[] {
  let swapContract = MetaSwap.bind(swap)
  let balances = new Array<BigInt>(<i32>N_COINS)

  for (let i = 0; i < N_COINS; ++i) {
    balances[i] = swapContract.getTokenBalance(i)
  }

  return balances
}

function registerTokens(
  list: Address[],
  block: ethereum.Block,
  tx: ethereum.Transaction,
): string[] {
  let result: string[] = []

  for (let i = 0; i < list.length; ++i) {
    let current = list[i]

    if (current.toHexString() != ZERO_ADDRESS) {
      let token = getOrCreateToken(current, block, tx)

      result.push(token.id)
    }
  }

  return result
}

export function getOrCreateAirdropee(
  address: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction,
): Airdropee {
  let from = tx.from
  let airdropee = Airdropee.load(from.toHexString())

  if (airdropee == null) {
    airdropee = new Airdropee(from.toHexString())
    airdropee.address = from
    airdropee.count = BigInt.fromI32(0)
    airdropee.swapCount = BigInt.fromI32(0)
    airdropee.addLiquidityCount = BigInt.fromI32(0)
    airdropee.removeLiquidityCount = BigInt.fromI32(0)
    airdropee.removeLiquidityImbalanceCount = BigInt.fromI32(0)
    airdropee.removeLiquidityOneCount = BigInt.fromI32(0)
    airdropee.farmDepositCount = BigInt.fromI32(0)
    airdropee.farmWithdrawCount = BigInt.fromI32(0)
    airdropee.farmClaimCount = BigInt.fromI32(0)
    airdropee.updated = block.timestamp
    airdropee.updatedAtBlock = block.number
    airdropee.updatedAtTransaction = tx.hash

    airdropee.save()
  }

  return airdropee as Airdropee
}
