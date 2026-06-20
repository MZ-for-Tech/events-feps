import { getTranslations } from 'next-intl/server'

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isAr = locale === 'ar'

  const faqs = isAr ? [
    { q: 'ما هو نظام فعاليات FEPS؟', a: 'هو النظام الرسمي لإدارة ونشر الفعاليات والأنشطة الأكاديمية بكلية الاقتصاد والعلوم السياسية، جامعة القاهرة.' },
    { q: 'كيف أتابع الفعاليات القادمة؟', a: 'يمكنك تصفح صفحة التقويم لمشاهدة جميع الفعاليات المنشورة، مع إمكانية التنقل بين الأشهر.' },
    { q: 'هل يمكنني إضافة فعاليات؟', a: 'إضافة الفعاليات متاحة فقط للمستخدمين المسجلين بصلاحيات المحرر أو المدير أو المسؤول العام.' },
    { q: 'كيف أحصل على حساب؟', a: 'يتم إنشاء الحسابات بواسطة مسؤول النظام. تواصل مع إدارة الكلية للحصول على صلاحية الدخول.' },
    { q: 'هل يدعم النظام اللغة الإنجليزية والفرنسية؟', a: 'نعم، يدعم النظام ثلاث لغات: العربية والإنجليزية والفرنسية. يمكنك التبديل من شريط التنقل.' },
  ] : locale === 'fr' ? [
    { q: "Qu'est-ce que le système d'événements FEPS ?", a: "C'est le système officiel de gestion et de publication des événements académiques de la Faculté d'Économie et de Sciences Politiques, Université du Caire." },
    { q: 'Comment suivre les événements à venir ?', a: 'Consultez la page du calendrier pour voir tous les événements publiés et naviguer entre les mois.' },
    { q: 'Puis-je ajouter des événements ?', a: "L'ajout d'événements est réservé aux utilisateurs autorisés (éditeur, gestionnaire ou administrateur)." },
    { q: 'Comment obtenir un compte ?', a: "Les comptes sont créés par l'administrateur système. Contactez l'administration de la faculté." },
    { q: 'Le système est-il multilingue ?', a: 'Oui, le système prend en charge trois langues : arabe, anglais et français.' },
  ] : [
    { q: 'What is the FEPS Events System?', a: 'It is the official system for managing and publishing academic events and activities at the Faculty of Economics and Political Science, Cairo University.' },
    { q: 'How do I follow upcoming events?', a: 'Browse the calendar page to view all published events, with the ability to navigate between months.' },
    { q: 'Can I add events?', a: 'Adding events is only available to registered users with Editor, Manager, or Super Admin roles.' },
    { q: 'How do I get an account?', a: 'Accounts are created by the system administrator. Contact the faculty administration for access.' },
    { q: 'Does the system support multiple languages?', a: 'Yes, the system supports three languages: Arabic, English, and French. You can switch from the navigation bar.' },
  ]

  const title = isAr ? 'الأسئلة الشائعة' : locale === 'fr' ? 'Questions Fréquentes' : 'Frequently Asked Questions'
  const subtitle = isAr ? 'إجابات على الأسئلة الأكثر شيوعاً حول نظام فعاليات الكلية' : locale === 'fr' ? 'Réponses aux questions les plus courantes' : 'Answers to the most common questions about the faculty events system'

  return (
    <div className="min-h-screen bg-feps-paper pb-24">
      <div className="border-b border-feps-border pt-8 pb-6">
        <div className="container max-w-5xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[40px] w-[3px] bg-feps-gold"></div>
            <span className="font-mono text-xs uppercase tracking-widest font-semibold text-feps-ink-secondary">FAQ</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-normal tracking-tight text-feps-ink leading-[1.1] mb-4">
            {title}
          </h1>
          <p className="text-lg text-feps-ink-secondary max-w-2xl leading-relaxed">{subtitle}</p>
        </div>
      </div>

      <div className="container max-w-5xl py-8">
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-feps-surface border border-feps-border p-6 md:p-8">
              <h3 className={`font-serif text-xl font-bold text-feps-ink mb-3 ${isAr ? 'arabic' : ''}`}>{faq.q}</h3>
              <p className={`text-feps-ink-secondary leading-relaxed ${isAr ? 'arabic' : ''}`}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
