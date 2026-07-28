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
    keyTerms: ["Verfassung", "Inflation", "Präsidialkabinette", "Radikalisierung", "Dolchstoßlegende", "Artikel 48"],
    formulas: ["1919 Gründung", "1923 Krisenjahr", "1924–1929 relative Stabilisierung", "1929 Weltwirtschaftskrise"],
    examples: [
      "Hyperinflation 1923 zerstörte Ersparnisse der Mittelschicht.",
      "Weltwirtschaftskrise 1929 verschärfte politische Extreme und ermöglichte NSDAP-Aufstieg.",
      "Analyse der Weimarer Verfassung: Artikel 48 als Notstandsparagraph mit Missbrauchspotenzial.",
      "Auswertung von Wahlstatistiken 1928–1933: Stimmengewinne der NSDAP im Vergleich."
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
      },
      {
        question: "Wann wurde die Weimarer Republik gegründet?",
        options: ["1914", "1917", "1919", "1921"],
        answer: 2
      },
      {
        question: "Was ermöglichte Artikel 48 der Weimarer Verfassung dem Reichspräsidenten?",
        options: [
          "Die Ernennung des Reichskanzlers ohne Parlamentsbestätigung",
          "Die Auflösung aller politischen Parteien",
          "Den Erlass von Notverordnungen ohne Parlamentszustimmung",
          "Die Verhängung von Kriegsrecht jederzeit"
        ],
        answer: 2
      },
      {
        question: "Was ist die 'Dolchstoßlegende'?",
        options: [
          "Ein Attentat auf einen Politiker der Weimarer Republik",
          "Der Mythos, das deutsche Heer sei an der Heimatfront durch Sozialisten und Juden verraten worden",
          "Ein Begriff für die Hyperinflation",
          "Eine politische Partei der Weimarer Zeit"
        ],
        answer: 1
      },
      {
        question: "Wie stabilisierte sich die Wirtschaft der Weimarer Republik nach der Hyperinflation?",
        options: [
          "Durch Kriegsreparationen an das Ausland",
          "Durch die Rentenmark-Reform 1923/24 und amerikanische Kredite (Dawes-Plan)",
          "Durch Abkehr vom Versailler Vertrag",
          "Durch Einführung der Planwirtschaft"
        ],
        answer: 1
      },
      {
        question: "Was waren die Locarno-Verträge (1925)?",
        options: [
          "Militärbündnisse gegen Frankreich",
          "Handelsabkommen mit den USA",
          "Außenpolitische Entspannungsverträge, die Deutschlands Westgrenzen anerkannten",
          "Vereinbarungen über die Kolonialaufteilung"
        ],
        answer: 2
      },
      {
        question: "Welche Partei profitierte am stärksten von der Wirtschaftskrise nach 1929?",
        options: ["SPD", "KPD", "Zentrum", "NSDAP"],
        answer: 3
      },
      {
        question: "Wer war der erste Reichspräsident der Weimarer Republik?",
        options: ["Paul von Hindenburg", "Friedrich Ebert", "Gustav Stresemann", "Heinrich Brüning"],
        answer: 1
      },
      {
        question: "Was war die Besonderheit der Weimarer Verfassung im Vergleich zur Kaiserzeit?",
        options: [
          "Sie schaffte das Militär ab",
          "Sie war die erste demokratisch-parlamentarische Verfassung Deutschlands",
          "Sie gab dem Kaiser mehr Macht",
          "Sie verbannte alle politischen Parteien"
        ],
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
    keyTerms: ["Demokratie", "Republik", "Polis", "Senat", "Volksversammlung", "Patrizier", "Plebejer", "Ostrakismus", "Cursus honorum"],
    formulas: [],
    examples: [
      "Thukydides-Auszug zur attischen Volksversammlung als Quelle",
      "Vergleich Bürgerbegriff: Athen (freie männliche Bürger) vs. Rom (Ständegesellschaft)",
      "Auswertung des Periander-Epitaphs zur Beurteilung des athenischen Bürgerideals",
      "Analyse der Zwölf-Tafel-Gesetze Roms als Quelle für Gleichheitsforderungen der Plebejer"
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
      },
      {
        question: "Was war der Ostrakismus (Scherbengericht) in Athen?",
        options: [
          "Ein Strafgericht für Sklaven",
          "Die Möglichkeit, durch Abstimmung gefährliche Bürger für 10 Jahre zu verbannen",
          "Eine Methode zur Wahl des Strategen",
          "Ein religiöses Ritual"
        ],
        answer: 1
      },
      {
        question: "Welche bedeutende Einschränkung hatte die athenische Demokratie?",
        options: [
          "Nur Adlige durften abstimmen",
          "Frauen, Sklaven und Fremde (Metöken) hatten kein Stimmrecht",
          "Es gab keine Volksversammlung",
          "Nur Soldaten hatten das Wahlrecht"
        ],
        answer: 1
      },
      {
        question: "Was bedeutete der 'Cursus honorum' in der Römischen Republik?",
        options: [
          "Eine Ehrenstraße in Rom",
          "Die festgelegte Ämterlaufbahn für politische Karrieren",
          "Ein Militärmarsch",
          "Das Priestertum im Staatskult"
        ],
        answer: 1
      },
      {
        question: "Was ist die Agora in Athen?",
        options: [
          "Das wichtigste Heiligtum Athens",
          "Der zentrale Versammlungs- und Marktplatz der Stadt",
          "Der Sitz der Volksversammlung auf dem Pnyx",
          "Das Wohnviertel der Armen"
        ],
        answer: 1
      },
      {
        question: "Wer waren die Patrizier in der Römischen Republik?",
        options: [
          "Freigelassene Sklaven",
          "Die alteingesessene Geburtsaristokratie Roms",
          "Söldner aus dem Ausland",
          "Gewählte Volksvertreter"
        ],
        answer: 1
      },
      {
        question: "Welche Gemeinsamkeit hatten Athen und die Römische Republik?",
        options: [
          "Beide hatten ein allgemeines Wahlrecht für alle Einwohner",
          "Beide kannten Volksversammlungen als Teil ihrer Verfassung",
          "Beide wurden von einem König regiert",
          "Beide hatten keine Sklavenwirtschaft"
        ],
        answer: 1
      }
    ]
  },
  {
    id: "history-feudalismus",
    subject: "Geschichte",
    title: "Feudalismus und Ständegesellschaft",
    keyTerms: ["Feudalismus", "Lehnswesen", "Stände", "Grundherrschaft", "Vasall", "Leibeigenschaft", "Investiturstreit", "Zehnt"],
    formulas: [],
    examples: [
      "Auswertung eines Lehnsbriefs – Pflichten von Lehnsherr und Vasall",
      "Vergleich ländlicher und städtischer Lebensverhältnisse im Mittelalter",
      "Karikatur zum Investiturstreit: Canossagang Heinrichs IV. 1077",
      "Analyse eines mittelalterlichen Urkundentextes zur Grundherrschaft"
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
      },
      {
        question: "Was war der Investiturstreit im Mittelalter?",
        options: [
          "Ein Streit über Handelsrechte zwischen Kaufleuten",
          "Der Konflikt zwischen Papst und Kaiser um das Recht, Bischöfe einzusetzen",
          "Ein militärischer Streit um Burgen",
          "Die Auseinandersetzung über Kreuzzugsziele"
        ],
        answer: 1
      },
      {
        question: "Was war der Zehnt im Mittelalter?",
        options: [
          "Ein Kriegstribut an den Kaiser",
          "Eine Kirchensteuer in Höhe eines Zehntels des Ertrags der Bauern",
          "Ein Handelsabgabe auf Importe",
          "Die zehnte Auflage eines Gesetzes"
        ],
        answer: 1
      },
      {
        question: "Was ist der Unterschied zwischen Leibeigenschaft und Hörigkeit?",
        options: [
          "Leibeigenschaft und Hörigkeit sind dasselbe",
          "Hörige hatten etwas mehr persönliche Freiheit als Leibeigene, blieben aber vom Herrn abhängig",
          "Leibeigene durften das Land verlassen, Hörige nicht",
          "Hörige gehörten dem Adel, Leibeigene dem Klerus"
        ],
        answer: 1
      },
      {
        question: "Welche Rolle spielten Klöster im Mittelalter?",
        options: [
          "Nur religiöse Rückzugsorte ohne gesellschaftliche Bedeutung",
          "Zentren von Bildung, Schriftkultur, Krankenpflege und wirtschaftlicher Produktion",
          "Militärische Stützpunkte des Kaisers",
          "Handelsposten der Städte"
        ],
        answer: 1
      },
      {
        question: "Was verstand man unter einem Vasall?",
        options: [
          "Einen unfreien Bauern",
          "Einen Lehnsmann, der einem Lehnsherrn Treue und Dienst schuldete",
          "Einen Handwerksmeister in der Stadt",
          "Einen Pilger auf dem Weg nach Jerusalem"
        ],
        answer: 1
      },
      {
        question: "Was war eine typische wirtschaftliche Grundlage des mittelalterlichen Adels?",
        options: [
          "Handel mit Gewürzen",
          "Grundbesitz und die Arbeitspflichten der Bauern (Fronarbeit)",
          "Handwerk in Städten",
          "Bankgeschäfte"
        ],
        answer: 1
      }
    ]
  },
  {
    id: "history-revolution-1848",
    subject: "Geschichte",
    title: "Revolution 1848/49 in Deutschland",
    keyTerms: ["Revolution", "Nationalismus", "Liberalismus", "Frankfurter Nationalversammlung", "Paulskirchenverfassung", "Hambacher Fest", "Kleinstaaterei"],
    formulas: [],
    examples: [
      "Analyse der Paulskirchenverfassung als Quelle für liberale Grundrechte",
      "Märzrevolution in Berlin 1848 als Beispiel für bürgerliche Forderungen",
      "Hambacher Fest 1832 als Vorläufer der Revolution",
      "Ablehnung der Kaiserkrone durch Friedrich Wilhelm IV.: Auswertung seiner Begründung"
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
          "Weil keine Verfassung ausgearbeitet wurde",
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
      },
      {
        question: "Was war das Hambacher Fest (1832)?",
        options: [
          "Ein Volksfest ohne politische Bedeutung",
          "Eine frühe nationale und liberale Protestveranstaltung mit Forderungen nach Einheit und Freiheit",
          "Die Gründungsveranstaltung der SPD",
          "Ein Treffen der deutschen Fürsten"
        ],
        answer: 1
      },
      {
        question: "Wer lehnte die Kaiserkrone der Paulskirche 1849 ab?",
        options: [
          "Kaiser Franz Joseph I. von Österreich",
          "König Friedrich Wilhelm IV. von Preußen",
          "Herzog von Bayern",
          "Kurfürst von Sachsen"
        ],
        answer: 1
      },
      {
        question: "Was ist der Unterschied zwischen 'kleindeutsch' und 'großdeutsch' in der Nationalversammlung?",
        options: [
          "Kleindeutsch: ohne Österreich, Großdeutsch: mit Österreich im neuen Nationalstaat",
          "Kleindeutsch: Monarchie, Großdeutsch: Republik",
          "Kleindeutsch: Liberalismus, Großdeutsch: Konservativismus",
          "Kleindeutsch: nur Norddeutschland, Großdeutsch: ganz Europa"
        ],
        answer: 0
      },
      {
        question: "Welche wirtschaftliche und soziale Ursache trieb Menschen 1848 zur Revolution?",
        options: [
          "Überfluss und Wohlstand",
          "Pauperismus, Hunger und wirtschaftliche Krise durch Missernten",
          "Mangel an politischer Bildung",
          "Fehlende Handelsrouten"
        ],
        answer: 1
      },
      {
        question: "Was ist der Unterschied zwischen Liberalismus und Nationalismus?",
        options: [
          "Liberalismus = nationale Einheit, Nationalismus = individuelle Freiheiten",
          "Liberalismus = individuelle Freiheiten und Verfassung; Nationalismus = Einheit der Nation",
          "Beide Begriffe bedeuten dasselbe",
          "Liberalismus = Sozialismus, Nationalismus = Konservativismus"
        ],
        answer: 1
      },
      {
        question: "Welche Forderungen standen im Mittelpunkt der Märzrevolution 1848?",
        options: [
          "Abschaffung der Monarchie und Einführung einer kommunistischen Ordnung",
          "Pressefreiheit, Volksvertretung, nationale Einheit und Bürgerrechte",
          "Rückgabe von Land an den Adel",
          "Wiederherstellung des Heiligen Römischen Reiches"
        ],
        answer: 1
      }
    ]
  },
  {
    id: "history-industrialisierung",
    subject: "Geschichte",
    title: "Industrialisierung und soziale Frage",
    keyTerms: ["Industrialisierung", "Proletariat", "Urbanisierung", "Soziale Frage", "Arbeiterbewegung", "Pauperismus", "Dampfmaschine", "Bismarck'sche Sozialgesetze"],
    formulas: [],
    examples: [
      "Vergleich Lebensbedingungen in Fabrikstädten vs. ländlichen Regionen (19. Jh.)",
      "Kinderarbeit und 14-Stunden-Arbeitstag als Quelle zur sozialen Frage",
      "Grafik: Bevölkerungswachstum deutscher Industriestädte 1850–1910",
      "Auswertung eines Fabrikarbeiterlohns im Vergleich zu Lebenshaltungskosten"
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
          "Der Deutsche Bund",
          "Die Gewerkschaften allein"
        ],
        answer: 1
      },
      {
        question: "Welche technische Erfindung war ein zentraler Motor der Industrialisierung?",
        options: ["Das Spinnrad", "Die Dampfmaschine", "Der Buchdruck", "Die Windmühle"],
        answer: 1
      },
      {
        question: "Was bedeutet Pauperismus?",
        options: [
          "Der Reichtum der frühen Industriellenschicht",
          "Die Massenarmut großer Teile der Bevölkerung in der frühen Industrialisierung",
          "Ein Begriff für Kinderarbeit",
          "Das Recht auf Armenunterstützung"
        ],
        answer: 1
      },
      {
        question: "Was war der Unterschied zwischen Manufaktur und Fabrik?",
        options: [
          "Beide sind identisch",
          "Manufaktur: handwerkliche Arbeitsteilung im selben Raum; Fabrik: Maschineneinsatz und industrielle Arbeitsteilung",
          "Die Fabrik war kleiner als die Manufaktur",
          "Manufakturen existierten nur in Frankreich"
        ],
        answer: 1
      },
      {
        question: "Wann begann die Industrialisierung in Deutschland im Vergleich zu England?",
        options: [
          "Deutschland industrialisierte sich früher als England",
          "Deutschland industrialisierte sich etwa 50–70 Jahre später als England (ab 1840er/50er)",
          "Beide Länder industrialisierten sich gleichzeitig",
          "Deutschland blieb Agrarstaat bis ins 20. Jahrhundert"
        ],
        answer: 1
      },
      {
        question: "Was ist eine Gewerkschaft?",
        options: [
          "Ein staatliches Kontrollgremium für Handwerksbetriebe",
          "Eine Interessenvertretung der Arbeiter zur Verbesserung von Löhnen und Arbeitsbedingungen",
          "Ein Zusammenschluss von Fabrikbesitzern",
          "Eine Behörde zur Steuererhebung"
        ],
        answer: 1
      },
      {
        question: "Welche Bismarcksche Sozialversicherung wurde zuerst eingeführt?",
        options: ["Rentenversicherung (1889)", "Unfallversicherung (1884)", "Krankenversicherung (1883)", "Arbeitslosenversicherung (1927)"],
        answer: 2
      }
    ]
  },
  {
    id: "history-nationalsozialismus",
    subject: "Geschichte",
    title: "Aufstieg und Herrschaft des Nationalsozialismus",
    keyTerms: ["NSDAP", "Gleichschaltung", "Propaganda", "Führerprinzip", "Totalitarismus", "Antisemitismus", "Ermächtigungsgesetz", "Nürnberger Gesetze"],
    formulas: [],
    examples: [
      "Auswertung von NS-Propagandaplakaten und Redetexten",
      "Ermächtigungsgesetz 1933 als Quelle für die Ausschaltung des Parlaments",
      "Nürnberger Gesetze 1935: Analyse des Textes und Folgen für jüdische Bevölkerung",
      "Novemberpogrome 1938: Augenzeugenberichte und Täterprotokolle im Vergleich"
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
      },
      {
        question: "Was war der Reichstagsbrand (Februar 1933)?",
        options: [
          "Ein Bombenangriff im Zweiten Weltkrieg",
          "Der Brand des Reichstagsgebäudes, genutzt als Vorwand für die Notstandsverordnung gegen politische Gegner",
          "Ein Unfall in einer Berliner Fabrik",
          "Ein Attentat auf Hitler"
        ],
        answer: 1
      },
      {
        question: "Was regelten die Nürnberger Gesetze (1935)?",
        options: [
          "Die Einführung des allgemeinen Wahlrechts",
          "Den Entzug der Staatsbürgerschaft für Juden und das Verbot von Ehen zwischen Juden und Nichtjuden",
          "Die Neuordnung der Reichsgrenzen",
          "Handelsverbote mit dem Ausland"
        ],
        answer: 1
      },
      {
        question: "Was ist die 'Kristallnacht' (Novemberpogrome 1938)?",
        options: [
          "Ein Staatsbesuch ausländischer Diplomaten",
          "Koordinierte Pogrome mit Zerstörung jüdischer Synagogen, Geschäfte und Verhaftung tausender Juden",
          "Ein Wirtschaftsprogramm der NSDAP",
          "Eine Jubiläumsfeier der Partei"
        ],
        answer: 1
      },
      {
        question: "Was war die SS im NS-Staat?",
        options: [
          "Ein Beratungsgremium des Reichstags",
          "Eine Elite-Terrororganisation, die für die KZ-Verwaltung und Massenmorde verantwortlich war",
          "Eine Handelsorganisation",
          "Ein Kultusministerium"
        ],
        answer: 1
      },
      {
        question: "Was verstand man unter 'Volksgemeinschaft' in der NS-Ideologie?",
        options: [
          "Eine demokratische Gesellschaft aller Staatsbürger",
          "Eine rassistisch definierte nationale Gemeinschaft, aus der 'Fremde' ausgeschlossen wurden",
          "Ein Gewerkschaftsbund",
          "Die Summe aller Parteimitglieder"
        ],
        answer: 1
      },
      {
        question: "Was meinte Hitler mit 'Lebensraum im Osten'?",
        options: [
          "Tourismusprojekte in Ostdeutschland",
          "Die gewaltsame Eroberung osteuropäischer Gebiete zur Ansiedlung der 'deutschen Rasse'",
          "Diplomatische Bündnisse mit osteuropäischen Staaten",
          "Die wirtschaftliche Zusammenarbeit mit der Sowjetunion"
        ],
        answer: 1
      }
    ]
  },
  {
    id: "history-wiedervereinigung",
    subject: "Geschichte",
    title: "Wiedervereinigung und Transformation nach 1990",
    keyTerms: ["Wiedervereinigung", "Transformation", "Währungsunion", "Privatisierung", "Treuhandanstalt", "DDR", "Friedliche Revolution", "Zwei-plus-Vier-Vertrag"],
    formulas: [],
    examples: [
      "Vergleich ökonomischer Indikatoren BRD vs. DDR 1989–1995",
      "Mauerfall 9. November 1989 als Wendepunkt",
      "Rede Helmut Kohls zur Einheit: Analyse politischer Rhetorik",
      "Zwei-plus-Vier-Vertrag: Außenpolitische Voraussetzung der Wiedervereinigung"
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
      },
      {
        question: "Was war die 'Friedliche Revolution' in der DDR?",
        options: [
          "Eine militärische Übernahme der DDR durch die BRD",
          "Die Bürgerbewegung von 1989, die mit Montagsdemonstrationen den politischen Wandel erzwang",
          "Ein diplomatisches Abkommen zwischen BRD und DDR",
          "Eine Verfassungsreform innerhalb der DDR"
        ],
        answer: 1
      },
      {
        question: "Wann trat die Wirtschafts- und Währungsunion zwischen BRD und DDR in Kraft?",
        options: ["9. November 1989", "3. Oktober 1990", "1. Juli 1990", "12. September 1990"],
        answer: 2
      },
      {
        question: "Was regelte der Zwei-plus-Vier-Vertrag (1990)?",
        options: [
          "Die Grenze zwischen BRD und DDR",
          "Die außenpolitischen Rahmenbedingungen der deutschen Einheit (mit den vier Siegermächten)",
          "Den Beitritt Deutschlands zur NATO",
          "Die Wirtschaftshilfe der USA für die neuen Bundesländer"
        ],
        answer: 1
      },
      {
        question: "Was sind die 'neuen Bundesländer'?",
        options: [
          "Bundesländer, die nach 1990 aus Westdeutschland abgespalten wurden",
          "Die 5 Bundesländer auf dem Gebiet der ehemaligen DDR",
          "Alle Bundesländer nach 1990",
          "Stadtstaaten wie Berlin und Hamburg"
        ],
        answer: 1
      },
      {
        question: "Was versteht man unter 'Aufbau Ost'?",
        options: [
          "Ein Militärprogramm zur Sicherung der Ostgrenze",
          "Staatliche Förderprogramme zur wirtschaftlichen Angleichung der neuen Bundesländer an den Westen",
          "Die Rückgabe von DDR-Staatseigentum an frühere Besitzer",
          "Die Erweiterung der NATO nach Osteuropa"
        ],
        answer: 1
      },
      {
        question: "Welcher Slogan der Montagsdemonstrationen symbolisiert den Übergang von Opposition zur Einheitsforderung?",
        options: [
          "'Freiheit statt Sozialismus'",
          "'Wir sind das Volk' → 'Wir sind ein Volk'",
          "'Einheit jetzt oder nie'",
          "'Deutschland über alles'"
        ],
        answer: 1
      }
    ]
  }
];
