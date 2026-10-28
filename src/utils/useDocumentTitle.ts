import { useEffect } from 'react';

export const APP_NAME = 'C Programming Pattern Lab';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
