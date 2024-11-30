document.addEventListener('DOMContentLoaded', () => {
  // Define journalTemplates in the global scope
  window.journalTemplates = [];

  // Open Add Template Modal
  window.openAddTemplateModal = function () {
      document.getElementById('addTemplateModal').style.display = 'block';
      document.getElementById('modalRightSection').style.display = 'none'; // Hide row addition initially
      document.querySelector('.btn-save-template-step1').style.display = 'block'; // Show save template button for step 1
  };

  // Close Add Template Modal
  window.closeAddTemplateModal = function () {
      document.getElementById('addTemplateModal').style.display = 'none';
  };

  // Open Edit Template Modal
  window.openEditTemplateModal = function (templateIndex) {
      const template = journalTemplates[templateIndex];
      document.getElementById('templateCode').value = template.templateCode;
      document.getElementById('transactionType').value = template.transactionType;
      document.getElementById('modalRightSection').style.display = 'block'; // Show row addition area
      document.querySelector('.btn-save-template-step1').style.display = 'none';

      // Clear existing rows and populate with saved accounts
      const rowsContainer = document.getElementById('templateRows');
      rowsContainer.innerHTML = '';
      template.accounts.forEach(account => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td><input type="text" placeholder="Account Code" value="${account.accountCode}" /></td>
              <td><input type="text" placeholder="Account Description" value="${account.accountDesc}" /></td>
              <td><input type="checkbox" name="debit" ${account.debit ? 'checked' : ''} /></td>
              <td><input type="checkbox" name="credit" ${account.credit ? 'checked' : ''} /></td>
              <td><button class="btn-remove-row" onclick="removeTemplateRow(this)">X</button></td>
          `;
          rowsContainer.appendChild(row);
      });

      document.getElementById('addTemplateModal').style.display = 'block';
      window.currentEditingIndex = templateIndex;
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

  // Save Template (first step)
  window.saveTemplate = function () {
      const templateCode = document.getElementById('templateCode').value;
      const transactionType = document.getElementById('transactionType').value;

      if (!templateCode || !transactionType) {
          alert('Please fill in all fields.');
          return;
      }

      // Save the initial template data
      const newTemplate = { templateCode, transactionType, accounts: [] };
      journalTemplates.push(newTemplate);

      // Update the main table
      const table = document.getElementById('journalTemplateTable');
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${templateCode}</td>
          <td>${transactionType}</td>
          <td>
              <button class="btn-view" onclick="openViewTemplateModal(${journalTemplates.length - 1})">View</button>
              <button class="btn-edit" onclick="openEditTemplateModal(${journalTemplates.length - 1})">Edit</button>
              <button class="btn-delete" onclick="deleteTemplateRow(this)">Delete</button>
          </td>
      `;
      table.appendChild(row);

      // Reveal the right-side section for adding rows
      document.getElementById('modalRightSection').style.display = 'block'; // Show row addition area
      document.querySelector('.btn-save-template-step1').style.display = 'none'; // Hide save template button after step 1
  };

  // Save Edited Template (second step for adding rows)
  window.saveEditedTemplate = function () {
      const templateIndex = window.currentEditingIndex;
      const accounts = [];

      document.querySelectorAll('#templateRows tr').forEach(row => {
          const accountCode = row.querySelector('td:nth-child(1) input').value;
          const accountDesc = row.querySelector('td:nth-child(2) input').value;
          const debit = row.querySelector('td:nth-child(3) input').checked;
          const credit = row.querySelector('td:nth-child(4) input').checked;

          accounts.push({ accountCode, accountDesc, debit, credit });
      });

      // Update the template with new rows
      journalTemplates[templateIndex].accounts = accounts;

      closeAddTemplateModal();
  };

  // Delete Row from Main Table
  window.deleteTemplateRow = function (button) {
      const row = button.parentElement.parentElement;
      row.remove();
  };

  // Open View Template Modal
  window.openViewTemplateModal = function (templateIndex) {
      const template = journalTemplates[templateIndex];
      alert(`Template Code: ${template.templateCode}\nTransaction Type: ${template.transactionType}`);
  };
});
