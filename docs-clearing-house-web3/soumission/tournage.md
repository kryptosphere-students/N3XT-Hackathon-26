# Feuille de tournage, test Flex et vidéo

Même découpage que `video-script.md` : huit plans, même ordre, mêmes bornes de temps. Les bornes sont celles de la vidéo montée, 2 min 50 au total, sous la limite de 3 minutes du formulaire. La prise brute dure plus longtemps : on coupe au montage les attentes de transaction et le milieu du mandat de B. La colonne « coupe » dit ce qui part.

Une seule prise, écran du navigateur en plein cadre, caméra du téléphone sur la Flex en petite fenêtre en bas à droite. On tourne deux fois : la première sans enregistrer, c'est le test Flex (S-021). La seconde est la vidéo. Les textes anglais à dire sont dans `video-script.md`, on peut aussi les enregistrer après coup sur la vidéo muette.

## 1. Préparation, 15 min, hors caméra

Matériel :

- Flex chargée, déverrouillée, app Ethereum ouverte. Ledger Wallet fermé sur le PC.
- Téléphone sur un support, cadré sur l'écran de la Flex, en mode webcam (Camo, DroidCam ou Continuity Camera). Vérifier dans OBS que les lignes de texte de la Flex sont lisibles à la taille de la petite fenêtre, sinon agrandir la fenêtre.
- OBS : scène avec deux sources, capture de la fenêtre Chrome à 1920 de large, puis la caméra du téléphone par dessus, en bas à droite, environ un quart de la largeur. Micro testé si on parle en direct.
- Chrome en fenêtre de 1920 de large, zoom 100 %, onglets et favoris masqués (F11 ou un profil vide). Un deuxième onglet ouvert sur Basescan Sepolia, adresse de l'escrow, onglet Events. Un troisième sur le README GitHub, section Who signs what.

Pile, dans PowerShell, depuis `clearing-house-web3` :

```powershell
Remove-Item -Recurse -Force data\store
$s = Read-Host "Ring password" -AsSecureString
$env:WALLET_PASS = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))
npm run dev -w apps/server
```

Dans un second terminal :

```powershell
npm run dev -w apps/web
```

Vérifier avant de lancer :

- Le log serveur dit « agent key: decrypted with Ledger Key Ring » et « chain 84532 ».
- http://localhost:5173 affiche les trois badges : Base Sepolia, Flex: not connected, Agent key: Ledger Key Ring.
- Le tableau des participants affiche No mandate sur les trois lignes (store vide).
- Gaz : l'agent `0x9970...9F3A` a au moins 0,0001 ETH sur Base Sepolia. Sinon faucet avant de tourner.

Entre le test et la vidéo : arrêter le serveur, refaire `Remove-Item -Recurse -Force data\store`, relancer. Les ordres déjà réglés ne gênent pas (chaque lot a un id unique), mais la page doit repartir vide.

## 2. La prise, plan par plan

Chaque plan : ce que tu fais, ce que la Flex affiche, combien de temps y rester, ce qui saute au montage. Sur la Flex, « signer » veut dire faire défiler les pages de texte, puis maintenir le bouton Sign. Pour une adresse, c'est un simple Confirm.

### Plan 1, 0:00 à 0:15, page au repos

- Ne rien cliquer. Survoler les trois badges en haut à droite, 4 s chacun.
- Flex : écran d'accueil de l'app Ethereum.
- Coupe : rien.

### Plan 2, 0:15 à 0:35, connexion et les trois adresses

- Clic « Connect the Flex (WebHID) ». Chrome ouvre la liste des appareils, choisir Ledger Flex, Connect. 5 s.
- Clic « Read the three addresses (0/3) ».
- Flex, trois fois : « Verify address » avec l'adresse. Confirm à chaque fois. 4 s par adresse, laisser la caméra voir l'adresse avant de confirmer.
- Retour écran : le compteur passe à 3/3, les adresses du tableau sont celles de la Flex. 3 s.
- Coupe : rien, le plan tient en 20 s si tu confirmes sans hésiter.

### Plan 3, 0:35 à 1:00, le mandat

- Section 2, clic « Sign a mandate on the Flex ». Garder Manager A, Fund F, 5000000, subscribe et redeem. Montrer l'encadré noir « Your Flex will show » 3 s.
- Clic « Sign the mandate on the Flex ».
- Flex : « Sign message », puis six lignes. Faire défiler lentement, la caméra doit lire « Max per cycle: 5000000 cash ». Signer. 10 s.
- Retour écran : ligne Manager A, badge Signed on Flex, « cap 5,000,000 cash per cycle ». 3 s.
- Manager B : choisir Manager B dans le formulaire, clic, signer sur la Flex sans lire. 12 s brut.
- Coupe : le milieu du mandat de B. On garde le clic et le badge Signed on Flex de la ligne B, 5 s.

### Plan 4, 1:00 à 1:25, un ordre venu d'un email

- Section 3, clic « New email order ». Attendre l'agent, 3 à 8 s. Lire à l'écran : brouillon de 100 parts, encadré vert « Mandate check by code: inside the signed mandate ».
- Clic « Send the draft to the order form ». Section 4 préremplie, Source: Agent draft from an email. Montrer l'encadré noir 3 s.
- Clic « Sign the order on the Flex ».
- Flex : cinq lignes, « Subscribe 100 units ». Défiler, signer. 8 s.
- Retour écran : section 5, l'ordre apparaît, frise « Drafted by the agent, Mandate check: ok, Signed on the Flex ». 3 s.
- Ordre de Manager B à la main : section 4, Manager B, Redeem, Units 40, clic « Sign the order on the Flex ». Flex : « Redeem 40 units », signer. 12 s brut.
- Coupe : l'attente de l'agent au delà de 3 s, et le milieu de l'ordre de B, on garde 5 s.

### Plan 5, 1:25 à 1:55, l'email piégé, deux couches

- Section 3, clic « Trapped email ». Faire défiler la zone de texte jusqu'à la ligne SYSTEM NOTICE, 4 s.
- Attendre l'agent. Lire : brouillon de 10 parts, et la phrase où il dit avoir ignoré la notice. 8 s.
- Clic « Simulate a fooled agent ». Encadré rouge : « refused. above the signed cap of 5000000 per cycle. The Flex is not asked to sign anything. » Rester 5 s dessus.
- Ne rien toucher sur la Flex. La caméra doit la montrer encore sur l'accueil de l'app Ethereum. 3 s.
- Coupe : l'attente de l'agent au delà de 3 s.

### Plan 6, 1:55 à 2:30, le règlement netté

- Section 6, clic « Settle cycle (netting) ». Le lot 1 apparaît avec les quatre chiffres : 14,700 brut, 6,300 net, 57 %, délai. 5 s.
- Ligne Manager A, clic « Sign approval on the Flex ».
- Flex : « Lot 1, Fund F / You receive 100 units / You pay 10500 cash / Lot hash 0x.... / Full hash 0x... ». Défiler lentement, c'est l'écran le plus important de la vidéo. Signer. 12 s.
- Ligne Manager B, clic « Sign approval on the Flex ». Flex : « You deliver 40 units / You receive 4200 cash ». Signer. 8 s.
- Le serveur envoie settle. Attendre, 5 à 15 s brut. Badge « Settled on chain », lien de transaction, délai en secondes. 3 s.
- Basculer sur l'onglet Basescan : événement LotSettled. 3 s. Revenir.
- Coupe : l'attente de la transaction, on garde 2 s avant le badge.

### Plan 7, 2:30 à 2:45, le règlement instantané

- Section 4 : Manager A, Subscribe, Units 10, clic « Sign the order on the Flex ». Flex : « Subscribe 10 units », signer. 8 s brut.
- Section 6, clic « Instant settle (last order) ». Lot 2, deux lignes.
- Ligne Manager A, clic « Sign approval on the Flex ». Flex : « You receive 10 units / You pay 1050 cash ». Signer. 6 s.
- Attendre « Settled on chain ». 5 à 15 s brut.
- Coupe : le milieu de la signature de l'ordre (garder 3 s) et l'attente de la transaction (garder 2 s).

### Plan 8, 2:45 à 2:50, la frontière

- Basculer sur l'onglet README, tableau Who signs what, puis le tableau des contrats. 5 s.
- Couper. Le carton de fin avec l'URL du repo est ajouté au montage.

## 3. Durées

| Plan | Vidéo montée | Prise brute, environ |
|---|---|---|
| 1 | 0:15 | 0:15 |
| 2 | 0:20 | 0:20 |
| 3 | 0:25 | 0:35 |
| 4 | 0:25 | 0:40 |
| 5 | 0:30 | 0:35 |
| 6 | 0:35 | 0:50 |
| 7 | 0:15 | 0:35 |
| 8 | 0:05 | 0:05 |
| Total | 2:50 | 3:35 |

## 4. Pendant le test Flex, à vérifier

- Les cinq lignes de l'approbation de lot sont lisibles sans scroll excessif, le hash court est sur une ligne.
- Le texte de l'ordre et du mandat est bien celui de l'encadré « Your Flex will show ».
- Aucune demande de blind signing, jamais, sur aucune signature.
- Les délais : première signature à règlement, et approbation à règlement, affichés dans le lot.
- Noter chaque friction Ledger dans `DX_FEEDBACK.md`, puis passer S-021 à done dans `board.md`.

## 5. Si ça casse pendant la prise

- La Flex ne répond pas : fermer Ledger Wallet, recharger la page, reconnecter. Reprendre au début du plan en cours, on coupera.
- « Rejected on the Flex » : tu as refusé sur l'appareil. Recliquer le même bouton.
- L'agent ne répond pas : saisir l'ordre à la main en section 4, dire que l'agent est une couche optionnelle.
- Base Sepolia lent ou sans gaz : arrêter, relancer en local avec `npm run demo:local`, dire à la caméra que c'est une chaîne locale.

## 6. Compte des gestes sur la Flex

| Geste | Nombre |
|---|---|
| Confirm d'adresse | 3 |
| Signature de mandat | 2 |
| Signature d'ordre | 3 |
| Approbation de lot | 3 |
| Total | 11 |
