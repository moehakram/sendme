import './style.css';
import { initApp } from './app';
import type { GlobalElements } from './types';
import layoutHtml from './layout.html?raw';
import { mapElements } from './utils/dom.util';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = layoutHtml;

const els: GlobalElements = mapElements<GlobalElements>(app, [
  'mainViewport',
  'tplBreadcrumbItem',
  'tplTable',
  'tplEmpty',
  'tplLocked',
  'tplFileRow',
  'tplToast',
  'tpl404',
]);

initApp(els);
