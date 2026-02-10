(() => {
  const CONTAINER_SELECTOR = '.su-card-container__attributes__primary';
  const PRICE_SELECTOR = '.s-card__price';
  const TOTAL_CLASS = 'combined-total-price';

  const parseMoney = (text) => {
    if (!text) return null;
    const cleaned = text.replace(/,/g, '');
    const match = cleaned.match(/([\$\u00a3\u20ac])?\s*([0-9]+(?:\.[0-9]+)?)/);
    if (!match) return null;
    return {
      currency: match[1] || '$',
      value: Number(match[2])
    };
  };

  const findShipping = (container) => {
    const rows = Array.from(container.querySelectorAll('.s-card__attribute-row .su-styled-text'));
    for (const row of rows) {
      const text = row.textContent || '';
      if (!/delivery|shipping/i.test(text)) continue;
      const money = parseMoney(text);
      if (money) return money;
    }
    return null;
  };

  const formatMoney = (currency, value) => {
    return `${currency}${value.toFixed(2)}`;
  };

  const addCombinedTotal = (container) => {
    if (container.querySelector(`.${TOTAL_CLASS}`)) return;

    const priceEl = container.querySelector(PRICE_SELECTOR);
    if (!priceEl) return;

    const price = parseMoney(priceEl.textContent || '');
    if (!price) return;

    const shipping = findShipping(container);
    const shippingValue = shipping ? shipping.value : 0;
    const currency = shipping?.currency || price.currency;

    const total = price.value + shippingValue;

    const totalEl = document.createElement('span');
    totalEl.className = TOTAL_CLASS;
    totalEl.textContent = formatMoney(currency, total);
    totalEl.style.display = 'block';
    totalEl.style.color = '#1a9c2d';
    totalEl.style.fontWeight = '700';
    totalEl.style.fontSize = '2.5em';
    totalEl.style.lineHeight = '1.1';
    totalEl.style.marginBottom = '2px';

    priceEl.parentElement.insertBefore(totalEl, priceEl);
  };

  const processAll = () => {
    const containers = document.querySelectorAll(CONTAINER_SELECTOR);
    containers.forEach(addCombinedTotal);
  };

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      processAll();
    }, 100);
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processAll, { once: true });
  } else {
    processAll();
  }
})();
