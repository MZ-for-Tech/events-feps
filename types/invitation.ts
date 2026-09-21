export interface InvitationMinister {
  fullTitle: string   // e.g. "د/"
  name: string        // e.g. "بدر عبد العاطي"
  position: string    // e.g. "وزير الخارجية والتعاون الدولي"
}

export interface InvitationPartner {
  name: string
  logoUrl?: string
}

export interface InvitationConfig {
  // Patron ministers (appear BEFORE university president)
  hasMinistersPatronage: boolean
  ministers: InvitationMinister[]

  // University president
  universityPresidentTitle: string    // e.g. "السيد الأستاذ الدكتور /"
  universityPresidentName: string     // e.g. "محمد سامي عبد الصادق"
  universityPresidentSuffix: string   // e.g. "رئيس جامعة القاهرة"

  // Dean
  supervisionLabel: string            // "وإشراف" | "تحت إشراف" | "تحت رعاية" | "وبحضور"
  deanTitle: string                   // e.g. "أ.د."
  deanName: string                    // e.g. "ممدوح إسماعيل"
  deanPosition: string                // e.g. "عميد كلية الاقتصاد والعلوم السياسية"
  deanExtraLine?: string              // optional extra position line

  // Partner entities (same level as faculty)
  hasPartnerEntities: boolean
  partnerEntities: InvitationPartner[]

  // Event details on card
  eventType: string           // "ندوة" | "مؤتمر" | "حلقة نقاشية" | "ورشة عمل" | custom
  bodyText: string            // "نتشرف بدعوة سيادتكم للمشاركة في"
  eventTitleOnCard: string    // The title shown on the card (can differ from event.titleAr)
  eventDay: string            // "الثلاثاء"
  eventDateDisplay: string    // "28 أبريل 2026"
  eventTimeDisplay: string    // "12:00 ص – 1:30 ظهراً"
  eventLocationDisplay: string

  // Background
  bgImageUrl?: string
  bgColor: string             // hex color, default "#EBF4FF"
}

export const DEFAULT_INVITATION_CONFIG: InvitationConfig = {
  hasMinistersPatronage: false,
  ministers: [],

  universityPresidentTitle: 'السيد الأستاذ الدكتور /',
  universityPresidentName: 'محمد سامي عبد الصادق',
  universityPresidentSuffix: 'رئيس جامعة القاهرة',

  supervisionLabel: 'وإشراف',
  deanTitle: 'أ.د.',
  deanName: 'ممدوح إسماعيل',
  deanPosition: 'عميد كلية الاقتصاد والعلوم السياسية - جامعة القاهرة',
  deanExtraLine: '',

  hasPartnerEntities: false,
  partnerEntities: [],

  eventType: 'ندوة',
  bodyText: 'نتشرف بدعوة سيادتكم للمشاركة في',
  eventTitleOnCard: '',
  eventDay: '',
  eventDateDisplay: '',
  eventTimeDisplay: '',
  eventLocationDisplay: '',

  bgColor: '#EBF4FF',
  bgImageUrl: undefined,
}

export const PRESET_BG_COLORS = [
  { label: 'أزرق فاتح',    value: '#EBF4FF', text: '#1A3A6E' },
  { label: 'كريمي دافئ',   value: '#FFF9F0', text: '#5C3D1E' },
  { label: 'رمادي فاتح',   value: '#F5F5F5', text: '#333333' },
  { label: 'نعناعي',        value: '#F0FFF4', text: '#1A5C36' },
  { label: 'لافندر',        value: '#F5F0FF', text: '#3D1A6E' },
]

export const EVENT_TYPES = ['ندوة', 'مؤتمر', 'حلقة نقاشية', 'ورشة عمل', 'احتفالية', 'أخرى']
export const DAYS_OF_WEEK = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
export const SUPERVISION_LABELS = ['وإشراف', 'تحت إشراف', 'تحت رعاية', 'وبحضور']
