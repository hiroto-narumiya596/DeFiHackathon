import {
    Invoke,
    TransactionMetadata,
    convertStringToHex,
} from '@transia/xrpl'
import {
    Xrpld,
    ExecutionUtility,
} from '@transia/hooks-toolkit'
import {
    XrplIntegrationTestContext,
    serverUrl,
    setupClient,
    ledgerAccept,
} from '@transia/hooks-toolkit/dist/npm/src/libs/xrpl-helpers'
import * as rippleAddressCodec from 'ripple-address-codec'

//@ts-ignore
import * as xfl from '@xrplkit/xfl'

import {
    xflToHex,
    bi64ToHex
} from './utils/util'

//@ts-ignore
import sha256 from 'crypto-js/sha256'

export async function main(): Promise<void> {
    // Initialize the XRPL context
    const testContext = (await setupClient(serverUrl)) as XrplIntegrationTestContext

    // Initial accounts
    const hook1Wallet = testContext.hook1
    const aliceWallet = testContext.alice
    const bobWallet = testContext.bob

    const commitHex: string = "B389FBCED0AF9DCDFF62900BFAEFA3EB872D8A960000000000000000" // Carol's first commitment

    // The invoke transaction to create a task
    const invokeTx: Invoke = {
        TransactionType: 'Invoke',
        Account: bobWallet.classicAddress,
        Destination: hook1Wallet.classicAddress,
        HookParameters: [
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("0"),
                    HookParameterValue: convertStringToHex("E")
                }
            },
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("I"),
                    HookParameterValue: commitHex
                }
            },
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("R"),
                    HookParameterValue: bi64ToHex(1n) // Success
                }
            },
        ]
    }
    const invokeResult = await Xrpld.submit(testContext.client, {
        wallet: bobWallet,
        tx: invokeTx,
    })
    const invokeHookExecutions = await ExecutionUtility.getHookExecutionsFromMeta(
        testContext.client,
        invokeResult.meta as TransactionMetadata
    )
    console.log(invokeHookExecutions.executions[0].HookReturnString)

    await ledgerAccept(testContext.client)

    // Disconnect from the XRPL test context
    await testContext.client.disconnect()
}

// Call the main function
main()
