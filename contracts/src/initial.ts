import {
    Invoke,
    TrustSet,
    SetHookFlags,
    TransactionMetadata,
    convertStringToHex,
} from '@transia/xrpl'
import {
    createHookPayload,
    setHooksV3,
    SetHookParams,
    Xrpld,
    ExecutionUtility,
} from '@transia/hooks-toolkit'
import {
    XrplIntegrationTestContext,
    serverUrl,
    setupClient,
    teardownHook,
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
    const carolWallet = testContext.carol

    // Initial parameters
    const aliceAccountIdHex = rippleAddressCodec.decodeAccountID(aliceWallet.classicAddress).toString('hex').toUpperCase()
    const targetSupplyHex = xflToHex(xfl.XFL("-10000")) // Actually +10000
    const timeUnitHex = bi64ToHex(10n)
    const kValHex = xflToHex(xfl.XFL("-0.005")) // Actually +0.005
    const checkerRewardRatioHex = xflToHex(xfl.XFL("-0.1")) // Actually +0.1

    // Tear down all hooks
    teardownHook(testContext, [hook1Wallet])

    // Create a hook payload
    const hook = createHookPayload(
        0,
        'tacs',
        'tacs',
        SetHookFlags.hsfOverride,
        ['Invoke', 'Payment'],
        [
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("a"),
                    HookParameterValue: aliceAccountIdHex
                },
            },
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("t"),
                    HookParameterValue: targetSupplyHex
                },
            },
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("u"),
                    HookParameterValue: timeUnitHex
                },
            },
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("k"),
                    HookParameterValue: kValHex
                },
            },
            {
                HookParameter: {
                    HookParameterName: convertStringToHex("r"),
                    HookParameterValue: checkerRewardRatioHex
                },
            }
        ],
    )

    // Set the hooks
    await setHooksV3({
        client: testContext.client,
        seed: testContext.hook1.seed,
        hooks: [{ Hook: hook }],
    } as SetHookParams)

    // The first invoke transaction
    const firstInvokeTx: Invoke = {
        TransactionType: 'Invoke',
        Account: aliceWallet.classicAddress,
        Destination: hook1Wallet.classicAddress,
    }
    const firstInvokeResult = await Xrpld.submit(testContext.client, {
        wallet: aliceWallet,
        tx: firstInvokeTx,
    })
    const firstInvokeHookExecutions = await ExecutionUtility.getHookExecutionsFromMeta(
        testContext.client,
        firstInvokeResult.meta as TransactionMetadata
    )
    console.log(firstInvokeHookExecutions.executions[0].HookReturnString)

    // Bob's TrustSet
    const bobTrustSetTx: TrustSet = {
        TransactionType: 'TrustSet',
        Account: bobWallet.classicAddress,
        LimitAmount: {
            "currency": "TCS",
            "issuer": hook1Wallet.classicAddress,
            "value": "1000000000000",
        }
    }
    const bobTrustSetResult = await Xrpld.submit(testContext.client, {
        wallet: bobWallet,
        tx: bobTrustSetTx,
    })

    // Carol's TrustSet
    const carolTrustSetTx: TrustSet = {
        TransactionType: 'TrustSet',
        Account: carolWallet.classicAddress,
        LimitAmount: {
            "currency": "TCS",
            "issuer": hook1Wallet.classicAddress,
            "value": "1000000000000",
        }
    }
    const carolTrustSetResult = await Xrpld.submit(testContext.client, {
        wallet: carolWallet,
        tx: carolTrustSetTx,
    })

    // Disconnect from the XRPL test context
    await testContext.client.disconnect()
}

// Call the main function
main()