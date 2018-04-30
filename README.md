# verejne.digital
Projekt [verejne.digital](https://verejne.digital?about) má za cieľ aplikovať umelú inteligenciu na dáta zverejňované slovenskými verejnými inštitúciami.

## Developovanie


### Prototypovanie nových funkcií a hranie sa s dátami

Prehľad našich produkčných dát: [https://verejne.digital/data.html](https://verejne.digital/data.html)

Stránka sprístupňuje niekoľko užitočných datasetov (pohľadov do našej produkčnej databázy s normalizovanými dátami) a odkazuje na Google Colaboratory notebooky, v ktorých je možné priamo experimentovať s týmito dátami bez nutnosti čokoľvek sťahovať.

Alternatívne je možné stiahnuť CSV dumpy a prototypovať nové funkcie lokálne.


### Frontend

Kód je momentálne roztrúsený vo viacerých priečinkoch (static, obstaravania, prepojenia, profil...). 

#### static
Kód [https://verejne.digital/](https://verejne.digital/), naprogramovaný v obyčajnom JS.

#### obstaravania
Kód [https://verejne.digital/obstaravania/index.html](https://verejne.digital/obstaravania/index.html), automaticky generovaný python skriptom [main.py](https://github.com/verejnedigital/verejne.digital/blob/master/obstaravania/main.py)

#### prepojenia
Kód [https://verejne.digital/prepojenia/index.html](https://verejne.digital/prepojenia/index.html).
V priečinku `client` sa nachádza kód frontendu. Zvyšok priečinka tvorí backend.

#### profil
Kód [https://verejne.digital/profil/](https://verejne.digital/profil/).
V priečinku `client` sa nachádza kód frontendu.

Na developovanie react-u treba mať nainštalovaný `Node.js` a `npm`. Pred spustením, treba nainštalovať potrebné balíčky: `npm i`. Frontend spustíte pomocou `npm run start`.


### Backend

Backend je momentálne možné vyvíjať len na serveri, pretože pri testovaní je potrebné pripojenie k databáze.

```bash
# Stiahnutie kódu
git clone https://github.com/verejnedigital/verejne.digital.git
cd verejne.digital/

# Ilustrácia na aplikácii prepojenia, ostatné aplikácie sa vyvíjajú analogicky
cd prepojenia/

# Konfigurácia virtuálneho prostredia pre Python
virtualenv venv
. venv/bin/activate
pip install -r requirements.txt

# ...
# Vývoj backendu implementovaného v Python skriptoch *.py
# ...

# Otestovanie zmien pod správnym používateľom
sudo su
su prepojenia
python test.py

# Ak všetky testy zbehli v poriadku, commit a push zmien
git add --all
git commit -m 'popis zmien'
git pull origin master
git push origin master

# Push do produkcie a reštart aplikácie prepojenia
git pull
git checkout prod
git pull
git merge master
git push
git checkout master
sudo svc -t /service/prepojenia_prod
```
