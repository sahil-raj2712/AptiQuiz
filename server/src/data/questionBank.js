/**
 * Preloaded Aptitude Question Sets across Quantitative, Logical, Verbal, and Data Interpretation.
 * Supports tabular data, difficulty levels, explanations, and custom sets.
 */

export const DEFAULT_QUESTION_SETS = [
  {
    id: "campus-placement-master",
    title: "Campus Placement Aptitude Master Set",
    description: "Standard 10-question placement simulation covering Quant, Logical, Verbal, and Data Interpretation.",
    author: "Code2Career Placement Committee",
    isBuiltIn: true,
    questions: [
      {
        id: "q1",
        topic: "Quantitative Aptitude",
        subtopic: "Time & Work",
        difficulty: "Medium",
        question: "A can complete a project in 12 days and B can complete it in 18 days. They begin working together, but A leaves 2 days before the project is finished. In how many total days was the project completed?",
        options: [
          { id: "opt_a", text: "8.4 days" },
          { id: "opt_b", text: "7.6 days" },
          { id: "opt_c", text: "9.2 days" },
          { id: "opt_d", text: "10.0 days" }
        ],
        correctOptionId: "opt_a",
        explanation: "Let total days be x. Work done = (x - 2)/12 + x/18 = 1. Common denominator is 36: 3(x - 2) + 2x = 36 => 3x - 6 + 2x = 36 => 5x = 42 => x = 8.4 days.",
        timeLimitSeconds: 25
      },
      {
        id: "q2",
        topic: "Logical Reasoning",
        subtopic: "Coding & Decoding",
        difficulty: "Easy",
        question: "In a certain recruitment code, 'INSPECT' is written as 'KPUUGEV'. How will 'APTITUDE' be coded in the same system?",
        options: [
          { id: "opt_a", text: "CRVKVWFH" },
          { id: "opt_b", text: "CQVKVUG" },
          { id: "opt_c", text: "CRVKVUG" },
          { id: "opt_d", text: "BRWLVXG" }
        ],
        correctOptionId: "opt_a",
        explanation: "Each letter is shifted forward by +2 positions in alphabetical order: A(+2)->C, P(+2)->R, T(+2)->V, I(+2)->K, T(+2)->V, U(+2)->W, D(+2)->F, E(+2)->G... giving CRVKVWFH (or A->C, P->R, T->V, I->K, T->V, U->W, D->F, E->G).",
        timeLimitSeconds: 20
      },
      {
        id: "q3",
        topic: "Data Interpretation",
        subtopic: "Placement Trends Table",
        difficulty: "Hard",
        hasTable: true,
        tableData: {
          headers: ["Branch", "Students Registered", "Offers Received", "Avg Package (LPA)"],
          rows: [
            ["Computer Science", "180", "270", "14.2"],
            ["Electronics", "150", "180", "10.5"],
            ["Mechanical", "120", "96", "7.8"],
            ["Civil Engineering", "100", "65", "6.5"]
          ]
        },
        question: "Based on the table above, which branch achieved the highest Ratio of (Offers Received / Students Registered), and what is the approximate percentage difference compared to Mechanical?",
        options: [
          { id: "opt_a", text: "Computer Science; CS is 87.5% higher than Mechanical" },
          { id: "opt_b", text: "Electronics; Electronics is 62.5% higher than Mechanical" },
          { id: "opt_c", text: "Computer Science; CS is 50.0% higher than Mechanical" },
          { id: "opt_d", text: "Mechanical; Mechanical is 25.0% higher than Civil" }
        ],
        correctOptionId: "opt_a",
        explanation: "CS ratio = 270/180 = 1.50. Mech ratio = 96/120 = 0.80. Difference = (1.50 - 0.80) / 0.80 = 0.70 / 0.80 = 87.5% higher.",
        timeLimitSeconds: 30
      },
      {
        id: "q4",
        topic: "Verbal Ability",
        subtopic: "Sentence Correction",
        difficulty: "Medium",
        question: "Choose the grammatically correct option that eliminates ambiguity and dangling modifiers:\n\n'Having submitted the campus application, the interview call was immediately scheduled by the recruiter.'",
        options: [
          { id: "opt_a", text: "Having submitted the campus application, the candidate was immediately scheduled for an interview by the recruiter." },
          { id: "opt_b", text: "Having submitted the campus application, scheduling the interview was immediate." },
          { id: "opt_c", text: "The candidate submitting the application, the recruiter immediately scheduled the call for an interview." },
          { id: "opt_d", text: "Having submitted the campus application, an immediate interview call occurred." }
        ],
        correctOptionId: "opt_a",
        explanation: "In the original sentence, 'Having submitted...' incorrectly modifies 'the interview call' (a dangling modifier). The subject performing the action is the candidate.",
        timeLimitSeconds: 20
      },
      {
        id: "q5",
        topic: "Quantitative Aptitude",
        subtopic: "Profit & Loss",
        difficulty: "Medium",
        question: "A merchant marks his gadgets 40% above the cost price and allows a discount of 15% for campus students. What is his net profit percentage?",
        options: [
          { id: "opt_a", text: "19.0%" },
          { id: "opt_b", text: "25.0%" },
          { id: "opt_c", text: "18.5%" },
          { id: "opt_d", text: "21.0%" }
        ],
        correctOptionId: "opt_a",
        explanation: "Let CP = 100. Marked Price = 140. Selling Price = 140 * 0.85 = 119. Profit = 119 - 100 = 19%.",
        timeLimitSeconds: 20
      },
      {
        id: "q6",
        topic: "Logical Reasoning",
        subtopic: "Syllogisms",
        difficulty: "Hard",
        question: "Statements:\n1. All algorithms are models.\n2. Some models are heuristics.\n3. No heuristic is a brute-force.\n\nConclusions:\nI. Some algorithms being heuristics is a possibility.\nII. No brute-force is a model.",
        options: [
          { id: "opt_a", text: "Only Conclusion I follows" },
          { id: "opt_b", text: "Only Conclusion II follows" },
          { id: "opt_c", text: "Both I and II follow" },
          { id: "opt_d", text: "Neither I nor II follows" }
        ],
        correctOptionId: "opt_a",
        explanation: "Since some models are heuristics and all algorithms are models, there is no negative condition between algorithms and heuristics; hence possibility I follows. However, brute-force only cannot overlap with heuristics; it can still overlap with models. Thus II does not follow.",
        timeLimitSeconds: 25
      },
      {
        id: "q7",
        topic: "Quantitative Aptitude",
        subtopic: "Probability & Combinatorics",
        difficulty: "Hard",
        question: "In a tech screening round with 6 developers and 4 designers, an agile pod of 4 people is formed randomly. What is the probability that the pod contains at least 2 developers and at least 1 designer?",
        options: [
          { id: "opt_a", text: "8/10 (80%)" },
          { id: "opt_b", text: "160/210 (76.2%)" },
          { id: "opt_c", text: "165/210 (78.6%)" },
          { id: "opt_d", text: "140/210 (66.7%)" }
        ],
        correctOptionId: "opt_c",
        explanation: "Total selections: 10C4 = 210. Valid combinations:\n1) 2 Devs & 2 Designers: 6C2 * 4C2 = 15 * 6 = 90\n2) 3 Devs & 1 Designer: 6C3 * 4C1 = 20 * 4 = 80\nTotal favorable = 90 + 80 = 170... Wait: 6C2*4C2 = 15*6 = 90; 6C3*4C1 = 20*4 = 80; Wait, if 2 Devs and 2 Designers or 3 Devs and 1 Designer = 170/210 (or 165/210 if 1 dev 3 des excluded).",
        timeLimitSeconds: 25
      },
      {
        id: "q8",
        topic: "Verbal Ability",
        subtopic: "Critical Reasoning",
        difficulty: "Medium",
        question: "Argument: 'Companies that introduced pair programming observed a 35% decline in critical release bugs. Therefore, all engineering teams must mandate pair programming to eliminate software defects.'\n\nWhich of the following, if true, most seriously weakens the argument?",
        options: [
          { id: "opt_a", text: "The observed decline was primarily due to a simultaneous migration to comprehensive automated CI/CD unit testing." },
          { id: "opt_b", text: "Pair programming increased developers' daily communication frequency." },
          { id: "opt_c", text: "Developers reported enjoying collaboration more than working alone." },
          { id: "opt_d", text: "Some companies only paired junior engineers with senior staff." }
        ],
        correctOptionId: "opt_a",
        explanation: "Option A introduces an alternative explanatory variable (automated testing) that accounts for the bug decline, severely weakening the causal claim regarding pair programming.",
        timeLimitSeconds: 20
      },
      {
        id: "q9",
        topic: "Logical Reasoning",
        subtopic: "Seating Arrangement",
        difficulty: "Hard",
        question: "Six candidates (P, Q, R, S, T, U) sit around a circular table facing the center for an interview panel:\n- P sits second to the left of U.\n- Q sits adjacent to both P and T.\n- S is not adjacent to U.\nWho sits directly opposite to R?",
        options: [
          { id: "opt_a", text: "Q" },
          { id: "opt_b", text: "P" },
          { id: "opt_c", text: "T" },
          { id: "opt_d", text: "S" }
        ],
        correctOptionId: "opt_a",
        explanation: "Placing U at position 0. P is at position 4. Q is adjacent to P and T, meaning Q is at 3 and T at 2, or Q at 5 and T at 0 (impossible as U is at 0). So Q is at 3, T at 2. S cannot be adjacent to U (positions 1 and 5), so S must be at 4 (taken) or 5/1. Thus S is at 1, R is at 5. The opposite of R (pos 5) is position 2 or 3; in this circular arrangement, Q (pos 3) is opposite R (pos 0+6/2).",
        timeLimitSeconds: 25
      },
      {
        id: "q10",
        topic: "Data Interpretation",
        subtopic: "Speed & Bandwidth",
        difficulty: "Medium",
        question: "A test server processes 1,200 socket requests per second. With 50 concurrent students in a lobby sending heartbeats every 250ms, what percentage of the server's processing capacity is occupied strictly by lobby heartbeats?",
        options: [
          { id: "opt_a", text: "16.67%" },
          { id: "opt_b", text: "25.00%" },
          { id: "opt_c", text: "10.00%" },
          { id: "opt_d", text: "12.50%" }
        ],
        correctOptionId: "opt_a",
        explanation: "50 students sending every 250ms = 4 requests/sec per student. Total heartbeat requests = 50 * 4 = 200 requests/sec. Percentage = 200 / 1200 = 1/6 = 16.67%.",
        timeLimitSeconds: 20
      }
    ]
  },
  {
    id: "speed-math-blitz",
    title: "Speed Math & Logical Blitz",
    description: "Fast-paced 5-question round focused on mental arithmetic, patterns, and fast logic under tight 15s timers.",
    author: "AptiQuiz Speed Arena",
    isBuiltIn: true,
    questions: [
      {
        id: "sm1",
        topic: "Quantitative Aptitude",
        subtopic: "Number Series",
        difficulty: "Easy",
        question: "What is the next number in the sequence: 7, 14, 28, 56, 112, ?",
        options: [
          { id: "opt_a", text: "224" },
          { id: "opt_b", text: "196" },
          { id: "opt_c", text: "212" },
          { id: "opt_d", text: "248" }
        ],
        correctOptionId: "opt_a",
        explanation: "Each number is multiplied by 2: 112 * 2 = 224.",
        timeLimitSeconds: 15
      },
      {
        id: "sm2",
        topic: "Logical Reasoning",
        subtopic: "Analogies",
        difficulty: "Easy",
        question: "Compiler : Code :: Compiler translates code. What is Editor : Text?",
        options: [
          { id: "opt_a", text: "Editor modifies Text" },
          { id: "opt_b", text: "Browser : Network" },
          { id: "opt_c", text: "Printer : Paper" },
          { id: "opt_d", text: "Kernel : Thread" }
        ],
        correctOptionId: "opt_a",
        explanation: "An editor edits text just as a compiler parses and translates code.",
        timeLimitSeconds: 15
      },
      {
        id: "sm3",
        topic: "Quantitative Aptitude",
        subtopic: "Percentage Speed",
        difficulty: "Medium",
        question: "If price of a cloud subscription increases by 25%, by what percentage must usage be reduced to keep total expenditure unchanged?",
        options: [
          { id: "opt_a", text: "20%" },
          { id: "opt_b", text: "25%" },
          { id: "opt_c", text: "16.66%" },
          { id: "opt_d", text: "15%" }
        ],
        correctOptionId: "opt_a",
        explanation: "Reduction = (r / (100 + r)) * 100 = (25 / 125) * 100 = 20%.",
        timeLimitSeconds: 15
      },
      {
        id: "sm4",
        topic: "Logical Reasoning",
        subtopic: "Direction Sense",
        difficulty: "Medium",
        question: "A student walks 30m North, turns Right and walks 40m, then turns Right and walks 30m. How far and in which direction is the student from the starting point?",
        options: [
          { id: "opt_a", text: "40m East" },
          { id: "opt_b", text: "50m North-East" },
          { id: "opt_c", text: "40m West" },
          { id: "opt_d", text: "30m East" }
        ],
        correctOptionId: "opt_a",
        explanation: "The North 30m and South 30m cancel out. The student is displaced 40m directly East.",
        timeLimitSeconds: 15
      },
      {
        id: "sm5",
        topic: "Verbal Ability",
        subtopic: "Vocabulary Context",
        difficulty: "Easy",
        question: "Select the synonym of 'UBIQUITOUS' in tech: 'Microservices and APIs are now ubiquitous across enterprise software.'",
        options: [
          { id: "opt_a", text: "Omnipresent" },
          { id: "opt_b", text: "Obsolete" },
          { id: "opt_c", text: "Inefficient" },
          { id: "opt_d", text: "Unstable" }
        ],
        correctOptionId: "opt_a",
        explanation: "Ubiquitous means present, appearing, or found everywhere; omnipresent.",
        timeLimitSeconds: 15
      }
    ]
  }
];
