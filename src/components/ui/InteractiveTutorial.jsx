import React, { useState, useEffect } from 'react';
import { 
  Shield, PiggyBank, Smartphone, Radio, Castle, 
  Target, Wallet, BookOpen, Cpu, BarChart3, 
  ArrowRight, CheckCircle, X, Sparkles
} from 'lucide-react';

// ==========================================
// TUTORIEL INTERACTIF - FORMATION DU COMMANDANT
// ==========================================
function InteractiveTutorial({ onComplete, currency = "€" }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [simulationData, setSimulationData] = useState({
    balance: 1000,
    bunker: 0,
    transactions: [],
    goals: [],
    debts: [],
    projects: [],
    skills: [],
    protocols: []
  });
  const [inputValues, setInputValues] = useState({
    amount: '',
    description: '',
    goalName: '',
    goalTarget: '',
    debtName: '',
    debtAmount: '',
    projectName: '',
    projectRoi: '',
    skillName: '',
    protocolName: '',
    protocolAmount: '',
    jarvisQuestion: ''
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');

  // Étapes du tutoriel
  const TUTORIAL_STEPS = [
    {
      id: 'intro',
      title: "BIENVENUE, COMMANDANT",
      subtitle: "Formation du Commandant",
      type: 'intro',
      icon: Shield,
      content: "Imperium est votre poste de commandement financier. Votre mission : Maîtriser vos finances avec discipline militaire.",
      objectives: ["Comprendre la philosophie de l'application", "Apprendre à utiliser chaque fonctionnalité", "Développer une discipline financière"]
    },
    {
      id: 'dashboard',
      title: "DASHBOARD - PREMIÈRE TRANSACTION",
      subtitle: "Étape 1/8 : Gestion des Transactions",
      type: 'action',
      icon: Wallet,
      content: "Enregistrez votre première dépense. Distinguez entre un BESOIN vital et une FUTILITÉ.",
      instruction: "Ajoutez une dépense de 50€ pour 'Courses alimentaires' (catégorie BESOIN).",
      action: 'transaction',
      validation: (data) => data.transactions.length > 0 && data.transactions[0].category === 'need'
    },
    {
      id: 'taxe',
      title: "LA TAXE DE SANG",
      subtitle: "Étape 2/8 : Discipline Financière",
      type: 'action',
      icon: Sparkles,
      content: "Les futilités sont taxées à 10%. Cet argent est automatiquement versé dans votre Bunker (épargne).",
      instruction: "Ajoutez maintenant une dépense de 30€ pour 'Café' (catégorie FUTILITÉ). Observez la taxe automatique.",
      action: 'transaction',
      validation: (data) => data.transactions.some(t => t.category === 'want')
    },
    {
      id: 'goals',
      title: "OBJECTIFS - CRÉER UNE CIBLE",
      subtitle: "Étape 3/8 : Gestion d'Objectifs",
      type: 'action',
      icon: Target,
      content: "Les Cibles sont vos objectifs d'épargne. L'argent alloué est verrouillé et ne peut être dépensé.",
      instruction: "Créez un objectif 'Vacances' avec une cible de 200€.",
      action: 'goal',
      validation: (data) => data.goals.length > 0
    },
    {
      id: 'allocation',
      title: "ALLOCATION D'ARGENT",
      subtitle: "Étape 4/8 : Verrouillage de Fonds",
      type: 'action',
      icon: PiggyBank,
      content: "Allouez de l'argent à votre objectif. Cet argent sera soustrait de votre trésorerie disponible.",
      instruction: "Allouez 100€ à votre objectif 'Vacances'.",
      action: 'allocation',
      validation: (data) => data.goals.some(g => g.current > 0)
    },
    {
      id: 'debts',
      title: "DETTE - GESTION DU GRAND LIVRE",
      subtitle: "Étape 5/8 : Gestion de Dettes",
      type: 'action',
      icon: Wallet,
      content: "Le Grand Livre suit toutes vos dettes (ce que vous devez et ce qu'on vous doit).",
      instruction: "Enregistrez une dette de 150€ que vous devez à 'Ami'.",
      action: 'debt',
      validation: (data) => data.debts.length > 0
    },
    {
      id: 'projects',
      title: "PROJETS - CONQUÊTES STRATÉGIQUES",
      subtitle: "Étape 6/8 : Gestion de Projets",
      type: 'action',
      icon: BookOpen,
      content: "Les Projets sont vos conquêtes avec un ROI (Retour sur Investissement). Transformez-les en revenus ou gains uniques.",
      instruction: "Créez un projet 'Freelance' avec un ROI de 500€.",
      action: 'project',
      validation: (data) => data.projects.length > 0
    },
    {
      id: 'skills',
      title: "COMPÉTENCES - ARSENAL",
      subtitle: "Étape 7/8 : Développement de Compétences",
      type: 'action',
      icon: Cpu,
      content: "L'Arsenal liste vos compétences. Jarvis peut générer des tactiques de conquête pour chacune.",
      instruction: "Ajoutez une compétence 'Développement Web'.",
      action: 'skill',
      validation: (data) => data.skills.length > 0
    },
    {
      id: 'protocols',
      title: "PROTOCOLES - REVENUS FIXES",
      subtitle: "Étape 8/8 : Flux Financiers",
      type: 'action',
      icon: Radio,
      content: "Les Protocoles sont vos revenus et dépenses récurrents. Calculez votre cash-flow mensuel.",
      instruction: "Ajoutez un revenu mensuel de 1000€ (Salaire).",
      action: 'protocol',
      validation: (data) => data.protocols.length > 0
    },
    {
      id: 'synthesis',
      title: "MISSION ACCOMPLIE",
      subtitle: "Formation Terminée",
      type: 'intro',
      icon: CheckCircle,
      content: "Félicitations, Commandant ! Vous maîtrisez maintenant les bases d'Imperium.",
      objectives: ["Transactions et discipline fiscale", "Gestion d'objectifs et allocation", "Suivi des dettes", "Projets et ROI", "Compétences et IA", "Protocoles et cash-flow"]
    }
  ];

  const currentTutorialStep = TUTORIAL_STEPS[currentStep];

  // Actions de simulation
  const handleTransaction = (e) => {
    e.preventDefault();
    const amount = parseFloat(inputValues.amount);
    const description = inputValues.description;
    const category = currentStep === 1 ? 'need' : 'want';
    
    if (!amount || !description) {
      showFeedbackMessage("Veuillez remplir tous les champs", "error");
      return;
    }

    let taxAmount = 0;
    if (category === 'want') {
      taxAmount = Math.round(amount * 0.10);
    }

    const newTransaction = {
      id: Date.now(),
      desc: description,
      amount: amount,
      type: 'expense',
      category: category,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      rawDate: new Date().toISOString()
    };

    const transactions = [newTransaction, ...simulationData.transactions];
    const newBalance = simulationData.balance - amount - taxAmount;
    const newBunker = simulationData.bunker + taxAmount;

    setSimulationData({
      ...simulationData,
      balance: newBalance,
      bunker: newBunker,
      transactions
    });

    setInputValues({ ...inputValues, amount: '', description: '' });
    showFeedbackMessage(
      category === 'need' 
        ? "Transaction enregistrée ! BESOIN vital validé." 
        : `Transaction enregistrée ! Taxe de sang : ${taxAmount}${currency} versée au Bunker.`,
      "success"
    );

    if (currentTutorialStep.validation({ ...simulationData, transactions, balance: newBalance, bunker: newBunker })) {
      setTimeout(() => nextStep(), 1000);
    }
  };

  const handleGoal = (e) => {
    e.preventDefault();
    const goalName = inputValues.goalName;
    const goalTarget = parseFloat(inputValues.goalTarget);

    if (!goalName || !goalTarget) {
      showFeedbackMessage("Veuillez remplir tous les champs", "error");
      return;
    }

    const newGoal = {
      id: Date.now(),
      title: goalName,
      target: goalTarget,
      deadline: "",
      current: 0
    };

    const goals = [...simulationData.goals, newGoal];
    setSimulationData({ ...simulationData, goals });
    setInputValues({ ...inputValues, goalName: '', goalTarget: '' });
    showFeedbackMessage("Objectif créé avec succès !", "success");

    if (currentTutorialStep.validation({ ...simulationData, goals })) {
      setTimeout(() => nextStep(), 1000);
    }
  };

  const handleAllocation = (e) => {
    e.preventDefault();
    const goal = simulationData.goals[0];
    const amount = parseFloat(inputValues.amount);

    if (!amount || amount > simulationData.balance) {
      showFeedbackMessage("Montant invalide ou fonds insuffisants", "error");
      return;
    }

    const updatedGoals = simulationData.goals.map(g => {
      if (g.id === goal.id) {
        return { ...g, current: g.current + amount };
      }
      return g;
    });

    const newBalance = simulationData.balance - amount;
    setSimulationData({
      ...simulationData,
      balance: newBalance,
      goals: updatedGoals
    });
    setInputValues({ ...inputValues, amount: '' });
    showFeedbackMessage(`${amount}${currency} alloués à ${goal.title} !`, "success");

    if (currentTutorialStep.validation({ ...simulationData, balance: newBalance, goals: updatedGoals })) {
      setTimeout(() => nextStep(), 1000);
    }
  };

  const handleDebt = (e) => {
    e.preventDefault();
    const debtName = inputValues.debtName;
    const debtAmount = parseFloat(inputValues.debtAmount);

    if (!debtName || !debtAmount) {
      showFeedbackMessage("Veuillez remplir tous les champs", "error");
      return;
    }

    const newDebt = {
      id: Date.now(),
      name: debtName,
      amount: debtAmount,
      totalAmount: debtAmount,
      paidAmount: 0,
      type: 'owe'
    };

    const debts = [...simulationData.debts, newDebt];
    setSimulationData({ ...simulationData, debts });
    setInputValues({ ...inputValues, debtName: '', debtAmount: '' });
    showFeedbackMessage("Dette enregistrée dans le Grand Livre !", "success");

    if (currentTutorialStep.validation({ ...simulationData, debts })) {
      setTimeout(() => nextStep(), 1000);
    }
  };

  const handleProject = (e) => {
    e.preventDefault();
    const projectName = inputValues.projectName;
    const projectRoi = parseFloat(inputValues.projectRoi);

    if (!projectName || !projectRoi) {
      showFeedbackMessage("Veuillez remplir tous les champs", "error");
      return;
    }

    const newProject = {
      id: Date.now(),
      title: projectName,
      deadline: "",
      roi: projectRoi,
      roiType: "once",
      tasks: [],
      answers: {}
    };

    const projects = [...simulationData.projects, newProject];
    setSimulationData({ ...simulationData, projects });
    setInputValues({ ...inputValues, projectName: '', projectRoi: '' });
    showFeedbackMessage("Projet créé avec succès !", "success");

    if (currentTutorialStep.validation({ ...simulationData, projects })) {
      setTimeout(() => nextStep(), 1000);
    }
  };

  const handleSkill = (e) => {
    e.preventDefault();
    const skillName = inputValues.skillName;

    if (!skillName) {
      showFeedbackMessage("Veuillez entrer une compétence", "error");
      return;
    }

    const newSkill = {
      id: Date.now(),
      name: skillName,
      level: "Apprenti"
    };

    const skills = [...simulationData.skills, newSkill];
    setSimulationData({ ...simulationData, skills });
    setInputValues({ ...inputValues, skillName: '' });
    showFeedbackMessage("Compétence ajoutée à l'Arsenal !", "success");

    if (currentTutorialStep.validation({ ...simulationData, skills })) {
      setTimeout(() => nextStep(), 1000);
    }
  };

  const handleProtocol = (e) => {
    e.preventDefault();
    const protocolName = inputValues.protocolName;
    const protocolAmount = parseFloat(inputValues.protocolAmount);

    if (!protocolName || !protocolAmount) {
      showFeedbackMessage("Veuillez remplir tous les champs", "error");
      return;
    }

    const newProtocol = {
      id: Date.now(),
      name: protocolName,
      amount: protocolAmount,
      type: 'income',
      freq: 'monthly'
    };

    const protocols = [...simulationData.protocols, newProtocol];
    setSimulationData({ ...simulationData, protocols });
    setInputValues({ ...inputValues, protocolName: '', protocolAmount: '' });
    showFeedbackMessage("Protocole ajouté ! Cash-flow mis à jour.", "success");

    if (currentTutorialStep.validation({ ...simulationData, protocols })) {
      setTimeout(() => nextStep(), 1000);
    }
  };

  const showFeedbackMessage = (message, type) => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  };

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipStep = () => {
    setCompletedSteps([...completedSteps, currentStep]);
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const StepIcon = currentTutorialStep.icon;

  return (
    <div className="fixed inset-0 bg-[#050505] text-gray-200 font-sans flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="shrink-0 px-5 py-4 bg-[#151515] border-b border-white/5 pt-16">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <StepIcon className="w-5 h-5 text-gold" />
            <span className="text-xs text-gray-500 uppercase tracking-widest">{currentTutorialStep.subtitle}</span>
          </div>
          <button 
            onClick={skipStep}
            className="text-xs text-gray-500 hover:text-white uppercase tracking-widest"
          >
            Passer
          </button>
        </div>
        <h1 className="text-xl font-serif text-white font-bold">{currentTutorialStep.title}</h1>
      </div>

      {/* Progress Bar */}
      <div className="shrink-0 px-5 py-3 bg-[#0a0a0a] border-b border-white/5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-gray-500 uppercase">Progression</span>
          <span className="text-[10px] text-gold font-bold">{currentStep + 1}/{TUTORIAL_STEPS.length}</span>
        </div>
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gold transition-all duration-500"
            style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {currentTutorialStep.type === 'intro' ? (
          <div className="space-y-6">
            <div className="bg-[#111] rounded-xl border border-white/5 p-6">
              <p className="text-sm leading-relaxed text-gray-300 mb-6">{currentTutorialStep.content}</p>
              {currentTutorialStep.objectives && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4">Objectifs de la formation</h3>
                  {currentTutorialStep.objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-gray-400">{obj}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={nextStep}
              className="w-full bg-gold text-black font-bold py-4 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? "ACCÉDER AU QG" : "COMMENCER LA FORMATION"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Instruction */}
            <div className="bg-[#111] rounded-xl border border-white/5 p-5">
              <p className="text-sm leading-relaxed text-gray-300 mb-4">{currentTutorialStep.content}</p>
              <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
                <p className="text-xs text-gold font-bold uppercase tracking-widest mb-2">Mission</p>
                <p className="text-sm text-white">{currentTutorialStep.instruction}</p>
              </div>
            </div>

            {/* Simulation Dashboard */}
            <div className="bg-[#111] rounded-xl border border-white/5 p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-500 uppercase">Simulation Dashboard</span>
                <span className="text-xs text-gold font-bold">Mode Entraînement</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-black rounded-lg p-4 border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Cash Disponible</p>
                  <p className="text-xl font-bold text-white">{simulationData.balance} {currency}</p>
                </div>
                <div className="bg-black rounded-lg p-4 border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Bunker</p>
                  <p className="text-xl font-bold text-gold">{simulationData.bunker} {currency}</p>
                </div>
              </div>

              {/* Action Form */}
              <form onSubmit={
                currentTutorialStep.action === 'transaction' ? handleTransaction :
                currentTutorialStep.action === 'goal' ? handleGoal :
                currentTutorialStep.action === 'allocation' ? handleAllocation :
                currentTutorialStep.action === 'debt' ? handleDebt :
                currentTutorialStep.action === 'project' ? handleProject :
                currentTutorialStep.action === 'skill' ? handleSkill :
                currentTutorialStep.action === 'protocol' ? handleProtocol :
                () => {}
              } className="space-y-3">
                {currentTutorialStep.action === 'transaction' && (
                  <>
                    <input
                      type="number"
                      placeholder="Montant"
                      value={inputValues.amount}
                      onChange={(e) => setInputValues({ ...inputValues, amount: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={inputValues.description}
                      onChange={(e) => setInputValues({ ...inputValues, description: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
                    />
                    <button type="submit" className="w-full bg-gold text-black font-bold py-3 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors">
                      Enregistrer
                    </button>
                  </>
                )}

                {currentTutorialStep.action === 'goal' && (
                  <>
                    <input
                      type="text"
                      placeholder="Nom de l'objectif"
                      value={inputValues.goalName}
                      onChange={(e) => setInputValues({ ...inputValues, goalName: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Montant cible"
                      value={inputValues.goalTarget}
                      onChange={(e) => setInputValues({ ...inputValues, goalTarget: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
                    />
                    <button type="submit" className="w-full bg-gold text-black font-bold py-3 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors">
                      Créer l'objectif
                    </button>
                  </>
                )}

                {currentTutorialStep.action === 'allocation' && (
                  <>
                    <input
                      type="number"
                      placeholder="Montant à allouer"
                      value={inputValues.amount}
                      onChange={(e) => setInputValues({ ...inputValues, amount: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
                    />
                    <button type="submit" className="w-full bg-gold text-black font-bold py-3 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors">
                      Allouer
                    </button>
                  </>
                )}

                {currentTutorialStep.action === 'debt' && (
                  <>
                    <input
                      type="text"
                      placeholder="Créancier"
                      value={inputValues.debtName}
                      onChange={(e) => setInputValues({ ...inputValues, debtName: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Montant"
                      value={inputValues.debtAmount}
                      onChange={(e) => setInputValues({ ...inputValues, debtAmount: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
                    />
                    <button type="submit" className="w-full bg-gold text-black font-bold py-3 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors">
                      Enregistrer
                    </button>
                  </>
                )}

                {currentTutorialStep.action === 'project' && (
                  <>
                    <input
                      type="text"
                      placeholder="Nom du projet"
                      value={inputValues.projectName}
                      onChange={(e) => setInputValues({ ...inputValues, projectName: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="ROI attendu"
                      value={inputValues.projectRoi}
                      onChange={(e) => setInputValues({ ...inputValues, projectRoi: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
                    />
                    <button type="submit" className="w-full bg-gold text-black font-bold py-3 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors">
                      Créer le projet
                    </button>
                  </>
                )}

                {currentTutorialStep.action === 'skill' && (
                  <>
                    <input
                      type="text"
                      placeholder="Nom de la compétence"
                      value={inputValues.skillName}
                      onChange={(e) => setInputValues({ ...inputValues, skillName: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
                    />
                    <button type="submit" className="w-full bg-gold text-black font-bold py-3 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors">
                      Ajouter
                    </button>
                  </>
                )}

                {currentTutorialStep.action === 'protocol' && (
                  <>
                    <input
                      type="text"
                      placeholder="Nom (ex: Salaire)"
                      value={inputValues.protocolName}
                      onChange={(e) => setInputValues({ ...inputValues, protocolName: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Montant mensuel"
                      value={inputValues.protocolAmount}
                      onChange={(e) => setInputValues({ ...inputValues, protocolAmount: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
                    />
                    <button type="submit" className="w-full bg-gold text-black font-bold py-3 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors">
                      Ajouter
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Toast */}
      {showFeedback && (
        <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom duration-300 ${
          feedbackType === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <p className="text-white text-sm font-bold">{feedbackMessage}</p>
        </div>
      )}
    </div>
  );
}

export default InteractiveTutorial;
