import type { InvitationConfig, InvitationLocale } from '@/types/invitation'

const copy = {
  ar: {
    dir: 'rtl', localeCode: 'ar-EG-u-nu-latn', builderEyebrow: 'إعداد الدعوة', stepWord: 'الخطوة', stepsAria: 'خطوات إعداد الدعوة',
    steps: ['الرعاة', 'الجهات الشريكة', 'تفاصيل الدعوة', 'الخلفية', 'المعاينة والتحميل'],
    previous: 'السابق', next: 'التالي', save: 'حفظ', saving: 'جاري الحفظ...', saved: 'تم حفظ إعدادات الدعوة', saveFailed: 'تعذر حفظ إعدادات الدعوة', serverFailed: 'تعذر الاتصال بالخادم',
    patronsTitle: 'الرعاة والإشراف', patronsDescription: 'رتّب بيانات الرعاية كما ستظهر في الدعوة: الوزراء، ثم رئيس الجامعة، ثم عميد الكلية.', hasMinisters: 'هل يوجد وزراء كرعاة؟ (يُذكرون قبل رئيس الجامعة)', minister: 'وزير', addMinister: 'إضافة وزير', deleteMinister: 'حذف الوزير', title: 'اللقب', name: 'الاسم', position: 'المنصب', ministerName: 'اسم الوزير', ministerPosition: 'وزير الخارجية والتعاون الدولي', universityPresident: 'رئيس الجامعة', dean: 'عميد الكلية', supervisionWording: 'صيغة الإشراف', jobTitle: 'المسمى الوظيفي', extraLine: 'سطر إضافي (اختياري)',
    partnersTitle: 'الجهات الشريكة', partnersDescription: 'أضف أسماء الجهات المشاركة وشعاراتها بالترتيب المطلوب في الدعوة.', hasPartners: 'هل توجد جهات أخرى مشاركة؟', partnersHint: 'تظهر شعارات الجهات بين شعار جامعة القاهرة وشعار الكلية.', entity: 'جهة', deleteEntity: 'حذف الجهة', entityName: 'اسم الجهة', entityLogo: 'شعار الجهة (اختياري)', addEntity: 'إضافة جهة', logosOrder: 'معاينة ترتيب الشعارات', cairoUniversity: 'جامعة القاهرة', facultyShort: 'الكلية', entityLogoAlt: 'شعار الجهة', changeLogo: 'تغيير الشعار', remove: 'حذف', uploading: 'جاري الرفع...', uploadLogo: 'رفع الشعار', uploadingLogo: 'جاري رفع الشعار...', logoRules: 'PNG أو JPG أو WEBP - بحد أقصى 2MB', logoTooLarge: 'حجم الشعار يجب ألا يتجاوز 2 ميجابايت.', logoUploadFailed: 'تعذر رفع الشعار. حاول مرة أخرى.',
    detailsTitle: 'تفاصيل الدعوة', detailsDescription: 'راجع النص والموعد والمكان كما سيظهرون للمدعوين.', eventType: 'نوع الفعالية', customEventType: 'اكتب نوع الفعالية', introText: 'نص الدعوة (المقدمة)', eventTitle: 'عنوان الفعالية على الدعوة', day: 'اليوم', chooseDay: 'اختر اليوم', displayDate: 'التاريخ (للعرض)', displayDatePlaceholder: '28 أبريل 2026', displayTime: 'الوقت (للعرض)', displayTimePlaceholder: '12:00 ص – 1:30 ظهراً', displayLocation: 'المكان (للعرض)', displayLocationPlaceholder: 'قاعة ساويرس - كلية الاقتصاد...',
    backgroundTitle: 'خلفية الدعوة', backgroundDescription: 'ارفع صورة مناسبة أو اختر لونًا من الألوان الجاهزة.', uploadBackground: 'رفع صورة خلفية (اختياري)', backgroundPreview: 'معاينة خلفية الدعوة', removeBackground: 'حذف صورة الخلفية', chooseImage: 'اضغط لاختيار صورة', imageTypes: 'PNG, JPG, WEBP', chooseColor: 'أو اختر لون خلفية', chooseBackground: 'اختيار خلفية',
    previewTitle: 'معاينة الدعوة وتحميلها', previewDescription: 'تحقق من البيانات النهائية قبل الحفظ أو التحميل.', saveInvitation: 'حفظ الدعوة', preparingImage: 'جاري تجهيز الصورة...', downloadImage: 'تحميل صورة PNG', preparingPdf: 'جاري تجهيز PDF...', downloadPdf: 'تحميل PDF', print: 'طباعة', exportFailed: 'تعذر تجهيز الملف. تأكد من اكتمال تحميل جميع الصور ثم حاول مرة أخرى.', imageReady: 'تم تجهيز صورة الدعوة وتنزيلها.', pdfReady: 'تم تجهيز ملف PDF وتنزيله.', previewFile: 'معاينة الملف الناتج',
    invitation: 'دعوة', publicInvitation: 'دعوة عامة', underPatronageAndHonor: 'تحت رعاية وتشريف', underPatronage: 'تحت رعاية', cairoUniversityFull: 'جامعة القاهرة', facultyFull: 'كلية الاقتصاد والعلوم السياسية',
    days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    eventTypes: ['ندوة', 'مؤتمر', 'حلقة نقاشية', 'ورشة عمل', 'احتفالية', 'أخرى'], otherEventType: 'أخرى',
    supervisionLabels: ['وإشراف', 'تحت إشراف', 'تحت رعاية', 'وبحضور'],
    colors: ['أزرق فاتح', 'كريمي دافئ', 'رمادي فاتح', 'نعناعي', 'لافندر'],
  },
  en: {
    dir: 'ltr', localeCode: 'en-US', builderEyebrow: 'Invitation setup', stepWord: 'Step', stepsAria: 'Invitation setup steps',
    steps: ['Patrons', 'Partner entities', 'Invitation details', 'Background', 'Preview & download'],
    previous: 'Previous', next: 'Next', save: 'Save', saving: 'Saving...', saved: 'Invitation settings saved', saveFailed: 'Could not save invitation settings', serverFailed: 'Could not connect to the server',
    patronsTitle: 'Patrons and supervision', patronsDescription: 'Arrange the patronage details as they will appear: ministers, university president, then faculty dean.', hasMinisters: 'Are any ministers listed as patrons? (shown before the university president)', minister: 'Minister', addMinister: 'Add minister', deleteMinister: 'Delete minister', title: 'Title', name: 'Name', position: 'Position', ministerName: 'Minister name', ministerPosition: 'Minister of Foreign Affairs and International Cooperation', universityPresident: 'University president', dean: 'Faculty dean', supervisionWording: 'Supervision wording', jobTitle: 'Job title', extraLine: 'Additional line (optional)',
    partnersTitle: 'Partner entities', partnersDescription: 'Add participating entities and their logos in the order required on the invitation.', hasPartners: 'Are there any partner entities?', partnersHint: 'Partner logos appear between Cairo University and the faculty logos.', entity: 'Entity', deleteEntity: 'Delete entity', entityName: 'Entity name', entityLogo: 'Entity logo (optional)', addEntity: 'Add entity', logosOrder: 'Logo order preview', cairoUniversity: 'Cairo University', facultyShort: 'Faculty', entityLogoAlt: 'Entity logo', changeLogo: 'Change logo', remove: 'Remove', uploading: 'Uploading...', uploadLogo: 'Upload logo', uploadingLogo: 'Uploading logo...', logoRules: 'PNG, JPG or WEBP — maximum 2 MB', logoTooLarge: 'The logo must not exceed 2 MB.', logoUploadFailed: 'Could not upload the logo. Please try again.',
    detailsTitle: 'Invitation details', detailsDescription: 'Review the wording, date, time and location exactly as guests will see them.', eventType: 'Event type', customEventType: 'Enter the event type', introText: 'Invitation introduction', eventTitle: 'Event title on the invitation', day: 'Day', chooseDay: 'Choose a day', displayDate: 'Display date', displayDatePlaceholder: '28 April 2026', displayTime: 'Display time', displayTimePlaceholder: '12:00 PM – 1:30 PM', displayLocation: 'Display location', displayLocationPlaceholder: 'Sawiris Hall — Faculty of Economics...',
    backgroundTitle: 'Invitation background', backgroundDescription: 'Upload a suitable image or choose a preset color.', uploadBackground: 'Upload a background image (optional)', backgroundPreview: 'Invitation background preview', removeBackground: 'Remove background image', chooseImage: 'Click to choose an image', imageTypes: 'PNG, JPG, WEBP', chooseColor: 'Or choose a background color', chooseBackground: 'Choose background',
    previewTitle: 'Preview and download', previewDescription: 'Check the final invitation before saving or downloading it.', saveInvitation: 'Save invitation', preparingImage: 'Preparing image...', downloadImage: 'Download PNG', preparingPdf: 'Preparing PDF...', downloadPdf: 'Download PDF', print: 'Print', exportFailed: 'Could not prepare the file. Make sure all images have loaded, then try again.', imageReady: 'The invitation image is ready and has been downloaded.', pdfReady: 'The PDF is ready and has been downloaded.', previewFile: 'Preview generated file',
    invitation: 'Invitation', publicInvitation: 'Public invitation', underPatronageAndHonor: 'Under the patronage and in the presence of', underPatronage: 'Under the patronage of', cairoUniversityFull: 'Cairo University', facultyFull: 'Faculty of Economics and Political Science',
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    eventTypes: ['Seminar', 'Conference', 'Panel discussion', 'Workshop', 'Celebration', 'Other'], otherEventType: 'Other',
    supervisionLabels: ['Under the supervision of', 'Supervised by', 'Under the patronage of', 'In the presence of'],
    colors: ['Light blue', 'Warm cream', 'Light gray', 'Mint', 'Lavender'],
  },
  fr: {
    dir: 'ltr', localeCode: 'fr-FR', builderEyebrow: 'Configuration de l’invitation', stepWord: 'Étape', stepsAria: 'Étapes de configuration de l’invitation',
    steps: ['Parrainage', 'Partenaires', 'Détails de l’invitation', 'Arrière-plan', 'Aperçu et téléchargement'],
    previous: 'Précédent', next: 'Suivant', save: 'Enregistrer', saving: 'Enregistrement...', saved: 'Paramètres de l’invitation enregistrés', saveFailed: 'Impossible d’enregistrer les paramètres', serverFailed: 'Impossible de se connecter au serveur',
    patronsTitle: 'Parrainage et supervision', patronsDescription: 'Organisez les informations telles qu’elles apparaîtront : ministres, président de l’université, puis doyen.', hasMinisters: 'Des ministres figurent-ils parmi les parrains ? (affichés avant le président)', minister: 'Ministre', addMinister: 'Ajouter un ministre', deleteMinister: 'Supprimer le ministre', title: 'Titre', name: 'Nom', position: 'Fonction', ministerName: 'Nom du ministre', ministerPosition: 'Ministre des Affaires étrangères et de la Coopération internationale', universityPresident: 'Président de l’université', dean: 'Doyen de la faculté', supervisionWording: 'Formule de supervision', jobTitle: 'Intitulé du poste', extraLine: 'Ligne supplémentaire (facultatif)',
    partnersTitle: 'Organismes partenaires', partnersDescription: 'Ajoutez les organismes participants et leurs logos dans l’ordre souhaité.', hasPartners: 'Y a-t-il des organismes partenaires ?', partnersHint: 'Les logos des partenaires apparaissent entre ceux de l’Université du Caire et de la faculté.', entity: 'Organisme', deleteEntity: 'Supprimer l’organisme', entityName: 'Nom de l’organisme', entityLogo: 'Logo de l’organisme (facultatif)', addEntity: 'Ajouter un organisme', logosOrder: 'Aperçu de l’ordre des logos', cairoUniversity: 'Université du Caire', facultyShort: 'Faculté', entityLogoAlt: 'Logo de l’organisme', changeLogo: 'Changer le logo', remove: 'Supprimer', uploading: 'Téléversement...', uploadLogo: 'Téléverser le logo', uploadingLogo: 'Téléversement du logo...', logoRules: 'PNG, JPG ou WEBP — 2 Mo maximum', logoTooLarge: 'Le logo ne doit pas dépasser 2 Mo.', logoUploadFailed: 'Impossible de téléverser le logo. Veuillez réessayer.',
    detailsTitle: 'Détails de l’invitation', detailsDescription: 'Vérifiez le texte, la date, l’heure et le lieu tels qu’ils seront présentés aux invités.', eventType: 'Type d’événement', customEventType: 'Saisissez le type d’événement', introText: 'Introduction de l’invitation', eventTitle: 'Titre de l’événement sur l’invitation', day: 'Jour', chooseDay: 'Choisir un jour', displayDate: 'Date affichée', displayDatePlaceholder: '28 avril 2026', displayTime: 'Heure affichée', displayTimePlaceholder: '12:00 – 13:30', displayLocation: 'Lieu affiché', displayLocationPlaceholder: 'Salle Sawiris — Faculté d’économie...',
    backgroundTitle: 'Arrière-plan de l’invitation', backgroundDescription: 'Téléversez une image appropriée ou choisissez une couleur prédéfinie.', uploadBackground: 'Téléverser une image d’arrière-plan (facultatif)', backgroundPreview: 'Aperçu de l’arrière-plan', removeBackground: 'Supprimer l’image d’arrière-plan', chooseImage: 'Cliquez pour choisir une image', imageTypes: 'PNG, JPG, WEBP', chooseColor: 'Ou choisissez une couleur d’arrière-plan', chooseBackground: 'Choisir l’arrière-plan',
    previewTitle: 'Aperçu et téléchargement', previewDescription: 'Vérifiez l’invitation finale avant de l’enregistrer ou de la télécharger.', saveInvitation: 'Enregistrer l’invitation', preparingImage: 'Préparation de l’image...', downloadImage: 'Télécharger le PNG', preparingPdf: 'Préparation du PDF...', downloadPdf: 'Télécharger le PDF', print: 'Imprimer', exportFailed: 'Impossible de préparer le fichier. Vérifiez que toutes les images sont chargées, puis réessayez.', imageReady: 'L’image de l’invitation est prête et a été téléchargée.', pdfReady: 'Le PDF est prêt et a été téléchargé.', previewFile: 'Aperçu du fichier généré',
    invitation: 'Invitation', publicInvitation: 'Invitation publique', underPatronageAndHonor: 'Sous le patronage et en présence de', underPatronage: 'Sous le patronage de', cairoUniversityFull: 'Université du Caire', facultyFull: 'Faculté d’économie et de sciences politiques',
    days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    eventTypes: ['Séminaire', 'Conférence', 'Table ronde', 'Atelier', 'Célébration', 'Autre'], otherEventType: 'Autre',
    supervisionLabels: ['Sous la supervision de', 'Supervisé par', 'Sous le patronage de', 'En présence de'],
    colors: ['Bleu clair', 'Crème chaud', 'Gris clair', 'Menthe', 'Lavande'],
  },
} as const

export function normalizeInvitationLocale(locale: string): InvitationLocale {
  return locale === 'en' || locale === 'fr' ? locale : 'ar'
}

export function getInvitationCopy(locale: string) {
  return copy[normalizeInvitationLocale(locale)]
}

export function createDefaultInvitationConfig(locale: InvitationLocale): InvitationConfig {
  const t = copy[locale]
  const people = locale === 'ar'
    ? { presidentTitle: 'السيد الأستاذ الدكتور /', presidentName: 'محمد سامي عبد الصادق', presidentPosition: 'رئيس جامعة القاهرة', deanTitle: 'أ.د.', deanName: 'ممدوح إسماعيل', deanPosition: 'عميد كلية الاقتصاد والعلوم السياسية - جامعة القاهرة' }
    : locale === 'fr'
      ? { presidentTitle: 'Pr.', presidentName: 'Mohamed Sami Abdel Sadek', presidentPosition: 'Président de l’Université du Caire', deanTitle: 'Pr.', deanName: 'Mamdouh Ismail', deanPosition: 'Doyen de la Faculté d’économie et de sciences politiques — Université du Caire' }
      : { presidentTitle: 'Prof. Dr.', presidentName: 'Mohamed Sami Abdel Sadek', presidentPosition: 'President of Cairo University', deanTitle: 'Prof. Dr.', deanName: 'Mamdouh Ismail', deanPosition: 'Dean of the Faculty of Economics and Political Science — Cairo University' }

  return {
    hasMinistersPatronage: false,
    ministers: [],
    universityPresidentTitle: people.presidentTitle,
    universityPresidentName: people.presidentName,
    universityPresidentSuffix: people.presidentPosition,
    supervisionLabel: t.supervisionLabels[0],
    deanTitle: people.deanTitle,
    deanName: people.deanName,
    deanPosition: people.deanPosition,
    deanExtraLine: '',
    hasPartnerEntities: false,
    partnerEntities: [],
    eventType: t.eventTypes[0],
    bodyText: locale === 'ar' ? 'نتشرف بدعوة سيادتكم للمشاركة في' : locale === 'fr' ? 'Nous avons le plaisir de vous inviter à participer à' : 'We are pleased to invite you to participate in',
    eventTitleOnCard: '',
    eventDay: '',
    eventDateDisplay: '',
    eventTimeDisplay: '',
    eventLocationDisplay: '',
    bgColor: '#EBF4FF',
    bgImageUrl: undefined,
  }
}

export type InvitationCopy = ReturnType<typeof getInvitationCopy>
