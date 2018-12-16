# verejne.digital
Projekt [verejne.digital](https://verejne.digital?about) má za cieľ aplikovať umelú inteligenciu na dáta zverejňované slovenskými verejnými inštitúciami. Projekt [verejne.digital](https://verejne.digital?about) je vyvíjaný občianskym združením [ChcemVediet.sk](https://www.chcemvediet.sk).

## Hranie sa s dátami

Prehľad našich dát: [https://verejne.digital/data.html](https://verejne.digital/data.html)

Stránka odkazuje na **Google Colaboratory notebooky**, v ktorých je možné priamo experimentovať s našimi normalizovanými dátami, bez nutnosti čokoľvek sťahovať alebo inštalovať.

Alternatívne je možné niekoľko užitočných datasetov stiahnuť ako CSV dumpy a prototypovať nové funkcie lokálne.


## Development

**Frontend** sa nachádza aj s popisom v [/client](https://github.com/verejnedigital/verejne.digital/tree/master/client).

**API funkcie** poskytované naším backendom: [https://verejne.digital/test.html](https://verejne.digital/test.html)

**Backend** je momentálne možné vyvíjať len na serveri, pretože pri testovaní je potrebné pripojenie k databáze.

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

# Reštart aplikácie prepojenia
sudo svc -t /service/prepojenia_prod
```
*Poznámka*: Web server cacheuje odpovede, takže po reštartovaní zmenenej aplikácie sa pre rovnaký request nemusí ihneď  zmeniť odpoveď! Cache je možné obísť pridaním dummy parametra za request; napríklad: [https://verejne.digital/api/d/public_dumps_info?x=47](https://verejne.digital/api/d/public_dumps_info?x=47).

Vytvorenie nového server hooku (API funkcie) v už existujúcej aplikácii (napríklad `prepojenia`):
1. Vytvor novú podtriedu `MyServer` v `prepojenia/server.py` a naimplementuj funkcionalitu v metóde `get()`.
2. Zaregistruj nový hook vo `WSGIApplication` (globálna premenná `app`).
3. Ulož zmeny a reštartuj aplikáciu postupom uvedeným vyššie.

Vytvorenie novej aplikácie:
*TODO*
