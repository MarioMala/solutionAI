export function resetForm(entryForm, entryId, formTitle, submitBtn, cancelBtn, formSection, addEntryBtn, moduleSelectGroup, moduleDisplayGroup) {
    entryForm.reset();
    entryId.value = '';
    formTitle.textContent = 'Dodaj nowy wpis';
    submitBtn.textContent = 'Dodaj';
    cancelBtn.style.display = 'none';
    formSection.style.display = 'none';
    addEntryBtn.style.display = 'inline-block';
    
    // Przywróć widoczność selecta modułu, ukryj wyświetlanie i przywróć required
    if (moduleSelectGroup) moduleSelectGroup.style.display = 'block';
    if (moduleDisplayGroup) moduleDisplayGroup.style.display = 'none';
    
    // Przywróć atrybut required dla selecta modułu
    const moduleInput = document.getElementById('module');
    if (moduleInput) moduleInput.setAttribute('required', '');
}
