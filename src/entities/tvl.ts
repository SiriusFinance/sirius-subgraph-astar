import {
  DailyTvl,
  Swap,
} from "../../generated/schema"

import { BigInt } from "@graphprotocol/graph-ts"
import { decimal } from "@protofire/subgraph-toolkit"

/* eslint-disable @typescript-eslint/no-non-null-assertion */



export function getDailyPoolTvl(
  swap: Swap,
  timestamp: BigInt,
): DailyTvl {
  let interval = BigInt.fromI32(60 * 60 * 24)
  let day = timestamp.div(interval).times(interval)
  let id = swap.id + "-day-" + day.toString()

  let tvl = DailyTvl.load(id)

  if (tvl == null) {
    tvl = new DailyTvl(id)
    tvl.swap = swap.id
    tvl.timestamp = day
    tvl.tvl = decimal.ZERO
  }

  return tvl!
}