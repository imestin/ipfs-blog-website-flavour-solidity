# Helping the rebels (advanced)

Installing _ipfs-blog-daemon_ is detailed in the beginner article. In this article we will go deeper into IPFS and problems around the technology. First, we will show, how to host the blog from a VPS server, that is always running.

## Installing Services on Debian System

First of all, we need to install IPFS on the server. [In this documentation](https://docs.ipfs.io/install/command-line/) it is explained how to install the command-line ipfs. After the installation, run the `ipfs init` command, and create `/etc/systemd/system/ipfs.service`. This is what the file should contain:
```
[Unit]
Description=IPFS Daemon
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root
ExecStart=/usr/local/bin/ipfs daemon
Restart=on-failure

[Install]
WantedBy=multi-user.target

```
(In this case IPFS will be run by root.)

After this, enable the newly created service:
`systemctl enable ipfs.service`


Running `service ipfs status` will tell the current state of the service, `service ipfs stop` would stop the service and `service ipfs start` would start it. [Here is an article](https://medium.com/@benmorel/creating-a-linux-service-with-systemd-611b5c8b91d6) about systemd.

Here is a list of some VPS provider, if we don't want to use Amazon or Google: [LibertyVPS](https://libertyvps.net/), [MivoCloud](https://www.mivocloud.com/), [CherryServers](https://www.cherryservers.com/), [Kamatera](https://www.kamatera.com/), [VirtualSystems](https://vsys.host/)
But there are many others.

If IPFS is running, let's create a file called `ipfs_pin_updater.sh`, for example, in the `/root` directory. This is what the file should contain:
```
#!/bin/bash

# This will update the website, the database and the articles periodically (cron will call this script)


# Timestamp
echo $(date +"%Y.%m.%d. %H:%M:%S") >> ipfs_pin_updater.log

# Add website by IPNS name
/usr/local/bin/ipfs pin add -r /ipns/k2k4r8kgworvwegkpuirutkb9l515r9h3g0ar3k90bdd5sxyxjy861kq >> ipfs_pin_updater.log
# Add database.json by IPNS name
/usr/local/bin/ipfs pin add -r /ipns/k2k4r8oid3l6x7ujkn727ziie9kd5u76q7wv3drqyjdesv9b9tudjd3r >> ipfs_pin_updater.log
# Add articles folder by IPNS name
/usr/local/bin/ipfs pin add -r /ipns/k2k4r8jguqxqw3pk96718a7heewolatcoev7itv9zv8mgtcw4e6ki0zo >> ipfs_pin_updater.log

```
The IPNS addresses above are for this blog. If we want to create or own blog, we need to rewrite those lines.
Let's make the file executable: `chmod 755 ipfs_pin_updater.sh`

Create an `update_killer.sh` file with the below content:
```
#!/bin/bash

# Kill all ipfs pin updater process to prevent too many processes from running
pkill -e ipfs_pin_update

```
This is to stop too many ipfs instances from running in case ipfs wouldn't be able to resolve the IPNS address. Running too many ipfs instances would slow down the system. Let's make the file executable: `chmod 755 update_killer.sh`

Add the above two script to crontab (it is possible that you will have to install crontab)
Run `crontab -e` and write the below two lines to the end of the file:
```
*/29 * * * * /root/update_killer.sh
*/15 * * * * /root/ipfs_pin_updater.sh
```
In the above two lines the /29 and the /15 tells, how often the script should run (in minutes) [Here](https://cron.help/) is an online tool which helps in finding out these values (if we want a different schedule).

With this, the configuration of the IPFS Blog Daemon is finished. If a firewall is configured, TCP 4001 5001 8080 8081 and UDP 4002 should be open (according to [this](https://discuss.ipfs.io/t/ipfs-ports-firewall/996/2) forum thread).


## Creating Your Own Blog

We can create the keypairs on our desktop computer or on a VPS server as well, with which the IPNS links will be refreshed. As of now, the [ipfs-blog-uploader](https://github.com/imestin/ipfs-blog-uploader) partly automizes the process, but it's not too user-friendly. In the [notes.md](https://github.com/imestin/ipfs-blog-uploader/blob/61bbd2a93aa6937e642944474f7ec27b32238a7f/notes.md) it is detailed how could we fully manually create a blog, and then upload new articles to this blog. The NodeJS application is automating the uploading process. The website in the `client` folder can be served by Nginx, or we can run it on our own computer (open it in the browser). We have to solve that the webpage is communicating with the NodeJS backend, so if we installed the application found in the `server` folder to a VPS server, then we have to rewrite the `localhost:3000` in the `client/index.html` file and in the `client/main.js` as well.

On the server side, we have to create a `.env` file, using `env.example` as a template. (The file we create should not have a name, only the .env extension. On Linux, this will be a hidden file). For this, we need to create the keys first, we need IPFS to be installed for this. Create the keys on the same computer, where the new articles will be added. The `Tester4` folder is an example blog folder, we should create a similar folder, that the NodeJS application will handle. In the `database.json` file the `helpfile_beginner` and the `helpfile_advanced` are pointing to folders uploaded to IPFS. In the folders, there should be an article.md, with the help-article content.
The `articles` array starts empty, NodeJS will insert new elements here, when a new article is uploaded.
The other fields in the `database.json` can be anything.
The `env.example` and the `Tester4` example folder is showing the relationship of the .env and the blog folder.

When opening the uploader, the folder number does not need to be touched, but if the upload process was interrupted, the app will not know that, the app is only suggest a folder that does not exist yet.

I used node `v10.16.3`, but most likely other versions would work as well. [Here](https://tecadmin.net/how-to-install-nvm-on-debian-10/) is a tutorial about installing node with nvm. 

## Known problems

IPFS is mainly slow because of finding the content, this is detailed [here](https://github.com/ipfs/go-ipfs/issues/6382). It seems like that avoiding [IPNS](https://docs.ipfs.io/concepts/ipns/#example-ipns-setup-with-cli) affects speed in a positive way, but it is solved by IPNS that the content is updatable. 
Another problem is that the blog is only working if the content can be found in a computer, a similar situation can happen that with torrent, when nobody is seeding the content (if we solely rely on fellow users, not VPS servers).

The upload of new articles is not decentralized. We could use a temporary IPFS node (in the browser, see [js-ipfs](https://js.ipfs.io/)), but in this case we would need to store the keys publicly, and of course _brute force_ is absolutely possible, because we are talking about content that is totally public. So we would need a really strong password to encrypt the keys. But users are not used to handling strong passwords, and they are also not used to the situation that a password can not be restored. If there is no central server, there is no place where to reset the password, there is nobody to ask for a password reset.

If we would move the database to Dash Platform, wouldn't solve all of the problems just yet, because in this case we would need to store the access keys for DP somewhere/somehow. But, there is more chance that there will be a MetaMask-like solution in the system of Dash than in IPFS, or there could be a solution using hardware wallets.


## Source code
 * [https://github.com/imestin/ipfs-blog-website](https://github.com/imestin/ipfs-blog-website)
 * [https://github.com/imestin/ipfs-blog-uploader](https://github.com/imestin/ipfs-blog-uploader)
 * [https://github.com/imestin/ipfs-blog-daemon](https://github.com/imestin/ipfs-blog-daemon)


## Further reading:
1. [Learn web-programming](https://www.freecodecamp.org/)
2. [IPFS Documentation](https://docs.ipfs.io/)
3. [ProtoSchool - libp2p, IPFS, Filecoin](https://proto.school/)
4. [IPFS Forum](https://discuss.ipfs.io/)
5. [Dash Platform Documentation](https://dashplatform.readme.io/docs) - Dash Platform was not used for this project, but might be in a future version
6. [Solidity Documentation](https://docs.soliditylang.org/en/v0.8.4/) - Ethereum was not used for this project
7. [Crypto Zombies - Ethereum smart contracts tutorial](https://cryptozombies.io/) - Ethereum was not used for this project