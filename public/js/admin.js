let adminRecords = [];

function showAdminView() {
  document.getElementById('mainHomepageView').classList.add('hidden');
  document.getElementById('reportPortalView').classList.add('hidden');
  document.getElementById('adminPortalView').classList.remove('hidden');

  if (sessionStorage.getItem("freshtime_token")) {
    document.getElementById('adminLoginBox').classList.add('hidden');
    document.getElementById('adminDashboardBox').classList.remove('hidden');
    loadAdminRecords();
  } else {
    document.getElementById('adminLoginBox').classList.remove('hidden');
    document.getElementById('adminDashboardBox').classList.add('hidden');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const u = document.getElementById('adminUsername').value.trim();
  const p = document.getElementById('adminPassword').value.trim();
  const errBox = document.getElementById('adminLoginError');

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p })
    });
    const json = await res.json();

    if (json.success && json.token) {
      sessionStorage.setItem("freshtime_token", json.token);
      errBox.classList.add('hidden');
      document.getElementById('adminLoginBox').classList.add('hidden');
      document.getElementById('adminDashboardBox').classList.remove('hidden');
      loadAdminRecords();
    } else {
      errBox.innerText = json.message || "Invalid credentials.";
      errBox.classList.remove('hidden');
    }
  } catch (err) {
    errBox.innerText = "Error contacting admin server.";
    errBox.classList.remove('hidden');
  }
}

function handleAdminLogout() {
  sessionStorage.removeItem("freshtime_token");
  showAdminView();
}

async function loadAdminRecords() {
  const tbody = document.getElementById('sheetTableBody');
  tbody.innerHTML = `<tr><td colspan="18" class="p-6 text-center text-slate-400">Loading records from backend...</td></tr>`;

  try {
    const res = await fetch("/api/admin/records", {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("freshtime_token")}` }
    });
    const json = await res.json();

    if (json.success && json.records) {
      adminRecords = json.records;
      renderAdminTable(adminRecords);
      document.getElementById('statTotalTickets').innerText = adminRecords.length;
    } else {
      tbody.innerHTML = `<tr><td colspan="18" class="p-6 text-center text-red-500">Failed to load records.</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="18" class="p-6 text-center text-red-500">Connection error.</td></tr>`;
  }
}

function renderAdminTable(records) {
  const tbody = document.getElementById('sheetTableBody');
  if (!records || !records.length) {
    tbody.innerHTML = `<tr><td colspan="18" class="p-6 text-center text-slate-400">No records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map((r) => {
    const isComplete = (r.status || "").toLowerCase().includes("complete") || (r.status || "").toLowerCase().includes("resolved");
    const statusBadge = isComplete
      ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">${r.status}</span>`
      : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">${r.status}</span>`;

    const cleanPhone = String(r.contactNumber || "").replace(/[^0-9]/g, "");
    const adminWaUrl = cleanPhone.length === 10 ? `https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(r.applicantName || '')},%20regarding%20ticket%20${r.ticketId}.` : '#';

    let proofButton = `<span class="text-slate-400 text-[10px] italic">None</span>`;
    if (r.screenshotProof && String(r.screenshotProof).startsWith("data:image")) {
      proofButton = `
        <button type="button" onclick="viewScreenshotProof('${r.ticketId}')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded text-[10px] font-bold shadow transition cursor-pointer">
          View Image
        </button>
      `;
    }

    return `
      <tr class="hover:bg-slate-50 transition font-mono">
        <td class="p-3 whitespace-nowrap">
          <button type="button" onclick="openEditModal('${r.ticketId}', '${encodeURIComponent(r.status || '')}', '${encodeURIComponent(r.remarks || '')}')" class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[11px] font-sans font-semibold cursor-pointer">
            Update
          </button>
          ${cleanPhone.length === 10 ? `<a href="${adminWaUrl}" target="_blank" class="ml-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[11px] font-sans font-semibold inline-block">WhatsApp</a>` : ''}
        </td>
        <td class="p-3 whitespace-nowrap font-sans">${statusBadge}</td>
        <td class="p-3 font-bold text-slate-900 whitespace-nowrap">${r.ticketId}</td>
        <td class="p-3 font-sans font-bold text-slate-900 whitespace-nowrap">${r.applicantName || 'N/A'}</td>
        <td class="p-3 font-extrabold text-emerald-800 whitespace-nowrap">${r.utrNumber || r.paymentId || 'N/A'}</td>
        <td class="p-3 font-sans text-slate-700 whitespace-nowrap">${r.paymentMethod || 'FRESH PAY'}</td>
        <td class="p-3 font-sans whitespace-nowrap">${proofButton}</td>
        <td class="p-3 font-bold text-emerald-700 whitespace-nowrap font-sans">₹${r.amount}</td>
        <td class="p-3 font-sans whitespace-nowrap font-bold text-slate-800">${r.applicationType || 'N/A'}</td>
        <td class="p-3 font-sans whitespace-nowrap">${r.applicantType || 'N/A'}</td>
        <td class="p-3 font-sans text-blue-700 whitespace-nowrap">${r.issue || 'N/A'}</td>
        <td class="p-3 font-bold text-slate-800 whitespace-nowrap">${r.loginId}</td>
        <td class="p-3 bg-amber-50 text-slate-700 whitespace-nowrap font-bold">${r.portalPassword}</td>
        <td class="p-3 text-slate-500 whitespace-nowrap">${r.odp || 'N/A'}</td>
        <td class="p-3 whitespace-nowrap">${r.contactNumber}</td>
        <td class="p-3 font-sans text-slate-600 whitespace-nowrap">${r.contactEmail}</td>
        <td class="p-3 font-sans text-slate-400 whitespace-nowrap">${r.createdAt || r.timestamp || 'N/A'}</td>
        <td class="p-3 font-sans text-slate-600 max-w-xs truncate">${r.remarks || ''}</td>
      </tr>
    `;
  }).join('');
}

function openEditModal(ticketId, encodedStatus, encodedRemarks) {
  document.getElementById('editTicketRaw').value = ticketId;
  document.getElementById('editTicketDisplay').value = ticketId;
  document.getElementById('editStatusSelect').value = decodeURIComponent(encodedStatus);
  document.getElementById('editRemarksInput').value = decodeURIComponent(encodedRemarks);
  document.getElementById('editStatusModal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('editStatusModal').classList.add('hidden');
}

async function submitStatusUpdate() {
  const ticketId = document.getElementById('editTicketRaw').value;
  const status = document.getElementById('editStatusSelect').value;
  const remarks = document.getElementById('editRemarksInput').value;
  const btn = document.getElementById('saveStatusBtn');

  btn.disabled = true;
  btn.innerText = "Updating...";

  try {
    const res = await fetch(`/api/admin/tickets/${ticketId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("freshtime_token")}`
      },
      body: JSON.stringify({ status, remarks })
    });
    const json = await res.json();
    if (json.success) {
      closeEditModal();
      loadAdminRecords();
    } else {
      alert(json.message || "Failed to update status.");
    }
  } catch (err) {
    alert("Connection failure while updating.");
  } finally {
    btn.disabled = false;
    btn.innerText = "Save Update";
  }
}

function filterSheetTable() {
  const q = document.getElementById('tableSearchInput').value.toLowerCase();
  const filtered = adminRecords.filter(r => 
    (r.ticketId || "").toLowerCase().includes(q) ||
    (r.applicantName || "").toLowerCase().includes(q) ||
    (r.utrNumber || "").toLowerCase().includes(q) ||
    (r.loginId || "").toLowerCase().includes(q) ||
    (r.contactNumber || "").toLowerCase().includes(q) ||
    (r.applicationType || "").toLowerCase().includes(q)
  );
  renderAdminTable(filtered);
}

function viewScreenshotProof(ticketId) {
  const rec = adminRecords.find(x => x.ticketId === ticketId);
  if (rec && rec.screenshotProof) {
    document.getElementById('proofTicketIdDisplay').innerText = `Ticket: ${ticketId}`;
    document.getElementById('imageProofDisplay').src = rec.screenshotProof;
    document.getElementById('imageProofModal').classList.remove('hidden');
  }
}

function closeImageModal() {
  document.getElementById('imageProofModal').classList.add('hidden');
}

function exportToCSV() {
  if (!adminRecords.length) return alert("No records available to export.");
  const headers = ["Ticket ID", "Applicant Name", "UTR", "Amount", "App Type", "Role", "Login ID", "Password", "ODP", "Contact", "Status", "Remarks"];
  const rows = adminRecords.map(r => [
    `"${r.ticketId}"`, `"${r.applicantName}"`, `"${r.utrNumber}"`, `"${r.amount}"`,
    `"${r.applicationType}"`, `"${r.applicantType}"`, `"${r.loginId}"`, `"${r.portalPassword}"`,
    `"${r.odp || 'N/A'}"`, `"${r.contactNumber}"`, `"${r.status}"`, `"${r.remarks || ''}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", `Freshtime_Records_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}