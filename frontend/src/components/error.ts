import type { GlobalElements, LockedElements } from '../types';
import { switchView } from '../utils/dom.util';

export const render404 = (elements: GlobalElements, onBackHome: () => void) => {
  const { mainViewport, tpl404 } = elements;

  // 1. Ganti view ke 404
  const { btnBackHome } = switchView<{ btnBackHome: HTMLButtonElement }>(
    mainViewport,
    tpl404,
    ['btnBackHome'],
  );

  // 2. Pasang event listener untuk navigasi balik
  btnBackHome.onclick = e => {
    e.preventDefault();
    onBackHome();
  };
};

export const renderLocked = (elements: GlobalElements) => {
  const locked = switchView<LockedElements>(
    elements.mainViewport,
    elements.tplLocked,
    ['btnRetry'],
  );
  locked.btnRetry.href = `?retry=${Date.now()}`;
};
