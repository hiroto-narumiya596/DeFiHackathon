//@ts-ignore
import * as xfl from '@xrplkit/xfl'

export function xflToHex(xflStr: string): string {
    let buf = Buffer.alloc(8)

    buf.writeBigInt64LE(xfl.toBigInt(xflStr))
    return buf.toString('hex').toUpperCase()
}

export function bi64ToHex(bi64: bigint): string {
    let buf = Buffer.alloc(8)

    buf.writeBigInt64LE(bi64)
    return buf.toString('hex').toUpperCase()
}
