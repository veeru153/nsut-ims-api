import express from 'express';
import ims from '../IMS.js';

const router = express.Router();

router.get('/notices', async (req, res) => {
    const notices = await ims.fetchNotices();
    res.json(notices);
})

export default router;