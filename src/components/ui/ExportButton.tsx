import { Download } from 'lucide-react';

interface ExportButtonProps {
  onClick: () => void;
  label?: string;
}

export function ExportButton({ onClick, label = 'Exportar PDF' }: ExportButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white border-2 border-[#c8a35f] text-[#c8a35f] px-6 py-3 rounded-lg hover:bg-[#c8a35f] hover:text-white transition-all duration-200 flex items-center gap-2 shadow-lg"
    >
      <Download size={20} />
      {label}
    </button>
  );
}
