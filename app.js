const dialog = document.querySelector('#warning-dialog');
document.querySelector('[data-dialog="warning-dialog"]').addEventListener('click', () => dialog.showModal());
document.querySelector('[data-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
