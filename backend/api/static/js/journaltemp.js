document.addEventListener('DOMContentLoaded', () => {
    // Open Modal
    window.openAddTemplateModal = function () {
      document.getElementById('addTemplateModal').style.display = 'block';
    };
  
    // Close Modal
    window.closeAddTemplateModal = function () {
      document.getElementById('addTemplateModal').style.display = 'none';
    };
  
    // Add Row to Modal Table
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
  
    // Remove Row from Modal Table
    window.removeTemplateRow = function (button) {
      const row = button.parentElement.parentElement;
      row.remove();
    };
  
    // Save Template and Add to Main Table
    window.saveTemplate = function () {
      const templateCode = document.getElementById('templateCode').value;
      const transactionType = document.getElementById('transactionType').value;
  
      if (!templateCode || !transactionType) {
        alert('Please fill in all fields.');
        return;
      }
  
      const table = document.getElementById('journalTemplateTable');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${templateCode}</td>
        <td>${transactionType}</td>
        <td><button class="btn-delete" onclick="deleteTemplateRow(this)">Delete</button></td>
      `;
      table.appendChild(row);
  
      // Clear inputs and close modal
      document.getElementById('templateCode').value = '';
      document.getElementById('transactionType').value = 'reservations';
      closeAddTemplateModal();
    };
  
    // Delete Row from Main Table
    window.deleteTemplateRow = function (button) {
      const row = button.parentElement.parentElement;
      row.remove();
    };
  });
  