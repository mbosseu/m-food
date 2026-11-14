# M'foods — site vitrine (démo)

Site multi-pages pour **M'foods** (Yaoundé) : huile de piment et piment en poudre.
HTML / CSS / JavaScript sans framework, animations **GSAP 3.12 + ScrollTrigger** (hébergés dans `assets/vendor`). Déployé sur Vercel avec URL propres (`vercel.json`).

## Pages
| Fichier | Contenu |
|---|---|
| `index.html` (`/`) | Accueil : héros interactif (changement de produit, ingrédients flottants, braises), engagements, gamme, recettes, appel revendeurs |
| `produits.html` (`/produits`) | Fiches Huile de piment / Piment en poudre + comparatif |
| `recettes.html` (`/recettes`) | 4 recettes camerounaises |
| `histoire.html` (`/histoire`) | Valeurs, savoir-faire (frise), chiffres |
| `revendeur.html` (`/revendeur`) | Avantages, étapes, formulaire → WhatsApp, FAQ |
| `contact.html` (`/contact`) | WhatsApp, téléphone, carte, formulaire → WhatsApp |

## Lancer en local
```bash
python serve.py
```
puis ouvrir http://localhost:5173 (URL propres : `/produits`, `/recettes`… comme sur Vercel).

## Structure
- `assets/css/style.css` — design system (couleurs, typo, composants, responsive)
- `assets/js/main.js` — commun : rideau de transition, menu, animations au défilement, compteurs, FAQ, formulaires WhatsApp
- `assets/js/hero.js` — héros de l'accueil (produits définis dans l'objet `PRODUCTS`)
- `assets/img/` — visuels WebP optimisés (générés avec FLORA) + `og-mfoods.jpg` (aperçu de partage)
- `_sources/` — originaux haute définition (**ne pas mettre en ligne**)

## Personnaliser
- Numéro WhatsApp : constante `WA_NUMBER` dans `main.js` + liens `wa.me/237672766288` dans les pages.
- Réseaux sociaux : liens `href="#"` de la page Contact.
- Les textes « conditions revendeurs », horaires, adresse exacte sont génériques : à valider avec la cliente.

## Performance
- Polices (`assets/fonts`) et GSAP (`assets/vendor`) hébergés localement, scripts en `defer`.
- Images WebP en plusieurs tailles (`-640` / `-1100`, `-sm` pour les vignettes) avec `srcset`.
- Rideau de transition uniquement lors d'une navigation interne ; pages préchargées au survol.
- `_headers` : règles de cache navigateur (Netlify / Cloudflare Pages).

## Mise en ligne
Glisser le dossier (sans `_sources/` ni `.claude/`) sur https://app.netlify.com/drop, ou publier via GitHub Pages.
