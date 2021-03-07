import Axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';

import { prompt, parseDate } from './util.js';

const baseURL = "https://www.imsnsit.org/imsnsit"

const axios = Axios.create();

class IMS {
    uid = null;
    pass = null;

    imsHeaders = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
    }

    login(uid, pass) {
        this.uid = uid;
        this.pass = pass;
    }

    resetHeaders() {
        this.imsHeaders = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
        };
    }

    async getUser() {
        try {
            // Fetching CaptchaUrl
            this.resetHeaders();
            console.log("Get Attendance");
            this.imsHeaders["Referer"] = "https://www.imsnsit.org/imsnsit/student.htm";
            const url = "https://www.imsnsit.org/imsnsit/student_login.php";
            const res = await axios.get(url, { headers: this.imsHeaders })
            const html = res.data;
            const cookie = res.headers["set-cookie"][0].split(";")[0];
            let $ = cheerio.load(html);
            const captchaNode = $("#captchaimg")[0];
            const captchaUrl = baseURL + "/" + captchaNode.attribs.src;
            const hrandNum = $("#HRAND_NUM")[0].attribs.value;
            console.log(captchaUrl);
            
            this.imsHeaders["Cookie"] = cookie;
            // Downloading Captcha
            console.log("Downloading Captcha...")
            this.imsHeaders["Referer"] = " https://www.imsnsit.org/imsnsit/student_login.php";
            const captchaImg = await axios.get(captchaUrl, {
                headers: this.imsHeaders,
                responseType: "stream",
            })
            captchaImg.data.pipe(fs.createWriteStream('captcha.jpg'));

            // Entering Values
            const captcha = await prompt("Enter captcha value: ");

            // Solving Captcha - Rarely works
            // const captcha = await solveCaptcha(captchaUrl);
            // console.log(captcha)

            // Logging in by sending POST with required data
            console.log("Logging In...")
            const loginReqBody = `f=&uid=${this.uid}&pwd=${this.pass}&HRAND_NUM=${hrandNum}&fy=2020-21&comp=NETAJI+SUBHAS+UNIVERSITY+OF+TECHNOLOGY&cap=${captcha}&logintype=student`;
            this.imsHeaders["Referer"] = "https://www.imsnsit.org/imsnsit/student_login.php";
            this.imsHeaders["Content-Type"] = "application/x-www-form-urlencoded"
            const loginRes = await axios.post(url, loginReqBody, { headers: this.imsHeaders });
            
            // Opening User Page
            let nextUrl = `https://www.imsnsit.org/${loginRes.request.path}`
            console.log("Opening User's Portal...");
            delete this.imsHeaders["Content-Type"];
            const userRes = await axios.get(nextUrl, { headers: this.imsHeaders })
            const user = userRes.data;

            return user;
        } catch (e) {
            console.error(e);
        }
    }

    async getProfile() {
        try {
            const user = await this.getUser();
            let $ = cheerio.load(user);
            let nextUrl = $('a:contains("Profile")')[0].attribs.href;
            const profileRes = await axios.get(nextUrl, { headers: this.imsHeaders });
            const profile = profileRes.data;
            $ = cheerio.load(profile);

            console.log("Fetching Profile...");
            const data = $('tr.plum_fieldbig');

            const profileData = {
                id: data[2].children[1].children[0].data,
                name: data[3].children[1].children[0].data,
                dob: data[4].children[1].children[0].data,
                branch: data[8].children[1].children[0].data,
                degree: data[9].children[1].children[0].data,
            }
            return profileData;
        } catch (e) {
            console.error(e);
        }
    }

    async getAttendance(year, sem, fullReport = false) {
        try {
            const user = await this.getUser();
            let $ = cheerio.load(user);

            console.log("Opening My Activities...");
            let nextUrl = $('a:contains("My Activities")')[0].attribs.href;
            const activitiesRes = await axios.get(nextUrl, { headers: this.imsHeaders });
            const activities = activitiesRes.data;
            $ = cheerio.load(activities);

            console.log("Opening User's Attendance Report...")
            nextUrl = $('a:contains("My Attendance Report")')[0].attribs.href;
            const attendanceFormRes = await axios.get(nextUrl, { headers: this.imsHeaders });
            const attendanceForm = attendanceFormRes.data;
            $ = cheerio.load(attendanceForm);
            const encYear = $('input#enc_year')[0].attribs.value;
            const encSem = $('input#enc_sem')[0].attribs.value;
            
            console.log("Generating Report...")
            this.imsHeaders["Content-Type"] = "application/x-www-form-urlencoded";
            const attendReqBody = `year=${year}&enc_year=${encYear}&sem=${sem}&enc_sem=${encSem}&submit=Submit&recentitycode=${this.uid}&dept=INFORMATION+TECHNOLOGY&degree=B.E.&ename=&ecode=`;
            const attendanceRes = await axios.post(nextUrl, attendReqBody, { headers: this.imsHeaders });
            const attendance = attendanceRes.data;


            if(fullReport) {
                let report = attendance.replace(/<form[\s\S]*\/form>/g, "");
                return report;
            } else {
                $ = cheerio.load(attendance);
                const overalls = $('td:contains("Overall")');
                const subjectCodes = overalls[0].parent.parent.children[1].children;
                const total = overalls[0].parent.children;
                const present = overalls[1].parent.children;
                const absent = overalls[2].parent.children;
                const percent = overalls[3].parent.children

                const report = [];
                for(let i = 1; i < subjectCodes.length; i++) {
                    report.push({
                        subject: subjectCodes[i].children[0].data,
                        total: total[i].children[0].data,
                        present: present[i].children[0].data,
                        absent: absent[i].children[0].data,
                        overall: percent[i].children[0].data,
                    })
                }
                return report;
            }
        } catch (e) {
            console.error(e);
        }
    }

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

    async getAllNotices() {
        const url = "https://www.imsnsit.org/imsnsit/notifications.php";
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