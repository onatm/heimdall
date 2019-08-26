class KeystoreHandler {
  constructor(store) {
    this.store = store;
  }

  handle = async (_, res) => {
    res.json(this.store.getPublicJWKS());
  };
}

export default KeystoreHandler;
