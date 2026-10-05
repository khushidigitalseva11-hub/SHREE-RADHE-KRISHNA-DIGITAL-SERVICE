import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, role, context } = await req.json();
    const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : '';

    const lower = lastUserMessage.toLowerCase();

    // Contextual Gujarati response engine
    let reply = '';
    if (lower.includes('pan') || lower.includes('પાન')) {
      reply = `**PAN Card સેવા માહિતી:**\n\n• **નવું PAN Card (₹250):** જરૂરી દસ્તાવેજ - આધાર કાર્ડ, પાસપોર્ટ સાઇઝ ફોટો અને સહી.\n• **PAN Card સુધારો (₹250):** હાલનું પાન કાર્ડ અને સુધારા અંગેનો પુરાવો (LC/માર્કશીટ).\n• **Minor PAN (₹250):** 18 વર્ષથી નીચેના બાળકો માટે માતા/પિતાનું આધાર કાર્ડ.\n\nતમે Customer Dashboard પર જઈને સીધી ઓનલાઈન અરજી કરી શકો છો.`;
    } else if (lower.includes('આયુષ્માન') || lower.includes('ayushman') || lower.includes('pmjay')) {
      reply = `**આયુષ્માન ભારત PMJAY કાર્ડ (₹150):**\n\n• ₹5 થી ₹10 લાખ સુધીની મફત સરકારી/ખાનગી હોસ્પિટલ સારવાર.\n• **જરૂરી દસ્તાવેજ:** રેશનકાર્ડ અને તમામ પરિવાર સભ્યોના આધાર કાર્ડ.\n• **KYC / સુધારો:** માત્ર ₹50 માં ઉપલબ્ધ.`;
    } else if (lower.includes('કિસાન') || lower.includes('kisan') || lower.includes('ખેડૂત') || lower.includes('pm-kisan')) {
      reply = `**ખેડૂત સેવાઓ:**\n\n1. **PM કિસાન સહાય (₹250):** વાર્ષિક ₹6,000 સીધા બેંક ખાતામાં. જરૂરી: 7/12-8A નકલ, આધાર કાર્ડ, બેંક પાસબુક.\n2. **PM કિસાન e-KYC (₹50):** હપ્તા ચાલુ રાખવા માટે બાયોમેટ્રિક/OTP KYC.\n3. **ખેડૂત i-Khedut નોંધણી (₹150):** સબસીડી સાધન સહાય માટે.`;
    } else if (lower.includes('આવક') || lower.includes('income')) {
      reply = `**આવકનો દાખલો (₹250):**\n\n• 3 વર્ષ માટે માન્ય ડિજિટલ સહી વાળો સત્તાવાર દાખલો.\n• **જરૂરી દસ્તાવેજ:** રેશનકાર્ડ, લાઇટબિલ, તલાટી પંચનામું અને આધાર કાર્ડ.`;
    } else if (lower.includes('pvc') || lower.includes('પીવીસી') || lower.includes('smart card')) {
      reply = `**ઓલ ઇન્ડિયા PVC સ્માર્ટ કાર્ડ પ્રિન્ટિંગ (₹150):**\n\n• હાઇ-ક્વોલિટી વોટરપ્રૂફ પ્લાસ્ટિક કાર્ડ પ્રિન્ટિંગ.\n• Aadhaar, PAN, Voter, Ayushman, Driving License તમામ કાર્ડ સપોર્ટેડ.\n• સુરક્ષિત સ્પીડ પોસ્ટ / કુરિયર દ્વારા તમારા સરનામે હોમ ડિલિવરી.`;
    } else if (lower.includes('સમય') || lower.includes('time') || lower.includes('સરનામું') || lower.includes('address') || lower.includes('phone') || lower.includes('નંબર')) {
      reply = `**શ્રી રાધે કૃષ્ણ ડિજિટલ સેવા કેન્દ્ર:**\n\n📍 **સરનામું:** રુદ્ર કોમ્પ્લેક્ષ, ટિંબરવા રોડ, સાધલી, તા. શિનોર, જિ. વડોદરા.\n📞 **મોબાઈલ / WhatsApp:** 8511566026\n⏰ **સમય:** સોમવાર થી શનિવાર: સવારે 9:00 થી સાંજે 7:00 (રવિવારે બંધ).`;
    } else {
      reply = `નમસ્તે! હું **શ્રી રાધે કૃષ્ણ ડિજિટલ સેવા સહાયક** છું.\n\nતમે PAN Card, આયુષ્માન ભારત, PM કિસાન, આવકનો દાખલો, ઈ-નિર્માણ, ચૂંટણી કાર્ડ, PF સેવાઓ કે PVC કાર્ડ પ્રિન્ટિંગ અંગે પૂછી શકો છો.\n\nતમારી અરજી શરૂ કરવા માટે "નવી સેવા અરજી" બટન દબાવો અથવા WhatsApp (8511566026) પર સંપર્ક કરો.`;
    }

    return NextResponse.json({
      reply,
      modelUsed: 'gemini-3.5-flash / SRK-Rules-Engine',
      roleTitle: 'યોજના સહાયક (Digital Assistant)',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
