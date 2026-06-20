export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isAr = locale === 'ar'

  const title = isAr ? 'شروط الاستخدام' : locale === 'fr' ? "Conditions d'Utilisation" : 'Terms of Use'
  const lastUpdated = isAr ? 'آخر تحديث: يناير ٢٠٢٦' : locale === 'fr' ? 'Dernière mise à jour : Janvier 2026' : 'Last updated: January 2026'

  const sections = isAr ? [
    { title: '١. القبول', content: 'باستخدامك لنظام فعاليات كلية الاقتصاد والعلوم السياسية، فإنك توافق على الالتزام بهذه الشروط والأحكام.' },
    { title: '٢. الاستخدام المسموح', content: 'هذا النظام مخصص لإدارة ونشر الفعاليات والأنشطة الأكاديمية الخاصة بالكلية. يُحظر استخدامه لأي أغراض غير مشروعة أو غير مصرح بها.' },
    { title: '٣. حسابات المستخدمين', content: 'يتم إنشاء حسابات المستخدمين بواسطة مسؤول النظام. أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك.' },
    { title: '٤. المحتوى', content: 'جميع الفعاليات والمحتوى المنشور على هذا النظام يخضع لمراجعة إدارة الكلية. تحتفظ الكلية بحق تعديل أو حذف أي محتوى.' },
    { title: '٥. إخلاء المسؤولية', content: 'يُقدم هذا النظام "كما هو" دون أي ضمانات صريحة أو ضمنية. لا تتحمل الكلية المسؤولية عن أي أضرار ناتجة عن استخدام النظام.' },
  ] : locale === 'fr' ? [
    { title: '1. Acceptation', content: "En utilisant le système d'événements FEPS, vous acceptez de respecter ces conditions." },
    { title: '2. Utilisation autorisée', content: "Ce système est destiné à la gestion et à la publication des événements académiques de la faculté. Toute utilisation non autorisée est interdite." },
    { title: '3. Comptes utilisateurs', content: "Les comptes sont créés par l'administrateur. Vous êtes responsable de la confidentialité de vos identifiants." },
    { title: '4. Contenu', content: "Tout le contenu publié est soumis à l'approbation de l'administration. La faculté se réserve le droit de modifier ou supprimer tout contenu." },
    { title: '5. Limitation de responsabilité', content: "Ce système est fourni « en l'état » sans aucune garantie. La faculté n'est pas responsable des dommages résultant de son utilisation." },
  ] : [
    { title: '1. Acceptance', content: 'By using the FEPS Events System, you agree to be bound by these terms and conditions.' },
    { title: '2. Permitted Use', content: 'This system is designated for managing and publishing academic events and activities of the faculty. Any unauthorized or unlawful use is prohibited.' },
    { title: '3. User Accounts', content: 'User accounts are created by the system administrator. You are responsible for maintaining the confidentiality of your login credentials.' },
    { title: '4. Content', content: 'All events and content published on this system are subject to review by the faculty administration. The faculty reserves the right to modify or remove any content.' },
    { title: '5. Disclaimer', content: 'This system is provided "as is" without any express or implied warranties. The faculty is not liable for any damages resulting from the use of the system.' },
  ]

  return (
    <div className="min-h-screen bg-feps-paper pb-24">
      <div className="border-b border-feps-border pt-8 pb-6">
        <div className="container max-w-5xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[40px] w-[3px] bg-feps-ink"></div>
            <span className="font-mono text-xs uppercase tracking-widest font-semibold text-feps-ink-secondary">
              {isAr ? 'قانوني' : locale === 'fr' ? 'Légal' : 'Legal'}
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-normal tracking-tight text-feps-ink leading-[1.1] mb-4">
            {title}
          </h1>
          <p className="text-sm text-feps-ink-secondary font-mono">{lastUpdated}</p>
        </div>
      </div>

      <div className="container max-w-5xl py-8">
        <div className="bg-feps-surface border border-feps-border p-8 md:p-10">
          <div className="flex flex-col gap-8">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className={`font-serif text-xl font-bold text-feps-ink mb-3 ${isAr ? 'arabic' : ''}`}>{section.title}</h2>
                <p className={`text-feps-ink-secondary leading-relaxed ${isAr ? 'arabic' : ''}`}>{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
