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

    const taskHash: string = sha256("Test").toString().toUpperCase()

    // The invoke transaction to create a task
    const invokeTx: Invoke = {
        TransactionType: 'Invoke',
        Account: bobWallet.classicAddress,
        Destination: hook1Wallet.classicAddress,
        HookParameters: [
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("0"),
                    HookParameterValue: convertStringToHex("T")
                }
            },
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("H"),
                    HookParameterValue: taskHash
                }
            },
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("T"),
                    HookParameterValue: bi64ToHex(30n)
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

    // Disconnect from the XRPL test context
    await testContext.client.disconnect()
}

// Call the main function
main()