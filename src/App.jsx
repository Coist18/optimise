import { useState, useEffect, useRef } from "react";

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────

const save = (key, value) => {
  try { localStorage.setItem("optimise_" + key, JSON.stringify(value)); } catch(e) {}
};

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem("optimise_" + key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch(e) { return fallback; }
};

const TODAY = new Date().toISOString().slice(0, 10);

const loadToday = (key, fallback) => {
  const stored = load(key + "_date", null);
  if (stored === TODAY) return load(key, fallback);
  return fallback;
};

const saveToday = (key, value) => {
  save(key, value);
  save(key + "_date", TODAY);
};

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell } from "recharts";

// ─── DATA ───────────────────────────────────────────────────────────────────

const QUOTES = [
  "The only thing standing between you and your goals is consistency, the only thing standing between you and consistency is discipline, the only thing standing between you and discipline is mindset. Once you conquer your mindset anything is achievable.",
  "Success is a decision.",
  "No results? Keep working. Bad results? Keep working. Great results? Keep working. Consistency is KEY.",
  "Nothing in life is out of reach. I can and I will. Just watch.",
  "You'll never change your life until you change the habits you do daily.",
  "Your biggest enemy is your uncontrolled mind.",
  "Discipline can fix 80% of your problems.",
  "A man who procrastinates in his choosing will inevitably have his choice made for him by circumstances.",
  "Eat, work out, make money, spend time with family, sleep.",
  "Don't forget to be grateful for whatever you have.",
  "You don't get what you wish for, you get what you work for.",
  "Day by day, what you choose, what you think, and what you do, is who you become.",
  "Comfort is a warm and enticing poison.",
  "If you don't know what to pursue in life at the moment, pursue yourself. Pursue becoming the most healthy, happiest, most healed, most present, most confident version of yourself. The right path will reveal itself.",
  "Train insane or remain the same.",
  "Don't let a day pass without adding a brick to your castle.",
  "Be a man who is obsessed with fitness, finance and family. Everything else is a distraction.",
  "When a man can't find a deep sense of meaning, he distracts himself with pleasure.",
  "Life begins at the end of your comfort zone.",
  "Become obsessed with self improvement.",
  "The first and greatest victory is to conquer yourself.",
  "The happiness of your life depends on the quality of your thoughts.",
  "The way to get started is to quit talking and start doing.",
  "Embrace discomfort, for it sharpens your character and reveals your true potential. Growth only comes from stepping outside your comfort zone.",
  "Be the type of man you want your son to become.",
  "A winner is a loser that tried one more time.",
  "We must all suffer one of two pains. The pain of discipline or the pain of regret.",
  "Deep down you know there are habits costing you the quality of life you want. Cut it out.",
  "If it's endurable then endure it, stop complaining.",
  "As a man, never get desperate. Stay calm in tough times, know it's your turn to struggle, like any great man before you.",
  "I ask not for a lighter burden, but broader shoulders to carry it.",
  "Difficulty is what wakes up the genius.",
  "After getting what you manifested, ask for discipline to keep it and wisdom to multiply it.",
  "21 days can build a new habit. In 90 days you can build a new lifestyle. It essentially takes 3 months to change your life. It's not easy, but it's simple.",
  "Discipline is training your mind to not give a care if it's hard — if it needs to get done, it gets done.",
  "It takes just ONE person in your family to think about money differently and put a plan in place to create wealth that will carry on for generations.",
  "Accountability is like rain, we all need it but no one likes getting wet.",
  "Missing out on temporary fun to build permanent stability is not a loss.",
  "Discipline is the highest form of self-love because it shows you care enough to do what's right for you, even when it's hard.",
  "What you're not changing, you're choosing.",
  "You can't have one foot in your old life and one foot in your new life. True change only comes when you're fully committed to the new life.",
  "If you're tired, then do it tired.",
  "The road to heaven feels like hell. The road to hell feels like heaven.",
  "If you actually try your best, you can't lose.",
  "A habit missed once is a mistake. A habit missed twice is the start of a new habit.",
  "Smooth seas never made skilled sailors. Comfort is the enemy of competence.",
  "You miss 100% of the shots you don't take.",
  "Don't forget that the goal isn't money — the goal is to spend your days how you like.",
  "An organised minority will beat a disorganised majority.",
  "If you don't find a way to make money in your sleep, you will work until you die.",
  "We are what we repeatedly do. Excellence, therefore, is but a habit.",
  "To be all-in you have to b-all-in.",
  "Your confidence grows when you keep the promises you made to yourself. Especially the promises no one knows about. Keep going.",
  "The longer you stay comfortable, the longer you stay stuck. Keep moving.",
  "Worry doesn't take away tomorrow's doubts — it takes away today's peace.",
  // Mike Mentzer
  "The most important thing in life is to stop saying 'I wish' and start saying 'I will.' — Mike Mentzer",
  "Achieving a goal requires thought, and then sustained effort in a specific direction. — Mike Mentzer",
  "Train less, think more. — Mike Mentzer",
  "High intensity training means working as hard as possible for as short a time as possible. — Mike Mentzer",
  "Growth only occurs if you impose a demand on a muscle that is beyond what it has previously encountered. — Mike Mentzer",
  // Curated library
  "The impediment to action advances action. What stands in the way becomes the way. — Marcus Aurelius",
  "You have power over your mind, not outside events. Realize this, and you will find strength. — Marcus Aurelius",
  "Waste no more time arguing about what a good man should be. Be one. — Marcus Aurelius",
  "It is not that I'm so smart, it's just that I stay with problems longer. — Albert Einstein",
  "Hard choices, easy life. Easy choices, hard life. — Jerzy Gregorek",
  "The cave you fear to enter holds the treasure you seek. — Joseph Campbell",
  "Do not pray for an easy life. Pray for the strength to endure a difficult one. — Bruce Lee",
];

const MORNING_ROUTINE = [
  { id: "phone", icon: "📵", label: "No phone for 30 mins", desc: "Reduces morning cortisol spike", time: "5 min" },
  { id: "water", icon: "💧", label: "Drink 500ml of water", desc: "Boosts alertness and hydration", time: "2 min" },
  { id: "light", icon: "☀️", label: "10 mins natural light", desc: "Sets your circadian rhythm", time: "10 min" },
  { id: "breathe", icon: "🧘", label: "Mindfulness / breathing", desc: "Lowers stress hormones", time: "10 min" },
  { id: "move", icon: "🏃", label: "Movement", desc: "Walk, stretch or workout", time: "15 min" },
  { id: "cold", icon: "🧊", label: "Cold shower", desc: "Dopamine and norepinephrine boost", time: "5 min" },
  { id: "read", icon: "📖", label: "Read or learn something", desc: "10 mins to prime the brain", time: "10 min" },
];

const PUSH_EXERCISES = [
  "Bench Press","Incline Bench Press","Decline Bench Press","Dumbbell Flyes","Cable Crossover",
  "Overhead Press","Dumbbell Lateral Raise","Arnold Press","Front Raise","Tricep Pushdown",
  "Skull Crushers","Close Grip Bench Press","Overhead Tricep Extension","Dips"
];
const PULL_EXERCISES = [
  "Deadlift","Barbell Row","Dumbbell Row","Lat Pulldown","Pull Ups / Chin Ups",
  "Seated Cable Row","Face Pulls","Rear Delt Flyes","Straight Arm Pulldown",
  "Barbell Curl","Dumbbell Curl","Hammer Curl","Preacher Curl","Cable Curl"
];
const LEGS_EXERCISES = [
  "Squat","Leg Press","Hack Squat","Lunges","Bulgarian Split Squat","Leg Extension",
  "Leg Curl","Romanian Deadlift","Stiff Leg Deadlift","Glute Bridge","Hip Thrust",
  "Standing Calf Raise","Seated Calf Raise","Smith Machine Squat"
];

const MEALS = {
  balanced: [
    { name: "Grilled Chicken & Sweet Potato Bowl", protein: "High", fat: "Med", carbs: "Med", time: "25 min", ingredients: ["Chicken breast", "Sweet potato", "Broccoli", "Olive oil", "Garlic"] },
    { name: "Beef Stir Fry with Rice", protein: "High", fat: "Med", carbs: "High", time: "20 min", ingredients: ["Beef strips", "Brown rice", "Mixed veg", "Soy sauce", "Ginger"] },
    { name: "Egg & Avocado Bowl", protein: "High", fat: "High", carbs: "Low", time: "10 min", ingredients: ["4 eggs", "Avocado", "Spinach", "Cherry tomatoes", "Olive oil"] },
    { name: "Chicken Thigh & Quinoa", protein: "High", fat: "Med", carbs: "Med", time: "30 min", ingredients: ["Chicken thighs", "Quinoa", "Roasted veg", "Lemon", "Herbs"] },
    { name: "Beef & Lentil Bowl", protein: "High", fat: "Med", carbs: "Med", time: "35 min", ingredients: ["Minced beef", "Red lentils", "Onion", "Cumin", "Spinach"] },
    { name: "Omelette with Cottage Cheese", protein: "High", fat: "Med", carbs: "Low", time: "10 min", ingredients: ["3 eggs", "Cottage cheese", "Spinach", "Pepper", "Butter"] },
  ],
  carnivore: [
    { name: "Ribeye Steak", protein: "High", fat: "High", carbs: "Zero", time: "15 min", ingredients: ["Ribeye steak", "Butter", "Rosemary", "Garlic", "Salt"] },
    { name: "Minced Beef Patties", protein: "High", fat: "High", carbs: "Zero", time: "15 min", ingredients: ["Minced beef 80/20", "Salt", "Butter", "Egg yolk"] },
    { name: "Slow Cooked Lamb Shoulder", protein: "High", fat: "High", carbs: "Zero", time: "180 min", ingredients: ["Lamb shoulder", "Tallow", "Salt", "Rosemary"] },
    { name: "Chicken Thighs & Eggs", protein: "High", fat: "High", carbs: "Zero", time: "20 min", ingredients: ["Chicken thighs", "3 eggs", "Butter", "Salt"] },
    { name: "Beef Liver & Bacon", protein: "High", fat: "High", carbs: "Zero", time: "15 min", ingredients: ["Beef liver", "Bacon", "Butter", "Salt"] },
    { name: "Lamb Chops", protein: "High", fat: "High", carbs: "Zero", time: "20 min", ingredients: ["Lamb chops", "Butter", "Salt", "Thyme"] },
  ],
  vegetarian: [
    { name: "Lentil Dahl", protein: "Med", fat: "Med", carbs: "High", time: "30 min", ingredients: ["Red lentils", "Coconut milk", "Cumin", "Turmeric", "Spinach"] },
    { name: "Chickpea Curry", protein: "Med", fat: "Med", carbs: "High", time: "25 min", ingredients: ["Chickpeas", "Tomatoes", "Onion", "Garam masala", "Ginger"] },
    { name: "Greek Yoghurt & Nut Bowl", protein: "High", fat: "High", carbs: "Med", time: "5 min", ingredients: ["Greek yoghurt", "Mixed nuts", "Berries", "Honey", "Seeds"] },
    { name: "Egg Frittata", protein: "High", fat: "Med", carbs: "Low", time: "20 min", ingredients: ["6 eggs", "Feta cheese", "Spinach", "Pepper", "Olive oil"] },
    { name: "Black Bean Bowl", protein: "Med", fat: "Med", carbs: "High", time: "20 min", ingredients: ["Black beans", "Brown rice", "Avocado", "Lime", "Coriander"] },
    { name: "Avocado & Cottage Cheese Plate", protein: "High", fat: "High", carbs: "Low", time: "5 min", ingredients: ["Avocado", "Cottage cheese", "Walnuts", "Olive oil", "Seeds"] },
  ]
};

const SPEND_CATEGORIES = [
  "Bills & Essentials","Groceries","Transport","Eating Out","Health & Fitness",
  "Education & Growth","Clothing","Entertainment","Health & Wellbeing",
  "Savings & Investments","Gifts","Vices","Custom"
];

const INVESTMENTS = [
  { name: "S&P 500 Index Fund", moderate: 7, high: 11 },
  { name: "Stocks & Shares ISA", moderate: 7, high: 12 },
  { name: "Property", moderate: 5, high: 9 },
  { name: "Cryptocurrency", moderate: 18, high: 50 },
  { name: "Bonds", moderate: 4, high: 6 },
  { name: "ETFs", moderate: 7, high: 12 },
  { name: "Gold & Commodities", moderate: 5, high: 10 },
  { name: "REITs", moderate: 6, high: 11 },
  { name: "Custom Portfolio", moderate: null, high: null },
];

const MOCK_WEEKLY = [
  { day: "Mon", score: 72, sleep: 70, diet: 80, fitness: 90, focus: 65, finance: 75 },
  { day: "Tue", score: 81, sleep: 85, diet: 75, fitness: 0, focus: 88, finance: 80 },
  { day: "Wed", score: 68, sleep: 60, diet: 70, fitness: 85, focus: 55, finance: 70 },
  { day: "Thu", score: 88, sleep: 90, diet: 85, fitness: 95, focus: 82, finance: 90 },
  { day: "Fri", score: 75, sleep: 72, diet: 78, fitness: 0, focus: 78, finance: 72 },
  { day: "Sat", score: 84, sleep: 80, diet: 90, fitness: 92, focus: 76, finance: 85 },
  { day: "Sun", score: 79, sleep: 88, diet: 82, fitness: 0, focus: 70, finance: 78 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const getTodayQuote = () => {
  const idx = new Date().getDate() % QUOTES.length;
  return QUOTES[idx];
};

const pad = (n) => String(n).padStart(2, "0");

const calcInvestment = (lump, monthly, years, rate) => {
  const r = rate / 100 / 12;
  const n = years * 12;
  const futureMonthly = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const futureLump = lump * Math.pow(1 + rate / 100, years);
  return Math.round(futureMonthly + futureLump);
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const ScoreRing = ({ score, label, size = 80 }) => {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8e8e8" strokeWidth={size * 0.08} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a1a" strokeWidth={size * 0.08}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
        <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
          style={{ transform: `rotate(90deg) translate(0, -${size}px)`, fontSize: size * 0.22, fontFamily: "'Bebas Neue', sans-serif", fill: "#1a1a1a", transformOrigin: `${size/2}px ${size/2}px` }}>
          {score}%
        </text>
      </svg>
      {label && <span style={{ fontSize: 10, color: "#888", letterSpacing: 2, fontWeight: 600, textTransform: "uppercase" }}>{label}</span>}
    </div>
  );
};

const CategoryBar = ({ icon, label, value, color = "#1a1a1a" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
    <span style={{ fontSize: 16, width: 20 }}>{icon}</span>
    <span style={{ fontSize: 11, color: "#555", width: 70, fontWeight: 500 }}>{label}</span>
    <div style={{ flex: 1, height: 6, background: "#ebebeb", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 3, transition: "width 1s ease" }} />
    </div>
    <span style={{ fontSize: 11, color: "#1a1a1a", fontWeight: 700, width: 32, textAlign: "right" }}>{value}%</span>
  </div>
);

// ─── TABS ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "morning", icon: "🌅", label: "Morning" },
  { id: "sleep", icon: "😴", label: "Sleep" },
  { id: "diet", icon: "🥗", label: "Diet" },
  { id: "fitness", icon: "🏋️", label: "Fitness" },
  { id: "focus", icon: "🎯", label: "Focus" },
  { id: "finance", icon: "💰", label: "Finance" },
  { id: "goals", icon: "🏆", label: "Goals" },
  { id: "charts", icon: "📊", label: "Charts" },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function Optimise() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showQuote, setShowQuote] = useState(() => load("showQuote_date", null) !== TODAY);
  const [intention, setIntention] = useState(() => loadToday("intention", ""));
  const [savedQuotes, setSavedQuotes] = useState(() => load("savedQuotes", []));
  const [quoteIdx, setQuoteIdx] = useState(() => loadToday("quoteIdx", new Date().getDate() % QUOTES.length));

  // Morning
  const [morningChecks, setMorningChecks] = useState(() => loadToday("morningChecks", {}));

  // Sleep
  const [sleepData, setSleepData] = useState(() => load("sleepData", { bedtime: "22:30", waketime: "06:30", quality: 75, alcohol: "no", units: 0, note: "" }));

  // Diet
  const [dietData, setDietData] = useState(() => loadToday("dietData", { mealQuality: 75, protein: "high", fruitsVeg: true, processed: "none", hydration: 2.5, dietMode: "balanced" }));
  const [mealFilter, setMealFilter] = useState({ mode: "balanced", time: "all" });

  // Fitness
  const [fitnessData, setFitnessData] = useState(() => loadToday("fitnessData", { sessionType: "push", duration: 45, intensity: 85, hitGoal: true, exercises: [], note: "" }));
  const [customExercises, setCustomExercises] = useState(() => load("customExercises", { push: [], pull: [], legs: [] }));
  const [newExercise, setNewExercise] = useState("");
  const [workoutLog, setWorkoutLog] = useState(() => loadToday("workoutLog", []));
  const [activeExercise, setActiveExercise] = useState(null);
  const [sets, setSets] = useState([{ weight: "", reps: "", failure: false }, { weight: "", reps: "", failure: false }, { weight: "", reps: "", failure: false }]);

  // Focus
  const [focusData, setFocusData] = useState(() => loadToday("focusData", { rating: 75, deepWork: 3, totalHours: 2.5, distraction: 25, energy: "high", screenTime: 2.5, socialMedia: 45, youtube: 30 }));
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroMode, setPomodoroMode] = useState(25);
  const [pomodoroTask, setPomodoroTask] = useState("");
  const timerRef = useRef(null);

  // Finance
  const [spends, setSpends] = useState(() => loadToday("spends", []));
  const [newSpend, setNewSpend] = useState({ amount: "", category: "Groceries", tag: "neutral", note: "" });
  const [portfolio, setPortfolio] = useState(() => load("portfolio", []));
  const [portfolioYears, setPortfolioYears] = useState(() => load("portfolioYears", 10));
  const [newInv, setNewInv] = useState({ name: "", type: 0, lump: 0, monthly: 200, frequency: "monthly", scenario: "moderate", customRate: 8 });
  const [showAddInv, setShowAddInv] = useState(false);

  // Goals
  const [goals, setGoals] = useState(() => load("goals", [
    { id: 1, name: "Complete morning routine", timeframe: "daily", category: "morning", target: 1, current: 0, unit: "times" },
    { id: 2, name: "Train 4x this week", timeframe: "weekly", category: "fitness", target: 4, current: 0, unit: "sessions" },
    { id: 3, name: "Invest \u00a3200 this month", timeframe: "monthly", category: "finance", target: 200, current: 0, unit: "\u00a3" },
    { id: 4, name: "Build \u00a310k portfolio this year", timeframe: "yearly", category: "investments", target: 10000, current: 0, unit: "\u00a3" },
  ]));
  const [newGoal, setNewGoal] = useState({ name: "", timeframe: "daily", category: "morning", target: "", unit: "" });

  // Scores
  const morningScore = Math.round((Object.values(morningChecks).filter(Boolean).length / MORNING_ROUTINE.length) * 100);
  const sleepScore = Math.round((sleepData.quality * 0.5) + (sleepData.alcohol === "no" ? 30 : 10) + 20);
  const dietScore = Math.round((dietData.mealQuality * 0.5) + (dietData.protein === "high" ? 20 : 10) + (dietData.fruitsVeg ? 15 : 0) + (dietData.processed === "none" ? 15 : 5));
  const fitnessScore = Math.min(100, Math.round((fitnessData.intensity * 0.6) + (fitnessData.hitGoal ? 25 : 0) + 15));
  const focusScore = Math.round((focusData.rating * 0.5) + ((100 - focusData.distraction) * 0.3) + (focusData.deepWork >= 3 ? 20 : 10));
  const prodSpend = spends.filter(s => s.tag === "productive").reduce((a, b) => a + Number(b.amount), 0);
  const unprodSpend = spends.filter(s => s.tag === "unproductive").reduce((a, b) => a + Number(b.amount), 0);
  const totalSpend = spends.reduce((a, b) => a + Number(b.amount), 0);
  const financeScore = totalSpend > 0 ? Math.round(100 - (unprodSpend / totalSpend) * 100) : 85;
  const goalScore = goals.length > 0 ? Math.round(goals.reduce((a, g) => a + Math.min(100, (g.current / g.target) * 100), 0) / goals.length) : 0;
  const overallScore = Math.round((morningScore + sleepScore + dietScore + fitnessScore + focusScore + financeScore + goalScore) / 7);

  // Pomodoro
  useEffect(() => {
    if (pomodoroActive) {
      timerRef.current = setInterval(() => {
        setPomodoroTime(t => {
          if (t <= 1) { clearInterval(timerRef.current); setPomodoroActive(false); return pomodoroMode * 60; }
          return t - 1;
        });
      }, 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [pomodoroActive]);


  // ── PERSIST ALL STATE TO LOCALSTORAGE ──────────────────────────────────────
  useEffect(() => { if (!showQuote) save("showQuote_date", TODAY); }, [showQuote]);
  useEffect(() => { saveToday("intention", intention); }, [intention]);
  useEffect(() => { save("savedQuotes", savedQuotes); }, [savedQuotes]);
  useEffect(() => { saveToday("quoteIdx", quoteIdx); }, [quoteIdx]);
  useEffect(() => { saveToday("morningChecks", morningChecks); }, [morningChecks]);
  useEffect(() => { save("sleepData", sleepData); }, [sleepData]);
  useEffect(() => { saveToday("dietData", dietData); }, [dietData]);
  useEffect(() => { saveToday("fitnessData", fitnessData); }, [fitnessData]);
  useEffect(() => { save("customExercises", customExercises); }, [customExercises]);
  useEffect(() => { saveToday("workoutLog", workoutLog); }, [workoutLog]);
  useEffect(() => { saveToday("focusData", focusData); }, [focusData]);
  useEffect(() => { saveToday("spends", spends); }, [spends]);
  useEffect(() => { save("portfolio", portfolio); }, [portfolio]);
  useEffect(() => { save("portfolioYears", portfolioYears); }, [portfolioYears]);
  useEffect(() => { save("goals", goals); }, [goals]);

  // ── SAVE DAILY SCORE TO HISTORY ─────────────────────────────────────────────
  useEffect(() => {
    if (overallScore > 0) {
      const history = load("scoreHistory", []);
      const existing = history.findIndex(h => h.day === TODAY);
      const entry = { day: TODAY, score: overallScore, sleep: sleepScore, diet: dietScore, fitness: fitnessScore, focus: focusScore, finance: financeScore, morning: morningScore };
      if (existing >= 0) history[existing] = entry;
      else history.push(entry);
      save("scoreHistory", history.slice(-90));
    }
  }, [overallScore]);

  const now = new Date();
  const fastingOpen = now.getHours() >= 12 && now.getHours() < 20;
  const fastingStatus = fastingOpen ? "🟢 Eating Window Open" : "🔴 Fasting Active";

  // ── RENDER SECTIONS ────────────────────────────────────────────────────────

  const renderQuoteScreen = () => (
    <div style={{ position: "fixed", inset: 0, background: "#f8f8f6", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, animation: "fadeIn 0.8s ease" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#1a1a1a" }} />
      <p style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 6, fontSize: 13, color: "#aaa", marginBottom: 48 }}>OPTIMISE — {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}</p>
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <p style={{ fontSize: 22, lineHeight: 1.55, color: "#1a1a1a", fontWeight: 300, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 40 }}>
          "{QUOTES[quoteIdx]}"
        </p>
        <div style={{ width: 40, height: 1, background: "#ccc", margin: "0 auto 32px" }} />
        <p style={{ fontSize: 11, color: "#aaa", letterSpacing: 3, marginBottom: 16, fontWeight: 600 }}>TODAY'S INTENTION</p>
        <input value={intention} onChange={e => setIntention(e.target.value)}
          placeholder="I intend to..."
          style={{ width: "100%", border: "none", borderBottom: "1px solid #ddd", background: "transparent", padding: "8px 0", fontSize: 15, color: "#1a1a1a", outline: "none", textAlign: "center", marginBottom: 40 }} />
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => setSavedQuotes(q => [...q, QUOTES[quoteIdx]])}
            style={{ padding: "8px 20px", border: "1px solid #ddd", background: "transparent", borderRadius: 4, cursor: "pointer", fontSize: 12, color: "#555", letterSpacing: 1 }}>♡ SAVE</button>
          <button onClick={() => setQuoteIdx(i => (i + 1) % QUOTES.length)}
            style={{ padding: "8px 20px", border: "1px solid #ddd", background: "transparent", borderRadius: 4, cursor: "pointer", fontSize: 12, color: "#555", letterSpacing: 1 }}>↻ NEW</button>
          <button onClick={() => setShowQuote(false)}
            style={{ padding: "8px 28px", border: "none", background: "#1a1a1a", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 12, letterSpacing: 2, fontWeight: 600 }}>BEGIN →</button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <ScoreRing score={overallScore} label="Today's Score" size={110} />
        <p style={{ marginTop: 8, fontSize: 11, color: "#aaa", letterSpacing: 2 }}>
          {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
        </p>
        {intention && <p style={{ marginTop: 8, fontSize: 13, color: "#555", fontStyle: "italic" }}>"{intention}"</p>}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #efefef" }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 14 }}>CATEGORY SCORES</p>
        <CategoryBar icon="🌅" label="Morning" value={morningScore} />
        <CategoryBar icon="😴" label="Sleep" value={sleepScore} />
        <CategoryBar icon="🥗" label="Diet" value={dietScore} />
        <CategoryBar icon="🏋️" label="Fitness" value={fitnessScore} />
        <CategoryBar icon="🎯" label="Focus" value={focusScore} />
        <CategoryBar icon="💰" label="Finance" value={financeScore} />
        <CategoryBar icon="🏆" label="Goals" value={goalScore} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[{ label: "Morning", score: morningScore }, { label: "Afternoon", score: Math.round((dietScore + focusScore) / 2) }, { label: "Evening", score: Math.round((fitnessScore + financeScore) / 2) }].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: 10, padding: "14px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", color: "#1a1a1a" }}>{s.score}%</p>
            <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2 }}>{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #efefef", marginBottom: 16 }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 10 }}>💡 TODAY'S RECOMMENDATION</p>
        <p style={{ fontSize: 13, color: "#333", lineHeight: 1.6 }}>
          {morningScore < 60 ? "Your morning routine is your highest leverage habit. Complete it fully today to boost all other scores." :
           sleepScore < 65 ? "Your sleep score is dragging down your overall performance. Consider logging alcohol and late eating patterns." :
           focusScore < 70 ? "Your focus score has room to grow. Try completing a Pomodoro session before checking your phone." :
           "You're performing well across the board. Push your weakest category today to break a new personal best."}
        </p>
      </div>

      <div style={{ background: "#f8f8f6", borderRadius: 12, padding: "14px 20px", border: "1px solid #efefef" }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 6 }}>FASTING STATUS</p>
        <p style={{ fontSize: 14, color: "#1a1a1a", fontWeight: 600 }}>{fastingStatus}</p>
        <p style={{ fontSize: 11, color: "#888" }}>Window: 12:00 → 20:00 &nbsp;|&nbsp; {fastingOpen ? "Closes at 20:00" : "Opens at 12:00"}</p>
      </div>
    </div>
  );

  const renderMorning = () => (
    <div>
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #efefef" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600 }}>MORNING ROUTINE</p>
          <ScoreRing score={morningScore} size={52} />
        </div>
        <p style={{ fontSize: 11, color: "#888", marginBottom: 16 }}>Target: 40–60 mins total</p>
        {MORNING_ROUTINE.map(item => (
          <div key={item.id} onClick={() => setMorningChecks(c => ({ ...c, [item.id]: !c[item.id] }))}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${morningChecks[item.id] ? "#1a1a1a" : "#ddd"}`, background: morningChecks[item.id] ? "#1a1a1a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
              {morningChecks[item.id] && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
            </div>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: morningChecks[item.id] ? "#aaa" : "#1a1a1a", textDecoration: morningChecks[item.id] ? "line-through" : "none" }}>{item.label}</p>
              <p style={{ fontSize: 11, color: "#aaa" }}>{item.desc}</p>
            </div>
            <span style={{ fontSize: 10, color: "#bbb", letterSpacing: 1 }}>{item.time}</span>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #efefef" }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 12 }}>SAVED QUOTES</p>
        {savedQuotes.length === 0 ? <p style={{ fontSize: 13, color: "#bbb" }}>Save quotes from the opening screen to see them here.</p> :
          savedQuotes.map((q, i) => <p key={i} style={{ fontSize: 12, color: "#555", borderBottom: "1px solid #f5f5f5", padding: "8px 0", lineHeight: 1.5 }}>"{q}"</p>)}
      </div>
    </div>
  );

  const renderSleep = () => {
    const bedH = parseInt(sleepData.bedtime.split(":")[0]);
    const bedM = parseInt(sleepData.bedtime.split(":")[1]);
    const wakeH = parseInt(sleepData.waketime.split(":")[0]);
    const wakeM = parseInt(sleepData.waketime.split(":")[1]);
    let totalMins = ((wakeH * 60 + wakeM) - (bedH * 60 + bedM) + 1440) % 1440;
    const totalHrs = (totalMins / 60).toFixed(1);
    return (
      <div>
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #efefef" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600 }}>SLEEP LOG</p>
            <ScoreRing score={Math.min(100, sleepScore)} size={52} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[["Bedtime", "bedtime", "time"], ["Wake Time", "waketime", "time"]].map(([label, key, type]) => (
              <div key={key}>
                <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 4 }}>{label.toUpperCase()}</p>
                <input type={type} value={sleepData[key]} onChange={e => setSleepData(s => ({ ...s, [key]: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", fontSize: 14, fontWeight: 600, color: "#1a1a1a" }} />
              </div>
            ))}
          </div>
          <div style={{ background: "#f8f8f6", borderRadius: 8, padding: "10px 14px", marginBottom: 16, textAlign: "center" }}>
            <p style={{ fontSize: 24, fontFamily: "'Bebas Neue', sans-serif", color: "#1a1a1a" }}>{totalHrs} hrs</p>
            <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2 }}>TOTAL SLEEP</p>
            {totalHrs < 7 && <p style={{ fontSize: 11, color: "#e07b54", marginTop: 4 }}>⚠ Below recommended 7–9 hours</p>}
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 8 }}>SLEEP QUALITY — {sleepData.quality}%</p>
            <input type="range" min={0} max={100} value={sleepData.quality} onChange={e => setSleepData(s => ({ ...s, quality: Number(e.target.value) }))}
              style={{ width: "100%", accentColor: "#1a1a1a" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 8 }}>ALCOHOL CONSUMED?</p>
            <div style={{ display: "flex", gap: 8 }}>
              {["no", "yes"].map(v => (
                <button key={v} onClick={() => setSleepData(s => ({ ...s, alcohol: v }))}
                  style={{ flex: 1, padding: "8px", border: `2px solid ${sleepData.alcohol === v ? "#1a1a1a" : "#eee"}`, borderRadius: 6, background: sleepData.alcohol === v ? "#1a1a1a" : "#fff", color: sleepData.alcohol === v ? "#fff" : "#555", fontWeight: 600, cursor: "pointer", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          {sleepData.alcohol === "yes" && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 8 }}>UNITS CONSUMED</p>
              <input type="number" value={sleepData.units} onChange={e => setSleepData(s => ({ ...s, units: e.target.value }))}
                style={{ width: "100%", border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", fontSize: 14 }} />
              <p style={{ fontSize: 11, color: "#e07b54", marginTop: 6 }}>⚠ Alcohol logged — sleep quality correlation will be tracked</p>
            </div>
          )}
          <div>
            <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 6 }}>NOTE (OPTIONAL)</p>
            <textarea value={sleepData.note} onChange={e => setSleepData(s => ({ ...s, note: e.target.value }))}
              placeholder="Stress, late eating, anything notable..." rows={2}
              style={{ width: "100%", border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", fontSize: 13, resize: "none", fontFamily: "inherit" }} />
          </div>
        </div>
        <div style={{ background: "#f8f8f6", borderRadius: 12, padding: "14px 20px", border: "1px solid #efefef" }}>
          <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 8 }}>TARGETS</p>
          {[["Duration", `${totalHrs} hrs`, Number(totalHrs) >= 7, "7–9 hours"],["Quality", `${sleepData.quality}%`, sleepData.quality >= 70, "70%+"],["Alcohol", sleepData.alcohol === "no" ? "None" : `${sleepData.units} units`, sleepData.alcohol === "no", "Zero for best sleep"]].map(([l, v, ok, t]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #eee" }}>
              <span style={{ fontSize: 12, color: "#555" }}>{l}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: ok ? "#4a8c5c" : "#e07b54" }}>{v}</span>
              <span style={{ fontSize: 11, color: "#bbb" }}>Target: {t}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDiet = () => (
    <div>
      <div style={{ background: fastingOpen ? "#edf7f0" : "#fff8f5", borderRadius: 12, padding: "14px 20px", marginBottom: 16, border: `1px solid ${fastingOpen ? "#b8dfc6" : "#ffd4c2"}` }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: fastingOpen ? "#2d6a42" : "#c45a2a" }}>{fastingStatus}</p>
        <p style={{ fontSize: 11, color: "#888" }}>Fasting: 20:00 → 12:00 &nbsp;|&nbsp; Eating: 12:00 → 20:00</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #efefef" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600 }}>DIET LOG</p>
          <ScoreRing score={Math.min(100, dietScore)} size={52} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 6 }}>DIET MODE</p>
          <div style={{ display: "flex", gap: 6 }}>
            {[["balanced","⚖️ Balanced"], ["carnivore","🥩 Carnivore"], ["vegetarian","🌿 Vegetarian"]].map(([v, l]) => (
              <button key={v} onClick={() => setDietData(d => ({ ...d, dietMode: v }))}
                style={{ flex: 1, padding: "7px 4px", border: `2px solid ${dietData.dietMode === v ? "#1a1a1a" : "#eee"}`, borderRadius: 6, background: dietData.dietMode === v ? "#1a1a1a" : "#fff", color: dietData.dietMode === v ? "#fff" : "#555", cursor: "pointer", fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 6 }}>MEAL QUALITY — {dietData.mealQuality}%</p>
          <input type="range" min={0} max={100} value={dietData.mealQuality} onChange={e => setDietData(d => ({ ...d, mealQuality: Number(e.target.value) }))}
            style={{ width: "100%", accentColor: "#1a1a1a" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 6 }}>PROTEIN</p>
            {["low","medium","high"].map(v => (
              <button key={v} onClick={() => setDietData(d => ({ ...d, protein: v }))}
                style={{ display: "block", width: "100%", padding: "6px", border: `1px solid ${dietData.protein === v ? "#1a1a1a" : "#eee"}`, borderRadius: 4, background: dietData.protein === v ? "#1a1a1a" : "#fff", color: dietData.protein === v ? "#fff" : "#555", cursor: "pointer", fontSize: 11, marginBottom: 4, textTransform: "capitalize" }}>
                {v}
              </button>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 6 }}>PROCESSED FOOD</p>
            {["none","some","a lot"].map(v => (
              <button key={v} onClick={() => setDietData(d => ({ ...d, processed: v }))}
                style={{ display: "block", width: "100%", padding: "6px", border: `1px solid ${dietData.processed === v ? "#1a1a1a" : "#eee"}`, borderRadius: 4, background: dietData.processed === v ? "#1a1a1a" : "#fff", color: dietData.processed === v ? "#fff" : "#555", cursor: "pointer", fontSize: 11, marginBottom: 4, textTransform: "capitalize" }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 6 }}>HYDRATION — {dietData.hydration}L</p>
          <input type="range" min={0} max={5} step={0.1} value={dietData.hydration} onChange={e => setDietData(d => ({ ...d, hydration: Number(e.target.value) }))}
            style={{ width: "100%", accentColor: "#1a1a1a" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb" }}><span>0L</span><span>Target: 2.5L</span><span>5L</span></div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "#555" }}>Fruit & veg portions hit?</span>
          <button onClick={() => setDietData(d => ({ ...d, fruitsVeg: !d.fruitsVeg }))}
            style={{ padding: "5px 14px", border: `2px solid ${dietData.fruitsVeg ? "#1a1a1a" : "#eee"}`, borderRadius: 20, background: dietData.fruitsVeg ? "#1a1a1a" : "#fff", color: dietData.fruitsVeg ? "#fff" : "#aaa", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
            {dietData.fruitsVeg ? "✓ YES" : "NO"}
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #efefef" }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 12 }}>🍽️ MEAL IDEAS — {dietData.dietMode.toUpperCase()}</p>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {["all","< 15 min","15–30 min","30+ min"].map(t => (
            <button key={t} onClick={() => setMealFilter(f => ({ ...f, time: t }))}
              style={{ padding: "5px 12px", border: `1px solid ${mealFilter.time === t ? "#1a1a1a" : "#eee"}`, borderRadius: 20, background: mealFilter.time === t ? "#1a1a1a" : "#fff", color: mealFilter.time === t ? "#fff" : "#555", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>
              {t}
            </button>
          ))}
        </div>
        {MEALS[dietData.dietMode].map((meal, i) => (
          <div key={i} style={{ border: "1px solid #f0f0f0", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", flex: 1 }}>{meal.name}</p>
              <span style={{ fontSize: 10, color: "#aaa", whiteSpace: "nowrap", marginLeft: 8 }}>⏱ {meal.time}</span>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {[["P", meal.protein, "#4a8c5c"], ["F", meal.fat, "#c49a3c"], ["C", meal.carbs, "#5a7abf"]].map(([l, v, c]) => (
                <span key={l} style={{ fontSize: 9, fontWeight: 700, color: c, background: c + "18", padding: "2px 7px", borderRadius: 10, letterSpacing: 1 }}>{l}: {v}</span>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "#888" }}>{meal.ingredients.join(" · ")}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const getExerciseList = (type) => {
    const base = type === "push" ? PUSH_EXERCISES : type === "pull" ? PULL_EXERCISES : LEGS_EXERCISES;
    return [...base, ...(customExercises[type] || [])];
  };

  const renderFitness = () => (
    <div>
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #efefef" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600 }}>HEAVY DUTY TRAINING</p>
          <ScoreRing score={fitnessScore} size={52} />
        </div>
        <p style={{ fontSize: 11, color: "#888", marginBottom: 14 }}>Mike Mentzer method · Low volume · High intensity · Failure set</p>

        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 8 }}>SESSION TYPE</p>
          <div style={{ display: "flex", gap: 6 }}>
            {[["push","💪 Push"], ["pull","🔙 Pull"], ["legs","🦵 Legs"], ["rest","😴 Rest"]].map(([v, l]) => (
              <button key={v} onClick={() => setFitnessData(f => ({ ...f, sessionType: v }))}
                style={{ flex: 1, padding: "8px 4px", border: `2px solid ${fitnessData.sessionType === v ? "#1a1a1a" : "#eee"}`, borderRadius: 6, background: fitnessData.sessionType === v ? "#1a1a1a" : "#fff", color: fitnessData.sessionType === v ? "#fff" : "#555", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {fitnessData.sessionType !== "rest" && (
          <>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 8 }}>EXERCISES — {fitnessData.sessionType.toUpperCase()}</p>
              <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid #f0f0f0", borderRadius: 8 }}>
                {getExerciseList(fitnessData.sessionType).map((ex, i) => (
                  <div key={i} onClick={() => setActiveExercise(ex)}
                    style={{ padding: "9px 14px", borderBottom: "1px solid #f8f8f8", cursor: "pointer", background: activeExercise === ex ? "#f0f0f0" : "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#333" }}>{ex}</span>
                    {customExercises[fitnessData.sessionType]?.includes(ex) && <span style={{ fontSize: 9, color: "#aaa" }}>👤</span>}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input value={newExercise} onChange={e => setNewExercise(e.target.value)} placeholder="+ Add custom exercise"
                  style={{ flex: 1, border: "1px solid #eee", borderRadius: 6, padding: "7px 10px", fontSize: 12 }} />
                <button onClick={() => { if (newExercise.trim()) { setCustomExercises(c => ({ ...c, [fitnessData.sessionType]: [...(c[fitnessData.sessionType] || []), newExercise.trim()] })); setNewExercise(""); }}}
                  style={{ padding: "7px 14px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>ADD</button>
              </div>
            </div>

            {activeExercise && (
              <div style={{ background: "#f8f8f6", borderRadius: 10, padding: "14px", marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", marginBottom: 10 }}>{activeExercise} — Log Sets</p>
                {sets.map((set, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#aaa", width: 40 }}>SET {i + 1}</span>
                    <input placeholder="kg" value={set.weight} onChange={e => setSets(s => s.map((ss, ii) => ii === i ? { ...ss, weight: e.target.value } : ss))}
                      style={{ width: 52, border: "1px solid #eee", borderRadius: 4, padding: "5px 8px", fontSize: 12 }} />
                    <span style={{ fontSize: 11, color: "#bbb" }}>×</span>
                    <input placeholder="reps" value={set.reps} onChange={e => setSets(s => s.map((ss, ii) => ii === i ? { ...ss, reps: e.target.value } : ss))}
                      style={{ width: 52, border: "1px solid #eee", borderRadius: 4, padding: "5px 8px", fontSize: 12 }} />
                    {i === 2 && (
                      <button onClick={() => setSets(s => s.map((ss, ii) => ii === i ? { ...ss, failure: !ss.failure } : ss))}
                        style={{ fontSize: 10, padding: "4px 8px", border: `1px solid ${set.failure ? "#e07b54" : "#eee"}`, borderRadius: 4, background: set.failure ? "#e07b54" : "#fff", color: set.failure ? "#fff" : "#aaa", cursor: "pointer", whiteSpace: "nowrap" }}>
                        {set.failure ? "✓ FAILURE" : "FAILURE?"}
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => { setWorkoutLog(l => [...l, { exercise: activeExercise, sets: [...sets] }]); setActiveExercise(null); setSets([{ weight: "", reps: "", failure: false }, { weight: "", reps: "", failure: false }, { weight: "", reps: "", failure: false }]); }}
                  style={{ width: "100%", padding: "9px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: 1, marginTop: 4 }}>
                  LOG EXERCISE
                </button>
              </div>
            )}
          </>
        )}

        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 6 }}>INTENSITY — {fitnessData.intensity}%</p>
          <input type="range" min={0} max={100} value={fitnessData.intensity} onChange={e => setFitnessData(f => ({ ...f, intensity: Number(e.target.value) }))}
            style={{ width: "100%", accentColor: "#1a1a1a" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "#555" }}>Hit training goal?</span>
          <button onClick={() => setFitnessData(f => ({ ...f, hitGoal: !f.hitGoal }))}
            style={{ padding: "5px 14px", border: `2px solid ${fitnessData.hitGoal ? "#1a1a1a" : "#eee"}`, borderRadius: 20, background: fitnessData.hitGoal ? "#1a1a1a" : "#fff", color: fitnessData.hitGoal ? "#fff" : "#aaa", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
            {fitnessData.hitGoal ? "✓ YES" : "NO"}
          </button>
        </div>
      </div>

      {workoutLog.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #efefef" }}>
          <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 12 }}>TODAY'S WORKOUT LOG</p>
          {workoutLog.map((entry, i) => (
            <div key={i} style={{ marginBottom: 12, padding: "10px 12px", background: "#f8f8f6", borderRadius: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>{entry.exercise}</p>
              {entry.sets.map((set, j) => set.weight && (
                <p key={j} style={{ fontSize: 11, color: "#666" }}>Set {j + 1}: {set.weight}kg × {set.reps} reps {j === 2 && set.failure ? "🔥 FAILURE" : ""}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFocus = () => (
    <div>
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #efefef" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600 }}>POMODORO TIMER</p>
          <div style={{ display: "flex", gap: 6 }}>
            {[[25,"25/5"],[50,"50/10"]].map(([m, l]) => (
              <button key={m} onClick={() => { setPomodoroMode(m); setPomodoroTime(m * 60); setPomodoroActive(false); }}
                style={{ padding: "4px 10px", border: `1px solid ${pomodoroMode === m ? "#1a1a1a" : "#eee"}`, borderRadius: 4, background: pomodoroMode === m ? "#1a1a1a" : "#fff", color: pomodoroMode === m ? "#fff" : "#555", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <input value={pomodoroTask} onChange={e => setPomodoroTask(e.target.value)} placeholder="What are you working on?"
          style={{ width: "100%", border: "none", borderBottom: "1px solid #eee", padding: "6px 0", fontSize: 13, marginBottom: 16, outline: "none" }} />
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: "#1a1a1a", letterSpacing: 4, lineHeight: 1 }}>
            {pad(Math.floor(pomodoroTime / 60))}:{pad(pomodoroTime % 60)}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setPomodoroActive(a => !a)}
            style={{ flex: 1, padding: "12px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>
            {pomodoroActive ? "⏸ PAUSE" : "▶ START"}
          </button>
          <button onClick={() => { setPomodoroActive(false); setPomodoroTime(pomodoroMode * 60); }}
            style={{ padding: "12px 16px", background: "#f0f0f0", color: "#555", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>↺</button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #efefef" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600 }}>FOCUS LOG</p>
          <ScoreRing score={Math.min(100, focusScore)} size={52} />
        </div>

        {[["Overall Focus Rating", "rating", 0, 100], ["Distraction Rating", "distraction", 0, 100]].map(([label, key, min, max]) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 6 }}>{label.toUpperCase()} — {focusData[key]}%</p>
            <input type="range" min={min} max={max} value={focusData[key]} onChange={e => setFocusData(f => ({ ...f, [key]: Number(e.target.value) }))}
              style={{ width: "100%", accentColor: "#1a1a1a" }} />
          </div>
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 6 }}>DEEP WORK SESSIONS</p>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setFocusData(f => ({ ...f, deepWork: n }))}
                  style={{ width: 32, height: 32, border: `2px solid ${focusData.deepWork >= n ? "#1a1a1a" : "#eee"}`, borderRadius: 6, background: focusData.deepWork >= n ? "#1a1a1a" : "#fff", color: focusData.deepWork >= n ? "#fff" : "#aaa", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 6 }}>ENERGY LEVEL</p>
            {["low","medium","high"].map(v => (
              <button key={v} onClick={() => setFocusData(f => ({ ...f, energy: v }))}
                style={{ marginRight: 4, marginBottom: 4, padding: "4px 10px", border: `1px solid ${focusData.energy === v ? "#1a1a1a" : "#eee"}`, borderRadius: 4, background: focusData.energy === v ? "#1a1a1a" : "#fff", color: focusData.energy === v ? "#fff" : "#555", cursor: "pointer", fontSize: 10, textTransform: "capitalize" }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #efefef" }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 14 }}>📱 SCREEN TIME</p>
        {[["Total Screen Time", "screenTime", 0, 12, "hrs"], ["Social Media", "socialMedia", 0, 300, "mins"], ["YouTube (Productive)", "youtube", 0, 300, "mins"]].map(([label, key, min, max, unit]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: key === "youtube" ? "#4a8c5c" : "#555" }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: key === "youtube" ? "#4a8c5c" : "#1a1a1a" }}>{focusData[key]} {unit}</span>
            </div>
            <input type="range" min={min} max={max} step={key === "screenTime" ? 0.5 : 5} value={focusData[key]}
              onChange={e => setFocusData(f => ({ ...f, [key]: Number(e.target.value) }))}
              style={{ width: "100%", accentColor: key === "youtube" ? "#4a8c5c" : "#1a1a1a" }} />
          </div>
        ))}
        {focusData.socialMedia > 60 && <p style={{ fontSize: 11, color: "#e07b54", marginTop: 4 }}>⚠ High social media usage detected — this is negatively impacting your focus score</p>}
        {focusData.youtube > 30 && <p style={{ fontSize: 11, color: "#4a8c5c", marginTop: 4 }}>✓ YouTube logged as productive learning time</p>}
      </div>
    </div>
  );

  const renderFinance = () => {
    // Portfolio calculations
    const getRate = (inv) => {
      const type = INVESTMENTS[inv.type];
      if (type.moderate === null) return inv.customRate;
      return inv.scenario === "moderate" ? type.moderate : type.high;
    };
    const getMonthly = (inv) => {
      if (inv.frequency === "weekly") return inv.monthly * 52 / 12;
      if (inv.frequency === "biweekly") return inv.monthly * 26 / 12;
      return inv.monthly;
    };
    const portTotals = portfolio.map(inv => {
      const rate = getRate(inv);
      const monthlyAmt = getMonthly(inv);
      const projected = calcInvestment(inv.lump, monthlyAmt, portfolioYears, rate);
      const invested = inv.lump + (monthlyAmt * portfolioYears * 12);
      return { projected, invested, returnAmt: projected - invested, rate, monthlyAmt };
    });
    const grandTotal = portTotals.reduce((a, b) => a + b.projected, 0);
    const grandInvested = portTotals.reduce((a, b) => a + b.invested, 0);
    const grandReturn = grandTotal - grandInvested;
    const totalMonthly = portTotals.reduce((a, b) => a + b.monthlyAmt, 0);
    const selectedInvType = INVESTMENTS[newInv.type];

    return (
      <div>
        {/* DAILY SPENDING */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #efefef" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600 }}>DAILY SPENDING</p>
            <ScoreRing score={financeScore} size={52} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[["Total", `£${totalSpend.toFixed(0)}`, "#1a1a1a"], ["Productive", `£${prodSpend.toFixed(0)}`, "#4a8c5c"], ["Unproductive", `£${unprodSpend.toFixed(0)}`, "#e07b54"]].map(([l, v, c]) => (
              <div key={l} style={{ background: "#f8f8f6", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
                <p style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", color: c }}>{v}</p>
                <p style={{ fontSize: 9, color: "#aaa", letterSpacing: 1 }}>{l.toUpperCase()}</p>
              </div>
            ))}
          </div>
          {spends.length === 0 && <p style={{ fontSize: 12, color: "#bbb", textAlign: "center", padding: "12px 0" }}>No spends logged today yet.</p>}
          {spends.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #f5f5f5" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: s.tag === "productive" ? "#4a8c5c" : s.tag === "unproductive" ? "#e07b54" : "#aaa", width: 20 }}>
                {s.tag === "productive" ? "✓" : s.tag === "unproductive" ? "✗" : "–"}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: "#333" }}>{s.category}</p>
                <p style={{ fontSize: 10, color: "#bbb" }}>{s.note}</p>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>£{s.amount}</p>
              <button onClick={() => setSpends(sp => sp.filter(x => x.id !== s.id))}
                style={{ fontSize: 12, color: "#ddd", background: "none", border: "none", cursor: "pointer" }}>✕</button>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: "14px", background: "#f8f8f6", borderRadius: 10 }}>
            <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 10 }}>ADD SPEND</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input type="number" placeholder="£ Amount" value={newSpend.amount} onChange={e => setNewSpend(s => ({ ...s, amount: e.target.value }))}
                style={{ flex: 1, border: "1px solid #eee", borderRadius: 6, padding: "7px 10px", fontSize: 13 }} />
              <select value={newSpend.tag} onChange={e => setNewSpend(s => ({ ...s, tag: e.target.value }))}
                style={{ flex: 1, border: "1px solid #eee", borderRadius: 6, padding: "7px 10px", fontSize: 12 }}>
                <option value="productive">✓ Productive</option>
                <option value="neutral">– Neutral</option>
                <option value="unproductive">✗ Unproductive</option>
              </select>
            </div>
            <select value={newSpend.category} onChange={e => setNewSpend(s => ({ ...s, category: e.target.value }))}
              style={{ width: "100%", border: "1px solid #eee", borderRadius: 6, padding: "7px 10px", fontSize: 12, marginBottom: 8 }}>
              {SPEND_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Note (optional)" value={newSpend.note} onChange={e => setNewSpend(s => ({ ...s, note: e.target.value }))}
              style={{ width: "100%", border: "1px solid #eee", borderRadius: 6, padding: "7px 10px", fontSize: 12, marginBottom: 8 }} />
            <button onClick={() => { if (newSpend.amount) { setSpends(s => [...s, { ...newSpend, id: Date.now(), amount: Number(newSpend.amount) }]); setNewSpend({ amount: "", category: "Groceries", tag: "neutral", note: "" }); }}}
              style={{ width: "100%", padding: "10px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>
              + ADD
            </button>
          </div>
        </div>

        {/* PORTFOLIO TRACKER */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #efefef" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600 }}>📈 INVESTMENT PORTFOLIO</p>
            <button onClick={() => setShowAddInv(v => !v)}
              style={{ padding: "6px 14px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
              {showAddInv ? "✕ CANCEL" : "+ ADD"}
            </button>
          </div>

          {/* Time period slider — shared across all investments */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 6 }}>PROJECTION PERIOD — {portfolioYears} YEARS</p>
            <input type="range" min={1} max={40} value={portfolioYears} onChange={e => setPortfolioYears(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#1a1a1a" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb" }}><span>1yr</span><span>20yr</span><span>40yr</span></div>
          </div>

          {/* Portfolio summary totals */}
          {portfolio.length > 0 && (
            <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "16px", marginBottom: 16 }}>
              <p style={{ fontSize: 9, letterSpacing: 3, color: "#666", fontWeight: 600, marginBottom: 12 }}>TOTAL PORTFOLIO — {portfolioYears} YRS</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center", marginBottom: 10 }}>
                {[["Invested", `£${Math.round(grandInvested).toLocaleString()}`, "#888"],
                  ["Return", `£${Math.round(grandReturn).toLocaleString()}`, "#4a8c5c"],
                  ["Total", `£${Math.round(grandTotal).toLocaleString()}`, "#fff"]].map(([l, v, c]) => (
                  <div key={l}>
                    <p style={{ fontSize: 20, fontFamily: "'Bebas Neue', sans-serif", color: c, lineHeight: 1 }}>{v}</p>
                    <p style={{ fontSize: 9, color: "#555", letterSpacing: 1, marginTop: 2 }}>{l.toUpperCase()}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "center" }}>
                <div style={{ background: "#111", borderRadius: 6, padding: "8px" }}>
                  <p style={{ fontSize: 14, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>£{Math.round(totalMonthly).toLocaleString()}</p>
                  <p style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>MONTHLY TOTAL</p>
                </div>
                <div style={{ background: "#111", borderRadius: 6, padding: "8px" }}>
                  <p style={{ fontSize: 14, fontFamily: "'Bebas Neue', sans-serif", color: grandReturn > 0 ? "#4a8c5c" : "#fff" }}>
                    {grandInvested > 0 ? Math.round((grandReturn / grandInvested) * 100) : 0}%
                  </p>
                  <p style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>TOTAL RETURN</p>
                </div>
              </div>
            </div>
          )}

          {/* Individual investment cards */}
          {portfolio.length === 0 && !showAddInv && (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#bbb" }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>📈</p>
              <p style={{ fontSize: 13 }}>No investments added yet.</p>
              <p style={{ fontSize: 11, marginTop: 4 }}>Tap + ADD to build your portfolio.</p>
            </div>
          )}

          {portfolio.map((inv, i) => {
            const t = portTotals[i];
            const typeName = INVESTMENTS[inv.type].name;
            const colors = ["#1a1a1a","#4a8c5c","#c49a3c","#5a7abf","#8c4a6e","#4a7a8c"];
            const col = colors[i % colors.length];
            return (
              <div key={inv.id} style={{ border: `1px solid #efefef`, borderRadius: 10, padding: "14px", marginBottom: 10, borderLeft: `3px solid ${col}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{inv.name}</p>
                    <p style={{ fontSize: 10, color: "#aaa" }}>{typeName} · {getRate(inv)}% p/a · £{Math.round(getMonthly(inv))}/mo</p>
                  </div>
                  <button onClick={() => setPortfolio(p => p.filter(x => x.id !== inv.id))}
                    style={{ fontSize: 12, color: "#ddd", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>✕</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, textAlign: "center" }}>
                  {[["Invested", `£${Math.round(t.invested).toLocaleString()}`, "#888"],
                    ["Return", `£${Math.round(t.returnAmt).toLocaleString()}`, "#4a8c5c"],
                    ["Total", `£${Math.round(t.projected).toLocaleString()}`, col]].map(([l, v, c]) => (
                    <div key={l} style={{ background: "#f8f8f6", borderRadius: 6, padding: "7px 4px" }}>
                      <p style={{ fontSize: 13, fontFamily: "'Bebas Neue', sans-serif", color: c }}>{v}</p>
                      <p style={{ fontSize: 8, color: "#bbb", letterSpacing: 1 }}>{l}</p>
                    </div>
                  ))}
                </div>
                {/* Mini progress bar showing return ratio */}
                <div style={{ marginTop: 8, height: 3, background: "#eee", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (t.returnAmt / t.invested) * 100)}%`, height: "100%", background: col, borderRadius: 2, transition: "width 0.8s ease" }} />
                </div>
              </div>
            );
          })}

          {/* ADD INVESTMENT FORM */}
          {showAddInv && (
            <div style={{ background: "#f8f8f6", borderRadius: 10, padding: "16px", marginTop: 12, border: "1px solid #eee" }}>
              <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>NEW INVESTMENT</p>

              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 5 }}>NAME</p>
                <input value={newInv.name} onChange={e => setNewInv(n => ({ ...n, name: e.target.value }))}
                  placeholder="e.g. Trading 212 Pie, Bitcoin..."
                  style={{ width: "100%", border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", fontSize: 13, background: "#fff" }} />
              </div>

              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 5 }}>TYPE</p>
                <select value={newInv.type} onChange={e => setNewInv(n => ({ ...n, type: Number(e.target.value) }))}
                  style={{ width: "100%", border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", fontSize: 13, background: "#fff" }}>
                  {INVESTMENTS.map((inv, i) => <option key={i} value={i}>{inv.name}</option>)}
                </select>
              </div>

              {selectedInvType.moderate === null && (
                <div style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 5 }}>EXPECTED ANNUAL RETURN %</p>
                  <input type="number" value={newInv.customRate} onChange={e => setNewInv(n => ({ ...n, customRate: Number(e.target.value) }))}
                    style={{ width: "100%", border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", fontSize: 13, background: "#fff" }} />
                </div>
              )}

              {selectedInvType.moderate !== null && (
                <div style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 5 }}>RETURN SCENARIO</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["moderate","high"].map(s => (
                      <button key={s} onClick={() => setNewInv(n => ({ ...n, scenario: s }))}
                        style={{ flex: 1, padding: "7px", border: `2px solid ${newInv.scenario === s ? "#1a1a1a" : "#eee"}`, borderRadius: 6, background: newInv.scenario === s ? "#1a1a1a" : "#fff", color: newInv.scenario === s ? "#fff" : "#555", cursor: "pointer", fontSize: 10, fontWeight: 700, textTransform: "capitalize" }}>
                        {s} ({s === "moderate" ? selectedInvType.moderate : selectedInvType.high}%)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 5 }}>LUMP SUM £</p>
                  <input type="number" value={newInv.lump} onChange={e => setNewInv(n => ({ ...n, lump: Number(e.target.value) }))}
                    style={{ width: "100%", border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", fontSize: 13, background: "#fff" }} />
                </div>
                <div>
                  <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 5 }}>CONTRIBUTION £</p>
                  <input type="number" value={newInv.monthly} onChange={e => setNewInv(n => ({ ...n, monthly: Number(e.target.value) }))}
                    style={{ width: "100%", border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", fontSize: 13, background: "#fff" }} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 10, color: "#aaa", letterSpacing: 2, marginBottom: 5 }}>FREQUENCY</p>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["weekly","Weekly"],["biweekly","Bi-weekly"],["monthly","Monthly"]].map(([v, l]) => (
                    <button key={v} onClick={() => setNewInv(n => ({ ...n, frequency: v }))}
                      style={{ flex: 1, padding: "7px 4px", border: `2px solid ${newInv.frequency === v ? "#1a1a1a" : "#eee"}`, borderRadius: 6, background: newInv.frequency === v ? "#1a1a1a" : "#fff", color: newInv.frequency === v ? "#fff" : "#555", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => {
                if (newInv.name.trim()) {
                  setPortfolio(p => [...p, { ...newInv, id: Date.now() }]);
                  setNewInv({ name: "", type: 0, lump: 0, monthly: 200, frequency: "monthly", scenario: "moderate", customRate: 8 });
                  setShowAddInv(false);
                }
              }} style={{ width: "100%", padding: "11px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>
                ADD TO PORTFOLIO
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGoals = () => (
    <div>
      {["daily","weekly","monthly","yearly"].map(tf => (
        <div key={tf} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #efefef" }}>
          <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 12 }}>
            {tf === "daily" ? "📅" : tf === "weekly" ? "📆" : tf === "monthly" ? "🗓️" : "📊"} {tf.toUpperCase()} GOALS
          </p>
          {goals.filter(g => g.timeframe === tf).map(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            return (
              <div key={g.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <p style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 600 }}>{g.name}</p>
                  <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 100 ? "#4a8c5c" : "#1a1a1a" }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: "#efefef", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: pct >= 100 ? "#4a8c5c" : "#1a1a1a", borderRadius: 3, transition: "width 0.8s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#aaa" }}>{g.current} / {g.target} {g.unit} · {g.category}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setGoals(gs => gs.map(x => x.id === g.id ? { ...x, current: Math.min(x.target, x.current + 1) } : x))}
                      style={{ fontSize: 11, padding: "3px 8px", background: "#f0f0f0", border: "none", borderRadius: 4, cursor: "pointer", color: "#555" }}>+</button>
                    <button onClick={() => setGoals(gs => gs.map(x => x.id === g.id ? { ...x, current: Math.max(0, x.current - 1) } : x))}
                      style={{ fontSize: 11, padding: "3px 8px", background: "#f0f0f0", border: "none", borderRadius: 4, cursor: "pointer", color: "#555" }}>−</button>
                    <button onClick={() => setGoals(gs => gs.filter(x => x.id !== g.id))}
                      style={{ fontSize: 11, padding: "3px 8px", background: "#f0f0f0", border: "none", borderRadius: 4, cursor: "pointer", color: "#e07b54" }}>✕</button>
                  </div>
                </div>
              </div>
            );
          })}
          {goals.filter(g => g.timeframe === tf).length === 0 && <p style={{ fontSize: 12, color: "#ccc" }}>No {tf} goals yet.</p>}
        </div>
      ))}

      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #efefef" }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 12 }}>+ ADD NEW GOAL</p>
        <input value={newGoal.name} onChange={e => setNewGoal(g => ({ ...g, name: e.target.value }))} placeholder="Goal name"
          style={{ width: "100%", border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", fontSize: 13, marginBottom: 8 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <select value={newGoal.timeframe} onChange={e => setNewGoal(g => ({ ...g, timeframe: e.target.value }))}
            style={{ border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", fontSize: 12 }}>
            {["daily","weekly","monthly","yearly"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select value={newGoal.category} onChange={e => setNewGoal(g => ({ ...g, category: e.target.value }))}
            style={{ border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", fontSize: 12 }}>
            {["morning","sleep","diet","fitness","focus","finance","investments","custom"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <input type="number" placeholder="Target" value={newGoal.target} onChange={e => setNewGoal(g => ({ ...g, target: e.target.value }))}
            style={{ border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", fontSize: 13 }} />
          <input placeholder="Unit (e.g. times, £)" value={newGoal.unit} onChange={e => setNewGoal(g => ({ ...g, unit: e.target.value }))}
            style={{ border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", fontSize: 13 }} />
        </div>
        <button onClick={() => { if (newGoal.name && newGoal.target) { setGoals(gs => [...gs, { ...newGoal, id: Date.now(), current: 0, target: Number(newGoal.target) }]); setNewGoal({ name: "", timeframe: "daily", category: "morning", target: "", unit: "" }); }}}
          style={{ width: "100%", padding: "10px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>
          ADD GOAL
        </button>
      </div>
    </div>
  );

  const radarData = [
    { subject: "Morning", A: morningScore },
    { subject: "Sleep", A: sleepScore },
    { subject: "Diet", A: dietScore },
    { subject: "Fitness", A: fitnessScore },
    { subject: "Focus", A: focusScore },
    { subject: "Finance", A: financeScore },
    { subject: "Goals", A: goalScore },
  ];

  const spendPieData = SPEND_CATEGORIES.slice(0, 6).map(c => ({
    name: c, value: spends.filter(s => s.category === c).reduce((a, b) => a + Number(b.amount), 0)
  })).filter(d => d.value > 0);

  const renderCharts = () => (
    <div>
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #efefef" }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 4 }}>PERFORMANCE RADAR</p>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#f0f0f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#888" }} />
            <Radar name="Score" dataKey="A" stroke="#1a1a1a" fill="#1a1a1a" fillOpacity={0.12} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #efefef" }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 4 }}>WEEKLY SCORE TREND</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={MOCK_WEEKLY}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#aaa" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#aaa" }} />
            <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #eee", borderRadius: 8 }} />
            <Line type="monotone" dataKey="score" stroke="#1a1a1a" strokeWidth={2.5} dot={{ r: 3, fill: "#1a1a1a" }} name="Overall" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #efefef" }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 4 }}>CATEGORY BREAKDOWN — THIS WEEK</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={MOCK_WEEKLY} barSize={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#aaa" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#aaa" }} />
            <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #eee", borderRadius: 8 }} />
            <Bar dataKey="sleep" fill="#a8c5b5" name="Sleep" />
            <Bar dataKey="diet" fill="#c5b8a8" name="Diet" />
            <Bar dataKey="fitness" fill="#a8b5c5" name="Fitness" />
            <Bar dataKey="focus" fill="#c5a8b5" name="Focus" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {spendPieData.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #efefef" }}>
          <p style={{ fontSize: 10, letterSpacing: 3, color: "#aaa", fontWeight: 600, marginBottom: 4 }}>SPENDING BREAKDOWN</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={spendPieData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                {spendPieData.map((_, i) => <Cell key={i} fill={["#1a1a1a","#555","#888","#aaa","#ccc","#e0e0e0"][i % 6]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "morning": return renderMorning();
      case "sleep": return renderSleep();
      case "diet": return renderDiet();
      case "fitness": return renderFitness();
      case "focus": return renderFocus();
      case "finance": return renderFinance();
      case "goals": return renderGoals();
      case "charts": return renderCharts();
      default: return renderDashboard();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f2f2f0; }
        input[type=range] { cursor: pointer; }
        select { cursor: pointer; background: white; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f5f5f5; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {showQuote && renderQuoteScreen()}

      <div style={{ maxWidth: 420, margin: "0 auto", fontFamily: "'DM Sans', sans-serif", background: "#f2f2f0", minHeight: "100vh", paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #efefef", padding: "16px 20px 12px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 5, color: "#1a1a1a" }}>OPTIMISE</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 20, fontFamily: "'Bebas Neue', sans-serif", color: "#1a1a1a" }}>{overallScore}%</p>
                <p style={{ fontSize: 9, color: "#aaa", letterSpacing: 2 }}>TODAY</p>
              </div>
              <button onClick={() => setShowQuote(true)}
                style={{ fontSize: 18, background: "none", border: "none", cursor: "pointer" }}>💭</button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "16px 16px 0" }}>
          {renderContent()}
        </div>

        {/* Bottom Nav */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: "#fff", borderTop: "1px solid #efefef", display: "flex", overflowX: "auto", zIndex: 50 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: "0 0 auto", padding: "10px 8px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", minWidth: 52, borderTop: `2px solid ${activeTab === tab.id ? "#1a1a1a" : "transparent"}` }}>
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span style={{ fontSize: 8, color: activeTab === tab.id ? "#1a1a1a" : "#aaa", fontWeight: activeTab === tab.id ? 700 : 400, letterSpacing: 0.5 }}>{tab.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
