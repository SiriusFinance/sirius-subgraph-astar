import {
  AddLiquidity,
  RemoveLiquidity,
  RemoveLiquidityOne,
  TokenExchange as TokenSwap
} from "../../generated/JPYCmetapoolDeposit/XSwapDeposit"
import {
  AddLiquidityEvent,
  RemoveLiquidityEvent,
  StopRampAEvent,
  TokenExchange,
  TokenExchangeUnderlying,
} from "../../generated/schema"
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import { getBalancesXSwap, getOrCreateXSwap } from "../entities/swap"
import {
  getDailyTradeVolume,
  getHourlyTradeVolume,
  getWeeklyTradeVolume,
} from "../entities/volume"
import {
  getDailyPoolTvl
} from "../entities/tvl"

import { decimal } from "@protofire/subgraph-toolkit"
import { getOrCreateToken } from "../entities/token"
import { getSystemInfo } from "../entities/system"

const JPYC_ADDRESS = "0x431d5dff03120afa4bdf332c61a6e1766ef37bdb"


export function handleAddLiquidity(event: AddLiquidity): void {
  let swap = getOrCreateXSwap(event.address, event.block, event.transaction)
  let balances = getBalancesXSwap(event.address, swap.numTokens)
  let jpycPrice = event.params.price
  swap.balances = balances

  // update TVL
  let tokens = swap.tokens
  let tvl: BigDecimal = BigDecimal.fromString("0")
  for (let i = 0; i < swap.tokens.length; i++) {
    let token = getOrCreateToken(
      Address.fromString(tokens[i]),
      event.block,
      event.transaction,
    )
    if (token !== null) {
      let balance: BigInt = balances[i]
      let balanceDecimal: BigDecimal = decimal.fromBigInt(
        balance,
        token.decimals.toI32(),
      )
      if (tokens[i] == JPYC_ADDRESS) {
        tvl = tvl.plus(balanceDecimal.times(new BigDecimal(jpycPrice)))
      } else {
        tvl = tvl.plus(balanceDecimal)
      }
    } 
  }
  swap.TVL = tvl

  let dailyTvl = getDailyPoolTvl(swap, event.block.timestamp)
  dailyTvl.tvl = tvl
  dailyTvl.save()

  // update APY
  let dailyVolume = getDailyTradeVolume(swap, event.block.timestamp)
  let dailyTotalSwapFees = dailyVolume.volume.times(swap.swapFee.toBigDecimal()).div(BigDecimal.fromString("10000000000"))
  let apy: BigDecimal = decimal.ZERO
  if (tvl.notEqual(decimal.ZERO)) {
    apy = dailyTotalSwapFees.div(tvl).times(BigDecimal.fromString('365'))
  }
  swap.APY = apy

  swap.save()

  let log = new AddLiquidityEvent(
    "add_liquidity-" + event.transaction.hash.toHexString(),
  )

  log.swap = swap.id
  log.provider = event.params.provider
  log.tokenAmounts = event.params.tokenAmounts
  log.fees = []
  log.invariant = new BigInt(0)
  log.lpTokenSupply = new BigInt(0)

  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}

export function handleRemoveLiquidity(event: RemoveLiquidity): void {
  let swap = getOrCreateXSwap(event.address, event.block, event.transaction)
  let balances = getBalancesXSwap(event.address, swap.numTokens)
  let jpycPrice = event.params.price
  swap.balances = balances

  // update TVL
  let tokens = swap.tokens
  let tvl: BigDecimal = BigDecimal.fromString("0")
  for (let i = 0; i < swap.tokens.length; i++) {
    let token = getOrCreateToken(
      Address.fromString(tokens[i]),
      event.block,
      event.transaction,
    )
    if (token !== null) {
      let balance: BigInt = balances[i]
      let balanceDecimal: BigDecimal = decimal.fromBigInt(
        balance,
        token.decimals.toI32(),
      )
      if (tokens[i] == JPYC_ADDRESS) {
        tvl = tvl.plus(balanceDecimal.times(new BigDecimal(jpycPrice)))
      } else {
        tvl = tvl.plus(balanceDecimal)
      }
    } 
  }
  swap.TVL = tvl

  let dailyTvl = getDailyPoolTvl(swap, event.block.timestamp)
  dailyTvl.tvl = tvl
  dailyTvl.save()

  // update APY
  let dailyVolume = getDailyTradeVolume(swap, event.block.timestamp)
  let dailyTotalSwapFees = dailyVolume.volume.times(swap.swapFee.toBigDecimal()).div(BigDecimal.fromString("10000000000"))
  let apy: BigDecimal = decimal.ZERO
  if (tvl.notEqual(decimal.ZERO)) {
    apy = dailyTotalSwapFees.div(tvl).times(BigDecimal.fromString('365'))
  }
  swap.APY = apy

  swap.save()

  let log = new RemoveLiquidityEvent(
    "remove_liquidity-" + event.transaction.hash.toHexString(),
  )

  log.swap = swap.id
  log.provider = event.params.provider
  log.tokenAmounts = event.params.tokenAmounts
  log.lpTokenSupply = new BigInt(0)

  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}

export function handleRemoveLiquidityOne(event: RemoveLiquidityOne): void {
  let swap = getOrCreateXSwap(event.address, event.block, event.transaction)
  let balances = getBalancesXSwap(event.address, swap.numTokens)
  let jpycPrice = event.params.price
  swap.balances = balances

  // update TVL
  let tokens = swap.tokens
  let tvl: BigDecimal = BigDecimal.fromString("0")
  for (let i = 0; i < swap.tokens.length; i++) {
    let token = getOrCreateToken(
      Address.fromString(tokens[i]),
      event.block,
      event.transaction,
    )
    if (token !== null) {
      let balance: BigInt = balances[i]
      let balanceDecimal: BigDecimal = decimal.fromBigInt(
        balance,
        token.decimals.toI32(),
      )
      if (tokens[i] == JPYC_ADDRESS) {
        tvl = tvl.plus(balanceDecimal.times(new BigDecimal(jpycPrice)))
      } else {
        tvl = tvl.plus(balanceDecimal)
      }
    } 
  }
  swap.TVL = tvl

  let dailyTvl = getDailyPoolTvl(swap, event.block.timestamp)
  dailyTvl.tvl = tvl
  dailyTvl.save()

  // update APY
  let dailyVolume = getDailyTradeVolume(swap, event.block.timestamp)
  let dailyTotalSwapFees = dailyVolume.volume.times(swap.swapFee.toBigDecimal()).div(BigDecimal.fromString("10000000000"))
  let apy: BigDecimal = decimal.ZERO
  if (tvl.notEqual(decimal.ZERO)) {
    apy = dailyTotalSwapFees.div(tvl).times(BigDecimal.fromString('365'))
  }
  swap.APY = apy

  swap.save()

  let log = new RemoveLiquidityEvent(
    "remove_liquidity_one-" + event.transaction.hash.toHexString(),
  )

  let tokenAmounts: BigInt[] = []
  for (let i = 0; i < swap.numTokens; i++) {
    if (i === parseInt(event.params.coinIndex.toString())) {
      tokenAmounts.push(event.params.coinAmount)
    } else {
      tokenAmounts.push(BigInt.fromI32(0))
    }
  }

  log.swap = swap.id
  log.provider = event.params.provider
  log.tokenAmounts = tokenAmounts
  log.lpTokenSupply = new BigInt(0)

  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}

export function handleTokenSwap(event: TokenSwap): void {
  let swap = getOrCreateXSwap(event.address, event.block, event.transaction)
  let balances = getBalancesXSwap(event.address, swap.numTokens)
  let jpycPrice = event.params.price
  swap.balances = balances

  swap.save()

  if (swap != null) {
    let exchange = new TokenExchange(
      "token_exchange-" + event.transaction.hash.toHexString(),
    )

    exchange.swap = swap.id
    exchange.buyer = event.params.buyer
    exchange.soldId = event.params.soldId
    exchange.tokensSold = event.params.tokensSold
    exchange.boughtId = event.params.boughtId
    exchange.tokensBought = event.params.tokensBought

    exchange.block = event.block.number
    exchange.timestamp = event.block.timestamp
    exchange.transaction = event.transaction.hash

    exchange.save()

    // save trade volume
    let tokens = swap.tokens
    if (
      event.params.soldId.toI32() < tokens.length &&
      event.params.boughtId.toI32() < tokens.length
    ) {
      let soldToken = getOrCreateToken(
        Address.fromString(tokens[event.params.soldId.toI32()]),
        event.block,
        event.transaction,
      )
      let sellVolume = decimal.fromBigInt(
        event.params.tokensSold,
        soldToken.decimals.toI32(),
      )
      if (tokens[event.params.soldId.toI32()] == JPYC_ADDRESS) {
        sellVolume = sellVolume.times(new BigDecimal(jpycPrice))
      }
      let boughtToken = getOrCreateToken(
        Address.fromString(tokens[event.params.boughtId.toI32()]),
        event.block,
        event.transaction,
      )
      let buyVolume = decimal.fromBigInt(
        event.params.tokensBought,
        boughtToken.decimals.toI32(),
      )
      if (tokens[event.params.boughtId.toI32()] == JPYC_ADDRESS) {
        buyVolume = buyVolume.times(new BigDecimal(jpycPrice))
      }
      let volume = sellVolume.plus(buyVolume).div(decimal.TWO)

      let hourlyVolume = getHourlyTradeVolume(swap, event.block.timestamp)
      hourlyVolume.volume = hourlyVolume.volume.plus(volume)
      hourlyVolume.save()

      let dailyVolume = getDailyTradeVolume(swap, event.block.timestamp)
      dailyVolume.volume = dailyVolume.volume.plus(volume)
      dailyVolume.save()

      let weeklyVolume = getWeeklyTradeVolume(swap, event.block.timestamp)
      weeklyVolume.volume = weeklyVolume.volume.plus(volume)
      weeklyVolume.save()

      // update TVL
      let tvl: BigDecimal = BigDecimal.fromString("0")
      for (let i = 0; i < swap.tokens.length; i++) {
        let token = getOrCreateToken(
          Address.fromString(tokens[i]),
          event.block,
          event.transaction,
        )
        if (token !== null) {
          let balance: BigInt = balances[i]
          let balanceDecimal: BigDecimal = decimal.fromBigInt(
            balance,
            token.decimals.toI32(),
          )
          if (tokens[i] == JPYC_ADDRESS) {
            tvl = tvl.plus(balanceDecimal.times(new BigDecimal(jpycPrice)))
          } else {
            tvl = tvl.plus(balanceDecimal)
          }
        } 
      }
      swap.TVL = tvl

      let dailyTvl = getDailyPoolTvl(swap, event.block.timestamp)
      dailyTvl.tvl = tvl
      dailyTvl.save()

      // update APY
      let dailyTotalSwapFees = dailyVolume.volume.times(swap.swapFee.toBigDecimal()).div(BigDecimal.fromString("10000000000"))
      let apy: BigDecimal = decimal.ZERO
      if (tvl.notEqual(decimal.ZERO)) {
        apy = dailyTotalSwapFees.div(tvl).times(BigDecimal.fromString('365'))
      }
      swap.APY = apy

      swap.save()
    }

    // update system
    let system = getSystemInfo(event.block, event.transaction)
    system.exchangeCount = system.exchangeCount.plus(BigInt.fromI32(1))
    system.save()
  }
}