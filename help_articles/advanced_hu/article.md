# Segítek a lázadóknak (haladó)

Az _ipfs-blog-daemon_ telepítése a kezdőknek szóló leírásban van részletezve. Ebben a cikkben részletesebben tárgyaljuk az IPFS-t és a jelenlegi problémákat a technológia körül. Először azt fogjuk bemutatni, hogy hogyan lehet megosztani a blogot egy VPS szerverről, ami mindig megy.

## Servicek telepítése Debian rendszeren

Mindenek előtt telepíteni kell az IPFS-t a szerveren. [Itt](https://docs.ipfs.io/install/command-line/) van részletezve, hogy hogyan kell feltepeíteni a command-line ipfs-t. A telepítést követően futtassuk az `ipfs init` parancsot és hozzuk létre az `/etc/systemd/system/ipfs.service` fájlt. A fájlnak legyen ez a tartalma:
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
(Ebben az esetben az IPFS root felhasználóként lesz futtatva.)

Ezt követően engedélyezzük az újonnan létrehozott service-t:
`systemctl enable ipfs.service`

A `service ipfs status` megmondja a szolgáltatás jelenlegi állapotát. A `service ipfs stop` leállítja az IPFS démont, a `service ipfs start` elindítja az IPFS démont. [Itt van egy cikk](https://medium.com/@benmorel/creating-a-linux-service-with-systemd-611b5c8b91d6) a systemd servicekről.

Néhány VPS szolgáltató, ha kerülni akarjuk az olyan óriásokat mint a Google vagy az Amazon : [LibertyVPS](https://libertyvps.net/), [MivoCloud](https://www.mivocloud.com/), [CherryServers](https://www.cherryservers.com/), [Kamatera](https://www.kamatera.com/), [VirtualSystems](https://vsys.host/)
Ezeken kívül még számos más szolgáltató létezik.

Ha az IPFS már fut, hozzunk létre egy `ipfs_pin_updater.sh` nevű fájlt, például a `/root` mappában. Ez legyen a fájl tartalma:
```
#!/bin/bash

# This will update the website, the database and the articles periodically (cron will call this script)


# Timestamp
echo $(date +"%Y.%m.%d. %H:%M:%S") >> ipfs_pin_updater.log

# Add website by IPNS name
/usr/local/bin/ipfs pin add -r /ipns/k2k4r8nsj5rscg5xkkelcjhgtapmm6s8xvz9biragt9ejfchca3qcy4f >> ipfs_pin_updater.log
# Add database.json by IPNS name
/usr/local/bin/ipfs pin add -r /ipns/k2k4r8kcttrnjw0hexlzvq79cv62ua8mde0cjly9kdskg2l8scocozxq >> ipfs_pin_updater.log
# Add articles folder by IPNS name
/usr/local/bin/ipfs pin add -r /ipns/k2k4r8jrbu4auj6sbbutyjyqoxex6py74wyzgfy08gf0mlti3b914kee >> ipfs_pin_updater.log

```

A fenti IPNS címek erre a blogra vonatkoznak, ha a saját blogunkat hoznánk létre, azokat a sorokat át kellene írni.
Tegyük futtathatóvá a fájlt: `chmod 755 ipfs_pin_updater.sh`

Hozzunk létre egy `update_killer.sh` fájlt, ennek ez legyen a tartalma:
```
#!/bin/bash

# Kill all ipfs pin updater process to prevent too many processes from running
pkill -e ipfs_pin_update

```
Jelenleg így van megoldva az, hogy ne fusson túl sok ipfs instance abban az esetben, ha nem tudja a hozzáadást elvégezni. Ez túlterhelné a szervert. Ezt a fájlt is tegyük futtathatóvá: `chmod 755 update_killer.sh`

A crontab-hoz adjuk hozzá a 2 scriptet:
`crontab -e` (elképzelhető, hogy telepíteni kell a crontab-ot)
Ezt a 2 sort adjuk hozz:
```
*/29 * * * * /root/update_killer.sh
*/15 * * * * /root/ipfs_pin_updater.sh
```
Ebben a 2 sorban a /29 és a /15 azt jelöli, hogy mennyi percenként fusson le az adott script. [Itt van](https://cron.help/) egy online eszköz, ami segít ennek az értéknek a megszerkesztésében (ha más ütemezést szeretnénk).

Ezzel az IPFS daemon konfigurálása befejeződött. Ha van tűzfal konfigurálva, a TCP 4001 5001 8080 8081 és UDP 4002 portokat érdemes megnyitni, [e szerint a fórum bejegyzés szerint](https://discuss.ipfs.io/t/ipfs-ports-firewall/996/2)


## Saját blogunk létrehozása

Saját számítógépünkön vagy VPS szerveren is létrehozhatjuk a kulcspárokat, amivel az IPNS linkek frissítve lesznek. Az [ipfs-blog-uploader](https://github.com/imestin/ipfs-blog-uploader) jelenleg félig automatizálja a folyamatot, de nem túlzottan felhasználóbarát. A [notes.md](https://github.com/imestin/ipfs-blog-uploader/blob/61bbd2a93aa6937e642944474f7ec27b32238a7f/notes.md) fájlban részletezve van, hogy hogyan lehetne teljesen manuálisan létrehozni egy blogot, majd új cikkeket feltölteni erre a blogra. A NodeJS alkalmazás a feltöltés folyamatát automatizálja, a `client` mappában található weboldalt ki lehet szolgálni Nginx-szel, vagy a saját számítógépünkön is futtathatjuk, meg kell oldanunk, hogy a NodeJS alkalmazással kommunikáljon, tehát, ha VPS szerverre telepítettük fel a `server` mappában található NodeJS alkalmazást, akkor a `client/index.html`-ben is át kell írnunk a `localhost:3000` részeket, és a `client/main.js` tetején is.

Szerver oldalon létre kell hoznunk egy `.env` fájlt az `env.example` mintájára (nincs neve, csak kiterjesztése. Linuxon ez egy rejtett fájl lesz.). Ehhez először létre kell hoznunk a kulcsokat, ehhez szükséges, hogy legyen IPFS telepítve, és ugyanazon a számítógépen kell létrehoznunk a kulcsokat, ahol majd az új cikkek hozzáadása történik.
A `Tester4` mappa egy példa arra, hogy hogyan kellene kinéznie annak a mappának, amit majd a NodeJS alkalmazás kezelni fog. 
A `database.json` fájlban a `helpfile_beginner` `helpfile_advanced` olyan IPFS-re feltöltött mappákra mutat, melyekben található egy `article.md` fájl. 
Az `articles` tömb kezdetben üres, ezt majd a NodeJS fogja kitölteni minden egyes feltöltésnél. A `database.json` többi mezője tetszőleges.
Az `env.example` most összhangban van a `Tester4` mappával.

Amikor megnyitjuk a feltöltő weboldalt, a FolderNumber-hez nem kell hozzányúlni, kivéve, ha a feltöltés folyamata megszakadt. Az app nem kezeli ezt a szituációt, csak ajánlani fog egy olyan mappa-számot, ami még nem létezik.


Én egyébként `v10.16.3`-as node-ot használtam, de valószínüleg más NodeJS verzió is tud működni. [Itt](https://tecadmin.net/how-to-install-nvm-on-debian-10/) van egy leírás arról, hogy hogyan kell NVM-en keresztül telepíteni a node-ot.

## Ismert problémák

Az IPFS főként a tartalom megkeresése miatt lassú, ez [itt](https://github.com/ipfs/go-ipfs/issues/6382) van részletezve. Úgy tűnik, az [IPNS](https://docs.ipfs.io/concepts/ipns/#example-ipns-setup-with-cli) kikerülése pozitívan hat a sebességre, de az IPNS-sel van megoldva az, hogy frissíthető legyen a tartalom. Továbbá, a blog nyilván csak akkor működik, ha valamelyik számítógépen megtalálható az adat, ugyanaz a szituáció megtörténhet, mint a torrent esetében, amikor senki sem seedel (ha nincsenek VPS szerverek telepítve).

Az új bejegyzések feltöltése nincsen decentralizálva. Lehetne használni egy eldobható IPFS node-ot erre a célra (böngészőben, lásd [js-ipfs](https://js.ipfs.io/)), de akkor publikusan kellene tárolni a kulcsokat, ehhez mindenképpen titkosítás szükséges, és ugye a _brute force_ abszolút lehetséges, mert ez teljesen publikus adat, tehát szükség lenne például egy nagyon erős jelszóra (amivel a privát kulcs titkosítva van). A felhasználók nincsenek hozzászokva az erős jelszavak kezeléséhez, továbbá ahhoz sincsenek hozzászokva, hogy a jelszó elfelejtése esetén nem lehetséges jelszó helyreállítás. Ha nincsen központi szerver, nincsen hol resetelni a jelszót, nincs kitől jelszó helyreállítást kérni.

Az, ha az adatbázist a Dash Platformon tárolnánk egyelőre nem oldalá meg ezt a problémát, mert akkor annak a hozzáférési kulcsát kellene tárolni, de nagyobb az esélye annak, hogy a Dash rendszerében létezni fog valami MetaMask-hoz hasonló megoldás, mint az IPFS esetében, vagy esetleg a hardware wallet ami szóba jöhet. 


## Forráskód
 * [https://github.com/imestin/ipfs-blog-website](https://github.com/imestin/ipfs-blog-website)
 * [https://github.com/imestin/ipfs-blog-uploader](https://github.com/imestin/ipfs-blog-uploader)
 * [https://github.com/imestin/ipfs-blog-daemon](https://github.com/imestin/ipfs-blog-daemon)


## További olvasnivaló
1. [Webprogramozás az alapoktól](https://www.freecodecamp.org/)
2. [IPFS Dokumentáció](https://docs.ipfs.io/)
3. [ProtoSchool - libp2p, IPFS, Filecoin](https://proto.school/)
4. [IPFS Fórum](https://discuss.ipfs.io/)
5. [Dash Platform Dokumentáció](https://dashplatform.readme.io/docs) - Ehhez a projekthez nem volt használva, de lehet, hogy egy későbbi verzióhoz használva lesz
6. [Solidity Dokumentáció](https://docs.soliditylang.org/en/v0.8.4/) - Ehhez a projekthez nem volt használva Ethereum / Solidity
7. [Crypto Zombies - Tutorial Ethereum Smart Contractokhoz](https://cryptozombies.io/) - Ehhez a projekthez nem volt használva Ethereum / Solidity