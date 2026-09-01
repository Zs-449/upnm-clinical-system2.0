export const dynamic = "force-dynamic";

type Urgency = "Can wait" | "See doctor soon" | "Emergency";

interface Rule {
  id: string;
  keywords: string[];
  // Short, natural phrase describing this symptom cluster, used to build
  // contextual "X together with Y" sentences across turns.
  label: string;
  conditions: string[];
  department: string;
  urgency: Urgency;
  advice: string;
  followUps: string[];
}

const URGENCY_RANK: Record<Urgency, number> = {
  "Can wait": 1,
  "See doctor soon": 2,
  Emergency: 3,
};

const RULES: Rule[] = [
  {
    id: "emergency",
    keywords: ["chest pain", "cant breathe", "can't breathe", "shortness of breath", "collapse", "unconscious", "severe bleeding", "seizure"],
    label: "these emergency warning signs",
    conditions: ["A cardiac event", "A respiratory emergency"],
    department: "Emergency",
    urgency: "Emergency",
    advice: "This may be a medical emergency. Please proceed to the Emergency unit immediately or call 999.",
    followUps: ["Is someone with you right now?"],
  },
  {
    id: "feverChills",
    keywords: ["fever", "chills", "hot and cold", "hot then cold", "shivering", "high temperature", "flu"],
    label: "alternating hot and cold sensations",
    conditions: ["Fever or elevated temperature", "Viral infection", "Flu-like illness"],
    department: "General",
    urgency: "Can wait",
    advice: "Rest, stay hydrated, and monitor your temperature. Paracetamol can help. See a doctor if fever exceeds 38.5°C for 3+ days.",
    followUps: [
      "How long have you been feeling this way?",
      "Have you measured your temperature? If so, what was it?",
      "Are you also experiencing a cough or sore throat?",
    ],
  },
  {
    id: "fatigue",
    keywords: ["tired", "fatigue", "exhausted", "no energy", "low energy", "lethargic", "drained"],
    label: "fatigue",
    conditions: ["Viral illness", "Lack of sleep", "Dehydration", "Anemia"],
    department: "General",
    urgency: "Can wait",
    advice: "Make sure you're getting enough rest and fluids. If the fatigue lasts more than a week, it's worth getting checked.",
    followUps: [
      "How many hours of sleep have you been getting lately?",
      "Has this been going on for more than a few days?",
    ],
  },
  {
    id: "respiratory",
    keywords: ["cough", "cold", "sore throat", "runny nose", "sneeze", "headache", "body ache", "blocked nose"],
    label: "your cold/flu-type symptoms",
    conditions: ["Upper respiratory infection", "Common cold", "Viral fever"],
    department: "General",
    urgency: "Can wait",
    advice: "Rest, stay hydrated, and monitor your temperature. Paracetamol can help. See a doctor if symptoms worsen or last more than a week.",
    followUps: [
      "When did this start?",
      "Is the cough dry, or are you coughing anything up?",
    ],
  },
  {
    id: "dental",
    keywords: ["tooth", "teeth", "gum", "dental", "molar", "cavity", "jaw"],
    label: "the tooth/gum discomfort",
    conditions: ["Dental caries", "Gingivitis", "Toothache"],
    department: "Dental",
    urgency: "See doctor soon",
    advice: "Rinse with warm salt water and avoid very hot or cold food. Booking a dental slot soon is a good idea.",
    followUps: ["Is the pain constant, or only when you eat or drink something hot/cold?"],
  },
  {
    id: "mental",
    keywords: ["anxious", "anxiety", "depress", "stress", "panic", "sad", "sleep", "insomnia", "overwhelmed", "burnt out", "burnout"],
    label: "how you've been feeling emotionally",
    conditions: ["Anxiety", "Stress-related difficulty", "Sleep disturbance"],
    department: "Mental Health",
    urgency: "See doctor soon",
    advice: "Practice slow breathing and reach out to someone you trust. Our counsellors are here to help — booking a Mental Health session is a strong step.",
    followUps: ["How long has this been affecting you?", "Is it affecting your sleep or studies?"],
  },
  {
    id: "injury",
    keywords: ["sprain", "ankle", "knee", "injury", "fracture", "twist", "muscle", "back pain", "joint"],
    label: "the injury",
    conditions: ["Musculoskeletal strain", "Sprain"],
    department: "General",
    urgency: "See doctor soon",
    advice: "Apply the R.I.C.E method (Rest, Ice, Compression, Elevation). If you cannot bear weight, see a doctor soon.",
    followUps: ["Can you put weight on it, or move it normally?"],
  },
  {
    id: "gi",
    keywords: ["stomach", "nausea", "vomit", "diarrhea", "diarrhoea", "abdominal", "gastric"],
    label: "the stomach discomfort",
    conditions: ["Gastroenteritis", "Gastritis"],
    department: "General",
    urgency: "See doctor soon",
    advice: "Stay hydrated with oral rehydration salts and eat bland food. Seek care if there's blood or severe dehydration.",
    followUps: ["Has this been going on for more than a day?"],
  },
];

function bulletList(items: string[]) {
  return items.map((c) => `• ${c}`).join("\n");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const message = String(body?.message || "");
  // Labels the bot has already surfaced earlier in *this* conversation,
  // sent back by the client each turn so the server stays stateless while
  // still being able to say "X together with Y".
  const previousLabels: string[] = Array.isArray(body?.previousLabels) ? body.previousLabels.filter((l: unknown) => typeof l === "string") : [];

  const text = message.toLowerCase();
  const matched = RULES.filter((r) => r.keywords.some((k) => text.includes(k)));

  if (matched.length === 0) {
    return Response.json({
      reply:
        previousLabels.length > 0
          ? "Thanks — could you tell me a bit more about that? For example, when it started or how severe it feels."
          : "Thanks for sharing. Could you tell me more about your main symptom, when it started, and how severe it feels?",
      analysis: null,
      labels: previousLabels,
      askBooking: false,
    });
  }

  // Merge conditions/department/urgency across every rule matched *this
  // turn*, prioritising the most urgent match for routing.
  matched.sort((a, b) => URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency]);
  const primary = matched[0];
  const conditions = Array.from(new Set(matched.flatMap((r) => r.conditions))).slice(0, 4);
  const newLabels = matched.map((r) => r.label).filter((l) => !previousLabels.includes(l));
  const allLabels = Array.from(new Set([...previousLabels, ...newLabels]));

  const isFollowUp = previousLabels.length > 0;
  const followUp = primary.followUps[0];

  let reply: string;
  if (!isFollowUp) {
    reply = `Thanks for sharing that. Based on what you've described, some possible explanations may include:\n\n${bulletList(
      conditions
    )}\n\nThese are possible explanations, not a diagnosis.`;
  } else {
    const newPart = newLabels[0] ?? "this";
    const priorPart = previousLabels.join(" and ");
    reply = `${newPart.charAt(0).toUpperCase()}${newPart.slice(1)} together with ${priorPart} can occur with several conditions, including ${conditions
      .slice(0, 3)
      .map((c) => c.toLowerCase())
      .join(", ")}, and others.${followUp ? ` ${followUp}` : ""}`;
  }

  return Response.json({
    reply,
    analysis: {
      conditions,
      department: primary.department,
      urgency: primary.urgency,
      advice: primary.advice,
    },
    labels: allLabels,
    askBooking: true,
  });
}
