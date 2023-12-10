// API to access the XRPL chain

import * as xrpl from '@transia/xrpl'
import * as rippleAddressCodec from 'ripple-address-codec'

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
        const trierKey = "" // TODO
        const namespaceId = "tacs" // TODO

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
    async commit(commitId: string) : Promise<boolean> {
        if (this.wallet === undefined || this.client === undefined) {
            return false
        }

        const invokeTx: xrpl.Invoke = {
            TransactionType: "Invoke",
            Account: this.wallet!.classicAddress,
            Destination: this.issuerAccount,
        }
        const preparedInvokeTx = await this.client!.autofill(invokeTx)
        const signedInvokeTx = this.wallet.sign(preparedInvokeTx)

        return true // TODO: check the result of tx
    }
    async evaluateCommit(commitId: string, isApproval: boolean) : Promise<boolean> {
        // TODO
        return true
    }

    static getCheckerIdFromTaskId(taskId: string) : string | undefined {
        return rippleAddressCodec.encodeAccountID(Buffer.from(taskId.slice(0, 40), "hex")) // TODO: check validity
    }
}
