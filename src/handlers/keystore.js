class KeystoreHandler {
  handle = async (req, res) => {
    const { ctx: { keystore } } = req;
    res.json(keystore.toJWKS(false));
  };
}

export default KeystoreHandler;
