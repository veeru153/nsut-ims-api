import express from 'express';
import ims from '../IMS.js';

const router = express.Router();

router.get('/attendance', async (req, res) => {
    const year = req.query.year;
    const sem = req.query.sem;
    const fullReport = (req.query?.fullReport === "true");
    const report = await ims.getAttendance(year, sem, fullReport);
    if(fullReport) {
        res.setHeader('Content-Type', 'text/html');
        res.send(report);
    } else {
        res.json(report);
    }
})

export default router;