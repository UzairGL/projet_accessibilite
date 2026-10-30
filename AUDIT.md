# Audit AtelierLocal

## Binôme et environnement

- Membres : Noah Contal, Théo Gile
- Navigateur et version : Firefox 159.0 (macOS).

## Élément vérifié et conservé

Le lien d’évitement « Aller aux ateliers » marche bien au clavier : il apparaît au premier Tab avec un focus visible, Entrée amène à « Les prochains ateliers », et le Tab suivant va directement sur le champ de recherche.

## Problème 1 - Consulter les détails d’un atelier est impossible au clavier

### Problème identifié

« Détails de l’atelier » est une `div` avec juste un `onClick` : pas atteignable au Tab, pas activable avec Entrée/Espace, et pas de rôle ni d’état pour le lecteur d’écran. Au clavier, on ne peut donc pas lire la description.

En plus, le panneau fermé est juste caché visuellement avec `aria-hidden="true"`, mais son lien « Consulter les informations pratiques » reste focalisable : le focus part sur un lien invisible et sans nom.

### Reproduction

1. Cliquer dans le champ de recherche puis Tab.
2. Le focus saute « Détails de l’atelier » et va direct sur « M’inscrire à … ».
3. En continuant au Tab, le focus disparaît sur le lien caché du panneau.

### Comportement attendu

La commande doit être atteignable au Tab, activable avec Entrée/Espace, et annoncer son rôle (bouton) et son état (ouvert/fermé). Panneau fermé = contenu ni visible ni focalisable.

### Correction à apporter

Utiliser un `<button type="button">` avec `aria-expanded` et `aria-controls`, et cacher le panneau avec `hidden` au lieu de `aria-hidden`.

Correction effectuée (`src/components/WorkshopCard.tsx`) : `<button type="button" className="details-trigger" aria-expanded={expanded} aria-controls={"details-" + id}>` et `<div id={"details-" + id} … hidden={!expanded}>`.

Vérification : Tab s’arrête sur le bouton, Entrée/Espace ouvre le panneau, `aria-expanded` passe à `true`. Le lien n’est atteignable que panneau ouvert. Les tests passent.

## Problème 2 - Le résultat de la préinscription n’est ni annoncé ni visible

### Problème identifié

Le message de confirmation après « M’inscrire à … » s’affiche tout en bas de la page, hors de l’écran, dans un simple `<p>`. Le lecteur d’écran n’annonce rien et visuellement on a l’impression que rien ne se passe (risque de cliquer plusieurs fois).

### Reproduction

1. Au clavier, Espace sur « M’inscrire à Une tasse en céramique ».
2. Rien ne change près de la carte, il faut scroller en bas pour voir le message.
3. Dans les DevTools, le `<p class="notice">` n’a ni `role="status"` ni `aria-live`.

### Comportement attendu

Le message doit apparaître près des cartes et être annoncé, sans déplacer le focus.

### Correction à apporter

Mettre `role="status"` et `aria-atomic="true"` sur le paragraphe (présent dès le chargement, même vide) et le déplacer juste après les cartes.

Correction effectuée (`src/App.tsx`) : `.registration-result` déplacé à la fin de `#catalogue`, avec `role="status" aria-atomic="true"`.

Vérification : le message s’affiche sous les cartes, le focus reste sur le bouton et `role="status"` est bien présent. Pas testé avec un vrai lecteur d’écran.

## Problème 3 - Le focus est invisible sur les boutons « M’inscrire »

### Problème identifié

La règle `.reserve-button:focus-visible{outline:none;box-shadow:none}` supprime le focus sur ces boutons. Au clavier, on ne sait pas où on est et on peut s’inscrire au mauvais atelier.

### Reproduction

Parcourir les cartes au Tab : le contour disparaît sur les boutons « M’inscrire ». Dans les DevTools : `outline-style: none`.

### Comportement attendu

Toutes les commandes doivent avoir un focus visible.

### Correction à apporter

Supprimer cette règle pour garder le style global `button:focus-visible`.

Correction effectuée (`src/styles.css`) : règle `.reserve-button:focus-visible{…}` supprimée.

Vérification : contour violet de trois px visible sur les boutons « M’inscrire ».

## Problème 4 - Le champ de recherche n’a pas de libellé

### Problème identifié

« Rechercher un atelier » est un `<p>` pas relié au champ et l’aide non plus. Le champ n’a pas de nom accessible : le lecteur d’écran dit juste « champ de recherche », et cliquer sur le texte ne met pas le focus dans le champ.

### Reproduction

Dans l’onglet Accessibility des DevTools, le Name de l’`input` est vide. Cliquer sur le libellé ne fait rien.

### Comportement attendu

Le champ doit s’appeler « Rechercher un atelier » et avoir l’aide comme description.

### Correction à apporter

Utiliser un `<label htmlFor="workshop-search">` et `aria-describedby` pour l’aide.

Correction effectuée (`src/App.tsx`) : `<label className="search-label" htmlFor="workshop-search">`, `aria-describedby="search-help"` sur le champ et `id="search-help"` sur l’aide.

Vérification : le champ s’appelle bien « Rechercher un atelier » avec sa description, et cliquer sur le libellé met le focus dedans. Les tests passent.

## Problème 5 - Les titres des ateliers ne sont pas des titres

### Problème identifié

Le nom des ateliers est un `<p class="workshop-title">` stylé comme un titre. Avec un lecteur d’écran, on ne peut pas naviguer entre les ateliers par titres.

### Reproduction

Lister les titres de la page : h1, h2 « Les prochains ateliers », puis h2 « Une découverte, simplement. ». Aucun atelier.

### Comportement attendu

Chaque atelier doit avoir un h3 sous « Les prochains ateliers ».

### Correction à apporter

Remplacer le `<p>` par un `<h3>` en gardant la classe.

Correction effectuée (`src/components/WorkshopCard.tsx`) : `<h3 className="workshop-title">{workshop.title}</h3>`.

Vérification : les trois ateliers apparaissent en h3 dans la liste des titres, et l’apparence ne change pas.

## Problème 6 - Une illustration n’a pas d’alternative textuelle

### Problème identifié

L’image de « Premiers pas en sérigraphie » n’a pas d’`alt` (les autres ont `alt=""`). Le lecteur d’écran peut lire le nom du fichier, ce qui ne sert à rien car l’image est décorative.

### Reproduction

Inspecter les `img` : la première n’a pas d’`alt`, les deux autres ont `alt=""`.

### Comportement attendu

Les images décoratives doivent être ignorées par les lecteurs d’écran.

### Correction à apporter

Mettre `alt=""` sur toutes les images des cartes.

Correction effectuée (`src/components/WorkshopCard.tsx`) : `<img src={workshop.image} alt="" />` pour toutes les cartes.

Vérification : les trois images ont `alt=""` et ne sont plus dans l’arbre d’accessibilité.

## Composant créé

Fichiers : `src/components/QuestionDialog.tsx` et `src/App.tsx`. Pas de changement CSS, on utilise les classes déjà prévues.

- **Bon atelier** : chaque carte a un bouton « Poser une question sur {titre} » (via `extraAction`), donc un nom différent par atelier, même pour l’atelier complet. La confirmation utilise le `workshopId` renvoyé par `readRequest`.
- **Modale** : `<dialog>` natif avec `showModal()`, donc le Tab reste dans la fenêtre. Le dialogue est nommé par son titre (`aria-labelledby`) et le focus va sur ce titre à l’ouverture (`tabIndex={-1}`).
- **Fermer** : Échap, la croix (`aria-label="Fermer"`) ou « Annuler ». Rien n’est envoyé et le focus revient sur le bouton qui a ouvert la fenêtre.
- **Formulaire** : un `<label>` visible par champ avec « (obligatoire) ». `select` natif avec un premier choix vide « Choisissez un sujet », donc rien n’est présélectionné. Adresse en `type="email"`.
- **Erreurs** : `noValidate` + `readRequest`. Si l’envoi échoue, la fenêtre reste ouverte, le focus va sur le premier champ en erreur, qui a `aria-invalid="true"` et son message relié par `aria-describedby`. Les saisies sont gardées.
- **Confirmation** : après un envoi valide, la fenêtre se ferme, le focus revient sur le bouton et « Question envoyée pour « Une tasse en céramique ». Sujet : Le matériel à apporter. » s’affiche dans la région `role="status"` de la préinscription. Pas d’adresse dans le message.

### Vérifications

Au clavier dans le navigateur :

1. Entrée sur « Poser une question sur Une tasse en céramique » : la modale s’ouvre, focus sur le titre, aucun sujet choisi.
2. Tab en boucle : croix, sujet, adresse, question, « Envoyer », « Annuler », puis retour à la croix sans sortir.
3. Sujet « Le matériel à apporter », une question, adresse vide, « Envoyer » : la fenêtre reste ouverte, le focus va sur l’adresse avec son erreur, le sujet et la question sont gardés, pas de confirmation.
4. Adresse valide puis Entrée : la fenêtre se ferme, le focus revient sur le bouton, la confirmation donne le bon atelier et le bon sujet.
5. Envoi vide : trois erreurs, focus sur le sujet. Question avec seulement des espaces : « Écrivez votre question. ». Échap et « Annuler » ferment sans rien envoyer.

Le choix du sujet au clavier utilise le comportement natif du `select`. Pas testé avec un vrai lecteur d’écran.

## Mini-test

...
