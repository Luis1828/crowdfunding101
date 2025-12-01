let lastDecoded = '';
let scanner;

function updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = message ? 'block' : 'none';
}

async function loadPayment(id) {
    const btn = document.getElementById('btn-scan');
    btn.style.display = 'none';

    const response = await fetch(`/payments/${encodeURIComponent(id)}`);
    if (!response.ok) {
        updateStatus(`Pago no encontrado (HTTP ${response.status})`, 'error');
        btn.style.display = 'block';
        return;
    }

    const data = await response.json();
    updateStatus('Pago encontrado. Revisa los datos antes de confirmar.', 'info');
    document.getElementById('paymentInfo').innerHTML = `
        <h5>Pago encontrado</h5>
        <p><strong>ID:</strong> <code>${data.id}</code></p>
        <p><strong>Estado:</strong> <b class="${data.estado === 'CONFIRMED' ? 'ok' : 'pending'}">${data.estado}</b></p>
        <p><strong>Monto:</strong> Bs ${data.monto.toFixed(2)}</p>
        <p><strong>Fecha de registro:</strong> ${new Date(data.fechaRegistro).toLocaleString()}</p>
        ${data.fechaPago ? `<p><strong>Fecha de pago:</strong> ${new Date(data.fechaPago).toLocaleString()}</p>` : ''}
        ${data.estado !== 'CONFIRMED' ? `<button class="btn btn-success" onclick="confirmPayment('${data.id}')">Confirmar Pago</button>` : ''}
    `
   
}

async function confirmPayment(id) {
    updateStatus('Confirmando pago...', 'info');
    const response = await fetch(`/payments/${encodeURIComponent(id)}/confirm`, { method: 'POST' });
    if (!response.ok) {
        const data = await response.json();
        updateStatus(`Error confirmando pago: ${data.error || `HTTP ${response.status}`}`, 'error');
        return;
    }

    updateStatus('Pago confirmado correctamente 🎉', 'success');
    await loadPayment(id);
}

function startScanner() {
    const btn = document.getElementById('btn-scan');
    btn.style.display = 'none';
    const html5QrcodeScanner = new Html5QrcodeScanner('reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        aspectRatio: 1,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    }, /* verbose= */ false);
 
    function onScanSuccess(decodedText) {
        lastDecoded = (decodedText || '').trim();

        html5QrcodeScanner.clear().then(() => {
            loadPayment(lastDecoded);
        }).catch(() => {
            loadPayment(lastDecoded);
        });
    }

    function onScanError(err) {
        btn.style.display = 'block';
    }

    html5QrcodeScanner.render(onScanSuccess, onScanError);
}

function manualConfirm() {
    const val = document.getElementById('manualId').value.trim();
    if (val) confirmPayment(val);
}
