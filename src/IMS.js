import Axios from 'axios';
import cheerio from 'cheerio';

import { parseDate } from './util.js';


const url = "https://www.imsnsit.org/imsnsit/notifications.php";
const axios = Axios.create({
    baseURL: "https://www.imsnsit.org/imsnsit",
});

class IMS {
    async getNotice(link) {
        try {
            const stream = await axios.get(decodeURI(link), {
                headers: {
                    "Referer": "https://www.imsnsit.org/imsnsit/notifications.php"
                },
                responseType: "stream",
            })
            return stream;
        } catch (e) {
            console.error(e);
        }
    }

    async fetchNotices() {
        const notices = [];
        try {
            const res = await axios.get(url);
            const html = res.data;
            const $ = cheerio.load(html);
            const table = $("body > form > table > tbody")[0].children.filter(n => n.type === 'tag').slice(3, 102);

            for (let i = 0; i < table.length; i += 2) {
                const date = parseDate(table[i].children[0].children[0].children[0].data.trim());
                const title = table[i].children[1].children[0].children[0].children[0].data;
                const link = table[i].children[1].children[0].attribs.href;
                const notice = { date, title, link };
                notices.push(notice);
            }
            return notices;
        } catch (e) {
            console.error(e);
        }
    }
}

const ims = new IMS();

export default ims;