export type CombatTextTranslator = (polish: string, english: string) => string;

export const HIT_NOTICE = {
    SHIELD_DEFLECTED: 'SHIELD DEFLECTED',
    CRITICAL_HULL_HIT: 'CRITICAL HULL HIT!',
    shieldDamage: (damage: number) => `-${damage} SHIELD`,
} as const;

export type WeaponAnnouncementId =
    | 'TRIPLE_SHOT'
    | 'LASER_BEAM'
    | 'PLASMA_SPREAD'
    | 'SHIELD_RESTORED'
    | 'EXTRA_LIFE'
    | 'CANNON_LEVEL';

export interface LocalizableAnnouncement {
    id?: WeaponAnnouncementId;
    level?: number;
    title: string;
    subtitle: string;
}

export const localizeHitNotice = (notice: string, t: CombatTextTranslator): string => {
    if (notice === HIT_NOTICE.SHIELD_DEFLECTED) return t('TARCZA ODBIŁA OSTRZAŁ', notice);
    if (notice === HIT_NOTICE.CRITICAL_HULL_HIT) return t('KRYTYCZNE TRAFIENIE KADŁUBA!', notice);
    const shieldMatch = /^-(\d+) SHIELD$/.exec(notice);
    if (shieldMatch) return t(`-${shieldMatch[1]} TARCZY`, notice);
    return notice;
};

// Announcement titles start with an emoji prefix that is language-neutral.
export const localizeAnnouncement = (
    announcement: LocalizableAnnouncement,
    t: CombatTextTranslator,
): { title: string; subtitle: string } => {
    const icon = announcement.title.slice(0, Math.max(0, announcement.title.indexOf(' ')));
    const withIcon = (text: string) => (icon ? `${icon} ${text}` : text);

    switch (announcement.id) {
        case 'TRIPLE_SHOT':
            return {
                title: withIcon(t('POTRÓJNY STRZAŁ AKTYWNY!', 'TRIPLE SHOT ENGAGED!')),
                subtitle: t('Aktywowano trójkierunkowe działa wachlarzowe', '3-Way Angled Fan Cannons Activated'),
            };
        case 'LASER_BEAM':
            return {
                title: withIcon(t('HIPERLASER AKTYWNY!', 'HYPER LASER BEAM ENGAGED!')),
                subtitle: t('Aktywowano przenikliwą kolumnę lasera spójnego', 'Piercing Coherent Laser Column Activated'),
            };
        case 'PLASMA_SPREAD':
            return {
                title: withIcon(t('ROZPRYSK PLAZMY AKTYWNY!', 'PLASMA SPREAD ENGAGED!')),
                subtitle: t('Aktywowano pięciokierunkowe ciężkie pociski zakłócające', '5-Way Heavy Disruption Bolts Activated'),
            };
        case 'SHIELD_RESTORED':
            return {
                title: withIcon(t('TARCZA PRZYWRÓCONA DO MAKSIMUM', 'MAXIMUM SHIELD RESTORED')),
                subtitle: t('Deflektor przeładowany do 100%', 'Deflector System Overcharged to 100%'),
            };
        case 'EXTRA_LIFE':
            return {
                title: withIcon(t('ZDOBYTO DODATKOWE ŻYCIE PILOTA', 'EXTRA PILOT LIFE ACQUIRED')),
                subtitle: t('Zapasowa jednostka kadłuba online', 'Hull Backup Unit Online'),
            };
        case 'CANNON_LEVEL':
            return {
                title: withIcon(t(`POZIOM DZIAŁA ${announcement.level}`, `CANNON LEVEL ${announcement.level}`)),
                subtitle: t('Ulepszono poziom podstawowej siły ognia', 'Primary Firepower Tier Upgraded'),
            };
        default:
            return { title: announcement.title, subtitle: announcement.subtitle };
    }
};