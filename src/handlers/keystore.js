class KeystoreHandler {
  constructor(keystore) {
    this.keystore = keystore;
  }

  handle = async (_, res) => {
    res.json(this.keystore.toJWKS(false));
  };
}

export default KeystoreHandler;
