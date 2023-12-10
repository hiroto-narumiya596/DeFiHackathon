/**
 * A hook which implements Trier-and-Checker System (TaCS)
 * 
 * Hook Parameters:
 *     Parameter Name: {'a'}
 *     Parameter Value: The administrator <20 byte accid>
 * 
 *     Parameter Name: {'t'}
 *     Parameter Value: Initial target total supply <8 byte LE XFL>
 * 
 *     Parameter Name: {'u'}
 *     Parameter Value: Initial time unit in seconds <8 byte LE>
 * 
 *     Parameter Name: {'k'}
 *     Parameter Value: Initial inverse value of time constant (1 / tau) per time unit <8 byte LE XFL>
 * 
 *     Parameter Name: {'r'}
 *     Parameter Value: Initial checker reward ratio <8 byte LE XFL>
 * 
 * Hook State:
 *     State Key: {0..0, 't'}
 *     State Data: Current target total supply <8 byte LE XFL>
 * 
 *     State Key: {0..0, 'u'}
 *     State Data: Current time unit in seconds <8 byte LE>
 * 
 *     State Key: {0..0, 'k'}
 *     State Data: Current inverse value of time constant (1 / tau) per time unit <8 byte LE XFL>
 * 
 *     State Key: {0..0, 'r'}
 *     State Data: Current checker reward ratio <8 byte LE XFL>
 * 
 *     State Key: {0..0, 's'}
 *     State Data: Current total supply <8 byte LE XFL>
 * 
 *     State Key: {0..0, 'l'} 
 *     State Data: Current total locked supply <8 byte LE XFL>
 * 
 *     State Key: {'A', 0..0, The checker account <20 byte account id>}
 *     State Data: 
 *         The current state of permission <8 byte LE> (0x0 -> Not allowed, 0x1 -> Allowed),
 *         The number of tasks the checker created <8 byte LE>
 * 
 *     State Key: {'B', 0..0, The trier account <20 byte account id>}
 *     State Data:
 *         The number of commitments the trier created <8 byte LE>,
 *         The current balance of the trier account <8 byte LE XFL>
 * 
 *     State Key: {'T', 0..0, The checker account <20 byte account id>, The task number <8 byte LE>}
 *     State Data:
 *         The current state <8 byte LE>,
 *             (0x0 -> Closed, 0x1 -> Open)
 *         The hash of description <32 byte hash>,
 *         The time interval of the task <8 byte LE>,
 *         The number of commitments <8 byte LE>,
 *         The number of succeeded commitments <8 byte LE>
 * 
 *     State Key: {'C', 0..0, The trier account <20 byte account id>, The commitment number <8 byte LE>}
 *     State Data:
 *         The current state <8 byte LE>,
 *             (0x0 -> Unevaluated, 0x1 -> Succeeded, 0x2 -> Failed)
 *         Zero padding <4 byte>,
 *         The task id (task checker and task number) <20 byte account id + 8 byte LE>,
 *         Due <8 byte signed LE>,
 *         Trier lock <8 byte LE XFL>
 *         Trier reward rate <8 byte LE XFL>
 * 
 * Hook Invocation:
 *     ttINVOKE:
 *         First time:
 *             Behavior: Setup hook.
 * 
 *         Subsequent:
 *             Behavior: Execute a command specified in Command Name (the value of Parameter Name: {'0'})
 * 
 *             Command Name: {'M'}
 *                 Behavior: Update a meta parameter. (Only available to the admin)
 * 
 *                 Parameter Name: {'N'}
 *                 Parameter Value: The name of the parameter (1 byte)
 * 
 *                 Parameter Name: {'V'}
 *                 Parameter Value: New value <depends on the parameter value>
 * 
 *             Command Name: {'A'}
 *                 Behavior: Change the permission of a checker account.
 * 
 *                 Parameter Name: {'A'}
 *                 Parameter Value: The checker account. <20 byte accid>
 * 
 *                 Parameter Name: {'P'}
 *                 Parameter Value: The new permission. <8 byte LE> (0x0 -> Not allowed, 0x1 -> Allowed)
 * 
 *             Command Name: {'T'}
 *                 Behavior: Create a new task.
 * 
 *                 Parameter Name: {'H'}
 *                 Parameter Value: The hash of description. <32 byte hash>
 * 
 *                 Parameter Name: {'T'}
 *                 Parameter Value: The time interval <8 byte LE>
 * 
 *             Command Name: {'U'}
 *                 Behavior: Update the state of a task. (Only available to the checker of the task)
 * 
 *                 Parameter Name: {'S'}
 *                 Parameter Value: The new state of the task <8 byte LE> (0x0 -> Closed, 0x1 -> Open)
 * 
 *                 Parameter Name: {'I'}
 *                 Parameter Value: The ID of the task (The task checker and the task number) <28 bytes>
 * 
 *             Command Name: {'C'}
 *                 Behavior: Create a new commitment.
 * 
 *                 Parameter Name: {'I'}
 *                 Parameter Value: The ID of the task <28 bytes>
 * 
 *                 Parameter Name: {'L'}
 *                 Parameter Value: The amount of token to lock. <8 byte LE XFL>
 * 
 *            Command Name: {'E'}
 *                Behavior: Evaluate a commitment (Only available to the checker of the commitment) 
 * 
 *                 Parameter Name: {'I'}
 *                 Parameter Value: The ID of the commitment (The commitment trier and the commitment number) <28 bytes>
 * 
 *                Parameter Name: {'R'}
 *                Parameter Value: The result of the commitment. <8 byte LE> (0x1 -> Succeeded, 0x2 -> Failed)
 * 
 *     ttPayment:
 *         Behavior: Add some token to the balance as a trier.
 *         DestinationTag: 0x53436154U ("TaCS" in LE ASCII)
 * 
 **/


#include "hookapi.h"

#define PAY_TX_TAG 0x53436154U // "TaCS" in LE ASCII
#define TOKEN_CODE "TCS"

#define NOPE(x)\
{\
    return rollback((x), sizeof(x), __LINE__);\
}

#define COPYBUF(buf1, buf2, num)\
{\
    for(int x = 0; GUARD(num), x < num; ++x)\
        ((uint8_t *)(buf2))[x] = ((uint8_t *)(buf1))[x];\
}

#define UINT64_TO_XFL_ROUND(ui0, xfl)\
{\
    uint32_t ui = ui0;\
    ui = ui | (ui >> 1);\
    ui = ui | (ui >> 2);\
    ui = ui | (ui >> 4);\
    ui = ui | (ui >> 8);\
    ui = ui | (ui >> 16);\
    ui = ui | (ui >> 32);\
    uint32_t di = (ui ^ (ui >> 1)) >> 31;\
    xfl = di > 0 ? float_mulratio(float_mulratio(float_one(), 0, (uint32_t)(ui0 / (uint64_t)di), 1UL), 0, di, 1UL) : float_mulratio(float_one(), 0, ui0, 1UL);\
}

int64_t hook(uint32_t reserved) {
    _g(1, 1);
    etxn_reserve(2);

    uint8_t hook_accid[20];
    hook_account(hook_accid, 20);

    uint8_t account_field[20];
    int32_t account_field_len = otxn_field(SBUF(account_field), sfAccount);
    if (account_field_len < 20) {
        rollback(SBUF("Tacs: The account field is missing."), 1);
    }

    int64_t tt = otxn_type();

    int acc_cmp_incoming = 0; ACCOUNT_COMPARE(acc_cmp_incoming, hook_accid, account_field);
    if (acc_cmp_incoming) {
        // Incoming txn
        if (tt == ttINVOKE) {
            // Check if this ttINVOKE is the first one
            int64_t admin_count = state(0, 0, "a", 1);
            if (admin_count == DOESNT_EXIST) {
                // The first invoke

                // Load initial parameters
                uint8_t first_a[20];
                uint64_t first_u;
                int64_t first_t, first_k, first_r;
                uint64_t first_zero = 0ULL;

                ASSERT(hook_param(SBUF(first_a), "a", 1) > 0);
                ASSERT(hook_param(SVAR(first_t), "t", 1) > 0);
                ASSERT(hook_param(SVAR(first_u), "u", 1) > 0);
                ASSERT(hook_param(SVAR(first_k), "k", 1) > 0);
                ASSERT(hook_param(SVAR(first_r), "r", 1) > 0);

                ASSERT(state_set(SBUF(first_a), "a", 1) > 0);
                ASSERT(state_set(SVAR(first_t), "t", 1) > 0);
                ASSERT(state_set(SVAR(first_u), "u", 1) > 0);
                ASSERT(state_set(SVAR(first_k), "k", 1) > 0);
                ASSERT(state_set(SVAR(first_r), "r", 1) > 0);

                ASSERT(state_set(SVAR(first_zero), "s", 1) > 0);
                ASSERT(state_set(SVAR(first_zero), "l", 1) > 0);

                DONE("Tacs: Successfully initialized.");
            }

            // Subsequent invokes

            // Read the command name(param "0")
            uint8_t command_name[32];
            REQUIRE(otxn_param(SBUF(command_name), "0", 1) > 0, "Tacs: The command name is not specified.");

            switch (command_name[0]) {
                case 'M': {
                    // Update a meta parameter

                    // Check if the caller is the admin
                    uint8_t admin_accid[20];
                    ASSERT(state(SBUF(admin_accid), "a", 1) > 0);
                    int acc_cmp = 0; ACCOUNT_COMPARE(acc_cmp, admin_accid, account_field);
                    REQUIRE(!acc_cmp, "Tacs: The meta parameters can be modified only by the admin.");

                    // Set the parameter
                    uint8_t meta_name;
                    uint64_t meta_val;
                    REQUIRE(otxn_param(SVAR(meta_name), "N", 1) > 0, "Tacs: The parameter name is not specified.");
                    REQUIRE(meta_name == 't' || meta_name == 'u' || meta_name == 'k' || meta_name == 'r', "Tacs: The parameter name is incorrect.");
                    REQUIRE(otxn_param(SVAR(meta_val), "V", 1) > 0, "Tacs: The parameter value is not specified.");
                    ASSERT(state_set(SVAR(meta_val), &meta_name, 1));

                    DONE("Tacs: The parameter is successfully updated.");
                    break;
                }
                case 'A': {
                    // Change the permission of a checker account

                    // Check if the caller is the admin
                    uint8_t admin_accid[20];
                    ASSERT(state(SBUF(admin_accid), "a", 1) > 0);
                    int acc_cmp = 0; ACCOUNT_COMPARE(acc_cmp, admin_accid, account_field);
                    REQUIRE(!acc_cmp, "Tacs: The checker permission can be modified only by the admin.");

                    // Set the checker permission
                    uint8_t checker_accid[20];
                    uint64_t checker_permission;
                    REQUIRE(otxn_param(SBUF(checker_accid), "A", 1) > 0, "Tacs: The checker account is not specified.");
                    REQUIRE(otxn_param(SVAR(checker_permission), "P", 1) > 0, "Tacs: The new permission is not specified.");

                    uint8_t checker_s_key[32];
                    checker_s_key[0] = 'A';
                    for (int i = 1; GUARD(11), i < 12; ++i)
                        checker_s_key[i] = '\0';
                    COPYBUF(checker_accid, checker_s_key + 12, 20);

                    uint64_t checker_data[2];
                    int64_t result = state(SBUF(checker_data), SBUF(checker_s_key));
                    ASSERT(result > 0 || result == DOESNT_EXIST);
                    if (result == DOESNT_EXIST) {
                        checker_data[0] = 0ULL;
                        checker_data[1] = 0ULL;
                    }
                    checker_data[0] = checker_permission;
                    ASSERT(state_set(SBUF(checker_data), SBUF(checker_s_key)) > 0);
                
                    DONE("Tacs: The checker permission is successfully updated.");
                    break;
                }
                case 'T': {
                    // Create a task

                    // Check if the caller is a checker
                    uint8_t checker_s_key[32];
                    checker_s_key[0] = 'A';
                    for (int i = 1; GUARD(11), i < 12; ++i)
                        checker_s_key[i] = '\0';
                    COPYBUF(account_field, checker_s_key + 12, 20);
                    uint64_t checker_data[2];
                    REQUIRE(state(SBUF(checker_data), SBUF(checker_s_key)) > 0, "Tacs: The checker data is not found.");
                    REQUIRE(checker_data[0] == 1ULL, "Tacs: Only checkers can create tasks.");
                    ASSERT(checker_data[1] < UINT64_MAX);

                    // Load otxn parameters
                    uint8_t task_desc_hash[32];
                    uint64_t task_time;
                    REQUIRE(otxn_param(SBUF(task_desc_hash), "H", 1) > 0, "Tacs: The hash of the task is missing.");
                    REQUIRE(otxn_param(SVAR(task_time), "T", 1) > 0, "Tacs: The time interval of the task is missing.");

                    // Create a new task 
                    uint8_t task_s_key[32];
                    task_s_key[0] = 'T';
                    for (int i = 1; GUARD(3), i < 4; ++i)
                        task_s_key[i] = '\0';
                    COPYBUF(account_field, task_s_key + 4, 20);
                    COPYBUF(checker_data + 1, task_s_key + 24, 8);
                    TRACEHEX(task_s_key);

                    uint8_t task_s_data[64];
                    *((uint64_t *)task_s_data) = 1ULL;
                    COPYBUF(task_desc_hash, task_s_data + 8, 32);
                    COPYBUF(&task_time, task_s_data + 40, 8);
                    *((uint64_t *)(task_s_data + 48)) = 0ULL;
                    *((uint64_t *)(task_s_data + 56)) = 0ULL;

                    ASSERT(state_set(SBUF(task_s_data), SBUF(task_s_key)) > 0);

                    // Set checker state
                    checker_data[1]++;
                    ASSERT(state_set(SBUF(checker_data), SBUF(checker_s_key)));

                    DONE("Tacs: The task is added.");
                    break;
                }
                case 'U': {
                    // Update the state of a task
                    
                    // Load otxn parameters
                    uint64_t task_new_state;
                    uint8_t task_id[28];
                    REQUIRE(otxn_param(SVAR(task_new_state), "S", 1) > 0, "Tacs: the new state of the task is missing");
                    REQUIRE(otxn_param(SBUF(task_id), "I", 1) > 0, "Tacs: the id of the task is missing");
                    REQUIRE(task_new_state < 2, "Tacs: Invalid task state.");

                    // Check the condition
                    int acc_cmp; ACCOUNT_COMPARE(acc_cmp, task_id, account_field);
                    REQUIRE(!acc_cmp, "Tacs: The task's state can be modified only by its checker.");

                    // Load the task state
                    uint8_t task_s_key[32];
                    task_s_key[0] = 'T';
                    for (int i = 1; GUARD(3), i < 4; ++i)
                        task_s_key[i] = '\0';
                    COPYBUF(task_id, task_s_key + 4, 28);

                    uint8_t task_s_data[64];
                    int result = state(SBUF(task_s_data), SBUF(task_s_key));
                    ASSERT(result > 0 || result == DOESNT_EXIST);
                    REQUIRE(result != DOESNT_EXIST, "Tacs: The task id is invalid.");

                    COPYBUF(&task_new_state, task_s_data, 8);
                    ASSERT(state_set(SBUF(task_s_data), SBUF(task_s_key)) > 0);

                    DONE("Tacs: The task state is updated.");
                    break;
                }
                case 'C': {
                    // Create a new commitment

                    // Load otxn parameters
                    uint8_t commit_task_id[28];
                    int64_t commit_lock_amount;
                    REQUIRE(otxn_param(SBUF(commit_task_id), "I", 1) > 0, "Tacs: The id of the task is missing");
                    REQUIRE(otxn_param(SVAR(commit_lock_amount), "L", 1) > 0, "Tacs: The lock amount is missing");
                    TRACEXFL(commit_lock_amount);//debug

                    // Load state parameters
                    uint8_t trier_s_key[32];
                    trier_s_key[0] = 'B';
                    for (int i = 1; GUARD(11), i < 12; ++i)
                        trier_s_key[i] = '\0';
                    COPYBUF(account_field, trier_s_key + 12, 20);
                    uint64_t trier_s_data[2];
                    REQUIRE(state(SBUF(trier_s_data), SBUF(trier_s_key)) > 0, "Tacs: The trier balance is not created.");
                    ASSERT(trier_s_data[0] < UINT64_MAX);
                    int32_t cmp_res = float_compare((int64_t)trier_s_data[1], commit_lock_amount, COMPARE_GREATER | COMPARE_EQUAL);
                    if (cmp_res == 0) {
                        NOPE("Tacs: The trier balance is insufficient to lock");
                    } else if (cmp_res < 0) {
                        NOPE("Tacs: Invalid lock amount");
                    }

                    uint8_t task_s_key[32];
                    task_s_key[0] = 'T';
                    for (int i = 1; GUARD(3), i < 4; ++i)
                        task_s_key[i] = '\0';
                    COPYBUF(commit_task_id, task_s_key + 4, 28);

                    uint8_t task_s_data[64];
                    int result = state(SBUF(task_s_data), SBUF(task_s_key));
                    ASSERT(result > 0 || result == DOESNT_EXIST);
                    REQUIRE(result != DOESNT_EXIST, "Tacs: The task id is invalid.");

                    // Check the task is open
                    REQUIRE(*((uint64_t *)task_s_data) == 1ULL, "Tacs: The task is currently closed.");

                    // Calculate commit due
                    int64_t task_time, last_time;
                    last_time = ledger_last_time();
                    COPYBUF(task_s_data + 40, &task_time, 8);
                    ASSERT(task_time >= 0 && INT64_MAX - task_time > last_time);
                    int64_t commit_due = last_time + task_time;

                    // Calculate trier reward
                    int64_t total_supply, total_locked, target_supply, k_val, checker_reward_ratio;
                    uint64_t time_unit;
                    ASSERT(state(SVAR(total_supply), "s", 1) > 0);
                    ASSERT(state(SVAR(total_locked), "l", 1) > 0);
                    ASSERT(state(SVAR(target_supply), "t", 1) > 0);
                    ASSERT(state(SVAR(time_unit), "u", 1) > 0);
                    ASSERT(state(SVAR(k_val), "k", 1) > 0);
                    ASSERT(state(SVAR(checker_reward_ratio), "r", 1) > 0);
                    total_locked = float_sum(total_locked, commit_lock_amount);

                    int64_t commit_num; UINT64_TO_XFL_ROUND(*((uint64_t *)(task_s_data + 48)), commit_num);
                    int64_t commit_suc; UINT64_TO_XFL_ROUND(*((uint64_t *)(task_s_data + 56)), commit_suc);
                    int64_t prob_suc = float_divide(float_sum(float_one(), commit_suc), float_sum(float_one(), float_sum(float_one(), commit_num)));

                    uint64_t commit_interval_num = task_time / time_unit;
                    ASSERT(commit_interval_num <= UINT32_MAX);

                    int64_t commit_trier_reward_rate = float_mulratio(float_divide(float_sum(float_multiply(k_val, float_divide(float_sum(target_supply, float_negate(total_supply)), total_locked)), float_sum(float_one(), float_negate(prob_suc))), float_sum(prob_suc, checker_reward_ratio)), 0, (uint32_t)commit_interval_num, 1UL);
                    TRACEXFL(prob_suc); //debug
                    TRACEXFL(total_locked); //debug
                    TRACEXFL(commit_trier_reward_rate); //debug
                    TRACEXFL(checker_reward_ratio); //debug

                    // Set commit state
                    uint8_t commit_s_key[32];
                    commit_s_key[0] = 'C';
                    for (int i = 1; GUARD(3), i < 4; ++i)
                        commit_s_key[i] = '\0';
                    COPYBUF(account_field, commit_s_key + 4, 20);
                    COPYBUF(trier_s_data, commit_s_key + 24, 8);
                    TRACEHEX(commit_s_key);

                    uint8_t commit_s_data[64];
                    *((uint64_t *)commit_s_data) = 0ULL;
                    for (int i = 8; GUARD(4), i < 12; ++i)
                        commit_s_data[i] = '\0';
                    COPYBUF(commit_task_id, commit_s_data + 12, 28);
                    COPYBUF(&commit_due, commit_s_data + 40, 8);
                    COPYBUF(&commit_lock_amount, commit_s_data + 48, 8);
                    COPYBUF(&commit_trier_reward_rate, commit_s_data + 56, 8);

                    ASSERT(state_set(SBUF(commit_s_data), SBUF(commit_s_key)) > 0);

                    // Set trier state
                    trier_s_data[0]++;
                    trier_s_data[1] -= commit_lock_amount;
                    ASSERT(state_set(SBUF(trier_s_data), SBUF(trier_s_key)));

                    // Update total locked supply
                    ASSERT(state_set(SVAR(total_locked), "l", 1) > 0);

                    DONE("Tacs: The commitment is created.");
                    break;
                }
                case 'E': {
                    // Evaluate a commitment

                    // Load otxn parameters
                    uint8_t eval_commit_id[28];
                    uint64_t eval_commit_result;
                    REQUIRE(otxn_param(SBUF(eval_commit_id), "I", 1) > 0, "Tacs: the id of the commitment is missing");
                    REQUIRE(otxn_param(SVAR(eval_commit_result), "R", 1) > 0, "Tacs: the result of the commitment is missing");
                    REQUIRE(eval_commit_result == 0x1 || eval_commit_result == 0x2, "Tacs: Invalid commitment result.");

                    // Load state parameters
                    int64_t checker_reward_ratio;
                    ASSERT(state(SVAR(checker_reward_ratio), "r", 1) > 0);

                    uint8_t commit_s_key[32];
                    commit_s_key[0] = 'C';
                    for (int i = 1; GUARD(3), i < 4; ++i)
                        commit_s_key[i] = '\0';
                    COPYBUF(eval_commit_id, commit_s_key + 4, 28);

                    uint8_t commit_s_data[64];
                    REQUIRE(state(SBUF(commit_s_data), SBUF(commit_s_key)) > 0, "Tacs: The commitment is not found");

                    uint8_t task_s_key[32];
                    task_s_key[0] = 'T';
                    for (int i = 1; GUARD(3), i < 4; ++i)
                        task_s_key[i] = '\0';
                    COPYBUF(commit_s_data + 12, task_s_key + 4, 28);

                    uint8_t task_s_data[64];
                    int result = state(SBUF(task_s_data), SBUF(task_s_key));
                    ASSERT(result > 0);

                    // Check if the caller is the checker
                    int acc_cmp; ACCOUNT_COMPARE(acc_cmp, (commit_s_data + 12), account_field);
                    REQUIRE(!acc_cmp, "Tacs: Only the checker can evaluate the commitment.");

                    // Check if the commitment is not evaluated
                    REQUIRE(*((uint64_t *)commit_s_data) == 0x0ULL, "Tacs: The commitment is already evaluated.");

                    // Record the result
                    COPYBUF(&eval_commit_result, commit_s_data, 8);
                    ASSERT(*((uint64_t *)(task_s_data + 48)) < UINT64_MAX);
                    (*((uint64_t *)(task_s_data + 48)))++;
                    if ( eval_commit_result == 0x1) {
                        (*((uint64_t *)(task_s_data + 56)))++;
                    }
                    ASSERT(state_set(SBUF(commit_s_data), SBUF(commit_s_key)));
                    ASSERT(state_set(SBUF(task_s_data), SBUF(task_s_key)));

                    // Calculate the returns
                    int64_t trier_lock = *((int64_t *)(commit_s_data + 48));
                    int64_t trier_reward_rate = *((int64_t *)(commit_s_data + 56));

                    int64_t trier_return = float_multiply(trier_lock, float_sum(float_one(), trier_reward_rate));
                    int64_t checker_return = float_multiply(trier_lock, float_multiply(trier_reward_rate, checker_reward_ratio));

                    TRACEXFL(trier_lock);//debug
                    TRACEXFL(trier_reward_rate);//debug
                    TRACEXFL(trier_return);//debug
                    TRACEXFL(checker_return);//debug

                    uint8_t cur1[3] = {'T', 'C', 'S'};

                    uint8_t checker_return_amt[48]; // Amount format
                    uint8_t checker_return_amt_f[49]; // Amount format

                    int64_t checker_f = float_sto(SBUF(checker_return_amt_f), SBUF(cur1), SBUF(hook_accid), checker_return, sfAmount);

                    COPYBUF(checker_return_amt_f + 1, checker_return_amt, 48);

                    // Give the checker reward
                    uint8_t tx_checker[PREPARE_PAYMENT_SIMPLE_TRUSTLINE_SIZE];
                    PREPARE_PAYMENT_SIMPLE_TRUSTLINE(tx_checker, checker_return_amt, account_field, 0, 0);

                    uint8_t tx_checker_result[32];
                    REQUIRE(emit(SBUF(tx_checker_result), tx_checker, PREPARE_PAYMENT_SIMPLE_TRUSTLINE_SIZE) > 0, "Tacs: checker emission failed");

                    // Give the trier return if the task is successful
                    if (eval_commit_result == 0x1) {

                        uint8_t trier_return_amt[48]; // Amount format
                        uint8_t trier_return_amt_f[49]; // Amount format

                        int64_t trier_f = float_sto(SBUF(trier_return_amt_f), SBUF(cur1), SBUF(hook_accid), trier_return, sfAmount);

                        COPYBUF(trier_return_amt_f + 1, trier_return_amt, 48);

                        // Give the trier reward
                        uint8_t tx_trier[PREPARE_PAYMENT_SIMPLE_TRUSTLINE_SIZE];
                        PREPARE_PAYMENT_SIMPLE_TRUSTLINE(tx_trier, trier_return_amt, eval_commit_id, 0, 0);

                        uint8_t tx_trier_result[32];
                        REQUIRE(emit(SBUF(tx_trier_result), SBUF(tx_trier)) > 0, "Tacs: trier emission failed");
                    }

                    // Update total supply and total locked supply
                    int64_t total_supply, total_locked;
                    ASSERT(state(SVAR(total_supply), "s", 1) > 0);
                    ASSERT(state(SVAR(total_locked), "l", 1) > 0);


                    total_supply = float_sum(total_supply, trier_return);
                    total_supply = float_sum(total_supply, checker_return);
                    total_supply = float_sum(total_supply, float_negate(trier_lock));
                    total_locked = float_sum(total_supply, float_negate(trier_lock));
                    ASSERT(state_set(SVAR(total_supply), "s", 1) > 0);
                    DONE("Tacs: The commitment is evaluated.");
                    break;
                }
            }
            DONE("Tacs: Invalid command.");
        } else if (tt == ttPAYMENT) {
            // Assert that the initalization is already done
            ASSERT(state(0, 0, "a", 1) != DOESNT_EXIST);

            // Check DestinationTag
            uint32_t dest_tag;
            if (otxn_field(SVAR(dest_tag), sfDestinationTag) > 0 && dest_tag == PAY_TX_TAG) {
                // Load state parameters
                uint8_t trier_s_key[32];
                trier_s_key[0] = 'B';
                for (int i = 1; GUARD(11), i < 12; ++i)
                    trier_s_key[i] = '\0';
                COPYBUF(account_field, trier_s_key + 12, 20);
                uint64_t trier_s_data[2];
                int result_p = state(SBUF(trier_s_data), SBUF(trier_s_key));
                ASSERT(result_p > 0 || result_p == DOESNT_EXIST);
                if (result_p == DOESNT_EXIST) {
                    // Create a balance
                    trier_s_data[0] = 0ULL;
                    trier_s_data[1] = 0ULL;
                }

                // Load otxn fields
                uint8_t pay_amt[48]; // Amount type
                int pay_bytes = otxn_field(SBUF(pay_amt), sfAmount);
                if (pay_bytes == 48) {
                    // Token payment

                    // Check payment code
                    ASSERT((pay_amt[0] & (1 << 7)));
                    int equal; BUFFER_EQUAL(equal, pay_amt + 12, TOKEN_CODE, 3);
                    if (equal) {
                        int64_t pay_val =  INT64_FROM_BUF(pay_amt) & ~(1LL << 63);
                        trier_s_data[1] = float_sum(trier_s_data[1], pay_val);

                        ASSERT(state_set(SBUF(trier_s_data), SBUF(trier_s_key)) > 0);

                        DONE("Tacs: The payment to trier balance is finished.");
                    }
                } else if (pay_bytes > 0) {
                    // XRP payment (XRP is automatically exchanged with token)
                    uint64_t pay_drops = UINT64_FROM_BUF(pay_amt) & ~(3ULL << 62);
                    int64_t pay_val; UINT64_TO_XFL_ROUND(pay_drops, pay_val);
                    pay_val = float_mulratio(pay_val, 0, 1UL, 1000000UL);
                    trier_s_data[1] = float_sum(trier_s_data[1], pay_val);

                    ASSERT(state_set(SBUF(trier_s_data), SBUF(trier_s_key)) > 0);

                    // Update total supply
                    int64_t total_supply;
                    ASSERT(state(SVAR(total_supply), "s", 1) > 0);
                    total_supply = float_sum(total_supply, pay_val);
                    ASSERT(state_set(SVAR(total_supply), "s", 1) > 0);

                    DONE("Tacs: The payment to trier balance (via native token) is finished.");
                }
                NOPE("Tacs: Invalid payment.");
            }

            DONE("Tacs: Normal payment.");
        }
        DONE("Tacs: Normal incoming transaction.");
    } else {
        // Outgoing txn
        DONE("Tacs: Outgoing transaction.");
    }

    // unreachable
    return 0;
}
/*
int64_t cbak(uint32_t what) {
    TRACEVAR(what); //debug
    return 0;
}
*/
