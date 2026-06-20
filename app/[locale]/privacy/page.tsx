export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isAr = locale === 'ar'

  const title = isAr ? 'سياسة الخصوصية' : locale === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy'
  const lastUpdated = isAr ? 'آخر تحديث: يناير ٢٠٢٦' : locale === 'fr' ? 'Dernière mise à jour : Janvier 2026' : 'Last updated: January 2026'

  const sections = isAr ? [
    { title: '١. البيانات التي نجمعها', content: 'يجمع النظام الحد الأدنى من البيانات اللازمة للتشغيل: الاسم والبريد الإلكتروني وكلمة المرور (مشفرة) للمستخدمين المسجلين فقط.' },
    { title: '٢. استخدام البيانات', content: 'تُستخدم بيانات المستخدمين حصرياً لأغراض المصادقة وإدارة صلاحيات الوصول إلى النظام. لا يتم مشاركة البيانات مع أي طرف ثالث.' },
    { title: '٣. أمان البيانات', content: 'نستخدم تقنيات التشفير المعيارية لحماية كلمات المرور. يتم تخزين جميع البيانات بشكل آمن على خوادم الكلية.' },
    { title: '٤. ملفات تعريف الارتباط', content: 'يستخدم النظام ملفات تعريف الارتباط (Cookies) الضرورية فقط للحفاظ على جلسة تسجيل الدخول.' },
    { title: '٥. حقوقك', content: 'يحق لك طلب الاطلاع على بياناتك الشخصية أو تعديلها أو حذفها عن طريق التواصل مع إدارة النظام.' },
  ] : locale === 'fr' ? [
    { title: '1. Données collectées', content: "Le système collecte le minimum de données nécessaires : nom, e-mail et mot de passe (crypté) pour les utilisateurs enregistrés uniquement." },
    { title: '2. Utilisation des données', content: "Les données sont utilisées exclusivement pour l'authentification et la gestion des accès. Aucune donnée n'est partagée avec des tiers." },
    { title: '3. Sécurité', content: 'Nous utilisons des technologies de cryptage standard pour protéger les mots de passe. Toutes les données sont stockées de manière sécurisée.' },
    { title: '4. Cookies', content: "Le système utilise uniquement les cookies nécessaires au maintien de la session de connexion." },
    { title: '5. Vos droits', content: "Vous avez le droit de demander l'accès, la modification ou la suppression de vos données personnelles." },
  ] : [
    { title: '1. Data We Collect', content: 'The system collects the minimum data necessary for operation: name, email, and password (encrypted) for registered users only.' },
    { title: '2. Use of Data', content: 'User data is used exclusively for authentication and access management purposes. No data is shared with any third party.' },
    { title: '3. Data Security', content: 'We use industry-standard encryption technologies to protect passwords. All data is stored securely on faculty servers.' },
    { title: '4. Cookies', content: 'The system uses only essential cookies necessary to maintain login sessions.' },
    { title: '5. Your Rights', content: 'You have the right to request access, modification, or deletion of your personal data by contacting the system administration.' },
  ]

  return (
    <div className="min-h-screen bg-feps-paper pb-24">
      <div className="border-b border-feps-border pt-8 pb-6">
        <div className="container max-w-5xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[40px] w-[3px] bg-feps-ink"></div>
            <span className="font-mono text-xs uppercase tracking-widest font-semibold text-feps-ink-secondary">
              {isAr ? 'خصوصية' : locale === 'fr' ? 'Confidentialité' : 'Privacy'}
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
