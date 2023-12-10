import {
    Payment,
    Invoke,
    TransactionMetadata,
    convertStringToHex,
    xrpToDrops,
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
    const carolWallet = testContext.carol

    const taskHex = "F51DFC2A09D62CBBA1DFBDD4691DAC96AD98B90F0000000000000000" // Bob's first task

    // The payment transaction from carol to hook1
    const paymentTx: Payment = {
        TransactionType: 'Payment',
        Account: carolWallet.classicAddress,
        Destination: hook1Wallet.classicAddress,
        Amount: xrpToDrops(10),
        DestinationTag: 0x54614353 // "TaCS"
    }
    const paymentResult = await Xrpld.submit(testContext.client, {
        wallet: carolWallet,
        tx: paymentTx,
    })
    const paymentHookExecutions = await ExecutionUtility.getHookExecutionsFromMeta(
        testContext.client,
        paymentResult.meta as TransactionMetadata
    )
    console.log(paymentHookExecutions.executions[0].HookReturnString)

    // The invoke transaction for carol to create a commitment
    const invokeTx: Invoke = {
        TransactionType: 'Invoke',
        Account: carolWallet.classicAddress,
        Destination: hook1Wallet.classicAddress,
        HookParameters: [
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("0"),
                    HookParameterValue: convertStringToHex("C")
                }
            },
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("I"),
                    HookParameterValue: taskHex
                }
            },
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("L"),
                    HookParameterValue: xflToHex(xfl.XFL("-10")) // Actually +10
                }
            },
        ]
    }
    const invokeResult = await Xrpld.submit(testContext.client, {
        wallet: carolWallet,
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