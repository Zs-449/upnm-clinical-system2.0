export const dynamic = "force-dynamic";

interface Rule {
  keywords: string[];
  conditions: string[];
  department: string;
  urgency: "Can wait" | "See doctor soon" | "Emergency";
  advice: string;
}

const RULES: Rule[] = [
  {
    keywords: ["chest pain", "cant breathe", "can't breathe", "shortness of breath", "collapse", "unconscious", "severe bleeding", "seizure"],
    conditions: ["Cardiac event", "Respiratory emergency"],
    department: "Emergency",
    urgency: "Emergency",
    advice: "This may be a medical emergency. Please proceed to the Emergency unit immediately or call 999.",
  },
  {
    keywords: ["tooth", "teeth", "gum", "dental", "molar", "cavity", "jaw"],
    conditions: ["Dental caries", "Gingivitis", "Toothache"],
    department: "Dental",
    urgency: "See doctor soon",
    advice: "Rinse with warm salt water and avoid very hot/cold food. Book a dental slot soon.",
  },
  {
    keywords: ["anxious", "anxiety", "depress", "stress", "panic", "sad", "sleep", "insomnia", "mental"],
    conditions: ["Anxiety", "Stress-related disorder", "Sleep disturbance"],
    department: "Mental Health",
    urgency: "See doctor soon",
    advice: "Practice slow breathing and reach out to someone you trust. Our counsellors are here to help — booking a Mental Health session is a strong step.",
  },
  {
    keywords: ["fever", "cough", "cold", "flu", "sore throat", "runny nose", "sneeze", "headache", "body ache"],
    conditions: ["Upper respiratory infection", "Common cold", "Viral fever"],
    department: "General",
    urgency: "Can wait",
    advice: "Rest, stay hydrated, and monitor your temperature. Paracetamol can help. See a doctor if fever exceeds 38.5°C for 3+ days.",
  },
  {
    keywords: ["sprain", "ankle", "knee", "injury", "fracture", "twist", "muscle", "back pain", "joint"],
    conditions: ["Musculoskeletal strain", "Sprain"],
    department: "General",
    urgency: "See doctor soon",
    advice: "Apply the R.I.C.E method (Rest, Ice, Compression, Elevation). If you cannot bear weight, see a doctor soon.",
  },
  {
    keywords: ["stomach", "nausea", "vomit", "diarrhea", "diarrhoea", "abdominal", "gastric"],
    conditions: ["Gastroenteritis", "Gastritis"],
    department: "General",
    urgency: "See doctor soon",
    advice: "Stay hydrated with oral rehydration salts and eat bland food. Seek care if there's blood or severe dehydration.",
  },
];

export async function POST(req: Request) {
  const { message } = await req.json();
  const text = String(message || "").toLowerCase();

  let matched: Rule | null = null;
  for (const rule of RULES) {
    if (rule.keywords.some((k) => text.includes(k))) {
      matched = rule;
      break;
    }
  }

  if (!matched) {
    return Response.json({
      reply:
        "Thanks for sharing. I couldn't pinpoint a specific condition from that description. Could you tell me more about your main symptom, when it started, and how severe it feels?",
      analysis: {
        conditions: ["Needs more information"],
        department: "General",
        urgency: "Can wait",
        advice: "For a proper assessment, booking a General consultation is recommended.",
      },
    });
  }

  return Response.json({
    reply: `Based on what you've described, this could be related to ${matched.conditions
      .slice(0, 2)
      .join(" or ")}. I recommend the ${matched.department} department. ${matched.advice}`,
    analysis: {
      conditions: matched.conditions,
      department: matched.department,
      urgency: matched.urgency,
      advice: matched.advice,
    },
  });
}
