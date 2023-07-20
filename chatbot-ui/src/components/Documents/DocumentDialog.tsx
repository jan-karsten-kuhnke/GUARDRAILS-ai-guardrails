import { FC, useContext, useEffect, useReducer, useRef } from 'react';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { getSettings, saveSettings } from '@/utils/app/settings';

import { Settings } from '@/types/settings';

import HomeContext from '@/pages/home/home.context';
import { PrivateDocuments } from './PrivateDocuments';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const DocumentDialog: FC<Props> = ({ open, onClose }) => {
  const { state : { theme } } = useContext(HomeContext);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        window.addEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      window.removeEventListener('mouseup', handleMouseUp);
      onClose();
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  // Render nothing if the dialog is not open.
  if (!open) {
    return <></>;
  }

  // Render the dialog.
  return (
    <div className={`fixed inset-0 flex items-center justify-center  z-50`}>
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />

          <div
            ref={modalRef}
            className={`inline-block max-h-[700px] 
              transform overflow-y-auto rounded-lg border border-gray-300 
              px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all 
            lg:my-8 lg:max-h-[600px] lg:w-[900px] lg:p-6 lg:align-middle
               sm:my-8 sm:max-h-[600px] sm:w-[600px] sm:p-6 sm:align-middle ${theme.modalDialogTheme}`}

            role="dialog"
          >
            <div className={`text-lg pb-4 font-bold ${theme.textColor}`}>
              {('Documents')}
            </div>
           
              <PrivateDocuments/>
          </div>
        </div>
      </div>
    </div>
  );
};
