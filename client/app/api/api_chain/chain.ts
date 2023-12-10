// API to access the XRPL chain

import * as xrpl from '@transia/xrpl'
import * as rippleAddressCodec from 'ripple-address-codec'

//@ts-ignore
import * as xfl from '@xrplkit/xfl'

function xflToHex(xflStr: string): string {
    let buf = Buffer.alloc(8)

    buf.writeBigInt64LE(xfl.toBigInt(xflStr))
    return buf.toString('hex').toUpperCase()
}

export function bi64ToHex(bi64: bigint): string {
    let buf = Buffer.alloc(8)

    buf.writeBigInt64LE(bi64)
    return buf.toString('hex').toUpperCase()
}


type LoginState = "None" | "Trier" | "Checker"

export const tokenCode = "TCS"

export class Chain {
    loginState: LoginState
    client: xrpl.Client | undefined
    wallet: xrpl.Wallet | undefined
    issuerAccount: string

    constructor(issuer: string) {
        this.loginState = "None"
        this.client = undefined
        this.wallet = undefined
        this.issuerAccount = issuer
    }
    async connect(serverUrl: string) : Promise<boolean> {
        this.client = new xrpl.Client(serverUrl)
        await this.client.connect()

        return true
    }
    async disconnect() {
        await this.client?.disconnect()
    }
    updateLoginState(login: LoginState, seed: string) {
        if (login !== "None") {
            // Login
            this.wallet = xrpl.Wallet.fromSeed(seed)
        } else {
            // Logout
            this.wallet = undefined
        }
        this.loginState = login
    }
    async loadTokenBalance() : Promise<number | undefined> {
        if (this.client === undefined) {
            return undefined
        }

        const response = await this.client!.request({
            "command": "account_lines",
            "account": this.wallet?.classicAddress
        }) as xrpl.AccountLinesResponse

        const balance = Number(response?.result.lines.find(line => {
            return line.account === this.issuerAccount && line.currency === "TCS"
        })?.balance)

        return balance
    }
    async loadLastCommitmentId() : Promise<string | undefined> {
        if (this.wallet === undefined) {
            return undefined
        }

        const trierKey = "B000000000000000" + rippleAddressCodec.decodeAccountID(this.wallet.classicAddress)
        const namespaceId = "tacs"

        const response = await this.client!.request({
            "command": "ledger_entry",
            "hook_state": {
                "account": this.issuerAccount,
                "key": trierKey,
                "namespace_id": namespaceId,
            }
        }) as xrpl.LedgerEntryResponse
        return "" // TODO
    }
    async createTask(taskHash: string, intervalInSeconds: string) : Promise<boolean> {
        if (this.wallet === undefined || this.client === undefined) {
            return false
        }

        const invokeTx: xrpl.Invoke = {
            TransactionType: "Invoke",
            Account: this.wallet!.classicAddress,
            Destination: this.issuerAccount,
            HookParameters: [
                {
                    HookParameter: {
                        HookParameterName: xrpl.convertStringToHex("0"),
                        HookParameterValue: xrpl.convertStringToHex("T")
                    }
                },
                {
                    HookParameter: {
                        HookParameterName: xrpl.convertStringToHex("H"),
                        HookParameterValue: taskHash 
                    }
                },
                {
                    HookParameter: {
                        HookParameterName: xrpl.convertStringToHex("T"),
                        HookParameterValue: bi64ToHex(BigInt(intervalInSeconds))
                    }
                },
            ]
        }
        const preparedInvokeTx = await this.client!.autofill(invokeTx)
        const signedInvokeTx = this.wallet.sign(preparedInvokeTx)
        const invokeTxResult = await this.client!.submitAndWait(signedInvokeTx.tx_blob)

        return true // TODO: check the result
    }
    async commit(taskId: string, lockAmount: string, isXrp: boolean) : Promise<boolean> {
        if (this.wallet === undefined || this.client === undefined) {
            return false
        }

        const payAmount = isXrp ? xrpl.xrpToDrops(lockAmount) : { "currency": tokenCode, "issuer": this.issuerAccount, "value": lockAmount}
        const paymentTx: xrpl.Payment = {
            TransactionType: "Payment",
            Account: this.wallet!.classicAddress,
            Destination: this.issuerAccount,
            Amount: payAmount,
        }
        const preparedPaymentTx = await this.client!.autofill(paymentTx)
        const signedPaymentTx = this.wallet.sign(preparedPaymentTx)
        const paymentTxResult = await this.client!.submitAndWait(signedPaymentTx.tx_blob)
        // TODO: check the result 

        const invokeTx: xrpl.Invoke = {
            TransactionType: "Invoke",
            Account: this.wallet!.classicAddress,
            Destination: this.issuerAccount,
            HookParameters: [
                {
                    HookParameter: {
                        HookParameterName: xrpl.convertStringToHex("0"),
                        HookParameterValue: xrpl.convertStringToHex("C")
                    }
                },
                {
                    HookParameter: {
                        HookParameterName: xrpl.convertStringToHex("I"),
                        HookParameterValue: taskId, 
                    }
                },
                {
                    HookParameter: {
                        HookParameterName: xrpl.convertStringToHex("L"),
                        HookParameterValue: xflToHex(xfl.XFL(String(Number(lockAmount) * (-1)))), // In xfl library, sign of a number is opposite
                    }
                },
            ]
        }
        const preparedInvokeTx = await this.client!.autofill(invokeTx)
        const signedInvokeTx = this.wallet.sign(preparedInvokeTx)
        const invokeTxResult = await this.client!.submitAndWait(signedInvokeTx.tx_blob)

        return true // TODO: check the result of tx
    }
    async evaluateCommit(commitId: string, isApproval: boolean) : Promise<boolean> {
        if (this.wallet === undefined || this.client === undefined) {
            return false
        }

        const invokeTx: xrpl.Invoke = {
            TransactionType: "Invoke",
            Account: this.wallet!.classicAddress,
            Destination: this.issuerAccount,
            HookParameters: [
                {
                    HookParameter: {
                        HookParameterName: xrpl.convertStringToHex("0"),
                        HookParameterValue: xrpl.convertStringToHex("E")
                    }
                },
                {
                    HookParameter: {
                        HookParameterName: xrpl.convertStringToHex("I"),
                        HookParameterValue: commitId 
                    }
                },
                {
                    HookParameter: {
                        HookParameterName: xrpl.convertStringToHex("R"),
                        HookParameterValue: bi64ToHex(isApproval ? 1n : 2n)
                    }
                },
            ]
        }
        const preparedInvokeTx = await this.client!.autofill(invokeTx)
        const signedInvokeTx = this.wallet.sign(preparedInvokeTx)
        const invokeTxResult = await this.client!.submitAndWait(signedInvokeTx.tx_blob)

        return true // TODO: check the result
    }

    static getCheckerIdFromTaskId(taskId: string) : string | undefined {
        return rippleAddressCodec.encodeAccountID(Buffer.from(taskId.slice(0, 40), "hex")) // TODO: check validity
    }
}
