# BEHOUSE — Documentation de Conception de la Plateforme

**Version :** 0.4 (Draft de travail)
**Date :** Septembre 2026
**Statut :** Document vivant — moteur du projet, à valider avant le cahier des charges détaillé

---

## 0. Objet de ce document

Ce document est le **moteur du projet Behouse**. Il ne contient aucune ligne de code : il définit *pourquoi* on construit la plateforme, *pour qui*, *comment elle est structurée fonctionnellement*, et *dans quel ordre* on va la construire. C'est le document de référence auquel on reviendra à chaque étape du développement pour vérifier qu'on reste aligné avec l'objectif initial.

Modèle d'inspiration : **theflex.global** — une plateforme de location d'appartements **meublés** ("flexible living", courte/moyenne durée) avec réservation directe, fiche bien détaillée, gestion locataire/propriétaire via un PMS (Property Management System) propriétaire.

### Décisions actées (v0.3)

| Sujet | Décision |
|---|---|
| Type de location | **Meublés uniquement** (courte/moyenne durée), pas de bail longue durée classique |
| Modèle économique | **Commission par réservation, fixée à 10%** du montant de la réservation |
| Portée du MVP | **Multi-agences dès le départ** (pas de report en V2) — développement assisté par IA jugé assez rapide pour intégrer la couche agence directement |
| Page d'accueil Behouse | **Fusionnée avec la page de recherche/listing** — pas de page d'accueil "vitrine" séparée, l'utilisateur arrive directement sur l'outil de recherche |
| Relation agence ↔ propriétaire | **Hors périmètre de Behouse.** La plateforme ne gère que la relation **Agence ↔ Locataire ↔ Plateforme**. Ce que l'agence fait avec le propriétaire du bien (répartition des revenus, contrat, etc.) est géré en dehors de Behouse |

**Positionnement de Behouse :** contrairement à The Flex (opérateur unique gérant tous ses biens), **Behouse est dès le lancement une marketplace multi-agences** : plusieurs agences immobilières indépendantes s'inscrivent sur Behouse, publient leurs propres biens meublés, ont leur propre vitrine ("page à propos" + fiches biens à leur nom) et leur propre back-office de gestion — tout en restant supervisées par un admin global Behouse qui prélève 10% de commission sur chaque réservation.

---

## 1. Vision & Objectifs du projet

### 1.1 Vision
Faire de Behouse la plateforme de référence où plusieurs agences immobilières peuvent, chacune sous sa propre identité, proposer leurs biens meublés à la location courte/moyenne durée, tout en bénéficiant de l'audience, de la technologie et de la confiance de la marque Behouse — "The Flex, mais ouvert à plusieurs agences".

### 1.2 Objectifs business
1. **Objectif 1 — Marketplace multi-agences dès le lancement.** Permettre à un nombre illimité d'agences de s'inscrire, de faire valider leur profil, et de publier leurs biens meublés sur Behouse.
2. **Objectif 2 — Expérience locataire unifiée.** Le visiteur/locataire final vit une expérience de recherche et de réservation cohérente sur Behouse, quelle que soit l'agence propriétaire du bien (comme sur The Flex, en plus riche).
3. **Objectif 3 — Autonomie des agences.** Chaque agence gère ses biens, ses réservations, son équipe et sa vitrine sans dépendre d'un développeur ou de l'équipe Behouse.
4. **Objectif 4 — Supervision centralisée.** Behouse (admin global) garde un contrôle total : validation des agences, modération des annonces, gestion des paiements/commissions, statistiques globales, résolution de litiges.
5. **Objectif 5 — Monétisation.** Commission de **10%** prélevée automatiquement sur chaque réservation payée (voir section 9).

### 1.3 Ce que Behouse n'est PAS (pour cadrer le périmètre)
- Ce n'est pas un simple annuaire d'agences (il y a un vrai moteur de réservation + paiement en ligne).
- Ce n'est pas un CRM immobilier complet type logiciel de gestion de patrimoine (pas de comptabilité fiscale complexe dans le MVP).
- Ce n'est pas une plateforme de vente immobilière — focus 100% location meublée.
- Ce n'est pas une plateforme de location longue durée (pas de gestion de bail résidentiel classique).
- **Ce n'est pas un outil de gestion de la relation agence ↔ propriétaire** : Behouse s'arrête à la relation Agence ↔ Locataire ↔ Plateforme. La façon dont l'agence reverse ou gère ses revenus avec le propriétaire du bien ne relève pas du système.

---

## 2. Les acteurs de la plateforme

| Acteur | Description | Portée |
|---|---|---|
| **Super Admin Behouse** | Équipe Behouse. Contrôle total de la plateforme : validation des agences, modération, commissions, statistiques globales. | Globale |
| **Agence** | Entité inscrite sur Behouse (ex : "Agence Dupont Immo"). Possède un espace dédié dès son inscription. | Une agence |
| **Admin Agence** | Le/la responsable de l'agence. Gère le dashboard agence, l'équipe, les biens, la page à propos. | Une agence |
| **Agent / Collaborateur d'agence** | Membre de l'équipe d'une agence, droits restreints (ex : gérer les biens mais pas la facturation). | Une agence |
| **Locataire / Client final** | Le visiteur qui recherche, consulte et réserve un bien meublé, quelle que soit l'agence propriétaire. | Global (toutes agences) |
| **Visiteur anonyme** | Utilisateur non connecté qui parcourt le site public. | Global |

> ℹ️ **Le propriétaire du bien n'est pas un acteur de la plateforme Behouse.** Il est le client de l'agence, pas de Behouse : c'est l'agence qui gère cette relation en interne (contrat, reversement, reporting). Behouse ne prévoit donc ni compte, ni espace, ni entité "Owner" dans le système.

---

## 3. Architecture fonctionnelle multi-tenant (dès le MVP)

Behouse est pensé dès le départ comme une architecture **multi-tenant** : une seule plateforme technique, mais des espaces logiquement séparés par agence.

```
                         ┌────────────────────────────┐
                         │        BEHOUSE (global)      │
                         │  Site public + Admin global  │
                         │  Commission 10% par réservation│
                         └───────────────┬──────────────┘
                                         │
        ┌────────────────┬───────────────┼───────────────┬────────────────┐
        │                 │               │               │                │
   ┌────▼────┐       ┌────▼────┐     ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
   │ Agence A │       │ Agence B │     │ Agence C │     │ Agence D │     │  ...   │
   │ - Page   │       │ - Page   │     │ - Page   │     │ - Page   │     │        │
   │   à propos│      │   à propos│    │   à propos│    │   à propos│    │        │
   │ - Biens   │      │ - Biens   │    │ - Biens   │    │ - Biens   │    │        │
   │ - Dashboard│      │- Dashboard│    │- Dashboard│    │- Dashboard│    │        │
   │   admin   │      │   admin   │    │   admin   │    │   admin   │    │        │
   └──────────┘       └──────────┘     └──────────┘     └──────────┘     └────────┘
```

### 3.1 Principes clés
- Chaque **agence = un "tenant"** avec ses propres données (biens, réservations, équipe, statistiques) isolées logiquement : une seule base de données, avec un `agency_id` sur chaque table concernée (biens, réservations, équipe...) suffit pour démarrer — pas besoin d'infrastructure séparée par agence.
- Le **Super Admin Behouse voit tout**, transversalement, et prélève sa commission de 10% sur chaque réservation, peu importe l'agence.
- Un **Admin Agence ne voit que les données de son agence.**
- Le **locataire final** ne "sent" pas la séparation technique : il navigue Behouse comme un tout (recherche globale mélangeant toutes les agences), et découvre l'agence propriétaire au niveau de la fiche bien / page agence.

---

## 4. Cartographie des espaces (front-end)

### 4.1 Site public Behouse (vitrine + marketplace)
- **Accueil = Page de recherche/listing** : pas de page vitrine séparée. L'utilisateur arrive directement sur l'outil de recherche (barre de recherche mise en avant : ville, dates, budget) avec les résultats/biens affichés en dessous, filtres (ville, prix, type de bien, dates, nombre de pièces...), résultats mélangeant les biens de toutes les agences.
- **Fiche bien** : photos, description, équipements, calendrier de disponibilité, prix, **encart "Proposé par [Agence X]"** avec lien vers la page de l'agence.
- **Page "à propos" par agence** : présentation de l'agence (logo, histoire, zone de couverture, avis), liste de ses biens actifs. Vitrine publique hébergée sous Behouse (ex : `behouse.com/agences/agence-dupont`), éditée par l'agence elle-même depuis son dashboard.
- **Page Behouse "à propos" globale** : présentation de la plateforme (différente de celle des agences), accessible depuis un lien de navigation (pas la page d'accueil).
- **Compte locataire** : mes réservations, mes favoris, mes messages avec les agences.
- **Réservation + paiement en ligne** : sélection dates → paiement → confirmation, avec commission Behouse (10%) calculée automatiquement.

### 4.2 Dashboard Admin Agence (par agence, indépendant)
- **Tableau de bord** : réservations en cours, revenus (après commission), taux d'occupation, messages non lus.
- **Gestion des biens** : créer/modifier/publier/dépublier une annonce, photos, tarifs, calendrier de disponibilités.
- **Gestion des réservations** : accepter/refuser (si validation manuelle activée), calendrier, historique, remboursements.
- **Gestion de l'équipe** : inviter des agents, définir leurs droits.
- **Page "à propos" de l'agence** : édition du contenu public (logo, description, photos, coordonnées).
- **Messagerie** : échanges avec les locataires/prospects.
- **Statistiques agence** : performance de ses biens, revenus, avis clients.
- **Paramètres agence** : informations légales, coordonnées bancaires (pour recevoir les 90% après commission Behouse).

### 4.3 Dashboard Admin Global Behouse (Super Admin)
- **Vue d'ensemble plateforme** : nombre d'agences, nombre de biens, volume de réservations, revenus Behouse (commissions 10%).
- **Gestion des agences** : valider/suspendre une inscription d'agence, consulter/modifier leurs infos, voir leurs performances.
- **Modération des annonces** : valider les nouveaux biens avant publication (optionnel selon niveau de confiance voulu), signaler/retirer un contenu.
- **Gestion des utilisateurs finaux** : support, litiges, comptes signalés.
- **Facturation & commissions** : suivi des commissions (10%) dues par/prélevées à chaque agence, génération de factures.
- **Contenu global** : gestion de la page d'accueil Behouse, mise en avant d'agences/biens, blog éventuel.
- **Statistiques globales & reporting**.
- **Paramètres plateforme** : taux de commission (défaut 10%, modifiable par agence si besoin plus tard), règles de modération, CGU.

---

## 5. Modules fonctionnels détaillés

| Module | Description | Priorité |
|---|---|---|
| **Authentification & rôles** | Inscription/connexion pour les profils : locataire, agent, admin agence, super admin Behouse. Permissions fines. | MVP |
| **Onboarding agence** | Formulaire d'inscription agence → validation par Behouse → activation du dashboard agence. | MVP |
| **Gestion des biens meublés** | CRUD annonce, photos multiples, équipements, localisation (carte), prix, statut, rattachement à l'agence. | MVP |
| **Calendrier de disponibilité** | Blocage/déblocage de dates par bien, durée min/max de séjour. | MVP |
| **Moteur de recherche** | Recherche multi-critères, filtres, tri, pagination, carte interactive, toutes agences confondues. | MVP |
| **Réservation + paiement en ligne** | Sélection dates → paiement → confirmation. Calcul automatique de la **commission Behouse (10%)** et du **reversement agence (90%)**. | MVP |
| **Paiement** | Intégration passerelle de paiement (Stripe, Mobile Money selon marché cible), split automatique du paiement (agence 90% / Behouse 10%). | MVP |
| **Page "à propos" par agence** | Vitrine publique éditable par l'agence. | MVP |
| **Dashboard agence indépendant** | Gestion biens/réservations/équipe/statistiques, scoping strict par `agency_id`. | MVP |
| **Messagerie** | Chat locataire ↔ agence, avec historique. | V1 |
| **Avis & notation** | Avis sur les biens et sur les agences. | V1 |
| **Notifications** | Email/SMS/push pour réservations, messages, validations. | MVP (email) → V1 (SMS/push) |
| **Statistiques & reporting** | Par agence et globales pour Behouse. | V1 |
| **Multi-langue / multi-devise** | Si ambition internationale comme The Flex. | V2 |
| **Application mobile** | Si besoin. | V2 |
| **Outils marketing agence** | Mise en avant payante, boost d'annonce. | V2 |

---

## 6. Modèle de données — vue conceptuelle (haut niveau)

*(À affiner en base de données réelle lors de la phase technique — ceci est la structure conceptuelle)*

- **User** (id, rôle: super_admin / agency_admin / agent / tenant, email, ...)
- **Agency** (id, nom, description, logo, page_a_propos_content, statut: pending/approved/suspended, coordonnées bancaires, taux_commission par défaut = 10%)
- **AgencyMember** (user_id, agency_id, rôle dans l'agence)
- **Property (Bien meublé)** (id, **agency_id**, titre, description, type, adresse, prix, photos[], équipements[], statut, calendrier de disponibilités)
- **Booking (Réservation)** (id, property_id, tenant_user_id, dates, statut, montant_total, montant_commission_behouse (10%), montant_reverse_agence (90%))
- **Payment** (id, booking_id, montant, statut, split_agence/split_behouse, date)
- **Review** (id, auteur_id, cible_type: property/agency, note, commentaire)
- **Message** (id, conversation_id, expéditeur, contenu, date)

> **Relation clé :** `Property.agency_id` est la colonne qui permet le multi-tenant — chaque bien appartient à une seule agence, et tous les filtrages du dashboard agence se basent sur cet identifiant. `Booking.montant_commission_behouse` est calculé automatiquement à 10% du montant total à chaque réservation. **Aucune entité "Owner/Propriétaire" n'est modélisée** : cette relation reste interne à chaque agence, hors du système Behouse.

---

## 7. Parcours utilisateurs clés (User Flows)

### 7.1 Parcours "Agence" (onboarding)
1. L'agence s'inscrit sur Behouse (formulaire + documents légaux, coordonnées bancaires).
2. Le Super Admin Behouse valide (ou rejette) la demande.
3. L'agence reçoit un accès à son **Dashboard Admin Agence**.
4. L'agence configure sa **page à propos** et ajoute ses premiers biens meublés.
5. Les biens passent en modération (optionnel) puis sont publiés sur Behouse.

### 7.2 Parcours "Locataire"
1. Le visiteur arrive sur Behouse, recherche un bien meublé (ville, dates, budget) directement depuis la page d'accueil = page de recherche.
2. Il consulte une fiche bien, voit qu'elle est proposée par "Agence X" (lien vers sa page à propos).
3. Il réserve et paie en ligne.
4. Le paiement est automatiquement scindé : 10% pour Behouse, 90% reversés à l'agence. **Ce que l'agence fait ensuite avec le propriétaire du bien ne concerne pas la plateforme.**
5. Le locataire suit sa réservation depuis son compte.

### 7.3 Parcours "Super Admin Behouse"
1. Supervise les nouvelles inscriptions d'agences.
2. Surveille les annonces et les signalements.
3. Suit les commissions (10%) générées par chaque agence.
4. Anime la page d'accueil (mise en avant, promotions).

---

## 8. Roadmap de développement proposée

### Phase 0 — Fondations (ce document + suivants)
- Valider ce document de vision. ✅ (en cours — dernières décisions actées : commission 10%, multi-agences dès le MVP)
- Rédiger le cahier des charges fonctionnel détaillé (spécifications écran par écran) — **prochaine étape**.
- Choisir la stack technique (à documenter séparément).
- Maquettes UI/UX (wireframes) du site public, du dashboard agence, du dashboard Behouse.

### Phase 1 — MVP (multi-agences dès le départ)
- Authentification multi-rôles (locataire, agent, admin agence, super admin Behouse).
- Onboarding agence + validation Behouse.
- CRUD biens meublés (dashboard agence), calendrier de disponibilité.
- Site public : page d'accueil = recherche globale + fiche bien + page à propos par agence + page à propos Behouse.
- Réservation + paiement en ligne + split automatique 10% (Behouse) / 90% (agence).
- Dashboard admin agence (biens, réservations, équipe, page à propos, statistiques).
- Dashboard admin global Behouse (validation agences, modération, vue globale, commissions).

### Phase 2 — V1 (consolidation)
- Messagerie locataire ↔ agence.
- Avis & notation (biens + agences).
- Statistiques & reporting avancés (par agence + globales).
- Notifications SMS/push.
- Outils de gestion propriétaire plus riches (export revenus, historique).

### Phase 3 — V2 (croissance)
- Multi-langue / multi-devise.
- Application mobile.
- Outils marketing pour les agences (mise en avant payante, boost d'annonce).
- Taux de commission personnalisable par agence (au-delà du 10% par défaut, si accords spécifiques).
- Automatisations avancées (type PMS de The Flex : synchronisation calendrier externe, etc.)

---

## 9. Modèle économique — ✅ tranché : commission de 10% par réservation

Behouse prélève **10% du montant de chaque réservation payée**, quelle que soit l'agence propriétaire du bien.

```
Locataire paie 100 → Behouse retient 10 (commission) → Agence reçoit 90
```

- Le split est **automatique** au moment du paiement (pas de facturation manuelle a posteriori) : la passerelle de paiement doit supporter un split de transaction (ex : Stripe Connect ou équivalent selon le marché cible), afin que Behouse reçoive directement ses 10% et que l'agence reçoive directement ses 90%.
- ✅ **Tranché : Behouse ne gère pas la relation agence ↔ propriétaire.** Ce que l'agence fait de ses 90% (rétrocession au propriétaire selon son propre contrat) est entièrement hors périmètre de la plateforme. Behouse s'arrête à la relation **Agence ↔ Locataire ↔ Plateforme** — aucun 3ᵉ niveau de split, aucune entité "Owner" dans le système (voir section 6).
- Le taux de 10% est stocké comme **valeur par défaut au niveau plateforme**, mais rattaché à chaque `Agency` en base (`taux_commission`), pour permettre plus tard des taux négociés par agence sans changer la structure.

---

## 10. Prochaines étapes immédiates

1. ~~Valider ce document (vision, acteurs, périmètre)~~ ✅
2. ~~Trancher le type de location et le modèle économique~~ ✅ (meublés + commission 10%)
3. ~~Trancher la portée du MVP (multi-agences ou pas)~~ ✅ (multi-agences dès le MVP)
4. ~~Trancher le périmètre de la relation propriétaire~~ ✅ (hors scope Behouse — agence↔locataire↔plateforme uniquement)
5. ~~Trancher la structure de la page d'accueil~~ ✅ (fusionnée avec la recherche/listing)
6. Produire le **cahier des charges fonctionnel détaillé** (écran par écran, avec les champs exacts) pour : onboarding agence, dashboard agence, dashboard Behouse, site public (accueil/recherche, fiche bien, page agence), réservation/paiement.
7. Produire les **wireframes** (site public / dashboard agence / dashboard Behouse).
8. Choisir et documenter la **stack technique**.
9. Découper en tickets de développement (backlog Phase 1 / MVP).

---

*Fin du document v0.4 — périmètre du MVP verrouillé : multi-agences dès le départ, commission 10%, accueil = recherche, pas de gestion de la relation agence↔propriétaire. Prêt à passer au cahier des charges fonctionnel détaillé, sauf remarque complémentaire de votre part.*
