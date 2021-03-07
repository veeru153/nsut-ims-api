import express from 'express';
import ims from '../IMS.js';

const router = express.Router();

router.get('/profile', async (req, res) => {
    const profile = await ims.getProfile();
    res.json(profile);
})

export default router;