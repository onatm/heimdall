import express from 'express';
import handleDiscovery from '../handlers/discovery';

const router = express.Router();

router.get('/.well-known/openid-configuration', handleDiscovery);
router.get('/token', (req, res) => res.send({ hello: "world!" }));
router.get('/keys', (req, res) => res.send({ hello: "world!" }));
router.get('/userinfo', (req, res) => res.send({ hello: "world!" }));
router.get('/auth', (req, res) => res.send({ hello: "world!" }));
router.get('/auth/:upstream', (req, res) => res.send({ hello: "world!" }));
router.get('/auth/callback', (req, res) => res.send({ hello: "world!" }));
router.get('/auth/callback/:upstream', (req, res) => res.send({ hello: "world!" }));
router.get('/approval', (req, res) => res.send({ hello: "world!" }));
router.get('/healthz', (req, res) => res.send({ hello: "world!" }));

export default router;