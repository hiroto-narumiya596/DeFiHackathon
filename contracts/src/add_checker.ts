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

export async function main(): Promise<void> {
    // Initialize the XRPL context
    const testContext = (await setupClient(serverUrl)) as XrplIntegrationTestContext

    // Initial accounts
    const hook1Wallet = testContext.hook1
    const aliceWallet = testContext.alice
    const bobWallet = testContext.bob

    // The invoke transaction to add Bob to checker
    const invokeTx: Invoke = {
        TransactionType: 'Invoke',
        Account: aliceWallet.classicAddress,
        Destination: hook1Wallet.classicAddress,
        HookParameters: [
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("0"),
                    HookParameterValue: convertStringToHex("A")
                }
            },
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("A"),
                    HookParameterValue: rippleAddressCodec.decodeAccountID(bobWallet.classicAddress).toString('hex').toUpperCase()
                }
            },
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("P"),
                    HookParameterValue: bi64ToHex(1n)
                }
            },
        ]
    }
    const invokeResult = await Xrpld.submit(testContext.client, {
        wallet: aliceWallet,
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