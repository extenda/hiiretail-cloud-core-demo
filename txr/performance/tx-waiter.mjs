export const createTxWaiter = (getTxById) => async (txId) => {
  const beginTime = Date.now();

  while (true) {
    const tx = await getTxById(txId);
    const totalSecondsFetching = (Date.now() - beginTime) / 1000;

    if (tx !== undefined) {
      return { time: totalSecondsFetching, tx };
    }

    if (totalSecondsFetching > 20) {
      throw new Error(
        "Cannot find tx by id for more than 20s, txId = " + txId
      );
    }
  }
}
