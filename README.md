# bodnarmarian14.github.io website



# How to use custom domain for GitHub pages

## Configure Cloudflare

1. Log in to Cloudflare and select the domain.

2. Go to DNS tab

3. Add the following records:
  - **_A_** Records (for root @):
  ```
  185.199.108.153

  185.199.109.153

  185.199.110.153

  185.199.111.153
  ``` 
  - **_CNAME_** Record (for www): Point to GH URL (username.github.io)

4. The workaround: Look at the Proxy Status column. Click Orange Cloud icon to turn it inot a Gray Cloud (DNS only).
This step have to be done for both A and CNAME record.

## Configure GH

1. Go to **GH repo** -> Settings

2. Click **Pages** in the left sidebar.

3. Under the **Custom domain**, enter the domain (mine: bodnarmarian.uk)

4. Save.

5. Wait. GH will run a DNS check. With the gray cloud active, this should pass quickly.

6. Enalbe HTTPS: Check the box **_Enforce HTTPS_**.
  - Note: If it says "Certificate not yet created", wait 10-15 minutes and refresh. Do not proceed to the next step until you can visit the site on HTTPS.

## SSL Configuration

1. Return to Cloudflare Dashboard -> SSL/TLS tab.

2. Set the encryption mode to Full.

>[!IMPORTANT]
> TEST

$${\color{red} Important: Do NOT use Fliexible.}$$

3. Go to Edge Certifacates sub-tab (under SSL/TLS).

4. Enable Always Use HTTPS.

5. Enabled Automatic HTTPS Rewrites.

## Re-enable Cloudflare Proxy

Undo the process from the first step, by toggle back to Proxied (orange cloud) and click Save.