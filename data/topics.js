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
    formulas: ["1919 Gründung", "1923 Krisenjahr", "1924–1929 relative Stabilisierung"],
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
  },

  // ── Geschichte (Quelle: Hessisches Kerncurriculum Gymnasiale Oberstufe, Aug 2021) ──

  {
    id: "history-athen-rom",
    subject: "Geschichte",
    title: "Athenische Demokratie vs. Römische Republik",
    keyTerms: ["Demokratie", "Republik", "Polis", "Senat", "Volksversammlung", "Patrizier", "Plebejer"],
    formulas: [],
    examples: [
      "Thukydides-Auszug zur attischen Volksversammlung als Quelle",
      "Vergleich Bürgerbegriff: Athen (freie männliche Bürger) vs. Rom (Ständegesellschaft)"
    ],
    quiz: [
      {
        question: "Welches Organ war das wichtigste Entscheidungsgremium der athenischen Demokratie?",
        options: ["Der Senat", "Die Volksversammlung (Ekklesia)", "Der Rat der 500 (Boule) allein", "Der Archont"],
        answer: 1
      },
      {
        question: "Was war der römische Senat?",
        options: [
          "Ein gewähltes Parlament aller Bürger",
          "Ein Rat aus Patriziern und später auch Plebejern mit großem Einfluss",
          "Das höchste Gericht Roms",
          "Eine Versammlung aller Soldaten"
        ],
        answer: 1
      },
      {
        question: "Welcher Begriff bezeichnet den griechischen Stadtstaat?",
        options: ["Forum", "Polis", "Senat", "Agora"],
        answer: 1
      },
      {
        question: "Was unterscheidet die athenische Demokratie von der römischen Republik grundlegend?",
        options: [
          "Athen hatte keine Volksversammlung",
          "Athen praktizierte direkte Demokratie, Rom hatte repräsentativere Elemente",
          "In Rom durften alle Einwohner abstimmen",
          "Beide Systeme waren identisch aufgebaut"
        ],
        answer: 1
      }
    ]
  },
  {
    id: "history-feudalismus",
    subject: "Geschichte",
    title: "Feudalismus und Ständegesellschaft",
    keyTerms: ["Feudalismus", "Lehnswesen", "Stände", "Grundherrschaft", "Vasall", "Leibeigenschaft"],
    formulas: [],
    examples: [
      "Auswertung eines Lehnsbriefs – Pflichten von Lehnsherr und Vasall",
      "Vergleich ländlicher und städtischer Lebensverhältnisse im Mittelalter"
    ],
    quiz: [
      {
        question: "Was beschreibt das Lehnswesen im Mittelalter?",
        options: [
          "Ein Handelssystem zwischen Städten",
          "Ein System persönlicher Bindungen: Lehnsherr verleiht Land gegen Dienst und Treue",
          "Eine Form der Demokratie im Mittelalter",
          "Die Verwaltung durch einen König allein"
        ],
        answer: 1
      },
      {
        question: "Welche drei Stände gab es in der mittelalterlichen Ständegesellschaft?",
        options: [
          "König, Adel, Volk",
          "Klerus, Adel, Bauern/Bürger (Dritter Stand)",
          "Ritter, Kaufleute, Mönche",
          "Patrizier, Plebejer, Sklaven"
        ],
        answer: 1
      },
      {
        question: "Was bedeutete Grundherrschaft?",
        options: [
          "Das Recht, Steuern vom König einzutreiben",
          "Die Kontrolle eines Adligen über Land und die darauf lebenden Bauern",
          "Der Besitz von Handelsrechten in Städten",
          "Die Herrschaft des Papstes über weltliche Fürsten"
        ],
        answer: 1
      },
      {
        question: "Welche Personengruppe war im Feudalsystem am stärksten von persönlicher Unfreiheit betroffen?",
        options: ["Ritter", "Klerus", "Leibeigene Bauern", "Stadtbürger"],
        answer: 2
      }
    ]
  },
  {
    id: "history-revolution-1848",
    subject: "Geschichte",
    title: "Revolution 1848/49 in Deutschland",
    keyTerms: ["Revolution", "Nationalismus", "Liberalismus", "Frankfurter Nationalversammlung", "Paulskirchenverfassung"],
    formulas: [],
    examples: [
      "Analyse der Paulskirchenverfassung als Quelle für liberale Grundrechte",
      "Märzrevolution in Berlin 1848 als Beispiel für bürgerliche Forderungen"
    ],
    quiz: [
      {
        question: "Wo tagte 1848/49 die erste deutsche Nationalversammlung?",
        options: ["Berliner Stadtschloss", "Frankfurter Paulskirche", "Hambacher Schloss", "Wiener Hofburg"],
        answer: 1
      },
      {
        question: "Welche sozialen Gruppen trugen die Revolution 1848/49 hauptsächlich?",
        options: [
          "Adel und Klerus",
          "Bürgertum, Liberale, Studenten und Arbeiter",
          "Nur die Landbevölkerung",
          "Ausschließlich Militärs"
        ],
        answer: 1
      },
      {
        question: "Warum scheiterte die Revolution 1848/49 letztlich?",
        options: [
          "Weil es keine Verfassung ausgearbeitet wurde",
          "Weil die Fürsten die Gegenbewegung organisierten und das Bürgertum zersplittert war",
          "Weil Frankreich militärisch eingriff",
          "Weil die Nationalversammlung sich selbst auflöste"
        ],
        answer: 1
      },
      {
        question: "Welches Hauptziel verfolgten die Liberalen in der Revolution 1848/49?",
        options: [
          "Abschaffung des Privateigentums",
          "Nationalstaat mit Verfassung und Grundrechten",
          "Rückkehr zur absoluten Monarchie",
          "Anschluss an Frankreich"
        ],
        answer: 1
      }
    ]
  },
  {
    id: "history-industrialisierung",
    subject: "Geschichte",
    title: "Industrialisierung und soziale Frage",
    keyTerms: ["Industrialisierung", "Proletariat", "Urbanisierung", "Soziale Frage", "Arbeiterbewegung", "Pauperismus"],
    formulas: [],
    examples: [
      "Vergleich Lebensbedingungen in Fabrikstädten vs. ländlichen Regionen (19. Jh.)",
      "Kinderarbeit und 14-Stunden-Arbeitstag als Quelle zur sozialen Frage"
    ],
    quiz: [
      {
        question: "Was versteht man unter der 'Sozialen Frage' im 19. Jahrhundert?",
        options: [
          "Die Frage nach der richtigen Staatsform",
          "Die Frage nach Verbesserung der Lebensbedingungen der Industriearbeiter",
          "Streitigkeiten über Kolonien",
          "Das Problem der Landflucht im Mittelalter"
        ],
        answer: 1
      },
      {
        question: "Was ist Urbanisierung?",
        options: [
          "Die Abwanderung der Stadtbevölkerung aufs Land",
          "Der Zuzug von Menschen in Städte infolge der Industrialisierung",
          "Der Aufbau von Eisenbahnlinien",
          "Die Gründung von Kolonien"
        ],
        answer: 1
      },
      {
        question: "Welche Schicht entstand vor allem durch die Industrialisierung neu?",
        options: ["Der Adel", "Der Klerus", "Das Industrieproletariat (Lohnarbeiter)", "Die Großgrundbesitzer"],
        answer: 2
      },
      {
        question: "Welche Institution versuchte erstmals in Deutschland, die soziale Frage staatlich zu lösen?",
        options: [
          "Die Frankfurter Nationalversammlung",
          "Die Bismarckschen Sozialgesetze (1883–1889)",
          "Der Deutscher Bund",
          "Die Gewerkschaften allein"
        ],
        answer: 1
      }
    ]
  },
  {
    id: "history-nationalsozialismus",
    subject: "Geschichte",
    title: "Aufstieg und Herrschaft des Nationalsozialismus",
    keyTerms: ["NSDAP", "Gleichschaltung", "Propaganda", "Führerprinzip", "Totalitarismus", "Antisemitismus"],
    formulas: [],
    examples: [
      "Auswertung von NS-Propagandaplakaten und Redetexten",
      "Ermächtigungsgesetz 1933 als Quelle für die Ausschaltung des Parlaments"
    ],
    quiz: [
      {
        question: "Was bedeutete 'Gleichschaltung' im NS-Staat?",
        options: [
          "Die Vereinheitlichung von Stromspannung in Industriebetrieben",
          "Die Unterordnung aller gesellschaftlichen Bereiche unter nationalsozialistische Kontrolle",
          "Die Angleichung von Gehältern",
          "Ein Verfahren zur Volksabstimmung"
        ],
        answer: 1
      },
      {
        question: "Durch welches Gesetz 1933 erhielt Hitler die Möglichkeit, ohne Parlament zu regieren?",
        options: ["Nürnberger Gesetze", "Ermächtigungsgesetz", "Reichstagsbrandverordnung", "Versailler Vertrag"],
        answer: 1
      },
      {
        question: "Was ist das Führerprinzip?",
        options: [
          "Demokratische Wahl des Staatsoberhauptes",
          "Unbeschränkte Befehlsgewalt des Führers, der keiner Kontrolle unterliegt",
          "Führung durch ein Kollegium von Ministern",
          "Ein militärisches Ausbildungsprinzip"
        ],
        answer: 1
      },
      {
        question: "Welches ideologische Element war zentrales Merkmal der NS-Weltanschauung?",
        options: [
          "Internationaler Sozialismus",
          "Rassistischer Antisemitismus und Volkstumspolitik",
          "Religiöse Toleranz",
          "Parlamentarische Demokratie"
        ],
        answer: 1
      }
    ]
  },
  {
    id: "history-wiedervereinigung",
    subject: "Geschichte",
    title: "Wiedervereinigung und Transformation nach 1990",
    keyTerms: ["Wiedervereinigung", "Transformation", "Währungsunion", "Privatisierung", "Treuhandanstalt", "DDR"],
    formulas: [],
    examples: [
      "Vergleich ökonomischer Indikatoren BRD vs. DDR 1989–1995",
      "Mauerfall 9. November 1989 als Wendepunkt"
    ],
    quiz: [
      {
        question: "Wann fiel die Berliner Mauer?",
        options: ["3. Oktober 1990", "9. November 1989", "1. Juli 1990", "17. Juni 1953"],
        answer: 1
      },
      {
        question: "Was war die Aufgabe der Treuhandanstalt nach 1990?",
        options: [
          "Verwaltung des Bundesarchivs",
          "Privatisierung der volkseigenen Betriebe der ehemaligen DDR",
          "Überwachung der Währungsunion",
          "Aufbau der neuen Bundesländer-Verwaltung"
        ],
        answer: 1
      },
      {
        question: "Wann wurde die deutsche Wiedervereinigung offiziell vollzogen?",
        options: ["9. November 1989", "3. Oktober 1990", "1. Januar 1991", "12. September 1990"],
        answer: 1
      },
      {
        question: "Was war eine zentrale wirtschaftliche Herausforderung der Wiedervereinigung?",
        options: [
          "Abzahlung von Kriegsschulden",
          "Umstellung der DDR-Planwirtschaft auf die soziale Marktwirtschaft",
          "Integration in die NATO",
          "Aufbau einer neuen Verfassung"
        ],
        answer: 1
      }
    ]
  }
];

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
