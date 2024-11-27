document.addEventListener('DOMContentLoaded', () => {
    window.openAddTemplateModal = function () {
        document.getElementById('addTemplateModal').style.display = 'block';
      };
      
      window.closeAddTemplateModal = function () {
        document.getElementById('addTemplateModal').style.display = 'none';
      };
      
      window.addTemplateRow = function () {
        const table = document.getElementById('templateRows');
        const row = document.createElement('tr');
        row.innerHTML = `
        <td><input type="text" placeholder="Account Code" /></td>
        <td><input type="text" placeholder="Account Description" /></td>
        <td><input type="checkbox" name="debit" /></td>
        <td><input type="checkbox" name="credit" /></td>
        <td><button class="btn-remove-row" onclick="removeTemplateRow(this)">X</button></td>
        `;
        table.appendChild(row);
      };
      
      window.saveTemplate = function () {
        alert('Template saved successfully!');
        closeAddTemplateModal();
      };
      
    // Expose functions globally for inline `onclick`
    window.openAddTemplateModal = openAddTemplateModal;
    window.closeAddTemplateModal = closeAddTemplateModal;
    window.addTemplateRow = addTemplateRow;
    window.saveTemplate = saveTemplate;
  });
  
  function removeTemplateRow(button) {
    const row = button.parentElement.parentElement;
    row.remove();
  }
  
  