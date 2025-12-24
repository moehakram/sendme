import './style.css';
import { initApp } from './app';
import type { Elements } from './types';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
   <div class="min-h-screen bg-gray-50 text-gray-900 font-sans text-sm">
       <!-- Auth Overlay -->
       <div id="auth-overlay" class="hidden fixed inset-0 z-[200] bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
         <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
           <div class="text-center mb-6">
             <div class="text-5xl mb-4">🔐</div>
             <h2 class="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
             <p class="text-gray-600 text-sm">Please enter your access token to continue</p>
           </div>
           
           <div class="space-y-4">
             <div>
               <label for="token-input" class="block text-sm font-medium text-gray-700 mb-2">
                 Access Token
               </label>
               <input 
                 type="password" 
                 id="token-input" 
                 placeholder="Enter your token..."
                 class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
               />
             </div>
             
             <button 
               id="token-submit"
               class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all active:scale-95 shadow-md"
             >
               Submit Token
             </button>
           </div>
           
           <div class="mt-6 pt-6 border-t border-gray-200">
             <p class="text-xs text-gray-500 text-center">
               Token will be stored in your session for secure access
             </p>
           </div>
         </div>
       </div>

       <!-- Progress Bar -->
       <div id="progress-container" class="fixed top-0 left-0 w-full z-[100] transition-transform duration-300 -translate-y-full">
            <div class="bg-white shadow-lg p-3 px-6 border-b flex items-center gap-4">
                <div class="flex-1">
                    <div class="flex justify-between mb-1 items-center">
                        <span id="progress-label" class="text-xs font-bold text-blue-600 uppercase tracking-wider"></span>
                        <span id="progress-text" class="text-xs font-mono font-bold">0%</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div id="progress-bar" class="bg-blue-600 h-full transition-all duration-300 w-0"></div>
                    </div>
                </div>
                <button id="cancel-progress" class="px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-50 border border-red-200 rounded-md transition-colors">
                    BATAL
                </button>
            </div>
        </div>

        <header class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
            <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <h1 class="text-xl font-bold text-blue-600 cursor-pointer" id="logo">📁 sendme</h1>
                <button id="upload-btn" class="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all active:scale-95 shadow-sm">
                    Upload
                </button>
            </div>
            <nav id="breadcrumb" class="max-w-6xl mx-auto px-4 py-3 text-sm text-gray-500 flex items-center gap-2 overflow-x-auto"></nav>
        </header>

        <main class="max-w-6xl mx-auto px-4 py-6">
            <div id="loading" class="hidden flex justify-center py-20">
                <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            </div>
            <div id="error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span>⚠️</span>
                    <span id="error-message"></span> </div>
                <button onclick="state.error = ''" class="text-red-400 hover:text-red-600">&times;</button>
            </div>
            <div id="file-container" class="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
                <table class="w-full text-left table-auto min-w-full" id="main-table"> 
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr class="text-xs font-semibold text-gray-500 uppercase">
                            <th class="px-6 py-3 w-full">Name</th> 
                            <th class="px-6 py-3 hidden md:table-cell whitespace-nowrap">Size</th>
                            <th class="px-6 py-3 hidden md:table-cell whitespace-nowrap">Modified</th>
                            <th class="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody id="file-list" class="divide-y divide-gray-100"></tbody>
                </table>

                <div id="empty-state" class="hidden py-20 flex flex-col items-center justify-center text-gray-400 w-full min-w-full">
                    <div class="text-5xl mb-2">📂</div>
                    <p class="font-medium">Folder ini kosong</p>
                </div>
            </div>
        </main>

        <div id="upload-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm modal-overlay">
            <div class="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl p-6 relative">
                <div class="flex justify-between mb-4">
                    <h2 class="text-lg font-bold">Upload Files</h2>
                    <button class="close-modal cursor-pointer text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">&times;</button>
                </div>
                <div id="upload-area" class="border-2 border-dashed border-gray-200 rounded-xl py-20 text-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all">
                    <input type="file" id="file-input" multiple class="hidden">
                    <p class="font-semibold text-gray-600 text-sm">Klik atau tarik file ke sini</p>
                </div>
            </div>
        </div>
    </div>
  `;

const els: Elements = {
  fileList: document.getElementById('file-list') as HTMLTableSectionElement,
  breadcrumb: document.getElementById('breadcrumb')!,
  loading: document.getElementById('loading')!,
  error: document.getElementById('error')!,
  uploadModal: document.getElementById('upload-modal')!,
  uploadBtn: document.getElementById('upload-btn')!,
  fileInput: document.getElementById('file-input') as HTMLInputElement,
  uploadArea: document.getElementById('upload-area')!,
  emptyState: document.getElementById('empty-state')!,
  table: document.getElementById('main-table') as HTMLTableElement,
  // Progress Elements
  progContainer: document.getElementById('progress-container')!,
  progBar: document.getElementById('progress-bar')!,
  progLabel: document.getElementById('progress-label')!,
  progText: document.getElementById('progress-text')!,
  cancelBtn: document.getElementById('cancel-progress')!,
  // Auth Elements
  authOverlay: document.getElementById('auth-overlay')!,
  tokenInput: document.getElementById('token-input') as HTMLInputElement,
  tokenSubmit: document.getElementById('token-submit')!,
};

initApp(els);
