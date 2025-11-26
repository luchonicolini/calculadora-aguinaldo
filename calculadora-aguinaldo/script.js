document.addEventListener('DOMContentLoaded', () => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('SW registrado', reg))
            .catch(err => console.log('SW error', err));
    }

    const calculateBtn = document.getElementById('calculateBtn');
    const salaryInput = document.getElementById('salary');
    const shareBtn = document.getElementById('shareBtn');

    calculateBtn.addEventListener('click', calcularAguinaldo);

    // Live Formatting for Salary
    salaryInput.addEventListener('input', function (e) {
        // Remove non-numeric chars
        let value = this.value.replace(/\D/g, '');

        if (value === '') {
            this.value = '';
            return;
        }

        // Format as currency (thousands separator)
        this.value = new Intl.NumberFormat('es-AR').format(parseInt(value));
    });

    // Share Button Logic
    if (shareBtn) {
        shareBtn.addEventListener('click', shareResult);
    }

    // Permitir calcular con Enter en los inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                calcularAguinaldo();
            }
        });

        // Prevenir caracteres inválidos (negativos, e, +)
        input.addEventListener('keydown', function (e) {
            if (['-', '+', 'e', 'E'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // Prevenir paste de negativos
        input.addEventListener('paste', function (e) {
            const text = (e.clipboardData || window.clipboardData).getData('text');
            if (parseFloat(text) < 0 || text.includes('-')) {
                e.preventDefault();
            }
        });
    });
});

function calcularAguinaldo() {
    // Obtener elementos
    const salaryInput = document.getElementById('salary');
    const monthsInput = document.getElementById('months');
    const resultCard = document.getElementById('resultCard');
    const amountDisplay = document.getElementById('amountDisplay');
    const breakdownDiv = document.getElementById('breakdown');

    // Elementos de error
    const salaryError = document.getElementById('salaryError');
    const monthsError = document.getElementById('monthsError');

    // Resetear estados
    salaryInput.classList.remove('input-error');
    monthsInput.classList.remove('input-error');
    salaryError.style.display = 'none';
    monthsError.style.display = 'none';
    resultCard.classList.remove('visible');
    breakdownDiv.innerHTML = ''; // Clear previous breakdown

    // Obtener valores (Limpiando formato de miles)
    const rawSalary = salaryInput.value.replace(/\./g, '');
    const salary = parseFloat(rawSalary);
    const months = parseFloat(monthsInput.value);
    let hasError = false;

    // Validaciones
    if (isNaN(salary) || salary <= 0) {
        salaryInput.classList.add('input-error');
        salaryError.textContent = "Por favor ingresa un sueldo válido.";
        salaryError.style.display = 'block';
        hasError = true;
    }

    if (isNaN(months) || months <= 0 || months > 6) {
        monthsInput.classList.add('input-error');
        monthsError.textContent = "Ingresa un valor entre 1 y 6 meses.";
        monthsError.style.display = 'block';
        hasError = true;
    }

    if (hasError) return;

    // LÓGICA SAC ARGENTINA
    const medioAguinaldo = salary / 2;
    const proporcional = (medioAguinaldo / 6) * months;

    // Formatear a moneda (Pesos Argentinos)
    const formatter = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    const resultText = formatter.format(proporcional);
    amountDisplay.innerText = resultText;

    // Guardar valor para compartir
    amountDisplay.dataset.value = resultText;

    // Generar Desglose
    const salaryFormatted = formatter.format(salary);
    const halfSalaryFormatted = formatter.format(medioAguinaldo);

    breakdownDiv.innerHTML = `
        <div class="breakdown-row">
            <span>Mejor Sueldo:</span>
            <span>${salaryFormatted}</span>
        </div>
        <div class="breakdown-row">
            <span>Medio Aguinaldo (50%):</span>
            <span>${halfSalaryFormatted}</span>
        </div>
        <div class="breakdown-row">
            <span>Meses trabajados:</span>
            <span>${months} / 6</span>
        </div>
        <div class="breakdown-row">
            <span>Total a Cobrar:</span>
            <span>${resultText}</span>
        </div>
    `;

    // Mostrar resultado
    resultCard.classList.add('visible');

    // Confetti Effect
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#818cf8', '#c084fc', '#ffffff']
    });

    // Scroll suave hacia el resultado en móviles
    if (window.innerWidth < 768) {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function shareResult() {
    const amount = document.getElementById('amountDisplay').dataset.value;
    const text = `¡Me tocan ${amount} de Aguinaldo! 🤑\nCalculá el tuyo acá:`;
    const url = window.location.href;

    if (navigator.share) {
        navigator.share({
            title: 'Calculadora Aguinaldo 🇦🇷',
            text: text,
            url: url
        }).catch(console.error);
    } else {
        // Fallback para WhatsApp Web
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    }
}
