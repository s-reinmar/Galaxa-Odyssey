import React from 'react';
import { soundEngine } from '../../game/audio/soundEngine';
import { useLocale } from '../../config/content/locales/LocaleProvider';

interface MenuPanelHeaderProps {
  icon: React.ReactNode;
  title: string;
  titleClassName: string;
  borderClassName?: string;
  onBack: () => void;
}

export const MenuPanelHeader: React.FC<MenuPanelHeaderProps> = ({
  icon,
  title,
  titleClassName,
  borderClassName = 'pb-2',
  onBack,
}) => {
  const { t } = useLocale();

  return (
    <div className={`flex items-center justify-between border-b border-slate-800 ${borderClassName}`}>
      <div className={`flex items-center gap-2 font-mono font-bold text-xs sm:text-sm ${titleClassName}`}>
        {icon} {title}
      </div>
      <button
        type="button"
        onClick={() => {
          soundEngine.playUiClick();
          onBack();
        }}
        className="text-xs text-slate-400 hover:text-white font-mono transition cursor-pointer"
      >
        [{t.menuPanel.back}]
      </button>
    </div>
  );
};

export const ReturnToBridgeButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useLocale();

  return (
    <button
      type="button"
      onClick={() => {
        soundEngine.playUiClick();
        onClick();
      }}
      className="w-full py-2 bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs rounded-lg hover:bg-slate-800 transition cursor-pointer"
    >
      {t.menuPanel.returnToBridge}
    </button>
  );
};
