import express from 'express';
import * as routes from './routes/index.js';
import root from './routes/root.js';
import dotenv from 'dotenv';
import ims from './IMS.js';

dotenv.config();
ims.login(process.env.UID, process.env.PASS);

const app = express();
const PORT = process.env.PORT || 3000;

for(let r in routes) {
    app.use('/', routes[r]);
}

app.get('/', (req, res) => {
    res.json(root);
})

app.listen(PORT, () => console.log(`Server Started on PORT: ${PORT}`))
