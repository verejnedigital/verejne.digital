# verejne.digital
Projekt [verejne.digital](https://verejne.digital?about) má za cieľ aplikovať umelú inteligenciu na dáta zverejňované slovenskými verejnými inštitúciami. Projekt [verejne.digital](https://verejne.digital?about) je vyvíjaný občianskym združením [ChcemVediet.sk](https://www.chcemvediet.sk).

## Hranie sa s dátami

Prehľad našich dát: [https://verejne.digital/data.html](https://verejne.digital/data.html)

Stránka odkazuje na **Google Colaboratory notebooky**, v ktorých je možné priamo experimentovať s našimi normalizovanými dátami, bez nutnosti čokoľvek sťahovať alebo inštalovať.

Alternatívne je možné niekoľko užitočných datasetov stiahnuť ako CSV dumpy a prototypovať nové funkcie lokálne.


## Frontend

**Nový frontend** (v príprave) aj s popisom: [/client](https://github.com/verejnedigital/verejne.digital/tree/master/client)

**Aktuálny frontend**: Kód sa nachádza vo viacerých priečinkoch:
- `static`: Kód [https://verejne.digital/](https://verejne.digital/), naprogramovaný v obyčajnom JS.
- `obstaravania`: Kód [https://verejne.digital/obstaravania/index.html](https://verejne.digital/obstaravania/index.html), automaticky generovaný python skriptom [main.py](https://github.com/verejnedigital/verejne.digital/blob/master/obstaravania/main.py).
- `prepojenia`: Kód [https://verejne.digital/prepojenia/index.html](https://verejne.digital/prepojenia/index.html). V priečinku `client` sa nachádza kód frontendu. Zvyšok priečinka tvorí backend.
- `profil`: Kód [https://verejne.digital/profil/](https://verejne.digital/profil/). V priečinku `client` sa nachádza kód frontendu.

Na developovanie react-u je potrebné mať nainštalované `Node.js` a `npm`. Pred spustením je potrebné nainštalovať potrebné balíčky: `npm i`. Frontend sa potom spúšťa pomocou `npm run start`.


## Backend

Prehľad našich API funkcií: [https://verejne.digital/test.html](https://verejne.digital/test.html)

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
*Poznámka*: Web server cacheuje odpovede, takže po reštartovaní zmenenej aplikácie sa pre rovnaký request nemusí ihneď  zmeniť odpoveď! Cache je možné obísť pridaním dummy parametra za request; napríklad: [https://verejne.digital/api/k/public_dumps_info?x=47](https://verejne.digital/api/k/public_dumps_info?x=47).

Vytvorenie nového server hooku (API funkcie) v už existujúcej aplikácii (napríklad `prepojenia`):
1. Vytvor novú podtriedu `MyServer` v `prepojenia/server.py` a naimplementuj funkcionalitu v metóde `get()`.
2. Zaregistruj nový hook vo `WSGIApplication` (globálna premenná `app`).
3. Ulož zmeny a reštartuj aplikáciu postupom uvedeným vyššie.

Vytvorenie novej aplikácie:
*TODO*
