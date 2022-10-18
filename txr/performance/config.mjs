export const LOAD_TEST_NAME = 'load-test-v1-15-4-5s-1';
export const TXS_PER_BATCH = 15;
export const BATCHES_PER_S = 4;
export const N_TRANSACTIONS_TO_SEND = TXS_PER_BATCH * BATCHES_PER_S * 5;

export const indexToTxId = (index) => `${LOAD_TEST_NAME}-${index + 1}`;
