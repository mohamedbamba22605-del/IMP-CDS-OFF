// src/config/roles.js
// Hiérarchie officielle Capital du Savoir — Note d'Information N°0002

export const ROLES = {

  // ━━━ NIVEAU 1 ━━━
  CEO: {
    id: "CEO",
    label: "CEO — Chef d'Entreprise",
    shortLabel: "CEO",
    description: "Premier responsable. Définit la vision, valide les budgets, signe les documents officiels et exerce un droit de veto irrévocable sur toutes les décisions stratégiques.",
    color: "#D4AF37",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    level: 100,
    canVeto: true,
    hierarchyLevel: 1,
    permissions: [
      "view_citadelle", "manage_treasury", "approve_treasury", "veto_actions",
      "view_radio_qg", "submit_report", "archive_pv", "manage_archives",
      "view_arsenal", "manage_crm", "create_tdr", "manage_tdr", "approve_tdr",
      "view_pegazus", "manage_roles", "view_security_logs",
      "use_jarvis"
    ]
  },

  // ━━━ NIVEAU 2 ━━━
  DIRECTEUR_GENERAL: {
    id: "DIRECTEUR_GENERAL",
    label: "Directeur Général & Cofondateur",
    shortLabel: "DG",
    description: "Supervise les activités opérationnelles. Coordonne les responsables, dirige les réunions, mène les procédures disciplinaires, attribue les rôles et informe régulièrement le CEO.",
    color: "#00F2FE",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    level: 90,
    canVeto: false,
    hierarchyLevel: 2,
    permissions: [
      "view_citadelle", "manage_treasury", "approve_treasury",
      "view_radio_qg", "submit_report", "archive_pv", "manage_archives",
      "view_arsenal", "manage_crm", "create_tdr", "manage_tdr", "approve_tdr",
      "view_pegazus", "manage_roles", "view_security_logs",
      "use_jarvis"
    ]
  },

  // ━━━ NIVEAU 3 ━━━
  SECRETAIRE_GENERAL: {
    id: "SECRETAIRE_GENERAL",
    label: "Secrétaire Général",
    shortLabel: "SG",
    description: "Assure la liaison administrative. Centralise les rapports triennaux, prépare les convocations, rédige les PV et tient les archives officielles.",
    color: "#10B981",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    level: 70,
    canVeto: false,
    hierarchyLevel: 3,
    permissions: [
      "view_radio_qg", "submit_report", "archive_pv", "manage_archives",
      "view_arsenal", "create_tdr",
      "use_jarvis"
    ]
  },

  // ━━━ NIVEAU 4 — RESPONSABLES DE DÉPARTEMENT ━━━
  RESPONSABLE_FINANCIERE: {
    id: "RESPONSABLE_FINANCIERE",
    label: "Responsable Financière",
    shortLabel: "R. Finance",
    description: "Gestion et traçabilité des ressources financières. Tient les comptes, conserve les justificatifs, prépare les budgets et alerte la hiérarchie en cas d'irrégularité.",
    color: "#F59E0B",
    badgeBg: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    level: 60,
    canVeto: false,
    hierarchyLevel: 4,
    permissions: [
      "view_citadelle", "manage_treasury", "upload_proofs",
      "view_radio_qg", "submit_report",
      "manage_tdr"
    ]
  },

  RESPONSABLE_ORGANISATION: {
    id: "RESPONSABLE_ORGANISATION",
    label: "Responsable à l'Organisation",
    shortLabel: "R. Org.",
    description: "Coordinateur opérationnel. Prépare la logistique, répartit les tâches, pilote le Comité Exécutif de chaque activité et produit le rapport organisationnel.",
    color: "#8B5CF6",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    level: 60,
    canVeto: false,
    hierarchyLevel: 4,
    permissions: [
      "view_arsenal", "manage_crm", "create_tdr", "manage_tdr",
      "view_radio_qg", "submit_report",
      "use_jarvis"
    ]
  },

  COMMUNICATRICE: {
    id: "COMMUNICATRICE",
    label: "Communicatrice",
    shortLabel: "Comm.",
    description: "Conçoit et exécute la stratégie de communication. Gère le calendrier éditorial, anime les réseaux sociaux, couvre les événements et suit les performances de publication.",
    color: "#EC4899",
    badgeBg: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    level: 60,
    canVeto: false,
    hierarchyLevel: 4,
    permissions: [
      "view_radio_qg", "submit_report",
      "view_arsenal",
      "use_jarvis"
    ]
  },

  GRAPHISTE: {
    id: "GRAPHISTE",
    label: "Graphiste",
    shortLabel: "Graph.",
    description: "Conçoit les supports visuels institutionnels : affiches, certificats, bannières. Respecte l'identité visuelle CDS (logo, couleurs, polices) sur chaque création.",
    color: "#F97316",
    badgeBg: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    level: 55,
    canVeto: false,
    hierarchyLevel: 4,
    permissions: [
      "view_radio_qg", "submit_report"
    ]
  },

  GESTIONNAIRE_PROJETS: {
    id: "GESTIONNAIRE_PROJETS",
    label: "Gestionnaire de Projets",
    shortLabel: "G. Projets",
    description: "Identifie, conçoit et suit les projets CDS. Rédige les TDR, chronogrammes, budgets et dossiers de financement. Produit les rapports d'avancement.",
    color: "#06B6D4",
    badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    level: 60,
    canVeto: false,
    hierarchyLevel: 4,
    permissions: [
      "view_arsenal", "create_tdr", "manage_tdr",
      "view_radio_qg", "submit_report",
      "use_jarvis"
    ]
  },

  RESPONSABLE_RELATIONS_EXTERIEURES: {
    id: "RESPONSABLE_RELATIONS_EXTERIEURES",
    label: "Responsable Relations Extérieures & Ambassadeurs",
    shortLabel: "R. Relations",
    description: "Développe les relations institutionnelles. Identifie les partenaires, rédige les offres de partenariat, coordonne les ambassadeurs et soumet toute proposition au CEO/DG avant engagement.",
    color: "#6366F1",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    level: 60,
    canVeto: false,
    hierarchyLevel: 4,
    permissions: [
      "view_arsenal", "manage_crm", "create_tdr", "manage_tdr",
      "view_radio_qg", "submit_report",
      "use_jarvis"
    ]
  },

  // ━━━ NIVEAU 5 — ADJOINTS ━━━
  ADJOINT: {
    id: "ADJOINT",
    label: "Adjoint(e)",
    shortLabel: "Adjoint",
    description: "Collaborateur direct d'un responsable. Assiste dans les tâches, assure l'intérim en cas d'absence et soumet des rapports réguliers.",
    color: "#94A3B8",
    badgeBg: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    level: 40,
    canVeto: false,
    hierarchyLevel: 5,
    permissions: [
      "view_radio_qg", "submit_report",
      "view_arsenal"
    ]
  },

  // ━━━ NIVEAU 6 — MEMBRES DU STAFF ━━━
  STAFF: {
    id: "STAFF",
    label: "Membre du Staff",
    shortLabel: "Staff",
    description: "Membre opérationnel de l'équipe. Exécute les tâches assignées et participe aux activités CDS selon les directives des responsables.",
    color: "#64748B",
    badgeBg: "bg-slate-600/20 text-slate-400 border-slate-600/40",
    level: 25,
    canVeto: false,
    hierarchyLevel: 6,
    permissions: [
      "view_radio_qg", "submit_report"
    ]
  },

  // ━━━ NIVEAU 7 — COLLABORATEURS EXTERNES ━━━
  AMBASSADEUR: {
    id: "AMBASSADEUR",
    label: "Ambassadeur / Volontaire / Stagiaire",
    shortLabel: "Ambassadeur",
    description: "Représentant externe, volontaire, stagiaire ou collaborateur affilié. Reçoit des missions de la Responsable des Relations Extérieures et soumet des rapports.",
    color: "#EC4899",
    badgeBg: "bg-pink-600/20 text-pink-400 border-pink-600/40",
    level: 15,
    canVeto: false,
    hierarchyLevel: 7,
    permissions: [
      "submit_report"
    ]
  },

  // ━━━ STATUT D'ATTENTE INITIAL ━━━
  EN_ATTENTE: {
    id: "EN_ATTENTE",
    label: "En Attente d'Affectation",
    shortLabel: "En Attente",
    description: "Nouveau compte enregistré. En attente de nomination officielle et d'attribution de poste par le Directeur Général ou le CEO.",
    color: "#9CA3AF",
    badgeBg: "bg-gray-700/40 text-gray-300 border-gray-600",
    level: 0,
    canVeto: false,
    hierarchyLevel: 8,
    permissions: []
  }
};

export const DEFAULT_ROLE = ROLES.EN_ATTENTE;

// ─── Helpers ────────────────────────────────────────────────────────────────

export const hasPermission = (userRole, permission) => {
  if (!userRole) return false;
  const roleId = typeof userRole === 'string' ? userRole : userRole?.id;
  const roleObj = ROLES[roleId];
  if (!roleObj) return false;
  return roleObj.permissions ? roleObj.permissions.includes(permission) : false;
};

export const isCEO = (userRole) => {
  const roleId = typeof userRole === 'string' ? userRole : userRole?.id;
  return roleId === 'CEO';
};

export const isDG = (userRole) => {
  const roleId = typeof userRole === 'string' ? userRole : userRole?.id;
  return roleId === 'DIRECTEUR_GENERAL';
};

export const canManageRoles = (userRole) => {
  const roleId = typeof userRole === 'string' ? userRole : userRole?.id;
  return ['CEO', 'DIRECTEUR_GENERAL'].includes(roleId) || hasPermission(roleId, 'manage_roles');
};

export const isHierarchy = (userRole) => {
  const roleId = typeof userRole === 'string' ? userRole : userRole?.id;
  return ['CEO', 'DIRECTEUR_GENERAL'].includes(roleId);
};

export const canSubmitReport = (userRole) => {
  const roleId = typeof userRole === 'string' ? userRole : userRole?.id;
  return hasPermission(roleId, 'submit_report');
};

// Retourne les 12 rôles officiels nominables par le DG/CEO (exclut EN_ATTENTE)
export const getAssignableRoles = () =>
  Object.values(ROLES).filter(r => r.id !== 'EN_ATTENTE').sort((a, b) => a.hierarchyLevel - b.hierarchyLevel);

// Retourne tous les rôles ordonnés
export const getRolesOrdered = () =>
  Object.values(ROLES).sort((a, b) => a.hierarchyLevel - b.hierarchyLevel);
