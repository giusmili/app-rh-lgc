import type { TargetJob } from "@/lib/types";

export const JOB_PROFILES: TargetJob[] = [
  {
    id: "restauration",
    label: "Restauration",
    summary: "Postes de service, cuisine, gestion de cadence et relation client.",
    criteria: [
      {
        id: "experience-terrain",
        label: "Expérience terrain",
        description: "Temps d'expérience en salle, cuisine ou production.",
        weight: 30
      },
      {
        id: "cadence-rigueur",
        label: "Cadence et rigueur",
        description: "Capacité à travailler vite, proprement et dans le respect des procédures.",
        weight: 25
      },
      {
        id: "service-client",
        label: "Relation client",
        description: "Qualité de service, communication et posture.",
        weight: 20
      },
      {
        id: "hygiene-securite",
        label: "Hygiène et sécurité",
        description: "Maîtrise HACCP, règles sanitaires et sécurité.",
        weight: 25
      }
    ]
  },
  {
    id: "comptabilite",
    label: "Comptabilité",
    summary: "Postes comptables, administratifs et financiers.",
    criteria: [
      {
        id: "maitrise-technique",
        label: "Maîtrise comptable",
        description: "Comptabilité générale, clôtures, TVA, bilan, normes usuelles.",
        weight: 35
      },
      {
        id: "outils",
        label: "Outils et logiciels",
        description: "ERP, Excel, logiciels comptables, automatisation.",
        weight: 20
      },
      {
        id: "fiabilite",
        label: "Fiabilité et précision",
        description: "Rigueur, exactitude, respect des délais.",
        weight: 25
      },
      {
        id: "analyse",
        label: "Analyse et communication",
        description: "Capacité d'analyse et restitution aux interlocuteurs internes.",
        weight: 20
      }
    ]
  },
  {
    id: "prof-formateur",
    label: "Prof / Formateur",
    summary: "Enseignement, animation pédagogique et transmission.",
    criteria: [
      {
        id: "pedagogie",
        label: "Pédagogie",
        description: "Construction de parcours, méthodes d'animation, adaptation aux publics.",
        weight: 35
      },
      {
        id: "expertise-metier",
        label: "Expertise métier",
        description: "Niveau de maîtrise de la discipline ou du domaine enseigné.",
        weight: 25
      },
      {
        id: "evaluation",
        label: "Évaluation et suivi",
        description: "Capacité à évaluer, accompagner et faire progresser.",
        weight: 20
      },
      {
        id: "communication",
        label: "Communication",
        description: "Clarté, posture, aisance relationnelle et gestion de groupe.",
        weight: 20
      }
    ]
  },
  {
    id: "informatique",
    label: "Informatique",
    summary: "Développement, support, infrastructures et produit.",
    criteria: [
      {
        id: "expertise-technique",
        label: "Expertise technique",
        description: "Stack, architecture, qualité de code, méthodes et outils.",
        weight: 35
      },
      {
        id: "resolution-problemes",
        label: "Résolution de problèmes",
        description: "Capacité d'analyse, debug et prise de recul.",
        weight: 25
      },
      {
        id: "collaboration",
        label: "Collaboration",
        description: "Travail d'équipe, communication et documentation.",
        weight: 20
      },
      {
        id: "apprentissage",
        label: "Adaptabilité",
        description: "Montée en compétence, curiosité et veille.",
        weight: 20
      }
    ]
  },
  {
    id: "charge-formation",
    label: "Chargé de formation",
    summary: "Pilotage des plans de formation et coordination des dispositifs.",
    criteria: [
      {
        id: "ingenierie",
        label: "Ingénierie de formation",
        description: "Analyse des besoins, construction d'offres et dispositifs.",
        weight: 30
      },
      {
        id: "coordination",
        label: "Coordination",
        description: "Planification, suivi administratif et relation avec les parties prenantes.",
        weight: 25
      },
      {
        id: "reglementaire",
        label: "Cadre réglementaire",
        description: "Compréhension des obligations, financements et indicateurs formation.",
        weight: 20
      },
      {
        id: "communication",
        label: "Communication et accompagnement",
        description: "Accompagnement des managers, formateurs et apprenants.",
        weight: 25
      }
    ]
  }
];

export const JOB_PROFILE_MAP = Object.fromEntries(
  JOB_PROFILES.map((job) => [job.id, job])
) as Record<TargetJob["id"], TargetJob>;
