# Website form emails: SMTP2GO setup guide (The Cronulla Dentists)

This guide connects the website's forms to email. Once it is done, every message sent through the
website is emailed to:

- **reception@thecronulladentists.com.au**
- **rowayne@gyaclients.com**

Both addresses are fixed in the code (`lib/relay.ts`, `ALWAYS_NOTIFY`), so they always get a copy even if a
setting in Vercel is wrong or missing. Every submission is also saved in the dashboard under **Enquiries**,
so nothing is lost even if an email fails.

**How it works:** visitor sends the form → the website saves it in Enquiries → the website asks SMTP2GO
(our email sending service) to send it → SMTP2GO emails reception and GYA. If a SmileOx intake address is
set, the lead is also sent to SmileOx.

Forms covered: the Contact page form (/contact/) and the register-your-interest form (shown before online
booking opened).

You need: access to the SMTP2GO account, to Vercel, and to wherever the domain's DNS is managed.
Allow about 20 minutes, plus up to a few hours for the domain check in Part 1.

---

## Part 1: let SMTP2GO send from thecronulladentists.com.au

Emails must come from an address on a domain SMTP2GO has verified, or they are refused (or land in spam).
Skip this part if `thecronulladentists.com.au` already shows as **Verified** in SMTP2GO.

1. Log in at **app.smtp2go.com**.
2. Go to **Sending** > **Verified Senders** > **Sender Domains** > **Add Sender Domain**.
3. Type `thecronulladentists.com.au` and click **Add Sender Domain**.
4. SMTP2GO shows three **CNAME** records (a return path, a DKIM record and a tracking link). Keep the page open.
5. Add those three records where the domain's DNS is managed:
   - In Vercel, open **Domains** for the account (or the project's **Settings** > **Domains**). If
     `thecronulladentists.com.au` uses Vercel's nameservers, click it and add the records under **DNS Records**
     (Type **CNAME**, Name and Value copied exactly from SMTP2GO).
   - Otherwise add them at the domain registrar's DNS page.
   - Do not change or delete any existing **MX** records. Those deliver the practice's normal email.
6. Back in SMTP2GO, click **Verify**. It can take from a few minutes to a few hours. Carry on with Part 2
   while you wait.

## Part 2: create the API key

1. In SMTP2GO go to **Sending** > **API Keys** > **Add API Key**.
2. Description: `The Cronulla Dentists website`.
3. Permissions: tick only **Emails** > **/email/send**.
4. Click **Add API Key** and copy the key (it starts with `api-`).

The key is a password. Paste it only into Vercel (Part 3). Never put it in an email, a chat, a document or
the code.

## Part 3: add the settings in Vercel

Vercel > project **tcd-cronulla-dentists-ygl2** > **Settings** > **Environment Variables**.
For each one: click **Add**, fill in Key and Value, choose the Type and Environments shown, and **Save**.

| Key | Value | Type | Environments |
|---|---|---|---|
| `SMTP2GO_API_KEY` | the key from Part 2 | Secret | Production (add Preview too only if you want the preview's forms to send real emails) |
| `SMTP2GO_SENDER` | `website@thecronulladentists.com.au` | Config | Production, Preview |
| `NOTIFY_EMAIL` | `reception@thecronulladentists.com.au, rowayne@gyaclients.com` | Config | Production, Preview |
| `SMILEOX_INTAKE_EMAIL` | the SmileOx intake address, if the practice uses SmileOx | Config | Production |

Notes:

- If any of these already exist, click the **⋯** next to it and **Edit** instead of adding a second copy.
- `NOTIFY_EMAIL` is for extra people. Reception and rowayne@gyaclients.com are always included anyway. To
  add someone, put their address after a comma.
- Paste the key with no spaces before or after it (the website trims them, but check anyway).

**Then redeploy, because settings only take effect on the next build:**
Vercel > **Deployments** > the top row marked **Production** and **main** > **⋯** > **Redeploy** >
**Redeploy**. (Clicking **Publish website** in the dashboard does the same thing.) Wait for **Ready**.

## Part 4: test it

1. Open **www.thecronulladentists.com.au/contact/** in a private browser window.
2. Fill in the form with your own name and email, message `Test, please ignore`, and send it.
3. The page should say the message was sent.
4. Within a minute, an email titled **Website message: (your name)** should arrive at both
   reception@thecronulladentists.com.au and rowayne@gyaclients.com. Clicking **Reply** answers the person
   who filled in the form.
5. In the dashboard, **Enquiries** shows the message with email status **sent**.
6. In SMTP2GO, **Reports** > **Activity** shows the send as delivered.

Delete the test enquiry in the dashboard afterwards if you like.

## If something goes wrong

| What you see | Likely cause | Fix |
|---|---|---|
| The form says "We could not send your message" | SMTP2GO refused the email | Vercel > **Logs**, search for `[relay]`. The line gives SMTP2GO's reason, for example "sender not verified" (finish Part 1), "invalid API key" (copy the key again in Part 2 and 3), or no credits left |
| The form says it was sent, but no email arrives and Enquiries shows **skipped** | `SMTP2GO_API_KEY` is missing on Production, or the site was not redeployed after adding it | Check Part 3, then redeploy |
| Enquiries shows **sent**, but the email is missing | It went to spam, or the domain is not verified yet | Check spam folders, finish Part 1, look it up in SMTP2GO **Reports** > **Activity** |
| Only one of the two addresses gets it | That mailbox's own filtering | Check that mailbox's spam or quarantine; SMTP2GO Activity shows both recipients |

Changing who always receives the emails is a code change in `lib/relay.ts` (`ALWAYS_NOTIFY`). Adding extra
people is only the `NOTIFY_EMAIL` setting in Vercel, then a redeploy.
