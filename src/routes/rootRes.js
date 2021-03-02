const rootRes = {
    nsutIms: "Unofficial API for NSUT IMS.",
    routes: [
        {
            route: "/notices/",
            desc: "Fetches recent notices from IMS."
        },
        {
            route: "/notice/<link>",
            desc: "Downloads the notice corresponding to the <link>. Encode the link before appending it to route.",
        }
    ]
}

export default rootRes;