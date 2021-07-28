const express = require('express');
const https = require("https");
const bodyParser = require("body-parser");
const client = require("@mailchimp/mailchimp_marketing");
const md5 = require("md5");

const app = express()
const port = 3000

// MailChimp
const apiKey = "f0b6e7b4d5e322ea69f14a9297f57709-us6";
const server = "us6"
const listId = "a85d497b3f";

client.setConfig({
    apiKey: apiKey,
    server: server,
});


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/signup.html")
});

app.post("/", function (req, res) {
    console.log(req.body)
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var subscriberHash = md5(email.toLowerCase());


    const subscribingUser = {
        firstName: firstName,
        lastName: lastName,
        email: email
    };


    async function run() {
        const response = await client.lists.setListMember(
            listId,
            subscriberHash, {
                email_address: subscribingUser.email,
                status_if_new: "subscribed",
                merge_fields: {
                    FNAME: subscribingUser.firstName,
                    LNAME: subscribingUser.lastName
                }
            }
        );
        console.log(`Successfully added contact as an audience member. The contact's id is ${
        response.id}.`);

        console.log(response);
        res.sendFile(__dirname + "/success.html");
    };

    run().catch(e => {
        console.log(e.status);
        res.sendFile(__dirname + "/failure.html");
    })
});

app.post("/failure", function (req, res) {
    res.redirect("/");
})
app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});