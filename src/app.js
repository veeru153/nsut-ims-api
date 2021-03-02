import express from 'express';
import * as routes from './routes/index.js';
import rootRes from './routes/rootRes.js';

const app = express();
const PORT = process.env.PORT || 3000;

for(let r in routes) {
    app.use('/', routes[r]);
}

app.get('/', (req, res) => {
    res.json(rootRes);
})

app.listen(PORT, () => console.log(`Server Started on PORT: ${PORT}`))
