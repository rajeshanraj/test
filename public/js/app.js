const FRESHTIME_WHATSAPP_NUMBER = "919876543210";
const FRESHTIME_UPI_ID = "Q68094857@ybl";

const ISSUE_FEE_RATES = {
  "APAAR / Upper ID Fetching Issue": 150.00,
  "Mandatory Password Changing Issue": 70.00,
  "Password Reset Error": 70.00,
  "Admission / Registration Process": 150.00,
  "Other Issue": 80.00
};

const SSP_FEE_RATES = {
  "New Application": 200.00,
  "Modify Application": 150.00,
  "Reapply for this Year": 150.00,
  "Error Application": 100.00
};

let isSubmitting = false;
let pendingFormData = null;

function showReportView() {
  document.getElementById('mainHomepageView').classList.add('hidden');
  document.getElementById('adminPortalView').classList.add('hidden');
  document.getElementById('reportPortalView').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMainView() {
  document.getElementById('reportPortalView').classList.add('hidden');
  document.getElementById('adminPortalView').classList.add('hidden');
  document.getElementById('mainHomepageView').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleLoginIdInput(inputElem) {
  const appType = document.getElementById('applicationType').value;
  if (appType === "SSP") {
    inputElem.value = inputElem.value.replace(/[^0-9]/g, "");
  } else {
    inputElem.value = inputElem.value.toUpperCase();
  }
}

function handleApplicationTypeChange() {
  const appType = document.getElementById('applicationType').value;
  const applicantTypeSelect = document.getElementById('applicantType');
  const grievanceSec = document.getElementById('technicalGrievanceSection');
  const issueCategoryBox = document.getElementById('issueCategoryBox');
  const issueCategorySelect = document.getElementById('issueCategory');
  const errorDescBox = document.getElementById('errorDescriptionBox');
  const errorDescText = document.getElementById('issueDescription');
  const odpContainer = document.getElementById('odpContainer');
  const odpInput = document.getElementById('odpValue');
  const loginIdInput = document.getElementById('loginId');
  const loginIdHelper = document.getElementById('loginIdHelper');

  applicantTypeSelect.innerHTML = '<option value="" disabled selected>-- Select Option --</option>';
  loginIdInput.value = "";

  if (appType === "UUCMS") {
    ["Student / Candidate", "College Staff", "College Administrator"].forEach(role => {
      const opt = document.createElement("option");
      opt.value = role;
      opt.textContent = role;
      applicantTypeSelect.appendChild(opt);
    });

    grievanceSec.classList.remove('hidden');
    issueCategoryBox.classList.remove('hidden');
    issueCategorySelect.setAttribute("required", "required");
    errorDescBox.classList.remove('hidden');
    errorDescText.setAttribute("required", "required");

    odpContainer.classList.remove('hidden');

    loginIdInput.setAttribute("maxlength", "12");
    loginIdInput.setAttribute("pattern", "^[A-Za-z][0-9]{2}[A-Za-z]{2}[0-9]{2}[A-Za-z][0-9]{4}$");
    loginIdInput.setAttribute("placeholder", "e.g. U03XX21S0000");
    loginIdHelper.innerText = "1-Letter, 2-Numbers, 2-Letters, 2-Numbers, 1-Letter, 4-Numbers";

    updateProcessingFee();
  } else if (appType === "SSP") {
    ["New Application", "Modify Application", "Reapply for this Year", "Error Application"].forEach(optVal => {
      const opt = document.createElement("option");
      opt.value = optVal;
      opt.textContent = optVal;
      applicantTypeSelect.appendChild(opt);
    });

    grievanceSec.classList.add('hidden');
    issueCategoryBox.classList.add('hidden');
    issueCategorySelect.removeAttribute("required");

    errorDescBox.classList.add('hidden');
    errorDescText.removeAttribute("required");
    errorDescText.value = "";

    odpContainer.classList.add('hidden');
    odpInput.value = "";

    loginIdInput.setAttribute("maxlength", "11");
    loginIdInput.setAttribute("pattern", "^[0-9]{11}$");
    loginIdInput.setAttribute("placeholder", "Enter 11-digit Number (e.g. 21220012345)");
    loginIdHelper.innerText = "Must be exactly 11-digit numbers";

    document.getElementById('displayAmount').innerText = "0.00";
    document.getElementById('fixedAmount').value = "0.00";
    document.getElementById('feeBreakdownText').innerText = "Please select an SSP applicant type to calculate fee.";
  }
}

function handleApplicantTypeChange() {
  const appType = document.getElementById('applicationType').value;
  const applicantType = document.getElementById('applicantType').value;
  const grievanceSec = document.getElementById('technicalGrievanceSection');
  const issueCategoryBox = document.getElementById('issueCategoryBox');
  const errorDescBox = document.getElementById('errorDescriptionBox');
  const errorDescText = document.getElementById('issueDescription');

  if (appType === "SSP") {
    const rate = SSP_FEE_RATES[applicantType] || 0.00;
    setFixedFee(rate, `SSP Fee for ${applicantType}`);

    if (applicantType === "Error Application") {
      grievanceSec.classList.remove('hidden');
      issueCategoryBox.classList.add('hidden');
      errorDescBox.classList.remove('hidden');
      errorDescText.setAttribute("required", "required");
      document.getElementById('errorApplicationModal').classList.remove('hidden');
    } else {
      grievanceSec.classList.add('hidden');
      errorDescBox.classList.add('hidden');
      errorDescText.removeAttribute("required");
      errorDescText.value = "";
    }
  }
}

function closeErrorApplicationModal() {
  document.getElementById('errorApplicationModal').classList.add('hidden');
}

function setFixedFee(amt, label) {
  document.getElementById('displayAmount').innerText = amt.toFixed(2);
  document.getElementById('fixedAmount').value = amt.toFixed(2);
  document.getElementById('feeBreakdownText').innerHTML = `<strong class="text-blue-900">${label}</strong>`;
}

function updateProcessingFee() {
  const appType = document.getElementById('applicationType').value;
  if (appType === "SSP") return;

  const selectedIssue = document.getElementById('issueCategory').value;
  const rate = ISSUE_FEE_RATES[selectedIssue] || 0.00;
  
  document.getElementById('displayAmount').innerText = rate.toFixed(2);
  document.getElementById('fixedAmount').value = rate.toFixed(2);

  const feeText = document.getElementById('feeBreakdownText');
  if (selectedIssue === "Other Issue") {
    feeText.innerHTML = `Nominal Initial Fee for: <strong class="text-blue-900">${selectedIssue}</strong>`;
    document.getElementById('otherIssueModal').classList.remove('hidden');
  } else if (selectedIssue && ISSUE_FEE_RATES[selectedIssue] !== undefined) {
    feeText.innerHTML = `Fixed service fee for: <strong class="text-blue-900">${selectedIssue}</strong>`;
  } else {
    feeText.innerText = "Please select an issue type above to view the applicable fee.";
  }
}

function closeOtherIssueModal() {
  document.getElementById('otherIssueModal').classList.add('hidden');
}

// FEEDBACK LOGIC
function openFeedbackModal() {
  document.getElementById('feedbackModal').classList.remove('hidden');
}

function closeFeedbackModal() {
  document.getElementById('feedbackModal').classList.add('hidden');
}

function setRating(rating) {
  document.getElementById('feedbackRating').value = rating;
  const buttons = document.querySelectorAll('#starContainer .star-btn');
  buttons.forEach((btn, idx) => {
    if (idx < rating) {
      btn.classList.add('text-amber-400');
      btn.classList.remove('text-slate-300');
    } else {
      btn.classList.add('text-slate-300');
      btn.classList.remove('text-amber-400');
    }
  });

  const descriptors = {
    1: "1 Star - Needs Improvement",
    2: "2 Stars - Fair",
    3: "3 Stars - Good",
    4: "4 Stars - Very Good",
    5: "5 Stars - Excellent!"
  };
  document.getElementById('ratingDescriptor').innerText = descriptors[rating] || "";
}

async function submitUserFeedback(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('feedbackSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = "Submitting...";

  const feedbackData = {
    name: document.getElementById('feedbackName').value.trim(),
    role: document.getElementById('feedbackRole').value,
    rating: parseInt(document.getElementById('feedbackRating').value || 5),
    ticketId: document.getElementById('feedbackTicketId').value.trim() || "N/A",
    comment: document.getElementById('feedbackComment').value.trim()
  };

  try {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedbackData)
    });
    alert("Thank you! Your feedback has been recorded.");
    document.getElementById('feedbackForm').reset();
    setRating(5);
    closeFeedbackModal();
    loadFeedbacks();
  } catch (err) {
    alert("Failed to submit feedback. Try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Publish Feedback";
  }
}

async function loadFeedbacks() {
  const container = document.getElementById('feedbackCardsGrid');
  try {
    const res = await fetch("/api/feedback");
    const json = await res.json();
    const list = json.data && json.data.length ? json.data : [
      { rating: 5, comment: "My portal ID syncing error was resolved within 2 hours. Very responsive support!", name: "Ramesh K.", role: "Student" },
      { rating: 5, comment: "Helped our college department reset student password loops during examination filings smoothly.", name: "Pooja M.", role: "College Staff" },
      { rating: 5, comment: "Clear process with UTR reference tracking and WhatsApp confirmation. Highly recommended.", name: "Santhosh B.", role: "Student" }
    ];

    container.innerHTML = list.slice(0, 6).map(f => {
      const stars = '★'.repeat(f.rating || 5) + '☆'.repeat(5 - (f.rating || 5));
      return `
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div class="flex text-amber-400 text-sm mb-2">${stars}</div>
            <p class="text-xs text-slate-700 italic">"${(f.comment || '').replace(/</g, "&lt;")}"</p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span class="font-bold text-slate-800">${f.name || 'Anonymous'}</span>
            <span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded">${f.role || 'User'}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.warn("Feedbacks load err:", err);
  }
}

// FRESH PAY & IMAGE COMPRESSION
function compressImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.6) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = () => resolve("");
  });
}

function openFreshPayModal(e) {
  e.preventDefault();

  const appType = document.getElementById('applicationType').value;
  const applicantType = document.getElementById('applicantType').value;
  const loginId = document.getElementById('loginId').value.trim();

  if (appType === "SSP") {
    if (!/^[0-9]{11}$/.test(loginId)) {
      alert("Invalid Login ID / Register No. for SSP!\n\nMust be exactly 11 digits numeric.");
      return;
    }
  } else {
    if (!/^[A-Za-z][0-9]{2}[A-Za-z]{2}[0-9]{2}[A-Za-z][0-9]{4}$/.test(loginId)) {
      alert("Invalid Login ID / Register No. format for UUCMS!\n\nMust follow: 1-Letter, 2-Numbers, 2-Letters, 2-Numbers, 1-Letter, 4-Numbers (e.g. U03XX21S0000)");
      return;
    }
  }

  const finalAmount = parseFloat(document.getElementById('fixedAmount').value || 0).toFixed(2);
  if (finalAmount <= 0) {
    alert("Please complete the classification and issue selections above.");
    return;
  }

  const issueCategory = appType === "SSP" ? `SSP: ${applicantType}` : document.getElementById('issueCategory').value;

  pendingFormData = {
    applicantName: document.getElementById('applicantName').value.trim(),
    contactNumber: document.getElementById('contactNumber').value.trim(),
    applicationType: appType,
    applicantType: applicantType,
    issue: issueCategory,
    description: document.getElementById('issueDescription').value.trim() || 'N/A',
    loginId: appType === "SSP" ? loginId : loginId.toUpperCase(),
    portalPassword: document.getElementById('portalPassword').value,
    odp: appType === "SSP" ? "N/A" : (document.getElementById('odpValue').value.trim() || 'N/A'),
    contactEmail: document.getElementById('contactEmail').value.trim(),
    amount: finalAmount
  };

  document.getElementById('fpPayableAmount').innerText = `₹${finalAmount}`;
  const upiString = `upi://pay?pa=${FRESHTIME_UPI_ID}&pn=Freshtime%20Enterprises&am=${finalAmount}&cu=INR&tn=Portal%20Resolution%20Fee`;
  document.getElementById('dynamicUpiQr').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;

  document.getElementById('fpUtrInput').value = "";
  document.getElementById('fpScreenshotInput').value = "";
  document.getElementById('freshPayModal').classList.remove('hidden');
}

function closeFreshPayModal() {
  document.getElementById('freshPayModal').classList.add('hidden');
}

async function confirmAndSubmitFreshPay() {
  if (isSubmitting) return;

  const utr = document.getElementById('fpUtrInput').value.trim();
  if (!/^\d{12}$/.test(utr)) {
    alert("Please enter a valid 12-digit numeric Bank Reference / UTR Number.");
    return;
  }

  const fileInput = document.getElementById('fpScreenshotInput');
  if (!fileInput.files || fileInput.files.length === 0) {
    alert("Please upload your payment screenshot proof.");
    return;
  }

  const paymentMethod = document.getElementById('fpPaymentModeSelect').value;
  const submitBtn = document.getElementById('fpSubmitPaymentBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = "Processing Ticket...";
  isSubmitting = true;

  const compressedScreenshot = await compressImageFile(fileInput.files[0]);

  const fullPayload = {
    ...pendingFormData,
    utrNumber: utr,
    paymentId: utr,
    paymentMethod: paymentMethod,
    screenshotProof: compressedScreenshot
  };

  try {
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullPayload)
    });
    const result = await res.json();

    if (result.success) {
      closeFreshPayModal();
      document.getElementById('resTicketId').innerText = result.ticketId;
      document.getElementById('resApplicantName').innerText = result.applicantName;
      document.getElementById('resUtrNumber').innerText = result.utrNumber;
      document.getElementById('resAmount').innerText = "₹" + result.amount;
      document.getElementById('searchQuery').value = result.ticketId;

      const waMessage = `Hello Freshtime Enterprises, I have paid via FRESH PAY for Technical Assistance:%0A%0A*Ticket ID:* ${result.ticketId}%0A*Name:* ${result.applicantName}%0A*12-Digit UTR:* ${utr}%0A*Amount:* ₹${result.amount}`;
      document.getElementById('whatsappShareBtn').href = `https://wa.me/${FRESHTIME_WHATSAPP_NUMBER}?text=${waMessage}`;

      document.getElementById('successModal').classList.remove('hidden');
    } else {
      alert("Error: " + result.message);
    }
  } catch (err) {
    alert("Failed to submit ticket. Please check connection.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Confirm Payment & Submit Ticket";
    isSubmitting = false;
  }
}

// STATUS LOOKUP
async function checkTicketStatus(e) {
  e.preventDefault();
  const query = document.getElementById('searchQuery').value.trim();
  const checkBtn = document.getElementById('checkBtn');
  const box = document.getElementById('statusResultBox');

  if (!query) return;

  checkBtn.disabled = true;
  checkBtn.innerText = "Checking...";
  box.classList.add('hidden');

  try {
    const res = await fetch(`/api/tickets/status?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    box.classList.remove('hidden');

    if (data.found && data.ticket) {
      const t = data.ticket;
      box.className = "mt-4 p-4 rounded-xl border text-xs bg-slate-50 border-slate-200";
      box.innerHTML = `
        <div class="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
          <span class="font-mono font-bold text-slate-800">${t.ticketId}</span>
          <span class="px-2.5 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">${t.status}</span>
        </div>
        <p><strong>Applicant Name:</strong> ${t.applicantName || 'N/A'}</p>
        <p class="mt-1"><strong>Application Type:</strong> ${t.applicationType || 'N/A'}</p>
        <p class="mt-1"><strong>Issue:</strong> ${t.issue || 'N/A'}</p>
        <p class="mt-1"><strong>UTR:</strong> ${t.utrNumber || t.paymentId || 'Under Verification'}</p>
        <p class="mt-1"><strong>Status / Remarks:</strong> ${t.remarks || 'In review'}</p>
      `;
    } else {
      box.className = "mt-4 p-4 rounded-xl border bg-red-50 border-red-200 text-xs text-red-700";
      box.innerHTML = `No record found for <strong>${query}</strong>. Please verify your reference.`;
    }
  } catch (err) {
    box.className = "mt-4 p-4 rounded-xl border bg-red-50 border-red-200 text-xs text-red-700";
    box.innerHTML = "Server connectivity error. Please try again later.";
  } finally {
    checkBtn.disabled = false;
    checkBtn.innerText = "Check Status";
  }
}

function resetAndClose() {
  document.getElementById('successModal').classList.add('hidden');
  document.getElementById('issueForm').reset();
  document.getElementById('displayAmount').innerText = "0.00";
  document.getElementById('fixedAmount').value = "0.00";
  document.getElementById('feeBreakdownText').innerText = "Please select an application type and grievance type above.";
  handleApplicationTypeChange();
  isSubmitting = false;
}

window.addEventListener('DOMContentLoaded', () => {
  loadFeedbacks();
});