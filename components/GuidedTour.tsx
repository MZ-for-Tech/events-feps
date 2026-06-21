"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Sparkles, MapPin } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";

interface Step {
    target: string;
    titleKey: string;
    contentKey: string;
}

const HOME_STEPS: Step[] = [
    { target: "nav-brand", titleKey: "homeNavTarget", contentKey: "homeNavDesc" },
    { target: "hero-stats", titleKey: "homeStatsTitle", contentKey: "homeStatsContent" },
    { target: "events-feed", titleKey: "homeFeedTitle", contentKey: "homeFeedContent" },
    { target: "nav-lang", titleKey: "homeLangTitle", contentKey: "homeLangContent" }
];

const EVENTS_STEPS: Step[] = [
    { target: "events-calendar", titleKey: "eventsCalendarTitle", contentKey: "eventsCalendarContent" },
    { target: "events-search", titleKey: "eventsSearchTitle", contentKey: "eventsSearchContent" },
    { target: "events-filters", titleKey: "eventsFiltersTitle", contentKey: "eventsFiltersContent" }
];

const ADMIN_EVENTS_STEPS: Step[] = [
    { target: "admin-sidebar", titleKey: "adminSidebarTitle", contentKey: "adminSidebarContent" },
    { target: "admin-create-event", titleKey: "adminCreateTitle", contentKey: "adminCreateContent" },
    { target: "admin-publish-toggle", titleKey: "adminPublishTitle", contentKey: "adminPublishContent" },
    { target: "admin-actions", titleKey: "adminActionsTitle", contentKey: "adminActionsContent" }
];

const ADMIN_REPORTS_STEPS: Step[] = [
    { target: "admin-sidebar", titleKey: "adminSidebarTitle", contentKey: "adminSidebarContent" },
    { target: "admin-report-filters", titleKey: "adminReportFiltersTitle", contentKey: "adminReportFiltersContent" },
    { target: "admin-report-generate", titleKey: "adminReportGenerateTitle", contentKey: "adminReportGenerateContent" }
];

export default function GuidedTour() {
    const pathname = usePathname();
    const t = useTranslations('Tour');
    const locale = useLocale();
    const isAr = locale === 'ar';

    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [placement, setPlacement] = useState<"top" | "bottom" | "left" | "right" | "mobile">("bottom");
    const [isMobile, setIsMobile] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isActive) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isActive]);

    const getSteps = useCallback(() => {
        // Remove locale prefix for checking
        const currentPath = pathname.replace(`/${locale}`, '') || '/';
        
        if (currentPath.startsWith('/admin/reports')) return ADMIN_REPORTS_STEPS;
        if (currentPath.startsWith('/admin/events') || currentPath.startsWith('/admin')) return ADMIN_EVENTS_STEPS;
        if (currentPath.startsWith('/events')) return EVENTS_STEPS;
        
        return HOME_STEPS;
    }, [pathname, locale]);

    const [steps, setSteps] = useState<Step[]>([]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSteps(getSteps());
    }, [getSteps, isActive]);

    const updateCoords = useCallback(() => {
        const currentSteps = getSteps();
        const step = currentSteps[currentStep];
        if (!step) return;

        const element = document.querySelector(`[data-tour="${step.target}"]`);
        const mobile = window.innerWidth < 1024;

        setIsMobile(prev => prev !== mobile ? mobile : prev);

        if (element) {
            const rect = element.getBoundingClientRect();
            const newTop = rect.top + window.scrollY;
            const newLeft = rect.left + window.scrollX;

            setCoords(prev => {
                const hasChanged = prev.top !== newTop || prev.left !== newLeft || prev.width !== rect.width || prev.height !== rect.height;
                if (!hasChanged) return prev;
                return { top: newTop, left: newLeft, width: rect.width, height: rect.height };
            });

            if (mobile) {
                setPlacement("mobile");
                const viewHeight = window.innerHeight;
                const offset = viewHeight * 0.2;
                window.scrollTo({
                    top: newTop - offset,
                    behavior: 'smooth'
                });
            } else {
                const bubble = popupRef.current;
                const bW = bubble?.offsetWidth || 360;
                const bH = bubble?.offsetHeight || 250;

                const space = {
                    bottom: window.innerHeight - rect.bottom,
                    top: rect.top,
                    right: window.innerWidth - rect.right,
                    left: rect.left
                };

                if (space.bottom > bH + 30) {
                    setPlacement("bottom");
                } else if (space.top > bH + 30) {
                    setPlacement("top");
                } else if (space.left > bW + 30) {
                    setPlacement("left");
                } else if (space.right > bW + 30) {
                    setPlacement("right");
                } else {
                    setPlacement(space.bottom > space.top ? "bottom" : "top");
                }
            }

            if (!mobile) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentStep, getSteps]);

    useEffect(() => {
        const startTour = () => {
            setIsActive(true);
            setCurrentStep(0);
        };
        window.addEventListener('start-tour', startTour);
        return () => window.removeEventListener('start-tour', startTour);
    }, []);

    useEffect(() => {
        if (isActive) {
            const timer = setTimeout(updateCoords, 50);
            const observer = new ResizeObserver(() => updateCoords());
            if (popupRef.current) observer.observe(popupRef.current);
            window.addEventListener('resize', updateCoords);
            window.addEventListener('scroll', updateCoords, { passive: true });
            return () => {
                clearTimeout(timer);
                observer.disconnect();
                window.removeEventListener('resize', updateCoords);
                window.removeEventListener('scroll', updateCoords);
            };
        }
    }, [isActive, updateCoords]);

    const [popupHeight, setPopupHeight] = useState(250);

    useEffect(() => {
        if (popupRef.current) {
            setPopupHeight(popupRef.current.offsetHeight);
        }
    }, [coords, currentStep, isMobile, placement]);

    if (!isActive || steps.length === 0) return null;

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsActive(false);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const getPopupStyle = (): React.CSSProperties => {
        if (isMobile) return {};

        const bW = 360;
        const bH = popupHeight;

        let top = 0;
        let left = 0;
        let transform = '';

        const vCenter = coords.top - window.scrollY + (coords.height / 2);
        const hCenter = coords.left + (coords.width / 2);

        switch (placement) {
            case "top":
                top = coords.top - window.scrollY - 20;
                left = hCenter - (bW / 2);
                transform = 'translateY(-100%)';
                break;
            case "bottom":
                top = coords.top - window.scrollY + coords.height + 20;
                left = hCenter - (bW / 2);
                break;
            case "left":
                top = vCenter - (bH / 2);
                left = coords.left - 20;
                transform = 'translateX(-100%)';
                break;
            case "right":
                top = vCenter - (bH / 2);
                left = coords.left + coords.width + 20;
                break;
        }

        return {
            top: Math.max(80, Math.min(window.innerHeight - bH - 20, top)),
            left: Math.max(20, Math.min(window.innerWidth - bW - 20, left)),
            transform,
            width: bW,
            maxWidth: bW
        };
    };

    const getArrowStyle = (): React.CSSProperties => {
        if (placement === "mobile") return { display: 'none' };

        const bW = 360;
        const bH = popupHeight;
        const pStyle = getPopupStyle();
        const pLeft = typeof pStyle.left === 'number' ? pStyle.left : 0;
        const pTop = typeof pStyle.top === 'number' ? pStyle.top : 0;

        const hCenter = coords.left + (coords.width / 2);
        const vCenter = coords.top - window.scrollY + (coords.height / 2);

        let arrowTop: string | number = '50%';
        let arrowLeft: string | number = '50%';

        if (placement === "top" || placement === "bottom") {
            arrowLeft = Math.max(20, Math.min(bW - 20, hCenter - pLeft));
            if (placement === "top") arrowTop = '100%';
            else arrowTop = 0;
        } else {
            arrowTop = Math.max(20, Math.min(bH - 20, vCenter - pTop));
            if (placement === "left") arrowLeft = '100%';
            else arrowLeft = 0;
        }

        return {
            top: arrowTop,
            left: arrowLeft,
            transform: `translate(-50%, -50%) rotate(45deg)`,
            position: 'absolute'
        };
    };

    return (
        <div className={`fixed inset-0 z-[100] pointer-events-none overflow-hidden h-[100dvh] ${isAr ? 'rtl' : 'ltr'}`}>
            <svg
                className="absolute inset-0 w-full h-full pointer-events-auto cursor-pointer"
                onClick={() => setIsActive(false)}
            >
                <defs>
                    <mask id="tour-spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <rect
                            x={coords.left - 8}
                            y={coords.top - 8 - window.scrollY}
                            width={coords.width + 16}
                            height={coords.height + 16}
                            rx="12"
                            fill="black"
                            className={`transition-all duration-500 ease-out ${isMobile ? 'animate-pulse' : ''}`}
                        />
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.7)"
                    mask="url(#tour-spotlight-mask)"
                    style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                />
            </svg>

            <div
                ref={popupRef}
                className={`fixed pointer-events-auto transition-all duration-500 ease-out z-[102]
                    ${isMobile ? 'bottom-0 left-0 right-0 p-0' : ''}`}
                style={getPopupStyle()}
            >
                <div className={`
                    bg-feps-paper p-6 border border-feps-ink/20 relative overflow-hidden group shadow-2xl
                    ${isMobile ? 'pb-10' : ''}
                `}>
                    <div className="absolute top-0 right-0 left-0 h-0.5 bg-feps-gold/20">
                        <div
                            className={`h-full bg-feps-gold transition-all duration-700 ${isAr ? 'float-right' : 'float-left'}`}
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>

                    <div className={`relative space-y-5 ${isAr ? 'text-right' : 'text-left'}`}>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setIsActive(false)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-feps-ink-secondary" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className={isAr ? 'text-left' : 'text-right'}>
                                    <p className="text-[8px] font-black text-feps-ink-secondary uppercase tracking-widest leading-none mb-0.5">{t('step')}</p>
                                    <p className="text-[11px] font-black text-feps-ink leading-none">{currentStep + 1} {t('of')} {steps.length}</p>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-feps-navy flex items-center justify-center text-white shadow-lg rotate-2">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className={`space-y-2.5 max-h-[25vh] overflow-y-auto custom-scrollbar ${isAr ? 'ps-1' : 'pe-1'}`}>
                            <div className={`flex items-center gap-1.5 text-feps-ink-secondary ${isAr ? 'justify-start' : 'justify-end'}`}>
                                <MapPin className="w-2.5 h-2.5" />
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-50">
                                    {steps[currentStep].target.replace('-', ' ')}
                                </span>
                            </div>
                            <h4 className="text-lg font-black text-feps-ink tracking-tight leading-tight">
                                {/* Using t() but we cast as any since the keys are dynamic from object */}
                                {t(steps[currentStep].titleKey as Parameters<typeof t>[0])}
                            </h4>
                            <p className="text-feps-ink-secondary text-[13px] leading-relaxed font-bold">
                                {t(steps[currentStep].contentKey as Parameters<typeof t>[0])}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-black/10">
                            <div className={`flex gap-3 w-full ${isAr ? 'flex-row-reverse' : 'flex-row'} justify-end`}>
                                <button
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                    className={`rounded-xl border border-black/10 flex items-center justify-center text-feps-ink hover:bg-black/5 disabled:opacity-30 transition-all
                                        ${isMobile ? 'w-12 h-12' : 'w-9 h-9'}`}
                                >
                                    {isAr ? <ChevronRight className={isMobile ? "w-6 h-6" : "w-5 h-5"} /> : <ChevronLeft className={isMobile ? "w-6 h-6" : "w-5 h-5"} />}
                                </button>
                                <button
                                    onClick={nextStep}
                                    className={`rounded-xl bg-feps-navy flex items-center justify-center text-white shadow-md hover:translate-y-[-1px] active:scale-95 transition-all flex items-center gap-2
                                        ${isMobile ? 'px-8 h-12' : 'px-5 h-9'} ${isAr ? 'flex-row-reverse' : ''}`}
                                >
                                    <span className={`font-black ${isMobile ? 'text-[14px]' : 'text-[12px]'}`}>
                                        {currentStep === steps.length - 1 ? t('done') : t('next')}
                                    </span>
                                    {isAr ? <ChevronLeft className={isMobile ? "w-5 h-5" : "w-4 h-4"} /> : <ChevronRight className={isMobile ? "w-5 h-5" : "w-4 h-4"} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {!isMobile && (
                    <div
                        style={getArrowStyle()}
                        className={`w-4 h-4 border-feps-ink/20 bg-feps-paper transition-all duration-500
                            ${placement === "top" ? 'border-r border-b' : ''}
                            ${placement === "bottom" ? 'border-l border-t' : ''}
                            ${placement === "left" ? 'border-t border-r' : ''}
                            ${placement === "right" ? 'border-b border-l' : ''}
                        `}
                    />
                )}
            </div>
        </div>
    );
}
