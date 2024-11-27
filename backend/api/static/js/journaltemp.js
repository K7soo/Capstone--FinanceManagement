document.addEventListener('DOMContentLoaded', () => {
    // Define journalTemplates in the global scope
    window.journalTemplates = [];
  
    // Open Add Template Modal
    window.openAddTemplateModal = function () {
      document.getElementById('addTemplateModal').style.display = 'block';
    };
  
    // Close Add Template Modal
    window.closeAddTemplateModal = function () {
      document.getElementById('addTemplateModal').style.display = 'none';
    };
  
    // Open View Template Modal
    window.openViewTemplateModal = function (templateIndex) {
      const template = journalTemplates[templateIndex];
      document.getElementById('viewTemplateCode').textContent = template.templateCode;
      document.getElementById('viewTransactionType').textContent = template.transactionType;
  
      const rowsContainer = document.getElementById('viewTemplateRows');
      rowsContainer.innerHTML = ''; // Clear existing rows
      template.accounts.forEach(account => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${account.accountCode}</td>
          <td>${account.accountDesc}</td>
          <td><input type="checkbox" disabled ${account.debit ? 'checked' : ''}></td>
          <td><input type="checkbox" disabled ${account.credit ? 'checked' : ''}></td>
        `;
        rowsContainer.appendChild(row);
      });
  
      document.getElementById('viewTemplateModal').style.display = 'block';
    };
  
    // Close View Template Modal
    window.closeViewTemplateModal = function () {
      document.getElementById('viewTemplateModal').style.display = 'none';
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
  
    // Save Template
    window.saveTemplate = function () {
      const templateCode = document.getElementById('templateCode').value;
      const transactionType = document.getElementById('transactionType').value;
  
      if (!templateCode || !transactionType) {
        alert('Please fill in all fields.');
        return;
      }
  
      const accounts = [];
      document.querySelectorAll('#templateRows tr').forEach(row => {
        const accountCode = row.querySelector('td:nth-child(1) input').value;
        const accountDesc = row.querySelector('td:nth-child(2) input').value;
        const debit = row.querySelector('td:nth-child(3) input').checked;
        const credit = row.querySelector('td:nth-child(4) input').checked;
  
        accounts.push({ accountCode, accountDesc, debit, credit });
      });
  
      const newTemplate = { templateCode, transactionType, accounts };
      journalTemplates.push(newTemplate);
  
      const table = document.getElementById('journalTemplateTable');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${templateCode}</td>
        <td>${transactionType}</td>
        <td>
          <button class="btn-view" onclick="openViewTemplateModal(${journalTemplates.length - 1})">View</button>
          <button class="btn-delete" onclick="deleteTemplateRow(this)">Delete</button>
        </td>
      `;
      table.appendChild(row);
  
      // Clear modal inputs
      document.getElementById('templateCode').value = '';
      document.getElementById('transactionType').value = 'reservations';
      document.getElementById('templateRows').innerHTML = '';
      closeAddTemplateModal();
    };
  
    // Delete Row from Main Table
    window.deleteTemplateRow = function (button) {
      const row = button.parentElement.parentElement;
      row.remove();
    };
  });
  