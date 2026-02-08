export function resetForm(entryForm, entryId, formTitle, submitBtn, cancelBtn, formSection, addEntryBtn) {
    entryForm.reset();
    entryId.value = '';
    formTitle.textContent = 'Dodaj nowy wpis';
    submitBtn.textContent = 'Dodaj';
    cancelBtn.style.display = 'none';
    formSection.style.display = 'none';
    addEntryBtn.style.display = 'inline-block';
}
