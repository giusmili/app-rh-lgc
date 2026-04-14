# Intranet RH Next.js

Application intranet RH en `Next.js + TypeScript + Tailwind CSS` pour comparer plusieurs candidatures sans base de données ni stockage permanent.

## Fonctionnalités

- sélection d'un métier cible : restauration, comptabilité, prof/formateur, informatique, chargé de formation
- critères pondérés préchargés et modifiables par métier
- import multi-documents candidats : `PDF`, `DOCX`, `TXT`
- extraction de texte côté serveur
- appel IA côté serveur avec clé protégée par variables d'environnement
- retour IA structuré en JSON, puis calcul d'un score pondéré par candidat
- comparatif clair, classement final et synthèse détaillée
- génération d'un rapport exportable en `Markdown`
- suppression des fichiers temporaires après traitement

## Positionnement RH

L'application est un outil d'aide à la décision. Elle ne prend pas la décision finale de recrutement et ne doit pas être utilisée comme mécanisme autonome de sélection.

## Démarrage

```bash
npm install
cp .env.example .env.local
npm run dev
```

Application disponible sur `http://localhost:3000`.

## Variables d'environnement

```env
AI_API_KEY=your_server_side_api_key
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4.1-mini
```

Notes :

- `AI_API_KEY` n'est jamais exposée au client.
- `AI_API_URL` est prévu pour une API compatible `chat completions` renvoyant du JSON.
- l'appel IA se fait uniquement dans `app/api/analyze/route.ts`

## Architecture

```text
app/
  api/
    analyze/route.ts   -> import, extraction, appel IA, scoring
    report/route.ts    -> export de rapport Markdown
  layout.tsx
  page.tsx
components/
  hr-wizard.tsx        -> UI par étapes
lib/
  ai-schema.ts         -> validation du JSON IA
  job-profiles.ts      -> métiers et critères par défaut
  types.ts             -> types partagés
  utils.ts             -> helpers
  server/
    ai-client.ts       -> client IA côté serveur
    document-parser.ts -> extraction PDF / DOCX / TXT + nettoyage temp
    report.ts          -> génération du rapport
    scoring.ts         -> calcul du score pondéré et classement
```

## Flux de traitement

1. L'utilisateur choisit un métier cible.
2. Il ajuste les critères et leurs poids.
3. Il importe plusieurs documents candidats.
4. Le serveur écrit chaque fichier dans un dossier temporaire, extrait le texte, appelle l'IA, puis supprime le dossier temporaire.
5. Le serveur calcule le score pondéré, classe les candidats et renvoie un JSON exploitable par l'interface.
6. L'utilisateur télécharge un rapport exportable.

## Retour IA attendu

Le prompt serveur impose un JSON strict contenant :

```json
{
  "summary": "Synthèse courte",
  "globalComment": "Commentaire global argumenté",
  "confidence": 78,
  "strengths": ["point fort"],
  "risks": ["point de vigilance"],
  "recommendedInterviewFocus": ["axe d'entretien"],
  "criteria": [
    {
      "criterionId": "expertise-technique",
      "label": "Expertise technique",
      "score": 82,
      "rationale": "Justification"
    }
  ]
}
```

Le schéma est validé côté serveur avec `zod`.

## Sécurité et confidentialité

- aucun stockage permanent des fichiers
- suppression des fichiers temporaires après analyse
- aucune base de données
- clé API accessible uniquement côté serveur
- pas de décision RH automatisée finale

## Extensibilité

- ajouter un métier : enrichir `lib/job-profiles.ts`
- changer de fournisseur IA compatible : modifier `.env.local`
- enrichir le rapport : adapter `lib/server/report.ts`
- ajouter des règles métier ou garde-fous : compléter `lib/server/scoring.ts` et `lib/server/ai-client.ts`
