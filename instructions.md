# RustDesk Server

## Documentation

- [RustDesk client documentation](https://rustdesk.com/docs/en/client/*) — installing the apps and pointing them at your own server
- [Server configuration reference](https://github.com/rustdesk/rustdesk-server/blob/master/docs/environment-variables.md) — every setting the ID server and relay understand

## What you get on StartOS

There is no web page to open: the apps you install on your computers and phones are the free RustDesk clients, and this server is where they connect.

It exposes one interface, **RustDesk**, covering the three ports the clients use. Every client must present this server's key, which the server generates on its first start, so nobody can register a device against your server without it.

## Getting set up

1. Start the service and wait for both **ID Server** and **Relay Server** to show healthy.
2. Run **Connection Details**. It shows the address to enter as the ID server, the relay address, and the key.
3. Install the RustDesk client on each device you want to control or control from.
4. In the client, open **Settings**, then **Network**, then **ID/Relay server**. Enter the ID server address, paste the key, and leave the relay server blank unless Connection Details told you otherwise.
5. The client's home screen shows **Ready** once it has registered. Do the same on a second device, then connect to it by the ID the client displays.

Use an address each device can actually reach: the LAN address at home, and a public address from anywhere else. To reach the server from outside your network, enable a public address on the **RustDesk** interface. If that address is your home router's, also make sure the router forwards ports 21115–21117, TCP and UDP, to this server.

To give the server a name such as `rustdesk.example.com`, create a DNS record at your DNS provider pointing the name at that public address, and enter the name in each client instead of the address. Do not add the name to the RustDesk interface in StartOS: the clients do not need StartOS to know it, and adding a domain to this interface currently fails with "binding not found for internal port".

## Using RustDesk Server

### Connection Details

Run it whenever you set up a new client, or if you need the key again. It lists the addresses currently enabled on the RustDesk interface. Every device must use the same key. If the key is ever exposed to someone you do not trust, uninstall and reinstall the service to get a new one, then update every client.

### Configure

Saving either setting restarts the server, which drops any session in progress for a few seconds.

- **Always use the relay** sends every session through this server instead of letting two devices connect directly. Sessions are slower. Use it when direct connections fail or are unreliable; it does not hide your address from the device you connect to.
- **Relay address** is only for an unusual network where the relay is reachable at a different name or port than the ID server. Leave it blank otherwise. If you do set it, use an IP address or a public DNS name; the server ignores a name it cannot look up.

### After restoring from a backup

A restore brings back the server's key, so no client needs changing. It does not bring back a public address you enabled on the **RustDesk** interface: enable it again, or devices outside your network cannot connect.

## Limitations

- RustDesk's browser client (rustdesk.com/web) cannot use this server. Use the RustDesk app on each device.
- This service has been tested on x86_64 (Intel and AMD) servers only. It is built for ARM servers too, but has not yet been run on one.
