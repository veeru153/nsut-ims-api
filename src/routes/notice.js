import express from 'express';
import ims from '../IMS.js';

const router = express.Router();

router.get('/notice/*', async (req, res) => {
    const link = req.params[0];
    try {
        const fileStream = await ims.getNotice(link);
        const fileDispos = fileStream.headers['content-disposition'];
        const fileName = fileDispos.substring( fileDispos.indexOf('filename=') + 10, fileDispos.length - 2);
        console.log(fileName)
        res.attachment(fileName);
        fileStream.data.pipe(res);
    } catch (e) {
        console.log(e);
    }
})

export default router;