export const topics = [
  {
    id: "math-analysis-derivative",
    subject: "Mathematik",
    title: "Ableitungen und Änderungsraten",
    keyTerms: ["Ableitung", "Tangente", "Steigung", "Monotonie"],
    formulas: ["(x^n)' = n * x^(n-1)", "(sin x)' = cos x", "(e^x)' = e^x"],
    examples: [
      "f(x)=x^3 -> f'(x)=3x^2",
      "f'(x)>0 bedeutet: Funktion steigt in diesem Bereich."
    ],
    quiz: [
      {
        question: "Wie lautet die Ableitung von f(x)=x^4?",
        options: ["4x^3", "x^3", "4x", "x^5"],
        answer: 0
      },
      {
        question: "Welche Aussage ist korrekt?",
        options: [
          "f'(x) < 0 heißt: Funktion steigt.",
          "f'(x) > 0 heißt: Funktion fällt.",
          "f'(x) > 0 heißt: Funktion steigt.",
          "f'(x) = 0 heißt immer Hochpunkt."
        ],
        answer: 2
      }
    ]
  },
  {
    id: "german-argumentation",
    subject: "Deutsch",
    title: "Lineare Erörterung",
    keyTerms: ["These", "Argument", "Beleg", "Schluss"],
    formulas: ["Einleitung -> Hauptteil -> Schluss", "Behauptung + Begründung + Beispiel"],
    examples: [
      "These: Handynutzung im Unterricht sollte klar geregelt sein.",
      "Argument mit Beleg: Konzentration sinkt laut Studien bei ständiger Ablenkung."
    ],
    quiz: [
      {
        question: "Was gehört in eine tragfähige Argumentation?",
        options: ["Nur Meinung", "Behauptung ohne Beispiel", "Behauptung + Begründung + Beleg", "Nur Zitate"],
        answer: 2
      },
      {
        question: "Welche Reihenfolge ist typisch für die lineare Erörterung?",
        options: ["Hauptteil -> Einleitung -> Schluss", "Einleitung -> Hauptteil -> Schluss", "Schluss -> Hauptteil -> Einleitung", "Nur Hauptteil"],
        answer: 1
      }
    ]
  },
  {
    id: "history-weimar",
    subject: "Geschichte",
    title: "Weimarer Republik: Chancen und Krisen",
    keyTerms: ["Verfassung", "Inflation", "Präsidialkabinette", "Radikalisierung"],
    formulas: ["1919 Gründung", "1923 Krisenjahr", "1924-1929 relative Stabilisierung"],
    examples: [
      "Hyperinflation 1923 zerstörte Ersparnisse.",
      "Weltwirtschaftskrise 1929 verschärfte politische Extreme."
    ],
    quiz: [
      {
        question: "Welches Jahr gilt als Krisenjahr der Weimarer Republik?",
        options: ["1918", "1923", "1927", "1934"],
        answer: 1
      },
      {
        question: "Welche Entwicklung schwächte die Weimarer Republik deutlich?",
        options: ["Stabile Vollbeschäftigung", "Weltwirtschaftskrise", "Dauerhaft starke Koalitionen", "Abschaffung politischer Parteien"],
        answer: 1
      }
    ]
  },
  {
    id: "biology-genetics",
    subject: "Biologie",
    title: "Mendelsche Regeln",
    keyTerms: ["dominant", "rezessiv", "Genotyp", "Phänotyp"],
    formulas: ["1. Uniformitätsregel", "2. Spaltungsregel 3:1", "3. Unabhängigkeitsregel"],
    examples: [
      "Kreuzung reinerbiger Eltern zeigt uniforme F1-Generation.",
      "Bei monohybrider Kreuzung in F2 oft 3:1 im Phänotyp."
    ],
    quiz: [
      {
        question: "Welche Zahl gehört zur Spaltungsregel bei monohybrider Kreuzung?",
        options: ["1:1", "2:1", "3:1", "9:7"],
        answer: 2
      }
    ]
  }
];
